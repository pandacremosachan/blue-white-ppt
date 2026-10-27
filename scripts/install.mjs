import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {constants} from 'node:fs';
import {releaseFiles,isWithin} from './lib/release-files.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node install.mjs [--harness codex|pi|shared] [--target /exact/path/blue-white-ppt]');return;}
  const source=path.dirname(path.dirname(fileURLToPath(import.meta.url))),harness=a.harness??'codex';
  const roots={codex:path.join(process.env.CODEX_HOME??path.join(os.homedir(),'.codex'),'skills'),pi:path.join(process.env.PI_CODING_AGENT_DIR??path.join(os.homedir(),'.pi/agent'),'skills'),shared:path.join(os.homedir(),'.agents/skills')};
  if(!roots[harness])throw new Error('Harness must be codex, pi or shared');
  const target=path.resolve(a.target??path.join(roots[harness],'blue-white-ppt'));
  if(isWithin(source,target))throw new Error('Install target cannot be inside the source skill');
  try{await fs.lstat(target);throw new Error(`Target already exists; choose another location: ${target}`);}catch(error){if(error.code!=='ENOENT')throw error;}
  const files=await releaseFiles(source);
  await fs.mkdir(path.dirname(target),{recursive:true});await fs.mkdir(target);
  for(const {path:relative,filename} of files){
    const destination=path.join(target,...relative.split('/'));await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(filename,destination,constants.COPYFILE_EXCL);
  }
  console.log(JSON.stringify({source,target,harness,files:files.length,note:'Skill runtime, documentation and assets installed. Restart/reload skill discovery in your harness. No harness settings or other skills changed.'},null,2));
});
