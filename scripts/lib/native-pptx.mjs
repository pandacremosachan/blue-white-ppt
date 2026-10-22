// Small DrawingML backend for this component library. Node built-ins only.
// It implements the subset of the slide API used by the unchanged renderers.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeZip,readZip} from './zip.mjs';
import {escapeXml as esc,parseXml,all} from './xml.mjs';
const P='http://schemas.openxmlformats.org/presentationml/2006/main',A='http://schemas.openxmlformats.org/drawingml/2006/main',R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const XML='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const emu=n=>Math.round(Number(n)*9525),angle=n=>Math.round(Number(n)*60000);
const font='Noto Sans SC';
const attrs=o=>Object.entries(o).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
function color(value='#000000'){
  const [hex,alpha]=String(value).split('/');
  if(!/^#?[0-9a-f]{6}$/i.test(hex))throw new Error(`Expected an RGB hex color, got ${value}`);
  return `<a:srgbClr val="${hex.replace('#','')}">${alpha!==undefined?`<a:alpha val="${Math.round(Number(alpha)*1000)}"/>`:''}</a:srgbClr>`;
}
function fill(value){
  if(value===undefined||value===null||value==='none')return '<a:noFill/>';
  if(typeof value==='string')return `<a:solidFill>${color(value)}</a:solidFill>`;
  if(value.type==='gradient')return `<a:gradFill rotWithShape="1"><a:gsLst>${value.stops.map(stop=>`<a:gs pos="${Math.round(stop.offset)}">${color(stop.color)}</a:gs>`).join('')}</a:gsLst><a:lin ang="${angle(value.angleDeg??0)}" scaled="1"/></a:gradFill>`;
  throw new Error(`Unsupported native fill ${JSON.stringify(value)}`);
}
function line(value={}){
  const styles={solid:'solid',dashed:'dash',dotted:'dot','dash-dot':'dashDot'};
  return `<a:ln w="${emu(value.width??0)}">${fill(value.fill??'none')}<a:prstDash val="${styles[value.style??'solid']??value.style}"/>${end('headEnd',value.head)}${end('tailEnd',value.tail)}</a:ln>`;
}
function end(tag,data){return data&&data.type!=='none'?`<a:${tag} type="${esc(data.type)}" w="${esc(data.width??'sm')}" len="${esc(data.length??'sm')}"/>`:'';}
function transform(pos){return `<a:xfrm${attrs({rot:pos.rotation?angle(pos.rotation):undefined,flipH:pos.horizontalFlip?'1':undefined,flipV:pos.verticalFlip?'1':undefined})}><a:off x="${emu(pos.left)}" y="${emu(pos.top)}"/><a:ext cx="${emu(Math.max(0,pos.width))}" cy="${emu(Math.max(0,pos.height))}"/></a:xfrm>`;}
function geometry(s){
  if(s.customPaths){
    const paths=s.customPaths.map(p=>`<a:path w="${Math.round(p.width*1000)}" h="${Math.round(p.height*1000)}">${p.commands.map(c=>{
      const point=p=>`<a:pt x="${Math.round(p.x*1000)}" y="${Math.round(p.y*1000)}"/>`;
      if(c.moveTo)return `<a:moveTo>${point(c.moveTo)}</a:moveTo>`;
      if(c.lineTo)return `<a:lnTo>${point(c.lineTo)}</a:lnTo>`;
      if(c.cubicBezTo){const b=c.cubicBezTo;return `<a:cubicBezTo>${point({x:b.x1,y:b.y1})}${point({x:b.x2,y:b.y2})}${point(b)}</a:cubicBezTo>`;}
      if(c.close)return '<a:close/>';throw new Error(`Unsupported custom path command ${JSON.stringify(c)}`);
    }).join('')}</a:path>`).join('');
    return `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst><a:cxn ang="16200000"><a:pos x="hc" y="0"/></a:cxn><a:cxn ang="10800000"><a:pos x="0" y="vc"/></a:cxn><a:cxn ang="5400000"><a:pos x="hc" y="h"/></a:cxn><a:cxn ang="0"><a:pos x="w" y="vc"/></a:cxn></a:cxnLst><a:rect l="0" t="0" r="w" b="h"/><a:pathLst>${paths}</a:pathLst></a:custGeom>`;
  }
  const preset=s.geometry==='textbox'?'rect':s.geometry==='connector'?(s.kind==='elbow'?'bentConnector3':'line'):s.geometry;
  let guides=s.adjustmentList??[];
  if(s.borderRadius!==undefined&&preset==='roundRect'&&!guides.length)guides=[{name:'adj',formula:`val ${Math.round(Math.min(.5,s.borderRadius/Math.min(s.position.width,s.position.height))*100000)}`}];
  return `<a:prstGeom prst="${esc(preset)}"><a:avLst>${guides.map(g=>`<a:gd name="${esc(g.name)}" fmla="${esc(g.formula??`val ${g.value}`)}"/>`).join('')}</a:avLst></a:prstGeom>`;
}
class NativeText{constructor(){this.value='';this.style={};}toString(){return typeof this.value==='string'?this.value:JSON.stringify(this.value);}}
function paragraphs(value){
  if(typeof value==='string'||typeof value==='number')return String(value).split('\n').map(run=>[{run}]);
  if(Array.isArray(value))return value.map(p=>Array.isArray(p)?p:typeof p==='string'?[{run:p}]:[p]);
  return [[{run:String(value??'')}]];
}
function textBody(t){
  const style=t.style??{},inset=typeof style.insets==='number'?{left:style.insets,right:style.insets,top:style.insets,bottom:style.insets}:style.insets??{left:0,right:0,top:0,bottom:0};
  const alignment={left:'l',center:'ctr',right:'r',justify:'just'}[style.alignment??'left'];
  const anchor={top:'t',middle:'ctr',bottom:'b'}[style.verticalAlignment??'top'];
  const body=paragraphs(t.value).map(runs=>`<a:p><a:pPr algn="${alignment}"><a:lnSpc><a:spcPct val="120000"/></a:lnSpc></a:pPr>${runs.map(run=>{
    const st={...style,...(run.style??{})},size=typeof st.fontSize==='string'?parseFloat(st.fontSize)*100:(st.fontSizePt??(st.fontSize??22)*.75)*100;
    return `<a:r><a:rPr${attrs({sz:Math.round(size),b:st.bold?'1':'0',i:st.italic?'1':undefined})}>${fill(st.color??'#1D242B')}<a:latin typeface="${esc(st.typeface??font)}"/><a:ea typeface="${esc(st.typeface??font)}"/><a:cs typeface="${esc(st.typeface??font)}"/></a:rPr><a:t xml:space="preserve">${esc(run.run??run.text??'')}</a:t></a:r>`;
  }).join('')}<a:endParaRPr lang="zh-CN"/></a:p>`).join('');
  return `<p:txBody><a:bodyPr wrap="${style.wrap==='none'?'none':'square'}" anchor="${anchor}" lIns="${emu(inset.left??0)}" rIns="${emu(inset.right??0)}" tIns="${emu(inset.top??0)}" bIns="${emu(inset.bottom??0)}"><a:noAutofit/></a:bodyPr><a:lstStyle/>${body}</p:txBody>`;
}
function port(shape,side){const p=shape.position;return {x:p.left+(side==='left'?0:side==='right'?p.width:p.width/2),y:p.top+(side==='top'?0:side==='bottom'?p.height:p.height/2)};}
function connectionSite(shape,side){
  const map=shape.geometry==='ellipse'?{top:0,left:2,bottom:4,right:6}:shape.geometry==='diamond'?{top:0,right:1,bottom:2,left:3}:{top:0,left:1,bottom:2,right:3};
  return map[side];
}
class NativeShape{
  constructor(slide,options){this.slide=slide;this.id=slide.nextId++;Object.assign(this,options);this.position={left:0,top:0,width:1,height:1,...options.position};this._text=new NativeText();}
  get text(){return this._text;}set text(value){this._text.value=value;}
  bringToFront(){const items=this.slide.shapes.items,i=items.indexOf(this);if(i>=0)items.splice(i,1);items.push(this);return this;}
  sendToBack(){const items=this.slide.shapes.items,i=items.indexOf(this);if(i>=0)items.splice(i,1);items.unshift(this);return this;}
}
class NativeTable{
  constructor(slide,o){this.slide=slide;this.id=slide.nextId++;Object.assign(this,o);this.name=o.name??`table.${this.id}`;this.position={left:o.left,top:o.top,width:o.width,height:o.height};this._cells=Array.from({length:o.rows},(_,r)=>Array.from({length:o.columns},(_,c)=>({text:Object.assign(new NativeText(),{value:o.values?.[r]?.[c]??''}),fill:'#FFFFFF',margins:{left:8,right:8,top:2,bottom:2}})));this.rows=Array.from({length:o.rows},()=>({height:o.height/o.rows}));this.columnWidths=o.columnWidths??Array(o.columns).fill(o.width/o.columns);this.borders={assign:v=>{this.border=v;}};this.cells={set:(r,c,value)=>{this._cells[r][c].text.value=value;},block:({row,column,rowCount,columnCount})=>({assign:settings=>{for(let r=row;r<row+rowCount;r++)for(let c=column;c<column+columnCount;c++)Object.assign(this._cells[r][c],settings);}})};}
  getCell(r,c){return this._cells[r][c];}
}
class NativeSlide{
  constructor(){this.nextId=2;this.background={fill:'#FFFFFF'};this.speakerNotes={text:''};this.groups=[];this.images=[];
    this.shapes={items:[],add:o=>{const s=new NativeShape(this,o);this.shapes.items.push(s);return s;},connect:(from,to,o={})=>{
      if(from.slide!==this||to.slide!==this)throw new Error('Connector endpoints must be on the same slide');
      const a=port(from,o.fromSide??'right'),b=port(to,o.toSide??'left');
      return this.shapes.add({...o,geometry:'connector',position:{left:Math.min(a.x,b.x),top:Math.min(a.y,b.y),width:Math.abs(b.x-a.x),height:Math.abs(b.y-a.y),horizontalFlip:b.x<a.x,verticalFlip:b.y<a.y},from,to});
    }};this.tables={items:[],add:o=>{const t=new NativeTable(this,o);this.tables.items.push(t);return t;}};
  }
}
export class Presentation{
  static create(options={}){return new Presentation(options);}
  constructor({slideSize={width:1280,height:720}}={}){this.slideSize=slideSize;this.title='Blue White Presentation';this.slides={items:[],add:()=>{const s=new NativeSlide();this.slides.items.push(s);return s;}};}
}
function shapeXml(s){
  if(s.geometry==='picture')return `<p:pic><p:nvPicPr><p:cNvPr id="${s.id}" name="${esc(s.name)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${s.imageRel}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>${transform(s.position)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
  if(s.geometry==='connector'){
    const attached=s.from&&s.to?`<a:stCxn id="${s.from.id}" idx="${connectionSite(s.from,s.fromSide??'right')}"/><a:endCxn id="${s.to.id}" idx="${connectionSite(s.to,s.toSide??'left')}"/>`:'';
    return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${s.id}" name="${esc(s.name??`shape.${s.id}`)}"/><p:cNvCxnSpPr>${attached}</p:cNvCxnSpPr><p:nvPr/></p:nvCxnSpPr><p:spPr>${transform(s.position)}${geometry(s)}${line({...s.line,head:s.head,tail:s.tail})}</p:spPr></p:cxnSp>`;
  }
  return `<p:sp><p:nvSpPr><p:cNvPr id="${s.id}" name="${esc(s.name??`shape.${s.id}`)}"/><p:cNvSpPr${s.geometry==='textbox'?' txBox="1"':''}/><p:nvPr/></p:nvSpPr><p:spPr>${transform(s.position)}${geometry(s)}${fill(s.fill)}${line(s.line)}</p:spPr>${s.text.value!==''?textBody(s.text):''}</p:sp>`;
}
function tableXml(t){
  const rows=t._cells.map((row,r)=>`<a:tr h="${emu(t.rows[r].height)}">${row.map(cell=>{
    const margins=cell.margins??{},b=t.border??{fill:'#A6B4C0',width:.8};
    return `<a:tc>${textBody(cell.text).replace('<p:txBody>','<a:txBody>').replace('</p:txBody>','</a:txBody>')}<a:tcPr${attrs({marL:emu(margins.left??8),marR:emu(margins.right??8),marT:emu(margins.top??2),marB:emu(margins.bottom??2),anchor:'ctr'})}>${['L','R','T','B'].map(side=>line(b).replace('<a:ln ',`<a:ln${side} `).replace('</a:ln>',`</a:ln${side}>`)).join('')}${fill(cell.fill)}</a:tcPr></a:tc>`;
  }).join('')}</a:tr>`).join('');
  const p=t.position;
  return `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${t.id}" name="${esc(t.name)}"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr><p:xfrm><a:off x="${emu(p.left)}" y="${emu(p.top)}"/><a:ext cx="${emu(p.width)}" cy="${emu(p.height)}"/></p:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr/><a:tblGrid>${t.columnWidths.map(w=>`<a:gridCol w="${emu(w)}"/>`).join('')}</a:tblGrid>${rows}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
}
function groupXml(slide,objects,group){
  const boxes=objects.map(s=>s.position),left=Math.min(...boxes.map(p=>p.left)),top=Math.min(...boxes.map(p=>p.top)),width=Math.max(1,Math.max(...boxes.map(p=>p.left+p.width))-left),height=Math.max(1,Math.max(...boxes.map(p=>p.top+p.height))-top),id=slide.nextId++;
  return `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="${id}" name="${esc(group.name)}"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="${emu(left)}" y="${emu(top)}"/><a:ext cx="${emu(width)}" cy="${emu(height)}"/><a:chOff x="${emu(left)}" y="${emu(top)}"/><a:chExt cx="${emu(width)}" cy="${emu(height)}"/></a:xfrm></p:grpSpPr>${objects.map(shapeXml).join('')}</p:grpSp>`;
}
const rootTree='<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
function slideXml(slide){
  const consumed=new Set(),groupFor=new Map();
  for(const g of slide.groups){const members=slide.shapes.items.filter(s=>s.name?.startsWith(g.prefix));if(members.length>1){const xml=groupXml(slide,members,g);groupFor.set(members[0],xml);members.forEach(s=>consumed.add(s));}}
  const shapes=slide.shapes.items.map(s=>groupFor.get(s)??(consumed.has(s)?'':shapeXml(s))).join('');
  return XML+`<p:sld xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld><p:bg><p:bgPr>${fill(slide.background.fill)}<a:effectLst/></p:bgPr></p:bg><p:spTree>${rootTree}${shapes}${slide.tables.items.map(tableXml).join('')}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
const relationships=items=>XML+`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map(([id,type,target])=>`<Relationship Id="${id}" Type="${R}/${type}" Target="${esc(target)}"/>`).join('')}</Relationships>`;
export async function exportPptx(presentation){
  const reference=new URL('../../assets/reference/component-library-v0.14.pptx',import.meta.url);
  const referenceParts=readZip(await fs.readFile(reference));
  const parts=new Map([...referenceParts].filter(([name])=>/^ppt\/(slideMasters|slideLayouts|theme|notesMasters)\//.test(name)));
  const master=[...parts.keys()].find(n=>/^ppt\/slideMasters\/[^/]+\.xml$/.test(n)),layout=[...parts.keys()].find(n=>/^ppt\/slideLayouts\/[^/]+\.xml$/.test(n)),notesMaster=[...parts.keys()].find(n=>/^ppt\/notesMasters\/[^/]+\.xml$/.test(n));
  if(!master||!layout||!notesMaster)throw new Error('The bundled reference is missing its native template parts');
  const pRels=[['rId1','slideMaster',master.slice(4)],['rId2','notesMaster',notesMaster.slice(4)]];
  for(const [i,slide] of presentation.slides.items.entries()){
    const number=i+1,imageRels=[];
    for(const [j,image] of slide.shapes.items.filter(s=>s.geometry==='picture').entries()){const name=`image-${number}-${j+1}.${image.imageExtension}`;image.imageRel=`rId${j+3}`;parts.set(`ppt/media/${name}`,image.imageBytes);imageRels.push([image.imageRel,'image',`../media/${name}`]);}
    parts.set(`ppt/slides/slide${number}.xml`,slideXml(slide));
    parts.set(`ppt/slides/_rels/slide${number}.xml.rels`,relationships([['rId1','slideLayout',`../slideLayouts/${path.posix.basename(layout)}`],['rId2','notesSlide',`../notesSlides/notesSlide${number}.xml`],...imageRels]));
    const note=new NativeText();note.value=slide.speakerNotes.text;note.style={typeface:font,fontSize:12};
    parts.set(`ppt/notesSlides/notesSlide${number}.xml`,XML+`<p:notes xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld><p:spTree>${rootTree}<p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes"/><p:cNvSpPr/><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/>${textBody(note)}</p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`);
    parts.set(`ppt/notesSlides/_rels/notesSlide${number}.xml.rels`,relationships([['rId1','notesMaster',`../notesMasters/${path.posix.basename(notesMaster)}`],['rId2','slide',`../slides/slide${number}.xml`]]));
    pRels.push([`rId${number+2}`,'slide',`slides/slide${number}.xml`]);
  }
  parts.set('ppt/presentation.xml',XML+`<p:presentation xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst><p:sldIdLst>${presentation.slides.items.map((_,i)=>`<p:sldId id="${256+i}" r:id="rId${i+3}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${emu(presentation.slideSize.width)}" cy="${emu(presentation.slideSize.height)}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle/></p:presentation>`);
  parts.set('ppt/_rels/presentation.xml.rels',relationships(pRels));
  parts.set('_rels/.rels',relationships([['rId1','officeDocument','ppt/presentation.xml']]));
  const ct=parseXml(referenceParts.get('[Content_Types].xml').toString());
  const inherited=all(ct,'Override').filter(n=>/^\/ppt\/(slideMasters|slideLayouts|theme|notesMasters)\//.test(n.attrs.PartName)&&parts.has(n.attrs.PartName.slice(1))).map(n=>[n.attrs.PartName,n.attrs.ContentType]);
  const overrides=[...inherited,['/ppt/presentation.xml','application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'],...presentation.slides.items.flatMap((_,i)=>[[`/ppt/slides/slide${i+1}.xml`,'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'],[`/ppt/notesSlides/notesSlide${i+1}.xml`,'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml']])];
  parts.set('[Content_Types].xml',XML+`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/>${overrides.map(([name,type])=>`<Override PartName="${name}" ContentType="${type}"/>`).join('')}</Types>`);
  return writeZip(parts);
}
export async function savePptx(presentation,filename,{overwrite=false}={}){const buffer=await exportPptx(presentation);await fs.mkdir(path.dirname(path.resolve(filename)),{recursive:true});await fs.writeFile(filename,buffer,{flag:overwrite?'w':'wx'});return {path:path.resolve(filename),bytes:buffer.length};}
