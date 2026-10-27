import {C,BLUES} from './draw-helpers.mjs';

const rotate=(points,cx,cy,a)=>points.map(([x,y])=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]);

// These are original, editable constructions. Each major face is a trapezoid.
export const diagramsB={
  spotlight(d){
    d.trap('stage',65,300,610,34,.93,1,C.blueDark);
    d.ellipse('secondary.left',105,222,60,60,C.blueFade);
    d.ellipse('secondary.right',575,222,60,60,C.blueFade);
    d.trap('light.beam',145,78,450,225,.18,1,'#DDEBFA');
    d.ellipse('focus.disc',318,214,104,104,C.white,C.blue,2.5);
    d.tx('焦点',321,242,98,40,28,C.blueDark,true);
    d.rect('lamp.mount',341,12,58,20,C.blueDark);
    d.trap('lamp.body',310,30,120,47,.82,.62,C.blue);
    d.line('beam.left',329,78,145,303,'#9BBFE9',1.4);
    d.line('beam.right',411,78,595,303,'#9BBFE9',1.4);
    d.tx('聚焦当前问题',215,343,310,30,25,C.blueText,true);
  },

  arch(d){
    const cx=370,cy=310,outer=250,inner=163,gap=.014;
    for(let i=0;i<7;i++){
      const a=Math.PI+i*Math.PI/7+gap,b=Math.PI+(i+1)*Math.PI/7-gap;
      d.poly(`arch.block.${i}`,[d.radial(cx,cy,outer,a),d.radial(cx,cy,outer,b),d.radial(cx,cy,inner,b),d.radial(cx,cy,inner,a)],i===3?C.blue:BLUES[(i%3)+1],C.white,1.5);
      const m=(a+b)/2,[x,y]=d.radial(cx,cy,(outer+inner)/2,m);
      d.tx(String(i+1),x-26,y-20,52,40,27,i%3===0?C.white:C.blueDark,true);
    }
    d.rect('left.foundation',105,309,115,17,C.blueDark);
    d.rect('right.foundation',520,309,115,17,C.blueDark);
    d.tx('共同目标',250,241,240,46,32,C.blueDark,true);
    d.tx('多个支撑环节共同承重',130,342,480,30,24,C.blueText);
  },

  bag(d){
    d.ellipse('handle',285,15,170,180,'none',C.blueDark,13);
    d.trap('bag.side',233,99,342,238,.98,.75,C.blueDark);
    d.trap('bag.front',185,110,342,235,1,.8,C.blue);
    d.rect('bag.fold',204,122,304,11,'#357BD2');
    d.tx('资源包',235,173,242,58,38,C.white,true);
    d.tx('方法与工具',230,245,250,42,26,C.white);
    d.line('bag.rule',250,237,465,237,'#BDD5F1',1.5);
    d.tx('组合后形成可交付的整体',85,349,570,28,24,C.blueText);
  },

  book(d){
    d.poly('cover.left',[[63,74],[357,123],[357,319],[63,334]],C.blueDark);
    d.poly('cover.right',[[383,123],[677,74],[677,334],[383,319]],C.blueDark);
    d.poly('page.left',[[78,62],[357,112],[357,305],[78,319]],'#E5EFFA',C.blue,1.4);
    d.poly('page.right',[[383,112],[662,62],[662,319],[383,305]],C.white,C.blue,1.4);
    d.line('spine',370,114,370,318,C.blueDark,5);
    d.tx('问题',120,130,200,53,31,C.blueDark,true);
    d.tx('解释',419,130,200,53,31,C.blueDark,true);
    for(let i=0;i<4;i++){
      const y=209+i*23;
      d.line(`text.left.${i}`,111,y-9,323,y+1,C.border,2);
      d.line(`text.right.${i}`,417,y+1,629,y-9,C.border,2);
    }
    d.tx('两页内容围绕同一问题展开',115,344,510,30,24,C.blueText);
  },

  pinwheel(d){
    const cx=370,cy=190,base=[[0,0],[180,0],[180,90],[64,90]];
    const labels=['研发','生产','交付','反馈'];
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2;
      d.poly(`blade.${i}`,rotate(base,cx,cy,a),BLUES[i],C.white,2);
      const [[x,y]]=rotate([[120,45]],cx,cy,a);
      d.tx(labels[i],x-52,y-20,104,40,26,i<2?C.white:C.blueDark,true);
    }
    d.ellipse('hub',343,163,54,54,C.white,C.blue,2);
    d.tx('协作',342,173,56,33,22,C.blueDark,true);
  },

  tessellation(d){
    const r=105,h=Math.sqrt(3)*r/2;
    const centers=[[210,135],[367.5,135+h],[525,135]];
    centers.forEach(([x,y],i)=>{
      d.poly(`hex.${i}.top`,[[x-r/2,y-h],[x+r/2,y-h],[x+r,y],[x-r,y]],i===1?C.blue:BLUES[1],C.white,2);
      d.poly(`hex.${i}.bottom`,[[x-r,y],[x+r,y],[x+r/2,y+h],[x-r/2,y+h]],i===1?BLUES[2]:BLUES[3],C.white,2);
      d.tx(['需求','方法','证据'][i],x-78,y-h*.74,156,42,26,C.white,true);
      d.tx(['边界','步骤','结论'][i],x-78,y+h*.25,156,42,26,C.blueDark,true);
    });
    d.tx('两个梯形组成一块，模块可以继续拼接',58,342,624,32,23,C.blueText);
  },

  foldedCorner(d){
    d.rect('document',95,49,485,280,C.white,C.blue,1.8);
    d.poly('fold.edge',[[580,49],[650,89],[650,289],[580,329]],'#BDD5F1',C.blue,1.8);
    d.line('fold.crease',580,49,580,329,C.blue,1.5);
    d.tx('研究结论',130,83,400,55,34,C.blueDark,true,'left');
    d.tx('关键发现',130,162,400,40,26,C.ink,true,'left');
    d.line('line.1',130,224,525,224,C.border,2);
    d.line('line.2',130,254,470,254,C.border,2);
    d.line('line.3',130,284,505,284,C.border,2);
    d.tx('补充',586,162,57,40,22,C.blueDark,true);
    d.tx('主文与补充材料分层',105,345,530,30,24,C.blueText);
  },

  tabs(d){
    d.rect('content',25,117,690,213,C.white,C.blue,1.6);
    ['背景','方法','结果','讨论'].forEach((label,i)=>{
      d.trap(`tab.${i}`,20+i*170,27,180,92,.78,1,i===1?C.blue:BLUES[3],C.white,2);
      d.tx(label,33+i*170,53,154,42,28,i===1?C.white:C.blueDark,true);
    });
    d.tx('第二章：方法设计',70,156,600,56,34,C.blueDark,true,'left');
    d.tx('当前章节展开方法的主要论证',70,233,600,44,26,C.ink,false,'left');
    d.line('content.rule',70,292,610,292,C.border,1.2);
    d.tx('页签标示内容位置',110,347,520,30,24,C.blueText);
  },

  framePop(d){
    d.trap('frame.outer',78,151,584,187,.82,1,C.blue);
    d.trap('frame.inner',92,164,556,159,.82,1,'#E5EFFA');
    d.trap('landscape.left',132,240,200,72,.48,1,BLUES[3]);
    d.trap('landscape.right',416,220,162,92,.52,1,BLUES[2]);
    d.ellipse('subject',298,50,144,172,C.blueDark);
    d.tx('成果',310,108,120,50,32,C.white,true);
    d.tx('主体越过画框',194,270,352,42,28,C.blueDark,true);
    d.tx('梯形画框与出界主体的几何示意',70,347,600,30,24,C.blueText);
  },

  shutters(d){
    d.tx('合拢',90,22,225,43,28,C.blueDark,true);
    d.tx('展开',460,22,225,43,28,C.blueDark,true);
    for(let i=0;i<4;i++){
      d.trap(`closed.${i}`,65+i*60,96,62,207,.81,1,BLUES[i],C.white,2);
    }
    d.arrow('next',335,181,58,33,C.blueText);
    const base=[[0,-203],[54,-203],[25,0],[0,0]];
    [-.72,-.28,.22,.73].forEach((a,i)=>{
      d.poly(`open.${i}`,rotate(base,548,305,a),BLUES[i],C.white,2);
    });
    d.tx('逐片露出下一层内容',95,343,550,32,24,C.blueText);
  },

  platform(d){
    d.trap('platform.top',147,156,446,105,.69,1,'#BDD5F1',C.blue,1.5);
    d.trap('platform.front',147,261,446,72,1,.91,C.blue);
    d.rect('result.body',269,65,202,158,C.blueDark);
    d.tx('项目成果',280,108,180,53,32,C.white,true);
    d.tx('公共支撑',242,277,256,41,28,C.white,true);
    d.tx('台面承托对象，底座说明基础',65,347,610,30,24,C.blueText);
  },

  bridge(d){
    d.tx('现状',73,35,220,57,35,C.blueDark,true);
    d.tx('目标',447,35,220,57,35,C.blueDark,true);
    d.trap('pier.left',112,177,148,149,.65,1,'#BDD5F1',C.blue,1.4);
    d.trap('pier.right',480,177,148,149,.65,1,'#BDD5F1',C.blue,1.4);
    d.rect('deck',92,127,556,54,C.blue);
    d.tx('转化机制',230,134,280,41,29,C.white,true);
    d.tx('基础',130,230,110,44,27,C.blueDark,true);
    d.tx('支撑',500,230,110,44,27,C.blueDark,true);
    d.tx('能力建设',266,235,208,46,28,C.blueDark,true);
    d.line('ground',70,327,670,327,C.border,2);
    d.tx('跨越差距需要两端条件与中间机制',55,347,630,30,24,C.blueText);
  },
};
