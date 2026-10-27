import {C,BLUES,scene} from './draw-helpers.mjs';

// A compact comparison has its own 550 × 180 coordinate layout. These are recomposed
// diagrams, not reduced copies of the former 744 × 382 single-case slides.
// The framed comparison uses 155 px of height: geometry and connection ports
// reflow vertically, while each label retains its original font and height.
// This preserves legibility when the standard 78 px summary strip is present.
export function compactScene(slide,x,y,prefix,height=180){
  if(!(height>0&&height<=180))throw new Error('Compact diagram height must be in (0, 180]');
  const scaleY=height/180,d=scene(slide,[x,y,740,380*scaleY],prefix),nativeText=d.tx;
  d.tx=(value,px,py,w,h,size=24,...style)=>nativeText(value,px,py+(h-h/scaleY)/2,w,h/scaleY,size/scaleY,...style);
  // In a framed page the generic scene's global sendToBack would put edges
  // below the white panel. Bring the five attached edges above that panel;
  // their endpoints stay in the gaps between node faces.
  const nativeConnect=d.connect;d.connect=(...args)=>{const edge=nativeConnect(...args);edge.bringToFront();return edge;};
  return d;
}
const T=(d,t,x,y,w,h=30,size=21,color=C.ink,bold=true)=>d.tx(t,x,y,w,h,size,color,bold);
const rotate=(points,cx,cy,a)=>points.map(([x,y])=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]);

export const compactDiagrams={
  pyramid(d){
    const widths=[160,230,300,370];
    widths.forEach((w,i)=>{d.trap('tier',275-w/2,i*44,w,37,(w-60)/w,1,BLUES[i]);T(d,['战略目标','关键能力','业务流程','数据基础'][i],275-w/2,i*44+3,w,30,21,i<2?C.white:C.ink);});
  },
  funnel(d){
    const widths=[400,328,256,184];
    widths.forEach((w,i)=>{d.trap('stage',275-w/2,i*44,w,37,1,(w-57)/w,BLUES[i]);T(d,['线索进入','资格判断','方案沟通','形成合作'][i],275-w/2,i*44+3,w,30,21,i<2?C.white:C.ink);});
  },
  expansion(d){
    const data=[[219,0,'试点',0],[117,66,'区域甲',1],[321,66,'区域乙',1],[38,136,'站点甲',3],[219,136,'站点乙',3],[400,136,'站点丙',3]];
    const nodes=data.map(([x,y,t,i])=>{const n=d.trap('replica',x,y,112,40,.8,1,BLUES[i]);T(d,t,x,y+5,112,30,20,i<2?C.white:C.ink);return n;});
    [[0,1],[0,2],[1,3],[1,4],[2,5]].forEach(([a,b])=>d.connect('copyLink',nodes[a],nodes[b],C.blue,1.7));
  },
  hourglass(d){
    d.trap('upper',99,0,352,75,1,.27,C.blue);d.trap('lower',99,99,352,75,.27,1,BLUES[2]);
    T(d,'广泛收集',100,5,350,31,23,C.white);T(d,'筛选',219,42,112,27,20,C.white);
    d.rect('interface',207,72,136,30,C.white,C.blue,1.3);T(d,'共同原则',207,72,136,30,20,C.blueDark);
    T(d,'多种落地方案',110,133,330,35,23);
  },
  horizontal(d){
    d.poly('body',[[34,10],[468,62],[468,116],[34,168]],BLUES[3]);
    d.poly('band',[[185,28],[324,45],[324,133],[185,150]],BLUES[2]);
    d.poly('core',[[324,45],[468,62],[468,116],[324,133]],C.blue);
    ['原始资料','问题整理','核心判断'].forEach((t,i)=>T(d,t,33+i*145,73,142,32,21,i===2?C.white:C.ink));d.arrow('result',485,73,52,32);
  },
  bowtie(d){
    d.poly('left',[[35,10],[234,58],[234,120],[35,168]],C.blue);d.poly('right',[[316,58],[515,10],[515,168],[316,120]],BLUES[2]);
    d.rect('center',234,58,82,62,C.white,C.blue,1.5);T(d,'接口',234,73,82,32,22,C.blueDark);
    T(d,'供应端',47,72,170,35,24,C.white);T(d,'使用端',332,72,170,35,24,C.blueDark);
  },
  converge(d){
    d.poly('north',[[173,0],[377,0],[324,55],[226,55]],BLUES[2]);d.poly('south',[[226,123],[324,123],[377,178],[173,178]],BLUES[3]);
    d.poly('west',[[35,30],[213,59],[213,119],[35,150]],C.blue);d.poly('east',[[337,59],[515,30],[515,150],[337,119]],BLUES[1]);
    d.rect('hub',222,65,106,48,C.white,C.blue,1.5);T(d,'联合方案',222,72,106,34,21,C.blueDark);
    T(d,'研究',180,7,190,32,22,C.blueDark);T(d,'工程',60,73,135,32,22,C.white);T(d,'业务',355,73,135,32,22,C.white);T(d,'运营',180,140,190,32,22,C.blueDark);
  },
  radial(d){
    const labels=['观察','定义','构想','试验','评估','迭代'];
    const point=(rx,ry,a)=>[275+rx*Math.cos(a),90+ry*Math.sin(a)];
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,da=.45;d.poly('petal',[point(98,44,a-da),point(98,44,a+da),point(196,88,a+da),point(196,88,a-da)],BLUES[i%4]);const[x,y]=point(147,66,a);T(d,labels[i],x-44,y-15,88,30,22,i%4<2?C.white:C.ink);}
    d.ellipse('center',193,53,164,74,C.white,C.blue,1.2);T(d,'设计活动',201,72,148,36,23,C.blueDark);
  },
  cycle(d){
    d.poly('top',[[135,0],[415,0],[370,43],[180,43]],C.blue);d.poly('right',[[415,0],[415,178],[370,135],[370,43]],BLUES[1]);
    d.poly('bottom',[[415,178],[135,178],[180,135],[370,135]],BLUES[2]);d.poly('left',[[135,178],[135,0],[180,43],[180,135]],BLUES[3]);
    T(d,'计划',195,5,160,31,21,C.white);T(d,'执行',371,70,43,37,20,C.white);T(d,'检查',195,140,160,31,21);T(d,'改进',136,70,43,37,20);T(d,'持续优化',191,71,168,37,24,C.blueDark);
  },
  accordion(d){
    for(let i=0;i<5;i++){const x=22+i*101;d.poly('fold',[[x,26+(i%2)*28],[x+101,54-(i%2)*28],[x+101,150+(i%2)*28],[x,178-(i%2)*28]],i%2?C.blue:BLUES[2]);T(d,['背景','问题','方法','证据','结论'][i],x+3,83,95,34,23,i%2?C.white:C.ink);}
  },
  ribbon(d){
    const pts=[[[65,9],[460,9],[414,48],[111,48]],[[414,48],[460,9],[460,105],[414,144]],[[111,105],[460,105],[414,144],[65,144]],[[65,144],[111,105],[111,179],[65,179]]];
    pts.forEach((p,i)=>d.poly('ribbon',p,[C.blue,C.blueDark,BLUES[2],BLUES[1]][i]));
    T(d,'识别问题',130,11,260,34,21,C.white);T(d,'提出假设',130,107,260,34,21);T(d,'验证',65,148,46,29,20,C.white);
  },
  steps(d){
    ['准备','试点','扩展','稳定'].forEach((t,i)=>{const x=14+i*133,y=124-i*37;d.trap('step',x,y,122,53,.73,1,BLUES[3-i]);T(d,t,x+4,y+10,114,34,23,i>1?C.white:C.ink);if(i<3)d.line('join',x+114,y+27,x+141,y-10,C.border,1.8);});
  },
  road(d){
    d.trap('road',140,22,320,143,.24,1,BLUES[3]);d.poly('lane',[[294,22],[306,22],[319,165],[281,165]],C.white);
    [54,90,132].forEach((y,i)=>d.rect('marker',296-i*2,y,8+i*4,12+i*4,C.blue));
    T(d,'目标',245,-5,110,29,22,C.blueDark);T(d,'当下',245,154,110,29,22,C.blueDark);T(d,'远',128,37,65,30,20,C.muted);T(d,'近',86,137,65,30,20,C.muted);
  },
  lanes(d){
    const top=[217,256,295,334],bottom=[35,195,355,515];
    for(let i=0;i<3;i++){d.poly('lane',[[top[i]+3,24],[top[i+1]-3,24],[bottom[i+1]-7,177],[bottom[i]+7,177]],BLUES[i]);T(d,['技术','交付','市场'][i],bottom[i]+12,132,136,34,22,i<2?C.white:C.ink);}
    T(d,'同一目标',198,-5,155,30,22,C.blueDark);
  },
  gallery(d){
    d.poly('left',[[20,29],[160,56],[160,143],[20,170]],BLUES[3],C.blue,1.4);d.rect('front',190,8,170,165,C.blue);d.poly('right',[[390,56],[530,29],[530,170],[390,143]],BLUES[3],C.blue,1.4);
    T(d,'方案甲',23,84,132,34,22,C.blueDark);T(d,'方案乙',196,41,158,36,24,C.white);T(d,'当前关注',196,103,158,31,20,C.white,false);T(d,'方案丙',394,84,132,34,22,C.blueDark);
  },
  layers(d){
    [2,1,0].forEach(i=>{const y=6+i*59;d.trap('sheet',92,y,366,51,.68,1,BLUES[i]);T(d,['交互层','服务层','数据层'][i],145,y+10,260,32,22,i<2?C.white:C.ink);});
    [130,420].forEach(x=>d.line('guide',x,27,x,174,C.border,1,true));
  },
  spotlight(d){
    d.trap('stage',42,156,466,20,.94,1,C.blueDark);d.ellipse('secondary.left',72,116,35,35,C.blueFade);d.ellipse('secondary.right',443,116,35,35,C.blueFade);
    d.trap('beam',110,39,330,119,.18,1,'#DDEBFA');d.ellipse('focus',239,100,72,72,C.white,C.blue,1.5);T(d,'焦点',242,119,66,33,23,C.blueDark);
    d.rect('mount',254,0,42,12,C.blueDark);d.trap('lamp',235,11,80,27,.84,.62,C.blue);d.line('leftRay',251,39,110,158,'#9BBFE9',1.1);d.line('rightRay',299,39,440,158,'#9BBFE9',1.1);
  },
  platform(d){
    d.trap('top',90,93,370,48,.7,1,BLUES[3],C.blue,1.2);d.trap('front',90,141,370,36,1,.91,C.blue);d.rect('result',197,2,156,114,C.blueDark);
    T(d,'项目成果',202,40,146,36,23,C.white);T(d,'公共支撑',151,143,248,31,21,C.white);
  },
  bridge(d){
    T(d,'现状',48,0,170,36,25,C.blueDark);T(d,'目标',332,0,170,36,25,C.blueDark);d.trap('pier.left',72,83,116,92,.65,1,BLUES[3],C.blue,1.2);d.trap('pier.right',362,83,116,92,.65,1,BLUES[3],C.blue,1.2);
    d.rect('deck',55,52,440,35,C.blue);T(d,'转化机制',167,52,216,35,22,C.white);T(d,'基础',83,116,94,33,22,C.blueDark);T(d,'支撑',373,116,94,33,22,C.blueDark);T(d,'能力建设',195,116,160,33,22,C.blueDark);d.line('ground',34,176,516,176,C.border,1.4);
  },
  arch(d){
    const cx=275,cy=169,outer=164,inner=103,gap=.015;
    for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/7+gap,b=Math.PI+(i+1)*Math.PI/7-gap;d.poly('stone',[d.radial(cx,cy,outer,a),d.radial(cx,cy,outer,b),d.radial(cx,cy,inner,b),d.radial(cx,cy,inner,a)],i===3?C.blue:BLUES[(i%3)+1],C.white,1.2);const[x,y]=d.radial(cx,cy,(outer+inner)/2,(a+b)/2);T(d,String(i+1),x-18,y-16,36,32,21,i===3?C.white:C.blueDark);}
    d.rect('leftBase',100,168,85,11,C.blueDark);d.rect('rightBase',365,168,85,11,C.blueDark);T(d,'共同目标',185,128,180,34,25,C.blueDark);
  },
  bag(d){
    d.ellipse('handle',217,0,116,112,'none',C.blueDark,8);d.trap('side',183,53,236,124,.98,.75,C.blueDark);d.trap('front',149,60,236,117,1,.8,C.blue);d.rect('fold',162,67,209,7,BLUES[1]);
    T(d,'资源包',182,85,170,43,30,C.white);d.line('rule',193,126,341,126,BLUES[3],1);T(d,'方法与工具',173,133,188,32,22,C.white,false);
  },
  book(d){
    d.poly('cover.left',[[45,21],[262,54],[262,169],[45,179]],C.blueDark);d.poly('cover.right',[[288,54],[505,21],[505,179],[288,169]],C.blueDark);
    d.poly('page.left',[[56,12],[262,47],[262,159],[56,170]],C.blueFade,C.blue,1.1);d.poly('page.right',[[288,47],[494,12],[494,170],[288,159]],C.white,C.blue,1.1);d.line('spine',275,48,275,168,C.blueDark,3);
    T(d,'问题',83,50,150,40,26,C.blueDark);T(d,'解释',317,50,150,40,26,C.blueDark);for(let i=0;i<3;i++){const y=113+i*18;d.line('leftText',82,y-5,237,y+1,C.border,1.5);d.line('rightText',313,y+1,468,y-5,C.border,1.5);}
  },
  balance(d){
    d.trap('support',223,119,104,60,.35,1,C.blue);d.line('beam',62,25,488,25,C.blueDark,4);d.ellipse('pivot',263,14,24,24,C.blueDark);d.line('mast',275,34,275,124,C.blueDark,5);
    for(const[x,t]of [[46,'成本'],[346,'收益']]){d.line('leftSling',x+15,25,x+15,124,C.blue,1.5);d.line('rightSling',x+143,25,x+143,124,C.blue,1.5);d.trap('pan',x,124,158,44,1,.64,BLUES[3],C.blue,1.2);T(d,t,x+15,74,128,36,25,C.blueDark);}
  },
  modularBuilding(d){
    d.trap('roof',93,0,364,39,.7,1,C.blue);T(d,'共同使命',165,3,220,32,22,C.white);
    [[108,53],[300,53],[108,115],[300,115]].forEach(([x,y],i)=>{d.trap('module',x,y,142,48,.84,1,BLUES[i%3]);T(d,['研究','产品','运营','服务'][i],x+5,y+7,132,34,23,i%3<2?C.white:C.ink);});d.rect('foundation',80,172,390,8,C.blueDark);
  },
  pinwheel(d){
    const base=[[0,0],[90,0],[90,53],[38,53]];
    for(let i=0;i<4;i++){const a=i*Math.PI/2;d.poly('blade',rotate(base,275,90,a),BLUES[i],C.white,1.5);const[[x,y]]=rotate([[64,26]],275,90,a);T(d,['研发','生产','交付','反馈'][i],x-24,y-15,48,30,21,i<2?C.white:C.blueDark);}
    d.ellipse('hub',254,69,42,42,C.white,C.blue,1.4);T(d,'协作',253,75,44,30,20,C.blueDark);
  },
  tessellation(d){
    const r=67,h=Math.sqrt(3)*r/2;
    [[174,59],[274.5,59+h],[375,59]].forEach(([x,y],i)=>{d.poly('hex.top',[[x-r/2,y-h],[x+r/2,y-h],[x+r,y],[x-r,y]],i===1?C.blue:BLUES[1],C.white,1.3);d.poly('hex.bottom',[[x-r,y],[x+r,y],[x+r/2,y+h],[x-r/2,y+h]],i===1?BLUES[2]:BLUES[3],C.white,1.3);T(d,['需求','方法','证据'][i],x-49,y-47,98,32,22,C.white);T(d,['边界','步骤','结论'][i],x-49,y+12,98,32,22,C.blueDark);});
  },
  scope(d){
    d.trap('outer',75,2,400,176,.64,1,BLUES[3]);d.trap('middle',138,52,274,126,.7,1,BLUES[2]);d.trap('inner',202,107,146,71,.7,1,C.blue);
    T(d,'行业范围',175,9,200,34,23,C.blueDark);T(d,'目标人群',175,62,200,34,23,C.blueDark);T(d,'当前项目',205,125,140,34,22,C.white);
  },
  shutters(d){
    T(d,'合拢',62,0,166,32,23,C.blueDark);T(d,'展开',345,0,166,32,23,C.blueDark);
    for(let i=0;i<4;i++)d.trap('closed',53+i*44,43,46,133,.82,1,BLUES[i],C.white,1.2);d.arrow('next',258,95,42,26,C.blueText);
    const base=[[0,-130],[38,-130],[18,0],[0,0]];[-.72,-.28,.22,.73].forEach((a,i)=>d.poly('open',rotate(base,419,177,a),BLUES[i],C.white,1.2));
  },
  splitLayout(d){
    d.poly('visual',[[20,5],[277,5],[225,178],[20,178]],C.blue);d.poly('explanation',[[297,5],[530,5],[530,178],[245,178]],C.bluePale);d.ellipse('subject',88,35,87,87,C.white);T(d,'案例',69,132,126,34,25,C.white);
    d.tx('核心观点',311,22,195,37,25,C.blueDark,true,'left');d.tx('斜边引导视线',298,75,208,32,21,C.ink,false,'left');d.tx('文字保持水平',286,119,220,32,21,C.ink,false,'left');
  },
  foldedCorner(d){
    d.rect('document',78,4,355,173,C.white,C.blue,1.3);d.poly('fold',[[433,4],[483,30],[483,151],[433,177]],BLUES[3],C.blue,1.3);d.line('crease',433,4,433,177,C.blue,1);
    d.tx('研究结论',103,20,295,40,27,C.blueDark,true,'left');d.tx('关键发现',103,77,295,32,22,C.ink,true,'left');[125,147].forEach((y,i)=>d.line('bodyLine',103,y,395-i*40,y,C.border,1.6));T(d,'补充',437,76,43,32,20,C.blueDark);
  },
  tabs(d){
    d.rect('content',22,57,506,121,C.white,C.blue,1.2);['背景','方法','结果','讨论'].forEach((t,i)=>{d.trap('tab',17+i*127,0,133,59,.78,1,i===1?C.blue:BLUES[3],C.white,1.4);T(d,t,24+i*127,14,119,32,23,i===1?C.white:C.blueDark);});
    d.tx('第二章：方法设计',54,79,442,39,27,C.blueDark,true,'left');d.tx('当前章节展开主要论证',54,131,442,32,22,C.ink,false,'left');
  },
  framePop(d){
    d.trap('outer',62,89,426,89,.82,1,C.blue);d.trap('inner',73,98,404,69,.82,1,C.blueFade);d.trap('landscape.left',101,131,144,31,.48,1,BLUES[3]);d.trap('landscape.right',346,119,99,43,.52,1,BLUES[2]);
    d.ellipse('subject',221,0,108,116,C.blueDark);T(d,'成果',229,36,92,38,27,C.white);T(d,'主体越过画框',159,132,232,34,22,C.blueDark);
  }
};
