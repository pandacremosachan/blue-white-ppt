import * as P from './primitives.mjs';
import * as S from './structures.mjs';
import {ARROW_SHAPES} from './arrow-shapes.mjs';
import {ARROW_GRADIENTS} from './arrow-fills.mjs';
import {ICON_VARIANTS} from './icon-variants.mjs';
import {LABEL_VARIANTS,MESSAGE_VARIANTS} from './text-block-variants.mjs';
import {UTILITY_ICON_COMPONENTS,drawUtilityIcon} from './utility-icons.mjs';
import {CONTROL_FLOW_VARIANTS,drawControlFlow} from './control-flows.mjs';
import {GROUPED_FLOW_VARIANTS,drawGroupedFlow} from './grouped-flows.mjs';
import {LAYOUT_PRESETS} from './layout-presets.mjs';
import {NODE_VARIANTS} from './node-variants.mjs';
import {SYMBOL_VARIANTS} from './symbol-variants.mjs';
import {STACK_VARIANTS} from './stack-variants.mjs';
import {CELL_ARRAY_VARIANTS,DOT_ARRAY_VARIANTS} from './array-variants.mjs';
import {CONNECTION_VARIANTS} from './connection-variants.mjs';
export {STYLE,C,FONT} from './research-components.mjs';

// One registry entry per reusable visual structure. Variants do not create IDs.
export const COMPONENTS = [
  {id:'page.header',code:'C01',family:'标题与文字块',name:'编号渐变标题栏',renderer:P.drawHeader,parameters:{number:'一级节为1–8，小节为2.1等',title:'标题文字'},variants:[{name:'编号标题',options:{number:'1',title:'页面标题'}}]},
  {id:'block.message',code:'C02',family:'标题与文字块',name:'信息框',renderer:P.drawMessage,parameters:{variant:['lead','summary','banner',...MESSAGE_VARIANTS.map(item=>item.key)],title:'标题文字',label:'正文文字',secondaryLabel:'双区正文的第二段文字，可选',number:'角标编号',emphasis:'附加重点'},variants:[{name:'引导式',options:{variant:'lead',label:'说明文字'}},{name:'结论式',options:{variant:'summary',label:'结论文字'}},{name:'蓝底强调',options:{variant:'banner',label:'强调文字'}},...MESSAGE_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'block.label',code:'C03',family:'标题与文字块',name:'分类标签',renderer:P.drawLabel,parameters:{variant:LABEL_VARIANTS.map(item=>item.key),label:'文字',secondaryLabel:'上下双段标签的补充文字，可选',number:'组合标签编号',vertical:'纵排',accent:'黄字',round:'圆角'},variants:[{name:'横向白字',options:{label:'分类标签'}},{name:'纵向黄字',options:{label:'分类',vertical:true,accent:true,round:true}},...LABEL_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},geometry:true}))]},
  {id:'arrow.lead',code:'C04',family:'实体箭头',name:'双折引导箭头',renderer:P.drawLead,parameters:{box:'位置与尺寸'},variants:[{name:'双折造型',options:{}}]},
  {id:'arrow.block',code:'C05',family:'实体箭头',name:'实体箭头',renderer:P.drawBlockArrow,parameters:{shape:ARROW_SHAPES.map(item=>item.key),direction:['right','left','up','down'],rotation:[0,90,180,270],gradient:ARROW_GRADIENTS.map(item=>item.key),gradientAngle:'渐变角度，默认0为从左到右',label:'标注区文字，可选',outline:'空心',faded:'兼容旧的左浅右深渐变',adjustmentList:'原生形状比例调节，可选'},variants:[{name:'实心直箭头',options:{}},{name:'左浅右深',options:{gradient:'light-to-dark'}},{name:'空心向下',options:{direction:'down',outline:true}},...ARROW_SHAPES.filter(item=>item.key!=='rightArrow').map(item=>({name:item.name,options:{shape:item.key,...(item.options??{})},geometry:true})),...ARROW_GRADIENTS.filter(item=>item.key!=='light-to-dark').map(item=>({name:item.name,options:item.options,fill:true}))]},
  {id:'arrow.stages',code:'C06',family:'实体箭头',name:'阶段箭头链',renderer:P.drawStages,parameters:{labels:'阶段文字数组',active:'突出阶段下标'},variants:[{name:'三阶段',options:{labels:['阶段 1','阶段 2','阶段 3']}},{name:'四阶段',options:{labels:['1','2','3','4'],active:1}}]},
  {id:'connector.link',code:'C07',family:'连线与分支',name:'关系连线',renderer:P.drawLink,parameters:{variant:CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.link').map(item=>item.key),kind:['straight','elbow'],dashed:'虚线',both:'基础连线双箭头',arrow:'基础连线末端箭头',from:'源形状，可选',to:'目标形状，可选',fromSide:'源连接侧',toSide:'目标连接侧',labels:'变体节点文字对象'},variants:[{name:'实线',options:{}},{name:'虚线',options:{dashed:true}},{name:'双向',options:{both:true}},{name:'折线',options:{kind:'elbow'}},...CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.link').map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'connector.junction',code:'C08',family:'连线与分支',name:'分流与汇流',renderer:S.drawJunction,parameters:{variant:CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.junction').map(item=>item.key),direction:['split','merge'],count:'基础分支数 2–4',labels:'基础文字数组或变体节点文字对象'},variants:[{name:'二路分流',options:{direction:'split',count:2}},{name:'三路汇流',options:{direction:'merge',count:3}},...CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.junction').map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'connector.bypass',code:'C09',family:'连线与分支',name:'跨接与回路线',renderer:S.drawBypass,parameters:{variant:CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.bypass').map(item=>item.key),direction:['forward','return'],dashed:'基础回路线虚线',labels:'基础文字数组或变体节点文字对象'},variants:[{name:'前向跨接',options:{direction:'forward'}},{name:'反向回路',options:{direction:'return',dashed:true}},...CONNECTION_VARIANTS.filter(item=>item.componentId==='connector.bypass').map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  ...[['icon.question','C10','问题气泡',P.drawQuestion],['icon.info','C11','说明标记',P.drawInfo],['icon.document','C12','文档',P.drawDocument],['icon.database','C13','数据库',P.drawDatabase],['icon.target','C14','靶心',P.drawTarget]].map(([id,code,name,renderer])=>({id,code,family:'图标',name,renderer,parameters:{box:'位置与尺寸',variant:ICON_VARIANTS.filter(item=>item.componentId===id).map(item=>item.key)},variants:[{name:'原始造型',options:{}},...ICON_VARIANTS.filter(item=>item.componentId===id).map(item=>({name:item.name,options:{variant:item.key},geometry:true}))]})),
  {id:'block.node',code:'C15',family:'节点与图形',name:'基础节点',renderer:P.drawNode,parameters:{label:'文字',geometry:['rect','roundRect','ellipse','diamond'],variant:NODE_VARIANTS.map(item=>item.key),fields:'复合节点的短字段数组',number:'编号标记',fill:'填充',stroke:'边框',color:'字色',dashed:'虚线边框'},variants:[{name:'矩形',options:{label:'节点 A'}},{name:'圆角',options:{label:'节点 B',geometry:'roundRect'}},{name:'菱形',options:{label:'条件',geometry:'diamond'}},...NODE_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},geometry:true}))]},
  {id:'mark.operator',code:'C16',family:'节点与图形',name:'运算符号',renderer:P.drawOperator,parameters:{symbol:'任意短符号',accent:'红色强调',variant:SYMBOL_VARIANTS.map(item=>item.key)},variants:[{name:'加号',options:{symbol:'+'}},{name:'乘号',options:{symbol:'×'}},{name:'组合符号',options:{symbol:'⊕',accent:true}},...SYMBOL_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'graphic.stack',code:'C17',family:'节点与图形',name:'叠层平面',renderer:P.drawStack,parameters:{depth:'层数，造型变体受各自depth元数据约束',offset:'层间偏移',geometry:['parallelogram','rect'],variant:STACK_VARIANTS.map(item=>item.key)},variants:[{name:'三层平面',options:{depth:3}},{name:'五层平面',options:{depth:5}},{name:'矩形叠片',options:{depth:3,geometry:'rect'}},...STACK_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},structure:true,depth:item.depth}))]},
  {id:'graphic.cells',code:'C18',family:'阵列与排列',name:'单元格阵列',renderer:P.drawCells,parameters:{variant:CELL_ARRAY_VARIANTS.map(item=>item.key),rows:'基础网格行数',cols:'基础网格列数',gap:'基础网格间距',labels:'逐格文字数组或按逻辑key索引的对象',colors:'逐格颜色',highlight:'突出下标或逻辑key数组',filled:'填充'},variants:[{name:'带字序列',options:{rows:1,cols:5,labels:['A','B','C','D','E'],highlight:[0]}},{name:'色条',options:{rows:1,cols:10,filled:true}},{name:'网格',options:{rows:4,cols:4,highlight:[0,5,10,15],gap:0}},{name:'竖排',options:{rows:5,cols:1,filled:true}},...CELL_ARRAY_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'graphic.dots',code:'C19',family:'阵列与排列',name:'圆点阵列',renderer:P.drawDots,parameters:{variant:DOT_ARRAY_VARIANTS.map(item=>item.key),rows:'基础点阵行数',cols:'基础点阵列数',d:'圆点直径，造型变体按设计坐标缩放',filled:'实心',colors:'逐点颜色',highlight:'突出下标或逻辑key数组'},variants:[{name:'横排',options:{rows:1,cols:5}},{name:'竖排',options:{rows:4,cols:1}},{name:'点阵',options:{rows:3,cols:4,filled:true}},...DOT_ARRAY_VARIANTS.map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'structure.chain',code:'C20',family:'连接结构',name:'顺序链',renderer:S.drawChain,parameters:{direction:['horizontal','vertical'],labels:'节点文字数组'},variants:[{name:'横向',options:{labels:['A','B','C']}},{name:'纵向',options:{direction:'vertical',labels:['A','B','C']}}]},
  {id:'structure.parallel',code:'C21',family:'连接结构',name:'并行汇合结构',renderer:S.drawParallel,parameters:{count:'分支数 2–3',steps:'每路节点数',labels:'可替换节点文字',merge:'添加公共汇合节点，默认 true',outputLabel:'汇合节点文字'},variants:[{name:'二路',options:{count:2,steps:2}},{name:'三路',options:{count:3,steps:2}}]},
  {id:'structure.layers',code:'C22',family:'连接结构',name:'层间连接结构',renderer:S.drawLayers,parameters:{variant:CONNECTION_VARIANTS.filter(item=>item.componentId==='structure.layers').map(item=>item.key),counts:'基础每列节点数数组',connection:['all','paired'],titles:'层标题数组',diameter:'节点直径，可选'},variants:[{name:'全连接',options:{counts:[3,4,2],connection:'all'}},{name:'对应连接',options:{counts:[3,3,3],connection:'paired'}},...CONNECTION_VARIANTS.filter(item=>item.componentId==='structure.layers').map(item=>({name:item.name,options:{variant:item.key},structure:true}))]},
  {id:'layout.partitions',code:'C23',family:'空白分区',name:'分区容器',renderer:S.drawPartitions,parameters:{rows:'行数',cols:'列数',sideLabel:'侧标签，可选',titles:'分区标题数组或按区域 key 索引的对象',preset:LAYOUT_PRESETS.map(item=>item.key),showLabels:'显示可编辑区域名称，默认true',fontSize:'预设区域字号，默认20'},variants:[{name:'三列',options:{cols:3,rows:1}},{name:'上下分区',options:{cols:1,rows:2}},{name:'矩阵分区',options:{cols:2,rows:2}},{name:'侧标签分区',options:{cols:1,rows:2,sideLabel:'分类'}},...LAYOUT_PRESETS.map(item=>({name:item.name,options:{preset:item.key},layout:true}))]},
  ...UTILITY_ICON_COMPONENTS.map(item=>({id:item.id,code:item.code,family:'图标',name:item.name,
    renderer:(slide,id,bounds,options={})=>drawUtilityIcon(slide,id,bounds,{...options,componentId:item.id}),
    parameters:{box:'位置与尺寸',variant:item.variants.map(spec=>spec.key)},
    variants:item.variants.map(spec=>({name:spec.name,options:{variant:spec.key},geometry:true}))})),
  ...[
    ['structure.decision','C34','条件分支',CONTROL_FLOW_VARIANTS,drawControlFlow],
    ['structure.loop','C35','循环反馈',CONTROL_FLOW_VARIANTS,drawControlFlow],
    ['structure.synchronize','C36','同步并行',CONTROL_FLOW_VARIANTS,drawControlFlow],
    ['structure.staged','C37','阶段与子流程',GROUPED_FLOW_VARIANTS,drawGroupedFlow],
    ['structure.swimlane','C38','跨泳道流程',GROUPED_FLOW_VARIANTS,drawGroupedFlow],
    ['structure.exception','C39','异常与退出',GROUPED_FLOW_VARIANTS,drawGroupedFlow],
  ].map(([id,code,name,specs,draw])=>({id,code,name,family:'流程结构',
    renderer:(slide,instanceId,bounds,options={})=>draw(slide,instanceId,bounds,{...options,componentId:id}),
    parameters:{variant:specs.filter(item=>item.componentId===id).map(item=>item.key),labels:'按节点 key 替换文字的对象',fontSize:'节点字号，默认20'},
    variants:specs.filter(item=>item.componentId===id).map(item=>({name:item.name,options:{variant:item.key},structure:true}))})),
];
const byId = new Map(COMPONENTS.map(item=>[item.id,item]));
if(byId.size!==COMPONENTS.length)throw new Error('Duplicate canonical component ID');

export function renderComponent(slide,id,bounds,options={},instanceId=`component.${id}`) {
  const item=byId.get(id);if(!item)throw new Error(`Unknown component: ${id}`);
  for(const key of ['x','y','w','h'])if(!Number.isFinite(bounds[key]))throw new Error(`Invalid component box.${key}`);
  if(bounds.w<=0||bounds.h<=0)throw new Error('Component width and height must be positive');
  const before=slide.shapes.items.length;
  const result=item.renderer(slide,instanceId,bounds,options);
  const objects=slide.shapes.items.slice(before);
  return {id,instanceId,objects,result};
}
export function catalogData(){return COMPONENTS.map(({renderer,...item})=>({...item,renderer:renderer.name,editable:true,status:'implemented',level:item.id.startsWith('structure.')?'structure':item.id.startsWith('layout.')?'layout':'component'}));}
