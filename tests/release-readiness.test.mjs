import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readZip,writeZip} from '../scripts/lib/zip.mjs';
import {verifyReleaseBytes} from '../scripts/verify-release.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='blue-white-ppt/';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
let fixture;

test.after(async()=>{
  if(!fixture)return;
  const {directory}=await fixture,base=path.resolve(os.tmpdir());
  assert.equal(path.dirname(path.resolve(directory)),base);
  assert.ok(path.basename(directory).startsWith('blue-white-readiness-'));
  await fs.rm(directory,{recursive:true,force:true});
});

async function archiveFixture(){
  fixture??=(async()=>{
    const directory=await fs.mkdtemp(path.join(os.tmpdir(),'blue-white-readiness-'));
    const filename=path.join(directory,'fresh-release.zip');
    const packed=spawnSync(process.execPath,[path.join(root,'scripts/pack-skill.mjs'),'--output',filename],{cwd:directory,encoding:'utf8',windowsHide:true,timeout:120000});
    assert.ifError(packed.error);assert.equal(packed.status,0,packed.stderr||packed.stdout);
    return {directory,filename,bytes:await fs.readFile(filename)};
  })();
  return fixture;
}
const parse=(parts,member)=>JSON.parse(parts.get(prefix+member).toString('utf8'));
const setJson=(parts,member,value)=>parts.set(prefix+member,Buffer.from(JSON.stringify(value)));
function refreshManifest(parts){
  const manifest=parse(parts,'package-manifest.json');
  manifest.files=[...parts].filter(([member])=>member!==prefix+'package-manifest.json'&&member.startsWith(prefix)&&!member.endsWith('/'))
    .map(([member,bytes])=>({path:member.slice(prefix.length),bytes:bytes.length,sha256:sha256(bytes)}));
  setJson(parts,'package-manifest.json',manifest);
}
async function mutated(change,{refresh=false}={}){
  const {bytes}=await archiveFixture(),parts=readZip(bytes);change(parts);if(refresh)refreshManifest(parts);
  return verifyReleaseBytes(writeZip(parts));
}
function hasError(report,code){assert.equal(report.status,'fail');assert.ok(report.errors.some(error=>error.code===code),JSON.stringify(report.errors));}

test('fresh pack is closed, version-consistent and verifiable through the CLI',async()=>{
  const {bytes,filename,directory}=await archiveFixture();
  const report=verifyReleaseBytes(bytes);
  assert.equal(report.status,'pass',JSON.stringify(report.errors));
  assert.equal(report.counts.files,report.counts.manifestFiles+1);
  assert.equal(report.counts.showcases,3);assert.equal(report.counts.showcaseFiles,5);
  assert.ok(report.counts.entrypoints>=3);assert.ok(report.counts.staticModuleReferences>50);
  const saved=path.join(directory,'verification.json');
  const cli=spawnSync(process.execPath,[path.join(root,'scripts/verify-release.mjs'),filename,'--report',saved],{cwd:directory,encoding:'utf8',windowsHide:true,timeout:120000});
  assert.ifError(cli.error);assert.equal(cli.status,0,cli.stderr||cli.stdout);
  const stdout=JSON.parse(cli.stdout),onDisk=JSON.parse(await fs.readFile(saved,'utf8'));
  assert.deepEqual(onDisk,stdout);assert.equal(stdout.status,'pass');assert.equal(stdout.archiveSha256,sha256(bytes));
});

test('release verifier rejects broken ZIP data and a second top-level member',async()=>{
  hasError(verifyReleaseBytes(Buffer.from('not a ZIP')),'INVALID_ZIP');
  const report=await mutated(parts=>parts.set('outside.txt',Buffer.from('stray member')));
  hasError(report,'TOP_LEVEL');
});

test('CLI refuses to replace the input archive with its report, including aliases',async()=>{
  const {bytes,filename,directory}=await archiveFixture(),aliases=[filename,path.join(directory,'nested','..',path.basename(filename))];
  const hardlink=path.join(directory,'archive-alias.zip');await fs.link(filename,hardlink);aliases.push(hardlink);
  if(process.platform==='win32')aliases.push(filename.replace('fresh-release.zip','FRESH-RELEASE.ZIP'));
  for(const report of aliases){
    const cli=spawnSync(process.execPath,[path.join(root,'scripts/verify-release.mjs'),filename,'--report',report],{cwd:directory,encoding:'utf8',windowsHide:true,timeout:120000});
    assert.ifError(cli.error);assert.notEqual(cli.status,0);assert.match(cli.stderr,/Report path must differ from the input archive/);
    assert.equal(sha256(await fs.readFile(filename)),sha256(bytes));
  }
});

test('manifest requires the exact file set, correct bytes and correct SHA-256',async()=>{
  hasError(await mutated(parts=>parts.delete(prefix+'scripts/api.mjs')),'MANIFEST_FILE_SET');
  hasError(await mutated(parts=>parts.set(prefix+'assets/unlisted.png',Buffer.from('unlisted'))),'MANIFEST_FILE_SET');
  hasError(await mutated(parts=>{const manifest=parse(parts,'package-manifest.json');manifest.files[0].bytes++;setJson(parts,'package-manifest.json',manifest);}),'MANIFEST_BYTES');
  hasError(await mutated(parts=>{const manifest=parse(parts,'package-manifest.json');manifest.files[0].sha256='0'.repeat(64);setJson(parts,'package-manifest.json',manifest);}),'MANIFEST_SHA256');
  hasError(await mutated(parts=>{const manifest=parse(parts,'package-manifest.json');manifest.files.push(manifest.files[0]);setJson(parts,'package-manifest.json',manifest);}),'DUPLICATE_MANIFEST_PATH');
});

test('package, SKILL, manifest and capabilities must agree on the release version',async()=>{
  hasError(await mutated(parts=>{const manifest=parse(parts,'package-manifest.json');manifest.version='9.9.9';setJson(parts,'package-manifest.json',manifest);}),'VERSION_MISMATCH');
  hasError(await mutated(parts=>{const pkg=parse(parts,'package.json');pkg.version='9.9.9';setJson(parts,'package.json',pkg);},{refresh:true}),'VERSION_MISMATCH');
  hasError(await mutated(parts=>parts.set(prefix+'SKILL.md',Buffer.from(parts.get(prefix+'SKILL.md').toString().replace(/version:.*$/m,'version: "9.9.9"'))),{refresh:true}),'VERSION_MISMATCH');
  hasError(await mutated(parts=>{const capabilities=parse(parts,'references/capabilities.json');capabilities.release='9.9.9';setJson(parts,'references/capabilities.json',capabilities);},{refresh:true}),'VERSION_MISMATCH');
});

test('development and temporary assets are rejected even when correctly manifested',async()=>{
  for(const member of ['design/private.mjs','assets/examples/build/deck.pptx','assets/showcases/morph-draft.pptx','assets/old.zip','.git/config']){
    hasError(await mutated(parts=>parts.set(prefix+member,Buffer.from('not releasable')),{refresh:true}),'FORBIDDEN_MEMBER');
  }
});

test('showcase files and entrypoints are independently verified beyond manifest hashes',async()=>{
  hasError(await mutated(parts=>{const catalog=parse(parts,'references/showcase-catalog.json');catalog.showcases[0].files[0].sha256='f'.repeat(64);setJson(parts,'references/showcase-catalog.json',catalog);},{refresh:true}),'SHOWCASE_SHA256');
  hasError(await mutated(parts=>{const catalog=parse(parts,'references/showcase-catalog.json');catalog.showcases[0].files[0].bytes++;setJson(parts,'references/showcase-catalog.json',catalog);},{refresh:true}),'SHOWCASE_BYTES');
  hasError(await mutated(parts=>parts.delete(prefix+'assets/showcases/morph-effects.mp4'),{refresh:true}),'MISSING_DECLARED_FILE');
  hasError(await mutated(parts=>{const catalog=parse(parts,'references/showcase-catalog.json');catalog.showcases.find(showcase=>showcase.entrypoint).entrypoint.path='assets/examples/missing.mjs';setJson(parts,'references/showcase-catalog.json',catalog);},{refresh:true}),'MISSING_DECLARED_FILE');
});

test('runtime module and URL assets must remain inside the package and be present',async()=>{
  hasError(await mutated(parts=>parts.set(prefix+'scripts/api.mjs',Buffer.concat([parts.get(prefix+'scripts/api.mjs'),Buffer.from("\nimport './missing-runtime.mjs';\n")])),{refresh:true}),'MISSING_MODULE');
  hasError(await mutated(parts=>parts.set(prefix+'scripts/api.mjs',Buffer.concat([parts.get(prefix+'scripts/api.mjs'),Buffer.from("\nconst asset=new URL('../assets/missing.json',import.meta.url);\n")])),{refresh:true}),'MISSING_ASSET');
  hasError(await mutated(parts=>parts.set(prefix+'scripts/api.mjs',Buffer.concat([parts.get(prefix+'scripts/api.mjs'),Buffer.from("\nimport 'C:/Users/Someone/private-api.mjs';\n")])),{refresh:true}),'NONPORTABLE_MODULE');
  hasError(await mutated(parts=>parts.set(prefix+'assets/examples/trapezoid/build-deck.mjs',Buffer.concat([parts.get(prefix+'assets/examples/trapezoid/build-deck.mjs'),Buffer.from("\nconst skillRoot='C:/Users/Someone/local-skill';\n")])),{refresh:true}),'ABSOLUTE_RUNTIME_PATH');
});

test('ordinary documentation and source comments do not become local dependency checks',async()=>{
  const report=await mutated(parts=>{
    parts.set(prefix+'README.md',Buffer.concat([parts.get(prefix+'README.md'),Buffer.from('\nA user may install under C:/Users/Someone/skills or /home/example/skills.\n')]));
    parts.set(prefix+'scripts/api.mjs',Buffer.concat([parts.get(prefix+'scripts/api.mjs'),Buffer.from("\n// import './not-a-real-dependency.mjs';\n/* const privateRoot='C:/Users/Someone/private'; */\n")]));
  },{refresh:true});
  assert.equal(report.status,'pass',JSON.stringify(report.errors));
});
