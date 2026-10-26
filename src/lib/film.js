export const SHOTS = ['door', 'espresso', 'serve'];
export const FRAMES_PER_SHOT = 16;
export const FRAME_COUNT = SHOTS.length * FRAMES_PER_SHOT;
export const frameUrl = frame => `/images/film-hd/${SHOTS[Math.floor(frame / FRAMES_PER_SHOT)]}-${String(frame % FRAMES_PER_SHOT).padStart(2, '0')}.webp`;

// A reversible edit: doorway -> espresso extraction -> service.
// Cuts change shots directly; there is no opacity blending between images.
export function filmAt(progress, reduced = false) {
  const p = Math.max(0, Math.min(4, Number.isFinite(progress) ? progress : 0));
  const shot = p < 1.4 ? 0 : p < 2.7 ? 1 : 2;
  const starts = [0, 1.4, 2.7], ends = [1.4, 2.7, 4];
  const local = Math.min(1, Math.max(0, (p - starts[shot]) / (ends[shot] - starts[shot])));
  const index = reduced ? (shot === 0 ? 0 : 15) : Math.min(15, Math.floor(local * 16));
  return { frame: shot * 16 + index, shot, local, scale: reduced ? 1 : 1 + local * (shot === 0 ? 0.14 : 0.045) };
}
