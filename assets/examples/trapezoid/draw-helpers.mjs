import {addText,C,FONT} from '../../../skills/blue-white-ppt/scripts/api.mjs';
export {C,FONT};
export const BLUES=['#0759BE','#357BD2','#74A5E1','#BDD5F1','#E5EFFA'];
export function scene(slide,bounds=[60,215,740,380],prefix='scene'){
  const [ox,oy,bw,bh]=bounds,sx=bw/740,sy=bh/380;let serial=0;
  const name=key=>`${prefix}.${key}.${++serial}`;
  const shape=(key,geometry,x,y,w,h,fill=C.bluePale,stroke='none',lw=0,extra={})=>slide.shapes.add({name:name(key),geometry,position:{left:ox+x*sx,top:oy+y*sy,width:w*sx,height:h*sy},fill,line:{fill:stroke,width:lw*Math.min(sx,sy)},...extra});
  const poly=(key,points,fill=C.blue,stroke='none',lw=0)=>{
    const minx=Math.min(...points.map(p=>p[0])),miny=Math.min(...points.map(p=>p[1]));
    const w=Math.max(.01,Math.max(...points.map(p=>p[0]))-minx),h=Math.max(.01,Math.max(...points.map(p=>p[1]))-miny);
    return shape(key,'custom',minx,miny,w,h,fill,stroke,lw,{customPaths:[{width:w,height:h,commands:[...points.map(([x,y],i)=>({[i?'lineTo':'moveTo']:{x:x-minx,y:y-miny}})),{close:{}}]}]});
  };
  const tx=(value,x,y,w,h,size=24,color=C.ink,bold=false,align='center',key='label')=>addText(slide,value,[ox+x*sx,oy+y*sy,w*sx,h*sy],{name:name(key),fontSize:size*Math.min(sx,sy),color,bold,align,verticalAlignment:'middle',insets:0,wrap:'none'});
  const rect=(key,x,y,w,h,fill=C.bluePale,stroke='none',lw=0)=>shape(key,'rect',x,y,w,h,fill,stroke,lw);
  const ellipse=(key,x,y,w,h,fill=C.blue,stroke='none',lw=0)=>shape(key,'ellipse',x,y,w,h,fill,stroke,lw);
  const line=(key,x1,y1,x2,y2,color=C.border,lw=1.5,dashed=false)=>shape(key,'line',Math.min(x1,x2),Math.min(y1,y2),Math.max(.01,Math.abs(x2-x1)),Math.max(.01,Math.abs(y2-y1)),'none',color,lw,{position:{left:ox+Math.min(x1,x2)*sx,top:oy+Math.min(y1,y2)*sy,width:Math.max(.01,Math.abs(x2-x1))*sx,height:Math.max(.01,Math.abs(y2-y1))*sy,horizontalFlip:x2<x1,verticalFlip:y2<y1},line:{fill:color,width:lw*Math.min(sx,sy),style:dashed?'dashed':'solid'}});
  // Ratios describe the top and bottom widths relative to the total width.
  const trap=(key,x,y,w,h,top=.7,bottom=1,fill=C.blue,stroke='none',lw=0)=>poly(key,[[x+(1-top)*w/2,y],[x+(1+top)*w/2,y],[x+(1+bottom)*w/2,y+h],[x+(1-bottom)*w/2,y+h]],fill,stroke,lw);
  const arrow=(key,x,y,w=60,h=30,fill=C.blue)=>shape(key,'rightArrow',x,y,w,h,fill);
  const connect=(key,from,to,color=C.blue,lw=2)=>{
    const connector=slide.shapes.connect(from,to,{kind:'straight',fromSide:'bottom',toSide:'top',line:{fill:color,width:lw*Math.min(sx,sy),style:'solid'},head:{type:'none'},tail:{type:'none'}});
    connector.name=name(key);connector.sendToBack();return connector;
  };
  const radial=(cx,cy,r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
  return {slide,shape,poly,tx,rect,ellipse,line,trap,arrow,connect,radial,ox,oy,sx,sy};
}
