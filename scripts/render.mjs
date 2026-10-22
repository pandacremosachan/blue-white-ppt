import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {findProgram} from './lib/system.mjs';
import {escapeXml} from './lib/xml.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node render.mjs deck.pptx --output preview-dir [--soffice path] [--pdftoppm path]');return;}
  if(!a._[0]||!a.output)throw new Error('A PPTX path and --output directory are required');
  const soffice=findProgram('soffice',a.soffice),pdftoppm=findProgram('pdftoppm',a.pdftoppm);
  if(!soffice||!pdftoppm)throw new Error('Rendering needs LibreOffice (soffice) and Poppler (pdftoppm). Install them or pass explicit executable paths. PPTX generation does not need either program.');
  const input=path.resolve(a._[0]),output=path.resolve(a.output);
  try{if((await fs.readdir(output)).length)throw new Error('Preview output directory must be empty; choose a new directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
  const profile=await fs.mkdtemp(path.join(os.tmpdir(),'blue-white-ppt-'));
  await fs.mkdir(output,{recursive:true});
  execFileSync(soffice,[`-env:UserInstallation=${pathToFileURL(profile).href}`,'--headless','--convert-to','pdf','--outdir',output,input],{encoding:'utf8',windowsHide:true,timeout:120000});
  const pdf=path.join(output,path.basename(input,path.extname(input))+'.pdf');await fs.access(pdf);
  execFileSync(pdftoppm,['-png','-r',String(a.dpi??120),pdf,path.join(output,'slide')],{encoding:'utf8',windowsHide:true,timeout:120000});
  const images=(await fs.readdir(output)).filter(name=>/^slide-\d+\.png$/.test(name)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
  await fs.writeFile(path.join(output,'index.html'),`<!doctype html><meta charset="utf-8"><title>Slide previews</title><style>body{background:#e5e8eb;font-family:sans-serif}main{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}img{width:100%}figure{margin:0}</style><main>${images.map((name,i)=>`<figure><img src="${escapeXml(name)}"><figcaption>Page ${i+1}</figcaption></figure>`).join('')}</main>`);
  console.log(JSON.stringify({input,output,pdf,images:images.length,preview:path.join(output,'index.html')},null,2));
});
