import { C, FONT, shape, text } from './research-components.mjs';

export const NODE_VARIANTS = Object.freeze([
  { componentId: 'block.node', key: 'node-hexagon', name: '六边形节点', note: '两端收尖的六边形轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-trapezoid', name: '梯形节点', note: '上窄下宽的梯形轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-parallelogram', name: '平行四边形节点', note: '两侧平行倾斜的轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-cylinder', name: '圆柱节点', note: '带椭圆端面的圆柱轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-document', name: '文档节点', note: '底部波形的文档轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-capsule', name: '胶囊节点', note: '两端为完整半圆的轮廓', group: 'contours' },
  { componentId: 'block.node', key: 'node-double-frame', name: '双框节点', note: '双层边框包围主体文字', group: 'compound' },
  { componentId: 'block.node', key: 'node-multiport', name: '多端口节点', note: '两侧各三个原生连接端口', group: 'compound' },
  { componentId: 'block.node', key: 'node-compartment', name: '分格节点', note: '标题与两个字段各自分格', group: 'compound' },
  { componentId: 'block.node', key: 'node-index-corner', name: '编号角标节点', note: '角标编号与主体文字分区', group: 'compound' },
  { componentId: 'block.node', key: 'node-nested', name: '内嵌子节点', note: '外层节点包含独立子节点', group: 'compound' },
  { componentId: 'block.node', key: 'node-split', name: '分段节点', note: '左侧主标签与右侧双字段', group: 'compound' },
].map(item => Object.freeze({ ...item, options: Object.freeze({ variant: item.key }) })));

const BY_KEY = new Map(NODE_VARIANTS.map(item => [item.key, item]));

/**
 * Draw a native node using a fitted 288 × 104 design box.
 * body is the outer node shape used for ordinary connections. The multiport
 * variant also returns six native ellipse handles in ports and portGroups.
 */
export function drawNodeVariant(slide, instanceId, bounds, options = {}) {
  const { x, y, w, h } = bounds ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Node bounds require finite x/y and positive w/h.');
  }
  if (options.componentId !== undefined && options.componentId !== 'block.node') {
    throw new RangeError('Node variants belong to block.node.');
  }
  const key = options.variant ?? NODE_VARIANTS[0].key, variant = BY_KEY.get(key);
  if (!variant) throw new RangeError(`Unknown node variant ${JSON.stringify(key)}.`);
  const scale = Math.min(w / 288, h / 104), ox = x + (w - 288 * scale) / 2, oy = y + (h - 104 * scale) / 2;
  const label = String(options.label ?? '节点 A'), fields = [String(options.fields?.[0] ?? '字段 A'), String(options.fields?.[1] ?? '字段 B')];
  const shapes = [], ports = [], portGroups = { left: [], right: [] }, children = [];
  let body;
  function add(name, geometry, left, top, width, height, fill = C.bluePale, stroke = C.border, strokeWidth = 1.5, extra = {}) {
    const s = shape(slide, `${instanceId}.${name}`, geometry, ox + left * scale, oy + top * scale,
      width * scale, height * scale, fill, stroke, strokeWidth, extra);
    shapes.push(s); return s;
  }
  function words(name, value, left, top, width, height, size = 22, color = C.ink, bold = false) {
    const s = text(slide, `${instanceId}.${name}`, String(value), ox + left * scale, oy + top * scale,
      width * scale, height * scale, size * scale, color, bold, 'center');
    shapes.push(s); return s;
  }
  function onBody(s, value = label, size = 22) {
    s.text.style = { typeface: FONT, fontSize: size * scale, color: C.ink, bold: false,
      alignment: 'center', verticalAlignment: 'middle', insets: 3 * scale, autoFit: 'none', wrap: 'square' };
    s.text = value; return s;
  }
  function rule(name, left, top, width, height = 0) {
    return add(name, 'line', left, top, width, height, 'none', C.border);
  }

  switch (key) {
    case 'node-hexagon':
      body = onBody(add('body', 'hexagon', 12, 12, 264, 80));
      break;
    case 'node-trapezoid':
      body = onBody(add('body', 'trapezoid', 12, 12, 264, 80));
      break;
    case 'node-parallelogram':
      body = onBody(add('body', 'parallelogram', 12, 12, 264, 80));
      break;
    case 'node-cylinder':
      body = onBody(add('body', 'can', 24, 8, 240, 88));
      break;
    case 'node-document':
      body = add('body', 'custom', 12, 10, 264, 84, C.bluePale, C.border, 1.5, { customPaths: [{ width: 264, height: 84, commands: [
        { moveTo: { x: 0, y: 0 } }, { lineTo: { x: 264, y: 0 } }, { lineTo: { x: 264, y: 72 } },
        { cubicBezTo: { x1: 176, y1: 34, x2: 88, y2: 110, x: 0, y: 72 } }, { close: {} },
      ] }] });
      words('label', label, 36, 19, 216, 50);
      break;
    case 'node-capsule':
      body = onBody(add('body', 'roundRect', 12, 12, 264, 80, C.bluePale, C.border, 1.5, { borderRadius: 40 * scale }));
      break;
    case 'node-double-frame':
      body = add('body', 'rect', 8, 10, 272, 84, C.white);
      add('inner', 'rect', 17, 19, 254, 66);
      words('label', label, 38, 24, 212, 56);
      break;
    case 'node-multiport':
      body = add('body', 'rect', 32, 15, 224, 74);
      words('label', label, 51, 25, 186, 54);
      for (const [side, left, lineX] of [['left', 10, 22], ['right', 266, 256]]) {
        for (const [i, center] of [32, 52, 72].entries()) {
          rule(`stem.${side}${i + 1}`, lineX, center, 10);
          const port = add(`port.${side}${i + 1}`, 'ellipse', left, center - 6, 12, 12, C.blue);
          ports.push(port); portGroups[side].push(port);
        }
      }
      break;
    case 'node-compartment':
      body = add('body', 'rect', 10, 8, 268, 88, C.white);
      add('header', 'rect', 11, 9, 266, 29, C.blue, 'none', 0);
      rule('divider.header', 10, 38, 268);
      rule('divider.fields', 10, 67, 268);
      words('label', label, 22, 10, 244, 27, 22, C.white);
      words('fieldA', fields[0], 22, 39, 244, 27, 18);
      words('fieldB', fields[1], 22, 68, 244, 27, 18);
      break;
    case 'node-index-corner':
      body = add('body', 'rect', 10, 12, 268, 80);
      add('badge', 'rect', 11, 13, 42, 32, C.blue, 'none', 0);
      words('index', options.index ?? options.number ?? '01', 12, 14, 40, 30, 18, C.white);
      words('label', label, 64, 22, 200, 60);
      break;
    case 'node-nested': {
      body = add('body', 'rect', 8, 8, 272, 88, C.white);
      words('label', label, 24, 10, 240, 28);
      const child = add('child', 'roundRect', 75, 46, 138, 40, C.bluePale, C.border, 1.5, { borderRadius: 7 * scale });
      child.text.style = { typeface: FONT, fontSize: 20 * scale, color: C.ink, bold: false,
        alignment: 'center', verticalAlignment: 'middle', insets: 2 * scale, autoFit: 'none', wrap: 'square' };
      child.text = String(options.fields?.[0] ?? '子节点'); children.push(child);
      break;
    }
    case 'node-split':
      body = add('body', 'rect', 8, 12, 272, 80);
      add('left', 'rect', 9, 13, 106, 78, C.blue, 'none', 0);
      rule('divider.vertical', 116, 12, 0, 80);
      rule('divider.fields', 116, 52, 164);
      words('label', label, 17, 24, 90, 56, 22, C.white);
      words('fieldA', fields[0], 128, 17, 140, 30, 20);
      words('fieldB', fields[1], 128, 57, 140, 30, 20);
      break;
  }
  return { componentId: 'block.node', variant: key, group: variant.group, body, ports, portGroups, children, shapes,
    bounds: { x, y, w, h }, designBounds: { x: ox, y: oy, w: 288 * scale, h: 104 * scale } };
}
