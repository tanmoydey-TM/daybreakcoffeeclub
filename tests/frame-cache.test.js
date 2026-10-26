import test from 'node:test';
import assert from 'node:assert/strict';
import { frameNeighborhood, trimFrames } from '../src/lib/frame-cache.js';

test('neighbor preloading is bounded at both ends and prioritizes current frame', () => {
  assert.deepEqual(frameNeighborhood(0, 48), [0, 1, 2]);
  assert.deepEqual(frameNeighborhood(47, 48), [47, 46, 45]);
  assert.deepEqual(frameNeighborhood(23, 48), [23, 24, 22, 25, 21]);
});

test('random seeking never retains the whole decoded film or evicts the displayed frame', () => {
  const cache = new Map();
  let displayed = 0;
  for (const target of [0, 10, 47, 2, 30, 1, 45, 15, 0]) {
    cache.set(displayed, {});
    for (const frame of frameNeighborhood(target, 48)) cache.set(frame, {});
    trimFrames(cache, target, displayed);
    assert.ok(cache.size <= 8);
    assert.ok(cache.has(target));
    assert.ok(cache.has(displayed));
    displayed = target;
  }
});
