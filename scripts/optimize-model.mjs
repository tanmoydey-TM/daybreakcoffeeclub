import { mkdir, copyFile, stat } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

await mkdir('assets/models', { recursive: true });
await mkdir('public/models', { recursive: true });
const original = 'assets/models/coffee-cup-original.glb';
try { await stat(original); } catch {
  await copyFile('C:/Users/TM DEVs 001/Downloads/coffee-cup-3d.glb', original);
}
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const document = await io.read(original);
await document.transform(
  dedup(), weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.22, error: 0.001, lockBorder: true }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }),
  prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await io.write('public/models/daybreak-cup.glb', document);
console.log(JSON.stringify({ originalBytes: (await stat(original)).size, webBytes: (await stat('public/models/daybreak-cup.glb')).size }));
