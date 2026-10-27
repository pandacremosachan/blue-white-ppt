import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPresentation,addSlide,addText,addFooter,C} from '../../../scripts/api.mjs';
import {exportPptx} from '../../../scripts/lib/native-pptx.mjs';
import {readZip,writeZip} from '../../../scripts/lib/zip.mjs';
import {escapeXml} from '../../../scripts/lib/xml.mjs';
import {validatePptx} from '../../../scripts/validate-pptx.mjs';
import {isWithin} from '../../../scripts/lib/release-files.mjs';
import {makeMorphTransition} from './morph.mjs';
import {composeCompactDeck} from './compact-layout.mjs';
import {compactDiagrams} from './compact-diagrams.mjs';
import {groups,cases} from './deck-content.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const skillRoot=path.resolve(root,'../../..');
const usage='node build-deck.mjs [--output FILE] [--manifest FILE] [--overwrite] [--help]';
function readArguments(argv){
 const result={overwrite:false};
 for(let i=0;i<argv.length;i++){
  const option=argv[i];
  if(option==='--help'){result.help=true;continue;}
  if(option==='--overwrite'){result.overwrite=true;continue;}
  if(!['--output','--manifest'].includes(option))throw new Error(`Unknown argument ${option}. ${usage}`);
  const value=argv[++i];
  if(!value||value.startsWith('--'))throw new Error(`${option} requires a file path`);
  const key=option.slice(2);
  if(result[key]!==undefined)throw new Error(`${option} may be specified only once`);
  result[key]=value;
 }
 return result;
}
const args=readArguments(process.argv.slice(2));
if(args.help){
 console.log(usage+'\n\nCreates the compact 13-slide editable trapezoid showcase, retaining all 32 compositions.\nThe local Morph serializer is experimental example code, not a production authoring API.\nDefault output: ./trapezoid-creativity.pptx in the current working directory.\nOutput and optional manifest must be outside the skill source directory. Existing files are refused unless --overwrite is given.');
 process.exit(0);
}
const output=path.resolve(args.output??'trapezoid-creativity.pptx');
const manifestPath=args.manifest===undefined?null:path.resolve(args.manifest);
const targets=[output,...(manifestPath?[manifestPath]:[])];
if(manifestPath&&path.relative(output,manifestPath)==='')throw new Error('Output and manifest must be different files');
// Resolve existing ancestors to keep a symlink outside the package from routing
// generated files back into the installed skill. No source-directory writes.
async function resolvedTarget(filename){
 let current=filename;const missing=[];
 while(true){
  try{return path.resolve(await fs.realpath(current),...missing.reverse());}
  catch(error){
   if(error.code!=='ENOENT')throw error;
   const parent=path.dirname(current);
   if(parent===current)throw error;
   missing.push(path.basename(current));current=parent;
  }
 }
}
const resolvedSkill=await fs.realpath(skillRoot);
for(const filename of targets){
 if(isWithin(skillRoot,filename)||isWithin(resolvedSkill,await resolvedTarget(filename)))throw new Error(`Generated files must be outside the skill source directory: ${filename}`);
 const stat=await fs.lstat(filename).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
 if(stat?.isSymbolicLink())throw new Error(`Output must not be a symbolic link: ${filename}`);
 if(stat?.isDirectory())throw new Error(`Output is a directory: ${filename}`);
 if(stat&&!args.overwrite)throw new Error(`Output already exists: ${filename}`);
}
const sourceRegister=JSON.parse(await fs.readFile(path.join(root,'research-sources.json'),'utf8'));
const sources=[...sourceRegister.sources,
 {id:'S15',title:'Draw a picture by combining and merging shapes',publisher:'Microsoft Support',category:'合并形状与编辑顶点',url:'https://support.microsoft.com/en-us/powerpoint/draw-a-picture-by-combining-and-merging-shapes',sourceObservation:'官方说明合并形状的不同操作及编辑顶点。'},
 {id:'S16',title:'Morph transition: Tips and tricks',publisher:'Microsoft Support',category:'平滑转场与对象匹配',url:'https://support.microsoft.com/en-us/powerpoint/morph-transition-tips-and-tricks',sourceObservation:'官方说明平滑转场的对象名称匹配与使用方式。'}
];
const sourceMap=new Map(sources.map(s=>[s.id,s]));
const drawings=compactDiagrams;
if(cases.length!==32||new Set(cases.map(c=>c.key)).size!==32)throw new Error('Expected 32 distinct cases');
for(const c of cases)if(!drawings[c.key]||(c.source&&!sourceMap.has(c.source)))throw new Error(`Missing drawing/source ${c.key}`);
const p=createPresentation({title:'梯形的32种PPT创意',brand:'梯形创意图鉴'});
const linkedShapes=new Map(),manifest=[],casePages=[];
const tx=(s,value,bounds,size=23,color=C.ink,bold=false,extra={})=>addText(s,value,bounds,{fontSize:size,color,bold,verticalAlignment:'middle',insets:0,...extra});
const page=(title,lead,chapterNumber)=>{
 if(!lead||chapterNumber===undefined)throw new Error('Each showcase page requires a standard summary and chapter number');
 const slide=addSlide(p,{number:String(chapterNumber),title,summary:lead,footer:'梯形创意参考'});slide._chapterNumber=String(chapterNumber);return slide;
};
const note=(s,text,ids=[])=>{s.speakerNotes.text=text+'\n\n'+ids.map(id=>{const src=sourceMap.get(id);return `${id} ${src.title}\n${src.publisher}\n${src.url}`;}).join('\n\n');};
function link(s,shape,url){const index=p.slides.items.indexOf(s)+1;if(!linkedShapes.has(index))linkedShapes.set(index,[]);linkedShapes.get(index).push({shapeName:shape.name,url});}

const {slideCount,morphTarget}=composeCompactDeck({p,tx,page,note,link,sources,sourceMap,manifest,casePages});
if(p.slides.items.length!==slideCount)throw new Error(`Expected ${slideCount} slides, got ${p.slides.items.length}`);
for(const [i,s]of p.slides.items.entries())addFooter(s,i+1,slideCount,s._footerLabel??'梯形创意参考');
const parts=readZip(await exportPptx(p));
const morphPart=`ppt/slides/slide${morphTarget}.xml`;parts.set(morphPart,Buffer.from(parts.get(morphPart).toString().replace('</p:sld>',makeMorphTransition({mode:'object',durationMs:1600})+'</p:sld>')));
for(const [index,links]of linkedShapes){
 const sp=`ppt/slides/slide${index}.xml`,rp=`ppt/slides/_rels/slide${index}.xml.rels`;
 let xml=parts.get(sp).toString(),rels=parts.get(rp).toString();
 for(const [i,l]of links.entries()){
   const rid=`sourceLink${i+1}`,tag=`name="${escapeXml(l.shapeName)}"`;
   let found=false;xml=xml.replace(/<p:sp>.*?<\/p:sp>/gs,block=>{if(!block.includes(tag))return block;found=true;return block.replace(/(<a:rPr\b[^>]*>)/g,`$1<a:hlinkClick r:id="${rid}"/>`);});
   if(!found)throw new Error(`Missing link owner ${index}/${l.shapeName}`);
   rels=rels.replace('</Relationships>',`<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(l.url)}" TargetMode="External"/></Relationships>`);
 }
 parts.set(sp,Buffer.from(xml));parts.set(rp,Buffer.from(rels));
}
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,writeZip(parts),{flag:args.overwrite?'w':'wx'});
const slideMapping=Array.from({length:40},(_,i)=>({originalSlide:i+1,slide:i<3||i===35?1:i<35?2+Math.floor((i-3)/4):i-26}));
const validation=await validatePptx(output);if(validation.errors.length)throw new Error(validation.errors.join('\n'));
if(manifestPath){
 await fs.mkdir(path.dirname(manifestPath),{recursive:true});
 await fs.writeFile(manifestPath,JSON.stringify({output,slideCount,creativeCases:32,casePages,slideMapping,compactDesign:{caseSlides:8,casesPerSlide:4,diagramLabelMin:20,captionFontSize:20,summaryBounds:[48,94,1184,78],summaryFontSize:23,summaryBold:true,contentStart:190,caseFrames:[[48,190,578,240],[654,190,578,240],[48,446,578,240],[654,446,578,240]],morphFrames:[[48,190,330,494],[400,190,832,494]],sourceFrames:[[48,190,578,494],[654,190,578,494]],diagramHeight:155},categories:groups,editableShapes:validation.counts.shapes,nativeMorphTransitions:1,sources:sources.length,sourceRegister:sources,experimentalMorph:true,slides:manifest,validation},null,2)+'\n',{flag:args.overwrite?'w':'wx'});
}
console.log(JSON.stringify({output,manifest:manifestPath,slides:slideCount,cases:32,sources:sources.length,nativeMorphTransitions:1,editableShapes:validation.counts.shapes},null,2));
