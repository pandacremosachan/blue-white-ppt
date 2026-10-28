import {C} from './research-components.mjs';
import {flowContext} from './flow-core.mjs';

export const GROUPED_FLOW_VARIANTS = Object.freeze([
  {componentId:'structure.staged',key:'stage-gates',name:'阶段关口流程',note:'关口判断连接两个阶段，未通过时返回本阶段',group:'staged',options:{variant:'stage-gates'}},
  {componentId:'structure.staged',key:'subprocess',name:'展开子流程',note:'主流程保留单个子流程节点，下方单独展开细分',group:'staged',options:{variant:'subprocess'}},
  {componentId:'structure.swimlane',key:'lane-handoff',name:'跨泳道交接',note:'步骤在三个责任泳道之间依次交接',group:'swimlane',options:{variant:'lane-handoff'}},
  {componentId:'structure.swimlane',key:'lane-feedback',name:'跨泳道反馈',note:'条件未通过时，从另一泳道返回对应步骤',group:'swimlane',options:{variant:'lane-feedback'}},
  {componentId:'structure.exception',key:'exception-retry',name:'异常补偿与重试',note:'正常主线保持独立，异常处理后重试故障步骤',group:'exception',options:{variant:'exception-retry'}},
  {componentId:'structure.exception',key:'early-exit',name:'提前退出流程',note:'任一关口满足退出条件时，跳过后续步骤到公共结束',group:'exception',options:{variant:'early-exit'}},
].map(item=>Object.freeze(item)));

function stageGates(g){
  g.frame('stage1','阶段 1',2,24,212,268);
  g.frame('stage2','阶段 2',326,24,212,268);
  const input=g.n('input','输入',24,96,168,48);
  const a=g.n('a','步骤 A',24,199,168,48);
  const gate=g.n('gate','条件',220,130,100,68,{geometry:'diamond'});
  const b=g.n('b','步骤 B',348,96,168,48);
  const output=g.n('output','输出',348,199,168,48,{highlight:true});
  g.e('stage1-step',input,a,{fromSide:'bottom',toSide:'top'});
  g.route('to-gate',a,gate,[[216,223],[216,164]],{fromSide:'right',toSide:'left'});
  g.route('approved',gate,b,[[336,164],[336,120]],{fromSide:'right',toSide:'left'});
  g.e('stage2-step',b,output,{fromSide:'bottom',toSide:'top'});
  g.route('revise-own-stage',gate,a,[[270,325],[108,325]],{fromSide:'bottom',toSide:'bottom',dashed:true});
  g.t('yes','是',342,151,28,24,{fontSize:18});
  g.t('no','否',278,248,28,24,{fontSize:18});
  return {entry:input,exit:output,gate,stages:[input,a,b,output]};
}

function subprocess(g){
  const expanded=g.frame('expanded','子流程展开',88,139,364,208);
  expanded.line={fill:C.border,width:1.1*g.scale,style:'dashed'};
  const input=g.n('input','输入',8,42,114,50);
  const sub=g.n('subprocess','子流程',208,42,124,50);
  const output=g.n('output','输出',418,42,114,50,{highlight:true});
  g.bar('subprocess-left-rule',218,47,1.5,40);
  g.bar('subprocess-right-rule',320.5,47,1.5,40);
  g.e('main-input',input,sub);
  g.e('main-output',sub,output);
  g.e('expand-association',sub,expanded,{fromSide:'bottom',toSide:'top',dashed:true,arrow:false});
  const a=g.n('detail-a','步骤 A',110,190,122,44);
  const b=g.n('detail-b','步骤 B',310,190,122,44);
  const c=g.n('detail-c','步骤 C',310,279,122,44);
  const d=g.n('detail-d','步骤 D',110,279,122,44);
  g.e('detail-ab',a,b);
  g.e('detail-bc',b,c,{fromSide:'bottom',toSide:'top'});
  g.e('detail-cd',c,d,{fromSide:'left',toSide:'right'});
  return {entry:input,exit:output,subprocess:sub,detailNodes:[a,b,c,d]};
}

function lane(g,key,title,y,h){
  const frame=g.frame(`${key}.frame`,'',1,y,538,h);
  const heading=g.n(`${key}.heading`,title,2,y+1,70,h-2,{fill:C.bluePale,stroke:C.border,color:C.blueText,fontSize:20});
  return {frame,heading};
}

function laneHandoff(g){
  const lanes=[lane(g,'lane-a','泳道 A',1,110),lane(g,'lane-b','泳道 B',120,110),lane(g,'lane-c','泳道 C',239,110)];
  const input=g.n('input','输入',96,34,100,46);
  const a=g.n('a','步骤 A',292,34,132,46);
  const b=g.n('b','步骤 B',292,153,132,46);
  const c=g.n('c','步骤 C',292,272,132,46);
  const output=g.n('output','输出',442,272,90,46,{highlight:true});
  g.e('input-a',input,a);
  g.e('handoff-ab',a,b,{fromSide:'bottom',toSide:'top'});
  g.e('handoff-bc',b,c,{fromSide:'bottom',toSide:'top'});
  g.e('c-output',c,output);
  return {entry:input,exit:output,lanes};
}

function laneFeedback(g){
  const lanes=[lane(g,'lane-a','泳道 A',1,168),lane(g,'lane-b','泳道 B',179,170)];
  const a=g.n('a','步骤 A',119,54,132,48);
  const b=g.n('b','步骤 B',354,54,132,48);
  const condition=g.n('condition','条件',373,207,94,74,{geometry:'diamond'});
  const revise=g.n('revise','补偿',119,220,132,48);
  const output=g.n('output','输出',356,302,128,46,{highlight:true});
  g.e('a-b',a,b);
  g.e('handoff',b,condition,{fromSide:'bottom',toSide:'top'});
  g.e('pass',condition,output,{fromSide:'bottom',toSide:'top'});
  g.e('not-pass',condition,revise,{fromSide:'left',toSide:'right'});
  g.route('feedback-to-owner',revise,a,[[185,194],[100,194],[100,78]],{fromSide:'top',toSide:'left',dashed:true});
  g.t('yes','是',432,279,28,21,{fontSize:18});
  g.t('no','否',294,215,28,24,{fontSize:18});
  g.t('return-label','返回',105,137,50,24,{fontSize:18});
  return {entry:a,exit:output,condition,lanes};
}

function exceptionRetry(g){
  const input=g.n('input','输入',8,77,94,48);
  const a=g.n('a','步骤 A',146,77,116,48);
  const b=g.n('b','步骤 B',307,77,116,48);
  const output=g.n('output','输出',465,77,70,48,{highlight:true});
  const compensate=g.n('compensate','补偿',303,223,124,48);
  g.e('main-input',input,a);
  g.e('main-ab',a,b);
  g.e('main-output',b,output);
  g.e('exception',b,compensate,{fromSide:'bottom',toSide:'top',dashed:true});
  g.route('retry-same-step',compensate,b,[[282,247],[282,40],[365,40]],{fromSide:'left',toSide:'top'});
  g.t('normal-label','正常',427,74,38,22,{fontSize:18});
  g.t('exception-label','异常',378,160,58,24,{fontSize:18});
  g.t('retry-label','重试',220,175,52,24,{fontSize:18});
  return {entry:input,exit:output,retryTarget:b,compensation:compensate};
}

function earlyExit(g){
  const input=g.n('input','输入',8,42,82,48);
  const first=g.n('first-condition','条件',127,29,100,74,{geometry:'diamond'});
  const a=g.n('a','步骤 A',270,42,112,48);
  const second=g.n('second-condition','条件',425,29,100,74,{geometry:'diamond'});
  const b=g.n('b','步骤 B',430,183,90,48);
  const end=g.n('end','结束',228,292,112,46,{highlight:true,geometry:'roundRect'});
  g.e('input-first',input,first);
  g.e('continue-first',first,a);
  g.e('a-second',a,second);
  g.e('continue-second',second,b,{fromSide:'bottom',toSide:'top'});
  g.route('early-first',first,end,[[177,315]],{fromSide:'bottom',toSide:'left'});
  g.route('early-second',second,end,[[532,66],[532,315]],{fromSide:'right',toSide:'right'});
  g.route('normal-end',b,end,[[475,265],[284,265]],{fromSide:'bottom',toSide:'top'});
  g.t('first-no','否',231,35,28,22,{fontSize:18});
  g.t('first-yes','是',185,153,28,22,{fontSize:18});
  g.t('second-no','否',486,136,28,22,{fontSize:18});
  g.t('second-yes','是',495,94,28,22,{fontSize:18});
  return {entry:input,exit:end,conditions:[first,second]};
}

const RENDERERS={
  'stage-gates':stageGates,subprocess,'lane-handoff':laneHandoff,
  'lane-feedback':laneFeedback,'exception-retry':exceptionRetry,'early-exit':earlyExit,
};

export function drawGroupedFlow(slide,instanceId,bounds,options={}){
  const requested=options.variant??GROUPED_FLOW_VARIANTS.find(item=>item.componentId===options.componentId)?.key??'stage-gates';
  const definition=GROUPED_FLOW_VARIANTS.find(item=>item.key===requested);
  if(!definition)throw new RangeError(`Unknown grouped flow variant: ${requested}`);
  if(options.componentId&&options.componentId!==definition.componentId)throw new RangeError('Flow variant does not belong to the requested componentId');
  const g=flowContext(slide,instanceId,bounds,options);
  return g.finish({variant:requested,componentId:definition.componentId,...RENDERERS[requested](g)});
}
