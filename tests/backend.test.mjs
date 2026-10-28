import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPresentation,addText,addTable,addImage} from '../skills/blue-white-ppt/scripts/api.mjs';
import {clonePresentation,exportPptx} from '../skills/blue-white-ppt/scripts/lib/native-pptx.mjs';
import {readZip} from '../skills/blue-white-ppt/scripts/lib/zip.mjs';
import {parseXml,all} from '../skills/blue-white-ppt/scripts/lib/xml.mjs';
import {validatePptx} from '../skills/blue-white-ppt/scripts/validate-pptx.mjs';

const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'blue-white-ppt-backend-'));
after(async()=>{
  const resolved=path.resolve(temporary);
  assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
  assert.match(path.basename(resolved),/^blue-white-ppt-backend-/);
  await fs.rm(resolved,{recursive:true,force:true});
});

async function document(presentation){
  const bytes=await exportPptx(presentation);
  return {bytes,root:parseXml(readZip(bytes).get('ppt/slides/slide1.xml').toString())};
}
const layerNames=root=>all(root,'spTree')[0].children
  .filter(node=>['sp','pic','graphicFrame','grpSp','cxnSp'].includes(node.local))
  .map(node=>all(node,'cNvPr')[0].attrs.name);
const box=(slide,name,left=100)=>slide.shapes.add({name,geometry:'rect',position:{left,top:200,width:120,height:80},fill:'#FFFFFF'});

test('tables, text and pictures retain insertion order and support cross-type layer changes',async()=>{
  const presentation=createPresentation(),slide=presentation.slides.add();
  const table=addTable(slide,{values:[['Table']],bounds:[100,200,200,100]});
  const text=addText(slide,'Text overlay',[100,200,200,100]);
  const image=await addImage(slide,fileURLToPath(new URL('../skills/blue-white-ppt/assets/reference/slide-01.png',import.meta.url)),[100,200,200,100],{name:'picture-overlay'});
  assert.deepEqual(layerNames((await document(presentation)).root),[table.name,text.name,image.name]);

  table.bringToFront();
  assert.deepEqual(layerNames((await document(presentation)).root),[text.name,image.name,table.name]);
  image.sendToBack();
  assert.deepEqual(layerNames((await document(presentation)).root),[image.name,text.name,table.name]);
  text.bringToFront();
  assert.deepEqual(layerNames((await document(presentation)).root),[image.name,table.name,text.name]);
  table.sendToBack();
  assert.deepEqual(layerNames((await document(presentation)).root),[table.name,image.name,text.name]);

  const filename=path.join(temporary,'layers.pptx');
  await fs.writeFile(filename,(await document(presentation)).bytes);
  const report=await validatePptx(filename);
  assert.deepEqual(report.errors,[]);
  assert.equal(report.counts.tables,1);
  assert.equal(report.counts.pictures,1);
});

test('explicit group membership serializes each object once and leaves authoring IDs unchanged',async()=>{
  const presentation=createPresentation(),slide=presentation.slides.add();
  const a=box(slide,'component.a'),b=box(slide,'component.b',240);
  const c=box(slide,'component.child.a',400),d=box(slide,'component.child.b',540);
  slide.groups.push({name:'first',objects:[a,b]},{name:'second',objects:[c,d]});
  const nextId=slide.nextId,originalOrder=[...slide.objects];
  const first=await document(presentation),second=await document(presentation);
  assert.deepEqual(second.bytes,first.bytes);
  assert.equal(slide.nextId,nextId);
  assert.deepEqual(slide.objects,originalOrder);

  const groups=all(first.root,'grpSp');
  assert.equal(groups.length,2);
  assert.deepEqual(all(groups[0],'sp').map(shape=>all(shape,'cNvPr')[0].attrs.name),[a.name,b.name]);
  assert.deepEqual(all(groups[1],'sp').map(shape=>all(shape,'cNvPr')[0].attrs.name),[c.name,d.name]);
  const ids=all(first.root,'cNvPr').map(node=>node.attrs.id);
  assert.equal(new Set(ids).size,ids.length);

  a.bringToFront();
  assert.deepEqual(layerNames((await document(presentation)).root),['second','first']);
  b.sendToBack();
  assert.deepEqual(layerNames((await document(presentation)).root),['first','second']);
});

test('overlapping explicit groups reject export instead of duplicating native IDs',async()=>{
  const presentation=createPresentation(),slide=presentation.slides.add();
  const a=box(slide,'a'),b=box(slide,'b',240),c=box(slide,'c',400);
  slide.groups.push({name:'first',objects:[a,b]},{name:'second',objects:[b,c]});
  await assert.rejects(exportPptx(presentation),/cannot belong to more than one component group/);
});

test('clones isolate rich text and table cells while preserving internal endpoints and layers',async()=>{
  const presentation=createPresentation(),slide=presentation.slides.add();
  const a=box(slide,'a'),b=box(slide,'b',400);
  a.text=[[{run:'Source',style:{color:'#0759BE'}}]];
  a.text.style={fontSize:22,insets:{left:5}};
  const edge=slide.shapes.connect(a,b,{name:'edge',line:{fill:'#0759BE',width:2}});
  const table=addTable(slide,{values:[['Cell']],bounds:[100,400,300,100]});
  table.getCell(0,0).text.value=[[{run:'Cell',style:{bold:true}}]];
  table.getCell(0,0).text.style.insets={left:3};
  slide.groups.push({name:'nodes',objects:[a,b,edge]});
  const copy=clonePresentation(presentation),cloned=copy.slides.items[0];
  const [copyA,copyB,copyEdge]=cloned.shapes.items,copyTable=cloned.tables.items[0];

  assert.notEqual(copyA,a);
  assert.equal(copyA.slide,cloned);
  assert.equal(copyEdge.from,copyA);
  assert.equal(copyEdge.to,copyB);
  assert.deepEqual(cloned.groups[0].objects,[copyA,copyB,copyEdge]);
  assert.deepEqual(cloned.objects.map(object=>object.name),slide.objects.map(object=>object.name));
  assert.deepEqual((await document(copy)).bytes,(await document(presentation)).bytes);

  copyA.text.value[0][0].run='Changed';
  copyA.text.value[0][0].style.color='#FF0000';
  copyA.text.style.insets.left=99;
  copyTable.getCell(0,0).text.value[0][0].run='Changed cell';
  copyTable.getCell(0,0).text.style.insets.left=99;
  copyTable.getCell(0,0).margins.left=99;
  copyTable.cells.set(0,0,'Through copied callback');
  copyB.position.left=700;
  assert.equal(a.text.value[0][0].run,'Source');
  assert.equal(a.text.value[0][0].style.color,'#0759BE');
  assert.equal(a.text.style.insets.left,5);
  assert.equal(table.getCell(0,0).text.value[0][0].run,'Cell');
  assert.equal(table.getCell(0,0).text.style.insets.left,3);
  assert.equal(table.getCell(0,0).margins.left,8);
  assert.equal(b.position.left,400);
  assert.equal(edge.to,b);
});
