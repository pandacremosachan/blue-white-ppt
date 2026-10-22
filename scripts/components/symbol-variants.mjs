import { C, FONT, shape, text } from './research-components.mjs';

// These are visual variants of mark.operator, not separate component IDs.
// options.symbol replaces the single sign in the first five frame variants.
// Split frames and combinations keep their signs fixed to preserve the example.
export const SYMBOL_VARIANTS = [
  ['square-add', '方框加号', '方形边框包围居中算子', 'frames'],
  ['diamond-multiply', '菱框乘号', '菱形边框内保留乘号', 'frames'],
  ['hexagon-sum', '六边框求和', '六边形轮廓包围求和符号', 'frames'],
  ['double-ring-dot', '双环点积', '双圆环保留中心点积', 'frames'],
  ['open-bracket-equal', '开放括线等号', '开放括线收拢两条横线', 'frames'],
  ['split-symbol', '分隔双符号', '同一框体分为两个符号区', 'frames'],
  ['dual-input-sum', '双输入求和', '两侧端口连接中央算子', 'combinations'],
  ['serial-pair', '串联算子', '两个算子按次序连接', 'combinations'],
  ['parallel-group', '并列符号组', '并排算子由底部括线归组', 'combinations'],
  ['corner-index', '符号角标', '主符号右上附独立角标', 'combinations'],
  ['nested-operator', '嵌套算子', '外层方框内嵌次级圆算子', 'combinations'],
  ['contrast-pair', '对照算子', '两种算子按同一基线对照', 'combinations'],
].map(([key, name, note, group]) => ({
  componentId: 'mark.operator', key, name, note, group,
  options: { variant: key },
}));

const byKey = new Map(SYMBOL_VARIANTS.map(v => [v.key, v]));
const replaceable = new Set([
  'square-add', 'diamond-multiply', 'hexagon-sum',
  'double-ring-dot', 'open-bracket-equal',
]);

export function drawSymbolVariant(slide, instanceId, bounds, options = {}) {
  const { x, y, w, h } = bounds ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Symbol bounds require finite x/y and positive w/h.');
  }
  const variant = options.variant ?? 'square-add';
  if (!byKey.has(variant)) throw new RangeError(`Unknown symbol variant: ${variant}`);
  if (typeof instanceId !== 'string' || !instanceId) throw new TypeError('A symbol instanceId is required.');
  if (options.symbol !== undefined &&
      (typeof options.symbol !== 'string' || Array.from(options.symbol).length < 1 || Array.from(options.symbol).length > 3)) {
    throw new TypeError('options.symbol must be a short symbol of one to three characters.');
  }

  // Fit rather than stretch circular and mathematical shapes.
  const scale = Math.min(w / 280, h / 120);
  const ox = x + (w - 280 * scale) / 2, oy = y + (h - 120 * scale) / 2;
  const color = options.color ?? C.blue;
  const stroke = options.stroke ?? C.blue;
  const fill = options.fill ?? C.white;
  const shapes = [], surfaces = [], details = [], edges = [], symbols = [];
  let part = 0;

  function add(key, geometry, xx, yy, ww, hh, f = 'none', st = 'none', width = 0, extra = {}, surface = false) {
    const s = shape(slide, `${instanceId}.${key}.${++part}`, geometry,
      ox + xx * scale, oy + yy * scale, ww * scale, hh * scale,
      f, st, width * scale, extra);
    shapes.push(s); (surface ? surfaces : details).push(s); return s;
  }
  const frame = (key, geometry, xx, yy, ww, hh, f = fill, st = stroke, width = 1.7) =>
    add(key, geometry, xx, yy, ww, hh, f, st, width, {}, true);
  const rule = (key, xx, yy, ww, hh = 0, st = stroke, width = 1.8) =>
    add(key, 'line', xx, yy, ww, hh, 'none', st, width);

  function sign(key, requested, cx, cy, size, ink = color) {
    const start = shapes.length, t = Math.max(2.4, size * .09);
    const bar = (suffix, length, offsetY = 0, rotation = 0) => add(`${key}.${suffix}`, 'rect',
      cx - length / 2, cy + offsetY - t / 2, length, t, ink, 'none', 0,
      rotation ? { position: { left: ox + (cx - length / 2) * scale,
        top: oy + (cy + offsetY - t / 2) * scale, width: length * scale,
        height: t * scale, rotation } } : {});
    const value = String(requested);
    if (value === '+') {
      bar('horizontal', size * .66); bar('vertical', size * .66, 0, 90);
    } else if (['×', 'x', 'X'].includes(value)) {
      bar('diagonal-a', size * .7, 0, 45); bar('diagonal-b', size * .7, 0, 135);
    } else if (['−', '-', '–'].includes(value)) {
      bar('horizontal', size * .66);
    } else if (value === '=') {
      bar('upper', size * .66, -size * .14); bar('lower', size * .66, size * .14);
    } else if (['·', '⋅', '.', '•'].includes(value)) {
      const d = size * .19;
      add(`${key}.dot`, 'ellipse', cx - d / 2, cy - d / 2, d, d, ink);
    } else if (['Σ', '∑'].includes(value)) {
      const points = [[14,8],[90,8],[90,22],[35,22],[66,50],[35,78],
        [90,78],[90,92],[14,92],[14,80],[47,50],[14,20]];
      add(`${key}.sigma`, 'custom', cx - size / 2, cy - size / 2, size, size, ink, 'none', 0, {
        customPaths: [{ width: 100, height: 100, commands: [
          { moveTo: { x: points[0][0], y: points[0][1] } },
          ...points.slice(1).map(([px, py]) => ({ lineTo: { x: px, y: py } })),
          { close: {} },
        ] }],
      });
    } else {
      // Unrecognised short signs remain ordinary editable text in the theme font.
      const s = text(slide, `${instanceId}.${key}.text.${++part}`, value,
        ox + (cx - size / 2) * scale, oy + (cy - size / 2) * scale,
        size * scale, size * scale, size * .78 * scale, ink, false, 'center',
        { typeface: FONT, insets: 0, wrap: 'none' });
      shapes.push(s); details.push(s);
    }
    const made = shapes.slice(start); symbols.push(...made); return made;
  }

  function wire(key, from, to, { fromSide = 'right', toSide = 'left', kind = 'straight', arrow = false } = {}) {
    const s = slide.shapes.connect(from, to, {
      kind, fromSide, toSide,
      line: { fill: color, width: 1.7 * scale, style: 'solid' },
      tail: { type: arrow ? 'triangle' : 'none', width: 'sm', length: 'sm' },
    });
    s.name = `${instanceId}.${key}.${++part}`;
    s.bringToFront(); shapes.push(s); edges.push(s); return s;
  }

  const single = defaultSign => replaceable.has(variant) ? (options.symbol ?? defaultSign) : defaultSign;
  if (variant === 'square-add') {
    frame('square', 'rect', 103, 23, 74, 74); sign('sign', single('+'), 140, 60, 47);
  } else if (variant === 'diamond-multiply') {
    frame('diamond', 'diamond', 92, 12, 96, 96); sign('sign', single('×'), 140, 60, 40);
  } else if (variant === 'hexagon-sum') {
    frame('hexagon', 'hexagon', 88, 16, 104, 88); sign('sign', single('Σ'), 140, 60, 48);
  } else if (variant === 'double-ring-dot') {
    frame('outer-ring', 'ellipse', 98, 18, 84, 84);
    frame('inner-ring', 'ellipse', 109, 29, 62, 62, C.bluePale);
    sign('sign', single('·'), 140, 60, 47);
  } else if (variant === 'open-bracket-equal') {
    rule('left-top', 90, 25, 16); rule('left-side', 90, 25, 0, 70); rule('left-bottom', 90, 95, 16);
    rule('right-top', 174, 25, 16); rule('right-side', 190, 25, 0, 70); rule('right-bottom', 174, 95, 16);
    sign('sign', single('='), 140, 60, 49);
  } else if (variant === 'split-symbol') {
    frame('body', 'rect', 66, 26, 148, 68);
    rule('divider', 140, 26, 0, 68, C.border, 1.4);
    sign('left-sign', '+', 103, 60, 38); sign('right-sign', '×', 177, 60, 38);
  } else if (variant === 'dual-input-sum') {
    const a = frame('port-a', 'ellipse', 55, 27, 12, 12, color, color, 0);
    const b = frame('port-b', 'ellipse', 55, 81, 12, 12, color, color, 0);
    const op = frame('operator', 'ellipse', 109, 29, 62, 62);
    const out = frame('port-out', 'ellipse', 215, 54, 12, 12, color, color, 0);
    wire('input-a', a, op, { kind: 'elbow' }); wire('input-b', b, op, { kind: 'elbow' }); wire('output', op, out);
    sign('sum', '+', 140, 60, 42);
  } else if (variant === 'serial-pair') {
    const a = frame('first', 'ellipse', 66, 31, 58, 58);
    const b = frame('second', 'ellipse', 156, 31, 58, 58);
    wire('sequence', a, b, { arrow: true }); sign('first-sign', '+', 95, 60, 37); sign('second-sign', '×', 185, 60, 37);
  } else if (variant === 'parallel-group') {
    [85, 140, 195].forEach((cx, i) => {
      frame(`item-${i}`, 'ellipse', cx - 20, 28, 40, 40);
      sign(`item-${i}-sign`, ['+', '×', '−'][i], cx, 48, 28);
    });
    rule('group-left', 61, 82, 0, 16); rule('group-base', 61, 98, 158); rule('group-right', 219, 82, 0, 16);
  } else if (variant === 'corner-index') {
    frame('main', 'rect', 102, 28, 76, 76); sign('main-sign', '+', 140, 66, 44);
    frame('badge', 'ellipse', 162, 12, 32, 32, color, color, 0); sign('badge-sign', '×', 178, 28, 20, C.white);
  } else if (variant === 'nested-operator') {
    frame('outer', 'roundRect', 76, 16, 128, 88, C.bluePale);
    frame('inner', 'ellipse', 119, 32, 56, 56);
    sign('outer-sign', 'Σ', 94, 36, 24); sign('inner-sign', '×', 147, 60, 37);
  } else if (variant === 'contrast-pair') {
    frame('left', 'rect', 62, 29, 62, 62); frame('right', 'ellipse', 156, 29, 62, 62);
    rule('divider', 140, 20, 0, 80, C.border, 1.5);
    sign('left-sign', '+', 93, 60, 38); sign('right-sign', '×', 187, 60, 38);
  }

  // Native connectors must remain above pre-existing gallery panels, then
  // symbol surfaces and strokes are brought above the wires.
  edges.forEach(s => s.bringToFront());
  surfaces.forEach(s => s.bringToFront());
  details.forEach(s => s.bringToFront());
  return { id: instanceId, variant, bounds: { x, y, w, h }, shapes, nodes: surfaces, edges, symbols,
    symbolOverrideApplied: replaceable.has(variant) && options.symbol !== undefined };
}
