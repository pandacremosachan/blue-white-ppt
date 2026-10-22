import fs from 'node:fs/promises';
import path from 'node:path';
import {readZip} from './lib/zip.mjs';
import {parseXml,all} from './lib/xml.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
export async function validatePptx(filename){
  const parts=readZip(await fs.readFile(filename)),errors=[],warnings=[],counts={slides:0,shapes:0,connectors:0,attachedConnectors:0,independentConnectors:0,groups:0,tables:0,pictures:0};
  for(const required of ['[Content_Types].xml','_rels/.rels','ppt/presentation.xml'])if(!parts.has(required))errors.push(`Missing ${required}`);
  const trees=new Map();for(const [name,data] of parts)if(name.endsWith('.xml')||name.endsWith('.rels')){try{trees.set(name,parseXml(data.toString()));}catch(e){errors.push(`${name}: ${e.message}`);}}
  const overrides=all(trees.get('[Content_Types].xml'),'Override').map(n=>n.attrs.PartName);if(new Set(overrides).size!==overrides.length)errors.push('Duplicate content-type part overrides');
  for(const [name,tree] of trees)if(name.endsWith('.rels')){
    const owner=name==='_rels/.rels'?'':name.replace('/_rels/','/').replace(/\.rels$/,'');
    for(const rel of all(tree,'Relationship'))if(rel.attrs.TargetMode!=='External'){
      const target=rel.attrs.Target.startsWith('/')?path.posix.normalize(rel.attrs.Target.slice(1)):path.posix.normalize(path.posix.join(path.posix.dirname(owner),rel.attrs.Target));
      if(!parts.has(target))errors.push(`Broken package relationship ${name} -> ${target}`);
    }
  }
  const size=all(trees.get('ppt/presentation.xml'),'sldSz')[0]?.attrs,canvas={w:Number(size?.cx)/9525,h:Number(size?.cy)/9525};
  for(const [name,root] of trees)if(/^ppt\/slides\/[^/]+\.xml$/.test(name)){
    counts.slides++;const ids=all(root,'cNvPr').map(n=>n.attrs.id),idSet=new Set(ids);if(ids.length!==idSet.size)errors.push(`Duplicate native IDs in ${name}`);
    counts.groups+=all(root,'grpSp').length;counts.tables+=all(root,'tbl').length;counts.pictures+=all(root,'pic').length;
    for(const s of [...all(root,'sp'),...all(root,'cxnSp'),...all(root,'pic'),...all(root,'graphicFrame')]){
      const objectName=all(s,'cNvPr')[0]?.attrs.name??'unnamed',connector=s.local==='cxnSp';if(s.local==='sp'||connector)counts[connector?'connectors':'shapes']++;
      if(connector){const start=all(s,'stCxn'),end=all(s,'endCxn');if(!start.length&&!end.length)counts.independentConnectors++;else if(start.length!==1||end.length!==1||!idSet.has(start[0].attrs.id)||!idSet.has(end[0].attrs.id))errors.push(`Invalid attachment ${name}/${objectName}`);else counts.attachedConnectors++;}
      const sp=s.children.find(n=>n.local==='spPr')??s,x=sp.children.find(n=>n.local==='xfrm');if(!x)continue;
      const off=x.children.find(n=>n.local==='off')?.attrs,ext=x.children.find(n=>n.local==='ext')?.attrs;if(!off||!ext){errors.push(`Missing transform ${name}/${objectName}`);continue;}
      let left=Number(off.x)/9525,top=Number(off.y)/9525,width=Number(ext.cx)/9525,height=Number(ext.cy)/9525;
      if([left,top,width,height].some(n=>!Number.isFinite(n))||width<0||height<0)errors.push(`Invalid geometry ${name}/${objectName}`);
      const rotation=((Number(x.attrs.rot??0)/60000)%360+360)%360;if(rotation===90||rotation===270){left+=(width-height)/2;top+=(height-width)/2;[width,height]=[height,width];}
      if(left<-.5||top<-.5||left+width>canvas.w+.5||top+height>canvas.h+.5)errors.push(`Outside slide bounds ${name}/${objectName}`);
    }
  }
  if(!counts.slides)errors.push('Presentation contains no slides');
  if(counts.independentConnectors)warnings.push(`${counts.independentConnectors} independent connector(s); ensure these are intentional samples, not detached workflow edges.`);
  return {file:path.resolve(filename),status:errors.length?'fail':'pass',canvas,counts,errors,warnings};
}
if(import.meta.url===new URL(process.argv[1], 'file:///').href||process.argv[1]?.endsWith('validate-pptx.mjs'))await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node validate-pptx.mjs deck.pptx [--report report.json]');return;}
  if(!a._[0])throw new Error('A PPTX path is required');const report=await validatePptx(path.resolve(a._[0]));if(a.report)await fs.writeFile(path.resolve(a.report),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.errors.length)process.exitCode=1;
});
