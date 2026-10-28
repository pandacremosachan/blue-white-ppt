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
import {cases as originalCases} from '../assets/examples/trapezoid/deck-content.mjs';
import {assertBodyInFrames,assertBounds,assertCompleteFrame,assertContains,assertReferenceSlideStyle,boundsOf,objectName,objectText,slideObjects} from './helpers/showcase-style.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const expectedCases=[
 'pyramid','funnel','expansion','hourglass','horizontal','bowtie','converge','radial',
 'cycle','accordion','ribbon','steps','road','lanes','gallery','layers',
 'spotlight','platform','bridge','arch','bag','book','balance','modularBuilding',
 'pinwheel','tessellation','scope','shutters','splitLayout','foldedCorner','tabs','framePop',
];
const expectedChapters=['1','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','3','3','4.1','4.2'];

async function temporaryDirectory(t){
 const base=path.resolve(os.tmpdir()),directory=await fs.mkdtemp(path.join(base,'blue-white-ppt-showcase-test-'));
 t.after(async()=>{
  assert.equal(path.dirname(path.resolve(directory)),base);
  assert.ok(path.basename(directory).startsWith('blue-white-ppt-showcase-test-'));
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

function successful(result){
 assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);return JSON.parse(result.stdout);
}

test('the complete trapezoid example relocates, stays native, and never writes into its source tree',async t=>{
 const directory=await temporaryDirectory(t);
 const relocated=path.join(directory,'便携技能 副本'),cwd=path.join(directory,'另一个 工作目录');
 const output=path.join(cwd,'报告 成品','梯形 创意.pptx'),manifestPath=path.join(cwd,'记录 清单','图解 说明.json');
 await fs.mkdir(path.join(relocated,'assets','reference'),{recursive:true});
 await fs.mkdir(cwd,{recursive:true});
 // Copy only the published runtime dependency closure. In particular, there
 // is no design/ checkout or machine-specific runtime to fall back to.
 await fs.cp(path.join(root,'scripts'),path.join(relocated,'scripts'),{recursive:true});
 await fs.cp(path.join(root,'skills'),path.join(relocated,'skills'),{recursive:true});
 await fs.cp(path.join(root,'assets','examples','trapezoid'),path.join(relocated,'assets','examples','trapezoid'),{recursive:true});
 const builder=path.join(relocated,'assets','examples','trapezoid','build-deck.mjs');
 const before=await snapshot(relocated);
 const result=successful(run(cwd,builder,'--output',output,'--manifest',manifestPath));
 assert.equal(result.output,output);assert.equal(result.manifest,manifestPath);
 assert.equal(result.slides,13);assert.equal(result.cases,32);assert.equal(result.sources,16);
 const bytes=await fs.readFile(output),parts=readZip(bytes),manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 assert.equal(manifest.slideCount,13);assert.equal(manifest.creativeCases,32);assert.equal(manifest.sources,16);
 assert.equal(manifest.categories.length,8);assert.equal(manifest.slides.length,13);assert.equal(manifest.sourceRegister.length,16);
 assert.deepEqual(manifest.slides.map(slide=>slide.chapterNumber),expectedChapters);
 assert.equal(manifest.nativeMorphTransitions,1);assert.equal(manifest.experimentalMorph,true);
 const comparisons=manifest.slides.filter(slide=>slide.kind==='comparison');
 assert.equal(comparisons.length,8);
 assert.deepEqual(comparisons.flatMap(slide=>slide.keys),expectedCases);
 assert.deepEqual(originalCases.map(item=>item.key),expectedCases);
 assert.equal(new Set(comparisons.flatMap(slide=>slide.keys)).size,32);
 assert.deepEqual(manifest.casePages.map(item=>item.key),expectedCases);
 assert.equal(manifest.slideMapping.length,40);
 assert.deepEqual(manifest.slideMapping.map(item=>item.originalSlide),Array.from({length:40},(_,i)=>i+1));
 for(const [index,comparison] of comparisons.entries()){
  assert.equal(comparison.slide,index+2);assert.equal(comparison.keys.length,4);
  assert.deepEqual(comparison.cases.map(item=>item.key),comparison.keys);
  assert.deepEqual(manifest.categories[index].keys,comparison.keys);
  for(const [position,item] of comparison.cases.entries()){
   const mapping=manifest.casePages.find(entry=>entry.key===item.key);
   assert.deepEqual(mapping,{key:item.key,slide:comparison.slide,chapterNumber:comparison.chapterNumber,position:position+1,originalSlide:item.originalSlide});
   assert.equal(manifest.slideMapping.find(entry=>entry.originalSlide===item.originalSlide).slide,comparison.slide);
  }
 }
 assert.deepEqual(manifest.slides.filter(slide=>slide.kind==='morph').map(slide=>slide.slide),[10,11]);
 assert.ok(manifest.sourceRegister.every(source=>/^https:\/\//.test(source.url)));
 assert.deepEqual(manifest.validation.errors,[]);
 assert.equal(manifest.validation.counts.attachedConnectors,5);
 assert.equal(manifest.validation.counts.independentConnectors,0);
 const slideEntries=[...parts.entries()].filter(([name])=>/^ppt\/slides\/slide\d+\.xml$/.test(name));
 assert.equal(slideEntries.length,13);assert.equal([...parts.keys()].filter(name=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)).length,13);
 const trees=slideEntries.map(([,data])=>parseXml(data.toString()));
 for(let index=0;index<13;index++){
  const tree=parseXml(parts.get(`ppt/slides/slide${index+1}.xml`).toString());
  assertReferenceSlideStyle(tree,{chapterNumber:expectedChapters[index],page:index+1,total:13});
  const framePattern=index===0?/^guide\.panels\.(geometry|selection)\./:index<9?/^comparison\.case-frame\./:index<11?/^morph\.panel\./:/^sources\.panel\./;
  const frames=slideObjects(tree).filter(node=>framePattern.test(objectName(node)));
  assert.equal(frames.length,index>=1&&index<=8?4:2,`Complete body regions on page ${index+1}`);assertBodyInFrames(tree,frames);
 }
 for(const comparison of comparisons){
  const tree=parseXml(parts.get(`ppt/slides/slide${comparison.slide}.xml`).toString());
  const notes=parseXml(parts.get(`ppt/notesSlides/notesSlide${comparison.slide}.xml`).toString());
  const visible=all(tree,'t').map(node=>node.text).join('\n'),detail=all(notes,'t').map(node=>node.text).join('\n');
  for(const [index,item] of comparison.cases.entries()){
   const original=originalCases.find(entry=>entry.key===item.key);
   assert.ok(visible.includes(original.title),`Visible title: ${item.key}`);
   assert.ok(all(tree,'cNvPr').some(node=>node.attrs.name.startsWith(`case.${item.key}.`)),`Editable case shapes: ${item.key}`);
   for(const field of ['lead','mechanism','use','variant'])assert.ok(detail.includes(original[field]),`Retained ${field}: ${item.key}`);
   if(original.source)assert.ok(detail.includes(manifest.sourceRegister.find(source=>source.id===original.source).url),`Notes source: ${item.key}`);
   const frame=slideObjects(tree).find(node=>objectName(node)===`comparison.case-frame.${index+1}`);
   assert.ok(frame,`Complete comparison frame: ${item.key}`);assertCompleteFrame(frame);
   assertBounds(frame,[index%2?654:48,index<2?190:446,578,240]);
   for(const shape of slideObjects(tree).filter(node=>objectName(node).startsWith(`case.${item.key}.`)))assertContains(frame,shape);
   const title=slideObjects(tree).find(node=>objectText(node)===original.title);assert.ok(title);assertContains(frame,title);
   assert.ok(slideObjects(tree).some(node=>{const [x,y,w,h]=boundsOf(node),[fx,fy,fw,fh]=boundsOf(frame);return objectText(node).trim()&&x>=fx&&x+w<=fx+fw&&y>=fy+209&&y+h<=fy+fh;}),`Caption inside the frame: ${item.key}`);
  }
 }
 assert.equal(trees.reduce((count,tree)=>count+all(tree,'cxnSp').length,0),5);
 const expansion=parseXml(parts.get('ppt/slides/slide2.xml').toString());
 const nodeIds=new Set(all(expansion,'sp').filter(shape=>all(shape,'cNvPr')[0]?.attrs.name.startsWith('case.expansion.replica.')).map(shape=>all(shape,'cNvPr')[0].attrs.id));
 assert.equal(nodeIds.size,6);
 for(const connector of all(expansion,'cxnSp')){
  const from=all(connector,'stCxn'),to=all(connector,'endCxn');
  assert.equal(from.length,1);assert.equal(to.length,1);
  assert.ok(nodeIds.has(from[0].attrs.id));assert.ok(nodeIds.has(to[0].attrs.id));
  assert.equal(from[0].attrs.idx,'2');assert.equal(to[0].attrs.idx,'0');
  assert.equal(all(connector,'headEnd').length,0);assert.equal(all(connector,'tailEnd').length,0);
 }
 assert.equal(trees.reduce((count,tree)=>count+all(tree,'morph').length,0),1);
 assert.equal(trees.reduce((count,tree)=>count+all(tree,'pic').length,0),0);
 assert.ok(![...parts.keys()].some(name=>name.startsWith('ppt/media/')));
 assert.ok(trees.reduce((count,tree)=>count+all(tree,'custGeom').length,0)>100);
 let hyperlinkCount=0;
 for(const [name,data]of parts)if(name.endsWith('.rels')){
  for(const rel of all(parseXml(data.toString()),'Relationship')){
   assert.ok(!rel.attrs.Type.endsWith('/image'),'No image relationship, including external image references');
   if(rel.attrs.Type.endsWith('/hyperlink')){hyperlinkCount++;assert.equal(rel.attrs.TargetMode,'External');assert.match(rel.attrs.Target,/^https:\/\//);}
  }
 }
 assert.equal(hyperlinkCount,43);
 const slideA=parseXml(parts.get('ppt/slides/slide10.xml').toString()),slideB=parseXml(parts.get('ppt/slides/slide11.xml').toString());
 const identities=tree=>all(tree,'cNvPr').map(node=>node.attrs.name).filter(name=>name.startsWith('!!')).sort();
 assert.equal(identities(slideA).length,6);assert.deepEqual(identities(slideA),identities(slideB));
 assert.equal(all(slideB,'morph')[0].attrs.option,'byObject');
 assert.ok(all(slideA,'t').some(node=>node.text==='战略目标'));
 assert.ok(all(parseXml(parts.get('ppt/notesSlides/notesSlide9.xml').toString()),'t').some(node=>node.text.includes('当前章节通过深蓝填充获得明确位置')));
 assert.deepEqual((await validatePptx(output)).errors,[]);

 const manifestBytes=await fs.readFile(manifestPath);
 const refused=run(cwd,builder,'--output',output,'--manifest',manifestPath);
 assert.notEqual(refused.status,0);assert.match(refused.stderr,/Output already exists/);
 assert.equal(hash(await fs.readFile(output)),hash(bytes));assert.equal(hash(await fs.readFile(manifestPath)),hash(manifestBytes));
 const untouchedOutput=path.join(cwd,'must-not-be-created.pptx');
 const manifestRefused=run(cwd,builder,'--output',untouchedOutput,'--manifest',manifestPath);
 assert.notEqual(manifestRefused.status,0);assert.match(manifestRefused.stderr,/Output already exists/);
 await assert.rejects(fs.access(untouchedOutput),{code:'ENOENT'});
 successful(run(cwd,builder,'--output',output,'--manifest',manifestPath,'--overwrite'));
 assert.equal(hash(await fs.readFile(output)),hash(bytes));

 // Omitting both paths creates only the default file in the external cwd.
 const defaultResult=successful(run(cwd,builder));
 // macOS resolves /var temporary directories through /private/var in child cwd.
 assert.equal(await fs.realpath(defaultResult.output),await fs.realpath(path.join(cwd,'trapezoid-creativity.pptx')));assert.equal(defaultResult.manifest,null);
 assert.equal(hash(await fs.readFile(defaultResult.output)),hash(bytes));
 const help=run(cwd,builder,'--help');assert.equal(help.status,0);assert.match(help.stdout,/--manifest FILE/);
 assert.notEqual(run(cwd,builder,'--output').status,0);
 assert.notEqual(run(cwd,builder,'--unknown-option').status,0);
 const insideSource=path.join(relocated,'assets','examples','trapezoid','build','forbidden.pptx');
 const unsafe=run(cwd,builder,'--output',insideSource);
 assert.notEqual(unsafe.status,0);assert.match(unsafe.stderr,/outside the skill source directory/);
 const unsafeManifest=run(cwd,builder,'--output',path.join(cwd,'not-written.pptx'),'--manifest',path.join(relocated,'output','forbidden.json'));
 assert.notEqual(unsafeManifest.status,0);assert.match(unsafeManifest.stderr,/outside the skill source directory/);
 await assert.rejects(fs.access(path.join(cwd,'not-written.pptx')),{code:'ENOENT'});
 assert.deepEqual(await snapshot(relocated),before);
});
