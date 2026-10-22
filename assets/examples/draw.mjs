import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const args={};for(let i=2;i<process.argv.length;i++){const key=process.argv[i];if(!key.startsWith('--'))throw new Error(`Unexpected argument ${key}`);args[key.slice(2)]=process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[++i]:true;}
if(args.help){console.log('node draw.mjs [--skill /path/to/blue-white-ppt] [--output deck.pptx] [--overwrite]');process.exit(0);}
const here=path.dirname(fileURLToPath(import.meta.url));
let configured;try{configured=JSON.parse(await fs.readFile(path.join(here,'skill-location.json'),'utf8')).skillRoot;}catch(error){if(error.code!=='ENOENT')throw error;}
const skillRoot=path.resolve(args.skill??process.env.BLUE_WHITE_PPT_SKILL??configured??path.join(here,'../..'));
const {createPresentation,addSlide,renderByCode,addText,savePresentation}=await import(pathToFileURL(path.join(skillRoot,'scripts/api.mjs')).href);
const p=createPresentation({title:'蓝白组件直接调用示例'});
const s=addSlide(p,{number:'1',title:'从输入到结果',summary:'通过组件编号绘制可编辑节点，并将连接线附着到节点。'});
const input=renderByCode(s,'C15',[100,290,280,100],{label:'输入材料'},'method.input');
const output=renderByCode(s,'C15',[800,290,280,100],{label:'分析结果'},'method.output');
renderByCode(s,'C07',[380,340,420,1],{from:input.result,to:output.result,fromSide:'right',toSide:'left'},'method.edge');
addText(s,'在这里解释转换过程、证据与适用条件。',[100,485,1000,90],{fontSize:25});
await savePresentation(p,path.resolve(args.output??path.join(here,'direct-example.pptx')),{overwrite:Boolean(args.overwrite)});
console.log(JSON.stringify({output:path.resolve(args.output??path.join(here,'direct-example.pptx')),slides:1}));
