import {deflateRawSync,inflateRawSync} from 'node:zlib';
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function writeZip(parts){
  const local=[],directory=[];let offset=0;
  for(const [name,input] of parts){
    const data=Buffer.isBuffer(input)?input:Buffer.from(input),filename=Buffer.from(name),compressed=deflateRawSync(data),crc=crc32(data);
    const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(0x21,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(filename.length,26);
    local.push(h,filename,compressed);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(0x21,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(filename.length,28);c.writeUInt32LE(offset,42);directory.push(c,filename);
    offset+=h.length+filename.length+compressed.length;
  }
  const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(parts.size,8);end.writeUInt16LE(parts.size,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,central,end]);
}
export function readZip(bytes){
  let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(bytes.readUInt32LE(i)===0x06054b50){end=i;break;}
  if(end<0)throw new Error('Not a supported ZIP package');
  const count=bytes.readUInt16LE(end+10),parts=new Map();let cursor=bytes.readUInt32LE(end+16);
  for(let i=0;i<count;i++){
    if(bytes.readUInt32LE(cursor)!==0x02014b50)throw new Error('Invalid ZIP central directory');
    const flags=bytes.readUInt16LE(cursor+8),method=bytes.readUInt16LE(cursor+10),crc=bytes.readUInt32LE(cursor+16),size=bytes.readUInt32LE(cursor+20),length=bytes.readUInt16LE(cursor+28),extra=bytes.readUInt16LE(cursor+30),comment=bytes.readUInt16LE(cursor+32),offset=bytes.readUInt32LE(cursor+42),name=bytes.subarray(cursor+46,cursor+46+length).toString('utf8');
    if(flags&1)throw new Error('Encrypted ZIP entries are unsupported');
    if(parts.has(name)||name.split('/').includes('..')||name.startsWith('/'))throw new Error(`Unsafe/duplicate ZIP entry ${name}`);
    const start=offset+30+bytes.readUInt16LE(offset+26)+bytes.readUInt16LE(offset+28),compressed=bytes.subarray(start,start+size);
    const data=method===8?inflateRawSync(compressed):method===0?Buffer.from(compressed):null;
    if(!data||crc32(data)!==crc)throw new Error(`Unsupported or corrupt ZIP entry ${name}`);
    parts.set(name,data);cursor+=46+length+extra+comment;
  }
  return parts;
}
