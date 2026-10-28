import {C,FONT,shape,text,box,line} from './research-components.mjs';

export const LABEL_VARIANTS = Object.freeze([
  {key:'capsule',name:'胶囊标签',note:'两端为完整半圆',options:{variant:'capsule'}},
  {key:'clipped',name:'对角切角标签',note:'相对角采用斜切轮廓',options:{variant:'clipped'}},
  {key:'tab',name:'顶部页签标签',note:'顶部凸起形成页签',options:{variant:'tab'}},
  {key:'notched',name:'燕尾书签标签',note:'尾部为 V 形内凹缺口',options:{variant:'notched'}},
  {key:'ticket',name:'两侧内凹票签',note:'两侧采用半圆内凹缺口',options:{variant:'ticket'}},
  {key:'indexed',name:'双段编号标签',note:'编号与文字分为两个独立部分',options:{variant:'indexed'}},
  {key:'slanted',name:'平行四边形标签',note:'两侧采用同向斜边',batch:'outline',options:{variant:'slanted'}},
  {key:'hexagon',name:'六边形标签',note:'两侧对称收尖的六边轮廓',batch:'outline',options:{variant:'hexagon'}},
  {key:'double-notch',name:'双燕尾标签',note:'左右两端均为 V 形内凹',batch:'outline',options:{variant:'double-notch'}},
  {key:'flag-end',name:'旗形尖尾标签',note:'一侧平直，另一侧向外收尖',batch:'outline',options:{variant:'flag-end'}},
  {key:'outline-inset',name:'双层空心标签',note:'外框与内框共同围出文字区域',batch:'outline',options:{variant:'outline-inset'}},
  {key:'bottom-rule',name:'底线牌标签',note:'边框与独立底线组成牌面',batch:'outline',options:{variant:'bottom-rule'}},
  {key:'circle-index',name:'圆章编号标签',note:'圆形编号章与文字牌衔接',batch:'combined',options:{variant:'circle-index'}},
  {key:'side-tab',name:'侧凸耳标签',note:'侧边凸耳与主体连成整体',batch:'combined',options:{variant:'side-tab'}},
  {key:'stacked-label',name:'错位叠签',note:'两张平面标签错位叠放',batch:'combined',options:{variant:'stacked-label'}},
  {key:'bracket-label',name:'两侧括签',note:'开放的左右括线围出文字',batch:'combined',options:{variant:'bracket-label'}},
  {key:'split-caption',name:'上下双段标签',note:'主标签与补充文字上下分段',batch:'combined',options:{variant:'split-caption'}},
  {key:'folded-ribbon',name:'折翼缎带标签',note:'中央标签与两侧折翼组成轮廓',batch:'combined',options:{variant:'folded-ribbon'}},
].map(item=>Object.freeze(item)));

export const MESSAGE_VARIANTS = Object.freeze([
  {key:'title-band',name:'标题带信息框',note:'蓝色标题带与白色正文区',options:{variant:'title-band'}},
  {key:'hanging-title',name:'悬签标题信息框',note:'标题签悬挂在框体上边缘',options:{variant:'hanging-title'}},
  {key:'callout',name:'指向批注框',note:'底部带指向尾部',options:{variant:'callout'}},
  {key:'folded-corner',name:'折角注释框',note:'右上角带可编辑折角',options:{variant:'folded-corner'}},
  {key:'corner-index',name:'编号角标信息框',note:'左上角设置独立编号角标',options:{variant:'corner-index'}},
  {key:'open-bracket',name:'开放四角信息框',note:'开放边框只保留四角括注',options:{variant:'open-bracket'}},
  {key:'left-rail',name:'左侧色轨信息框',note:'窄色轨配合正文区内的标题',batch:'frame',options:{variant:'left-rail'}},
  {key:'side-heading',name:'左右分栏信息框',note:'横排标题与正文左右分区',batch:'frame',options:{variant:'side-heading'}},
  {key:'double-frame',name:'内外双框信息框',note:'内外边框形成两层留白',batch:'frame',options:{variant:'double-frame'}},
  {key:'stepped-header',name:'阶梯标题信息框',note:'标题区上缘采用阶梯轮廓',batch:'frame',options:{variant:'stepped-header'}},
  {key:'top-notch',name:'凹口标题信息框',note:'顶部凹口为标题留出独立空间',batch:'frame',options:{variant:'top-notch'}},
  {key:'bottom-caption',name:'底部标题条信息框',note:'正文在上，标题条在下',batch:'frame',options:{variant:'bottom-caption'}},
  {key:'side-callout',name:'侧签批注信息框',note:'独立指向标题签与正文框组合',batch:'structured',options:{variant:'side-callout'}},
  {key:'bracket-heading',name:'标题括线信息框',note:'标题由括线标识，下方单设正文框',batch:'structured',options:{variant:'bracket-heading'}},
  {key:'ruled-note',name:'横线笔记信息框',note:'分行文字与横线一一对应',batch:'structured',options:{variant:'ruled-note'}},
  {key:'split-body',name:'双正文分区信息框',note:'标题下方并列两个正文区域',batch:'structured',options:{variant:'split-body',label:'说明文字',secondaryLabel:'补充说明'}},
  {key:'number-disc',name:'圆章标题信息框',note:'圆形编号章与标题共同叠在边框上',batch:'structured',options:{variant:'number-disc'}},
  {key:'stacked-card',name:'背页层叠信息框',note:'正文页与背页保持错位间隔',batch:'structured',options:{variant:'stacked-card'}},
].map(item=>Object.freeze(item)));

function checkedBounds(bounds){
  const {x,y,w,h}=bounds??{};
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)throw new RangeError('A component requires finite x/y and positive w/h');
  return {x,y,w,h};
}
function context(slide,id,bounds){
  const b=checkedBounds(bounds),before=slide.shapes.items.length;
  return {...b,
    shape:(key,geometry,x,y,w,h,fill,stroke='none',width=0,extra={})=>shape(slide,`${id}.${key}`,geometry,x,y,w,h,fill,stroke,width,extra),
    box:(key,x,y,w,h,fill=C.white,stroke=C.border,width=1.3)=>box(slide,`${id}.${key}`,x,y,w,h,fill,stroke,width),
    text:(key,value,x,y,w,h,size=22,color=C.ink,bold=false,align='left')=>text(slide,`${id}.${key}`,value,x,y,w,h,size,color,bold,align),
    line:(key,x,y,w,h=0,color=C.border,width=1.3)=>line(slide,`${id}.${key}`,x,y,w,h,color,width),
    path(key,x,y,w,h,commands,fill,stroke='none',width=0){
      return shape(slide,`${id}.${key}`,'custom',x,y,w,h,fill,stroke,width,{customPaths:[{width:w,height:h,commands}]});
    },
    finish:extra=>({id,bounds:b,shapes:slide.shapes.items.slice(before),...extra}),
  };
}
function polygon(points){return [{moveTo:{x:points[0][0],y:points[0][1]}},...points.slice(1).map(([x,y])=>({lineTo:{x,y}})),{close:{}}];}

/** Editable label outlines. Direction or color changes do not add variants. */
export function drawLabelVariant(slide,id,bounds,options={}){
  const g=context(slide,id,bounds),{x,y,w,h}=g;
  const variant=options.variant??'capsule';
  if(!LABEL_VARIANTS.some(item=>item.key===variant))throw new RangeError(`Unknown label variant: ${variant}`);
  const label=options.label??'分类标签',number=String(options.number??'01');
  const color=options.accent?C.yellow:C.white;
  if(LABEL_VARIANTS.find(item=>item.key===variant).batch)return additionalLabel(g,variant,label,number,color,options);
  let labelBounds={x:x+16,y:y+5,w:w-32,h:h-10};
  if(variant==='capsule'){
    g.shape('body','roundRect',x,y,w,h,C.blue,'none',0,{borderRadius:h/2});
  }else if(variant==='clipped'){
    const cut=Math.min(22,h*.28,w*.12);
    g.path('body',x,y,w,h,polygon([[0,cut],[cut,0],[w,0],[w,h-cut],[w-cut,h],[0,h]]),C.blue);
  }else if(variant==='tab'){
    const top=h*.23,tabX=w*.12,tabW=w*.44;
    g.path('body',x,y,w,h,polygon([[0,top],[tabX,top],[tabX,0],[tabX+tabW,0],[tabX+tabW,top],[w,top],[w,h],[0,h]]),C.blue);
    labelBounds={x:x+16,y:y+top+3,w:w-32,h:h-top-6};
  }else if(variant==='notched'){
    const cut=Math.min(28,h*.35);
    g.path('body',x,y,w,h,polygon([[0,0],[w,0],[w-cut,h/2],[w,h],[0,h]]),C.blue);
    labelBounds={x:x+14,y:y+5,w:w-cut-24,h:h-10};
  }else if(variant==='ticket'){
    const r=Math.min(15,h*.23),m=h/2,k=.55228475;
    const commands=[{moveTo:{x:0,y:0}},{lineTo:{x:w,y:0}},{lineTo:{x:w,y:m-r}},
      {cubicBezTo:{x1:w-k*r,y1:m-r,x2:w-r,y2:m-k*r,x:w-r,y:m}},
      {cubicBezTo:{x1:w-r,y1:m+k*r,x2:w-k*r,y2:m+r,x:w,y:m+r}},
      {lineTo:{x:w,y:h}},{lineTo:{x:0,y:h}},{lineTo:{x:0,y:m+r}},
      {cubicBezTo:{x1:k*r,y1:m+r,x2:r,y2:m+k*r,x:r,y:m}},
      {cubicBezTo:{x1:r,y1:m-k*r,x2:k*r,y2:m-r,x:0,y:m-r}},{close:{}}];
    g.path('body',x,y,w,h,commands,C.blue);
    labelBounds={x:x+r+10,y:y+5,w:w-2*r-20,h:h-10};
  }else{
    const numberW=Math.min(h,w*.24),gap=Math.min(10,w*.04),labelX=x+numberW+gap;
    g.box('number-body',x,y,numberW,h,C.blue,'none',0);
    g.text('number',number,x+4,y+4,numberW-8,h-8,22,color,true,'center');
    g.box('label-body',labelX,y,w-numberW-gap,h,C.blue,'none',0);
    labelBounds={x:labelX+10,y:y+5,w:w-numberW-gap-20,h:h-10};
  }
  const labelShape=g.text('label',label,labelBounds.x,labelBounds.y,labelBounds.w,labelBounds.h,22,color,true,'center');
  return g.finish({variant,label:labelShape,labelBounds,font:FONT});
}

/** Editable message frames, with titles and body text kept in separate objects. */
export function drawMessageVariant(slide,id,bounds,options={}){
  const g=context(slide,id,bounds),{x,y,w,h}=g;
  const variant=options.variant??'title-band';
  if(!MESSAGE_VARIANTS.some(item=>item.key===variant))throw new RangeError(`Unknown message variant: ${variant}`);
  const title=options.title??'模块标题',label=options.label??'说明文字',number=String(options.number??'01');
  if(MESSAGE_VARIANTS.find(item=>item.key===variant).batch)return additionalMessage(g,variant,title,label,number,options);
  const inset=16,edge=1,fw=w-2,fh=h-2;
  let titleBounds={x:x+inset,y:y+9,w:w-2*inset,h:32};
  let bodyBounds={x:x+inset,y:y+55,w:w-2*inset,h:h-70};
  let titleColor=C.blueText;
  if(variant==='title-band'){
    const band=Math.min(42,h*.3);
    g.box('frame',x+edge,y+edge,fw,fh);
    g.box('band',x+edge,y+edge,fw,band,C.blue,'none',0);
    titleBounds={x:x+inset,y:y+5,w:w-2*inset,h:band-5};
    bodyBounds={x:x+inset,y:y+band+13,w:w-2*inset,h:h-band-29};
    titleColor=C.white;
  }else if(variant==='hanging-title'){
    const top=15,tagW=Math.min(180,w*.62),tagH=35;
    g.box('frame',x+edge,y+top,fw,h-top-edge);
    g.box('title-tag',x+inset,y+edge,tagW,tagH,C.blue,'none',0);
    titleBounds={x:x+inset+9,y:y+4,w:tagW-18,h:tagH-6};
    bodyBounds={x:x+inset,y:y+58,w:w-2*inset,h:h-74};
    titleColor=C.white;
  }else if(variant==='callout'){
    const tail=Math.min(20,h*.15),bottom=fh-tail;
    g.path('frame',x+edge,y+edge,fw,fh,polygon([[0,0],[fw,0],[fw,bottom],[fw*.29,bottom],[fw*.2,fh],[fw*.2,bottom],[0,bottom]]),C.white,C.border,1.3);
    g.line('divider',x+inset,y+45,w-2*inset);
    bodyBounds={x:x+inset,y:y+55,w:w-2*inset,h:h-tail-69};
  }else if(variant==='folded-corner'){
    const fold=Math.min(29,h*.23,w*.12);
    g.path('frame',x+edge,y+edge,fw,fh,polygon([[0,0],[fw-fold,0],[fw,fold],[fw,fh],[0,fh]]),C.white,C.border,1.3);
    g.path('fold',x+edge+fw-fold,y+edge,fold,fold,polygon([[0,0],[0,fold],[fold,fold]]),C.bluePale,C.border,1.3);
    titleBounds={x:x+inset,y:y+9,w:w-fold-inset*2,h:32};
  }else if(variant==='corner-index'){
    g.box('frame',x+edge,y+edge,fw,fh);
    const bw=Math.min(58,w*.2),bh=Math.min(42,h*.32),cut=12;
    g.path('corner',x+edge,y+edge,bw,bh,polygon([[0,0],[bw,0],[bw,bh-cut],[bw-cut,bh],[0,bh]]),C.blue);
    g.text('number',number,x+5,y+4,bw-16,bh-10,20,C.white,true,'center');
    titleBounds={x:x+bw+17,y:y+9,w:w-bw-33,h:32};
    bodyBounds={x:x+inset,y:y+58,w:w-2*inset,h:h-74};
  }else{
    const corner=Math.min(25,h*.2,w*.1),left=x+edge,right=x+w-edge,top=y+edge,bottom=y+h-edge;
    g.box('surface',left,top,fw,fh,C.bluePale,'none',0);
    for(const [key,xx,yy,ww,hh] of [
      ['tl-h',left,top,corner,0],['tl-v',left,top,0,corner],
      ['tr-h',right-corner,top,corner,0],['tr-v',right,top,0,corner],
      ['bl-h',left,bottom,corner,0],['bl-v',left,bottom-corner,0,corner],
      ['br-h',right-corner,bottom,corner,0],['br-v',right,bottom-corner,0,corner],
    ])g.line(key,xx,yy,ww,hh);
    bodyBounds={x:x+inset,y:y+58,w:w-2*inset,h:h-74};
  }
  const titleShape=g.text('title',title,titleBounds.x,titleBounds.y,titleBounds.w,titleBounds.h,22,titleColor,true);
  const bodyShape=g.text('label',label,bodyBounds.x,bodyBounds.y,bodyBounds.w,bodyBounds.h,20,C.ink,false);
  return g.finish({variant,title:titleShape,label:bodyShape,titleBounds,bodyBounds,font:FONT});
}

function additionalLabel(g,variant,label,number,color,options){
  const {x,y,w,h}=g;
  let labelBounds={x:x+18,y:y+5,w:w-36,h:h-10},labelColor=color;
  let secondaryShape;
  if(variant==='slanted'){
    const cut=Math.min(30,h*.36);
    g.path('body',x,y,w,h,polygon([[cut,0],[w,0],[w-cut,h],[0,h]]),C.blue);
    labelBounds={x:x+cut+10,y:y+5,w:w-2*cut-20,h:h-10};
  }else if(variant==='hexagon'){
    const cut=Math.min(34,h*.42);
    g.path('body',x,y,w,h,polygon([[cut,0],[w-cut,0],[w,h/2],[w-cut,h],[cut,h],[0,h/2]]),C.blue);
    labelBounds={x:x+cut+7,y:y+5,w:w-2*cut-14,h:h-10};
  }else if(variant==='double-notch'){
    const cut=Math.min(27,h*.34);
    g.path('body',x,y,w,h,polygon([[0,0],[w,0],[w-cut,h/2],[w,h],[0,h],[cut,h/2]]),C.blue);
    labelBounds={x:x+cut+10,y:y+5,w:w-2*cut-20,h:h-10};
  }else if(variant==='flag-end'){
    const cut=Math.min(36,h*.45);
    g.path('body',x,y,w,h,polygon([[0,0],[w-cut,0],[w,h/2],[w-cut,h],[0,h]]),C.blue);
    labelBounds={x:x+14,y:y+5,w:w-cut-24,h:h-10};
  }else if(variant==='outline-inset'){
    g.box('outer',x+1,y+1,w-2,h-2,C.white,C.blue,1.5);
    g.box('inner',x+8,y+8,w-16,h-16,C.white,C.blue,1.1);
    labelBounds={x:x+18,y:y+12,w:w-36,h:h-24};labelColor=C.blueDark;
  }else if(variant==='bottom-rule'){
    g.box('body',x+1,y+1,w-2,h-12,C.white,C.border,1.3);
    g.box('rule',x,y+h-6,w,6,C.blue,'none',0);
    labelBounds={x:x+15,y:y+4,w:w-30,h:h-19};labelColor=C.blueDark;
  }else if(variant==='circle-index'){
    const d=Math.min(h-2,w*.27),cy=y+(h-d)/2,start=x+d*.72;
    g.box('label-body',start,y+h*.15,w-d*.72-1,h*.7,C.white,C.blue,1.3);
    g.shape('disc','ellipse',x,cy,d,d,C.blue);
    g.text('number',number,x+4,cy+4,d-8,d-8,22,color,true,'center');
    labelBounds={x:x+d+8,y:y+h*.15+4,w:w-d-20,h:h*.7-8};labelColor=C.blueDark;
  }else if(variant==='side-tab'){
    const ear=Math.min(28,w*.12),top=h*.27,bottom=h*.73;
    g.path('body',x,y,w,h,polygon([[ear,0],[w,0],[w,h],[ear,h],[ear,bottom],[0,bottom],[0,top],[ear,top]]),C.blue);
    labelBounds={x:x+ear+12,y:y+5,w:w-ear-24,h:h-10};
  }else if(variant==='stacked-label'){
    const offset=Math.min(14,h*.2);
    g.box('back',x+offset,y+1,w-offset-1,h-offset-1,C.bluePale,C.blue,1.3);
    g.box('front',x,y+offset,w-offset,h-offset,C.blue,'none',0);
    labelBounds={x:x+14,y:y+offset+4,w:w-offset-28,h:h-offset-8};
  }else if(variant==='bracket-label'){
    const arm=Math.min(20,w*.09),edge=1.2;
    const commands=[{moveTo:{x:arm,y:0}},{lineTo:{x:0,y:0}},{lineTo:{x:0,y:h-2*edge}},{lineTo:{x:arm,y:h-2*edge}}];
    g.path('left-bracket',x+edge,y+edge,arm,h-2*edge,commands,'none',C.blue,1.8);
    g.path('right-bracket',x+w-arm-edge,y+edge,arm,h-2*edge,[{moveTo:{x:0,y:0}},{lineTo:{x:arm,y:0}},{lineTo:{x:arm,y:h-2*edge}},{lineTo:{x:0,y:h-2*edge}}],'none',C.blue,1.8);
    labelBounds={x:x+arm+12,y:y+5,w:w-2*arm-24,h:h-10};labelColor=C.blueDark;
  }else if(variant==='split-caption'){
    const top=h*.56;
    g.box('frame',x+1,y+1,w-2,h-2,C.white,C.blue,1.3);
    g.box('main-band',x,y,w,top,C.blue,'none',0);
    labelBounds={x:x+14,y:y+3,w:w-28,h:top-6};
    secondaryShape=g.text('secondary',options.secondaryLabel??'补充说明',x+14,y+top+3,w-28,h-top-7,20,C.blueDark,false,'center');
  }else{
    const wing=Math.min(42,w*.17),inset=Math.min(21,w*.085),lift=Math.min(15,h*.2),bodyH=h-lift;
    g.path('left-wing',x,y+lift,wing,h-lift,polygon([[0,0],[wing,0],[wing,h-lift],[0,h-lift],[12,(h-lift)/2]]),C.blue);
    g.path('right-wing',x+w-wing,y+lift,wing,h-lift,polygon([[0,0],[wing,0],[wing-12,(h-lift)/2],[wing,h-lift],[0,h-lift]]),C.blue);
    g.path('left-fold',x+inset,y+bodyH,wing-inset,lift,polygon([[0,0],[wing-inset,0],[wing-inset,lift]]),C.blueDark);
    g.path('right-fold',x+w-wing,y+bodyH,wing-inset,lift,polygon([[0,0],[wing-inset,0],[0,lift]]),C.blueDark);
    g.box('front',x+inset,y,w-2*inset,bodyH,C.blue,'none',0);
    labelBounds={x:x+inset+13,y:y+4,w:w-2*inset-26,h:bodyH-8};
  }
  const labelShape=g.text('label',label,labelBounds.x,labelBounds.y,labelBounds.w,labelBounds.h,22,labelColor,true,'center');
  return g.finish({variant,label:labelShape,secondaryLabel:secondaryShape,labelBounds,font:FONT});
}

function additionalMessage(g,variant,title,label,number,options){
  const {x,y,w,h}=g,edge=1,fw=w-2,fh=h-2;
  let titleBounds={x:x+16,y:y+9,w:w-32,h:32};
  let bodyBounds={x:x+16,y:y+55,w:w-32,h:h-71};
  let titleColor=C.blueText,titleValue=title,bodyShape,secondaryShape;
  if(variant==='left-rail'){
    const rail=Math.min(9,w*.04);
    g.box('frame',x+edge,y+edge,fw,fh);
    g.box('rail',x+edge,y+edge,rail,fh,C.blue,'none',0);
    titleBounds={x:x+rail+16,y:y+9,w:w-rail-32,h:32};
    bodyBounds={x:x+rail+16,y:y+55,w:w-rail-32,h:h-71};
  }else if(variant==='side-heading'){
    const split=Math.min(118,w*.35);
    g.box('frame',x+edge,y+edge,fw,fh);
    g.box('heading-pane',x+edge,y+edge,split,fh,C.bluePale,'none',0);
    g.line('divider',x+split+1,y+1,0,fh);
    titleBounds={x:x+10,y:y+15,w:split-18,h:h-30};
    bodyBounds={x:x+split+15,y:y+16,w:w-split-30,h:h-32};
  }else if(variant==='double-frame'){
    g.box('outer',x+1,y+1,fw,fh);
    g.box('inner',x+8,y+8,w-16,h-16,C.white,C.blueText,1.1);
    titleBounds={x:x+20,y:y+14,w:w-40,h:32};
    bodyBounds={x:x+20,y:y+59,w:w-40,h:h-78};
  }else if(variant==='stepped-header'){
    const band=Math.min(43,h*.32),step=Math.min(12,band*.3);
    g.box('frame',x+1,y+1,fw,fh);
    g.path('stepped-band',x+1,y+1,fw,band,polygon([[0,0],[fw*.57,0],[fw*.57,step],[fw,step],[fw,band],[0,band]]),C.blue);
    titleBounds={x:x+16,y:y+7,w:w*.53-16,h:band-10};titleColor=C.white;
    bodyBounds={x:x+16,y:y+band+13,w:w-32,h:h-band-29};
  }else if(variant==='top-notch'){
    const notchH=33,left=fw*.16,right=fw*.79;
    g.path('frame',x+1,y+1,fw,fh,polygon([[0,0],[left,0],[left,notchH],[right,notchH],[right,0],[fw,0],[fw,fh],[0,fh]]),C.white,C.border,1.3);
    titleBounds={x:x+left+9,y:y+2,w:right-left-16,h:notchH-4};
    bodyBounds={x:x+16,y:y+52,w:w-32,h:h-68};
  }else if(variant==='bottom-caption'){
    const band=Math.min(38,h*.29);
    g.box('frame',x+1,y+1,fw,fh);
    g.box('caption-band',x+1,y+h-band-1,fw,band,C.blue,'none',0);
    titleBounds={x:x+16,y:y+h-band+2,w:w-32,h:band-6};titleColor=C.white;
    bodyBounds={x:x+16,y:y+13,w:w-32,h:h-band-28};
  }else if(variant==='side-callout'){
    const tagW=Math.min(108,w*.33),tagH=Math.min(72,h*.56),tagY=y+(h-tagH)/2,point=16,bodyX=x+tagW+8;
    g.box('body-frame',bodyX,y+1,w-tagW-9,fh);
    g.path('title-sign',x,tagY,tagW,tagH,polygon([[0,0],[tagW-point,0],[tagW,tagH/2],[tagW-point,tagH],[0,tagH]]),C.blue);
    titleBounds={x:x+8,y:tagY+5,w:tagW-point-16,h:tagH-10};titleColor=C.white;
    titleValue=Array.from(title).map((character,index)=>character+(index%2===1?'\n':'')).join('').trimEnd();
    bodyBounds={x:bodyX+16,y:y+16,w:w-tagW-40,h:h-32};
  }else if(variant==='bracket-heading'){
    const arm=12,top=1,bh=35;
    g.box('body-frame',x+1,y+44,fw,h-45);
    g.path('left-bracket',x+14,y+top,arm,bh,[{moveTo:{x:arm,y:0}},{lineTo:{x:0,y:0}},{lineTo:{x:0,y:bh}},{lineTo:{x:arm,y:bh}}],'none',C.blue,1.5);
    g.path('right-bracket',x+w-26,y+top,arm,bh,[{moveTo:{x:0,y:0}},{lineTo:{x:arm,y:0}},{lineTo:{x:arm,y:bh}},{lineTo:{x:0,y:bh}}],'none',C.blue,1.5);
    titleBounds={x:x+35,y:y+2,w:w-70,h:32};
    bodyBounds={x:x+16,y:y+57,w:w-32,h:h-73};
  }else if(variant==='ruled-note'){
    g.box('frame',x+1,y+1,fw,fh);
    const values=String(label).split(/\r?\n/);
    const lineY=y+47,rowH=29;
    bodyBounds={x:x+16,y:lineY,w:w-32,h:rowH*2};
    bodyShape=g.text('label',values[0]??'',x+16,lineY,w-32,27,20,C.ink,false);
    secondaryShape=g.text('secondary',values[1]??options.secondaryLabel??'',x+16,lineY+rowH,w-32,27,20,C.ink,false);
    g.line('rule1',x+16,lineY+28,w-32);
    g.line('rule2',x+16,lineY+rowH+28,w-32);
  }else if(variant==='split-body'){
    g.box('frame',x+1,y+1,fw,fh);
    g.line('heading-rule',x+16,y+44,w-32);
    g.line('divider',x+w/2,y+54,0,h-68);
    bodyBounds={x:x+16,y:y+56,w:w/2-28,h:h-72};
    secondaryShape=g.text('secondary',options.secondaryLabel??'补充说明',x+w/2+14,y+56,w/2-30,h-72,20,C.ink,false);
  }else if(variant==='number-disc'){
    const d=46;
    g.box('frame',x+1,y+21,fw,h-22);
    g.shape('disc','ellipse',x+16,y,d,d,C.blue);
    g.text('number',number,x+20,y+4,d-8,d-8,20,C.white,true,'center');
    g.box('title-backplate',x+73,y+2,w-88,36,C.white,'none',0);
    titleBounds={x:x+77,y:y+4,w:w-93,h:32};
    bodyBounds={x:x+16,y:y+61,w:w-32,h:h-77};
  }else{
    const offset=12;
    g.box('back',x+offset,y+offset,w-offset-1,h-offset-1,C.bluePale,C.border,1.3);
    g.box('front',x+1,y+1,w-offset-2,h-offset-2,C.white,C.border,1.3);
    titleBounds={x:x+16,y:y+9,w:w-offset-31,h:32};
    bodyBounds={x:x+16,y:y+54,w:w-offset-31,h:h-offset-70};
  }
  const titleShape=g.text('title',titleValue,titleBounds.x,titleBounds.y,titleBounds.w,titleBounds.h,22,titleColor,true,variant==='side-callout'?'center':'left');
  if(!bodyShape)bodyShape=g.text('label',label,bodyBounds.x,bodyBounds.y,bodyBounds.w,bodyBounds.h,20,C.ink,false);
  return g.finish({variant,title:titleShape,label:bodyShape,secondaryLabel:secondaryShape,titleBounds,bodyBounds,font:FONT});
}
