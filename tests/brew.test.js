import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapters, getBrewState } from '../src/lib/brew.js';
import { getStoryProgress, getPhotoFrame, photoAssets, photoChapters } from '../src/lib/photo-story.js';
import { getCameraShot } from '../src/lib/camera-path.js';
test('3D camera moves continuously through chapter boundaries in either direction', () => {
    const epsilon = 0.0001;
    for (let i = 1; i < 11; i++) {
        const before = getCameraShot(i - epsilon), at = getCameraShot(i), after = getCameraShot(i + epsilon);
        for (let axis = 0; axis < 6; axis++) {
            assert.ok(Math.abs(after[axis] - before[axis]) < 0.01, 'camera must not cut');
            const leftVelocity = (at[axis] - before[axis]) / epsilon;
            const rightVelocity = (after[axis] - at[axis]) / epsilon;
            assert.ok(Math.abs(leftVelocity - rightVelocity) < 0.01, 'camera must not stop or change speed abruptly');
        }
    }
    for (let p = 0; p <= 11; p += 0.02) {
        const shot = getCameraShot(p);
        assert.ok(shot.every(Number.isFinite));
        assert.ok(Math.hypot(shot[0] - shot[3], shot[1] - shot[4], shot[2] - shot[5]) > 2.5);
    }
    assert.deepEqual(getCameraShot(-1), getCameraShot(0));
    assert.deepEqual(getCameraShot(12), getCameraShot(11));
});
test('each content chapter maps to its exact scene despite differing section heights', () => {
    const offsets = [0, 740, 1540, 2300, 3100, 4020, 4900, 5640, 6500, 7240, 8000, 8950];
    offsets.forEach((offset, i) => assert.equal(getStoryProgress(offset, offsets), i));
    assert.equal(getStoryProgress(1140, offsets), 1.5);
    assert.equal(getStoryProgress(-10, offsets), 0);
    assert.equal(getStoryProgress(10000, offsets), 11);
});
test('photo frames stay bounded and reverse scrolling is deterministic', () => {
    assert.equal(photoChapters.length, 12);
    for (let p = 0; p <= 11; p += 0.05) {
        const frame = getPhotoFrame(p);
        assert.ok(frame.current.image < photoAssets.length);
        assert.ok(frame.next.image < photoAssets.length);
        assert.ok(frame.blend >= 0 && frame.blend <= 1);
        assert.deepEqual(getPhotoFrame(p), frame);
    }
    assert.equal(getPhotoFrame(11).next.image, photoAssets.indexOf('serve'));
});
test('the story has twelve unique navigable chapters', () => {
    assert.equal(chapters.length, 12);
    assert.equal(new Set(chapters.map(c => c.id)).size, 12);
});
test('coffee cannot extract before the basket and cup are in place', () => {
    for (let p = 0; p <= 11; p += 0.025) {
        const state = getBrewState(p);
        if (state.extraction > 0) {
            assert.equal(state.insert, 1);
            assert.equal(state.cup, 1);
            assert.equal(state.milkStream, 0);
        }
    }
});
test('milk follows espresso and the final serving has finished latte art', () => {
    for (let p = 0; p <= 11; p += 0.025) {
        const state = getBrewState(p);
        if (state.milkStream > 0)
            assert.equal(state.coffee, 1);
    }
    const end = getBrewState(11);
    assert.equal(end.art, 1);
    assert.equal(end.pour, 1);
    assert.equal(end.serve, 1);
    assert.equal(end.extraction, 0);
    assert.equal(end.milkStream, 0);
});
test('reverse and random-access scrolling reproduce the same scene state', () => {
    const samples = Array.from({ length: 111 }, (_, i) => getBrewState(i / 10));
    for (let i = 110; i >= 0; i--)
        assert.deepEqual(getBrewState(i / 10), samples[i]);
    assert.deepEqual(getBrewState(-100), getBrewState(0));
    assert.deepEqual(getBrewState(100), getBrewState(11));
});
