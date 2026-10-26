const clamp = n => Math.max(0, Math.min(1, n));
const range = (p, a, b) => clamp((p - a) / (b - a));
const ease = n => n * n * (3 - 2 * n);

// One reversible camera path. Values are derived from scroll, never accumulated.
export function cinemaAt(progress, reduced = false) {
  const p = Math.max(0, Math.min(6, Number.isFinite(progress) ? progress : 0));
  if (reduced) return { p, door: 0, dolly: 1, interior: 1, facade: p < 1.2,
    brewReveal: p >= 1.2 ? 1 : 0, latteReveal: p >= 2.65 ? 1 : 0,
    brewTime: 0, latteTime: 1, finish: 0, videoScale: 1 };
  return {
    p,
    door: ease(range(p, .08, .82)) * 88,
    dolly: 1 + ease(range(p, .28, 1.18)) * 3.1,
    interior: 1.04 + ease(range(p, .2, 1.5)) * .28,
    facade: p < 1.2,
    brewReveal: ease(range(p, 1.18, 1.5)),
    latteReveal: ease(range(p, 2.55, 2.78)),
    brewTime: range(p, 1.42, 2.65),
    latteTime: range(p, 2.69, 3.8),
    finish: ease(range(p, 3.72, 4)),
    videoScale: 1 + range(p, 1.45, 2.65) * .08,
  };
}

export const filmCaptions = [
  { start: 0, end: .55, label: 'DAYBREAK COFFEE CLUB', lines: ['A slower morning.', 'A brighter day.'] },
  { start: .58, end: 1.18, label: '01 — COME ON IN', lines: ['Leave the rush', 'at the door.'] },
  { start: 1.38, end: 2, label: '02 — THE MORNING RITUAL', lines: ['Good things', 'take a moment.'] },
  { start: 2.02, end: 2.55, label: '03 — LIQUID GOLD', lines: ['Worth every', 'little second.'] },
  { start: 2.82, end: 3.42, label: '04 — THE FINISHING TOUCH', lines: ['A little care.', 'A lovely cup.'] },
  { start: 3.46, end: 3.96, label: '05 — MADE FOR YOU', lines: ['Your morning,', 'made sweeter.'] },
];

export function captionAt(p, start, end) {
  const incoming = start === 0 ? 1 : range(p, start, start + .1);
  const outgoing = 1 - range(p, end - .12, end);
  return Math.min(incoming, outgoing);
}
