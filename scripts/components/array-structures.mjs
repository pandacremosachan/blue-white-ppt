import {C,FONT,shape} from './research-components.mjs';

export const ARRAY_STRUCTURE_VARIANTS = Object.freeze([
  ['graphic.cells','cells-banded-matrix','分带混合格阵','通栏分带与短格共同组成矩阵','cell-structures'],
  ['graphic.cells','cells-merged-matrix','跨格主区矩阵','跨行跨列主格与周边小格并置','cell-structures'],
  ['graphic.cells','cells-sparse-matrix','规则稀疏格阵','按固定节律留出空位','cell-structures'],
  ['graphic.cells','cells-diagonal-matrix','阶梯斜带格阵','格阵沿对角线保留等宽带','cell-structures'],
  ['graphic.cells','cells-bracketed-groups','括线分组格阵','两组网格分别由外括线包围','cell-structures'],
  ['graphic.cells','cells-panel-array','三面板细格阵','独立标题带下各含细格','cell-structures'],
  ['graphic.dots','dots-hollow-matrix','空心边缘点阵','仅保留矩阵边缘的圆点','dot-structures'],
  ['graphic.dots','dots-diagonal-array','斜向平行点带','四条平行点带沿斜向展开','dot-structures'],
  ['graphic.dots','dots-hexagonal-array','六角簇点阵','蜂窝点位形成完整六角外形','dot-structures'],
  ['graphic.dots','dots-split-matrix','十字分缝点阵','矩阵由中央十字缝分成四块','dot-structures'],
  ['graphic.dots','dots-mixed-scale','渐径对齐点阵','圆点逐列增大而圆心保持对齐','dot-structures'],
  ['graphic.dots','dots-cell-overlay','格内复合点阵','各圆点分别置于独立淡色格内','dot-structures'],
].map(([componentId,key,name,note,group])=>Object.freeze({componentId,key,name,note,group,options:Object.freeze({variant:key})})));

const BY_KEY=new Map(ARRAY_STRUCTURE_VARIANTS.map(item=>[item.key,item]));

function cellLayout(key) {
  const cells=[],frames=[],brackets=[],headers=[];
  const cell=(key,x,y,w,h,row=0,col=0,group=0,band=false)=>cells.push({key,x,y,w,h,row,col,group,band});
  if(key==='cells-banded-matrix') {
    cell('full-band',12,8,264,22,0,0,0,true);
    for(let col=0;col<6;col++)cell(`middle.c${col}`,12+col*45,38,39,30,1,col);
    cell('lower-wide',12,76,124,34,2,0);
    for(let col=0;col<3;col++)cell(`lower.c${col+1}`,144+col*46,76,40,34,2,col+1);
  } else if(key==='cells-merged-matrix') {
    cell('merged-main',12,8,129,76.5,0,0);
    for(let row=0;row<3;row++)for(let col=3;col<6;col++)cell(`r${row}.c${col}`,12+col*45,8+row*27.5,39,21.5,row,col);
    for(let col=0;col<6;col++)cell(`r3.c${col}`,12+col*45,90.5,39,21.5,3,col);
  } else if(key==='cells-sparse-matrix'||key==='cells-diagonal-matrix') {
    for(let row=0;row<4;row++)for(let col=0;col<8;col++) {
      const keep=key==='cells-sparse-matrix'?(row+col)%3!==0:col>=row&&col<=row+4;
      if(keep)cell(`r${row}.c${col}`,12+col*33.75,12+row*25.5,27.75,19.5,row,col);
    }
  } else if(key==='cells-bracketed-groups') {
    for(let group=0;group<2;group++) {
      const gx=26+group*134;
      for(let row=0;row<3;row++)for(let col=0;col<4;col++)cell(`g${group}.r${row}.c${col}`,gx+col*26.5,24+row*26,22.5,20,row,col,group);
      brackets.push({key:`g${group}.left`,points:[[gx-4,18],[gx-12,18],[gx-12,102],[gx-4,102]]});
      brackets.push({key:`g${group}.right`,points:[[gx+106,18],[gx+114,18],[gx+114,102],[gx+106,102]]});
    }
  } else if(key==='cells-panel-array') {
    for(let group=0;group<3;group++) {
      const gx=10+group*94;
      frames.push({key:`panel${group}.frame`,x:gx,y:9,w:80,h:102});
      headers.push({key:`panel${group}.title`,x:gx,y:9,w:80,h:22,title:['A','B','C'][group],group});
      for(let row=0;row<3;row++)for(let col=0;col<4;col++)cell(`panel${group}.r${row}.c${col}`,gx+6+col*18,39+row*22,14,18,row,col,group);
    }
  }
  return {cells,frames,brackets,headers};
}

function dotLayout(key) {
  const dots=[],cells=[];
  const dot=(key,x,y,row,col,group=0,factor=1,cellSize=null)=>dots.push({key,x,y,row,col,group,factor,cellSize});
  if(key==='dots-hollow-matrix') {
    for(let row=0;row<5;row++)for(let col=0;col<11;col++)if(row===0||row===4||col===0||col===10)dot(`r${row}.c${col}`,34+col*22,16+row*22,row,col);
  } else if(key==='dots-diagonal-array') {
    for(let row=0;row<4;row++)for(let col=0;col<7;col++)dot(`band${row}.p${col}`,38+col*30+row*10,16+row*18+col*6,row,col,row);
  } else if(key==='dots-hexagonal-array') {
    for(let row=-3;row<=3;row++)for(let col=-3;col<=3;col++)if(Math.max(Math.abs(col),Math.abs(row),Math.abs(col+row))<=3)dot(`q${col}.r${row}`,144+18*(col+row/2),60+9*Math.sqrt(3)*row,row+3,col+3);
  } else if(key==='dots-split-matrix') {
    const xs=[35,55,75,95,115,173,193,213,233,253],ys=[21,41,79,99];
    for(let row=0;row<4;row++)for(let col=0;col<10;col++)dot(`r${row}.c${col}`,xs[col],ys[row],row,col,(row<2?0:2)+(col<5?0:1));
  } else if(key==='dots-mixed-scale') {
    for(let row=0;row<4;row++)for(let col=0;col<7;col++)dot(`r${row}.c${col}`,38+col*35,25+row*70/3,row,col,0,.5+.5*col/6);
  } else if(key==='dots-cell-overlay') {
    for(let row=0;row<3;row++)for(let col=0;col<6;col++) {
      const x=22+col*42,y=13+row*34,key=`r${row}.c${col}`;
      cells.push({key:`${key}.cell`,x,y,w:34,h:26,row,col,group:0});
      dot(key,x+17,y+13,row,col,0,1,26);
    }
  }
  return {dots,cells};
}

/**
 * All geometry is native and fitted uniformly to a 288 x 120 design box.
 * labels/colors accept arrays or stable keys; highlight accepts indices or
 * stable keys. diameter (alias d) uses design pixels and is capped to preserve
 * four-pixel gaps, margins, and the enclosing cells of the compound dot array.
 * cells/dots contain native shape references plus actual and logical bounds.
 */
export function drawArrayStructure(slide,id,bounds,options={}) {
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('Array bounds require finite coordinates and positive dimensions');
  if(typeof id!=='string'||!id)throw new TypeError('An array instance id is required');
  const key=options.variant??'cells-banded-matrix',spec=BY_KEY.get(key);
  if(!spec)throw new RangeError(`Unknown array structure ${JSON.stringify(key)}`);
  if(options.componentId!==undefined&&options.componentId!==spec.componentId)throw new RangeError(`Array ${key} belongs to ${spec.componentId}`);
  const scale=Math.min(w/288,h/120),ox=x+(w-288*scale)/2,oy=y+(h-120*scale)/2;
  const before=slide.shapes.items.length,cells=[],dots=[];
  const highlighted=new Set(Array.isArray(options.highlight)?options.highlight:options.highlight==null?[]:[options.highlight]);
  const isHi=(key,index)=>highlighted.has(key)||highlighted.has(index);
  const actual=b=>({x:ox+b.x*scale,y:oy+b.y*scale,w:b.w*scale,h:b.h*scale});
  const native=(name,geometry,b,fill,stroke=C.border,width=1)=>{
    const a=actual(b);return shape(slide,`${id}.${name}`,geometry,a.x,a.y,a.w,a.h,fill,stroke,width*scale);
  };
  function label(s,key,index,b,fill,color=null) {
    const value=options.labels?.[key]??options.labels?.[index];
    if(value===undefined||value===null||value==='')return;
    const chars=Math.max(1,[...String(value)].length),fontSize=options.fontSize??Math.min(16,b.h*.62,b.w*.7/chars);
    const dark=typeof fill==='string'&&/^#[0-9a-f]{6}$/i.test(fill)&&(.2126*parseInt(fill.slice(1,3),16)+.7152*parseInt(fill.slice(3,5),16)+.0722*parseInt(fill.slice(5,7),16))<145;
    s.text=String(value);s.text.style={typeface:FONT,fontSize:fontSize*scale,color:color??(dark?C.white:C.blueDark),alignment:'center',verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'square'};
  }
  function drawCell(cell,index,{compound=false}={}) {
    const hi=!compound&&isHi(cell.key,index),defaultFill=compound?C.bluePale:((options.filled||cell.band)?C.blue:C.bluePale);
    const fill=compound?(options.cellColors?.[cell.key]??options.cellColors?.[index]??defaultFill):(options.colors?.[cell.key]??options.colors?.[index]??(hi?(options.highlightColor??C.blue):defaultFill));
    const s=native(cell.key,'rect',cell,fill,hi?C.blue:(options.stroke??C.border),compound?.8:1);
    if(!compound)label(s,cell.key,index,cell,fill);
    const b={x:cell.x,y:cell.y,w:cell.w,h:cell.h};
    cells.push({shape:s,index,key:cell.key,row:cell.row,col:cell.col,group:cell.group,bounds:actual(b),logicalBounds:b,highlighted:hi});
  }
  let requestedDiameter=null,diameter=null;
  if(spec.componentId==='graphic.cells') {
    const layout=cellLayout(key);
    for(const frame of layout.frames)native(frame.key,'rect',frame,C.white);
    for(const head of layout.headers) {
      const s=native(head.key,'rect',head,C.blue,C.blue,1);
      s.text=String(options.panelTitles?.[head.group]??head.title);s.text.style={typeface:FONT,fontSize:13*scale,color:C.white,bold:true,alignment:'center',verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'square'};
    }
    for(const bracket of layout.brackets) {
      const minx=Math.min(...bracket.points.map(p=>p[0])),miny=Math.min(...bracket.points.map(p=>p[1])),maxx=Math.max(...bracket.points.map(p=>p[0])),maxy=Math.max(...bracket.points.map(p=>p[1]));
      const bw=maxx-minx,bh=maxy-miny,p=bracket.points.map(([px,py])=>({x:(px-minx)*scale,y:(py-miny)*scale}));
      const a=actual({x:minx,y:miny,w:bw,h:bh});
      shape(slide,`${id}.${bracket.key}`,'custom',a.x,a.y,a.w,a.h,'none',C.blueText,1.2*scale,{customPaths:[{width:a.w,height:a.h,commands:[{moveTo:p[0]},...p.slice(1).map(point=>({lineTo:point}))]}]});
    }
    layout.cells.forEach((cell,index)=>drawCell(cell,index));
  } else {
    const layout=dotLayout(key);
    requestedDiameter=options.diameter??options.d??(key==='dots-mixed-scale'?16:11);
    if(!Number.isFinite(requestedDiameter)||requestedDiameter<=0)throw new RangeError('Dot diameter must be a positive finite number');
    let maximum=Infinity;
    for(let i=0;i<layout.dots.length;i++) {
      const p=layout.dots[i],edge=Math.min(p.x,288-p.x,p.y,120-p.y);
      maximum=Math.min(maximum,2*(edge-4)/p.factor);
      if(p.cellSize)maximum=Math.min(maximum,(p.cellSize-8)/p.factor);
      for(let j=0;j<i;j++) {
        const q=layout.dots[j];maximum=Math.min(maximum,2*(Math.hypot(p.x-q.x,p.y-q.y)-4)/(p.factor+q.factor));
      }
    }
    diameter=Math.min(requestedDiameter,maximum);
    layout.cells.forEach((cell,index)=>drawCell(cell,index,{compound:true}));
    layout.dots.forEach((point,index)=>{
      const d=diameter*point.factor,b={x:point.x-d/2,y:point.y-d/2,w:d,h:d},hi=isHi(point.key,index);
      const color=options.color??C.blue,fill=options.colors?.[point.key]??options.colors?.[index]??(hi?(options.highlightColor??color):(options.fill??(options.filled?color:C.white)));
      const s=native(point.key,'ellipse',b,fill,options.stroke??color,1.1);
      label(s,point.key,index,b,fill);
      dots.push({shape:s,index,key:point.key,row:point.row,col:point.col,group:point.group,diameter:d,bounds:actual(b),logicalBounds:b,center:{x:ox+point.x*scale,y:oy+point.y*scale},highlighted:hi});
    });
  }
  return {id,componentId:spec.componentId,variant:key,group:spec.group,bounds:{x,y,w,h},
    logicalBounds:{x:0,y:0,w:288,h:120},designBounds:{x:ox,y:oy,w:288*scale,h:120*scale},
    shapes:slide.shapes.items.slice(before),cells,dots,requestedDiameter,diameter,renderedDiameter:diameter===null?null:diameter*scale};
}
