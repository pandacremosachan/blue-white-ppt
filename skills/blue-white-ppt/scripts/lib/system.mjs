import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
export function findProgram(name,explicit){
  if(explicit)return explicit;
  const candidates=[name];
  if(process.platform==='win32'&&name==='soffice')candidates.push(...['ProgramFiles','ProgramFiles(x86)'].filter(k=>process.env[k]).map(k=>`${process.env[k]}/LibreOffice/program/soffice.exe`));
  if(process.platform==='darwin'&&name==='soffice')candidates.push('/Applications/LibreOffice.app/Contents/MacOS/soffice');
  for(const program of candidates){const r=spawnSync(program,['--version'],{encoding:'utf8',windowsHide:true,timeout:10000});if(!r.error)return program;}return null;
}
