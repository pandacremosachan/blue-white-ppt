import fs from 'node:fs/promises';
import path from 'node:path';

// A skill directory is copied as a whole; development files live outside it.
export async function directoryFiles(root){
  const files=[];
  async function visit(relative){
    const filename=path.join(root,...relative.split('/')),stat=await fs.lstat(filename);
    if(stat.isSymbolicLink())throw new Error(`Unexpected symbolic link ${relative}`);
    if(stat.isDirectory()){
      for(const item of (await fs.readdir(filename,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
        await visit(relative?`${relative}/${item.name}`:item.name);
      }
    }else if(stat.isFile()){
      files.push({path:relative,filename});
    }
  }
  await visit('');
  return files.sort((a,b)=>a.path.localeCompare(b.path));
}

export function isWithin(directory,candidate){
  const relative=path.relative(directory,candidate);
  return relative===''||(!relative.startsWith(`..${path.sep}`)&&relative!=='..'&&!path.isAbsolute(relative));
}
