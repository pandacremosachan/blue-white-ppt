import fs from 'node:fs/promises';
import {COMPONENTS,renderComponent,STYLE,C,FONT} from './components/index.mjs';
import {header,lead,text,box,line} from './components/research-components.mjs';
import {Presentation,savePptx} from './lib/native-pptx.mjs';
export {COMPONENTS,STYLE,C,FONT,Presentation};
const byCode=new Map(COMPONENTS.map(item=>[item.code,item]));
const byId=new Map(COMPONENTS.map(item=>[item.id,item]));
export function getComponent(code){const item=byCode.get(String(code).toUpperCase())??byId.get(code);if(!item)throw new Error(`Unknown component ${code}; use C01–C39 or a canonical ID`);return item;}
export function renderByCode(slide,code,bounds,options={},instanceId){
  const item=getComponent(code),id=instanceId??`component.${item.code}.${slide.shapes.items.length+1}`;
  if(slide.shapes.items.some(shape=>shape.name?.startsWith(id+'.')))throw new Error(`Duplicate component instance name ${id}`);
  const rect=Array.isArray(bounds)?{x:bounds[0],y:bounds[1],w:bounds[2],h:bounds[3]}:bounds;
  const result=renderComponent(slide,item.id,rect,options,id);
  if(slide.groups&&result.objects.length>1)slide.groups.push({prefix:id+'.',name:`${item.code} ${item.name} / ${id}`});
  return {...result,code:item.code};
}
export function createPresentation({title='演示文稿',brand=''}={}){const p=Presentation.create({slideSize:STYLE.canvas});p.title=title;p.brand=brand;return p;}
export function addSlide(p,{number=String(p.slides.items.length+1),title='页面标题',summary,footer}={}){
  const slide=p.slides.add();header(slide,number,title);if(summary)lead(slide,[summary]);
  slide.shapes.items.find(shape=>shape.name?.startsWith('header.library.')).text=p.brand;
  slide._footerLabel=footer??title;return slide;
}
export function addText(slide,value,bounds,{fontSize=23,color=C.ink,bold=false,align='left',name=`text.${slide.shapes.items.length+1}`,...style}={}){const b=Array.isArray(bounds)?{x:bounds[0],y:bounds[1],w:bounds[2],h:bounds[3]}:bounds;return text(slide,name,value,b.x,b.y,b.w,b.h,fontSize,color,bold,align,style);}
export function addTable(slide,{values,bounds,columnWidths,fontSize=20,headerRow=true}){
  if(!Array.isArray(values)||!values.length||!Array.isArray(values[0])||!values[0].length||!values.every(row=>Array.isArray(row)&&row.length===values[0].length))throw new Error('Table values must be a nonempty rectangular matrix');
  if(columnWidths&&(!Array.isArray(columnWidths)||columnWidths.length!==values[0].length||!columnWidths.every(width=>Number.isFinite(width)&&width>0)))throw new Error('columnWidths must contain one positive width per column');
  const b=Array.isArray(bounds)?{x:bounds[0],y:bounds[1],w:bounds[2],h:bounds[3]}:bounds;
  const t=slide.tables.add({rows:values.length,columns:values[0].length,left:b.x,top:b.y,width:b.w,height:b.h,columnWidths,values});t.borders.assign({fill:C.border,width:.8});
  for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){const cell=t.getCell(r,c);cell.fill=headerRow&&r===0?C.blue:r%2?C.bluePale:C.white;cell.text.style={typeface:FONT,fontSize,color:headerRow&&r===0?C.white:C.ink,bold:headerRow&&r===0,alignment:'left',verticalAlignment:'middle',insets:0};}
  return t;
}
function imageDimensions(bytes){
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),extension:'png'};
  if(bytes[0]===255&&bytes[1]===216){let i=2;while(i<bytes.length){if(bytes[i++]!==255)continue;let marker=bytes[i++];while(marker===255)marker=bytes[i++];if([0xd8,0xd9,0x01].includes(marker))continue;const length=bytes.readUInt16BE(i);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:bytes.readUInt16BE(i+5),height:bytes.readUInt16BE(i+3),extension:'jpg'};i+=length;}}
  throw new Error('Images must be PNG or JPEG with readable dimensions');
}
export async function addImage(slide,filename,bounds,{name=`image.${slide.shapes.items.length+1}`}={}){
  const bytes=await fs.readFile(filename),info=imageDimensions(bytes),b=Array.isArray(bounds)?{x:bounds[0],y:bounds[1],w:bounds[2],h:bounds[3]}:bounds,scale=Math.min(b.w/info.width,b.h/info.height),w=info.width*scale,h=info.height*scale;
  return slide.shapes.add({geometry:'picture',name,imageBytes:bytes,imageExtension:info.extension,position:{left:b.x+(b.w-w)/2,top:b.y+(b.h-h)/2,width:w,height:h}});
}
export function addFooter(slide,number,total,label=slide._footerLabel??''){
  if(slide.shapes.items.some(s=>s.name?.startsWith('footer.')))return;
  line(slide,'footer.rule',48,698,1184,0,C.border,.55);text(slide,'footer.label',label,48,700,950,19,12,C.muted);text(slide,'footer.page',`${number} / ${total}`,1030,700,202,19,12,C.blueText,false,'right');
}
export async function savePresentation(p,filename,{overwrite=false,footers=true}={}){
  if(!p.slides.items.length)throw new Error('Cannot export an empty presentation');
  if(footers)p.slides.items.forEach((slide,i)=>addFooter(slide,i+1,p.slides.items.length));
  return savePptx(p,filename,{overwrite});
}
function nativeEndpoint(record){const r=record.result;return r?.body??(r?.position?r:null)??r?.nodes?.[0]??record.objects[0];}
function resolveReference(value,instances){
  if(typeof value==='string'&&instances.has(value))return nativeEndpoint(instances.get(value));
  if(value&&typeof value==='object'&&value.ref){
    const parts=value.ref.replace(/\[(\d+)\]/g,'.$1').split('.');let current=instances.get(parts.shift());
    for(const key of parts){if(['__proto__','constructor','prototype'].includes(key))throw new Error('Invalid object reference');current=current?.[key];}
    if(!current)throw new Error(`Unresolved reference ${value.ref}`);return current;
  }
  throw new Error(`Unknown endpoint ${JSON.stringify(value)}; create it earlier on this slide`);
}
export async function buildFromPlan(plan,{baseDirectory=process.cwd()}={}){
  if(!Array.isArray(plan.slides)||!plan.slides.length)throw new Error('A plan requires a nonempty slides array');
  const p=createPresentation(plan),manifest=[];
  for(const [i,page] of plan.slides.entries()){
    const slide=addSlide(p,page),instances=new Map(),records=[];
    for(const [j,e] of (page.elements??[]).entries()){
      if(e.type==='text'){addText(slide,e.text,e.box,e.style);continue;}
      if(e.type==='table'){addTable(slide,{...e,bounds:e.box});continue;}
      if(e.type==='image'){await addImage(slide,(await import('node:path')).resolve(baseDirectory,e.path),e.box,{name:e.key});continue;}
      const key=e.key??`item${j+1}`;if(instances.has(key))throw new Error(`Duplicate key ${key} on slide ${i+1}`);
      const options={...e.options};if(e.from!==undefined)options.from=resolveReference(e.from,instances);if(e.to!==undefined)options.to=resolveReference(e.to,instances);
      const rendered=renderByCode(slide,e.code,e.box,options,`slide${i+1}.${key}`);instances.set(key,rendered);records.push({key,code:rendered.code,componentId:rendered.id,box:e.box,options:e.options??{},nativeObjects:rendered.objects.length});
    }
    if(page.notes)slide.speakerNotes.text=String(page.notes);manifest.push({slide:i+1,title:page.title,instances:records});
  }
  return {presentation:p,manifest};
}
