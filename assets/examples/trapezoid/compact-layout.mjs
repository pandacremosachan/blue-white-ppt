import {C} from '../../../scripts/api.mjs';
import {scene,BLUES} from './draw-helpers.mjs';
import {compactScene,compactDiagrams} from './compact-diagrams.mjs';
import {setMorphIdentity} from './morph.mjs';
import {groups,cases} from './deck-content.mjs';

const comparisons=[
 '金字塔强调支撑；漏斗强调筛选；复制网络展开节点；沙漏先收敛再展开。',
 '通道组织横向处理；蝶形连接两端；四向汇聚突出成果；六瓣环列出主题构成。',
 '闭环围出整体；折页展开叙事；丝带保留折返路径；台阶强调相邻阶段。',
 '道路突出远端目标；跑道并列工作线；画廊选择当前焦点；层片分开系统层级。',
 '聚光灯集中注意；台座承托成果；桥梁跨越差距；拱石共同支撑目标。',
 '袋身容纳资源；书页对照内容；秤盘建立权衡基准；屋顶统合独立职责。',
 '风车围绕转轴协作；拼接形成模块；嵌套划定范围；百叶展示揭示前后的状态。',
 '斜切分开视觉与解释；折页区分主文与补充；页签定位章节；画框建立前后层次。'
];
const differences={
 pyramid:'支撑关系：下层基础承托上层目标',funnel:'筛选关系：同一对象沿阶段逐级减少',expansion:'复制关系：一个试点扩展为多个站点',hourglass:'双向结构：共同原则衔接收敛与展开',
 horizontal:'横向处理：由宽入口整理到窄出口',bowtie:'双端协同：不同来源与用途共享接口',converge:'联合产出：并列工作线向中心汇聚',radial:'主题构成：六项活动围绕共同主题',
 cycle:'整体组成：四片围合，中心保留共同目标',accordion:'连续叙事：相邻折面依次展开内容',ribbon:'路径连续：折返面连接相邻处理阶段',steps:'阶段推进：沿抬升位置依次到达落点',
 road:'单一路线：目标位于道路的远端',lanes:'并行路线：各条工作线朝向同一目标',gallery:'当前焦点：正视主方案，保留侧面比较',layers:'系统层级：同一视角下纵向分离层片',
 spotlight:'注意焦点：光束把视线引向当前对象',platform:'承托位置：台座区分成果与公共基础',bridge:'跨越差距：中间机制连接现状与目标',arch:'共同支撑：多个环节围出成果空间',
 bag:'资源容器：组合内容形成可交付的整体',book:'双页对照：围绕同一问题安排两组内容',balance:'比较基准：两端使用同一尺度讨论取舍',modularBuilding:'共同体系：使命覆盖模块，底座提供支撑',
 pinwheel:'并列驱动：各叶片围绕同一转轴协作',tessellation:'配对模块：两片合一，单元继续拼接',scope:'包含范围：内部项目属于外部集合',shutters:'逐步揭示：合拢与展开保持对象对应',
 splitLayout:'页面分区：视觉与解释沿斜边转接',foldedCorner:'主次分层：侧边折片承载补充材料',tabs:'章节位置：深色页签指认当前内容',framePop:'前后层次：重点对象越过透视画框'
};
const caseNote=c=>`${c.title}\n${c.lead}\n\n构图机制：${c.mechanism}\n适用内容：${c.use}\n变体与边界：${c.variant}\n\n参考方式：${c.relation??'本次提出的组合构图'}。`;

export function composeCompactDeck({p,tx,page,note,link,sources,sourceMap,manifest,casePages}){
 // 01. An opening guide replaces the former cover, index, geometry primer
 // and construction page. Detailed construction guidance lives in notes.
 {
  const s=page('梯形的 32 种 PPT 创意','以8组比较呈现32个可编辑构图，按内容关系选择梯形的开合方向与组合方式。','1');
  const panels=scene(s,[0,0,740,380],'guide.panels');
  panels.rect('geometry',48,194,650,490,C.white,C.border,1.2);panels.rect('selection',720,194,512,490,C.white,C.border,1.2);
  tx(s,'平行边决定开合',[70,216,585,38],27,C.blueText,true);
  const d=compactScene(s,65,282,'guide.geometry');
  d.trap('open',30,0,145,126,.42,1,C.blue);d.trap('close',222,0,145,126,1,.42,BLUES[2]);d.poly('channel',[[420,0],[565,37],[565,89],[420,126]],BLUES[3]);
  d.tx('展开',27,140,151,37,24,C.blueDark,true);d.tx('收束',219,140,151,37,24,C.blueDark,true);d.tx('横向汇流',401,140,181,37,24,C.blueDark,true);
  tx(s,'旋转、镜像与拼接，改变同一形状的阅读方向。',[70,504,585,72],24,C.ink,false,{verticalAlignment:'top'});
  tx(s,'图形面积和透视距离均为结构示意。',[70,622,585,33],21,C.muted);
  tx(s,'按内容关系选择',[748,216,445,38],27,C.blueText,true);
  groups.forEach((g,i)=>{
   const y=275+i*43;tx(s,g.name,[748,y,360,34],25,C.ink);tx(s,`${i+2} 页`,[1102,y,83,34],23,C.blueText,true,{align:'right'});
  });
  const ids=['S15'];note(s,'本册将原来的逐例展示归并为八组比较，完整保留32种构图。每个案例的构图机制、适用内容、变体和来源范围见该页备注。\n\n几何控制：平行边的长短控制开合，斜边提供方向线索。单个梯形可承担方向，也可作为面片参与折叠、拼接和透视。立体复合图还会用矩形、线段及其他四边形补足侧面。\n\n制作方法：先确定宽端与窄端分别代表什么，再统一同组图形的斜率与间距。需要精确轮廓时使用编辑顶点。先复制同一面片，再旋转、镜像或叠放；保留独立面片，只有确有需要时才合并。标签采用独立水平文本框，先缩短表达，再调整留白，避免正文随透视面倾斜。\n\n示意图的宽度、面积、距离和颜色默认不承担实际数量编码。若用于数量比较，必须明确编码方法并直接标注数字。调研日期：2026年10月26日。',ids);
  manifest.push({slide:1,chapterNumber:s._chapterNumber,kind:'guide',originalSlides:[1,2,3,36],source:'S15'});
 }
 // 02–09. Four native diagrams share a page. Each compact composition has
 // a short title, a full-size diagram and one explicit comparison cue.
 for(const[gIndex,g]of groups.entries()){
  const s=page(g.name,comparisons[gIndex],`2.${gIndex+1}`);
  const frames=scene(s,[0,0,740,380],`comparison.${gIndex}`);
  const records=[];
  g.keys.forEach((key,i)=>{
   const c=cases.find(c=>c.key===key),index=cases.indexOf(c),x=i%2?654:48,y=i<2?190:446;
   const frame=frames.rect('caseFrame',x,y,578,240,C.white,C.border,1.2);frame.name=`comparison.case-frame.${i+1}`;
   tx(s,String(index+1).padStart(2,'0'),[x+10,y+7,34,32],18,C.blueText,true);
   tx(s,c.title,[x+46,y+4,458,36],26,C.blueText,true);
   const credit=tx(s,c.source??'原创',[x+510,y+10,56,27],16,C.muted,false,{align:'right'});if(c.source)link(s,credit,sourceMap.get(c.source).url);
   compactDiagrams[key](compactScene(s,x+14,y+48,`case.${key}`,155));
   tx(s,differences[key],[x+15,y+209,548,27],20,C.ink);
   const record={key,title:c.title,source:c.source,relation:c.relation??'本次组合设计',originalSlide:index+4};records.push(record);
   casePages.push({key,slide:gIndex+2,chapterNumber:s._chapterNumber,position:i+1,originalSlide:index+4});
  });
  const groupCases=g.keys.map(key=>cases.find(c=>c.key===key)),ids=[...new Set(groupCases.map(c=>c.source).filter(Boolean))];
  note(s,`${g.name}\n${comparisons[gIndex]}\n\n${groupCases.map(c=>caseNote(c)+(c.source?`\n来源观察：${sourceMap.get(c.source).sourceObservation}`:'')).join('\n\n────────────────────\n\n')}\n\n本页各构图为结构与空间示意。图形面积、透视距离或颜色深浅不自动解释为真实数量。`,ids);
  manifest.push({slide:gIndex+2,chapterNumber:s._chapterNumber,kind:'comparison',group:g.name,keys:g.keys,cases:records});
 }
 // 10–11. Preserve a real two-slide native Morph; full notes explain the
 // identities and compatibility, while the page focuses on the states.
 for(let state=0;state<2;state++){
  const s=page('分组与层级的平滑变化','同一组三片梯形，改变底边长度后由等宽分组转为层级结构。','3');
  const panels=scene(s,[0,0,740,380],'morph.panels');
  const explanationFrame=panels.rect('explanation',48,190,330,494,C.white,C.border,1.2);explanationFrame.name='morph.panel.explanation';
  const diagramFrame=panels.rect('diagram',400,190,832,494,C.white,C.border,1.2);diagramFrame.name='morph.panel.diagram';
  tx(s,state?'状态 B\n层级结构':'状态 A\n等宽分组',[80,260,280,110],32,C.blueText,true);
  tx(s,'放映第 10–11 页\n观察底边宽度的变化',[80,405,280,91],25,C.ink);
  const d=scene(s,[0,0,740,380],`motion.${state}`),widths=state?[260,420,580]:[420,420,420];
  ['战略目标','业务流程','数据基础'].forEach((label,i)=>{
   const w=widths[i],y=238+i*126,top=state?(w-94)/w:.78;
   const shape=d.trap('plane',787-w/2,y,w,85,top,1,BLUES[i]);setMorphIdentity(shape,`trapezoid.level.${i}`);
   const text=d.tx(label,787-w/2+15,y+19,w-30,46,30,i<2?C.white:C.ink,true);setMorphIdentity(text,`trapezoid.label.${i}`);
  });
  note(s,`平滑演示状态${state?'B':'A'}。保持三个四顶点梯形及其标签的身份，修改宽度和顶点位置。形状与标签分别使用以!!开头的稳定名称。状态B包含原生Morph转场，持续1.6秒。Microsoft 365或支持平滑的桌面PowerPoint可播放；其他查看器可能以兼容淡化呈现。\n\n构图变体：对象保持对应时，可改变宽度、位置和顶点。复杂路径可增加中间状态。运动结束后再阅读详细内容。`,['S16']);
  manifest.push({slide:state+10,chapterNumber:s._chapterNumber,kind:'morph',state:state?'B':'A',source:'S16',originalSlide:state+37});
 }
 // 12–13. Editable source titles carry native web links.
 const shortTitles=['梯形聚光灯','梯形购物袋','梯形折纸边角','梯形螺旋桨','梯形透视道路','透视地面','透视文字框','六梯形环绕','分段折纸','透视平台','桥梁隐喻','打开的书','梯形页签','分段漏斗','合并形状与编辑顶点','平滑转场与对象匹配'];
 for(let part=0;part<2;part++){
  const s=page('调研来源与延展','本册参考14个设计来源及2份微软说明。标题可点击；每例备注说明借鉴与延展的范围。',`4.${part+1}`);
  const panels=scene(s,[0,0,740,380],'sources.panels');
  const leftFrame=panels.rect('left',48,190,578,494,C.white,C.border,1.2);leftFrame.name='sources.panel.left';
  const rightFrame=panels.rect('right',654,190,578,494,C.white,C.border,1.2);rightFrame.name='sources.panel.right';
  for(let j=0;j<8;j++){
   const index=part*8+j,src=sources[index],col=Math.floor(j/4),row=j%4,x=70+col*609,y=212+row*112;
   const title=tx(s,`${src.id}　${shortTitles[index]}`,[x,y,530,40],25,C.blueText,true);link(s,title,src.url);
   tx(s,src.publisher,[x,y+42,530,28],19,C.ink);tx(s,new URL(src.url).hostname,[x,y+72,530,26],17,C.muted);
  }
  note(s,'来源页面用于构图机制调研。除明确标为官方操作说明外，不把旧教程的菜单名称当作当前版本操作要求。书本与桥梁来源提供隐喻，本册的梯形书页、桥墩与拱石均为重新设计。\n\n'+sources.slice(part*8,part*8+8).map(src=>`${src.id}：${src.sourceObservation}`).join('\n'),sources.slice(part*8,part*8+8).map(src=>src.id));
  manifest.push({slide:part+12,chapterNumber:s._chapterNumber,kind:'sources',ids:sources.slice(part*8,part*8+8).map(src=>src.id),originalSlide:part+39});
 }
 return {slideCount:13,morphTarget:11};
}
