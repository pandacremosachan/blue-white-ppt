import { C, FONT, shape } from './research-components.mjs';

export const CELL_VARIANTS = Object.freeze([
  { componentId: 'graphic.cells', key: 'cells-segmented', name: '分段格条', note: '两个独立段簇组成横向格条', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-stepped', name: '阶梯序列', note: '逐格错层形成阶梯轮廓', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-paired', name: '上下成对列', note: '上下格以短线成对连接', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-alternating', name: '横竖交替拼块', note: '两列内横格与竖格交替', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-hex-chain', name: '相接六边格链', note: '六边格共用竖边连续相接', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-chevron-chain', name: '斜分格序列', note: '平直外沿内以斜线连续分格', group: 'sequences' },
  { componentId: 'graphic.cells', key: 'cells-block-groups', name: '小组阵列', note: '两个独立容器各含四格', group: 'groups' },
  { componentId: 'graphic.cells', key: 'cells-center-surround', name: '中心围格', note: '中心大格由外围八格围合', group: 'groups' },
  { componentId: 'graphic.cells', key: 'cells-nested-frame', name: '容器细格', note: '外层容器收纳独立细格', group: 'groups' },
  { componentId: 'graphic.cells', key: 'cells-cross', name: '十字格群', note: '横向格臂与纵向格列相交', group: 'groups' },
  { componentId: 'graphic.cells', key: 'cells-triangular', name: '三角格堆', note: '一至四格逐行递增堆放', group: 'groups' },
  { componentId: 'graphic.cells', key: 'cells-bridge', name: '跨格桥接', note: '两侧格簇由中央长格衔接', group: 'groups' },
].map(item => Object.freeze({ ...item, options: Object.freeze({ variant: item.key }) })));

const BY_KEY = new Map(CELL_VARIANTS.map(item => [item.key, item]));

/** Native cell structures fitted to a 288 × 120 drawing area. Labels are optional. */
export function drawCellVariant(slide, instanceId, bounds, options = {}) {
  const { x, y, w, h } = bounds ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Cell bounds require finite x/y and positive w/h.');
  }
  const key = options.variant ?? CELL_VARIANTS[0].key, variant = BY_KEY.get(key);
  if (!variant) throw new RangeError(`Unknown cell variant ${JSON.stringify(key)}.`);
  const scale = Math.min(w / 288, h / 120), ox = x + (w - 288 * scale) / 2, oy = y + (h - 120 * scale) / 2;
  const shapes = [], cells = [], containers = [];
  const pick = (values, logicalKey, index) => Array.isArray(values) ? values[index] : values?.[logicalKey] ?? values?.[index];
  function add(name, geometry, xx, yy, ww, hh, fill = C.bluePale, stroke = C.border, extra = {}) {
    const s = shape(slide, `${instanceId}.${name}`, geometry, ox + xx * scale, oy + yy * scale,
      ww * scale, hh * scale, fill, stroke, 1.3, extra);
    shapes.push(s); return s;
  }
  function frame(name, xx, yy, ww, hh) {
    const s = add(`container.${name}`, 'rect', xx, yy, ww, hh, C.white);
    containers.push(s); return s;
  }
  function cell(logicalKey, xx, yy, ww, hh, extra = {}) {
    const index = cells.length, high = options.highlight ?? [];
    const highlighted = Array.isArray(high) ? high.includes(index) || high.includes(logicalKey) : !!(high?.[logicalKey] ?? high?.[index]);
    const fill = pick(options.colors, logicalKey, index) ?? (highlighted ? C.blue : extra.fill ?? C.bluePale);
    const s = add(`cell.${logicalKey}`, extra.geometry ?? 'rect', xx, yy, ww, hh, fill, C.border, extra.native ?? {});
    const label = pick(options.labels, logicalKey, index);
    if (label !== undefined && label !== null && String(label).length) {
      s.text.style = { typeface: FONT, fontSize: Math.min(options.fontSize ?? 16, hh * .68) * scale,
        color: options.color ?? ([C.blue, C.blueDark].includes(fill) ? C.white : C.blueText), bold: false,
        alignment: 'center', verticalAlignment: 'middle', insets: 0, autoFit: 'none', wrap: 'square' };
      s.text = String(label);
    }
    cells.push({ key: logicalKey, logicalKey, index, shape: s,
      bounds: { x: ox + xx * scale, y: oy + yy * scale, w: ww * scale, h: hh * scale } });
    return s;
  }
  function polygonCell(logicalKey, points, extra = {}) {
    const xx = Math.min(...points.map(p => p[0])), yy = Math.min(...points.map(p => p[1]));
    const ww = Math.max(...points.map(p => p[0])) - xx, hh = Math.max(...points.map(p => p[1])) - yy;
    const commands = points.map(([px, py], i) => ({ [i ? 'lineTo' : 'moveTo']: { x: px - xx, y: py - yy } }));
    commands.push({ close: {} });
    return cell(logicalKey, xx, yy, ww, hh, { ...extra, geometry: 'custom',
      native: { customPaths: [{ width: ww, height: hh, commands }] } });
  }

  if (key === 'cells-segmented') {
    for (let i = 0; i < 3; i++) cell(`left${i + 1}`, 12 + i * 36, 36, 32, 48);
    for (let i = 0; i < 4; i++) cell(`right${i + 1}`, 164 + i * 28, 36, 24, 48);
  } else if (key === 'cells-stepped') {
    for (let i = 0; i < 6; i++) cell(`step${i + 1}`, 12 + i * 44, 80 - i * 13, 38, 28);
  } else if (key === 'cells-paired') {
    for (let i = 0; i < 4; i++) {
      const xx = 24 + i * 64;
      add(`pair${i + 1}.link`, 'line', xx + 22, 50, 0, 20, 'none');
      cell(`top${i + 1}`, xx, 20, 44, 30);
      cell(`bottom${i + 1}`, xx, 70, 44, 30);
    }
  } else if (key === 'cells-alternating') {
    cell('leftHorizontal', 20, 12, 116, 28);
    cell('leftVertical1', 20, 48, 54, 60);
    cell('leftVertical2', 82, 48, 54, 60);
    cell('rightVertical1', 152, 12, 54, 60);
    cell('rightVertical2', 214, 12, 54, 60);
    cell('rightHorizontal', 152, 80, 116, 28);
  } else if (key === 'cells-hex-chain') {
    for (let i = 0; i < 5; i++) {
      const xx = 14 + i * 52;
      polygonCell(`hex${i + 1}`, [[xx + 26, 30], [xx + 52, 45], [xx + 52, 75], [xx + 26, 90], [xx, 75], [xx, 45]]);
    }
  } else if (key === 'cells-chevron-chain') {
    // A flat-ended strip with diagonal partitions: there are no arrowheads.
    const top = [12, 56, 100, 144, 188, 232, 276], bottom = [12, 76, 120, 164, 208, 252, 276];
    for (let i = 0; i < 6; i++) polygonCell(`section${i + 1}`, [[top[i], 30], [top[i + 1], 30], [bottom[i + 1], 90], [bottom[i], 90]]);
  } else if (key === 'cells-block-groups') {
    for (const [group, xx] of [['left', 30], ['right', 166]]) {
      frame(group, xx - 6, 16, 104, 84);
      for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
        cell(`${group}${row + 1}${col + 1}`, xx + col * 48, 22 + row * 38, 44, 34);
      }
    }
  } else if (key === 'cells-center-surround') {
    cell('center', 100, 38, 88, 44, { fill: C.blue });
    for (let i = 0; i < 3; i++) {
      cell(`top${i + 1}`, 62 + i * 60, 4, 44, 28);
      cell(`bottom${i + 1}`, 62 + i * 60, 88, 44, 28);
    }
    cell('left', 16, 43, 64, 34);
    cell('right', 208, 43, 64, 34);
  } else if (key === 'cells-nested-frame') {
    frame('outer', 14, 12, 260, 96);
    for (let i = 0; i < 6; i++) cell(`inner${i + 1}`, 26 + i * 40, 30, 32, 60);
  } else if (key === 'cells-cross') {
    cell('top', 126, 8, 36, 32);
    for (let i = 0; i < 5; i++) cell(`arm${i + 1}`, 46 + i * 40, 44, 36, 32, i === 2 ? { fill: C.blue } : {});
    cell('bottom', 126, 80, 36, 32);
  } else if (key === 'cells-triangular') {
    for (let row = 0; row < 4; row++) {
      const count = row + 1, width = count * 44 + (count - 1) * 6, start = (288 - width) / 2;
      for (let col = 0; col < count; col++) cell(`r${row + 1}c${col + 1}`, start + col * 50, 8 + row * 26, 44, 22);
    }
  } else if (key === 'cells-bridge') {
    for (const [side, xx] of [['left', 20], ['right', 224]]) {
      for (let i = 0; i < 3; i++) cell(`${side}${i + 1}`, xx, 8 + i * 38, 44, 28);
    }
    cell('bridge', 64, 46, 160, 28, { fill: C.blue });
  }
  return { componentId: 'graphic.cells', variant: key, group: variant.group, shapes, cells, containers,
    bounds: { x, y, w, h }, designBounds: { x: ox, y: oy, w: 288 * scale, h: 120 * scale } };
}
