import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { FRAME_COUNT, filmAt, frameUrl } from '../src/lib/film.js';

test('film covers three actions in order and stays bounded', () => {
  assert.equal(filmAt(-2).frame, 0);
  assert.equal(filmAt(1.4).frame, 16);
  assert.equal(filmAt(2.7).frame, 32);
  assert.equal(filmAt(4).frame, 47);
  assert.equal(filmAt(6).frame, 47);
  assert.equal(filmAt(NaN).frame, 0);
  let previous = -1;
  for (let p = 0; p <= 6; p += .001) {
    const { frame } = filmAt(p);
    assert.ok(frame >= previous && frame < FRAME_COUNT);
    previous = frame;
  }
});

test('scrubbing reverses exactly and reduced motion uses stationary posters', () => {
  const points = [0, .6, 1.3, 1.5, 2.1, 2.8, 3.9];
  assert.deepEqual([...points].reverse().map(p => filmAt(p).frame), points.map(p => filmAt(p).frame).reverse());
  assert.equal(filmAt(.2, true).frame, 0);
  assert.equal(filmAt(2, true).frame, 31);
  assert.equal(filmAt(3, true).frame, 47);
  assert.equal(filmAt(3, true).scale, 1);
});

test('all advertised frames exist and agree with the manifest', async () => {
  const manifest = JSON.parse(await readFile('public/images/film-hd/manifest.json', 'utf8'));
  assert.equal(manifest.length, FRAME_COUNT);
  const paths = Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(i));
  assert.equal(new Set(paths).size, FRAME_COUNT);
  for (let i = 0; i < FRAME_COUNT; i++) {
    assert.equal(manifest[i].src, paths[i]);
    assert.ok((await stat(`public${paths[i]}`)).size > 1000);
    const metadata = await sharp(`public${paths[i]}`).metadata();
    assert.ok(metadata.width >= 1500 && metadata.height >= 840, `${paths[i]} must be a full-resolution frame`);
    assert.equal(manifest[i].width, metadata.width);
    assert.equal(manifest[i].height, metadata.height);
  }
});
