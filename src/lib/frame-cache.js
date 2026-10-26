/** Keep decoded pixel memory bounded independently of the total film length. */
export function frameNeighborhood(target, count, radius = 2) {
  const frames = [target];
  for (let distance = 1; distance <= radius; distance++) {
    if (target + distance < count) frames.push(target + distance);
    if (target - distance >= 0) frames.push(target - distance);
  }
  return frames;
}

export function trimFrames(cache, target, displayed, max = 8) {
  const candidates = [...cache.keys()].filter(index => index !== target && index !== displayed)
    .sort((a, b) => Math.abs(b - target) - Math.abs(a - target));
  for (const index of candidates) {
    if (cache.size <= max) break;
    cache.delete(index);
  }
}
