import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findProgram} from './lib/system.mjs';
import {argumentsOf,run} from './lib/cli.mjs';

await run(async()=>{
  const a=argumentsOf();
  if(a.help){console.log('node doctor.mjs [--soffice path] [--pdftoppm path]');return;}
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const instructions=await fs.readFile(path.join(root,'SKILL.md'),'utf8');
  const version=instructions.match(/^  version:\s*["']?([\w.+-]+)["']?\s*$/m)?.[1]??null;
  const catalog=JSON.parse(await fs.readFile(path.join(root,'references/catalog.json'),'utf8'));
  const required=[
    'scripts/api.mjs','scripts/create-deck.mjs','scripts/init-deck.mjs',
    'scripts/inspect-component.mjs','scripts/render.mjs','scripts/validate-pptx.mjs',
    'assets/reference/component-library-v0.14.pptx','assets/reference/slide-01.png',
    'assets/fonts/NotoSansSC-VF.ttf','assets/fonts/OFL.txt',
    'assets/templates/minimal-plan.json','assets/templates/draw.mjs',
  ];
  const missing=[];
  for(const relative of required){
    const stat=await fs.stat(path.join(root,...relative.split('/'))).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
    if(!stat?.isFile()||!stat.size)missing.push(relative);
  }
  const nodeCompatible=Number(process.versions.node.split('.')[0])>=20;
  const reference=path.join(root,'assets/reference/component-library-v0.14.pptx');
  const font=path.join(root,'assets/fonts/NotoSansSC-VF.ttf');
  const report={
    version,node:process.version,nodeCompatible,coreReady:nodeCompatible&&Boolean(version)&&missing.length===0,
    platform:process.platform,skillRoot:root,
    components:catalog.items.length,variants:catalog.items.reduce((n,item)=>n+item.variants.length,0),
    reference:{path:reference,available:!missing.includes('assets/reference/component-library-v0.14.pptx'),pages:53},
    font:{path:font,family:'Noto Sans SC',bundled:!missing.includes('assets/fonts/NotoSansSC-VF.ttf'),embeddedInOutput:false},
    rendering:{soffice:findProgram('soffice',a.soffice),pdftoppm:findProgram('pdftoppm',a.pdftoppm)},
    missing,scope:'Runtime requirements and required-file availability; generated decks still need structural and visual review.',
  };
  console.log(JSON.stringify(report,null,2));
  if(!report.coreReady)process.exitCode=1;
});
