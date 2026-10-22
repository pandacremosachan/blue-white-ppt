import {C,FONT,shape,text,box,line,gradient,node,leadChevron,questionIcon,infoIcon,documentIcon,dataIcon,targetIcon} from './research-components.mjs';
import {drawArrowShape} from './arrow-shapes.mjs';
import {drawIconVariant} from './icon-variants.mjs';
import {MESSAGE_VARIANTS,drawLabelVariant,drawMessageVariant} from './text-block-variants.mjs';
import {drawNodeVariant} from './node-variants.mjs';
import {drawSymbolVariant} from './symbol-variants.mjs';
import {drawStackVariant} from './stack-variants.mjs';
import {drawCellArrayVariant,drawDotArrayVariant} from './array-variants.mjs';
import {drawConnectionVariant} from './connection-variants.mjs';

export function drawHeader(sl,id,{x,y,w,h},{number='1',title='页面标题'}={}) {
  box(sl,`${id}.accent`,x,y,w*.025,h,C.blue,'none',0);
  text(sl,`${id}.number`,number,x+w*.035,y,w*.085,h,h*.52,C.blueDark,true,'center');
  box(sl,`${id}.bar`,x+w*.13,y,w*.87,h,gradient(C.blue,C.blueFade),'none',0);
  text(sl,`${id}.title`,title,x+w*.15,y,w*.78,h,h*.5,C.white,true);
}
export function drawMessage(sl,id,bounds,options={}) {
  if(MESSAGE_VARIANTS.some(item=>item.key===options.variant))return drawMessageVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{variant='lead',label='说明文字',emphasis=''}=options;
  const banner=variant==='banner';
  box(sl,`${id}.body`,x,y,w,h,banner?C.blue:variant==='summary'?gradient(C.white,'#EFF3F7',90):C.white,banner?'none':C.border,banner?0:1.4);
  const inset=variant==='lead'?48:18;
  if(variant==='lead')leadChevron(sl,`${id}.lead`,x+13,y+(h-22)/2,22);
  text(sl,`${id}.label`,label,x+inset,y+5,w-inset-16,emphasis?h*.48:h-10,22,banner?C.white:C.ink,true);
  if(emphasis)text(sl,`${id}.emphasis`,emphasis,x+inset,y+h*.55,w-inset-16,h*.35,18,banner?C.yellow:C.red,true);
}
export function drawLabel(sl,id,bounds,options={}) {
  if(options.variant&&options.variant!=='default')return drawLabelVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{label='分类标签',vertical=false,accent=false,round=false}=options;
  return node(sl,`${id}.body`,vertical?Array.from(label).join('\n'):label,x,y,w,h,{fill:C.blue,color:accent?C.yellow:C.white,stroke:'none',size:22,round,insets:4});
}
export function drawNode(sl,id,bounds,options={}) {
  if(options.variant)return drawNodeVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{label='节点 A',geometry='rect',fill=C.bluePale,stroke=C.border,color=C.ink,dashed=false}=options;
  const s=shape(sl,`${id}.body`,geometry,x,y,w,h,fill,stroke,1.4,{line:{fill:stroke,width:1.4,style:dashed?'dashed':'solid'},...(geometry==='roundRect'?{borderRadius:10}:{})});
  s.text=label;s.text.style={typeface:FONT,fontSize:22,color,bold:true,alignment:'center',verticalAlignment:'middle',insets:5,autoFit:'none',wrap:'square'};return s;
}
export function drawLead(sl,id,{x,y,w,h}) {return leadChevron(sl,id,x,y,Math.min(h,w/1.15));}
export function drawBlockArrow(sl,id,bounds,options={}) {
  if(options.shape||options.gradient!==undefined||options.gradientAngle!==undefined||options.rotation!==undefined||options.label!==undefined||options.adjustmentList!==undefined){
    const rotation=options.rotation??({right:0,down:90,left:180,up:270}[options.direction??'right']);
    return drawArrowShape(sl,id,bounds,{...options,rotation});
  }
  const {x,y,w,h}=bounds,{direction='right',outline=false,faded=false}=options;
  return shape(sl,`${id}.body`,{right:'rightArrow',left:'leftArrow',down:'downArrow',up:'upArrow'}[direction],x,y,w,h,outline?C.white:faded?gradient('#F0F6FD',C.blue):C.blue,outline?C.border:'none',outline?1.8:0);
}
export function drawStages(sl,id,{x,y,w,h},{labels=['阶段 1','阶段 2','阶段 3'],active=0}={}) {
  const step=w/labels.length;
  return labels.map((label,i)=>{
    const s=shape(sl,`${id}.stage${i}`,'chevron',x+i*step,y,step+((i===labels.length-1)?0:7),h,i===active?C.blue:gradient(C.white,'#E5E9ED',90),i===active?C.blue:'#D1D7DD',1);
    text(sl,`${id}.label${i}`,label,x+i*step+15,y,step-25,h,21,i===active?C.yellow:C.red,true,'center');return s;
  });
}
export function drawLink(sl,id,bounds,options={}) {
  if(options.variant)return drawConnectionVariant(sl,id,bounds,{...options,componentId:'connector.link'});
  const {x,y,w,h}=bounds,{dashed=false,both=false,arrow=true,kind='straight',from,to,fromSide='right',toSide='left',color=C.blueDark,width=2}=options;
  const opts={kind,line:{fill:color,width,style:dashed?'dashed':'solid'},head:{type:both?'triangle':'none',width:'med',length:'med'},tail:{type:arrow?'triangle':'none',width:'med',length:'med'}};
  const s=from&&to?sl.shapes.connect(from,to,{...opts,fromSide,toSide}):sl.shapes.add({geometry:'connector',name:`${id}.line`,position:{left:x,top:y,width:w,height:h},...opts});
  s.name=`${id}.line`;return s;
}
export const drawQuestion=(sl,id,b,o={})=>o.variant?drawIconVariant(sl,id,b,o):questionIcon(sl,id,b.x,b.y,Math.min(b.w,b.h/1.18));
export const drawInfo=(sl,id,b,o={})=>o.variant?drawIconVariant(sl,id,b,o):infoIcon(sl,id,b.x,b.y,Math.min(b.w,b.h));
export const drawDocument=(sl,id,b,o={})=>o.variant?drawIconVariant(sl,id,b,o):documentIcon(sl,id,b.x,b.y,Math.min(b.w,b.h));
export const drawDatabase=(sl,id,b,o={})=>o.variant?drawIconVariant(sl,id,b,o):dataIcon(sl,id,b.x,b.y,Math.min(b.w,b.h));
export const drawTarget=(sl,id,b,o={})=>o.variant?drawIconVariant(sl,id,b,o):targetIcon(sl,id,b.x,b.y,Math.min(b.w,b.h));
export function drawOperator(sl,id,bounds,options={}) {
  if(options.variant)return drawSymbolVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{symbol='+',accent=false}=options;
  const d=Math.min(w,h),color=accent?C.red:C.blue;
  const s=shape(sl,`${id}.circle`,'ellipse',x,y,d,d,C.white,color,1.8);
  s.text=symbol;s.text.style={typeface:FONT,fontSize:d*.55,color,bold:true,alignment:'center',verticalAlignment:'middle',insets:0};return s;
}
export function drawStack(sl,id,bounds,options={}) {
  if(options.variant)return drawStackVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{depth=4,offset=7,geometry='parallelogram'}=options;
  const fw=w-offset*(depth-1),fh=h-offset*(depth-1);let front;
  for(let i=depth-1;i>=0;i--)front=shape(sl,`${id}.plane${i}`,geometry,x+i*offset,y+(depth-1-i)*offset,fw,fh,gradient(i===0?'#D1E4FA':'#F4F8FD',i===0?C.blue:'#B6CFE9',90),C.blueText,1.1);
  return front;
}
export function drawCells(sl,id,bounds,options={}) {
  if(options.variant)return drawCellArrayVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{rows=1,cols=6,gap=3,labels=[],colors=[],highlight=[],filled=false}=options;
  const cw=(w-(cols-1)*gap)/cols,ch=(h-(rows-1)*gap)/rows;
  return Array.from({length:rows*cols},(_,i)=>{
    const r=Math.floor(i/cols),c=i%cols,accent=highlight.includes(i),fill=colors[i]??(accent?C.blue:filled?['#0759BE','#8FB8E5','#DCEAF8'][i%3]:C.bluePale);
    const s=box(sl,`${id}.r${r}c${c}`,x+c*(cw+gap),y+r*(ch+gap),cw,ch,fill,C.border,.8);
    if(labels[i]!==undefined){s.text=String(labels[i]);s.text.style={typeface:FONT,fontSize:19,color:accent?C.white:C.blueDark,bold:true,alignment:'center',verticalAlignment:'middle',insets:0,autoFit:'none'};}return s;
  });
}
export function drawDots(sl,id,bounds,options={}) {
  if(options.variant)return drawDotArrayVariant(sl,id,bounds,options);
  const {x,y,w,h}=bounds,{rows=1,cols=5,d=24,filled=false}=options;
  return Array.from({length:rows*cols},(_,i)=>{
    const r=Math.floor(i/cols),c=i%cols;
    return shape(sl,`${id}.r${r}c${c}`,'ellipse',x+(cols===1?(w-d)/2:c*(w-d)/(cols-1)),y+(rows===1?(h-d)/2:r*(h-d)/(rows-1)),d,d,filled?C.blue:C.bluePale,C.blue,1.5);
  });
}
