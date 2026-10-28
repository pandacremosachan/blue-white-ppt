import { C, shape, text, box, node, connect, line } from './research-components.mjs';
import {drawLayoutPreset} from './layout-presets.mjs';
import {drawConnectionVariant} from './connection-variants.mjs';

// All public builders use the same outer box and neutral labels. They return
// the native objects and useful bounds; grouping is handled by the PPTX packer.
function checkedBounds(rect) {
  const { x, y, w, h } = rect ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('A structure requires finite x/y and positive w/h.');
  }
  return { x, y, w, h };
}

function integer(value, fallback, min, max, name) {
  const n = value ?? fallback;
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new RangeError(`${name} must be an integer from ${min} to ${max}.`);
  }
  return n;
}

function enumValue(value, fallback, allowed, name) {
  const selected = value ?? fallback;
  if (!allowed.includes(selected)) throw new RangeError(`${name} must be ${allowed.join(' or ')}.`);
  return selected;
}

function neutral(index) {
  return index < 26 ? String.fromCharCode(65 + index) : `节点${index + 1}`;
}

function context(slide, id, rect, options) {
  const bounds = checkedBounds(rect), shapes = [];
  const keep = object => { shapes.push(object); return object; };
  const font = options.fontSize ?? 20;
  const result = extra => ({ id, shapes, bounds, ...extra });
  return {
    ...bounds, shapes, keep, result,
    n(key, label, x, y, w, h, extra = {}) {
      return keep(node(slide, `${id}.${key}`, label, x, y, w, h, {
        size: Math.min(font, Math.max(12, h - 6)), insets: 2,
        fill: options.fill ?? C.bluePale, stroke: options.stroke ?? C.border,
        color: options.color ?? C.ink, ...extra,
      }));
    },
    e(key, from, to, extra = {}) {
      return keep(connect(slide, `${id}.${key}`, from, to, {
        color: options.lineColor ?? C.blueDark, ...extra,
      }));
    },
    l(key, x1, y1, x2, y2, dashed = false) {
      return keep(line(slide, `${id}.${key}`, Math.min(x1, x2), Math.min(y1, y2),
        Math.abs(x2 - x1), Math.abs(y2 - y1), options.lineColor ?? C.blueDark, 1.7, dashed));
    },
    a(key, x1, y1, x2, y2, dashed = false) {
      const dx = x2 - x1, dy = y2 - y1;
      return keep(shape(slide, `${id}.${key}`, 'connector', Math.min(x1, x2), Math.min(y1, y2),
        Math.abs(dx), Math.abs(dy), 'none', options.lineColor ?? C.blueDark, 1.7, {
          kind: 'straight',
          position: { left: Math.min(x1, x2), top: Math.min(y1, y2), width: Math.abs(dx), height: Math.abs(dy), horizontalFlip: dx < 0, verticalFlip: dy < 0 },
          line: { fill: options.lineColor ?? C.blueDark, width: 1.7, style: dashed ? 'dashed' : 'solid' },
          tail: { type: 'triangle', width: 'sm', length: 'sm' },
        }));
    },
    t(key, value, x, y, w, h, extra = {}) {
      return keep(text(slide, `${id}.${key}`, value, x, y, w, h, font, C.blueText, true, 'center', extra));
    },
  };
}

export function drawJunction(slide, id, rect, options = {}) {
  if(options.variant)return drawConnectionVariant(slide,id,rect,{...options,componentId:'connector.junction'});
  const g = context(slide, id, rect, options);
  const count = integer(options.count, 2, 2, 4, 'count');
  const direction = enumValue(options.direction, 'split', ['split', 'merge'], 'direction');
  const labels = options.labels ?? Array.from({ length: count + 1 }, (_, i) => neutral(i));
  const nw = g.w * .29, nh = Math.min(46, g.h / (count * 1.35));
  const left = g.x, right = g.x + g.w - nw;
  const middleY = g.y + (g.h - nh) / 2;
  const source = g.n('single', labels[direction === 'split' ? 0 : count] ?? neutral(count),
    direction === 'split' ? left : right, middleY, nw, nh);
  const branches = Array.from({ length: count }, (_, i) => {
    const n = g.n(`branch${i}`, labels[direction === 'split' ? i + 1 : i] ?? neutral(i),
      direction === 'split' ? right : left, g.y + i * (g.h - nh) / (count - 1), nw, nh);
    if (direction === 'split') g.e(`edge${i}`, source, n, { kind: 'elbow', dashed: !!options.dashed });
    else g.e(`edge${i}`, n, source, { kind: 'elbow', dashed: !!options.dashed });
    return n;
  });
  return g.result({ direction, nodes: [source, ...branches], single: source, branches });
}

export function drawBypass(slide, id, rect, options = {}) {
  if(options.variant)return drawConnectionVariant(slide,id,rect,{...options,componentId:'connector.bypass'});
  const g = context(slide, id, rect, options);
  const direction = enumValue(options.direction, 'forward', ['forward', 'return'], 'direction');
  const labels = options.labels ?? ['A', 'B', 'C'];
  if (!Array.isArray(labels) || labels.length < 2) throw new RangeError('labels requires at least two entries.');
  const count = labels.length, gap = Math.min(42, g.w / (count * 4));
  const nw = (g.w - gap * (count - 1)) / count, nh = Math.min(50, g.h * .29);
  const nodeY = g.y + (direction === 'forward' ? g.h * .54 : g.h * .15);
  const routeY = direction === 'forward' ? g.y + 7 : g.y + g.h - 7;
  const nodes = labels.map((label, i) => g.n(`node${i}`, label, g.x + i * (nw + gap), nodeY, nw, nh));
  for (let i = 0; i < nodes.length - 1; i++) g.e(`main${i}`, nodes[i], nodes[i + 1]);
  const firstX = g.x + nw / 2, lastX = g.x + g.w - nw / 2;
  const attachY = direction === 'forward' ? nodeY : nodeY + nh;
  const fromX = direction === 'forward' ? firstX : lastX;
  const toX = direction === 'forward' ? lastX : firstX;
  // A shared top port on each transparent anchor is the exact bend point.
  // It keeps the original three straight segments while making all ends native.
  const anchors = [fromX, toX].map((xx, i) => g.keep(shape(slide,
    `${id}.bypass.anchor${i}`, 'rect', xx - .05, routeY, .1, .1, 'none', 'none', 0)));
  const routeEdges = [];
  function routeEdge(key, from, to, fromSide, toSide, arrow = false) {
    const s = slide.shapes.connect(from, to, {
      kind: 'straight', fromSide, toSide,
      line: { fill: options.lineColor ?? C.blueDark, width: 1.7, style: options.dashed ? 'dashed' : 'solid' },
      tail: { type: arrow ? 'triangle' : 'none', width: 'sm', length: 'sm' },
    });
    s.name = `${id}.${key}`; s.bringToFront(); g.keep(s); routeEdges.push(s); return s;
  }
  const source = direction === 'forward' ? nodes[0] : nodes[nodes.length - 1];
  const target = direction === 'forward' ? nodes[nodes.length - 1] : nodes[0];
  const side = direction === 'forward' ? 'top' : 'bottom';
  routeEdge('bypass.start', source, anchors[0], side, 'top');
  routeEdge('bypass.span', anchors[0], anchors[1], 'top', 'top');
  routeEdge('bypass.end', anchors[1], target, 'top', side, true);
  return g.result({ direction, nodes, anchors, routeEdges, route: [{ x: fromX, y: attachY }, { x: fromX, y: routeY }, { x: toX, y: routeY }, { x: toX, y: attachY }] });
}

export function drawChain(slide, id, rect, options = {}) {
  const g = context(slide, id, rect, options);
  const direction = enumValue(options.direction, 'horizontal', ['horizontal', 'vertical'], 'direction');
  const labels = options.labels ?? ['A', 'B', 'C'];
  if (!Array.isArray(labels) || labels.length < 1) throw new RangeError('labels requires at least one entry.');
  const count = labels.length;
  let nodes;
  if (direction === 'horizontal') {
    const gap = count === 1 ? 0 : Math.min(46, g.w / (count * 4));
    const nw = (g.w - gap * (count - 1)) / count, nh = Math.min(52, g.h);
    nodes = labels.map((label, i) => g.n(`node${i}`, label, g.x + i * (nw + gap), g.y + (g.h - nh) / 2, nw, nh));
  } else {
    const nh = Math.min(50, g.h / Math.max(1, count * 1.45));
    const gap = count === 1 ? 0 : (g.h - nh * count) / (count - 1);
    const nw = Math.min(270, g.w * .76), startY = count === 1 ? g.y + (g.h - nh) / 2 : g.y;
    nodes = labels.map((label, i) => g.n(`node${i}`, label, g.x + (g.w - nw) / 2, startY + i * (nh + gap), nw, nh));
  }
  for (let i = 0; i < count - 1; i++) {
    g.e(`edge${i}`, nodes[i], nodes[i + 1], direction === 'vertical'
      ? { fromSide: 'bottom', toSide: 'top', dashed: !!options.dashed }
      : { dashed: !!options.dashed });
  }
  return g.result({ direction, nodes });
}

export function drawParallel(slide, id, rect, options = {}) {
  const g = context(slide, id, rect, options);
  const count = integer(options.count, 2, 2, 3, 'count');
  const steps = integer(options.steps, 2, 1, 6, 'steps');
  const labels = options.labels ?? [];
  const merge = options.merge !== false;
  const outputW = merge ? Math.min(120, g.w * .22) : 0;
  const mergeGap = merge ? Math.min(58, g.w * .11) : 0;
  const chainW = g.w - outputW - mergeGap;
  const gap = steps === 1 ? 0 : Math.min(46, chainW / (steps * 4));
  const nw = (chainW - gap * (steps - 1)) / steps, nh = Math.min(48, g.h / (count * 1.45));
  const rows = [];
  for (let r = 0; r < count; r++) {
    const row = Array.from({ length: steps }, (_, c) => {
      const value = Array.isArray(labels[r]) ? labels[r][c] : labels[r * steps + c];
      return g.n(`row${r}.node${c}`, value ?? `${neutral(r)}${c + 1}`,
        g.x + c * (nw + gap), g.y + r * (g.h - nh) / (count - 1), nw, nh);
    });
    for (let c = 0; c < steps - 1; c++) g.e(`row${r}.edge${c}`, row[c], row[c + 1], { dashed: !!options.dashed });
    rows.push(row);
  }
  let output = null;
  if (merge) {
    const outputH = Math.min(48, Math.max(nh, g.h * .36));
    output = g.n('output', options.outputLabel ?? '输出', g.x + g.w - outputW,
      g.y + (g.h - outputH) / 2, outputW, outputH);
    rows.forEach((row, r) => g.e(`merge${r}`, row[row.length - 1], output,
      { kind: 'elbow', dashed: !!options.dashed }));
  }
  return g.result({ rows, nodes: merge ? [...rows.flat(), output] : rows.flat(), output, merge });
}

export function drawLayers(slide, id, rect, options = {}) {
  if(options.variant)return drawConnectionVariant(slide,id,rect,{...options,componentId:'structure.layers'});
  const g = context(slide, id, rect, options);
  const counts = options.counts ?? [3, 4, 2];
  const connection = enumValue(options.connection, 'all', ['all', 'paired'], 'connection');
  if (!Array.isArray(counts) || counts.length < 2 || counts.some(n => !Number.isInteger(n) || n < 1 || n > 12)) {
    throw new RangeError('counts requires at least two positive layer counts, each no greater than 12.');
  }
  const maximum = Math.max(...counts), titles = options.titles ?? [];
  const usableH = g.h - (titles.length ? 30 : 0);
  const d = Math.min(options.diameter ?? 25, usableH / (maximum * 1.42), g.w / (counts.length * 3));
  const stepY = Math.min(d + 13, maximum === 1 ? 0 : (usableH - d) / (maximum - 1));
  const paddingX = titles.length ? Math.min(55, g.w / (counts.length * 2)) : 0;
  const layers = counts.map((count, c) => {
    const x = g.x + paddingX + c * (g.w - 2 * paddingX - d) / (counts.length - 1), y = g.y + (usableH - d - (count - 1) * stepY) / 2;
    const layer = Array.from({ length: count }, (_, r) => g.keep(shape(slide, `${id}.layer${c}.node${r}`, 'ellipse',
      x, y + r * stepY, d, d, options.fill ?? C.bluePale, options.stroke ?? C.blue, 1.5)));
    if (titles[c] !== undefined) {
      const titleW = Math.min(130, g.w / counts.length);
      const titleX = Math.max(g.x, Math.min(x + d / 2 - titleW / 2, g.x + g.w - titleW));
      g.t(`layer${c}.title`, titles[c], titleX, g.y + usableH + 3, titleW, 26);
    }
    return layer;
  });
  const edges = [];
  function join(a, b, key) {
    const edge = slide.shapes.connect(a, b, { kind: 'straight', fromSide: 'right', toSide: 'left',
      line: { fill: options.lineColor ?? '#A8BED2', width: options.lineWidth ?? .9, style: 'solid' },
      tail: { type: 'none' } });
    edge.name = `${id}.${key}`;edge.bringToFront();g.keep(edge);edges.push(edge);
  }
  for (let c = 0; c < layers.length - 1; c++) {
    if (connection === 'all') layers[c].forEach((a, i) => layers[c + 1].forEach((b, j) => join(a, b, `edge${c}.${i}.${j}`)));
    else for (let r = 0; r < Math.min(layers[c].length, layers[c + 1].length); r++) join(layers[c][r], layers[c + 1][r], `edge${c}.${r}`);
  }
  layers.flat().forEach(n => n.bringToFront());
  return g.result({ layers, nodes: layers.flat(), edges, connection });
}

export function drawPartitions(slide, id, rect, options = {}) {
  if(options.preset)return drawLayoutPreset(slide,id,rect,options);
  const g = context(slide, id, rect, options);
  const rows = integer(options.rows, 1, 1, 6, 'rows'), cols = integer(options.cols, 3, 1, 6, 'cols');
  const sideLabel = options.sideLabel ?? '', titles = options.titles ?? [];
  const gap = options.gap ?? 12;
  const sideW = sideLabel ? Math.min(100, g.w * .17) : 0;
  const startX = g.x + (sideLabel ? sideW + gap : 0), contentW = g.w - (sideLabel ? sideW + gap : 0);
  const cw = (contentW - gap * (cols - 1)) / cols, ch = (g.h - gap * (rows - 1)) / rows;
  if (cw <= 0 || ch <= 0) throw new RangeError('Partition gaps leave no content area.');
  if (sideLabel) g.n('side', sideLabel, g.x, g.y, sideW, g.h, { fill: C.blue, color: C.yellow, stroke: 'none', round: true });
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = startX + c * (cw + gap), y = g.y + r * (ch + gap), index = r * cols + c;
    const panel = g.keep(box(slide, `${id}.cell${r}.${c}`, x, y, cw, ch, options.fill ?? C.white, options.stroke ?? C.border, 1.3));
    const value = Array.isArray(titles[r]) ? titles[r][c] : titles[index];
    const headingH = Math.min(34, ch * .32);
    g.t(`cell${r}.${c}.title`, value ?? neutral(index), x + 7, y + 5, Math.max(1, cw - 14), headingH);
    if (options.divider !== false) g.keep(line(slide, `${id}.cell${r}.${c}.divider`, x + 9, y + headingH + 10, Math.max(1, cw - 18), 0, C.border, 1));
    cells.push({ shape: panel, row: r, col: c, bounds: { x, y, w: cw, h: ch },
      contentBounds: { x: x + 9, y: y + headingH + 18, w: Math.max(1, cw - 18), h: Math.max(1, ch - headingH - 27) } });
  }
  return g.result({ rows, cols, cells });
}
