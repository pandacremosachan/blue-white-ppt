import {C,shape,gradient} from './research-components.mjs';

const adjustable=defaultDepth=>Object.freeze({mode:'adjustable',min:2,max:6,default:defaultDepth});
const fixed=(layers,groups=1)=>Object.freeze({mode:'fixed',layers,groups,layersPerGroup:layers/groups});

export const STACK_VARIANTS = Object.freeze([
  {componentId:'graphic.stack',key:'rounded-sheets',name:'圆角叠片',note:'圆角片沿对角逐层错位',group:'planes',options:{variant:'rounded-sheets'},depth:adjustable(4)},
  {componentId:'graphic.stack',key:'disc-stack',name:'圆盘叠层',note:'扁圆盘自下而上逐层叠放',group:'planes',options:{variant:'disc-stack'},depth:adjustable(4)},
  {componentId:'graphic.stack',key:'hex-stack',name:'六边叠片',note:'六边轮廓保留分层侧缘',group:'planes',options:{variant:'hex-stack'},depth:adjustable(3)},
  {componentId:'graphic.stack',key:'diamond-stack',name:'菱形叠片',note:'菱形面片沿竖向分层',group:'planes',options:{variant:'diamond-stack'},depth:adjustable(3)},
  {componentId:'graphic.stack',key:'frame-stack',name:'开放框叠层',note:'开放框内可透见后层',group:'planes',options:{variant:'frame-stack'},depth:adjustable(3)},
  {componentId:'graphic.stack',key:'grid-stack',name:'网格叠层',note:'网格平面叠放并保留格线',group:'planes',options:{variant:'grid-stack'},depth:adjustable(3)},
  {componentId:'graphic.stack',key:'exploded-stack',name:'分离展开叠层',note:'面片分离后以虚线保持对齐',group:'arrangements',options:{variant:'exploded-stack'},depth:adjustable(3)},
  {componentId:'graphic.stack',key:'fan-stack',name:'扇形展开叠层',note:'面片围绕同一支点展开',group:'arrangements',options:{variant:'fan-stack'},depth:adjustable(4)},
  {componentId:'graphic.stack',key:'pyramid-stack',name:'渐缩层叠',note:'层面从底座向上逐级缩小',group:'arrangements',options:{variant:'pyramid-stack'},depth:adjustable(4)},
  {componentId:'graphic.stack',key:'sandwich-stack',name:'夹层叠层',note:'中间薄层在两侧边缘显露',group:'arrangements',options:{variant:'sandwich-stack'},depth:fixed(3)},
  {componentId:'graphic.stack',key:'twin-stack',name:'成组双叠层',note:'两组面片共用底部联结',group:'arrangements',options:{variant:'twin-stack'},depth:fixed(6,2)},
  {componentId:'graphic.stack',key:'window-stack',name:'开窗叠层',note:'正面窗口透见后层内容',group:'arrangements',options:{variant:'window-stack'},depth:fixed(3)},
].map(item=>Object.freeze({...item,options:Object.freeze(item.options)})));

const BY_KEY=new Map(STACK_VARIANTS.map(item=>[item.key,item]));

/** Native, editable layer symbols in a centered 288 x 120 design area.
 * planes contains one principal native surface/outline per physical layer.
 * A frame's four filled borders and inner outline remain in shapes, with
 * their shared plane-name prefix. No white cover hides the openings.
 */
export function drawStackVariant(slide,instanceId,bounds,options={}) {
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('Stack bounds require finite coordinates and positive dimensions');
  const key=options.variant??'rounded-sheets',spec=BY_KEY.get(key);
  if(!spec)throw new RangeError(`Unknown stack variant ${JSON.stringify(key)}`);
  const requested=options.depth;
  if(requested!==undefined&&(!Number.isInteger(requested)||requested<2||requested>6))throw new RangeError('Stack depth must be an integer from 2 to 6');
  const count=spec.depth.mode==='fixed'?spec.depth.layers:(requested??spec.depth.default);
  const scale=Math.min(w/288,h/120),ox=x+(w-288*scale)/2,oy=y+(h-120*scale)/2;
  const before=slide.shapes.items.length,planes=[];
  const fillFor=i=>i===0?gradient('#EDF5FD','#B8D3EF',90):gradient('#FAFCFF','#D6E5F6',90);
  function add(name,geometry,xx,yy,ww,hh,fill=C.bluePale,stroke=C.blueText,width=1.1,extra={}) {
    return shape(slide,`${instanceId}.${name}`,geometry,ox+xx*scale,oy+yy*scale,ww*scale,hh*scale,fill,stroke,width*scale,extra);
  }
  function surface(name,geometry,xx,yy,ww,hh,fill,extra={}) {
    const s=add(name,geometry,xx,yy,ww,hh,fill,C.blueText,1.1,extra);planes.push(s);return s;
  }
  function path(name,points,fill='none',stroke=C.blueText,width=1.1,closed=true) {
    const minx=Math.min(...points.map(p=>p[0])),miny=Math.min(...points.map(p=>p[1]));
    const pw=Math.max(.001,Math.max(...points.map(p=>p[0]))-minx),ph=Math.max(.001,Math.max(...points.map(p=>p[1]))-miny);
    const local=points.map(([px,py])=>({x:(px-minx)*scale,y:(py-miny)*scale}));
    const commands=[{moveTo:local[0]},...local.slice(1).map(point=>({lineTo:point})),...(closed?[{close:{}}]:[])];
    return add(name,'custom',minx,miny,pw,ph,fill,stroke,width,{customPaths:[{width:pw*scale,height:ph*scale,commands}]});
  }
  function polygon(name,points,fill) {
    const s=path(name,points,fill);planes.push(s);return s;
  }
  function segment(name,x1,y1,x2,y2,stroke=C.border,width=1,dashed=false) {
    const s=path(name,[[x1,y1],[x2,y2]],'none',stroke,width,false);
    if(dashed)s.line={fill:stroke,width:width*scale,style:'dashed'};
    return s;
  }
  function frame(name,xx,yy,ww,hh,thickness,fill) {
    add(`${name}.top`,'rect',xx,yy,ww,thickness,fill,'none',0);
    add(`${name}.bottom`,'rect',xx,yy+hh-thickness,ww,thickness,fill,'none',0);
    add(`${name}.left`,'rect',xx,yy+thickness,thickness,hh-2*thickness,fill,'none',0);
    add(`${name}.right`,'rect',xx+ww-thickness,yy+thickness,thickness,hh-2*thickness,fill,'none',0);
    const outer=surface(`${name}.outer`,'rect',xx,yy,ww,hh,'none');
    add(`${name}.inner`,'rect',xx+thickness,yy+thickness,ww-2*thickness,hh-2*thickness,'none');
    return outer;
  }
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];

  if(key==='rounded-sheets') {
    for(let i=count-1;i>=0;i--)surface(`plane${i}`,'roundRect',56+i*46/(count-1),40-i*30/(count-1),138,68,fillFor(i),{borderRadius:9*scale});
  } else if(key==='disc-stack') {
    const step=54/Math.max(3,count-1),top=(120-44-step*(count-1))/2;
    for(let i=count-1;i>=0;i--)surface(`plane${i}`,'ellipse',54,top+i*step,180,44,fillFor(i));
  } else if(key==='hex-stack') {
    for(let i=count-1;i>=0;i--) {
      const xx=60+i*38/(count-1),yy=42-i*32/(count-1);
      polygon(`plane${i}`,[[xx+27,yy],[xx+127,yy],[xx+154,yy+33],[xx+127,yy+66],[xx+27,yy+66],[xx,yy+33]],fillFor(i));
    }
  } else if(key==='diamond-stack') {
    const step=48/Math.max(2,count-1),top=(120-50-step*(count-1))/2;
    for(let i=count-1;i>=0;i--)surface(`plane${i}`,'diamond',51,top+i*step,186,50,fillFor(i));
  } else if(key==='frame-stack') {
    for(let i=count-1;i>=0;i--)frame(`plane${i}`,60+i*38/(count-1),38-i*30/(count-1),150,72,7,fillFor(i));
  } else if(key==='grid-stack') {
    for(let i=count-1;i>=0;i--) {
      const dx=i*24/(count-1),dy=-i*28/(count-1),p=[[37+dx,47+dy],[188+dx,47+dy],[231+dx,106+dy],[80+dx,106+dy]];
      polygon(`plane${i}`,p,fillFor(i));
      for(let c=1;c<4;c++) {
        const a=lerp(p[0],p[1],c/4),b=lerp(p[3],p[2],c/4);
        segment(`plane${i}.column${c}`,...a,...b,C.blueText,.7);
      }
      const a=lerp(p[0],p[3],.5),b=lerp(p[1],p[2],.5);
      segment(`plane${i}.row`,...a,...b,C.blueText,.7);
    }
  } else if(key==='exploded-stack') {
    const planeH=Math.min(24,76/count),step=(108-planeH)/(count-1);
    for(const [corner,cx,cy] of [['left',54,6],['right',206,6],['lowerLeft',82,6+planeH],['lowerRight',234,6+planeH]])segment(`alignment.${corner}`,cx,cy,cx,cy+step*(count-1),C.border,1,true);
    for(let i=count-1;i>=0;i--) {
      const yy=6+i*step;
      polygon(`plane${i}`,[[54,yy],[206,yy],[234,yy+planeH],[82,yy+planeH]],fillFor(i));
    }
  } else if(key==='fan-stack') {
    for(let i=0;i<count;i++) {
      const angle=(-27+54*i/(count-1))*Math.PI/180;
      const p=[[-72,-44],[72,-44],[72,0],[-72,0]].map(([px,py])=>[144+px*Math.cos(angle)-py*Math.sin(angle),78+px*Math.sin(angle)+py*Math.cos(angle)]);
      polygon(`plane${i}`,p,fillFor(count-1-i));
    }
    add('pivot','ellipse',141.5,75.5,5,5,C.blue,'none',0);
  } else if(key==='pyramid-stack') {
    for(let i=count-1;i>=0;i--) {
      const ww=84+132*i/(count-1),xx=144-ww/2,yy=12+i*96/count,hh=96/count+1;
      polygon(`plane${i}`,[[xx+8,yy],[xx+ww-8,yy],[xx+ww,yy+hh],[xx,yy+hh]],fillFor(i));
    }
  } else if(key==='sandwich-stack') {
    surface('plane2','roundRect',46,70,196,36,fillFor(2),{borderRadius:5*scale});
    surface('plane1','rect',29,53,230,14,gradient('#C9E0F7',C.blue,90));
    surface('plane0','roundRect',46,14,196,36,fillFor(0),{borderRadius:5*scale});
  } else if(key==='twin-stack') {
    segment('group.left',76,87,76,100,C.blueText,1.1);
    segment('group.base',76,100,218,100,C.blueText,1.1);
    segment('group.right',218,87,218,100,C.blueText,1.1);
    for(const [group,gx] of [['left',22],['right',164]])for(let i=2;i>=0;i--)surface(`${group}.plane${i}`,'roundRect',gx+i*7,38-i*12,94,50,fillFor(i),{borderRadius:5*scale});
  } else if(key==='window-stack') {
    surface('plane2','rect',90,9,148,84,fillFor(2));
    surface('plane1','rect',70,20,148,84,fillFor(1));
    for(let i=0;i<3;i++)segment(`plane1.content${i}`,86,54+i*14,i===2?164:190,54+i*14,C.blueText,1.1);
    frame('plane0',50,34,168,78,14,fillFor(0));
  }
  return {
    id:instanceId,componentId:'graphic.stack',variant:key,group:spec.group,
    bounds:{x,y,w,h},planes,shapes:slide.shapes.items.slice(before),
    depth:{...spec.depth,requested:requested??null,actual:count},
  };
}
