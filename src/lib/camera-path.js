// Position and look target in one persistent coffee-bar coordinate system.
// Cubic interpolation preserves velocity across chapter boundaries.
const shots = [
  [5.5, 3.5, 7.7, 0, 0.12, 0.4],
  [-3.5, 3.4, 5.1, -1, 0.65, 0],
  [-2.8, 0.9, 3.8, -1.1, -0.05, 0.4],
  [-1.8, 2.5, 3.6, -1.3, -0.3, 0.6],
  [2.8, 1.8, 4.6, 0.1, 0.1, 0.4],
  [3.8, 1.5, 4.9, 0.55, -0.15, 0.6],
  [1.7, 0.55, 3.4, 0.45, -0.3, 0.7],
  [2.5, 2.4, 4.2, 0.45, -0.35, 0.8],
  [4.8, 1.6, 3.8, 1.4, -0.2, 0.85],
  [2.8, 2.3, 3.6, 0.7, -0.1, 0.9],
  [1.8, 2.8, 4.8, 0.05, -0.6, 1.65],
  [3.9, 3.6, 6.4, 0, -0.2, 1],
];

export function getCameraShot(progress) {
  const p = Math.max(0, Math.min(11, progress));
  const i = Math.min(10, Math.floor(p));
  const t = p - i;
  return shots[i].map((start, axis) => {
    const before = shots[Math.max(0, i - 1)][axis];
    const end = shots[i + 1][axis];
    const after = shots[Math.min(11, i + 2)][axis];
    return 0.5 * (2 * start + (-before + end) * t +
      (2 * before - 5 * start + 4 * end - after) * t * t +
      (-before + 3 * start - 3 * end + after) * t * t * t);
  });
}
