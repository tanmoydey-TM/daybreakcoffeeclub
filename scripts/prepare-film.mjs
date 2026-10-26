// Deterministic sprite-sheet extraction. No generated/invented interpolation frames.
import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
const sourceRoot = process.argv[2];
const sources = [
  ['door', 'exec-76cada80-1681-4c11-9ff7-b5260528b793.png'],
  ['espresso', 'exec-f1ca52a2-00cb-4139-90ef-1c0b387ca236.png'],
  ['serve', 'exec-7db0c87b-2bfd-4db6-baaa-9f77eac20224.png'],
];
await mkdir('assets/film', { recursive: true });
await mkdir('public/images/film', { recursive: true });
const manifest = [];
for (const [name, filename] of sources) {
  const source = `assets/film/${name}-sheet.png`;
  if (sourceRoot) await copyFile(`${sourceRoot}/${filename}`, source);
  const { width, height } = await sharp(source).metadata();
  for (let frame = 0; frame < 16; frame++) {
    const col = frame % 4, row = Math.floor(frame / 4);
    const left = Math.round(col * width / 4) + 3;
    const top = Math.round(row * height / 4) + 3;
    const w = Math.round((col + 1) * width / 4) - left - 3;
    const h = Math.round((row + 1) * height / 4) - top - 3;
    const file = `${name}-${String(frame).padStart(2, '0')}.webp`;
    await sharp(source).extract({ left, top, width: w, height: h }).resize(412, 232, { fit: 'cover' }).webp({ quality: 92 }).toFile(`public/images/film/${file}`);
    manifest.push({ shot: name, frame, src: `/images/film/${file}`, width: 412, height: 232 });
  }
}
await writeFile('public/images/film/manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Prepared ${manifest.length} photographic frames.`);
