// XML 1.0 helpers for the local OOXML package. DTDs and external entities are
// deliberately unsupported; validation must never fetch resources.
function validCharacter(code) {
  return code === 9 || code === 10 || code === 13 ||
    (code >= 0x20 && code <= 0xd7ff) ||
    (code >= 0xe000 && code <= 0xfffd) ||
    (code >= 0x10000 && code <= 0x10ffff);
}
function checkCharacters(value) {
  for (const character of value) {
    const code = character.codePointAt(0);
    if (!validCharacter(code)) throw new Error(`Invalid XML 1.0 character U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
  }
  return value;
}
export const escapeXml = value => checkCharacters(String(value ?? ''))
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const entities = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"};
function unescape(value) {
  return value.replace(/&([^;]*);|&/g, (match, entity) => {
    if (Object.hasOwn(entities, entity)) return entities[entity];
    if (/^#(?:x[0-9a-fA-F]+|[0-9]+)$/.test(entity ?? '')) {
      const code = entity[1] === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      if (!validCharacter(code)) throw new Error(`Invalid XML character reference &${entity};`);
      return String.fromCodePoint(code);
    }
    throw new Error(`Invalid XML entity ${match}`);
  });
}
const namePattern = /[:_\p{L}][:_\p{L}\p{N}\p{M}.\-\u00b7]*/uy;
const localNamePattern = /^[_\p{L}][_\p{L}\p{N}\p{M}.\-\u00b7]*$/u;
const whitespace = /[\x20\t\r\n]/;
const xmlNamespace = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNamespace = 'http://www.w3.org/2000/xmlns/';
function checkName(name, namespaces, attribute = false) {
  const parts = name.split(':');
  if (parts.length > 2 || parts.some(part => !localNamePattern.test(part))) throw new Error(`Invalid XML qualified name ${name}`);
  if (parts.length === 2 && (!Object.hasOwn(namespaces, parts[0]) || !namespaces[parts[0]])) throw new Error(`Undeclared XML namespace ${parts[0]}`);
  return `${parts.length === 2 ? namespaces[parts[0]] : attribute ? '' : namespaces[''] ?? ''}|${parts.at(-1)}`;
}

export function parseXml(source) {
  const input = checkCharacters(String(source)).replace(/^\uFEFF/, '');
  const document = {name: '#document', local: '#document', attrs: {}, children: [], text: ''};
  const stack = [document], namespaceStack = [Object.assign(Object.create(null), {xml: xmlNamespace})];
  let cursor = 0;
  function readName() {
    namePattern.lastIndex = cursor;
    const match = namePattern.exec(input);
    if (!match) throw new Error(`Expected XML name at offset ${cursor}`);
    cursor += match[0].length;
    return match[0];
  }
  function skipSpace() { while (whitespace.test(input[cursor] ?? '')) cursor++; }
  while (cursor < input.length) {
    if (input.startsWith('<!--', cursor)) {
      const end = input.indexOf('-->', cursor + 4);
      const comment = input.slice(cursor + 4, end);
      if (end < 0 || comment.includes('--') || comment.endsWith('-')) throw new Error('Malformed XML comment');
      cursor = end + 3;
    } else if (input.startsWith('<?', cursor)) {
      const start = cursor;
      cursor += 2;
      const target = readName(), end = input.indexOf('?>', cursor);
      if (end < 0) throw new Error('Unclosed XML processing instruction');
      if (target.toLowerCase() === 'xml') {
        if (target !== 'xml' || start !== 0 || !/^[\x20\t\r\n]+version[\x20\t\r\n]*=[\x20\t\r\n]*(["'])1\.0\1(?:[\x20\t\r\n]+encoding[\x20\t\r\n]*=[\x20\t\r\n]*(["'])[A-Za-z][A-Za-z0-9._-]*\2)?(?:[\x20\t\r\n]+standalone[\x20\t\r\n]*=[\x20\t\r\n]*(["'])(?:yes|no)\3)?[\x20\t\r\n]*$/.test(input.slice(cursor, end))) throw new Error('Invalid XML declaration');
      } else if (cursor !== end && !whitespace.test(input[cursor])) throw new Error('Malformed XML processing instruction');
      cursor = end + 2;
    } else if (input.startsWith('<![CDATA[', cursor)) {
      if (stack.length === 1) throw new Error('CDATA outside XML root');
      const end = input.indexOf(']]>', cursor + 9);
      if (end < 0) throw new Error('Unclosed XML CDATA');
      stack.at(-1).text += input.slice(cursor + 9, end);
      cursor = end + 3;
    } else if (input.startsWith('</', cursor)) {
      cursor += 2;
      const name = readName();
      skipSpace();
      if (input[cursor++] !== '>' || stack.length === 1 || stack.at(-1).name !== name) throw new Error(`Malformed XML closing tag ${name}`);
      stack.pop(); namespaceStack.pop();
    } else if (input.startsWith('<!', cursor)) {
      throw new Error('XML declarations and DTDs are unsupported');
    } else if (input[cursor] === '<') {
      cursor++;
      const name = readName(), attrs = {}, namespaces = Object.assign(Object.create(null), namespaceStack.at(-1));
      let closed = false;
      while (cursor < input.length) {
        const before = cursor;
        skipSpace();
        if (input.startsWith('/>', cursor)) { cursor += 2; closed = true; break; }
        if (input[cursor] === '>') { cursor++; break; }
        if (cursor === before) throw new Error(`Expected whitespace before XML attribute in ${name}`);
        const key = readName();
        if (Object.hasOwn(attrs, key)) throw new Error(`Duplicate XML attribute ${key}`);
        skipSpace();
        if (input[cursor++] !== '=') throw new Error(`Expected = after XML attribute ${key}`);
        skipSpace();
        const quote = input[cursor++];
        if (quote !== '"' && quote !== "'") throw new Error(`Unquoted XML attribute ${key}`);
        const end = input.indexOf(quote, cursor);
        if (end < 0 || input.slice(cursor, end).includes('<')) throw new Error(`Malformed XML attribute ${key}`);
        Object.defineProperty(attrs, key, {value: unescape(input.slice(cursor, end)), enumerable: true});
        cursor = end + 1;
      }
      if (input[cursor - 1] !== '>') throw new Error(`Unclosed XML tag ${name}`);
      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'xmlns') {
          if (value === xmlNamespace || value === xmlnsNamespace) throw new Error('Invalid default XML namespace');
          namespaces[''] = value;
        } else if (key.startsWith('xmlns:')) {
          const prefix = key.slice(6);
          if (!localNamePattern.test(prefix) || prefix === 'xmlns' || !value || value === xmlnsNamespace || (prefix === 'xml') !== (value === xmlNamespace)) throw new Error(`Invalid XML namespace binding ${key}`);
          namespaces[prefix] = value;
        }
      }
      checkName(name, namespaces);
      const expanded = new Set();
      for (const key of Object.keys(attrs).filter(key => key !== 'xmlns' && !key.startsWith('xmlns:'))) {
        const resolved = checkName(key, namespaces, true);
        if (expanded.has(resolved)) throw new Error(`Duplicate XML attribute ${key}`);
        expanded.add(resolved);
      }
      const node = {name, local: name.split(':').at(-1), attrs, children: [], text: ''};
      stack.at(-1).children.push(node);
      if (document.children.length > 1) throw new Error('Multiple XML root elements');
      if (!closed) { stack.push(node); namespaceStack.push(namespaces); }
    } else {
      const end = input.indexOf('<', cursor), next = end < 0 ? input.length : end;
      const raw = input.slice(cursor, next);
      if (raw.includes(']]>')) throw new Error('CDATA terminator in XML text');
      if (stack.length === 1 && /[^\x20\t\r\n]/.test(raw)) throw new Error('Text outside XML root');
      stack.at(-1).text += unescape(raw);
      cursor = next;
    }
  }
  if (stack.length !== 1 || document.children.length !== 1) throw new Error('Incomplete XML document');
  return document.children[0];
}
export const children = (node, name) => node?.children.filter(child => child.local === name) ?? [];
export function all(node, name) { return node ? [...(node.local === name ? [node] : []), ...node.children.flatMap(child => all(child, name))] : []; }
export function textContent(node) { return node.text + node.children.map(textContent).join(''); }
