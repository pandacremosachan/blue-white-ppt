import { C, shape, text } from './research-components.mjs';

// Shape variants, rather than color or orientation alternatives. Every mark is
// made from native editable shapes; ordinary punctuation stays editable text.
export const ICON_VARIANTS = Object.freeze([
  { componentId: 'icon.question', key: 'double-bubble', name: '双气泡问号', note: '前后交叠的对话气泡' },
  { componentId: 'icon.question', key: 'circle-bubble', name: '圆气泡问号', note: '圆形气泡与短尾轮廓' },
  { componentId: 'icon.info', key: 'square-frame', name: '方框信息', note: '方框、顶条与信息标记' },
  { componentId: 'icon.info', key: 'folded-corner', name: '折角信息', note: '蓝色折角标记' },
  { componentId: 'icon.document', key: 'folded-page', name: '折角单页', note: '单页轮廓、折角与正文线' },
  { componentId: 'icon.document', key: 'stacked-pages', name: '多页叠放', note: '错位叠放的三张页面' },
  { componentId: 'icon.database', key: 'layered-cylinder', name: '分层圆柱', note: '两道分层弧线的数据库' },
  { componentId: 'icon.database', key: 'cylinder-group', name: '圆柱组', note: '三组错位排列的数据库' },
  { componentId: 'icon.target', key: 'crosshair', name: '十字靶心', note: '同心圆与四向十字刻线' },
  { componentId: 'icon.target', key: 'arrow-hit', name: '带箭命中', note: '斜向箭头命中同心靶面' },
].map(item => Object.freeze(item)));

const BY_KEY = new Map(ICON_VARIANTS.map(item => [item.key, item]));

function bubblePath(w, h, rightTail = false) {
  const body = h * .77, r = Math.min(w, h) * .15;
  const tail = rightTail
    ? [{ lineTo: { x: w * .76, y: body } }, { lineTo: { x: w * .87, y: h } }, { lineTo: { x: w * .51, y: body } }]
    : [{ lineTo: { x: w * .47, y: body } }, { lineTo: { x: w * .14, y: h } }, { lineTo: { x: w * .23, y: body } }];
  return [
    { moveTo: { x: r, y: 0 } }, { lineTo: { x: w - r, y: 0 } },
    { cubicBezTo: { x1: w, y1: 0, x2: w, y2: 0, x: w, y: r } },
    { lineTo: { x: w, y: body - r } },
    { cubicBezTo: { x1: w, y1: body, x2: w, y2: body, x: w - r, y: body } },
    ...tail,
    { lineTo: { x: r, y: body } },
    { cubicBezTo: { x1: 0, y1: body, x2: 0, y2: body, x: 0, y: body - r } },
    { lineTo: { x: 0, y: r } },
    { cubicBezTo: { x1: 0, y1: 0, x2: 0, y2: 0, x: r, y: 0 } }, { close: {} },
  ];
}

/** Draw a variant inside a 100 × 105 design box, fitted to the given bounds. */
export function drawIconVariant(slide, id, rect, options = {}) {
  const { x, y, w, h } = rect ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Icon bounds require finite x/y and positive w/h.');
  }
  const key = options.variant ?? ICON_VARIANTS.find(item => item.componentId === id)?.key ?? 'double-bubble';
  if (!BY_KEY.has(key)) throw new RangeError(`Unknown icon variant ${JSON.stringify(key)}.`);
  const scale = Math.min(w / 100, h / 105), ox = x + (w - 100 * scale) / 2, oy = y + (h - 105 * scale) / 2;
  const parts = [];
  function add(name, geometry, left, top, width, height, fill = C.white, stroke = C.border, strokeWidth = 1.5, extra = {}) {
    const s = shape(slide, `${id}.${name}`, geometry, ox + left * scale, oy + top * scale,
      width * scale, height * scale, fill, stroke, strokeWidth, extra);
    parts.push(s); return s;
  }
  function path(name, left, top, width, height, commands, fill = C.white, stroke = C.border, strokeWidth = 1.5) {
    return add(name, 'custom', left, top, width, height, fill, stroke, strokeWidth,
      { customPaths: [{ width, height, commands }] });
  }
  function polygon(name, points, fill = C.white, stroke = C.border, strokeWidth = 1.5) {
    const left = Math.min(...points.map(p => p[0])), top = Math.min(...points.map(p => p[1]));
    const width = Math.max(...points.map(p => p[0])) - left, height = Math.max(...points.map(p => p[1])) - top;
    const commands = points.map(([px, py], i) => ({ [i ? 'lineTo' : 'moveTo']: { x: px - left, y: py - top } }));
    commands.push({ close: {} }); return path(name, left, top, width, height, commands, fill, stroke, strokeWidth);
  }
  function segment(name, x1, y1, x2, y2, color = C.border, strokeWidth = 1.5) {
    const left = Math.min(x1, x2), top = Math.min(y1, y2), width = Math.max(Math.abs(x2 - x1), .01), height = Math.max(Math.abs(y2 - y1), .01);
    return path(name, left, top, width, height,
      [{ moveTo: { x: x1 - left, y: y1 - top } }, { lineTo: { x: x2 - left, y: y2 - top } }], 'none', color, strokeWidth);
  }
  function mark(name, value, left, top, width, height, size, color = C.white) {
    const s = text(slide, `${id}.${name}`, value, ox + left * scale, oy + top * scale,
      width * scale, height * scale, size * scale, color, true, 'center');
    parts.push(s); return s;
  }
  function infoMark(left, top, size, color) {
    add('info.dot', 'ellipse', left + size * .4, top, size * .2, size * .2, color, 'none', 0);
    add('info.stem', 'rect', left + size * .4, top + size * .32, size * .2, size * .68, color, 'none', 0);
  }
  function foldedPage(name, left, top, width, height, fold, fill = C.white) {
    polygon(`${name}.body`, [[left, top], [left + width - fold, top], [left + width, top + fold],
      [left + width, top + height], [left, top + height]], fill);
    polygon(`${name}.fold`, [[left + width - fold, top], [left + width - fold, top + fold],
      [left + width, top + fold]], fill === C.blue ? C.bluePale : C.blue);
  }
  function cylinder(name, left, top, width, height, layers = 0) {
    const cap = height * .2;
    path(`${name}.body`, left, top + cap / 2, width, height - cap / 2, [
      { moveTo: { x: 0, y: 0 } }, { lineTo: { x: width, y: 0 } },
      { lineTo: { x: width, y: height - cap } },
      { cubicBezTo: { x1: width, y1: height - cap / 3, x2: 0, y2: height - cap / 3, x: 0, y: height - cap } },
      { close: {} },
    ], C.bluePale);
    add(`${name}.cap`, 'ellipse', left, top, width, cap, C.blue);
    for (let i = 1; i <= layers; i++) {
      const yy = cap + (height - cap * 1.5) * i / (layers + 1);
      path(`${name}.layer${i}`, left, top + yy, width, cap / 2,
        [{ moveTo: { x: 0, y: 0 } }, { cubicBezTo: { x1: 0, y1: cap * .65, x2: width, y2: cap * .65, x: width, y: 0 } }], 'none');
    }
  }

  switch (key) {
    case 'double-bubble':
      path('rear', 34, 10, 59, 59, bubblePath(59, 59, true), C.bluePale);
      segment('rear.line1', 48, 24, 78, 24, C.blue);
      segment('rear.line2', 48, 34, 70, 34, C.blue);
      path('front', 6, 33, 69, 63, bubblePath(69, 63), C.blue);
      mark('question', '?', 20, 31, 42, 50, 40);
      break;
    case 'circle-bubble':
      path('bubble', 9, 8, 82, 89, [
        { moveTo: { x: 41, y: 0 } },
        { cubicBezTo: { x1: 63.6, y1: 0, x2: 82, y2: 17, x: 82, y: 39 } },
        { cubicBezTo: { x1: 82, y1: 61, x2: 63.6, y2: 78, x: 41, y: 78 } },
        { cubicBezTo: { x1: 36, y1: 78, x2: 31, y2: 77, x: 27, y: 76 } },
        { lineTo: { x: 10, y: 89 } }, { lineTo: { x: 13, y: 68 } },
        { cubicBezTo: { x1: 5, y1: 61, x2: 0, y2: 51, x: 0, y: 39 } },
        { cubicBezTo: { x1: 0, y1: 17, x2: 18.4, y2: 0, x: 41, y: 0 } }, { close: {} },
      ], C.blue);
      mark('question', '?', 27, 20, 46, 58, 48);
      break;
    case 'square-frame':
      add('frame', 'rect', 12, 15, 76, 77, C.white);
      add('top', 'rect', 12, 15, 76, 8, C.blue, 'none', 0);
      infoMark(30, 33, 40, C.blue);
      break;
    case 'folded-corner':
      foldedPage('badge', 11, 15, 78, 77, 20, C.blue);
      infoMark(29, 34, 40, C.white);
      break;
    case 'folded-page':
      foldedPage('page', 20, 7, 60, 89, 18);
      for (let i = 0; i < 4; i++) segment(`text${i}`, 32, 41 + i * 12, i === 3 ? 58 : 68, 41 + i * 12, C.blue);
      break;
    case 'stacked-pages':
      add('rear', 'rect', 35, 8, 55, 73, C.bluePale);
      add('middle', 'rect', 24, 16, 55, 73, C.white);
      add('front', 'rect', 12, 25, 55, 73, C.white);
      add('front.header', 'rect', 12, 25, 55, 15, C.blue, 'none', 0);
      for (let i = 0; i < 3; i++) segment(`text${i}`, 23, 53 + i * 13, i === 2 ? 47 : 57, 53 + i * 13, C.blue);
      break;
    case 'layered-cylinder':
      cylinder('database', 17, 10, 66, 85, 2);
      break;
    case 'cylinder-group':
      cylinder('rearLeft', 7, 12, 38, 55, 1);
      cylinder('rearRight', 55, 12, 38, 55, 1);
      cylinder('front', 31, 43, 38, 55, 1);
      break;
    case 'crosshair':
      add('outer', 'ellipse', 15, 17, 70, 70, C.white);
      add('inner', 'ellipse', 28, 30, 44, 44, C.bluePale);
      segment('left', 4, 52, 36, 52, C.blue);
      segment('right', 64, 52, 96, 52, C.blue);
      segment('top', 50, 6, 50, 38, C.blue);
      segment('bottom', 50, 66, 50, 99, C.blue);
      add('center', 'ellipse', 46, 48, 8, 8, C.blue, 'none', 0);
      break;
    case 'arrow-hit':
      add('outer', 'ellipse', 8, 26, 68, 68, C.white);
      add('middle', 'ellipse', 20, 38, 44, 44, C.bluePale);
      add('center', 'ellipse', 32, 50, 20, 20, C.blue);
      polygon('arrow', [[81.1, 14.2], [53.1, 42.9], [48.1, 38], [42, 60], [63.9, 53.4], [58.9, 48.5], [86.9, 19.8]], C.blue);
      break;
  }
  return parts;
}
