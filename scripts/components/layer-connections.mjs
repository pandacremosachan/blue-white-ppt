import {C,FONT,shape,text} from './research-components.mjs';

export const LAYER_CONNECTION_VARIANTS = Object.freeze([
  ['layers-sparse','稀疏邻域连接','仅连接下一层的同位与相邻节点','selection'],
  ['layers-grouped','分组层间连接','上下两组独立连接，组间无连线','selection'],
  ['layers-skip','跨层跳接','跨过中间层，沿空白通道跳接','cross-layer'],
  ['layers-feedback','双向层间连接','正向对应连接与回向绕行分开','cross-layer'],
].map(([key,name,note,group])=>Object.freeze({componentId:'structure.layers',key,name,note,group,options:Object.freeze({variant:key})})));

const BY_KEY=new Map(LAYER_CONNECTION_VARIANTS.map(item=>[item.key,item]));

/** Editable neutral layer structures, fitted uniformly to a 540 x 350 box.
 * Every connector is attached at both ends. Routed connections use invisible
 * native anchors, with an arrow only on the final segment of that route.
 */
export function drawLayerConnection(slide,id,bounds,options={}) {
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('Layer bounds require finite coordinates and positive dimensions');
  if(typeof id!=='string'||!id)throw new TypeError('A layer instance id is required');
  const key=options.variant??'layers-sparse',spec=BY_KEY.get(key);
  if(!spec)throw new RangeError(`Unknown layer connection ${JSON.stringify(key)}`);
  if(options.componentId!==undefined&&options.componentId!=='structure.layers')throw new RangeError('Layer connections belong to structure.layers');
  const requestedDiameter=options.diameter??options.d??26;
  if(!Number.isFinite(requestedDiameter)||requestedDiameter<=0)throw new RangeError('Node diameter must be a positive finite number');
  const diameter=Math.min(requestedDiameter,32),scale=Math.min(w/540,h/350),ox=x+(w-540*scale)/2,oy=y+(h-350*scale)/2;
  const before=slide.shapes.items.length,layers=[],nodes=[],edges=[],anchors=[],titles=[],containers=[],connections=[];
  const position=(xx,yy,ww,hh)=>({left:ox+xx*scale,top:oy+yy*scale,width:ww*scale,height:hh*scale});
  const center=new Map();
  const gray=options.lineColor??'#A8BED2',blue=options.accentColor??C.blue;
  function container(name,xx,yy,ww,hh) {
    const p=position(xx,yy,ww,hh),s=shape(slide,`${id}.${name}`,'rect',p.left,p.top,p.width,p.height,'none',C.border,.85*scale,{line:{fill:C.border,width:.85*scale,style:'dashed'}});
    containers.push(s);return s;
  }
  function layer(xs,ys) {
    xs.forEach((cx,c)=>{
      const column=ys.map((cy,r)=>{
        const nodeKey=`layer${c}.node${r}`,p=position(cx-diameter/2,cy-diameter/2,diameter,diameter);
        const s=shape(slide,`${id}.${nodeKey}`,'ellipse',p.left,p.top,p.width,p.height,options.fill??C.bluePale,options.stroke??C.blue,1.3*scale);
        const value=options.labels?.[nodeKey]??(Array.isArray(options.labels?.[c])?options.labels[c][r]:options.labels?.[c*ys.length+r]);
        if(value!==undefined&&value!==null&&value!=='') {
          s.text=String(value);s.text.style={typeface:FONT,fontSize:Math.min(options.fontSize??13,diameter*.52)*scale,color:C.blueDark,alignment:'center',verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'square'};
        }
        center.set(s,{x:cx,y:cy,layer:c,row:r});nodes.push(s);return s;
      });
      const title=options.titles?.[c]??options.titles?.[`layer${c+1}`]??`层 ${c+1}`;
      titles.push(text(slide,`${id}.layer${c}.title`,String(title),ox+(cx-58)*scale,oy+312*scale,116*scale,26*scale,18*scale,C.blueText,false,'center'));
      layers.push(column);
    });
  }
  function edge(name,from,to,{fromSide='right',toSide='left',color=gray,width=1,arrow=false,dashed=false}={}) {
    const s=slide.shapes.connect(from,to,{kind:'straight',fromSide,toSide,
      line:{fill:color,width:width*scale,style:dashed?'dashed':'solid'},
      head:{type:'none'},tail:{type:arrow?'triangle':'none',width:'sm',length:'sm'}});
    s.name=`${id}.${name}`;s.bringToFront();edges.push(s);return s;
  }
  function anchor(name,xx,yy) {
    const p=position(xx-.05,yy-.05,.1,.1),s=shape(slide,`${id}.${name}`,'rect',p.left,p.top,p.width,p.height,'none','none',0);
    anchors.push(s);center.set(s,{x:xx,y:yy});return s;
  }
  function record(name,from,to,segments,kind,through=[]) {
    const a=center.get(from),b=center.get(to);
    connections.push({key:name,kind,fromLayer:a.layer,fromRow:a.row,toLayer:b.layer,toRow:b.row,segments,through:through.map(([px,py])=>({x:px,y:py}))});
  }
  function direct(name,from,to,extra={},kind='adjacent') {
    const segments=[edge(name,from,to,extra)];record(name,from,to,segments,kind);return segments;
  }
  function route(name,from,to,through,{fromSide,toSide,color=blue,width=1.3,dashed=false}={},kind='routed') {
    const middle=through.map(([px,py],i)=>anchor(`${name}.anchor${i}`,px,py)),chain=[from,...middle,to],segments=[];
    for(let i=0;i<chain.length-1;i++) {
      const a=center.get(chain[i]),b=center.get(chain[i+1]),dx=b.x-a.x,dy=b.y-a.y,horizontal=Math.abs(dx)>Math.abs(dy);
      segments.push(edge(`${name}.segment${i}`,chain[i],chain[i+1],{
        fromSide:i===0?fromSide:(horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top')),
        toSide:i===chain.length-2?toSide:(horizontal?(dx>=0?'left':'right'):(dy>=0?'top':'bottom')),
        color,width,dashed,arrow:i===chain.length-2,
      }));
    }
    record(name,from,to,segments,kind,through);return segments;
  }

  if(key==='layers-sparse'||key==='layers-grouped') {
    if(key==='layers-grouped') {
      container('group0.boundary',43,48,454,122);
      container('group1.boundary',43,184,454,122);
    }
    layer([78,270,462],[78,142,208,272]);
    for(let c=0;c<2;c++)for(let r=0;r<4;r++) {
      const targets=key==='layers-grouped'?[Math.floor(r/2)*2,Math.floor(r/2)*2+1]:[r,r===3?2:r+1];
      for(const target of targets)direct(`adjacent${c}.r${r}.to${target}`,layers[c][r],layers[c+1][target],{},key==='layers-grouped'?'within-group':'sparse-neighbor');
    }
  } else if(key==='layers-skip') {
    layer([60,200,340,480],[100,178,256]);
    for(let c=0;c<3;c++)for(let r=0;r<3;r++)direct(`forward${c}.r${r}`,layers[c][r],layers[c+1][r],{arrow:true},'adjacent-forward');
    route('skip.row0',layers[0][0],layers[2][0],[[60,58],[340,58]],{fromSide:'top',toSide:'top',dashed:true},'skip-forward');
    route('skip.row1',layers[0][1],layers[2][1],[[60,138],[340,138]],{fromSide:'top',toSide:'top',dashed:true},'skip-forward');
    route('skip.row2',layers[0][2],layers[2][2],[[60,296],[340,296]],{fromSide:'bottom',toSide:'bottom',dashed:true},'skip-forward');
  } else if(key==='layers-feedback') {
    layer([78,270,462],[84,174,264]);
    for(let c=0;c<2;c++)for(let r=0;r<3;r++)direct(`forward${c}.r${r}`,layers[c][r],layers[c+1][r],{arrow:true},'adjacent-forward');
    route('feedback1to0',layers[1][1],layers[0][1],[[270,216],[78,216]],{fromSide:'bottom',toSide:'bottom'},'adjacent-feedback');
    route('feedback2to1',layers[2][1],layers[1][1],[[462,132],[270,132]],{fromSide:'top',toSide:'top'},'adjacent-feedback');
  }
  // Connector creation affects native z-order; restore node and title surfaces.
  edges.forEach(s=>s.bringToFront());nodes.forEach(s=>s.bringToFront());titles.forEach(s=>s.bringToFront());
  return {id,componentId:'structure.layers',variant:key,group:spec.group,bounds:{x,y,w,h},
    designBounds:{x:ox,y:oy,w:540*scale,h:350*scale},logicalBounds:{x:0,y:0,w:540,h:350},
    layers,nodes,edges,anchors,titles,containers,connections,diameter,
    shapes:slide.shapes.items.slice(before)};
}
