import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {readZip} from '../scripts/lib/zip.mjs';
import {all,parseXml} from '../scripts/lib/xml.mjs';
import {validatePptx} from '../scripts/validate-pptx.mjs';
import {assertBodyInFrames,assertBounds,assertReferenceSlideStyle,objectName,slideObjects} from './helpers/showcase-style.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const expectedChapters=['1','2.1','2.2','3','4','5'];
const expectedFrames=[
 [...Array.from({length:5},(_,i)=>[`guide.${i}`,[48,193+i*82,1184,75]]),['guide.conclusion',[48,612,1184,70]]],
 [['formula.structure',[48,190,1184,310]],['formula.variables',[48,510,1184,174]]],
 [['derivation',[48,190,660,494]],['implementation',[734,190,498,494]]],
 [['chart.evidence',[48,190,836,494]],['chart.interpretation',[900,190,332,494]]],
 [['navigation',[48,190,1184,58]],['workflow',[48,258,1184,426]]],
 [['figure',[48,190,684,494]],['media',[756,190,476,494]]],
];

test('the six-page content reference keeps its chapter structure, complete regions and native interactive content',async()=>{
 // An explicit candidate path allows pre-publication checks; packaged tests
 // default to the shipped showcase and need no research-workspace files.
 const filename=process.env.BLUE_WHITE_PPT_CONTENT_TEST_DECK??path.join(root,'assets','showcases','content-and-playback.pptx');
 const parts=readZip(await fs.readFile(filename)),trees=Array.from({length:6},(_,i)=>parseXml(parts.get(`ppt/slides/slide${i+1}.xml`).toString()));
 assert.equal([...parts.keys()].filter(name=>/^ppt\/slides\/slide\d+\.xml$/.test(name)).length,6);
 assert.equal([...parts.keys()].filter(name=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)).length,6);
 let equations=0,charts=0,animatedSlides=0,effects=0,clickBatches=0,animationTargets=0,buildReferences=0,internalLinks=0;
 for(const [index,tree] of trees.entries()){
  const page=index+1;assertReferenceSlideStyle(tree,{chapterNumber:expectedChapters[index],page,total:6});
  const frames=expectedFrames[index].map(([name,bounds])=>{
   const frame=slideObjects(tree).find(node=>objectName(node)===`style.panel.${name}`);
   assert.ok(frame,`Complete body frame ${name} on page ${page}`);assertBounds(frame,bounds);return frame;
  });
  assertBodyInFrames(tree,frames);
  equations+=all(tree,'oMath').length;charts+=all(tree,'chart').length;animatedSlides+=all(tree,'timing').length;
  const timeline=all(tree,'cTn');effects+=timeline.filter(node=>node.attrs.presetID).length;
  clickBatches+=timeline.filter(node=>node.attrs.nodeType==='clickEffect').length;
  const shapeIds=new Set(all(tree,'cNvPr').map(node=>node.attrs.id));
  for(const target of all(tree,'spTgt')){animationTargets++;assert.ok(shapeIds.has(target.attrs.spid),`Native animation target ${target.attrs.spid} on page ${page}`);}
  const builds=all(tree,'bldP');buildReferences+=builds.length;
  for(const build of builds)assert.ok(shapeIds.has(build.attrs.spid),`Native animation build reference ${build.attrs.spid} on page ${page}`);
  assert.deepEqual(builds.map(node=>node.attrs.spid),all(tree,'spTgt').map(node=>node.attrs.spid),`Build order matches effect targets on page ${page}`);
  const relationships=parseXml(parts.get(`ppt/slides/_rels/slide${page}.xml.rels`).toString());
  for(const link of all(tree,'hlinkClick').filter(node=>node.attrs.action==='ppaction://hlinksldjump')){
   internalLinks++;const relation=all(relationships,'Relationship').find(node=>node.attrs.Id===link.attrs['r:id']);
   assert.ok(relation,`Navigation relationship on page ${page}`);assert.ok(relation.attrs.Type.endsWith('/slide'));assert.ok(!relation.attrs.TargetMode);
   const target=relation.attrs.Target.startsWith('/')?relation.attrs.Target.slice(1):path.posix.normalize(path.posix.join('ppt/slides',relation.attrs.Target));
   assert.ok(parts.has(target),`Navigation target remains a physical slide: ${target}`);
  }
 }
 assert.equal(equations,7);assert.equal(charts,1);assert.equal(animatedSlides,2);
 assert.equal(effects,17);assert.equal(clickBatches,5);assert.equal(animationTargets,17);assert.equal(buildReferences,17);assert.equal(animationTargets+buildReferences,34);assert.equal(internalLinks,8);
 const chartParts=all(parseXml(parts.get('[Content_Types].xml').toString()),'Override').filter(node=>node.attrs.ContentType==='application/vnd.openxmlformats-officedocument.drawingml.chart+xml');
 assert.equal(chartParts.length,1);
 const chartPath=chartParts[0].attrs.PartName.replace(/^\//,''),chart=parseXml(parts.get(chartPath).toString());
 assert.equal(all(chart,'lineChart').length,1,'The reference retains its native line chart');
 const externalData=all(chart,'externalData');assert.equal(externalData.length,1);
 const chartRels=parseXml(parts.get(path.posix.join(path.posix.dirname(chartPath),'_rels',path.posix.basename(chartPath)+'.rels')).toString());
 const workbook=all(chartRels,'Relationship').find(node=>node.attrs.Id===externalData[0].attrs['r:id']);
 assert.ok(workbook?.attrs.Type.endsWith('/package'),'Chart data points to an embedded workbook');
 const workbookPath=workbook.attrs.Target.startsWith('/')?workbook.attrs.Target.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(chartPath),workbook.attrs.Target));
 const workbookParts=readZip(parts.get(workbookPath));assert.ok(workbookParts.has('xl/workbook.xml'));assert.ok(workbookParts.has('xl/worksheets/sheet1.xml'));
 assert.equal([...parts.keys()].filter(name=>/^ppt\/embeddings\/.*\.xlsx$/.test(name)).length,1);
 assert.deepEqual((await validatePptx(filename)).errors,[]);
});
