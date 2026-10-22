// Single source for gallery authoring, navigation, catalog pages and footers.
export const GALLERY_PLAN = Object.freeze([
  {number:'2.1',title:'直线与缺口箭头',group:'straight',description:'箭头主体、尾部缺口与尖端轮廓形成不同造型，统一采用原有蓝色。'},
  {number:'2.2',title:'转弯与回转箭头',group:'turn',description:'直角、圆弧、折返和环形路径表达不同转向，保持相同的平面图形风格。'},
  {number:'2.3',title:'多向与标注箭头',group:'multi',description:'通过端点数量和标注区域区分造型，所有箭头均为原生可编辑图形。'},
  {number:'2.4',title:'左右渐变箭头',group:'gradient',description:'左浅右深与左深右浅保持同一蓝色，透明渐变示例叠放在浅灰底色上。'},
  {number:'3.1',title:'图标造型变体',group:'icons',description:'同一含义保留可辨识的图形特征，通过外轮廓和内部结构形成不同造型。'},
  {number:'3.2',title:'标签轮廓与组合',group:'labels',description:'胶囊、切角、页签、内凹与编号组合丰富标签轮廓，文字和尺寸可替换。'},
  {number:'3.3',title:'信息框结构变体',group:'messages',description:'标题带、悬挂标题、折角、编号与开放边界形成不同的信息框结构。'},
  {number:'3.4',title:'搜索、筛选与状态图标',group:'utility-icons',batch:'tools',description:'搜索、筛选、设置、确认与安全各提供两种造型，图形可独立缩放和编辑。'},
  {number:'3.5',title:'时间、资源与数据图标',group:'utility-icons',batch:'data',description:'时间、云端、文件夹、统计和芯片图标采用同一蓝白配色与灰蓝细框。'},
  {number:'3.6',title:'标签轮廓补充',group:'labels',batch:'outline',description:'斜边、多边形、双缺口、尖尾、内嵌边与底线形成六种标签轮廓。'},
  {number:'3.7',title:'标签组合补充',group:'labels',batch:'combined',description:'圆章、侧耳、叠签、括线、双段和折翼丰富标签组合，编号与文字可分别编辑。'},
  {number:'3.8',title:'信息框边界与标题',group:'messages',batch:'frame',description:'侧栏、分栏、双框、阶梯、凹口与底部标题条改变信息框的边界和标题位置。'},
  {number:'3.9',title:'信息框分区与组合',group:'messages',batch:'structured',description:'侧签批注、括线标题、横线笔记、双区正文、圆章与叠页形成不同的信息组织方式。'},
  {number:'4.1',title:'条件判断与选择',group:'flow',batch:'decision',description:'判断节点将流程分为互斥路径，条件标签说明各条分支的进入规则。'},
  {number:'4.2',title:'循环与反馈',group:'flow',batch:'loop',description:'前置判断与后置判断改变循环的执行顺序，回路线和退出路径分别标明。'},
  {number:'4.3',title:'并行与同步',group:'flow',batch:'synchronize',description:'同步条分开并行路径，并在后续步骤前汇合。分阶段并行增加中间同步点。'},
  {number:'4.4',title:'阶段关口与子流程',group:'flow',batch:'staged',description:'阶段边界、判断关口与展开的子流程表达不同层次的步骤组织。'},
  {number:'4.5',title:'跨泳道交接',group:'flow',batch:'swimlane',description:'泳道划分步骤归属，跨泳道连线表示交接与反馈，节点和连线可分别编辑。'},
  {number:'4.6',title:'异常补偿与退出',group:'flow',batch:'exception',description:'主流程保留连续路径，异常支路用于补偿重试或提前退出。'},
  {number:'5.1',title:'主次与侧栏布局',group:'layout',batch:'priority',description:'主内容、辅助说明与侧栏采用不同面积比例，形成明确的阅读主次。'},
  {number:'5.2',title:'图文与说明分区',group:'layout',batch:'media',description:'图表区与说明区分开排列，图注贴近对应图表，注释位置保持清楚。'},
  {number:'5.3',title:'矩阵与跨格组合',group:'layout',batch:'matrix',description:'跨行主区与共享维度标签组织矩阵内容，合并单元区分不同信息层级。'},
  {number:'5.4',title:'通栏与段落组合',group:'layout',batch:'bands',description:'通栏标题、分列正文与总结条组合，沿页面纵向形成分段阅读顺序。'},
  {number:'5.5',title:'嵌套与成组分区',group:'layout',batch:'nested',description:'外层分组先确定内容归属，内层再划分主区和辅助区。'},
  {number:'5.6',title:'对照与总结分区',group:'layout',batch:'comparison',description:'对照区共享问题、维度或结论，比较内容按位置对齐。'},
  {number:'6.1',title:'节点轮廓造型',group:'node-variant',batch:'contours',description:'多边形、曲面与文档轮廓区分不同节点，文字与外形保持独立可编辑。'},
  {number:'6.2',title:'节点分区与端口',group:'node-variant',batch:'compound',description:'边框、端口、字段与编号组成复合节点，保留清楚的文字空间和连接位置。'},
  {number:'6.3',title:'符号边框与内核',group:'symbol-variant',batch:'frames',description:'方框、多边框、双环与括线包围运算符号，轮廓和内部标记均可编辑。'},
  {number:'6.4',title:'符号组合结构',group:'symbol-variant',batch:'combinations',description:'输入、串联、成组与嵌套关系形成不同的符号组合，保持统一的蓝白配色。'},
  {number:'6.5',title:'叠层平面造型',group:'stack-variant',batch:'planes',description:'圆角、圆盘、多边形、开放边框与网格构成不同的叠层平面。'},
  {number:'6.6',title:'叠层排列与展开',group:'stack-variant',batch:'arrangements',description:'分离、扇形、渐缩、夹层、成组与开窗方式改变平面之间的组合关系。'},
  {number:'7.1',title:'单元格序列与组合',group:'cell-variant',batch:'sequences',description:'分段、阶梯、成对和多边格改变单元格的连接与排列，格内文字可独立编辑。'},
  {number:'7.2',title:'单元格分组与嵌套',group:'cell-variant',batch:'groups',description:'成组、围合、嵌套、十字与桥接关系形成不同格群，保留清楚的分组边界。'},
  {number:'7.3',title:'圆点排列方式',group:'dot-variant',batch:'arrangements',description:'交错、三角、环形、弧形与放射排列改变点位关系，圆点保持原生可编辑。'},
  {number:'7.4',title:'圆点分组与间距',group:'dot-variant',batch:'groups',description:'点簇、同心环、条带、波形与疏密变化组织点群，使用相同的蓝白配色。'},
  {number:'7.5',title:'复合单元格阵列',group:'cell-variant',batch:'cell-structures',description:'分带、跨格、留空、对角、括线与小面板丰富矩阵结构，单元格仍可分别编辑。'},
  {number:'7.6',title:'复合圆点阵列',group:'dot-variant',batch:'dot-structures',description:'边缘、斜向、六角、分块、变径和格点组合形成不同的圆点阵列结构。'},
  {number:'8.1',title:'折线与端口连接',group:'connection',batch:'routing',description:'错位折线与同侧绕行改变连接路径，连接端点附着于节点边界。'},
  {number:'8.2',title:'分级分流与公共干线',group:'connection',batch:'junction',description:'分级分流增加中间层级，公共干线通过多个接入点组织支路。'},
  {number:'8.3',title:'局部与双路跨接',group:'connection',batch:'forward',description:'跨接路径越过局部节点，双路跨接采用不同方向的绕行空间。'},
  {number:'8.4',title:'嵌套反馈与分支回接',group:'connection',batch:'returns',description:'反馈线分别返回不同节点，内外回路和支路方向保持清楚。'},
  {number:'8.5',title:'稀疏与分组层间连接',group:'connection',batch:'selection',description:'稀疏连接只保留部分邻域关系，分组连接限定各组的连接范围。'},
  {number:'8.6',title:'跨层跳接与双向连接',group:'connection',batch:'cross-layer',description:'跨层路径越过中间层，双向连接分别显示前向传递和回向路径。'}
].map(item=>Object.freeze(item)));

export const SECTION_TITLES = Object.freeze(['视觉基础与页面结构','箭头与关系连接','图标、标签与信息框','流程图组件','版式组件与内容分区','节点、符号与叠层平面','单元格与圆点阵列','连接补充与层间连接']);

const EXPECTED_SUBSECTION_COUNTS=Object.freeze([0,4,9,6,6,6,6,6]);

function validateManifest() {
  if(SECTION_TITLES.length!==8||GALLERY_PLAN.length!==43)throw new Error("Expected eight sections and 43 gallery subsections");
  const seen=new Set(),counts=Array(8).fill(0);let previousSection=1;
  for(const item of GALLERY_PLAN) {
    const match=/^([1-8])\.([1-9]\d*)$/.exec(item.number);
    if(!match||seen.has(item.number))throw new Error("Invalid or repeated subsection number: "+item.number);
    const section=Number(match[1]),subsection=Number(match[2]);
    if(section<previousSection||subsection!==counts[section-1]+1)throw new Error("Subsections must be continuous and ordered: "+item.number);
    if(!item.title||!item.description||!item.group)throw new Error("Incomplete gallery item: "+item.number);
    seen.add(item.number);counts[section-1]++;previousSection=section;
  }
  if(counts.some((count,index)=>count!==EXPECTED_SUBSECTION_COUNTS[index]))throw new Error("Gallery subsection counts differ from the approved 43-page supplement");
  if(SECTION_TITLES.some(title=>typeof title!=="string"||!title))throw new Error("Every section requires a title");
}

/**
 * Map the approved eight-page base and 43 supplements into physical pages.
 * Navigation pages are independent of the eight content sections: section 1
 * ends on page 1 even when the contents and component index follow it.
 * Pass 0 to reproduce the original 51-page layout, or 1 for contents only.
 */
export function buildPageMap({indexPagesAfterFirst=2}={}) {
  if(!Number.isInteger(indexPagesAfterFirst)||indexPagesAfterFirst<0||indexPagesAfterFirst>2)throw new RangeError("indexPagesAfterFirst must be 0, 1, or 2");
  const sourcePageMap=new Map(),subsectionPageMap=new Map(),sections=[],pages=[];
  const navigation=[{number:"目录",title:"章节目录",kind:"contents"},{number:"索引",title:"组件索引",kind:"component-index"}];
  let slide=0;
  for(let section=1;section<=8;section++) {
    const number=String(section),title=SECTION_TITLES[section-1],introSlide=++slide;
    sourcePageMap.set(section,introSlide);
    pages.push({slide:introSlide,number,title,sectionTitle:title,kind:"intro"});
    if(section===1)for(const entry of navigation.slice(0,indexPagesAfterFirst))pages.push({slide:++slide,...entry,sectionTitle:entry.title});
    const subsections=[];
    for(const item of GALLERY_PLAN.filter(item=>Number(item.number.split(".")[0])===section)) {
      subsectionPageMap.set(item.number,++slide);
      subsections.push({number:item.number,title:item.title,slide});
      pages.push({slide,number:item.number,title:item.title,sectionTitle:title,kind:"subsection"});
    }
    sections.push({number,title,introSlide,endSlide:subsections.at(-1)?.slide??introSlide,subsections});
  }
  return {sourcePageMap,subsectionPageMap,sections,pages};
}

validateManifest();
const baseMap=buildPageMap({indexPagesAfterFirst:0}),indexedMap=buildPageMap();
if(baseMap.pages.length!==51||indexedMap.pages.length!==53||indexedMap.sections[0].endSlide!==1||indexedMap.sourcePageMap.get(2)!==4||indexedMap.subsectionPageMap.get("8.6")!==53)throw new Error("Gallery page mapping failed its approved-page invariants");
