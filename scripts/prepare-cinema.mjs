import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/video', { recursive: true });
const clips = [
  { name: 'espresso', input: 'assets/footage/extraction.mp4', start: 1, duration: 12, poster: 5, grade: 'eq=brightness=0.035:saturation=1.08:gamma=1.08' },
  { name: 'latte', input: 'assets/footage/latte-art.mp4', start: 0, duration: 12, poster: 10, grade: 'eq=brightness=0.02:saturation=1.04:gamma=1.02' },
];
function run(args) {
  const result = spawnSync(ffmpeg.path, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status) throw new Error(`FFmpeg failed: ${result.status}`);
}
for (const clip of clips) {
  // All-intra H.264 makes arbitrary forward/backward seeks cheap. No audio is shipped.
  run(['-ss', String(clip.start), '-i', clip.input, '-t', String(clip.duration), '-an', '-vf', `scale=1600:-2,${clip.grade}`, '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-g', '1', '-keyint_min', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `public/video/${clip.name}-scrub.mp4`]);
  run(['-ss', String(clip.poster), '-i', `public/video/${clip.name}-scrub.mp4`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', `public/video/${clip.name}-poster.webp`]);
}
await writeFile('public/video/manifest.json', JSON.stringify(clips.map(({ name, duration }) => ({ name, duration, src: `/video/${name}-scrub.mp4`, poster: `/video/${name}-poster.webp`, keyframeInterval: 1 })), null, 2));
console.log('Prepared two scroll-seekable movies and their still fallbacks.');
