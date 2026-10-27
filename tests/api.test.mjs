import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {addFooter,addSlide,buildFromPlan,createPresentation,renderByCode,savePresentation} from '../scripts/api.mjs';
import {readZip} from '../scripts/lib/zip.mjs';
import {all,parseXml} from '../scripts/lib/xml.mjs';
import {validatePptx} from '../scripts/validate-pptx.mjs';

async function temporaryDirectory(t){
  const parent=path.resolve(os.tmpdir()),directory=await fs.mkdtemp(path.join(parent,'blue-white-ppt-api-test-'));
  t.after(async()=>{
    assert.equal(path.dirname(directory),parent);
    assert.ok(path.basename(directory).startsWith('blue-white-ppt-api-test-'));
    await fs.rm(directory,{recursive:true,force:true});
  });
  return directory;
}

async function readSlide(filename,number=1){
  const parts=readZip(await fs.readFile(filename));
  return parseXml(parts.get(`ppt/slides/slide${number}.xml`).toString());
}

function footerText(root){
  const footer=all(root,'sp').find(shape=>all(shape,'cNvPr')[0]?.attrs.name.startsWith('footer.page.'));
  return footer?all(footer,'t').map(node=>node.text).join(''):undefined;
}

function snapshot(slide){
  return {
    shapes:[...slide.shapes.items],objects:[...slide.objects],groups:[...slide.groups],nextId:slide.nextId,
    shapeState:slide.shapes.items.map(shape=>({
      id:shape.id,name:shape.name,position:{...shape.position},imageRel:shape.imageRel,
      text:structuredClone(shape.text.value),style:structuredClone(shape.text.style),
    })),
  };
}

function assertUnchanged(slide,before){
  assert.deepEqual(slide.shapes.items,before.shapes);
  assert.deepEqual(slide.objects,before.objects);
  assert.deepEqual(slide.groups,before.groups);
  assert.equal(slide.nextId,before.nextId);
  assert.deepEqual(snapshot(slide).shapeState,before.shapeState);
}

for(const keys of [['a','a.b'],['a.b','a']]){
  test(`component instance names ${keys.join(' then ')} export as distinct groups`,async t=>{
    const directory=await temporaryDirectory(t),filename=path.join(directory,'prefix.pptx');
    const {presentation}=await buildFromPlan({slides:[{title:'Distinct instances',elements:keys.map((key,index)=>({
      code:'C02',key,box:[50+index*400,200,300,100],options:{label:key},
    }))}]});
    await savePresentation(presentation,filename);
    const report=await validatePptx(filename),root=await readSlide(filename);
    assert.deepEqual(report.errors,[]);
    assert.equal(report.counts.groups,2);
    const ids=all(root,'cNvPr').map(node=>node.attrs.id);
    assert.equal(new Set(ids).size,ids.length);
    for(const key of keys)assert.equal(all(root,'t').filter(node=>node.text===key).length,1);
  });
}

test('an exact duplicate component instance name is rejected',()=>{
  const slide=addSlide(createPresentation(),{title:'Instance names'});
  renderByCode(slide,'C02',[50,200,300,100],{label:'First'},'same');
  const before=snapshot(slide);
  assert.throws(()=>renderByCode(slide,'C02',[400,200,300,100],{label:'Second'},'same'),/Duplicate component instance name/);
  assertUnchanged(slide,before);
});

test('exports refresh page totals and leave the authoring model unchanged',async t=>{
  const directory=await temporaryDirectory(t),presentation=createPresentation(),first=addSlide(presentation,{title:'First'});
  const firstSnapshot=snapshot(first),onePage=path.join(directory,'one.pptx');
  await savePresentation(presentation,onePage);
  assert.equal(footerText(await readSlide(onePage)),'1 / 1');
  assertUnchanged(first,firstSnapshot);

  const second=addSlide(presentation,{title:'Second'}),secondSnapshot=snapshot(second),twoPages=path.join(directory,'two.pptx');
  await savePresentation(presentation,twoPages);
  assert.equal(footerText(await readSlide(twoPages)),'1 / 2');
  assert.equal(footerText(await readSlide(twoPages,2)),'2 / 2');
  assertUnchanged(first,firstSnapshot);
  assertUnchanged(second,secondSnapshot);

  addFooter(first,1,8);
  addFooter(first,1,9);
  assert.equal(first.shapes.items.filter(shape=>shape.name.startsWith('footer.')).length,3);
  const withManualFooter=snapshot(first),withFooter=path.join(directory,'with.pptx'),withoutFooter=path.join(directory,'without.pptx');
  await Promise.all([
    savePresentation(presentation,withFooter),
    savePresentation(presentation,withoutFooter,{footers:false}),
  ]);
  assert.equal(footerText(await readSlide(withFooter)),'1 / 2');
  assert.equal(footerText(await readSlide(withoutFooter)),undefined);
  assert.equal(footerText(await readSlide(withoutFooter,2)),undefined);
  assert.equal(first.shapes.items.find(shape=>shape.name.startsWith('footer.page.')).text.value,'1 / 9');
  assertUnchanged(first,withManualFooter);
  assertUnchanged(second,secondSnapshot);
});

test('base C19 dots honor indexed and keyed colors and highlights',()=>{
  const slide=addSlide(createPresentation(),{title:'Dot fills'});
  const indexed=renderByCode(slide,'C19',[50,200,300,100],{
    rows:1,cols:3,colors:['#FF0000'],highlight:[0,1],
  },'indexed');
  assert.deepEqual(indexed.result.map(shape=>shape.fill),['#FF0000','#0759BE','#F2F7FB']);
  const keyed=renderByCode(slide,'C19',[450,200,300,100],{
    rows:1,cols:3,colors:{r0c0:'#00FF00','r0.c1':'#0000FF'},highlight:['r0c0','r0.c2'],
  },'keyed');
  assert.deepEqual(keyed.result.map(shape=>shape.fill),['#00FF00','#0000FF','#0759BE']);
  assert.throws(()=>renderByCode(slide,'C19',[50,400,300,100],{rows:0},'bad-rows'),/positive safe integers/);
  assert.throws(()=>renderByCode(slide,'C19',[50,400,300,100],{d:0},'bad-diameter'),/positive finite number/);
});

test('a JSON plan preserves long Chinese labels and attaches cross-component edges',async t=>{
  const directory=await temporaryDirectory(t),filename=path.join(directory,'workflow.pptx');
  const longLabel='输入材料先经过统一编码与质量检查，再根据明确的判定规则进入后续处理环节；这一完整说明用于验证较长的中文内容能够原样保存在可编辑文本中，文字换行和视觉密度仍需另行检查。';
  const {presentation,manifest}=await buildFromPlan({slides:[{
    title:'数据处理流程',summary:'用明确的连接关系说明输入与输出。',
    elements:[
      {code:'C15',key:'input',box:[60,240,460,180],options:{label:longLabel}},
      {code:'C15',key:'output',box:[800,260,350,140],options:{label:'处理结果'}},
      {code:'C07',key:'edge',box:[520,330,280,1],from:'input',to:'output',options:{fromSide:'right',toSide:'left'}},
    ],
  }]});
  assert.equal(manifest[0].instances.length,3);
  await savePresentation(presentation,filename);
  const report=await validatePptx(filename),root=await readSlide(filename);
  assert.deepEqual(report.errors,[]);
  assert.equal(report.counts.attachedConnectors,1);
  assert.equal(report.counts.independentConnectors,0);
  assert.ok(all(root,'t').some(node=>node.text===longLabel));
  const input=all(root,'sp').find(shape=>all(shape,'cNvPr')[0]?.attrs.name.startsWith('slide1.input.body.'));
  const output=all(root,'sp').find(shape=>all(shape,'cNvPr')[0]?.attrs.name.startsWith('slide1.output.body.'));
  const connector=all(root,'cxnSp')[0];
  assert.ok(input&&output&&connector);
  assert.equal(all(connector,'stCxn')[0].attrs.id,all(input,'cNvPr')[0].attrs.id);
  assert.equal(all(connector,'endCxn')[0].attrs.id,all(output,'cNvPr')[0].attrs.id);
});
