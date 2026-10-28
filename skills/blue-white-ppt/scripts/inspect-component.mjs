import fs from 'node:fs/promises';
import {getComponent,COMPONENTS} from './api.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf(),catalog=JSON.parse(await fs.readFile(new URL('../references/catalog.json',import.meta.url),'utf8'));
  if(a.help){console.log('node inspect-component.mjs [C05|canonical.id] [--list] [--search text]');return;}
  if(a.list||!a._.length){const items=catalog.items.filter(item=>!a.search||`${item.code} ${item.id} ${item.name} ${JSON.stringify(item.parameters)}`.toLowerCase().includes(String(a.search).toLowerCase()));console.log(JSON.stringify(items.map(item=>({code:item.code,id:item.id,name:item.name,variants:item.variants.length,referencePages:item.sampleSlides})),null,2));return;}
  const item=getComponent(a._[0]),meta=catalog.items.find(v=>v.id===item.id);console.log(JSON.stringify({...meta,renderer:undefined,reference:'assets/reference/component-library-v0.14.pptx'},null,2));
});
