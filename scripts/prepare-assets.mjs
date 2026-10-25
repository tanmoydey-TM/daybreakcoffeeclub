import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
await mkdir('public/images/journey', { recursive: true });
const shots = ['hero', 'grind', 'tamp', 'espresso', 'steam', 'pour', 'serve'];
for (const name of shots) {
  for (const [suffix, width, quality] of [['', 1536, 85], ['-mobile', 768, 80]]) {
    const dest = `public/images/journey/${name}${suffix}.webp`;
    await sharp(`assets/source/${name}.png`).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
    console.log(`${dest}: ${Math.round((await stat(dest)).size / 1024)} KB`);
  }
}
for (const name of ['hero-depth', 'serve-depth']) {
  await sharp(`assets/source/${name}.png`).resize(768).webp({ quality: 90 }).toFile(`public/images/journey/${name}.webp`);
}
