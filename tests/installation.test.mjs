import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {directoryFiles} from '../scripts/lib/files.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const skill=path.join(root,'skills','blue-white-ppt');

async function workspace(t){
  const base=path.resolve(os.tmpdir()),directory=await fs.mkdtemp(path.join(base,'blue-white-ppt-install-test-'));
  t.after(async()=>{
    assert.equal(path.dirname(directory),base);
    assert.ok(path.basename(directory).startsWith('blue-white-ppt-install-test-'));
    await fs.rm(directory,{recursive:true,force:true});
  });
  return directory;
}

function run(cwd,...args){
  const result=spawnSync(process.execPath,args,{cwd,encoding:'utf8',windowsHide:true,timeout:120000});
  assert.ifError(result.error);
  return result;
}

function successful(result){
  assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

test('the skill is a self-contained directory with resolvable local documentation',async()=>{
  assert.deepEqual((await fs.readdir(skill)).sort(),['SKILL.md','agents','assets','references','scripts'].sort());
  const files=await directoryFiles(skill),names=files.map(file=>file.path);
  assert.ok(!names.some(name=>/^(?:tests\/|README\.md$|package\.json$)/.test(name)));
  assert.ok(!names.some(name=>/\.(?:zip|sha256|mp4)$/.test(name)));
  assert.ok(!names.some(name=>/scripts\/(?:install|pack-skill|verify-release|self-test|run-tests|update-guide)\.mjs$/.test(name)));
  const referenceImages=names.filter(name=>name.startsWith('assets/reference/')&&name.endsWith('.png'));
  assert.deepEqual(referenceImages,['assets/reference/slide-01.png']);
  for(const file of files.filter(file=>file.path.endsWith('.md'))){
    const text=await fs.readFile(file.filename,'utf8');
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      const link=match[1];
      if(/^(?:https?:|#)/.test(link))continue;
      const destination=path.resolve(path.dirname(file.filename),link.split('#')[0]);
      assert.ok(destination.startsWith(skill+path.sep),`Reference leaves the skill: ${file.path} -> ${link}`);
      await assert.doesNotReject(fs.access(destination),`Missing reference: ${file.path} -> ${link}`);
    }
  }
});

test('installation copies only the skill and generates all 244 variants after relocation',async t=>{
  const directory=await workspace(t),target=path.join(directory,'已安装 技能','blue-white-ppt');
  const selected=await directoryFiles(skill);
  const report=successful(run(directory,path.join(root,'scripts/install.mjs'),'--target',target));
  assert.equal(report.files,selected.length);
  const installed=await directoryFiles(target);
  assert.deepEqual(installed.map(file=>file.path),selected.map(file=>file.path));
  for(const file of selected){
    assert.ok((await fs.readFile(path.join(target,...file.path.split('/')))).equals(await fs.readFile(file.filename)),file.path);
  }
  const doctor=successful(run(directory,path.join(target,'scripts/doctor.mjs')));
  assert.equal(doctor.coreReady,true);assert.equal(doctor.version,'1.1.0-rc.3');
  assert.equal(doctor.components,39);assert.equal(doctor.variants,244);assert.equal(doctor.reference.available,true);
  const before=await fs.readFile(path.join(target,'SKILL.md'));
  const refused=run(directory,path.join(root,'scripts/install.mjs'),'--target',target);
  assert.notEqual(refused.status,0);assert.match(refused.stderr,/Target already exists/);
  assert.ok((await fs.readFile(path.join(target,'SKILL.md'))).equals(before));

  const project=path.join(directory,'演示 项目');
  successful(run(directory,path.join(target,'scripts/init-deck.mjs'),'--output',project));
  const deck=path.join(project,'from-json.pptx');
  successful(run(directory,path.join(target,'scripts/create-deck.mjs'),'--input',path.join(project,'plan.json'),'--output',deck));
  const validation=successful(run(directory,path.join(target,'scripts/validate-pptx.mjs'),deck));
  assert.equal(validation.status,'pass');
  successful(run(directory,path.join(project,'draw.mjs'),'--output',path.join(project,'direct.pptx')));
  const variants=successful(run(directory,path.join(root,'scripts/self-test.mjs'),'--skill',target,'--output',path.join(directory,'all-variants')));
  assert.equal(variants.components,39);assert.equal(variants.variants,244);assert.equal(variants.slides,245);assert.equal(variants.status,'pass');
  for(const file of installed){
    assert.ok((await fs.readFile(file.filename)).equals(await fs.readFile(path.join(skill,...file.path.split('/')))),`Generation changed ${file.path}`);
  }
});
