import {C,BLUES} from './draw-helpers.mjs';
export const diagramsA={
  pyramid(d){
    const widths=[180,270,360,450],labels=['战略目标','关键能力','业务流程','数据基础'];
    widths.forEach((w,i)=>{d.trap('tier',370-w/2,26+i*78,w,65,(w-72)/w,1,BLUES[i]);d.tx(labels[i],370-w/2,37+i*78,w,42,25,i<2?C.white:C.ink,true);});
  },
  funnel(d){
    const y=[26,104,182,260],widths=[520,415,310,205],labels=['线索进入','资格判断','方案沟通','形成合作'];
    widths.forEach((w,i)=>{d.trap('stage',370-w/2,y[i],w,64,1,(w-85)/w,BLUES[i]);d.tx(labels[i],370-w/2,y[i]+11,w,40,25,i<2?C.white:C.ink,true);});
  },
  expansion(d){
    // Real relationships use attached connectors, so moving a node in the
    // editable deck keeps the network attached at its top/bottom ports.
    const nodes=[
      [295,20,'试点',C.blue,C.white],
      [170,132,'区域甲','#357BD2',C.white],[420,132,'区域乙','#357BD2',C.white],
      [70,244,'站点甲','#BDD5F1',C.ink],[295,244,'站点乙','#BDD5F1',C.ink],[520,244,'站点丙','#BDD5F1',C.ink]
    ];
    const shapes=nodes.map(([x,y,label,fill,ink])=>{const node=d.trap('replica',x,y,150,64,.8,1,fill);d.tx(label,x+5,y+11,140,42,26,ink,true);return node;});
    [[0,1],[0,2],[1,3],[1,4],[2,5]].forEach(([from,to])=>d.connect('copyLink',shapes[from],shapes[to],C.blue,2));
    d.tx('从一个试点向多个站点复制',65,335,610,32,24,C.muted);
  },
  hourglass(d){
    d.trap('upper',140,26,460,135,1,.27,C.blue);d.trap('lower',140,177,460,135,.27,1,'#74A5E1');
    d.tx('广泛收集',150,39,440,42,28,C.white,true);d.tx('筛选',290,113,160,36,24,C.white,true);
    d.rect('principleInterface',283,151,174,43,C.white,C.blue,1.5);d.tx('共同原则',285,156,170,34,23,C.blueDark,true);d.tx('多种落地方案',150,250,440,45,28,C.ink,true);
    d.tx('先收敛，再展开',180,330,380,32,24,C.muted);
  },
  horizontal(d){
    d.poly('body',[[82,48],[600,136],[600,222],[82,310]],'#BDD5F1');
    d.poly('band',[[240,75],[420,106],[420,252],[240,283]],'#74A5E1');
    d.poly('core',[[420,106],[600,136],[600,222],[420,252]],C.blue);
    ['原始资料','问题整理','核心判断'].forEach((t,i)=>d.tx(t,70+i*176,146,170,66,25,i===2?C.white:C.ink,true));d.arrow('end',626,160,66,38);
    d.tx('横向收束',80,328,590,34,24,C.muted);
  },
  bowtie(d){
    d.poly('left',[[60,70],[315,145],[315,235],[60,310]],C.blue);
    d.poly('right',[[425,145],[680,70],[680,310],[425,235]],'#74A5E1');
    d.rect('center',315,145,110,90,C.white,C.blue,2);d.tx('接口',315,163,110,54,26,C.blueDark,true);
    d.tx('供应端',73,167,205,44,29,C.white,true);d.tx('使用端',462,167,205,44,29,C.blueDark,true);
    d.tx('多种来源通过一个接口连接多种用途',65,328,610,34,24,C.muted);
  },
  converge(d){
    d.poly('north',[[217,28],[523,28],[431,141],[309,141]],'#74A5E1');
    d.poly('south',[[309,239],[431,239],[523,352],[217,352]],'#BDD5F1');
    d.poly('west',[[44,80],[290,145],[290,235],[44,300]],C.blue);
    d.poly('east',[[450,145],[696,80],[696,300],[450,235]],'#357BD2');
    d.rect('hub',296,149,148,82,C.white,C.blue,2);d.tx('联合方案',296,168,148,43,25,C.blueDark,true);
    d.tx('研究',236,55,268,43,26,C.blueDark,true);d.tx('工程',75,167,170,43,26,C.white,true);d.tx('业务',493,167,170,43,26,C.white,true);d.tx('运营',236,282,268,43,26,C.blueDark,true);
  },
  radial(d){
    const labels=['观察','定义','构想','试验','评估','迭代'];
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,da=.42;d.poly('petal',[d.radial(370,190,90,a-da),d.radial(370,190,90,a+da),d.radial(370,190,170,a+da),d.radial(370,190,170,a-da)],BLUES[i%4]);const[x,y]=d.radial(370,190,133,a);d.tx(labels[i],x-52,y-21,104,42,24,i%4<2?C.white:C.ink,true);}
    d.ellipse('center',302,122,136,136,C.white,C.blue,1.5);d.tx('设计活动',308,163,124,54,24,C.blueDark,true);
  },
  cycle(d){
    d.poly('top',[[180,42],[560,42],[495,108],[245,108]],C.blue);
    d.poly('right',[[560,42],[560,338],[494,273],[494,109]],'#357BD2');
    d.poly('bottom',[[560,338],[180,338],[245,272],[495,272]],'#74A5E1');
    d.poly('left',[[180,338],[180,42],[246,107],[246,273]],'#BDD5F1');
    d.tx('计划',280,53,180,42,25,C.white,true);d.tx('执行',497,164,60,52,24,C.white,true);d.tx('检查',280,281,180,42,25,C.ink,true);d.tx('改进',183,164,60,52,24,C.ink,true);
    d.tx('持续优化',265,164,210,52,28,C.blueDark,true);
  },
  accordion(d){
    for(let i=0;i<5;i++){let x=60+i*124;d.poly('fold',[[x,83+(i%2)*37],[x+124,120-(i%2)*37],[x+124,273+(i%2)*37],[x,310-(i%2)*37]],i%2?C.blue:'#74A5E1');d.tx(['背景','问题','方法','证据','结论'][i],x+10,170,104,44,27,i%2?C.white:C.ink,true);}
    d.tx('沿折线展开的叙事',85,330,570,32,24,C.muted);
  },
  ribbon(d){
    const pts=[[[70,66],[590,66],[535,124],[125,124]],[[535,124],[590,66],[590,201],[535,258]],[[125,201],[590,201],[535,258],[70,258]],[[70,258],[125,201],[125,316],[70,365]]];
    pts.forEach((p,i)=>d.poly('ribbon',p,[C.blue,'#074A9B','#74A5E1','#357BD2'][i]));
    d.tx('识别问题',145,71,350,42,25,C.white,true);d.tx('提出假设',145,207,350,42,25,C.ink,true);d.tx('验证',64,270,73,55,22,C.white,true);
    d.tx('同一条带保持过程连续',170,323,470,36,24,C.muted);
  },
  steps(d){
    const ls=['准备','试点','扩展','稳定'];
    ls.forEach((t,i)=>{const x=50+i*166,y=220-i*48;d.trap('step',x,y,153,79,.73,1,BLUES[3-i]);d.tx(t,x+4,y+21,145,37,26,i>1?C.white:C.ink,true);if(i<3)d.line('link',x+142.6725,y+39.5,x+176.3275,y-8.5,C.border,2);});
    d.tx('阶段位置表达推进，斜边保持统一方向',42,330,650,34,24,C.muted);
  },
  road(d){
    d.trap('road',130,22,480,305,.22,1,'#BDD5F1');
    d.poly('lane',[[360,22],[380,22],[394,327],[346,327]],C.white);
    [85,155,245].forEach((y,i)=>d.rect('marker',364-i*3,y,12+i*6,22+i*10,C.blue));
    d.tx('目标',285,0,170,42,26,C.blueDark,true);d.tx('当下',260,332,220,38,27,C.blueDark,true);
    d.tx('远',130,72,90,35,23,C.muted);d.tx('近',72,285,90,35,23,C.muted);
  },
  lanes(d){
    const top=[280,340,400,460],bottom=[56,265,474,683];
    for(let i=0;i<3;i++){d.poly('lane',[[top[i]+4,45],[top[i+1]-4,45],[bottom[i+1]-10,319],[bottom[i]+10,319]],BLUES[i]);d.tx(['技术','交付','市场'][i],bottom[i]+12,250,184,44,26,i<2?C.white:C.ink,true);}
    d.tx('同一目标',264,2,212,38,27,C.blueDark,true);d.tx('三条工作线并行推进',120,336,500,34,24,C.muted);
  },
  gallery(d){
    d.poly('left',[[45,90],[219,132],[219,275],[45,317]],'#BDD5F1',C.blue,2);
    d.rect('front',260,70,220,268,C.blue);
    d.poly('right',[[521,132],[695,90],[695,317],[521,275]],'#BDD5F1',C.blue,2);
    d.tx('方案甲',55,180,154,45,26,C.blueDark,true);d.tx('方案乙',270,130,200,50,29,C.white,true);d.tx('当前关注',275,203,190,38,24,C.white);d.tx('方案丙',531,180,154,45,26,C.blueDark,true);
    d.line('floor',45,342,695,342,C.border,1);
  },
  layers(d){
    [2,1,0].forEach(i=>{const y=38+i*98;d.trap('sheet',125,y,490,88,.63,1,BLUES[i]);d.tx(['交互层','服务层','数据层'][i],200,y+26,340,39,26,i<2?C.white:C.ink,true);});
    [180,560].forEach(x=>d.line('guide',x,70,x,327,C.border,1,true));
    d.tx('层间留白表示相互独立',110,338,520,32,24,C.muted);
  },
  balance(d){
    d.trap('support',290,223,160,117,.35,1,C.blue);
    d.line('beam',95,92,645,92,C.blueDark,7);d.ellipse('pivot',351,73,38,38,C.blueDark);d.line('mast',370,101,370,228,C.blueDark,8);
    for(const [x,t]of [[75,'成本'],[455,'收益']]){d.line('slingLeft',x+20,92,x+20,220,C.blue,2);d.line('slingRight',x+190,92,x+190,220,C.blue,2);d.trap('pan',x,220,210,65,1,.64,'#BDD5F1',C.blue,1.5);d.tx(t,x,155,210,44,28,C.blueDark,true);}
    d.tx('两端使用相同尺度比较',110,343,520,32,24,C.muted);
  },
  splitLayout(d){
    d.poly('visual',[[25,35],[370,35],[300,340],[25,340]],C.blue);
    d.poly('textArea',[[395,35],[715,35],[715,340],[325,340]],C.bluePale);
    d.ellipse('subject',107,102,132,132,C.white);d.tx('案例',77,253,200,43,29,C.white,true);
    d.tx('核心观点',407,83,270,48,29,C.blueDark,true,'left');
    d.tx('斜向边界引导视线',389,159,294,39,24,C.ink,false,'left');d.tx('文字保持水平排列',372,214,306,39,24,C.ink,false,'left');d.tx('边界两侧保留空隙',357,269,321,39,24,C.ink,false,'left');
  },
  scope(d){
    d.trap('outer',80,35,580,290,.62,1,'#BDD5F1');d.trap('middle',165,105,410,220,.69,1,'#74A5E1');d.trap('inner',250,185,240,140,.68,1,C.blue);
    d.tx('行业范围',225,52,290,41,26,C.blueDark,true);d.tx('目标人群',240,121,260,42,26,C.blueDark,true);d.tx('当前项目',260,235,220,45,26,C.white,true);
    d.tx('嵌套关系由边界包含表示',105,338,530,32,24,C.muted);
  },
  modularBuilding(d){
    d.trap('roof',130,20,480,75,.7,1,C.blue);
    [[150,116,190,90],[400,116,190,90],[150,225,190,90],[400,225,190,90]].forEach(([x,y,w,h],i)=>{d.trap('module',x,y,w,h,.82,1,BLUES[i%3]);d.tx(['研究','产品','运营','服务'][i],x+10,y+22,w-20,45,26,i%3<2?C.white:C.ink,true);});
    d.rect('foundation',114,333,512,19,C.blueDark);d.tx('共同使命',230,36,280,40,27,C.white,true);
  }
};
