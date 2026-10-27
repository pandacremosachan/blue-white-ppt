import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isBuiltin} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readZip} from './lib/zip.mjs';

const PREFIX='blue-white-ppt/';
const HASH=/^[a-f\d]{64}$/i;
const ROOT_FILES=new Set(['README.md','SKILL.md','package.json','package-manifest.json']);
const ROOT_DIRECTORIES=new Set(['agents','assets','references','scripts','tests']);
const FORBIDDEN_DIRECTORIES=new Set(['design','build','output','dist','coverage','node_modules','tmp','temp','checks','superseded']);
const TEMPORARY_ASSET=/(?:^|[-_. ])(?:draft|candidate|roundtrip|oracle|temporary)(?:[-_. ]|$)/i;
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const textOf=bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes);
const safeRelative=value=>typeof value==='string'&&value.length>0&&!value.includes('\\')&&!/[\u0000-\u001f\u007f]/.test(value)
  &&!value.startsWith('/')&&!/^[a-z]:/i.test(value)&&value.split('/').every(piece=>piece&&piece!=='.'&&piece!=='..');

export const REQUIRED_RELEASE_FILES=Object.freeze([
  'README.md','SKILL.md','package.json','package-manifest.json',
  'scripts/api.mjs','scripts/create-deck.mjs','scripts/doctor.mjs','scripts/init-deck.mjs',
  'scripts/inspect-component.mjs','scripts/reference-page.mjs','scripts/render.mjs',
  'scripts/install.mjs','scripts/pack-skill.mjs','scripts/validate-pptx.mjs',
  'scripts/verify-release.mjs','scripts/run-tests.mjs','scripts/self-test.mjs',
  'scripts/lib/native-pptx.mjs','scripts/lib/xml.mjs','scripts/lib/zip.mjs','scripts/lib/release-files.mjs',
  'scripts/components/index.mjs','scripts/components/style.json',
  'references/catalog.json','references/provenance.json','references/capabilities.json','references/showcase-catalog.json',
  'references/style-and-layout.md','references/api-and-plan.md','references/component-guide.md',
  'references/script-reference.md','references/portability.md',
  'assets/fonts/NotoSansSC-VF.ttf','assets/fonts/OFL.txt',
  'assets/reference/component-library-v0.14.pptx',
  'assets/examples/minimal-plan.json','assets/examples/draw.mjs',
  'assets/examples/trapezoid/build-deck.mjs','assets/examples/trapezoid/research-sources.json',
]);

// Mask comments without discarding quoted strings or treating URL slashes as
// comments. Regex literals are masked too, so their quote characters do not
// become apparent import or path strings. This is a small lexical check, not a
// JavaScript execution engine or a proof about computed runtime dependencies.
function maskComments(source){
  let out='',i=0,lastToken='';
  while(i<source.length){
    const c=source[i],next=source[i+1];
    if(c==='"'||c==="'"||c==='`'){
      const quote=c;out+=c;i++;
      while(i<source.length){const ch=source[i++];out+=ch;if(ch==='\\'&&i<source.length)out+=source[i++];else if(ch===quote)break;}
      lastToken='literal';continue;
    }
    if(c==='/'&&next==='/'){
      out+='  ';i+=2;while(i<source.length&&!/[\r\n]/.test(source[i])){out+=' ';i++;}continue;
    }
    if(c==='/'&&next==='*'){
      out+='  ';i+=2;while(i<source.length&&!(source[i]==='*'&&source[i+1]==='/')){out+=/[\r\n]/.test(source[i])?source[i]:' ';i++;}
      if(i<source.length){out+='  ';i+=2;}continue;
    }
    const mayStartRegex=!lastToken||/[=(:,\[!&|?{;]/.test(lastToken.at(-1))||/^(?:return|case|throw)$/.test(lastToken);
    if(c==='/'&&mayStartRegex){
      out+=' ';i++;let inClass=false;
      while(i<source.length){const ch=source[i++];out+=' ';if(ch==='\\'&&i<source.length){out+=' ';i++;continue;}if(ch==='[')inClass=true;if(ch===']')inClass=false;if(ch==='/'&&!inClass)break;}
      while(/[a-z]/i.test(source[i]??'')&&i<source.length){out+=' ';i++;}
      lastToken='literal';continue;
    }
    if(/[a-z_$]/i.test(c)){
      let token='';while(i<source.length&&/[\w$]/.test(source[i]))token+=source[i++];out+=token;lastToken=token;continue;
    }
    out+=c;i++;if(!/\s/.test(c))lastToken=c;
  }
  return out;
}

function localAbsolute(value){
  return /^[a-z]:[\\/]/i.test(value)||/^\\\\[^\\]+\\/.test(value)
    ||/^file:\/\//i.test(value)||/^\/(?:Users|home|tmp|var|opt|mnt|data|workspace|root|Volumes)\//.test(value);
}

export function verifyReleaseBytes(bytes,{archive='<buffer>'}={}){
  const errors=[],warnings=[];
  const error=(code,message,member)=>errors.push({code,...(member?{path:member}:{}),message});
  const report={archive,archiveSha256:digest(bytes),status:'fail',version:null,counts:{files:0,manifestFiles:0,showcases:0,showcaseFiles:0,entrypoints:0,staticModuleReferences:0,staticAssetReferences:0},errors,warnings,
    scope:'ZIP inventory, versions, hashes, declared showcases and static literal dependency closure; does not execute code or prove visual quality and computed runtime dependencies.'};
  let parts;
  try{parts=readZip(bytes);}catch(cause){error('INVALID_ZIP',cause.message);return report;}
  const files=new Map();
  for(const [member,content]of parts){
    if(!member.startsWith(PREFIX)){error('TOP_LEVEL','All members must be under exactly one blue-white-ppt/ directory',member);continue;}
    const relative=member.slice(PREFIX.length),directory=relative.endsWith('/');
    if(!relative)continue;
    const checked=directory?relative.slice(0,-1):relative;
    if(!safeRelative(checked)){error('UNSAFE_MEMBER','Member path must be a normalized package-relative path',member);continue;}
    const pieces=checked.split('/'),root=pieces[0],leaf=pieces.at(-1);
    if((!directory&&pieces.length===1&&!ROOT_FILES.has(root))||((directory||pieces.length>1)&&!ROOT_DIRECTORIES.has(root))
      ||pieces.some(piece=>piece.startsWith('.')||FORBIDDEN_DIRECTORIES.has(piece.toLowerCase()))){
      error('FORBIDDEN_MEMBER','Development, hidden or unrecognized release member',relative);
    }
    if(!directory){
      if(/(?:\.zip|\.log|\.tmp|\.bak)$/i.test(leaf)||leaf.startsWith('~$')||leaf.endsWith('~'))error('FORBIDDEN_MEMBER','Nested archives and temporary files must not ship',relative);
      if(root==='assets'&&TEMPORARY_ASSET.test(leaf))error('FORBIDDEN_MEMBER','Draft, candidate and roundtrip assets must not ship',relative);
      files.set(relative,content);
    }
  }
  report.counts.files=files.size;
  for(const required of [...REQUIRED_RELEASE_FILES,...Array.from({length:53},(_,i)=>`assets/reference/slide-${String(i+1).padStart(2,'0')}.png`)]){
    if(!files.has(required))error('MISSING_REQUIRED','Required runtime, reference or example file is missing',required);
  }
  const readJson=member=>{
    if(!files.has(member))return null;
    try{return JSON.parse(textOf(files.get(member)));}catch(cause){error('INVALID_METADATA',cause.message,member);return null;}
  };
  const manifest=readJson('package-manifest.json'),pkg=readJson('package.json'),capabilities=readJson('references/capabilities.json'),catalog=readJson('references/showcase-catalog.json');
  if(manifest){
    if(manifest.name!=='blue-white-ppt')error('PACKAGE_NAME','Manifest must name blue-white-ppt','package-manifest.json');
    if(!Array.isArray(manifest.files))error('INVALID_MANIFEST','Manifest files must be an array','package-manifest.json');
    else{
      report.counts.manifestFiles=manifest.files.length;const listed=new Set();
      for(const item of manifest.files){
        if(!item||!safeRelative(item.path)||item.path==='package-manifest.json'){error('INVALID_MANIFEST_PATH','Invalid manifest file path','package-manifest.json');continue;}
        if(listed.has(item.path))error('DUPLICATE_MANIFEST_PATH','Manifest lists the same file more than once',item.path);
        listed.add(item.path);const content=files.get(item.path);
        if(!content){error('MANIFEST_FILE_SET','Manifest file is missing from ZIP',item.path);continue;}
        if(!Number.isSafeInteger(item.bytes)||item.bytes<0||item.bytes!==content.length)error('MANIFEST_BYTES','Manifest byte count does not match ZIP content',item.path);
        if(typeof item.sha256!=='string'||!HASH.test(item.sha256)||item.sha256.toLowerCase()!==digest(content))error('MANIFEST_SHA256','Manifest SHA-256 does not match ZIP content',item.path);
      }
      for(const member of files.keys())if(member!=='package-manifest.json'&&!listed.has(member))error('MANIFEST_FILE_SET','ZIP file is not listed in manifest',member);
    }
  }
  if(pkg){
    if(pkg.name!=='blue-white-ppt')error('PACKAGE_NAME','package.json must name blue-white-ppt','package.json');
    report.version=pkg.version;
    if(typeof pkg.version!=='string'||!/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(pkg.version))error('INVALID_VERSION','package.json must have a valid release version','package.json');
    if(manifest&&manifest.version!==pkg.version)error('VERSION_MISMATCH','Manifest and package.json versions differ','package-manifest.json');
    if(capabilities&&capabilities.release!==pkg.version)error('VERSION_MISMATCH','Capabilities release and package.json versions differ','references/capabilities.json');
    if(files.has('SKILL.md')){
      let metadata='';try{metadata=textOf(files.get('SKILL.md')).match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]??'';}catch(cause){error('INVALID_METADATA',cause.message,'SKILL.md');}
      const version=metadata.match(/^\s+version:\s*["']?([^\s"']+)/m)?.[1];
      const name=metadata.match(/^name:\s*([\w-]+)/m)?.[1];
      if(name!=='blue-white-ppt')error('PACKAGE_NAME','SKILL front matter must name blue-white-ppt','SKILL.md');
      if(version!==pkg.version)error('VERSION_MISMATCH','SKILL metadata and package.json versions differ','SKILL.md');
    }
  }
  const entrypoints=new Set();
  const declaredPath=(value,owner,{entrypoint=false}={})=>{
    if(!safeRelative(value)){error('INVALID_DECLARED_PATH','Declared path must be package-relative',owner);return;}
    if(!files.has(value))error('MISSING_DECLARED_FILE','Declared file is missing from ZIP',value);
    if(entrypoint){entrypoints.add(value);if(!value.endsWith('.mjs'))error('INVALID_ENTRYPOINT','Entrypoint must be a packaged .mjs module',value);}
  };
  if(catalog){
    if(catalog.schemaVersion!==1||!Array.isArray(catalog.showcases)||!catalog.showcases.length)error('INVALID_SHOWCASE_CATALOG','Expected schemaVersion 1 and a nonempty showcases array','references/showcase-catalog.json');
    else{
      const ids=new Set();report.counts.showcases=catalog.showcases.length;
      for(const showcase of catalog.showcases){
        if(!showcase||typeof showcase.id!=='string'||!showcase.id||ids.has(showcase.id)){error('INVALID_SHOWCASE_CATALOG','Each showcase needs a unique nonempty id','references/showcase-catalog.json');continue;}
        ids.add(showcase.id);
        if(!Array.isArray(showcase.files)||!showcase.files.length){error('INVALID_SHOWCASE_CATALOG','Showcase files must be a nonempty array',showcase.id);continue;}
        const seen=new Set();
        for(const item of showcase.files){
          if(!item||typeof item!=='object'){error('INVALID_SHOWCASE_CATALOG','Showcase file records must be objects',showcase.id);continue;}
          report.counts.showcaseFiles++;declaredPath(item?.path,'references/showcase-catalog.json');
          if(seen.has(item?.path))error('DUPLICATE_SHOWCASE_PATH','Showcase declares a file twice',item.path);seen.add(item?.path);
          const content=files.get(item?.path);if(!content)continue;
          if(!['presentation','preview','video'].includes(item.role))error('INVALID_SHOWCASE_ROLE','Unrecognized showcase file role',item.path);
          if(!Number.isSafeInteger(item.bytes)||item.bytes!==content.length)error('SHOWCASE_BYTES','Showcase byte count does not match ZIP content',item.path);
          if(typeof item.sha256!=='string'||!HASH.test(item.sha256)||item.sha256.toLowerCase()!==digest(content))error('SHOWCASE_SHA256','Showcase SHA-256 does not match ZIP content',item.path);
        }
        if(showcase.entrypoint){declaredPath(showcase.entrypoint.path,'references/showcase-catalog.json',{entrypoint:true});if(!Array.isArray(showcase.entrypoint.args)||showcase.entrypoint.args.some(arg=>typeof arg!=='string'||localAbsolute(arg)||path.posix.isAbsolute(arg)))error('INVALID_ENTRYPOINT_ARGS','Entrypoint args must be portable strings','references/showcase-catalog.json');}
      }
      if(capabilities?.examples)for(const item of Object.values(capabilities.examples))if(item?.catalogId&&!ids.has(item.catalogId))error('MISSING_SHOWCASE','Capabilities refer to a missing showcase',item.catalogId);
    }
  }
  if(capabilities){
    if(capabilities.schemaVersion!==1)error('INVALID_CAPABILITIES','Expected capabilities schemaVersion 1','references/capabilities.json');
    for(const item of capabilities.core?.entrypoints??[])declaredPath(item?.path,'references/capabilities.json',{entrypoint:true});
    for(const item of Object.values(capabilities.examples??{}))if(item?.entrypoint)declaredPath(item.entrypoint.path,'references/capabilities.json',{entrypoint:true});
  }
  if(pkg?.scripts&&typeof pkg.scripts==='object')for(const command of Object.values(pkg.scripts)){
    if(typeof command!=='string')continue;const match=command.match(/^node\s+([^\s]+)/);if(match)declaredPath(match[1],'package.json',{entrypoint:true});
  }
  report.counts.entrypoints=entrypoints.size;
  for(const [member,content]of files){
    if(!member.endsWith('.mjs')||!(member.startsWith('scripts/')||member.startsWith('assets/examples/')))continue;
    let source;try{source=maskComments(textOf(content));}catch(cause){error('INVALID_RUNTIME_UTF8',cause.message,member);continue;}
    const specifiers=new Set();
    for(const match of source.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?(['"])([^'"\r\n]+)\1/g))specifiers.add(match[2]);
    for(const match of source.matchAll(/\bimport\s*\(\s*(['"])([^'"\r\n]+)\1/g))specifiers.add(match[2]);
    for(const specifier of specifiers){
      report.counts.staticModuleReferences++;
      if(isBuiltin(specifier))continue;
      if(localAbsolute(specifier)||path.posix.isAbsolute(specifier)||!specifier.startsWith('.')){error('NONPORTABLE_MODULE','Runtime imports must use Node built-ins or packaged relative modules',member);continue;}
      const target=path.posix.normalize(path.posix.join(path.posix.dirname(member),specifier.split(/[?#]/)[0]));
      if(!safeRelative(target)||!files.has(target))error('MISSING_MODULE',`Relative module is not packaged: ${specifier}`,member);
    }
    for(const match of source.matchAll(/new\s+URL\s*\(\s*(['"])([^'"\r\n]+)\1\s*,\s*import\.meta\.url\s*\)/g)){
      const specifier=match[2];report.counts.staticAssetReferences++;
      if(localAbsolute(specifier)||path.posix.isAbsolute(specifier)){error('NONPORTABLE_ASSET','Runtime asset must be package-relative',member);continue;}
      const directory=specifier.endsWith('/'),target=path.posix.normalize(path.posix.join(path.posix.dirname(member),specifier)).replace(/\/$/,'');
      const exists=directory?(target==='.'||[...files.keys()].some(file=>file.startsWith(target+'/'))):files.has(target);
      if(!exists||!(safeRelative(target)||(directory&&target==='.')))error('MISSING_ASSET',`Static URL target is not packaged: ${specifier}`,member);
    }
    const assignments=/(?:\b(?:const|let|var)\s+[\w$]+\s*=\s*|\b(?:readFile|readFileSync|copyFile|access|stat|lstat|require)\s*\(\s*)(['"])((?:\\.|[^\\])*?)\1/g;
    for(const match of source.matchAll(assignments))if(localAbsolute(match[2].replace(/\\\\/g,'\\')))error('ABSOLUTE_RUNTIME_PATH','Runtime source contains a hardcoded local path dependency',member);
  }
  report.status=errors.length?'fail':'pass';return report;
}

export async function verifyReleaseFile(filename){
  const archive=path.resolve(filename);
  try{return verifyReleaseBytes(await fs.readFile(archive),{archive});}
  catch(cause){return {archive,status:'fail',errors:[{code:'READ_ARCHIVE',message:cause.message}],warnings:[]};}
}

async function main(){
  const argv=process.argv.slice(2);let archive,reportPath;
  if(argv.includes('--help')){console.log('node scripts/verify-release.mjs ARCHIVE [--report FILE]');return;}
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(arg==='--report'){if(reportPath||!argv[i+1]||argv[i+1].startsWith('--'))throw new Error('--report requires one file path');reportPath=path.resolve(argv[++i]);}
    else if(arg.startsWith('--')||archive)throw new Error(`Unexpected argument ${arg}`);
    else archive=arg;
  }
  if(!archive)throw new Error('Archive is required; use --help');
  if(reportPath){
    const fold=value=>process.platform==='win32'?value.toLowerCase():value;
    let same=fold(path.resolve(archive))===fold(reportPath);
    const existing=async filename=>{try{return {real:await fs.realpath(filename),stat:await fs.stat(filename)};}catch(cause){if(['ENOENT','ENOTDIR'].includes(cause.code))return null;throw cause;}};
    if(!same){
      const [input,output]=await Promise.all([existing(path.resolve(archive)),existing(reportPath)]);
      if(input&&output)same=fold(input.real)===fold(output.real)||(input.stat.ino!==0&&input.stat.dev===output.stat.dev&&input.stat.ino===output.stat.ino);
    }
    if(same)throw new Error('Report path must differ from the input archive');
  }
  const report=await verifyReleaseFile(archive),json=JSON.stringify(report,null,2)+'\n';
  if(reportPath){await fs.mkdir(path.dirname(reportPath),{recursive:true});await fs.writeFile(reportPath,json);}
  process.stdout.write(json);if(report.status!=='pass')process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{await main();}catch(cause){console.error(`Error: ${cause.message}`);process.exitCode=1;}
}
