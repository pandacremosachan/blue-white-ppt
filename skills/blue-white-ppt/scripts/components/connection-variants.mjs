import {CONNECTION_ROUTE_VARIANTS,drawConnectionRoute} from './connection-routes.mjs';
import {BYPASS_VARIANTS,drawBypassVariant} from './bypass-variants.mjs';
import {LAYER_CONNECTION_VARIANTS,drawLayerConnection} from './layer-connections.mjs';

export const CONNECTION_VARIANTS=Object.freeze([
  ...CONNECTION_ROUTE_VARIANTS,...BYPASS_VARIANTS,...LAYER_CONNECTION_VARIANTS,
]);
const byKey=new Map(CONNECTION_VARIANTS.map(item=>[item.key,item]));
const routeKeys=new Set(CONNECTION_ROUTE_VARIANTS.map(item=>item.key));
const bypassKeys=new Set(BYPASS_VARIANTS.map(item=>item.key));
if(CONNECTION_VARIANTS.length!==12||byKey.size!==12)throw new Error('Expected twelve distinct connection variants.');

export function drawConnectionVariant(slide,id,bounds,options={}){
  const spec=byKey.get(options.variant);
  if(!spec)throw new RangeError(`Unknown connection variant ${JSON.stringify(options.variant)}.`);
  if(options.componentId!==undefined&&options.componentId!==spec.componentId)throw new RangeError(`Connection ${spec.key} belongs to ${spec.componentId}.`);
  const draw=routeKeys.has(spec.key)?drawConnectionRoute:bypassKeys.has(spec.key)?drawBypassVariant:drawLayerConnection;
  return draw(slide,id,bounds,{...options,componentId:spec.componentId});
}
