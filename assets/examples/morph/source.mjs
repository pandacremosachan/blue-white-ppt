// Read the approved 22-slide reference once into a portable semantic baseline.
// The compact builder uses baseline.json by default and never reads its output.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {readZip} from '../../../skills/blue-white-ppt/scripts/lib/zip.mjs';
import {parseXml,all} from '../../../skills/blue-white-ppt/scripts/lib/xml.mjs';

export const FAMILIES=Object.freeze([
  ['zoom',2,3,'object','全局与局部'],
  ['spotlight',4,5,'object','聚焦窗口'],
  ['parallax',6,7,'object','分层视差'],
  ['carousel',8,9,'object','卡片轮播'],
  ['geometry',10,11,'object','形状与旋转'],
  ['word',12,13,'word','词语重排'],
  ['character',14,15,'character','字符重排'],
  ['equation',16,17,'object','公式移项'],
  ['layers',18,19,'object','层叠分解'],
  ['data',20,21,'object','数据标记']
]);
const direct=(node,local)=>node?.children.find(n=>n.local===local);
function readFill(node){
  if(!node||direct(node,'noFill'))return 'none';
  const solid=direct(node,'solidFill'),rgb=direct(solid,'srgbClr');
  if(!rgb)throw new Error(`Baseline requires an explicit RGB solid fill: ${node.name}`);
  const alpha=direct(rgb,'alpha');return '#'+rgb.attrs.val+(alpha?'/'+Number(alpha.attrs.val)/1000:'');
}
function readShape(node){
  const name=all(node,'cNvPr')[0].attrs.name,sp=direct(node,'spPr'),xfrm=direct(sp,'xfrm'),off=direct(xfrm,'off').attrs,ext=direct(xfrm,'ext').attrs,geom=direct(sp,'prstGeom');
  if(!geom)throw new Error(`Unsupported source geometry: ${name}`);
  const line=direct(sp,'ln'),tx=direct(node,'txBody'),run=all(tx,'rPr')[0],body=direct(tx,'bodyPr');
  const p=direct(tx,'p'),ppr=direct(p,'pPr');
  const text=tx?tx.children.filter(n=>n.local==='p').map(n=>all(n,'t').map(n=>n.text).join('')).join('\n'):'';
  const result={name,geometry:geom.attrs.prst,position:{left:Number(off.x)/9525,top:Number(off.y)/9525,width:Number(ext.cx)/9525,height:Number(ext.cy)/9525},fill:readFill(sp),line:{fill:readFill(line),width:Number(line?.attrs.w??0)/9525}};
  if(xfrm.attrs.rot)result.position.rotation=Number(xfrm.attrs.rot)/60000;
  if(xfrm.attrs.flipH)result.position.horizontalFlip=xfrm.attrs.flipH==='1';
  if(xfrm.attrs.flipV)result.position.verticalFlip=xfrm.attrs.flipV==='1';
  const guides=all(geom,'gd').map(n=>({name:n.attrs.name,formula:n.attrs.fmla}));if(guides.length)result.adjustmentList=guides;
  if(text)result.text={value:text,style:{fontSize:Number(run?.attrs.sz??1800)/75,color:readFill(run),bold:run?.attrs.b==='1',typeface:all(run,'latin')[0]?.attrs.typeface??'Noto Sans SC',alignment:{l:'left',ctr:'center',r:'right',just:'justify'}[ppr?.attrs.algn]??'left',verticalAlignment:{t:'top',ctr:'middle',b:'bottom'}[body?.attrs.anchor]??'top',wrap:'none',insets:0}};
  return result;
}
export async function readSourceDeck(filename){
  const bytes=await fs.readFile(filename),parts=readZip(bytes),presentation=parseXml(parts.get('ppt/presentation.xml').toString()),count=all(presentation,'sldId').length;
  if(count!==22)throw new Error(`Expected the original 22-slide deck, found ${count}. Compact outputs cannot be used as a source; use baseline.json or an archived original.`);
  const effects=[];
  for(const [key,a,b,mode,title]of FAMILIES){
    const endpoints=[a,b].map(slide=>{const tree=parseXml(parts.get(`ppt/slides/slide${slide}.xml`).toString());
      const shapes=all(tree,'sp').filter(n=>{const name=all(n,'cNvPr')[0]?.attrs.name??'';return name.startsWith(`!!${key}.`)&&!name.includes('.viewport.');}).map(readShape);
      if(!shapes.length)throw new Error(`Original source lacks the ${key} family on slide ${slide}`);
      return {slide,mode:all(tree,'morph')[0]?.attrs.option??null,shapes};});
    if(endpoints[0].mode!==null||endpoints[1].mode!=={object:'byObject',word:'byWord',character:'byChar'}[mode])throw new Error(`Unexpected native transition for ${key}`);
    const names=endpoints.map(e=>e.shapes.map(s=>s.name).sort());if(JSON.stringify(names[0])!==JSON.stringify(names[1]))throw new Error(`Unpaired native identities for ${key}`);
    effects.push({key,title,mode,originalSlides:[a,b],states:endpoints.map(e=>e.shapes)});
  }
  return {schema:'blue-white-morph-semantic-baseline/v1',provenance:{originalSlideCount:22,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),note:'Original geometry, text, RGB fills and line styles; viewport masks and page chrome omitted. No PPTX binary or screenshots are stored.'},effects};
}
export function validateBaseline(value){
  if(value.schema!=='blue-white-morph-semantic-baseline/v1'||value.effects?.length!==10)throw new Error('Invalid ten-family Morph semantic baseline');
  for(const [key,,,mode]of FAMILIES){const effect=value.effects.find(e=>e.key===key);if(!effect||effect.mode!==mode||effect.states?.length!==2)throw new Error(`Missing baseline family: ${key}`);
    const names=effect.states.map(state=>state.map(s=>s.name).sort());if(JSON.stringify(names[0])!==JSON.stringify(names[1])||new Set(names[0]).size!==names[0].length)throw new Error(`Invalid baseline identities: ${key}`);
  }
  return value;
}
