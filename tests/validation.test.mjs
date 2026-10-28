import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Presentation,exportPptx} from '../skills/blue-white-ppt/scripts/lib/native-pptx.mjs';
import {createPresentation,addSlide,addText,savePresentation} from '../skills/blue-white-ppt/scripts/api.mjs';
import {readZip,writeZip} from '../skills/blue-white-ppt/scripts/lib/zip.mjs';
import {validatePptx} from '../skills/blue-white-ppt/scripts/validate-pptx.mjs';

async function workspace(t){
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'blue-white-validation-'));
  t.after(async()=>{
    assert.equal(path.dirname(path.resolve(directory)),path.resolve(os.tmpdir()));
    await fs.rm(directory,{recursive:true,force:true});
  });
  return directory;
}
function rectangle(left,top,rotation){
  const p=Presentation.create(),s=p.slides.add();
  s.shapes.add({name:'rotated',geometry:'rect',position:{left,top,width:100,height:100,rotation},fill:'#0759BE'});
  return p;
}

test('export rejects forbidden text before writing a PPTX',async t=>{
  const directory=await workspace(t),filename=path.join(directory,'invalid.pptx');
  const p=createPresentation(),s=addSlide(p,{title:'Invalid text'});
  addText(s,'before\u0001after',[100,200,400,100]);
  await assert.rejects(savePresentation(p,filename),/Invalid XML 1.0 character U\+0001/);
  await assert.rejects(fs.access(filename),{code:'ENOENT'});
});

test('validator rejects invalid XML rather than reporting pass',async t=>{
  const directory=await workspace(t),p=createPresentation(),s=addSlide(p,{title:'XML fixture'});
  addText(s,'SENTINEL',[100,200,400,100]);
  const original=readZip(await exportPptx(p));
  const mutations=[
    xml=>xml.replace('SENTINEL','before\u0001after'),
    xml=>xml.replace('SENTINEL','&#1;'),
    xml=>xml.replace('SENTINEL','bad & text'),
    xml=>xml.replace('name="text.', 'broken=unquoted name="text.'),
  ];
  for(const [index,mutate] of mutations.entries()){
    const parts=new Map(original),filename=path.join(directory,`bad-${index}.pptx`);
    parts.set('ppt/slides/slide1.xml',Buffer.from(mutate(parts.get('ppt/slides/slide1.xml').toString())));
    await fs.writeFile(filename,writeZip(parts));
    const report=await validatePptx(filename);
    assert.equal(report.status,'fail');
    assert.ok(report.errors.some(error=>error.startsWith('ppt/slides/slide1.xml:')),report.errors.join('\n'));
  }
});

test('validator reports missing, malformed and non-UTF8 package parts without crashing',async t=>{
  const directory=await workspace(t),original=readZip(await exportPptx(rectangle(100,100,0)));
  const missing=new Map(original);missing.delete('[Content_Types].xml');missing.delete('ppt/presentation.xml');
  const malformed=new Map(original);malformed.set('ppt/presentation.xml',Buffer.from('<broken'));
  const encoding=new Map(original);encoding.set('ppt/slides/slide1.xml',Buffer.from([0xff]));
  for(const [index,parts] of [missing,malformed,encoding].entries()){
    const filename=path.join(directory,`package-${index}.pptx`);await fs.writeFile(filename,writeZip(parts));
    const report=await validatePptx(filename);assert.equal(report.status,'fail');assert.ok(report.errors.length>0);
  }
  const filename=path.join(directory,'not-a-zip.pptx');await fs.writeFile(filename,'bad');
  assert.equal((await validatePptx(filename)).status,'fail');
});

test('bounds checks account for arbitrary rotations around object center',async t=>{
  const directory=await workspace(t);
  for(const angle of [30,45,-45,135,225,315]){
    const filename=path.join(directory,`outside-${angle}.pptx`);await fs.writeFile(filename,await exportPptx(rectangle(0,0,angle)));
    const report=await validatePptx(filename);
    assert.equal(report.status,'fail',`angle ${angle}`);assert.ok(report.errors.some(error=>error.includes('Outside slide bounds')));
  }
  for(const angle of [0,30,45,90,180,270,360]){
    const filename=path.join(directory,`inside-${angle}.pptx`);await fs.writeFile(filename,await exportPptx(rectangle(100,100,angle)));
    const report=await validatePptx(filename);assert.deepEqual(report.errors,[],`angle ${angle}`);
  }
});
