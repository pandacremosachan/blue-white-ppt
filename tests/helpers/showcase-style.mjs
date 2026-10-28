import assert from 'node:assert/strict';
import {all} from '../../skills/blue-white-ppt/scripts/lib/xml.mjs';

const EMU=9525,TOLERANCE=0.001;
const near=(a,b)=>Math.abs(a-b)<TOLERANCE;
export const objectName=node=>all(node,'cNvPr')[0]?.attrs.name??'';
export const objectText=node=>all(node,'t').map(text=>text.text).join('\n');
export const slideObjects=tree=>['sp','cxnSp','graphicFrame','pic'].flatMap(local=>all(tree,local));
export function boundsOf(node){
 const transform=all(node,'xfrm')[0],offset=all(transform,'off')[0],extent=all(transform,'ext')[0];
 assert.ok(offset&&extent,`Native transform for ${objectName(node)}`);
 return [Number(offset.attrs.x)/EMU,Number(offset.attrs.y)/EMU,Number(extent.attrs.cx)/EMU,Number(extent.attrs.cy)/EMU];
}
export function assertBounds(node,expected,message=objectName(node)){
 const actual=boundsOf(node);
 assert.ok(actual.every((value,index)=>near(value,expected[index])),`${message}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
export function findAt(tree,expected){
 const found=slideObjects(tree).filter(node=>boundsOf(node).every((value,index)=>near(value,expected[index])));
 assert.equal(found.length,1,`Exactly one native object at ${JSON.stringify(expected)}`);
 return found[0];
}
export function assertCompleteFrame(node){
 assert.equal(all(node,'prstGeom')[0]?.attrs.prst,'rect',`Complete rectangular frame: ${objectName(node)}`);
 const line=all(node,'ln')[0];
 assert.ok(line&&Number(line.attrs.w)>0&&Number(line.attrs.w)<=2*EMU,`Thin outline: ${objectName(node)}`);
 assert.equal(all(line,'noFill').length,0,`Visible outline: ${objectName(node)}`);
 assert.equal(all(line,'srgbClr')[0]?.attrs.val.toUpperCase(),'A6B4C0',`Reference outline color: ${objectName(node)}`);
}
export function assertContains(frame,node){
 const [x,y,w,h]=boundsOf(frame),[nx,ny,nw,nh]=boundsOf(node);
 assert.ok(nx>=x-TOLERANCE&&ny>=y-TOLERANCE&&nx+nw<=x+w+TOLERANCE&&ny+nh<=y+h+TOLERANCE,
  `${objectName(node)} ${JSON.stringify([nx,ny,nw,nh])} must be inside ${objectName(frame)} ${JSON.stringify([x,y,w,h])}`);
}
export function assertBodyInFrames(tree,frames){
 assert.ok(frames.length>0,'The page has complete body frames');
 for(const frame of frames)assertCompleteFrame(frame);
 for(const node of slideObjects(tree).filter(node=>{const y=boundsOf(node)[1];return y>=190-TOLERANCE&&y<698-TOLERANCE;})){
  const [nx,ny,nw,nh]=boundsOf(node);
  assert.ok(frames.some(frame=>{const [x,y,w,h]=boundsOf(frame);return nx>=x-TOLERANCE&&ny>=y-TOLERANCE&&nx+nw<=x+w+TOLERANCE&&ny+nh<=y+h+TOLERANCE;}),
   `Body object ${objectName(node)} ${JSON.stringify([nx,ny,nw,nh])} belongs inside a complete region frame`);
 }
}
export function assertReferenceSlideStyle(tree,{chapterNumber,page,total}){
 const chapter=findAt(tree,[50,12,88,61]);
 assert.equal(objectText(chapter),chapterNumber,`Chapter number on physical page ${page}`);
 assert.equal(objectText(findAt(tree,[1030,700,202,19])),`${page} / ${total}`,`Physical footer on page ${page}`);
 const summary=findAt(tree,[48,94,1184,78]);assertCompleteFrame(summary);
 const summaryProperties=summary.children.find(node=>node.local==='spPr'),summaryFill=summaryProperties?.children.find(node=>node.local==='solidFill');
 assert.equal(all(summaryFill,'srgbClr')[0]?.attrs.val.toUpperCase(),'FFFFFF','The C02 lead retains the reference white fill');
 const chevrons=[[63,116,15.64,23],[73.12,116,15.64,23]].map(bounds=>findAt(tree,bounds));
 for(const chevron of chevrons)assert.equal(all(chevron,'prstGeom')[0]?.attrs.prst,'chevron','Native C04 double chevron');
 const summaryText=findAt(tree,[101,103,1110,60]),runs=all(summaryText,'rPr');
 assert.ok(objectText(summaryText).trim().length>0,'The summary has visible text');assert.ok(runs.length>0,'The summary has native editable text runs');
 assert.ok(runs.every(run=>run.attrs.sz==='1725'&&run.attrs.b==='1'),'Summary text is 23 design px and bold');
 const furniture=[
  [12,10,32,64],[50,12,88,61],[144,10,1124,64],[164,12,850,60],[1022,22,226,40],
  [48,94,1184,78],[63,116,15.64,23],[73.12,116,15.64,23],[101,103,1110,60],
 ];
 for(const node of slideObjects(tree)){
  const bounds=boundsOf(node),isFurniture=furniture.some(expected=>bounds.every((value,index)=>near(value,expected[index])));
  if(!isFurniture)assert.ok(bounds[1]>=190-TOLERANCE,`Body object ${objectName(node)} begins at y=${bounds[1]} on page ${page}`);
 }
}
