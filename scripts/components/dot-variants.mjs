import { C, shape } from './research-components.mjs';

export const DOT_VARIANTS = Object.freeze([
  ['dots-staggered', '交错点阵', '相邻点行沿横向交错半格', 'arrangements'],
  ['dots-triangle', '三角点阵', '点数逐行递增形成三角', 'arrangements'],
  ['dots-ring', '环形一圈', '等距圆点围成单一圆环', 'arrangements'],
  ['dots-arc', '拱弧点列', '单列圆点沿拱弧展开', 'arrangements'],
  ['dots-radial', '放射点列', '中心圆点向六个方向展开', 'arrangements'],
  ['dots-cross', '十字点列', '横向与纵向点列在中心相交', 'arrangements'],
  ['dots-clusters', '分离点簇', '三个独立点簇各含三个圆点', 'groups'],
  ['dots-concentric', '同心双环', '内外两圈圆点共用圆心', 'groups'],
  ['dots-bands', '竖向点带', '三组双列点带以宽间距分开', 'groups'],
  ['dots-wave', '三行波形', '三条点行沿相同波形起伏', 'groups'],
  ['dots-tapered', '疏密渐变', '横向点距逐段增加形成疏密', 'groups'],
  ['dots-corners', '四角点簇', '四角各有独立点簇中间留白', 'groups'],
].map(([key, name, note, group]) => Object.freeze({
  componentId: 'graphic.dots', key, name, note, group,
  options: Object.freeze({ variant: key }),
})));

const BY_KEY = new Map(DOT_VARIANTS.map(item => [item.key, item]));

function layoutFor(key) {
  const points = [];
  function dot(key, x, y, row, col, group = 0) { points.push({ key, x, y, row, col, group }); }
  function ring(name, radius, count, row, start = -Math.PI / 2) {
    for (let col = 0; col < count; col++) {
      const a = start + col * Math.PI * 2 / count;
      dot(`${name}.p${col}`, 144 + Math.cos(a) * radius, 60 + Math.sin(a) * radius, row, col, row);
    }
  }
  if (key === 'dots-staggered') {
    for (let row = 0; row < 3; row++) for (let col = 0; col < 6; col++) {
      dot(`r${row}.c${col}`, 56 + col * 32 + (row % 2) * 16, 28 + row * 32, row, col);
    }
  } else if (key === 'dots-triangle') {
    for (let row = 0; row < 5; row++) for (let col = 0; col <= row; col++) {
      dot(`r${row}.c${col}`, 144 + (col - row / 2) * 24, 20 + row * 20, row, col);
    }
  } else if (key === 'dots-ring') {
    ring('ring', 43, 12, 0);
  } else if (key === 'dots-arc') {
    for (let col = 0; col < 9; col++) {
      const angle = (20 + col * 17.5) * Math.PI / 180;
      dot(`arc.p${col}`, 144 - Math.cos(angle) * 90, 112 - Math.sin(angle) * 90, 0, col);
    }
  } else if (key === 'dots-radial') {
    dot('center', 144, 60, 0, 0);
    for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
      const angle = row * Math.PI / 3, radius = (col + 1) * 16;
      dot(`ray${row}.p${col}`, 144 + Math.cos(angle) * radius, 60 + Math.sin(angle) * radius, row + 1, col, row + 1);
    }
  } else if (key === 'dots-cross') {
    for (let col = 0; col < 9; col++) dot(`horizontal.p${col}`, 64 + col * 20, 60, 0, col);
    for (const [row, yy] of [20, 40, 80, 100].entries()) dot(`vertical.p${row}`, 144, yy, row + 1, 4);
  } else if (key === 'dots-clusters') {
    for (let group = 0; group < 3; group++) {
      const cx = 75 + group * 69;
      dot(`cluster${group}.apex`, cx, 46, 0, group * 3, group);
      dot(`cluster${group}.left`, cx - 12, 69, 1, group * 3 + 1, group);
      dot(`cluster${group}.right`, cx + 12, 69, 1, group * 3 + 2, group);
    }
  } else if (key === 'dots-concentric') {
    ring('outer', 44, 16, 0); ring('inner', 23, 8, 1);
  } else if (key === 'dots-bands') {
    for (let group = 0; group < 3; group++) for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
      dot(`band${group}.r${row}.c${col}`, 64 + group * 71 + col * 18, 24 + row * 24, row, group * 2 + col, group);
    }
  } else if (key === 'dots-wave') {
    for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) {
      dot(`r${row}.c${col}`, 40 + col * 26, 28 + row * 32 + Math.sin(col * Math.PI / 4) * 8, row, col, row);
    }
  } else if (key === 'dots-tapered') {
    const xs = [38, 56, 78, 106, 142, 188, 248];
    for (let row = 0; row < 3; row++) for (const [col, xx] of xs.entries()) {
      dot(`r${row}.c${col}`, xx, 32 + row * 28, row, col);
    }
  } else if (key === 'dots-corners') {
    for (const [group, [cx, cy]] of [[55, 30], [233, 30], [55, 90], [233, 90]].entries()) {
      for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
        dot(`corner${group}.r${row}.c${col}`, cx - 9 + col * 18, cy - 9 + row * 18, row, col, group);
      }
    }
  }
  return points;
}

/**
 * Draw editable native circles in a fitted 288 × 120 design box.
 * diameter (alias d) uses design pixels. Very large diameters are capped to
 * leave a four-pixel gap between circles and a four-pixel outer margin.
 * highlight accepts dot indices or stable dot keys; colors accepts an array
 * of per-dot fills or an object keyed by index / dot key. All defaults use blue
 * outlines and white fills; filled switches the default fill to blue.
 */
export function drawDotVariant(slide, instanceId, bounds, options = {}) {
  const { x, y, w, h } = bounds ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Dot bounds require finite x/y and positive w/h.');
  }
  if (typeof instanceId !== 'string' || !instanceId) throw new TypeError('A dot instanceId is required.');
  if (options.componentId !== undefined && options.componentId !== 'graphic.dots') {
    throw new RangeError('Dot variants belong to graphic.dots.');
  }
  const key = options.variant ?? 'dots-staggered', spec = BY_KEY.get(key);
  if (!spec) throw new RangeError(`Unknown dot variant ${JSON.stringify(key)}.`);
  const requestedDiameter = options.diameter ?? options.d ?? 11;
  if (!Number.isFinite(requestedDiameter) || requestedDiameter <= 0) {
    throw new RangeError('Dot diameter must be a positive finite number.');
  }
  const points = layoutFor(key);
  let minDistance = Infinity, minEdge = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]; minEdge = Math.min(minEdge, a.x, 288 - a.x, a.y, 120 - a.y);
    for (let j = 0; j < i; j++) minDistance = Math.min(minDistance, Math.hypot(a.x - points[j].x, a.y - points[j].y));
  }
  const diameter = Math.min(requestedDiameter, minDistance - 4, (minEdge - 4) * 2);
  const scale = Math.min(w / 288, h / 120);
  const ox = x + (w - 288 * scale) / 2, oy = y + (h - 120 * scale) / 2;
  const color = options.color ?? C.blue, stroke = options.stroke ?? color;
  const filled = Boolean(options.filled), defaultFill = options.fill ?? (filled ? color : C.white);
  const highlight = new Set(Array.isArray(options.highlight) ? options.highlight : options.highlight == null ? [] : [options.highlight]);
  const shapes = [], dots = [];
  for (const [index, point] of points.entries()) {
    const dotBounds = { x: ox + (point.x - diameter / 2) * scale, y: oy + (point.y - diameter / 2) * scale,
      w: diameter * scale, h: diameter * scale };
    const highlighted = highlight.has(index) || highlight.has(point.key);
    const customFill = options.colors?.[point.key] ?? options.colors?.[index];
    const fill = customFill ?? (highlighted ? options.highlightColor ?? color : defaultFill);
    const s = shape(slide, `${instanceId}.${point.key}`, 'ellipse',
      dotBounds.x, dotBounds.y, dotBounds.w, dotBounds.h, fill, stroke, 1.1 * scale);
    shapes.push(s); dots.push({ shape: s, index, row: point.row, col: point.col, key: point.key,
      group: point.group, bounds: dotBounds, highlighted });
  }
  return { id: instanceId, componentId: 'graphic.dots', variant: key, group: spec.group,
    bounds: { x, y, w, h }, designBounds: { x: ox, y: oy, w: 288 * scale, h: 120 * scale },
    requestedDiameter, diameter, renderedDiameter: diameter * scale, shapes, dots };
}
