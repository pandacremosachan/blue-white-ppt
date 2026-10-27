// Compact, native and editable Morph example. Node built-ins only.
// Rebuild from semantic baseline.json, never from an already compacted output.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createPresentation,addSlide,addText,addFooter,C} from '../../../scripts/api.mjs';
import {exportPptx} from '../../../scripts/lib/native-pptx.mjs';
import {readZip,writeZip} from '../../../scripts/lib/zip.mjs';
import {parseXml,all,escapeXml} from '../../../scripts/lib/xml.mjs';
import {validatePptx} from '../../../scripts/validate-pptx.mjs';
import {isWithin} from '../../../scripts/lib/release-files.mjs';
import {makeMorphTransition} from '../trapezoid/morph.mjs';
import {readSourceDeck,validateBaseline} from './source.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),skillRoot=path.resolve(here,'../../..');
const usage='node build-compact.mjs [--output FILE] [--manifest FILE] [--source ORIGINAL-22-SLIDE.pptx] [--overwrite]';
function argumentsOf(argv){const result={overwrite:false};for(let i=0;i<argv.length;i++){
  const arg=argv[i];if(arg==='--help'){result.help=true;continue;}if(arg==='--overwrite'){result.overwrite=true;continue;}
  if(!['--output','--manifest','--source'].includes(arg))throw new Error(`Unknown argument ${arg}. ${usage}`);
  const key=arg.slice(2),value=argv[++i];if(!value||value.startsWith('--')||result[key]!==undefined)throw new Error(`${arg} requires one file path`);result[key]=value;
}return result;}
const args=argumentsOf(process.argv.slice(2));
if(args.help){console.log(`${usage}\n\nCreates 14 slides: a reading map, four object-mode A/B pairs with two simultaneous effects each, separate word and character A/B pairs, and settings/sources. All 10 effect families retain native objects and stable !! identities.\n\nDefault source is the bundled semantic baseline.json; it is independent of assets/showcases/morph-effects.pptx. --source accepts only the original 22-slide reference. Existing targets require --overwrite; output paths must be outside the skill folder.`);process.exit(0);}
const output=path.resolve(args.output??'morph-effects-compact.pptx'),manifestPath=args.manifest?path.resolve(args.manifest):null;
async function resolvedTarget(filename){let current=filename,missing=[];while(true){try{return path.resolve(await fs.realpath(current),...missing.reverse());}catch(error){if(error.code!=='ENOENT')throw error;const parent=path.dirname(current);if(parent===current)throw error;missing.push(path.basename(current));current=parent;}}}
const resolvedSkill=await fs.realpath(skillRoot),targets=[output,...(manifestPath?[manifestPath]:[])];
if(new Set(targets).size!==targets.length)throw new Error('Output and manifest paths must differ');
for(const filename of targets){
  if(isWithin(skillRoot,filename)||isWithin(resolvedSkill,await resolvedTarget(filename)))throw new Error(`Generated files must be outside the skill source directory: ${filename}`);
  if(args.source&&await resolvedTarget(filename)===await resolvedTarget(path.resolve(args.source)))throw new Error('The source cannot be overwritten');
  const stat=await fs.lstat(filename).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(stat?.isSymbolicLink()||stat?.isDirectory())throw new Error(`Output must be a regular file: ${filename}`);
  if(stat&&!args.overwrite)throw new Error(`Output already exists: ${filename}`);
}
const baseline=validateBaseline(args.source?await readSourceDeck(path.resolve(args.source)):JSON.parse(await fs.readFile(path.join(here,'baseline.json'),'utf8')));
const sourceMap=new Map(baseline.effects.map(e=>[e.key,e]));
const p=createPresentation({title:'十类平滑效果：紧凑原生演示',brand:'平滑效果'}),recipes=[],links=[];
const CHAPTER_NUMBERS=Object.freeze(['1','2.1','2.1','2.2','2.2','2.3','2.3','2.4','2.4','3.1','3.1','3.2','3.2','4']);
const tx=(s,text,bounds,size=23,color=C.ink,bold=false,extra={})=>addText(s,text,bounds,{fontSize:size,color,bold,verticalAlignment:'middle',insets:0,...extra});
const box=(s,name,x,y,w,h,fill=C.bluePale,lineFill='none',lineWidth=0)=>s.shapes.add({name,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:lineFill,width:lineWidth}});
const sources=[
  {title:'Microsoft：Morph 使用方法',url:'https://support.microsoft.com/en-us/powerpoint/use-the-morph-transition-in-powerpoint'},
  {title:'Microsoft：对象匹配与使用技巧',url:'https://support.microsoft.com/en-us/powerpoint/morph-transition-tips-and-tricks'}
];
function page(title,summary){return addSlide(p,{number:CHAPTER_NUMBERS[p.slides.items.length],title,summary,footer:'十类平滑效果 · 原生对象演示'});}
function notes(s,text){s.speakerNotes.text=text+'\n\n原始22页参考的几何与文字已提取为 semantic baseline.json；本册按阅读尺度重排，不以缩小整页实现压缩。全部示例对象保持可编辑。\n\n'+sources.map(s=>s.title+'\n'+s.url).join('\n\n');}
function familyShape(s,key,state,suffix,x,y,w,h,{text,fontSize,color,fill,line,rotation,...style}={}){
  const template=sourceMap.get(key).states[state].find(shape=>shape.name===`!!${key}.${suffix}`);if(!template)throw new Error(`Missing original identity ${key}.${suffix}`);
  const shape=s.shapes.add({name:template.name,geometry:template.geometry,adjustmentList:template.adjustmentList,position:{left:x,top:y,width:w,height:h,...(template.position.rotation!==undefined?{rotation:template.position.rotation}:{}),...(rotation!==undefined?{rotation}:{})},fill:fill??template.fill,line:line??template.line});
  const value=text??template.text?.value;if(value){shape.text=value;shape.text.style={...template.text?.style,fontSize:fontSize??24,wrap:'none',insets:0,...style,...(color?{color}:{})};}
  return shape;
}
function at(s,key,state,bounds){const [ox,oy]=bounds;return (suffix,x,y,w,h,options)=>familyShape(s,key,state,suffix,ox+x,oy+y,w,h,options);}

// The diagrams are recomposed for 540px columns. No diagram-wide half-scaling
// is used: labels stay readable while every meaningful source shape survives.
const draw={
  zoom(s,state,b){const a=at(s,'zoom',state,b);for(let i=0;i<6;i++){
    const active=i===5,pos=state?(active?[220,90,290,160]:[20,30+i*54,165,44]):[15+(i%3)*175,75+Math.floor(i/3)*125,155,88];
    a(`module.${i}`,...pos,{text:active&&state?'模块 6\n观察对象':`模块 ${i+1}`,fontSize:state?(active?32:22):25});
  }},
  spotlight(s,state,b){const a=at(s,'spotlight',state,b);for(let i=0;i<24;i++){const x=20+(i%6)*84,y=33+Math.floor(i/6)*69;
    a(`cell.${i}`,x,y,66,51);a(`point.${i}`,x+25,y+18,15,15);
  }
    const [x,y,w,h]=state?[344,158,169,143]:[20,29,170,143],right=524,bottom=306;
    a('shade.top',10,20,514,y-20);a('shade.bottom',10,y+h,514,bottom-y-h);a('shade.left',10,y,x-10,h);a('shade.right',x+w,y,right-x-w,h);a('window',x,y,w,h);
  },
  parallax(s,state,b){const a=at(s,'parallax',state,b);a('sky',8,24,524,284);
    for(let i=0;i<7;i++)a(`far.${i}`,35+i*66-state*20,65+(i%2)*15,46,184-(i%2)*15);
    for(let i=0;i<5;i++)a(`mid.${i}`,62+i*88-state*45,143+(i%2)*12,90,112);
    for(let i=0;i<4;i++){const x=80+i*110-state*65;a(`near.${i}`,x,215,96,93);a(`near-label.${i}`,x+5,241,86,40,{fontSize:23});}
  },
  carousel(s,state,b){const a=at(s,'carousel',state,b);
    // All five cards remain inside the column. Movement and size transfer the
    // focus from the third to the fourth card without tiny off-canvas labels.
    const xs=state?[4,83,173,273,423]:[4,94,194,344,444],ws=state?[69,80,90,140,100]:[80,90,140,90,80];
    ['甲','乙','丙','丁','戊'].forEach((label,i)=>{const active=i===(state?3:2),height=active?210:142;a(`card.${i}`,xs[i],active?59:94,ws[i],height,{text:active?`方案${label}\n焦点`:label,fontSize:active?26:23,fill:active?C.blue:C.blueFade,color:active?C.white:C.blueDark,bold:active});});
  },
  geometry(s,state,b){const a=at(s,'geometry',state,b);a('body',state?300:45,state?92:110,state?145:130,state?150:130);a('arrow',443,146,68,52,{rotation:state?180:0});},
  layers(s,state,b){const a=at(s,'layers',state,b);for(let i=0;i<3;i++)a(`plane.${i}`,state?108:90+i*20,state?30+i*102:72+i*58,320,state?78:95,{fontSize:26,verticalAlignment:'top',insets:{left:20,right:20,top:9,bottom:0}});},
  equation(s,state,b){const a=at(s,'equation',state,b),positions=state?[35,267,350,413,119,187]:[50,116,201,264,350,417];
    ['y','equals','w','x','sign','b'].forEach((key,i)=>a(`token.${key}`,positions[i],104,70,100,{fontSize:56}));
  },
  data(s,state,b){const a=at(s,'data',state,b);for(let i=0;i<3;i++){const y=280-i*115;a(`grid.${i}`,65,y,445,0);a(`tick.${i}`,1,y-18,55,36,{fontSize:21});}a('unit',1,0,210,36,{fontSize:21});
    const values=state?[65,80,58]:[40,55,70];values.forEach((value,i)=>{const x=124+i*134,h=value*2.3;a(`bar.${i}`,x,280-h,70,h);a(`value.${i}`,x-10,242-h,90,38,{fontSize:27});a(`category.${i}`,x-10,286,90,35,{fontSize:23});});
  }
};

// 1: The opening page doubles as the compact reading map.
{
  const s=page('十类平滑效果','同类效果共用一组前后状态；从初始页翻到结果页，两栏同时完成变化。');
  box(s,'region.reading-map.frame',64,190,1152,490,C.white,C.border,1.1);
  const items=[
    ['观察与聚焦','全局与局部　＋　聚焦窗口','2–3 页'],
    ['位移与焦点','分层视差　＋　卡片轮播','4–5 页'],
    ['形状与结构','形状旋转　＋　层叠分解','6–7 页'],
    ['符号与数值','公式移项　＋　数据标记','8–9 页'],
    ['文字的匹配单位','词语重排　10–11 页　｜　字符重排　12–13 页','独立页面模式']
  ];
  items.forEach(([title,body,ref],i)=>{const y=203+i*83;box(s,`map.band.${i}`,76,y,1128,70,i===4?C.bluePale:C.white);tx(s,title,[82,y+10,285,45],25,C.blueText,true);tx(s,body,[374,y+10,660,45],23);tx(s,ref,[1016,y+10,180,45],19,C.muted,false,{align:'right'});});
  tx(s,'14 页保留十类效果；放映时共有 6 次原生平滑转场。',[80,641,1120,38],24,C.blueDark,true);
  notes(s,'本册将八类对象模式示例合并为四组双栏状态对，每组仅在结果页设置一次原生 byObject Morph；两栏对象在同一转场内同时移动。词语与字符匹配由整页转场选项决定，分别保留独立状态对。共十四页、十类效果、六次原生 Morph 转场。');
  recipes.push({slide:1,kind:'reading-map'});
}

const objectGroups=[
  {title:'全局与局部 · 聚焦窗口',lead:'左栏改变对象尺寸，右栏移动观察窗口；两种方法都保留原来的对象身份。',keys:['zoom','spotlight'],labels:['全局与局部','聚焦窗口'],captions:[['六个模块形成整体关系。','窗口标出左上观察区域。'],['模块 6 放大，其他模块仍可定位。','窗口移到右下，底层网格保持不动。']]},
  {title:'分层视差 · 卡片轮播',lead:'不同位移形成远近关系；卡片的位置与尺寸则把关注点交给下一对象。',keys:['parallax','carousel'],labels:['分层视差','卡片轮播'],captions:[['远、中、近景位于不同层次。','第三张卡片处于焦点。'],['近景位移大，远景位移小。','第四张卡片放大，焦点随之转移。']]},
  {title:'形状旋转 · 层叠分解',lead:'同一对象可以改变外形，也可以从叠放状态分开，以解释各层的对应关系。',keys:['geometry','layers'],labels:['形状与旋转','层叠分解'],captions:[['方形与箭头处于初始状态。','三个平面叠放，层名保持可读。'],['方形转为椭圆，箭头旋转半周。','输入、变换、输出三层依次分开。']]},
  {title:'公式移项 · 数据标记',lead:'符号按对象保持对应；柱形按同一尺度改变高度，数值用于说明两个状态。',keys:['equation','data'],labels:['公式移项','数据标记'],captions:[['等式为 y = wx + b。','演示值为 40、55、70。'],['等式重排为 y − b = wx。','演示值更新为 65、80、58。']]}
];
for(const group of objectGroups){const start=p.slides.items.length+1;
  for(let state=0;state<2;state++){
    const s=page(group.title,group.lead);
    group.keys.forEach((key,col)=>{const x=62+col*602;box(s,`region.${key}.frame`,x,190,552,490,C.white,C.border,1.1);tx(s,group.labels[col],[x+12,202,500,43],28,C.blueText,true);draw[key](s,state,[x+6,254,540,326]);tx(s,group.captions[state][col],[x+10,601,532,76],22,C.ink,false,{verticalAlignment:'top'});});
    tx(s,state?'结果状态':'初始状态',[1030,202,170,39],22,state?C.red:C.blueText,true,{align:'right'});
    const keys=group.keys;notes(s,`${group.title}。${state?'结果':'初始'}状态。两栏在同一次 byObject Morph 中并行变化。原始形状均以 !!名称成对保留；文字与布局按双栏观看尺寸重排。${group.captions[state].join(' ')}${keys.includes('equation')?' 公式由六个独立可编辑的符号文本框组成，展示对象移项，不是 Office Math 对象或公式求解器。':''}${keys.includes('data')?' 柱形为独立形状；演示值不是原生图表数据插值。':''}`);
    recipes.push({slide:p.slides.items.length,kind:'object-pair',state:state?'B':'A',mode:state?'byObject':null,effects:keys,startSlide:start,endSlide:start+1});
  }
}

// Word and character modes are page-wide transition choices. They cannot share
// the same result slide while retaining their distinct native modes.
for(const [key,title,lead,caption]of[
  ['word','词语重排','本例以空格分隔英文词语，观察两个词语在同一文本框中的对应与换位。','句子仅含三个词语；停靠状态用于阅读，运动途中可能交叉。'],
  ['character','字符重排','同一文本框保留六个字母；字符模式按字母匹配，使新排列从旧排列连续形成。','字符集合保持一致；重复字符和断行需要在目标播放器中单独检查。']
]){const effect=sourceMap.get(key),start=p.slides.items.length+1;
  for(let state=0;state<2;state++){
    const s=page(title,lead);box(s,`region.${key}.frame`,64,190,1152,490,C.white,C.border,1.1);tx(s,state?'重排结果':'初始排列',[86,207,1040,42],25,C.blueText,true);box(s,`${key}.surface`,82,278,1116,273,C.bluePale);
    const template=effect.states[state][0];familyShape(s,key,state,template.name.split('.').slice(1).join('.'),90,key==='word'?337:310,1100,key==='word'?118:174,{fontSize:key==='word'?64:116});
    tx(s,caption,[82,584,1118,70],24,C.ink,false,{verticalAlignment:'top'});
    notes(s,`${title}。${state?'结果':'初始'}状态。整页原生 Morph 选项为 ${key==='word'?'byWord':'byChar'}。主文本框保留原始 !!身份与原文；页面其余文字两端保持稳定，不另复制英文演示词或字母。${caption} ${key==='word'?'本例不能证明无空格中文的自动分词行为。':'本例使用不重复的六个拉丁字母，不能证明重复字符可被唯一对应。'}`);
    recipes.push({slide:p.slides.items.length,kind:'text-pair',state:state?'B':'A',mode:state?{word:'byWord',character:'byChar'}[key]:null,effects:[key],startSlide:start,endSlide:start+1});
  }
}

// 14: Compact authoring guidance and the provenance links already present in
// the original deck. The deck remains a behavior reference, not a compiler API.
{
  const s=page('模式、身份与来源','先让两个停靠状态表达清楚，再确认所用模式、对象对应关系与播放效果。');
  const rows=[
    ['对象模式','位置、尺寸、旋转与形状可共同变化。\n同一转场中可并行展示多个独立场景。'],
    ['词语／字符模式','匹配单位由整页的转场选项决定。\n本册分别保留一组状态，避免模式冲突。'],
    ['对象身份与阅读','成对对象保留一致的 !! 名称。\n字体按画面重排；停靠状态应完整可读。']
  ];
  rows.forEach(([title,body],i)=>{const y=202+i*98;box(s,`region.settings-${i}.frame`,66,y,1148,88,i%2?C.white:C.bluePale,C.border,1.1);tx(s,title,[82,y+14,280,58],26,C.blueText,true);tx(s,body,[375,y+8,816,72],23);});
  box(s,'region.sources.frame',66,508,1148,172,C.white,C.border,1.1);
  tx(s,'来源：原始参考中的 Microsoft 官方使用说明',[80,518,1110,36],22,C.muted);
  sources.forEach((source,i)=>{const shape=tx(s,source.title,[84,560+i*40,1110,34],22,C.blue,true);links.push({slide:14,shapeName:shape.name,url:source.url});});
  tx(s,'不支持平滑的播放器使用淡化回退；静态预览只能检查两个停靠状态。',[84,652,1100,27],18,C.muted);
  notes(s,'十四页紧凑版保留十类原生效果。词语与字符模式的路径由播放器计算，中途可能交叠；静态页面无法替代放映验收。对象对应依赖跨页一致的 !!名称；页内数值 ID 仅用于本页对象引用。参考来源沿用原22页文件中的微软官方链接。');
  recipes.push({slide:14,kind:'settings-sources'});
}
if(p.slides.items.length!==14)throw new Error('Compact recipe must have exactly 14 slides');
for(const recipe of recipes)recipe.chapterNumber=CHAPTER_NUMBERS[recipe.slide-1];
// Preserve the first reference's separation between the C02 summary and body.
for(const [index,slide]of p.slides.items.entries())for(const shape of slide.shapes.items){
  if(!/^(header\.|info\.lead\.|info\.lead$|footer\.)/.test(shape.name)&&shape.position.top<190)throw new Error(`Body object above y=190 on slide ${index+1}: ${shape.name}`);
}

// Give unchanged page furniture a stable identity within each pair. The main
// source identities already use !! and are never renamed or merged into images.
for(const recipe of recipes.filter(r=>r.state)){
  const slide=p.slides.items[recipe.slide-1],prefix=`!!chrome.pair${recipe.startSlide}.`;
  slide.shapes.items.forEach(shape=>{if(!shape.name.startsWith('!!'))shape.name=prefix+shape.name.replace(/\.\d+$/,'');});
}
const regions=recipes.flatMap(recipe=>p.slides.items[recipe.slide-1].shapes.items.filter(shape=>/(?:^|\.)region\..*\.frame$/.test(shape.name)).map(shape=>({slide:recipe.slide,name:shape.name,bounds:[shape.position.left,shape.position.top,shape.position.width,shape.position.height]})));
for(const [i,s]of p.slides.items.entries())addFooter(s,i+1,14);
const parts=readZip(await exportPptx(p));
for(const recipe of recipes.filter(r=>r.mode)){
  const part=`ppt/slides/slide${recipe.slide}.xml`,mode={byObject:'object',byWord:'word',byChar:'character'}[recipe.mode];
  // p:transition follows clrMapOvr in the slide schema. Fallback is fade.
  parts.set(part,Buffer.from(parts.get(part).toString().replace('</p:sld>',makeMorphTransition({mode,durationMs:1700})+'</p:sld>')));
}
for(const [i,link]of links.entries()){
  const part=`ppt/slides/slide${link.slide}.xml`,relPart=`ppt/slides/_rels/slide${link.slide}.xml.rels`,rid=`compactSource${i+1}`,needle=`name="${escapeXml(link.shapeName)}"`;
  const original=parts.get(part).toString();if(!original.includes(needle))throw new Error(`Missing source link shape ${link.shapeName}`);
  parts.set(part,Buffer.from(original.replace(needle+'/>',needle+`><a:hlinkClick r:id="${rid}"/></p:cNvPr>`)));
  parts.set(relPart,Buffer.from(parts.get(relPart).toString().replace('</Relationships>',`<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(link.url)}" TargetMode="External"/></Relationships>`)));
}

// Package evidence is computed from the emitted XML rather than assumed from
// authoring options. Reject missing modes, identities, static effects or images.
const trees=new Map(recipes.map(r=>[r.slide,parseXml(parts.get(`ppt/slides/slide${r.slide}.xml`).toString())]));
const nativeTransitions=recipes.filter(r=>r.mode).map(r=>({slide:r.slide,mode:all(trees.get(r.slide),'morph')[0]?.attrs.option}));
if(nativeTransitions.some((entry,i)=>entry.mode!==recipes.filter(r=>r.mode)[i].mode))throw new Error('Native Morph mode was not serialized');
const evidence=[];
for(const effect of baseline.effects){
  const pair=recipes.find(r=>r.state==='A'&&r.effects.includes(effect.key)),a=trees.get(pair.startSlide),b=trees.get(pair.endSlide),lookup=tree=>new Map(all(tree,'sp').map(n=>[all(n,'cNvPr')[0]?.attrs.name,n]));
  const aa=lookup(a),bb=lookup(b),names=effect.states[0].map(s=>s.name),changed=[];
  for(const name of names){if(!aa.has(name)||!bb.has(name))throw new Error(`Missing compact identity: ${name}`);
    const signature=node=>JSON.stringify({xfrm:all(node,'xfrm'),geometry:all(node,'prstGeom'),text:all(node,'t').map(n=>n.text)});if(signature(aa.get(name))!==signature(bb.get(name)))changed.push(name);
  }
  if(!changed.length)throw new Error(`Effect ${effect.key} has no state change`);
  evidence.push({key:effect.key,title:effect.title,mode:effect.mode,sourceSlides:effect.originalSlides,slides:[pair.startSlide,pair.endSlide],matchedObjects:names.length,changedObjects:changed.length,names,changedNames:changed});
}
const imageCount=[...trees.values()].reduce((sum,t)=>sum+all(t,'pic').length,0);if(imageCount)throw new Error('Compact Morph deck must use editable objects, not screenshots');
const bytes=writeZip(parts);await fs.mkdir(path.dirname(output),{recursive:true});
const temporary=output+`.build-${process.pid}`;
try{await fs.writeFile(temporary,bytes,{flag:'wx'});const validation=await validatePptx(temporary);if(validation.status!=='pass')throw new Error('Compact package validation failed: '+validation.errors.join('; '));await fs.rename(temporary,output);}catch(error){await fs.unlink(temporary).catch(()=>{});throw error;}
const manifest={schema:'blue-white-morph-compact/v1',output:path.basename(output),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),slideCount:14,effectFamilyCount:10,effectModes:{object:8,word:1,character:1},nativeTransitionCount:6,nativeTransitions,source:baseline.provenance,sourceObjectCount:baseline.effects.reduce((sum,e)=>sum+e.states[0].length,0),matchedObjectCount:evidence.reduce((sum,e)=>sum+e.matchedObjects,0),pictures:imageCount,slides:recipes,effects:evidence,layout:{chapterNumbers:CHAPTER_NUMBERS,bodyMinimumY:190,summaryBounds:[48,94,1184,78],regions},limitations:['Four object transitions each carry two simultaneous effect families; ten effect families do not mean ten separate result slides.','Word and character options apply to an entire result slide, so these pairs remain separate.','Word/character paths are calculated by the player and may cross; endpoint XML validation is not playback acceptance.','Equation tokens are editable text boxes; data marks are editable shapes, not Office Math or chart-data interpolation.'],validation:{status:'pass',visualPlaybackVerified:false}};
if(manifestPath){await fs.mkdir(path.dirname(manifestPath),{recursive:true});await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');}
console.log(JSON.stringify({output,manifest:manifestPath,slideCount:14,effectFamilyCount:10,nativeTransitions,matchedObjects:manifest.matchedObjectCount,sha256:manifest.sha256},null,2));
