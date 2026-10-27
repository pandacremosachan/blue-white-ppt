// Experimental, example-local native Morph serialization. This is not part of
// the production authoring API or a general plan compiler.
// The hierarchy and option spellings were checked against a desktop PowerPoint
// oracle saved with EntryEffect 3954, 3955 and 3956, Duration 1.25 seconds.
// https://learn.microsoft.com/en-us/openspecs/office_standards/ms-pptx/
// https://support.microsoft.com/en-us/powerpoint/morph-transition-tips-and-tricks
export const MORPH_MODES=Object.freeze({object:'byObject',word:'byWord',character:'byChar'});

export function makeMorphTransition({mode='object',durationMs=1250,fallback='fade'}={}){
  if(!Object.hasOwn(MORPH_MODES,mode))throw new TypeError('Morph mode must be object, word or character');
  if(!Number.isInteger(durationMs)||durationMs<100||durationMs>10000)throw new RangeError('Morph durationMs must be an integer from 100 to 10000');
  if(!['fade','none'].includes(fallback))throw new TypeError('Morph fallback must be fade or none');
  const simple=fallback==='fade'?'<p:transition spd="slow"><p:fade/></p:transition>':'<p:transition spd="slow"/>';
  return `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159"><p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="${durationMs}"><p159:morph option="${MORPH_MODES[mode]}"/></p:transition></mc:Choice><mc:Fallback>${simple}</mc:Fallback></mc:AlternateContent>`;
}

export function forceMorphName(key){
  if(typeof key!=='string'||!key.trim()||key.startsWith('!!')||/[\u0000-\u001f]/.test(key))throw new TypeError('Morph continuity key must be a nonempty plain string without !! prefix or control characters');
  return `!!${key}`;
}
export function setMorphIdentity(shape,key){shape.name=forceMorphName(key);return shape;}
