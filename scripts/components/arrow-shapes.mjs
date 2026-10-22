import { C, FONT, shape } from './research-components.mjs';
import {resolveArrowFill} from './arrow-fills.mjs';

// Keys follow DrawingML preset names. The two ring variants use one editable
// native path because the current renderer distorts their preset arrowheads.
// Orientation and color changes stay options, rather than extra entries.
export const ARROW_SHAPES = Object.freeze([
  { key: 'rightArrow', name: '实心直箭头', note: '基准直箭头', group: 'straight', aspect: 'wide' },
  { key: 'notchedRightArrow', name: '燕尾缺口箭头', note: '尾部带 V 形缺口', group: 'straight', aspect: 'wide' },
  { key: 'stripedRightArrow', name: '条纹尾箭头', note: '尾部带分隔条纹', group: 'straight', aspect: 'wide' },
  { key: 'homePlate', name: '五边形旗帜箭头', note: '完整旗帜轮廓', group: 'straight', aspect: 'wide' },
  { key: 'triangle', name: '三角箭头头部', note: '独立头部，便于组合连线', group: 'straight', aspect: 'square' },
  { key: 'swooshArrow', name: '收尖流线箭头', note: '尾部收尖的弧形轮廓', group: 'straight', aspect: 'wide' },
  { key: 'bentArrow', name: '直角转弯箭头', note: 'L 形宽箭头', group: 'turn', aspect: 'square' },
  { key: 'uturnArrow', name: 'U 形回转箭头', note: '两臂平行的回转轮廓', group: 'turn', aspect: 'square' },
  { key: 'curvedRightArrow', name: '圆弧转弯箭头', note: '厚边弧形转弯', group: 'turn', aspect: 'square' },
  { key: 'circularArrow', name: '开口环形箭头', note: '270°弧环与单端箭头', group: 'turn', aspect: 'square', editableGeometry: 'path' },
  { key: 'leftRightCircularArrow', name: '双端环形箭头', note: '270°弧环与双端箭头', group: 'turn', aspect: 'square', editableGeometry: 'path' },
  { key: 'leftRightArrow', name: '双向宽箭头', note: '左右两端同时指向', group: 'multi', aspect: 'wide' },
  { key: 'leftUpArrow', name: 'L 形双端箭头', note: '两个垂直方向的端点', group: 'multi', aspect: 'square' },
  { key: 'leftRightUpArrow', name: 'T 形三向箭头', note: '三端宽箭头', group: 'multi', aspect: 'square' },
  { key: 'quadArrow', name: '十字四向箭头', note: '四端宽箭头', group: 'multi', aspect: 'square' },
  { key: 'rightArrowCallout', name: '单端标注框箭头', note: '框体与单端箭头一体', group: 'multi', aspect: 'wide', callout: true },
  { key: 'leftRightArrowCallout', name: '双端标注框箭头', note: '框体与双端箭头一体', group: 'multi', aspect: 'wide', callout: true },
].map(item => Object.freeze(item)));

const BY_KEY = new Map(ARROW_SHAPES.map(item => [item.key, item]));

function ringPath(w, h, doubleEnded) {
  const cx = w / 2, cy = h / 2, rx = w * .4, ry = h * .4, inner = .64;
  const start = Math.PI / 4, end = start + 3 * Math.PI / 2;
  const point = (a, ratio = 1) => ({ x: cx + rx * ratio * Math.cos(a), y: cy + ry * ratio * Math.sin(a) });
  const commands = [{ moveTo: point(start) }];
  function arc(a, b, ratio) {
    const segments = Math.ceil(Math.abs(b - a) / (Math.PI / 2));
    for (let i = 0; i < segments; i++) {
      const p = a + (b - a) * i / segments, q = a + (b - a) * (i + 1) / segments;
      const factor = 4 / 3 * Math.tan((q - p) / 4), p0 = point(p, ratio), p1 = point(q, ratio);
      commands.push({ cubicBezTo: { x1: p0.x - factor * rx * ratio * Math.sin(p),
        y1: p0.y + factor * ry * ratio * Math.cos(p),
        x2: p1.x + factor * rx * ratio * Math.sin(q),
        y2: p1.y - factor * ry * ratio * Math.cos(q), x: p1.x, y: p1.y } });
    }
  }
  function head(a, reverse = false) {
    const mid = point(a, (1 + inner) / 2), band = Math.min(rx, ry) * (1 - inner);
    const tangent = { x: -rx * Math.sin(a), y: ry * Math.cos(a) };
    const normal = { x: Math.cos(a) / rx, y: Math.sin(a) / ry };
    const tl = Math.hypot(tangent.x, tangent.y), nl = Math.hypot(normal.x, normal.y);
    const half = band * .9, length = band * 1.55, sign = reverse ? -1 : 1;
    return { outer: { x: mid.x + normal.x / nl * half, y: mid.y + normal.y / nl * half },
      tip: { x: mid.x + sign * tangent.x / tl * length, y: mid.y + sign * tangent.y / tl * length },
      inner: { x: mid.x - normal.x / nl * half, y: mid.y - normal.y / nl * half } };
  }
  arc(start, end, 1);
  const endHead = head(end);
  for (const p of [endHead.outer, endHead.tip, endHead.inner, point(end, inner)]) commands.push({ lineTo: p });
  arc(end, start, inner);
  if (doubleEnded) {
    const startHead = head(start, true);
    for (const p of [startHead.inner, startHead.tip, startHead.outer]) commands.push({ lineTo: p });
  }
  commands.push({ close: {} });
  return { width: w, height: h, commands };
}

function fittedPosition({ x, y, w, h }, rotation = 0, options = {}) {
  const angle = ((rotation % 360) + 360) % 360;
  if (![0, 90, 180, 270].includes(angle)) {
    throw new RangeError('Arrow rotation must be a multiple of 90 degrees.');
  }
  const quarterTurn = angle === 90 || angle === 270;
  const width = quarterTurn ? h : w, height = quarterTurn ? w : h;
  return { left: x + (w - width) / 2, top: y + (h - height) / 2, width, height,
    rotation: angle, horizontalFlip: !!options.flipHorizontal, verticalFlip: !!options.flipVertical };
}

/**
 * Draw one editable native arrow shape inside the supplied visual bounds.
 * Ring arrows are single closed native Bezier paths, not raster images.
 *
 * options.shape: one ARROW_SHAPES key (default rightArrow)
 * options.gradient: ARROW_GRADIENTS key, true, or a native fill configuration
 * options.faded: legacy left-light/right-blue fill
 * options.gradientAngle: horizontal by default, independently adjustable
 * options.outline: existing white/blue outline treatment
 * options.rotation: 0/90/180/270; orientation is not another shape entry
 * options.adjustmentList: native DrawingML guide values, passed unchanged
 * options.label: optional editable text, normally used by callout shapes
 */
export function drawArrowShape(slide, id, rect, options = {}) {
  const { x, y, w, h } = rect ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Arrow bounds require finite x/y and positive w/h.');
  }
  const key = options.shape ?? 'rightArrow';
  if (!BY_KEY.has(key)) {
    throw new RangeError(`Unknown arrow shape ${JSON.stringify(key)}. Use an ARROW_SHAPES key.`);
  }
  const baseRotation = key === 'triangle' ? 90 : 0;
  const position = fittedPosition(rect, baseRotation + (options.rotation ?? 0), options);
  const fill = options.outline ? C.white : resolveArrowFill(options);
  const isRing = key === 'circularArrow' || key === 'leftRightCircularArrow';
  const extra = { position, ...(isRing ? { customPaths: [ringPath(position.width, position.height, key === 'leftRightCircularArrow')] } : {}) };
  if (options.adjustmentList !== undefined) extra.adjustmentList = options.adjustmentList;
  const arrow = shape(slide, `${id}.body`, isRing ? 'custom' : key, position.left, position.top, position.width, position.height,
    fill, options.outline ? C.blue : 'none', options.outline ? 1.8 : 0, extra);
  if (options.label !== undefined && String(options.label).length) {
    arrow.text.style = { typeface: FONT, fontSize: options.fontSize ?? 22,
      color: options.outline ? C.blue : C.white, bold: true,
      alignment: 'center', verticalAlignment: 'middle', insets: 4,
      autoFit: 'none', wrap: 'square' };
    arrow.text = String(options.label);
  }
  return arrow;
}
