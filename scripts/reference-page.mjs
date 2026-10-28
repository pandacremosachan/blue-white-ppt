import fs from 'node:fs/promises';
import path from 'node:path';
import {argumentsOf,run} from '../skills/blue-white-ppt/scripts/lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node reference-page.mjs --page 25 [--output page.png]');return;}
  const page=Number(a.page);if(!Number.isInteger(page)||page<1||page>53)throw new Error('--page must be an integer from 1 to 53');
  const source=new URL(page===1?'../skills/blue-white-ppt/assets/reference/slide-01.png':`../assets/reference/slide-${String(page).padStart(2,'0')}.png`,import.meta.url);
  if(a.output){await fs.mkdir(path.dirname(path.resolve(a.output)),{recursive:true});await fs.copyFile(source,path.resolve(a.output),fs.constants.COPYFILE_EXCL);console.log(path.resolve(a.output));}else console.log(decodeURIComponent(source.pathname).replace(/^\/([A-Z]:\/)/,'$1'));
});
