import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node init-deck.mjs --output new-project-directory');return;}
  if(!a.output)throw new Error('--output is required');
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),output=path.resolve(a.output);
  try{await fs.access(output);throw new Error(`Target already exists: ${output}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  await fs.mkdir(output,{recursive:true});
  await fs.copyFile(path.join(root,'assets/templates/minimal-plan.json'),path.join(output,'plan.json'));
  await fs.copyFile(path.join(root,'assets/templates/draw.mjs'),path.join(output,'draw.mjs'));
  await fs.writeFile(path.join(output,'skill-location.json'),JSON.stringify({skillRoot:root},null,2));
  console.log(JSON.stringify({output,files:['plan.json','draw.mjs','skill-location.json'],next:['Edit plan.json, then run create-deck.mjs --input plan.json --output deck.pptx','Or edit draw.mjs and run node draw.mjs --output direct.pptx']},null,2));
});
