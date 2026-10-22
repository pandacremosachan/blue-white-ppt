import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {writeZip} from './lib/zip.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node pack-skill.mjs --output /path/to/blue-white-ppt-skill-v1.0.0.zip');return;}
  if(!a.output)throw new Error('--output is required');
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),output=path.resolve(a.output),parts=new Map(),files=[];
  if(output.startsWith(root+path.sep))throw new Error('Write the archive outside the skill directory');
  async function visit(directory,relative=''){
    for(const item of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
      if(item.isSymbolicLink())throw new Error(`Unexpected symbolic link ${item.name}`);
      const name=relative?`${relative}/${item.name}`:item.name,filename=path.join(directory,item.name);
      if(item.isDirectory())await visit(filename,name);else{const data=await fs.readFile(filename);parts.set(`blue-white-ppt/${name}`,data);files.push({path:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
    }
  }
  await visit(root);const manifest={name:'blue-white-ppt',version:'1.0.0',files};parts.set('blue-white-ppt/package-manifest.json',Buffer.from(JSON.stringify(manifest,null,2)));
  const bytes=writeZip(parts);await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,bytes,{flag:'wx'});
  console.log(JSON.stringify({output,files:parts.size,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')},null,2));
});
