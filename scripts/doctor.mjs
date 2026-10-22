import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {findProgram} from './lib/system.mjs';
import {argumentsOf,run} from './lib/cli.mjs';
await run(async()=>{
  const a=argumentsOf();if(a.help){console.log('node doctor.mjs [--soffice path] [--pdftoppm path]');return;}
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),reference=path.join(root,'assets/reference/component-library-v0.14.pptx'),font=path.join(root,'assets/fonts/NotoSansSC-VF.ttf');
  const bytes=await fs.readFile(reference),stat=await fs.stat(font),nodeMajor=Number(process.versions.node.split('.')[0]),provenance=JSON.parse(await fs.readFile(path.join(root,'references/provenance.json'),'utf8')),sha256=createHash('sha256').update(bytes).digest('hex'),referenceIntact=sha256===provenance.reference.sha256;
  const report={node:process.version,coreReady:nodeMajor>=20&&referenceIntact&&stat.size>0,platform:process.platform,skillRoot:root,reference:{path:reference,sha256,intact:referenceIntact,pages:53},font:{family:'Noto Sans SC',bundled:true,bytes:stat.size,note:'Install the bundled font on the rendering/viewing system to preserve typography.'},rendering:{soffice:findProgram('soffice',a.soffice),pdftoppm:findProgram('pdftoppm',a.pdftoppm)},coreDependencies:'Node.js built-ins only; no npm packages, Codex APIs, MCP, Python, or network access required for PPTX generation.'};
  console.log(JSON.stringify(report,null,2));if(!report.coreReady)process.exitCode=1;
});
