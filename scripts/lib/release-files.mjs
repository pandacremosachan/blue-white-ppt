import fs from 'node:fs/promises';
import path from 'node:path';

// Keep installation and distribution independent of the checkout's local state.
const ROOT_FILES = ['README.md','SKILL.md','package.json'];
const DIRECTORIES = {
  agents: new Set(['.yaml','.yml']),
  assets: null,
  references: new Set(['.md','.json']),
  scripts: new Set(['.mjs','.json']),
};
const EXCLUDED_DIRECTORIES = new Set(['node_modules','coverage','dist','build']);

export async function releaseFiles(root){
  const files=[];
  async function visit(relative,extensions){
    const filename=path.join(root,...relative.split('/')),stat=await fs.lstat(filename);
    if(stat.isSymbolicLink())throw new Error(`Unexpected symbolic link ${relative}`);
    if(stat.isDirectory()){
      for(const item of (await fs.readdir(filename,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
        if(item.name.startsWith('.')||EXCLUDED_DIRECTORIES.has(item.name))continue;
        await visit(`${relative}/${item.name}`,extensions);
      }
    }else if(stat.isFile()&&!relative.toLowerCase().endsWith('.zip')&&(!extensions||extensions.has(path.extname(relative).toLowerCase()))){
      files.push({path:relative,filename});
    }
  }
  for(const relative of ROOT_FILES)await visit(relative);
  for(const [relative,extensions] of Object.entries(DIRECTORIES))await visit(relative,extensions);
  const tests=await fs.lstat(path.join(root,'tests')).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(tests)await visit('tests');
  return files.sort((a,b)=>a.path.localeCompare(b.path));
}

export function isWithin(directory,candidate){
  const relative=path.relative(directory,candidate);
  return relative===''||(!relative.startsWith(`..${path.sep}`)&&relative!=='..'&&!path.isAbsolute(relative));
}
