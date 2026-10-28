import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readZip} from '../skills/blue-white-ppt/scripts/lib/zip.mjs';
import {all,parseXml} from '../skills/blue-white-ppt/scripts/lib/xml.mjs';
import {validatePptx} from '../skills/blue-white-ppt/scripts/validate-pptx.mjs';
import {assertBodyInFrames,assertBounds,assertCompleteFrame,assertContains,assertReferenceSlideStyle,objectName,slideObjects} from './helpers/showcase-style.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const expectedFamilies=['zoom','spotlight','parallax','carousel','geometry','word','character','equation','layers','data'];
const expectedChapters=['1','2.1','2.1','2.2','2.2','2.3','2.3','2.4','2.4','3.1','3.1','3.2','3.2','4'];
const expectedTransitions=[
 {slide:3,mode:'byObject'},{slide:5,mode:'byObject'},{slide:7,mode:'byObject'},
 {slide:9,mode:'byObject'},{slide:11,mode:'byWord'},{slide:13,mode:'byChar'},
];
const identities=tree=>all(tree,'cNvPr').map(node=>node.attrs.name).filter(name=>name.startsWith('!!')).sort();
const shapeMap=tree=>new Map(all(tree,'sp').map(node=>[all(node,'cNvPr')[0]?.attrs.name,node]));
const stateSignature=node=>JSON.stringify({transform:all(node,'xfrm'),geometry:all(node,'prstGeom'),text:all(node,'t').map(n=>n.text)});

async function workspace(t){
 const base=path.resolve(os.tmpdir()),directory=await fs.mkdtemp(path.join(base,'blue-white-morph-test-'));
 t.after(async()=>{
  assert.equal(path.dirname(path.resolve(directory)),base);
  assert.ok(path.basename(directory).startsWith('blue-white-morph-test-'));
  await fs.rm(directory,{recursive:true,force:true});
 });
 return directory;
}
async function snapshot(directory){
 const files=[];
 async function visit(current,relative=''){
  for(const item of (await fs.readdir(current,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
   const filename=path.join(current,item.name),name=relative?`${relative}/${item.name}`:item.name;
   if(item.isDirectory())await visit(filename,name);
   else if(item.isFile())files.push({path:name,sha256:hash(await fs.readFile(filename))});
   else files.push({path:name,type:item.isSymbolicLink()?'symlink':'other'});
  }
 }
 await visit(directory);return files;
}
function run(cwd,builder,...args){
 const result=spawnSync(process.execPath,[builder,...args],{cwd,encoding:'utf8',windowsHide:true,timeout:120000});
 assert.ifError(result.error);return result;
}
function successful(result){assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);return JSON.parse(result.stdout);}

test('the compact Morph example relocates without a showcase deck and preserves all ten native effect pairs',async t=>{
 const directory=await workspace(t),relocated=path.join(directory,'便携技能 副本'),cwd=path.join(directory,'另一个 工作目录');
 const output=path.join(cwd,'结果 文稿','平滑 效果.pptx'),manifestPath=path.join(cwd,'记录 清单','平滑 说明.json');
 await fs.mkdir(path.join(relocated,'assets','examples','trapezoid'),{recursive:true});
 await fs.mkdir(path.join(relocated,'assets','reference'),{recursive:true});
 await fs.mkdir(cwd,{recursive:true});
 await fs.cp(path.join(root,'scripts'),path.join(relocated,'scripts'),{recursive:true});
 await fs.cp(path.join(root,'skills'),path.join(relocated,'skills'),{recursive:true});
 await fs.cp(path.join(root,'assets','examples','morph'),path.join(relocated,'assets','examples','morph'),{recursive:true});
 await fs.copyFile(path.join(root,'assets','examples','trapezoid','morph.mjs'),path.join(relocated,'assets','examples','trapezoid','morph.mjs'));
 await assert.rejects(fs.access(path.join(relocated,'assets','showcases')),{code:'ENOENT'});
 const builder=path.join(relocated,'assets','examples','morph','build-compact.mjs'),before=await snapshot(relocated);
 const result=successful(run(cwd,builder,'--output',output,'--manifest',manifestPath));
 assert.equal(result.output,output);assert.equal(result.manifest,manifestPath);
 assert.equal(result.slideCount,14);assert.equal(result.effectFamilyCount,10);assert.equal(result.matchedObjects,114);
 assert.deepEqual(result.nativeTransitions,expectedTransitions);
 const bytes=await fs.readFile(output),parts=readZip(bytes),manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 const baseline=JSON.parse(await fs.readFile(path.join(relocated,'assets','examples','morph','baseline.json'),'utf8'));
 assert.equal(baseline.schema,'blue-white-morph-semantic-baseline/v1');assert.equal(baseline.provenance.originalSlideCount,22);
 assert.deepEqual(baseline.effects.map(effect=>effect.key),expectedFamilies);
 assert.equal(manifest.schema,'blue-white-morph-compact/v1');assert.equal(manifest.sha256,hash(bytes));
 assert.equal(manifest.slideCount,14);assert.equal(manifest.effectFamilyCount,10);assert.equal(manifest.slides.length,14);
 assert.deepEqual(manifest.slides.map(slide=>slide.chapterNumber),expectedChapters);
 assert.deepEqual(manifest.layout.chapterNumbers,expectedChapters);assert.deepEqual(manifest.layout.summaryBounds,[48,94,1184,78]);assert.equal(manifest.layout.bodyMinimumY,190);
 assert.deepEqual(manifest.effectModes,{object:8,word:1,character:1});assert.deepEqual(manifest.nativeTransitions,expectedTransitions);
 assert.equal(manifest.nativeTransitionCount,6);assert.equal(manifest.sourceObjectCount,114);assert.equal(manifest.matchedObjectCount,114);
 assert.deepEqual(manifest.effects.map(effect=>effect.key),expectedFamilies);assert.equal(manifest.pictures,0);
 assert.equal(manifest.validation.status,'pass');assert.equal(manifest.validation.visualPlaybackVerified,false);
 const trees=new Map(Array.from({length:14},(_,i)=>[i+1,parseXml(parts.get(`ppt/slides/slide${i+1}.xml`).toString())]));
 for(const [page,tree] of trees){
  assertReferenceSlideStyle(tree,{chapterNumber:expectedChapters[page-1],page,total:14});
  const frames=manifest.layout.regions.filter(region=>region.slide===page).map(region=>slideObjects(tree).find(node=>objectName(node)===region.name));
  assert.ok(frames.every(Boolean),`Declared frames are native objects on page ${page}`);assertBodyInFrames(tree,frames);
 }
 assert.equal(manifest.layout.regions.length,25);
 for(const region of manifest.layout.regions){
  const frame=slideObjects(trees.get(region.slide)).find(node=>objectName(node)===region.name);
  assert.ok(frame,`Native region frame ${region.name}`);assertCompleteFrame(frame);assertBounds(frame,region.bounds);
  assert.ok(region.bounds[1]>=190);
 }
 assert.equal([...parts.keys()].filter(name=>/^ppt\/slides\/slide\d+\.xml$/.test(name)).length,14);
 assert.equal([...parts.keys()].filter(name=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)).length,14);
 assert.equal([...trees.values()].reduce((sum,tree)=>sum+all(tree,'pic').length,0),0);
 assert.ok(![...parts.keys()].some(name=>name.startsWith('ppt/media/')));
 assert.deepEqual([...trees].flatMap(([slide,tree])=>all(tree,'morph').map(node=>({slide,mode:node.attrs.option}))),expectedTransitions);
 const pairs=manifest.slides.filter(slide=>slide.state==='A');
 assert.equal(pairs.length,6);assert.equal(pairs.filter(slide=>slide.effects.length===2).length,4);
 for(const pair of pairs){
  const a=trees.get(pair.startSlide),b=trees.get(pair.endSlide),namesA=identities(a),namesB=identities(b);
  assert.equal(new Set(namesA).size,namesA.length);assert.deepEqual(namesA,namesB);
  assert.equal(all(a,'morph').length,0);assert.equal(all(b,'morph').length,1);
  assert.ok(all(b,'fade').length===1,'A native fade fallback remains available');
 }
 for(const effect of manifest.effects){
  const original=baseline.effects.find(item=>item.key===effect.key),a=shapeMap(trees.get(effect.slides[0])),b=shapeMap(trees.get(effect.slides[1]));
  const expectedNames=original.states[0].map(shape=>shape.name);
  assert.deepEqual(effect.sourceSlides,original.originalSlides);assert.deepEqual(effect.names,expectedNames);
  assert.equal(effect.matchedObjects,expectedNames.length);
  const changed=[];
  for(const name of expectedNames){
   assert.ok(a.has(name)&&b.has(name),`Native paired shape ${name}`);
   for(const [state,shapes] of [a,b].entries()){
    const template=original.states[state].find(shape=>shape.name===name),shape=shapes.get(name);
    assert.equal(all(shape,'prstGeom')[0]?.attrs.prst,template.geometry,`Native geometry ${name}, state ${state}`);
    const region=manifest.layout.regions.find(region=>region.slide===effect.slides[state]&&region.name.endsWith(`region.${effect.key}.frame`));
    assert.ok(region,`Complete comparison frame for ${effect.key}`);
    const frame=slideObjects(trees.get(effect.slides[state])).find(node=>objectName(node)===region.name);assertContains(frame,shape);
    if(['word','character','equation'].includes(effect.key))assert.equal(all(shape,'t').map(node=>node.text).join('\n'),template.text?.value??'',`Retained text ${name}`);
   }
   if(stateSignature(a.get(name))!==stateSignature(b.get(name)))changed.push(name);
  }
  assert.ok(changed.length>0,`${effect.key} must demonstrate a state change`);
  assert.deepEqual(effect.changedNames,changed);assert.equal(effect.changedObjects,changed.length);
 }
 let externalLinks=0;
 for(const [name,data] of parts)if(name.endsWith('.rels'))for(const rel of all(parseXml(data.toString()),'Relationship')){
  assert.ok(!rel.attrs.Type.endsWith('/image'));
  if(rel.attrs.Type.endsWith('/hyperlink')){externalLinks++;assert.equal(rel.attrs.TargetMode,'External');assert.match(rel.attrs.Target,/^https:\/\/support\.microsoft\.com\//);}
 }
 assert.equal(externalLinks,2);assert.deepEqual((await validatePptx(output)).errors,[]);

 const manifestBytes=await fs.readFile(manifestPath);
 const refused=run(cwd,builder,'--output',output,'--manifest',manifestPath);
 assert.notEqual(refused.status,0);assert.match(refused.stderr,/Output already exists/);
 assert.equal(hash(await fs.readFile(output)),hash(bytes));assert.equal(hash(await fs.readFile(manifestPath)),hash(manifestBytes));
 const untouched=path.join(cwd,'must-not-be-created.pptx');
 const manifestRefused=run(cwd,builder,'--output',untouched,'--manifest',manifestPath);
 assert.notEqual(manifestRefused.status,0);assert.match(manifestRefused.stderr,/Output already exists/);
 await assert.rejects(fs.access(untouched),{code:'ENOENT'});
 successful(run(cwd,builder,'--output',output,'--manifest',manifestPath,'--overwrite'));
 assert.equal(hash(await fs.readFile(output)),hash(bytes));
 const defaultResult=successful(run(cwd,builder));
 // macOS resolves /var temporary directories through /private/var in child cwd.
 assert.equal(await fs.realpath(defaultResult.output),await fs.realpath(path.join(cwd,'morph-effects-compact.pptx')));assert.equal(defaultResult.manifest,null);
 assert.equal(hash(await fs.readFile(defaultResult.output)),hash(bytes));
 const recursive=run(cwd,builder,'--source',output,'--output',untouched);
 assert.notEqual(recursive.status,0);assert.match(recursive.stderr,/Expected the original 22-slide deck, found 14/);
 await assert.rejects(fs.access(untouched),{code:'ENOENT'});
 const insideSource=path.join(relocated,'assets','examples','morph','forbidden.pptx');
 assert.match(run(cwd,builder,'--output',insideSource).stderr,/outside the skill source directory/);
 assert.match(run(cwd,builder,'--output',untouched,'--manifest',path.join(relocated,'forbidden.json')).stderr,/outside the skill source directory/);
 await assert.rejects(fs.access(untouched),{code:'ENOENT'});
 assert.equal(run(cwd,builder,'--help').status,0);assert.notEqual(run(cwd,builder,'--output').status,0);assert.notEqual(run(cwd,builder,'--unknown-option').status,0);
 assert.deepEqual(await snapshot(relocated),before);
});
