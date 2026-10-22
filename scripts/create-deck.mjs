import fs from 'node:fs/promises';
import path from 'node:path';
import {buildFromPlan,savePresentation} from './api.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node create-deck.mjs --input plan.json --output deck.pptx [--overwrite] [--manifest manifest.json]');return;}
  if(!a.input||!a.output)throw new Error('--input and --output are required; see --help');
  const plan=JSON.parse(await fs.readFile(path.resolve(a.input),'utf8')),{presentation,manifest}=await buildFromPlan(plan,{baseDirectory:path.dirname(path.resolve(a.input))});
  const result=await savePresentation(presentation,path.resolve(a.output),{overwrite:Boolean(a.overwrite),footers:plan.footers!==false});
  if(a.manifest)await fs.writeFile(path.resolve(a.manifest),JSON.stringify({title:plan.title,slides:manifest},null,2));
  console.log(JSON.stringify({...result,slides:presentation.slides.items.length},null,2));
});
