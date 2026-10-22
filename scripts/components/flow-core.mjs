import {C,FONT,shape,text,box} from './research-components.mjs';

// Neutral editable flow structures use a 540 × 350 design coordinate system.
// The public bounds are a fitted drawing area, not a scenario-specific canvas.
export function flowContext(slide,id,bounds,options={}) {
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('Flow bounds require finite coordinates and positive dimensions');
  const sx=w/540,sy=h/350,scale=Math.min(sx,sy),before=slide.shapes.items.length;
  const nodes=[],edges=[],labels=[],surfaces=[],containers=[];
  const pt=(xx,yy)=>({x:x+xx*sx,y:y+yy*sy});
  const pos=(xx,yy,ww,hh)=>({left:x+xx*sx,top:y+yy*sy,width:ww*sx,height:hh*sy});
  function n(key,label,xx,yy,ww,hh,extra={}) {
    const {geometry='rect',highlight=false,fontSize=options.fontSize??20,...style}=extra;
    const s=shape(slide,`${id}.${key}`,geometry,x+xx*sx,y+yy*sy,ww*sx,hh*sy,
      style.fill??(highlight?C.blue:C.bluePale),style.stroke??(highlight?C.blue:C.border),1.3,
      geometry==='roundRect'?{borderRadius:Math.min(18,hh/2)*scale}:{});
    s.text=String(options.labels?.[key]??label);
    s.text.style={typeface:FONT,fontSize:fontSize*scale,color:style.color??(highlight?C.white:C.ink),
      bold:style.bold??false,alignment:'center',verticalAlignment:'middle',insets:3*scale,autoFit:'none',wrap:'square'};
    nodes.push(s);return s;
  }
  function t(key,value,xx,yy,ww,hh,extra={}) {
    if(extra.fill)surfaces.push(box(slide,`${id}.${key}.surface`,x+xx*sx,y+yy*sy,ww*sx,hh*sy,extra.fill,'none',0));
    const s=text(slide,`${id}.${key}`,options.labels?.[key]??value,x+xx*sx,y+yy*sy,ww*sx,hh*sy,
      (extra.fontSize??18)*scale,extra.color??C.blueText,extra.bold??false,extra.align??'center');
    labels.push(s);return s;
  }
  function edge(key,from,to,extra={}) {
    const s=slide.shapes.connect(from,to,{kind:extra.kind??'straight',fromSide:extra.fromSide??'right',toSide:extra.toSide??'left',
      line:{fill:extra.color??C.blueDark,width:(extra.width??1.7)*scale,style:extra.dashed?'dashed':'solid'},
      tail:{type:extra.arrow===false?'none':'triangle',width:'sm',length:'sm'}});
    s.name=`${id}.${key}`;s.bringToFront();edges.push(s);return s;
  }
  function anchor(key,xx,yy) {
    const s=shape(slide,`${id}.${key}`,'rect',x+xx*sx-.05,y+yy*sy-.05,.1,.1,'none','none',0);
    return s;
  }
  function route(key,from,to,through=[],extra={}) {
    if(!Array.isArray(through))throw new TypeError('Flow route points must be an array');
    const middle=through.map((point,i)=>anchor(`${key}.point${i}`,Array.isArray(point)?point[0]:point.x,Array.isArray(point)?point[1]:point.y));
    const sequence=[from,...middle,to],result=[];
    for(let i=0;i<sequence.length-1;i++) {
      const a=sequence[i].position,b=sequence[i+1].position;
      const dx=b.left+b.width/2-a.left-a.width/2,dy=b.top+b.height/2-a.top-a.height/2;
      const horizontal=Math.abs(dx)>Math.abs(dy);
      const fromSide=i===0?(extra.fromSide??(horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top')))
        :(horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top'));
      const toSide=i===sequence.length-2?(extra.toSide??(horizontal?(dx>=0?'left':'right'):(dy>=0?'top':'bottom')))
        :(horizontal?(dx>=0?'left':'right'):(dy>=0?'top':'bottom'));
      result.push(edge(`${key}.edge${i}`,sequence[i],sequence[i+1],{...extra,fromSide,toSide,
        arrow:i===sequence.length-2&&extra.arrow!==false}));
    }
    return result;
  }
  function frame(key,label,xx,yy,ww,hh,extra={}) {
    const s=box(slide,`${id}.${key}`,x+xx*sx,y+yy*sy,ww*sx,hh*sy,extra.fill??C.white,extra.stroke??C.border,1.1,
      {line:{fill:extra.stroke??C.border,width:1.1*scale,style:extra.dashed?'dashed':'solid'}});
    containers.push(s);
    if(label)t(`${key}.title`,label,xx+10,yy+5,ww-20,27,{fontSize:18,bold:true,align:extra.align??'left'});
    return s;
  }
  function bar(key,xx,yy,ww,hh=6) {
    const s=box(slide,`${id}.${key}`,x+xx*sx,y+yy*sy,ww*sx,hh*sy,C.blue,'none',0);
    nodes.push(s);return s;
  }
  function finish(extra={}) {
    // Keep arrows behind all node surfaces and branch labels above the routes.
    edges.forEach(s=>s.bringToFront());nodes.forEach(s=>s.bringToFront());
    surfaces.forEach(s=>s.bringToFront());labels.forEach(s=>s.bringToFront());
    return {id,bounds:{x,y,w,h},nodes,edges,containers,shapes:slide.shapes.items.slice(before),...extra};
  }
  return {x,y,w,h,sx,sy,scale,n,t,e:edge,route,frame,bar,anchor,finish,pt,pos};
}
