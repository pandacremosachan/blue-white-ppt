import { C } from './research-components.mjs';
import { flowContext } from './flow-core.mjs';

export const CONNECTION_ROUTE_VARIANTS = Object.freeze([
  { componentId: 'connector.link', key: 'link-offset-elbow', name: '错位端口折线', note: '三段正交路径连接错位节点', group: 'routing' },
  { componentId: 'connector.link', key: 'link-side-detour', name: '同侧端口绕行', note: '上下节点由两个左侧端口绕行相连', group: 'routing' },
  { componentId: 'connector.junction', key: 'junction-tree', name: '分级分流', note: '两级树将一路展开为二路再四路', group: 'junction' },
  { componentId: 'connector.junction', key: 'junction-tapped-trunk', name: '连续接入干线', note: '三条支路从公共干线不同位置分出', group: 'junction' },
].map(item => Object.freeze({ ...item, options: Object.freeze({ variant: item.key }) })));

const BY_KEY = new Map(CONNECTION_ROUTE_VARIANTS.map(item => [item.key, item]));

/**
 * Neutral native connection structures in the shared 540 × 350 system.
 * options.labels uses node keys A…G. Routing variants accept existing native
 * options.from/to shapes; their text and styling are left to the caller.
 * Optional elbowX/detourX values use this component's design coordinates.
 */
export function drawConnectionRoute(slide, id, bounds, options = {}) {
  const key = options.variant ?? CONNECTION_ROUTE_VARIANTS.find(item => item.componentId === options.componentId)?.key ?? 'link-offset-elbow';
  const spec = BY_KEY.get(key);
  if (!spec) throw new RangeError(`Unknown connection-route variant ${JSON.stringify(key)}.`);
  if (options.componentId !== undefined && options.componentId !== spec.componentId) {
    throw new RangeError(`Variant ${JSON.stringify(key)} does not belong to ${options.componentId}.`);
  }
  const g = flowContext(slide, id, bounds, options), anchors = [], junctions = [];
  let endpoints;
  function anchor(name, x, y) { const s = g.anchor(name, x, y); anchors.push(s); return s; }
  function wire(name, from, to, fromSide, toSide, arrow = true) {
    return g.e(name, from, to, { fromSide, toSide, arrow });
  }
  function node(letter, x, y, w = 100, h = 48, highlight = false) {
    return g.n(letter, letter, x, y, w, h, { highlight });
  }
  function portPosition(native, side) {
    const p = native?.position;
    if (!p || ![p.left, p.top, p.width, p.height].every(Number.isFinite)) {
      throw new TypeError('Connection endpoints must be native shapes with finite positions.');
    }
    return {
      x: (p.left + (side === 'left' ? 0 : p.width) - g.x) / g.sx,
      y: (p.top + p.height / 2 - g.y) / g.sy,
    };
  }

  if (key === 'link-offset-elbow') {
    const a = options.from ?? node('A', 42, 52, 140, 52, true), b = options.to ?? node('B', 358, 246, 140, 52);
    const from = portPosition(a, 'right'), to = portPosition(b, 'left');
    const elbowX = options.elbowX ?? (from.x + to.x) / 2;
    g.route('route', a, b, [[elbowX, from.y], [elbowX, to.y]], { fromSide: 'right', toSide: 'left' });
    endpoints = { from: a, to: b };
  } else if (key === 'link-side-detour') {
    const a = options.from ?? node('A', 344, 60, 140, 52, true), b = options.to ?? node('B', 344, 238, 140, 52);
    const from = portPosition(a, 'left'), to = portPosition(b, 'left');
    const detourX = options.detourX ?? Math.min(136, from.x - 48, to.x - 48);
    if (options.avoidance) g.frame('avoidance', '', 236, 142, 92, 66, { fill: C.white, dashed: true });
    g.route('route', a, b, [[detourX, from.y], [detourX, to.y]], { fromSide: 'left', toSide: 'left' });
    endpoints = { from: a, to: b };
  } else if (key === 'junction-tree') {
    const a = node('A', 20, 147, 100, 48, true), b = node('B', 220, 61), c = node('C', 220, 233);
    const d = node('D', 420, 20, 100, 44), e = node('E', 420, 106, 100, 44);
    const f = node('F', 420, 192, 100, 44), h = node('G', 420, 278, 100, 44);
    const root = anchor('root.split', 170, 171), upper = anchor('root.upper', 170, 85), lower = anchor('root.lower', 170, 257);
    wire('A.root', a, root, 'right', 'left', false);
    wire('root.upper', root, upper, 'top', 'bottom', false);
    wire('root.lower', root, lower, 'bottom', 'top', false);
    wire('upper.B', upper, b, 'right', 'left');
    wire('lower.C', lower, c, 'right', 'left');
    for (const [name, parent, yy, child1, y1, child2, y2] of [
      ['B', b, 85, d, 42, e, 128], ['C', c, 257, f, 214, h, 300],
    ]) {
      const split = anchor(`${name}.split`, 370, yy), top = anchor(`${name}.upper`, 370, y1), bottom = anchor(`${name}.lower`, 370, y2);
      wire(`${name}.split`, parent, split, 'right', 'left', false);
      wire(`${name}.upper`, split, top, 'top', 'bottom', false);
      wire(`${name}.lower`, split, bottom, 'bottom', 'top', false);
      wire(`${name}.child1`, top, child1, 'right', 'left');
      wire(`${name}.child2`, bottom, child2, 'right', 'left');
    }
  } else if (key === 'junction-tapped-trunk') {
    const a = node('A', 18, 151, 100, 48, true), b = node('B', 150, 45), c = node('C', 270, 259), d = node('D', 390, 45);
    const taps = [200, 320, 440].map((xx, i) => {
      const tap = g.n(`tap${i + 1}`, '', xx - 3, 172, 6, 6, { geometry: 'ellipse', fill: C.blue, stroke: 'none' });
      junctions.push(tap); return tap;
    });
    wire('trunk.first', a, taps[0], 'right', 'left', false);
    wire('trunk.second', taps[0], taps[1], 'right', 'left', false);
    wire('trunk.third', taps[1], taps[2], 'right', 'left', false);
    wire('tap1.B', taps[0], b, 'top', 'bottom');
    wire('tap2.C', taps[1], c, 'bottom', 'top');
    wire('tap3.D', taps[2], d, 'top', 'bottom');
  }
  const result = g.finish({ variant: key, componentId: spec.componentId, group: spec.group, endpoints, junctions });
  for (const s of result.shapes) if (s.name.startsWith(`${id}.route.point`)) anchors.push(s);
  return { ...result, anchors };
}
