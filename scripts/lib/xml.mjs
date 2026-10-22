export const escapeXml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const unescape=value=>value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_,k)=>k[0]==='#'?String.fromCodePoint(k[1].toLowerCase()==='x'?parseInt(k.slice(2),16):Number(k.slice(1))):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[k]));
export function parseXml(source){
  const document={name:'#document',local:'#document',attrs:{},children:[],text:''},stack=[document];
  for(const token of String(source).match(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g)??[]){
    if(token.startsWith('<?')||token.startsWith('<!--'))continue;
    if(token.startsWith('<![CDATA[')){stack.at(-1).text+=token.slice(9,-3);continue;}
    if(token.startsWith('</')){const n=token.slice(2,-1).trim();if(stack.length===1||stack.at(-1).name!==n)throw new Error(`Malformed XML closing tag ${n}`);stack.pop();}
    else if(token.startsWith('<')){
      const match=/^<([^\s/>]+)/.exec(token);if(!match)throw new Error('Unsupported XML declaration');
      const name=match[1],node={name,local:name.split(':').at(-1),attrs:{},children:[],text:''};
      for(const [,key,,double,single] of token.matchAll(/([^\s=<>]+)\s*=\s*("([^"]*)"|'([^']*)')/g))node.attrs[key]=unescape(double??single);
      stack.at(-1).children.push(node);if(!token.endsWith('/>'))stack.push(node);
    }else stack.at(-1).text+=unescape(token);
  }
  if(stack.length!==1||document.children.length!==1)throw new Error('Incomplete XML document');return document.children[0];
}
export const children=(node,name)=>node.children.filter(child=>child.local===name);
export function all(node,name){return [...(node.local===name?[node]:[]),...node.children.flatMap(child=>all(child,name))];}
export function textContent(node){return node.text+node.children.map(textContent).join('');}
