import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {COMPONENTS,createPresentation,renderByCode,savePresentation,addTable,addImage} from './api.mjs';
import {validatePptx} from './validate-pptx.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node self-test.mjs --output test-directory');return;}
  const output=path.resolve(a.output??'blue-white-ppt-self-test');await fs.mkdir(output,{recursive:true});
  const p=createPresentation(),ids=new Set(),codes=new Set();let variants=0;
  for(const item of COMPONENTS){
    assert.ok(!ids.has(item.id)&&!codes.has(item.code));ids.add(item.id);codes.add(item.code);
    for(const [v,spec] of item.variants.entries()){
      const slide=p.slides.add(),id=`test.${item.code}.${v+1}`;
      const box=item.id==='page.header'?[12,10,1256,64]:item.id.startsWith('icon.')?[80,200,100,105]:item.id==='block.label'?[80,200,270,80]:item.id==='block.message'?[80,200,336,138]:item.id==='block.node'?[80,200,288,104]:item.id.startsWith('graphic.')||item.id==='mark.operator'?[80,200,288,120]:item.id.startsWith('arrow.')?[80,200,400,150]:[80,200,540,350];
      const r=renderByCode(slide,item.code,box,spec.options,id);assert.ok(r.objects.length&&r.objects.every(s=>s.name.startsWith(id+'.')));variants++;
    }
  }
  const extra=p.slides.add();addTable(extra,{values:[['编号','名称'],['C05','实体箭头']],bounds:[50,100,600,100],columnWidths:[120,480]});
  await addImage(extra,fileURLToPath(new URL('../assets/reference/slide-01.png',import.meta.url)),[700,100,500,300]);
  const arrow=renderByCode(extra,'C05',[50,350,240,90],{rotation:90,label:'说明',outline:true},'test.rotation-label');assert.equal(arrow.result.position.rotation,90);assert.equal(arrow.result.text.value,'说明');
  const filename=path.join(output,'all-variants.pptx');await savePresentation(p,filename,{overwrite:Boolean(a.overwrite),footers:false});
  const validation=await validatePptx(filename);assert.deepEqual(validation.errors,[]);
  assert.equal(ids.size,39);assert.equal(variants,244);assert.equal(validation.counts.tables,1);assert.equal(validation.counts.pictures,1);
  assert.equal(validation.counts.attachedConnectors,279,'Workflow connectors must remain attached');
  assert.equal(validation.counts.independentConnectors,4,'Only four intentional connector samples may be detached');
  const report={components:ids.size,variants,slides:p.slides.items.length,validation};await fs.writeFile(path.join(output,'self-test.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({components:ids.size,variants,slides:p.slides.items.length,status:'pass',output},null,2));
});
