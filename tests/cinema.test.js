import test from 'node:test';
import assert from 'node:assert/strict';
import { stat, readFile } from 'node:fs/promises';
import { cinemaAt, captionAt, filmCaptions } from '../src/lib/cinema.js';

test('camera and native movie seeks remain bounded and reversible', () => {
  const points = Array.from({ length: 601 }, (_, i) => i / 100);
  const forward = points.map(p => cinemaAt(p));
  assert.deepEqual([...points].reverse().map(p => cinemaAt(p)), [...forward].reverse());
  for (const s of forward) {
    for (const key of ['brewTime', 'latteTime', 'brewReveal', 'latteReveal', 'finish']) assert.ok(s[key] >= 0 && s[key] <= 1);
    assert.ok(s.door >= 0 && s.door <= 88);
  }
  assert.equal(cinemaAt(NaN).p, 0);
  assert.equal(cinemaAt(-1).p, 0);
  assert.equal(cinemaAt(7).p, 6);
});

test('doors open before camera passes them and motion-off disables the camera', () => {
  assert.equal(cinemaAt(.82).door, 88);
  assert.ok(cinemaAt(.82).facade);
  assert.equal(cinemaAt(1.21).facade, false);
  for (const p of [0, .5, 1, 2, 3, 4]) {
    const s = cinemaAt(p, true);
    assert.equal(s.door, 0);
    assert.equal(s.dolly, 1);
    assert.equal(s.videoScale, 1);
  }
});

test('captions do not overlap and both prepared films exist', async () => {
  for (let p = 0; p <= 4; p += .01) assert.ok(filmCaptions.filter(c => captionAt(p, c.start, c.end) > 0).length <= 1);
  const manifest = JSON.parse(await readFile('public/video/manifest.json', 'utf8'));
  for (const clip of manifest) {
    assert.equal(clip.keyframeInterval, 1);
    assert.ok((await stat(`public${clip.src}`)).size > 1000000);
    assert.ok((await stat(`public${clip.poster}`)).size > 10000);
  }
});
