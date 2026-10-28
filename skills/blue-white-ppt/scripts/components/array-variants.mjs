import {CELL_VARIANTS,drawCellVariant} from './cell-variants.mjs';
import {DOT_VARIANTS,drawDotVariant} from './dot-variants.mjs';
import {ARRAY_STRUCTURE_VARIANTS,drawArrayStructure} from './array-structures.mjs';

export const CELL_ARRAY_VARIANTS=Object.freeze([
  ...CELL_VARIANTS,
  ...ARRAY_STRUCTURE_VARIANTS.filter(item=>item.componentId==='graphic.cells'),
]);
export const DOT_ARRAY_VARIANTS=Object.freeze([
  ...DOT_VARIANTS,
  ...ARRAY_STRUCTURE_VARIANTS.filter(item=>item.componentId==='graphic.dots'),
]);
const cellKeys=new Set(CELL_VARIANTS.map(item=>item.key));
const dotKeys=new Set(DOT_VARIANTS.map(item=>item.key));
const allKeys=new Set([...CELL_ARRAY_VARIANTS,...DOT_ARRAY_VARIANTS].map(item=>item.key));
if(CELL_ARRAY_VARIANTS.length!==18||DOT_ARRAY_VARIANTS.length!==18||allKeys.size!==36){
  throw new Error('Expected 36 distinct cell and dot variants.');
}

export function drawCellArrayVariant(slide,id,bounds,options={}){
  if(options.componentId!==undefined&&options.componentId!=='graphic.cells')throw new RangeError('Cell variants belong to graphic.cells.');
  if(!CELL_ARRAY_VARIANTS.some(item=>item.key===options.variant))throw new RangeError(`Unknown cell variant ${JSON.stringify(options.variant)}.`);
  const draw=cellKeys.has(options.variant)?drawCellVariant:drawArrayStructure;
  return draw(slide,id,bounds,{...options,componentId:'graphic.cells'});
}

export function drawDotArrayVariant(slide,id,bounds,options={}){
  if(options.componentId!==undefined&&options.componentId!=='graphic.dots')throw new RangeError('Dot variants belong to graphic.dots.');
  if(!DOT_ARRAY_VARIANTS.some(item=>item.key===options.variant))throw new RangeError(`Unknown dot variant ${JSON.stringify(options.variant)}.`);
  const draw=dotKeys.has(options.variant)?drawDotVariant:drawArrayStructure;
  return draw(slide,id,bounds,{...options,componentId:'graphic.dots'});
}
