// Web encoding only. Detail restoration is performed with the image-generation tool.
import sharp from 'sharp';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';

const sourceMapPath = process.argv[2];
await mkdir('assets/film-hd', { recursive: true });
await mkdir('public/images/film-hd', { recursive: true });
if (sourceMapPath) {
  const sources = JSON.parse(await readFile(sourceMapPath, 'utf8'));
  for (const { name, source } of sources) await copyFile(source, `assets/film-hd/${name}.png`);
}
const manifest = [];
for (const shot of ['door', 'espresso', 'serve']) {
  for (let frame = 0; frame < 16; frame++) {
    const name = `${shot}-${String(frame).padStart(2, '0')}`;
    const source = `assets/film-hd/${name}.png`;
    const metadata = await sharp(source).metadata();
    if (metadata.width < 1500 || metadata.height < 840) throw new Error(`Insufficient source resolution: ${name}`);
    // Preserve native pixels: never claim an interpolated upscale as new resolution.
    const target = `public/images/film-hd/${name}.webp`;
    const info = await sharp(source).webp({ quality: 90, effort: 6 }).toFile(target);
    manifest.push({ shot, frame, src: `/images/film-hd/${name}.webp`, width: info.width, height: info.height, bytes: (await stat(target)).size });
  }
}
await writeFile('public/images/film-hd/manifest.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ count: manifest.length, minWidth: Math.min(...manifest.map(f => f.width)), minHeight: Math.min(...manifest.map(f => f.height)), totalMB: (manifest.reduce((n, f) => n + f.bytes, 0) / 1e6).toFixed(2) }));
