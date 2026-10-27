import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// Pass explicit test paths for Node 20 on Windows, where the shell does not
// expand globs. Avoid Node's default discovery running scripts/self-test.mjs.
const directory=fileURLToPath(new URL('../tests/',import.meta.url));
if(process.argv.includes('--help')){console.log('node scripts/run-tests.mjs — run the packaged regression suite');process.exit(0);}
const files=(await fs.readdir(directory)).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>path.join(directory,name));
if(!files.length)throw new Error('No regression tests found');
const result=spawnSync(process.execPath,['--test',...files],{stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;
process.exitCode=result.status??1;
