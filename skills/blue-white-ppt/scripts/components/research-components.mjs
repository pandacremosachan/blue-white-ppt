import fs from 'node:fs/promises';
export const STYLE = JSON.parse(await fs.readFile(new URL('./style.json', import.meta.url), 'utf8'));
export const C = STYLE.colors;
export const FONT = STYLE.font.family;

let serial = 0;

export function shape(slide,id,geometry,x,y,w,h,fill='none',stroke='none',width=0,extra={}) {
  return slide.shapes.add({geometry,name:`${id}.${++serial}`,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width,style:'solid'},...extra});
}
export function text(slide,id,value,x,y,w,h,size=23,color=C.ink,bold=false,align='left',extra={}) {
  const s=shape(slide,id,'textbox',x,y,w,h);
  s.text.style={typeface:FONT,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'square',...extra};
  s.text=value;
  return s;
}
export function rich(slide,id,runs,x,y,w,h,size=23,extra={}) {
  return text(slide,id,[runs.map(r=>typeof r==='string'?{run:r}:{run:r.text,style:{color:r.color??C.ink,bold:r.bold??true,typeface:FONT}})],x,y,w,h,size,C.ink,true,'left',extra);
}
export function gradient(start,end,angle=0) {
  return {type:'gradient',gradientKind:'linear',angleDeg:angle,stops:[{offset:0,color:start},{offset:100000,color:end}]};
}
export function box(slide,id,x,y,w,h,fill=C.white,stroke=C.border,width=1.4,extra={}) {
  return shape(slide,id,'rect',x,y,w,h,fill,stroke,width,extra);
}
export function line(slide,id,x,y,w,h=0,color=C.border,width=1.3,dashed=false) {
  return shape(slide,id,'line',x,y,w,h,'none',color,width,{line:{fill:color,width,style:dashed?'dashed':'solid'}});
}
export function link(slide,id,x,y,w,h=0,{color=C.blueDark,width=2,dashed=false,both=false,open=false}={}) {
  return slide.shapes.add({geometry:'connector',name:`${id}.${++serial}`,kind:'straight',position:{left:x,top:y,width:w,height:h},line:{fill:color,width,style:dashed?'dashed':'solid'},head:{type:both?'triangle':'none',width:'med',length:'med'},tail:{type:open?'arrow':'triangle',width:'med',length:'med'}});
}
export function connect(slide,id,from,to,{fromSide='right',toSide='left',kind='straight',dashed=false,color=C.blueDark}={}) {
  const s=slide.shapes.connect(from,to,{kind,fromSide,toSide,line:{fill:color,width:2,style:dashed?'dashed':'solid'},tail:{type:'triangle',width:'med',length:'med'}});
  s.name=id; s.bringToFront(); return s;
}
export function node(slide,id,label,x,y,w,h,{fill=C.bluePale,color=C.ink,size=22,stroke=C.border,bold=true,round=false,insets=5}={}) {
  const s=shape(slide,id,round?'roundRect':'rect',x,y,w,h,fill,stroke,1.4,round?{borderRadius:10}:{});
  s.text=label; s.text.style={typeface:FONT,fontSize:size,color,bold,alignment:'center',verticalAlignment:'middle',insets,autoFit:'none',wrap:'square'};return s;
}

export function header(slide,number,title) {
  slide.background.fill=C.white;
  box(slide,'header.accent',12,10,32,64,C.blue,'none',0);
  text(slide,'header.number',number,50,12,88,61,37,C.blueDark,true,'center');
  box(slide,'header.gradient',144,10,1124,64,gradient(C.blue,C.blueFade),'none',0);
  text(slide,'header.title',title,164,12,850,60,36,C.white,true);
  text(slide,'header.library','科研汇报组件库',1022,22,226,40,20,C.blueDark,true,'right');
}
export function leadChevron(slide,id,x,y,size=23) {
  shape(slide,`${id}.a`,'chevron',x,y,size*.68,size,gradient('#B8D4EF',C.blue),'none',0);
  shape(slide,`${id}.b`,'chevron',x+size*.44,y,size*.68,size,gradient('#B8D4EF',C.blue),'none',0);
}
export function lead(slide,runs) {
  box(slide,'info.lead',48,94,1184,78,C.white,C.border);
  leadChevron(slide,'info.lead.icon',63,116,23);
  rich(slide,'info.lead.text',runs,101,103,1110,60,23);
}
export function questionIcon(slide,id,x,y,size=38) {
  shape(slide,`${id}.body`,'roundRect',x,y,size,size,C.blue,'none',0,{borderRadius:4});
  shape(slide,`${id}.tail`,'triangle',x+size*.38,y+size*.73,size*.33,size*.45,C.blue,'none',0,{position:{left:x+size*.38,top:y+size*.73,width:size*.33,height:size*.45,rotation:180}});
  shape(slide,`${id}.disc`,'ellipse',x+size*.2,y+size*.15,size*.6,size*.6,C.white,'none',0);
  text(slide,`${id}.question`,'?',x+size*.2,y+size*.11,size*.6,size*.65,size*.53,C.blue,true,'center');
}
export function infoIcon(slide,id,x,y,size=38) {
  shape(slide,`${id}.circle`,'ellipse',x,y,size,size,C.blue,'none',0);
  text(slide,`${id}.i`,'i',x,y-1,size,size,size*.7,C.white,true,'center');
}
export function documentIcon(slide,id,x,y,size=40) {
  box(slide,`${id}.back`,x+size*.15,y+size*.1,size*.7,size*.9,C.bluePale,C.blue,1.5);
  box(slide,`${id}.page`,x,y,size*.7,size*.9,C.white,C.blue,1.8);
  for(let i=0;i<3;i++)line(slide,`${id}.line${i}`,x+size*.13,y+size*(.25+i*.18),size*.42,0,C.blue,1.6);
}
export function dataIcon(slide,id,x,y,size=40) {
  shape(slide,`${id}.database`,'can',x,y,size,size,C.bluePale,C.blue,1.8);
}
export function targetIcon(slide,id,x,y,size=40) {
  for(const [ratio,color] of [[1,C.blue],[.63,C.white],[.27,C.blue]])shape(slide,`${id}.ring${ratio}`,'ellipse',x+size*(1-ratio)/2,y+size*(1-ratio)/2,size*ratio,size*ratio,color,C.blue,1.5);
}
