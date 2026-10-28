import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeXml,parseXml,all} from '../skills/blue-white-ppt/scripts/lib/xml.mjs';

test('XML text escapes round trip Unicode, whitespace and reserved characters',()=>{
  const text='中文 😀\t\n<&>"\'';
  assert.equal(parseXml(`<r>${escapeXml(text)}</r>`).text,text);
  assert.equal(parseXml('<r a="x > y &amp; z"/>').attrs.a,'x > y & z');
  assert.equal(parseXml('<r>&#x1F600;&#20013;</r>').text,'😀中');
});

test('XML writer and parser reject forbidden characters and isolated surrogates',()=>{
  for(const text of ['\u0000','\u0001','\u000b','\ufffe','\uffff','\ud800','\udfff']){
    assert.throws(()=>escapeXml(text),/Invalid XML/);
    assert.throws(()=>parseXml(`<r>${text}</r>`),/Invalid XML/);
  }
  for(const text of ['&#1;','&#x0;','&#xD800;','&#x110000;'])assert.throws(()=>parseXml(`<r>${text}</r>`),/Invalid XML character reference/);
});

test('XML parser accepts declarations, namespaces, comments and CDATA',()=>{
  const root=parseXml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><!--ok--><p:r xmlns:p="urn:p" xmlns:a="urn:a" a:key="v"><p:n><![CDATA[x < y]]></p:n><?note ok?></p:r>');
  assert.equal(root.name,'p:r');
  assert.equal(all(root,'n')[0].text,'x < y');
  assert.equal(root.attrs['a:key'],'v');
  assert.equal(parseXml('<!----><r/><!---->').local,'r');
});

test('XML parser rejects malformed syntax and unresolved entities',()=>{
  const invalid=[
    '<r>bare & text</r>','<r>&unknown;</r>','<r a=x/>','<r a="1" a="2"/>',
    '<r a="1"b="2"/>','<r a="<"/>','<r><s></r>','<r/><s/>','outside<r/>',
    '<r/>outside','<r','<r><![CDATA[unclosed</r>','<r>]]></r>',
    '<!--bad--comment--><r/>','<!DOCTYPE r><r/>','<p:r/>',
    '<constructor:r/>','<r xmlns:p="urn:p" p:1="bad"/>',
    '<r xmlns:1="urn:x"/>','\u00a0<r/>','<?xml\u00a0version="1.0"?><r/>',
    '<r xmlns:a="urn:x" xmlns:b="urn:x" a:k="1" b:k="2"/>',
    '<r/><?xml version="1.0"?>',
  ];
  for(const xml of invalid)assert.throws(()=>parseXml(xml),undefined,xml);
});
