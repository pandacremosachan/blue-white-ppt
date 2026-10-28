import { flowContext } from './flow-core.mjs';

export const BYPASS_VARIANTS = Object.freeze([
  ['bypass-partial-span', '局部跨接', '上跨A到C仅越过节点B', 'forward'],
  ['bypass-dual-span', '双路跨接', '上下跨接分别跳过一个节点', 'forward'],
  ['bypass-nested-return', '嵌套反馈', '外回D到A内回C到B', 'returns'],
  ['bypass-branch-return', '分支回接', '下支路C回接主路起点A', 'returns'],
].map(([key, name, note, group]) => Object.freeze({
  componentId: 'connector.bypass', key, name, note, group,
  options: Object.freeze({ variant: key }),
})));

const BY_KEY = new Map(BYPASS_VARIANTS.map(item => [item.key, item]));

/**
 * Neutral native flows in the common 540 × 350 drawing area.
 * labels accepts the stable node keys a/b/c/d; fontSize defaults to 20.
 * All route segments attach to native nodes or transparent native anchors.
 * The final segment alone has an arrow, and all ports stay clear of the
 * horizontal main path. nodesByKey exposes the reusable principal nodes.
 */
export function drawBypassVariant(slide, id, bounds, options = {}) {
  if (typeof id !== 'string' || !id) throw new TypeError('A bypass instance id is required.');
  if (options.componentId !== undefined && options.componentId !== 'connector.bypass') {
    throw new RangeError('Bypass variants belong to connector.bypass.');
  }
  const key = options.variant ?? 'bypass-partial-span', spec = BY_KEY.get(key);
  if (!spec) throw new RangeError(`Unknown bypass variant ${JSON.stringify(key)}.`);
  const g = flowContext(slide, id, bounds, options);
  const mainEdges = [], routes = {}, nodesByKey = {};
  const routeStyle = { dashed: Boolean(options.dashed) };
  function n(key, label, x, y, w = 82, h = 52) {
    const s = g.n(key, label, x, y, w, h); nodesByKey[key] = s; return s;
  }
  function main(key, from, to) {
    const s = g.e(`main.${key}`, from, to); mainEdges.push(s); return s;
  }

  if (key === 'bypass-branch-return') {
    const a = n('a', 'A', 46, 100, 92), b = n('b', 'B', 224, 100, 92);
    const d = n('d', 'D', 402, 100, 92), c = n('c', 'C', 224, 238, 92);
    main('a-b', a, b); main('b-d', b, d);
    routes.branchBC = [g.e('branch.b-c', b, c, { fromSide: 'bottom', toSide: 'top' })];
    // C returns to A from below; it has no connection to the terminal D.
    routes.returnCA = g.route('return.c-a', c, a, [[92, 264]], {
      ...routeStyle, fromSide: 'left', toSide: 'bottom',
    });
  } else {
    const a = n('a', 'A', 34, 155), b = n('b', 'B', 164, 155);
    const c = n('c', 'C', 294, 155), d = n('d', 'D', 424, 155);
    main('a-b', a, b); main('b-c', b, c); main('c-d', c, d);
    if (key === 'bypass-partial-span' || key === 'bypass-dual-span') {
      // The upper span skips B, then the unchanged main edge C→D continues.
      routes.bypassAC = g.route('bypass.a-c', a, c, [[75, 82], [335, 82]], {
        ...routeStyle, fromSide: 'top', toSide: 'top',
      });
      if (key === 'bypass-dual-span') {
        routes.bypassBD = g.route('bypass.b-d', b, d, [[205, 273], [465, 273]], {
          ...routeStyle, fromSide: 'bottom', toSide: 'bottom',
        });
      }
    } else {
      // The broad outer return goes D→A above the main chain; the shorter
      // inner return goes C→B below it. Their ports and lanes are separate.
      routes.returnDA = g.route('return.d-a', d, a, [[465, 72], [75, 72]], {
        ...routeStyle, fromSide: 'top', toSide: 'top',
      });
      routes.returnCB = g.route('return.c-b', c, b, [[335, 284], [205, 284]], {
        ...routeStyle, fromSide: 'bottom', toSide: 'bottom',
      });
    }
  }
  return g.finish({ componentId: 'connector.bypass', variant: key, group: spec.group,
    nodesByKey, mainEdges, routes, ...nodesByKey });
}
