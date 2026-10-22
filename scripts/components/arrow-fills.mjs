import { C } from './research-components.mjs';

export const ARROW_GRADIENTS = Object.freeze([
  { key: 'light-to-dark', name: '浅蓝至深蓝', note: '左浅右深' },
  { key: 'dark-to-light', name: '深蓝至浅蓝', note: '左深右浅' },
  { key: 'fade-in', name: '透明至实蓝', note: '左透明右不透明' },
  { key: 'fade-out', name: '实蓝至透明', note: '左不透明右透明' },
].map(item => Object.freeze({ ...item, options: Object.freeze({ gradient: item.key }) })));

const COLORS = Object.freeze({
  'light-to-dark': [C.blueFade, C.blue],
  'dark-to-light': [C.blue, C.blueFade],
  'fade-in': [`${C.blue}/0`, `${C.blue}/100`],
  'fade-out': [`${C.blue}/100`, `${C.blue}/0`],
});

/** Resolve a fill only; outline geometry and line styling stay with the caller. */
export function resolveArrowFill(options = {}) {
  const requested = options.gradient;
  if (options.gradientAngle !== undefined && !Number.isFinite(options.gradientAngle)) {
    throw new RangeError('gradientAngle must be a finite number of degrees.');
  }
  if (requested !== null && typeof requested === 'object') {
    if (requested.type === 'gradient' && options.gradientAngle !== undefined) {
      return { ...requested, angleDeg: options.gradientAngle };
    }
    return requested;
  }
  const key = typeof requested === 'string' ? requested
    : requested === true || options.faded === true ? 'light-to-dark' : null;
  if (key === null) return C.blue;
  const colors = COLORS[key];
  if (!colors) throw new RangeError(`Unknown arrow gradient ${JSON.stringify(key)}. Use an ARROW_GRADIENTS key.`);
  return { type: 'gradient', gradientKind: 'linear', angleDeg: options.gradientAngle ?? 0,
    stops: [{ offset: 0, color: colors[0] }, { offset: 100000, color: colors[1] }] };
}
