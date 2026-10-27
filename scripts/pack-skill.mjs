import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {writeZip} from './lib/zip.mjs';
import {releaseFiles,isWithin} from './lib/release-files.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node pack-skill.mjs --output /path/to/blue-white-ppt-skill-v<version>.zip');return;}
  if(!a.output)throw new Error('--output is required');
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),output=path.resolve(a.output),parts=new Map(),files=[];
  if(isWithin(root,output))throw new Error('Write the archive outside the skill directory');
  for(const {path:name,filename} of await releaseFiles(root)){
    const data=await fs.readFile(filename);parts.set(`blue-white-ppt/${name}`,data);files.push({path:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
  }
  const {version}=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
  const manifest={name:'blue-white-ppt',version,files};parts.set('blue-white-ppt/package-manifest.json',Buffer.from(JSON.stringify(manifest,null,2)));
  const bytes=writeZip(parts);await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,bytes,{flag:'wx'});
  console.log(JSON.stringify({output,files:parts.size,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')},null,2));
});
