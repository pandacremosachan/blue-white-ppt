import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {releaseFiles} from '../scripts/lib/release-files.mjs';
import {readZip} from '../scripts/lib/zip.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

async function temporaryDirectory(t){
  const base=path.resolve(os.tmpdir()),directory=await fs.mkdtemp(path.join(base,'blue-white-ppt-release-test-'));
  t.after(async()=>{
    assert.equal(path.dirname(path.resolve(directory)),base);
    assert.ok(path.basename(directory).startsWith('blue-white-ppt-release-test-'));
    await fs.rm(directory,{recursive:true,force:true});
  });
  return directory;
}

function runNode(directory,...args){
  const result=spawnSync(process.execPath,args,{cwd:directory,encoding:'utf8',windowsHide:true,timeout:120000});
  assert.ifError(result.error);
  return result;
}

function successful(result){
  assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

test('release selection preserves runtime assets and excludes checkout and generated files',async t=>{
  const directory=await temporaryDirectory(t);
  const included=['README.md','SKILL.md','package.json','agents/openai.yaml','assets/fonts/font.ttf',
    'assets/reference/reference.pptx','assets/reference/custom.svg','references/guide.md','scripts/main.mjs','scripts/lib/helper.mjs'];
  const excluded=['.git/config','blue-white-ppt-skill-v1.0.0.zip','package-manifest.json','output/deck.pptx',
    'scripts/generated.pptx','scripts/.cache/generated.mjs','scripts/node_modules/module.mjs','assets/reference/old.zip','assets/.hidden/ignored.png'];
  for(const filename of [...included,...excluded]){
    const destination=path.join(directory,...filename.split('/'));await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,filename);
  }
  assert.deepEqual((await releaseFiles(directory)).map(file=>file.path).sort(),included.slice().sort());
  await fs.mkdir(path.join(directory,'tests'));
  await fs.writeFile(path.join(directory,'tests','sample.test.mjs'),'// packaged self-verification');
  assert.deepEqual((await releaseFiles(directory)).map(file=>file.path).sort(),[...included,'tests/sample.test.mjs'].sort());
});

test('pack and install CLIs share clean contents, valid manifests and refuse existing targets',async t=>{
  const directory=await temporaryDirectory(t),archive=path.join(directory,'skill.zip'),target=path.join(directory,'installed');
  successful(runNode(directory,path.join(root,'scripts','pack-skill.mjs'),'--output',archive));
  const bytes=await fs.readFile(archive),parts=readZip(bytes),names=[...parts.keys()];
  const selected=(await releaseFiles(root)).map(file=>file.path);
  assert.deepEqual(names.slice().sort(),[...selected,'package-manifest.json'].map(name=>`blue-white-ppt/${name}`).sort());
  assert.ok(names.every(name=>!name.includes('/.git/')&&!name.endsWith('.zip')&&!name.includes('/output/')));
  for(const filename of ['SKILL.md','scripts/api.mjs','scripts/lib/release-files.mjs','assets/fonts/NotoSansSC-VF.ttf',
    'assets/reference/component-library-v0.14.pptx','assets/reference/slide-53.png','tests/release.test.mjs',
    'assets/examples/trapezoid/build-deck.mjs','assets/examples/trapezoid/compact-diagrams.mjs',
    'assets/examples/morph/build-compact.mjs','assets/examples/morph/source.mjs','assets/examples/morph/baseline.json',
    'tests/showcase-example.test.mjs','tests/showcase-morph.test.mjs','tests/showcase-content.test.mjs','tests/helpers/showcase-style.mjs']){
    assert.ok(parts.has(`blue-white-ppt/${filename}`),`Missing ${filename}`);
  }
  const manifest=JSON.parse(parts.get('blue-white-ppt/package-manifest.json'));
  assert.equal(manifest.version,JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version);
  assert.equal(manifest.files.length,selected.length);
  assert.deepEqual(manifest.files.map(file=>file.path).sort(),selected.slice().sort());
  for(const file of manifest.files){
    const content=parts.get(`blue-white-ppt/${file.path}`);assert.equal(file.bytes,content.length);assert.equal(file.sha256,digest(content));
  }
  const existingArchive=runNode(directory,path.join(root,'scripts','pack-skill.mjs'),'--output',archive);
  assert.notEqual(existingArchive.status,0);assert.equal(digest(await fs.readFile(archive)),digest(bytes));

  successful(runNode(directory,path.join(root,'scripts','install.mjs'),'--target',target));
  const installed=(await releaseFiles(target)).map(file=>file.path);assert.deepEqual(installed,selected);
  for(const filename of selected){
    assert.equal(digest(await fs.readFile(path.join(target,...filename.split('/')))),digest(parts.get(`blue-white-ppt/${filename}`)));
  }
  const top=await fs.readdir(target);assert.ok(!top.includes('.git')&&!top.includes('package-manifest.json')&&!top.some(name=>name.endsWith('.zip')));
  const doctor=successful(runNode(directory,path.join(target,'scripts','doctor.mjs')));assert.equal(doctor.coreReady,true);assert.equal(doctor.reference.intact,true);
  const existingTarget=runNode(directory,path.join(root,'scripts','install.mjs'),'--target',target);
  assert.notEqual(existingTarget.status,0);assert.match(existingTarget.stderr,/Target already exists/);
  assert.equal(digest(await fs.readFile(path.join(target,'README.md'))),digest(parts.get('blue-white-ppt/README.md')));
});
