import { clamp, phase } from './brew.ts';

export const photoAssets = ['hero', 'grind', 'tamp', 'espresso', 'steam', 'pour', 'serve'] as const;
// Each chapter has its own framing, even when it continues the same photograph.
// Focus is in image UV coordinates. The WebGL renderer adds depth-map parallax.
export const photoChapters = [
  { image: 0, zoom: 1.02, focus: [0.5, 0.5], depth: 1 },
  { image: 0, zoom: 1.26, focus: [0.64, 0.59], depth: 1 },
  { image: 1, zoom: 1.07, focus: [0.54, 0.48], depth: 0 },
  { image: 2, zoom: 1.09, focus: [0.57, 0.47], depth: 0 },
  { image: 0, zoom: 1.2, focus: [0.56, 0.45], depth: 1 },
  { image: 0, zoom: 1.12, focus: [0.58, 0.39], depth: 1 },
  { image: 3, zoom: 1.04, focus: [0.52, 0.47], depth: 0 },
  { image: 3, zoom: 1.2, focus: [0.58, 0.4], depth: 0 },
  { image: 4, zoom: 1.04, focus: [0.53, 0.48], depth: 0 },
  { image: 5, zoom: 1.04, focus: [0.53, 0.45], depth: 0 },
  { image: 6, zoom: 1.15, focus: [0.56, 0.44], depth: 2 },
  { image: 6, zoom: 1.02, focus: [0.51, 0.49], depth: 2 },
] as const;

export function getPhotoFrame(progress: number) {
  const p = clamp(progress, 0, 11);
  const index = Math.min(10, Math.floor(p));
  const local = p - index;
  return { index, local, current: photoChapters[index], next: photoChapters[index + 1], blend: phase(local, 0.46, 0.94) };
}

export function getStoryProgress(scroll: number, offsets: number[]) {
  if (!offsets.length || scroll <= offsets[0]) return 0;
  for (let i = 0; i < offsets.length - 1; i++) {
    if (scroll < offsets[i + 1]) return i + clamp((scroll - offsets[i]) / Math.max(1, offsets[i + 1] - offsets[i]));
  }
  return offsets.length - 1;
}
