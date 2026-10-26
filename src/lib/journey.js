export const scenes = [
  { id: 'hello', label: 'Hello, sunshine', color: '#fff1cc', glow: '#ffcf8c', index: '01' },
  { id: 'enter', label: 'Step inside', color: '#ddf0d6', glow: '#fff1a3', index: '02' },
  { id: 'espresso', label: 'The golden pour', color: '#ffe0ce', glow: '#ffbdac', index: '03' },
  { id: 'serve', label: 'Made for you', color: '#dceef5', glow: '#dddcfc', index: '04' },
  { id: 'menu', label: 'Find your favorite', color: '#eee4fa', glow: '#ffd9cd', index: '05' },
  { id: 'shop', label: 'Your happy place', color: '#e2edcf', glow: '#ffe5ab', index: '06' },
  { id: 'finale', label: 'A brighter day', color: '#ffebc8', glow: '#ffcbb7', index: '07' },
];

export const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const smooth = (n, start, end) => { const t = clamp((n - start) / (end - start)); return t * t * (3 - 2 * t); };
export function storyProgress(scroll, offsets) {
  if (!offsets.length || scroll <= offsets[0]) return 0;
  for (let i = 0; i < offsets.length - 1; i++) {
    if (scroll < offsets[i + 1]) return i + clamp((scroll - offsets[i]) / (offsets[i + 1] - offsets[i]));
  }
  return offsets.length - 1;
}

// Every station occupies the same world. The camera travels between them.
const cameraStops = [
  [0.9, 2.8, 8.5, 0, 0.5, 0],
  [18.5, 4.5, 10, 18, 0.2, 0],
  [36.9, 3, 8, 36, 0.4, 0],
  [55.5, 3.2, 7.5, 54, 0.5, 0],
  [72.5, 3.6, 9, 72, 0.3, 0],
  [91.4, 3.7, 10, 90, 0.6, 0],
  [108.7, 3.2, 8.3, 108, 0.4, 0],
];
export function cameraAt(progress) {
  const p = clamp(progress, 0, 6), i = Math.min(5, Math.floor(p)), t = p - i;
  // Hold the opening composition, then travel smoothly to the following set.
  const travel = smooth(t, 0.28, 1);
  return cameraStops[i].map((start, axis) => start + (cameraStops[i + 1][axis] - start) * travel);
}
export function brewAt(progress) {
  return { roast: smooth(progress, 1.7, 2.6), pour: smooth(progress, 2.82, 3.3), fill: smooth(progress, 2.9, 3.45), stream: smooth(progress, 2.82, 2.96) * (1 - smooth(progress, 3.38, 3.52)) };
}

export const menu = [
  { id: 'latte', name: 'Sunshine latte', category: 'Coffee', price: 4.5, note: 'Espresso · silky milk · a little joy', tag: 'THE DAILY FAVORITE', color: '#ffe2c7', image: '/images/journey/pour.webp' },
  { id: 'iced', name: 'Cloud nine cold brew', category: 'Cold', price: 4.8, note: 'Slow-steeped · bright · beautifully chilled', tag: 'KEEP IT COOL', color: '#deecf4', image: '/images/journey/espresso.webp' },
  { id: 'cappuccino', name: 'Hello, cappuccino', category: 'Coffee', price: 4.2, note: 'A bold little shot under a cloud of foam', tag: 'SMALL & HAPPY', color: '#e6e6ce', image: '/images/journey/serve.webp' },
  { id: 'croissant', name: 'Golden hour croissant', category: 'Bakery', price: 3.2, note: 'Buttery layers · baked golden · gone quickly', tag: 'BETTER TOGETHER', color: '#f8dce1', image: '/images/journey/serve.webp' },
];

// Replace nulls with verified business information before launch.
export const shop = { address: null, hours: null, email: null, mapUrl: null };
