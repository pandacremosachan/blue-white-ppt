import {C,FONT,box,text} from './research-components.mjs';
import {COMPOSITION_LAYOUTS} from './composition-layouts.mjs';
import {PARTITION_LAYOUTS} from './partition-layouts.mjs';

export const LAYOUT_PRESETS=Object.freeze([...COMPOSITION_LAYOUTS,...PARTITION_LAYOUTS]);
const byKey=new Map(LAYOUT_PRESETS.map(item=>[item.key,item]));
if(byKey.size!==LAYOUT_PRESETS.length)throw new Error('Duplicate layout preset key');

function rectOf(value) {
  const {x,y,w,h}=value;
  if(![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>540.01||y+h>350.01)
    throw new RangeError(`Invalid layout region ${value.id??value.key??''}`);
  return {x,y,w,h};
}
function contains(outer,inner) {
  return inner.x>=outer.x-.01&&inner.y>=outer.y-.01&&inner.x+inner.w<=outer.x+outer.w+.01&&inner.y+inner.h<=outer.y+outer.h+.01;
}
function overlaps(a,b) {
  return Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>.01&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>.01;
}
export function validateLayoutPreset(spec) {
  if(spec.componentId!=='layout.partitions'||!Array.isArray(spec.cells)||spec.cells.length<2)throw new Error(`Incomplete layout preset ${spec.key}`);
  const regions=spec.regions??[],regionMap=new Map(regions.map(region=>[region.id,region]));
  if(regionMap.size!==regions.length||new Set(spec.cells.map(cell=>cell.id)).size!==spec.cells.length)throw new Error(`Duplicate region IDs in ${spec.key}`);
  for(const part of [...regions,...spec.cells]){
    rectOf(part);
    if(part.parent){const parent=regionMap.get(part.parent);if(!parent||!contains(parent,part))throw new Error(`Invalid parent for ${spec.key}/${part.id}`);}
  }
  for(let i=0;i<spec.cells.length;i++)for(let j=i+1;j<spec.cells.length;j++)
    if(overlaps(spec.cells[i],spec.cells[j]))throw new Error(`Overlapping layout cells: ${spec.key}/${spec.cells[i].id}/${spec.cells[j].id}`);
  return true;
}
LAYOUT_PRESETS.forEach(validateLayoutPreset);

/** Editable irregular partition combinations. Labels are optional placeholders. */
export function drawLayoutPreset(slide,id,bounds,options={}) {
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('Layout bounds require finite coordinates and positive dimensions');
  const spec=byKey.get(options.preset);
  if(!spec)throw new RangeError(`Unknown layout preset ${options.preset}`);
  const before=slide.shapes.items.length,sx=w/540,sy=h/350,scale=Math.min(sx,sy);
  const showLabels=options.showLabels!==false,cells=[],regions=[];
  const fit=rect=>({x:x+rect.x*sx,y:y+rect.y*sy,w:rect.w*sx,h:rect.h*sy});
  const titles=options.titles??{};
  for(const region of [...(spec.regions??[])].sort((a,b)=>b.w*b.h-a.w*a.h)){
    const r=fit(region),panel=box(slide,`${id}.region.${region.id}`,r.x,r.y,r.w,r.h,C.white,C.border,1.1,
      {line:{fill:C.border,width:1.1*scale,style:region.dashed?'dashed':'solid'}});
    let title=null;
    if(showLabels&&region.title)title=text(slide,`${id}.region.${region.id}.title`,region.title,r.x+10*scale,r.y+5*scale,
      r.w-20*scale,26*scale,18*scale,C.blueText,true);
    regions.push({key:region.id,shape:panel,label:title,bounds:r,parent:region.parent??null,
      contentBounds:{x:r.x+10*scale,y:r.y+(region.title?35:10)*scale,w:r.w-20*scale,h:r.h-(region.title?45:20)*scale}});
  }
  for(const [index,cell] of spec.cells.entries()){
    const r=fit(cell),role=cell.role??'support',emphasis=role==='band'||role==='summary'||role==='label';
    const fill=emphasis?C.blue:['main','figure','axis'].includes(role)?C.bluePale:C.white;
    const stroke=emphasis?C.blue:role==='main'?C.blueText:C.border;
    const panel=box(slide,`${id}.cell.${cell.id}`,r.x,r.y,r.w,r.h,fill,stroke,1.2,
      {line:{fill:stroke,width:1.2*scale,style:role==='figure'?'dashed':'solid'}});
    const value=Array.isArray(titles)?titles[index]??cell.title:titles[cell.id]??cell.title;
    const fontSize=(['caption','axis'].includes(role)?18:options.fontSize??20)*scale;
    const padding=Math.min(10*scale,r.w*.07,r.h*.15,Math.max(scale,(r.h-fontSize*1.5)/2));
    let label=null;
    if(showLabels&&value!==undefined)label=text(slide,`${id}.cell.${cell.id}.label`,String(value),r.x+padding,r.y+padding,
      r.w-2*padding,r.h-2*padding,fontSize,emphasis?C.white:C.blueText,true,'center');
    cells.push({key:cell.id,title:value,role,parent:cell.parent??null,shape:panel,label,bounds:r,
      contentBounds:{x:r.x+padding,y:r.y+padding,w:r.w-2*padding,h:r.h-2*padding}});
  }
  return {id,preset:spec.key,bounds:{x,y,w,h},cells,regions,showLabels,font:FONT,shapes:slide.shapes.items.slice(before)};
}
