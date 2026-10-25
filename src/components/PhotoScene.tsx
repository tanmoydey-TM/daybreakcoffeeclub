'use client';

import { Component, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getPhotoFrame, photoAssets } from '@/lib/photo-story';
import type { SceneClock } from './CoffeeScene';

type Props = { clock: MutableRefObject<SceneClock>; reduced: boolean; onReady: () => void };

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragmentShader = `
precision highp float;
uniform sampler2D uPhotoA;
uniform sampler2D uPhotoB;
uniform sampler2D uDepthA;
uniform sampler2D uDepthB;
uniform float uDepthAmountA;
uniform float uDepthAmountB;
uniform float uBlend;
uniform float uAspect;
uniform float uZoomA;
uniform float uZoomB;
uniform vec2 uFocusA;
uniform vec2 uFocusB;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uMotion;
varying vec2 vUv;

vec2 imageUV(vec2 uv, float zoom, vec2 focus) {
  float imageAspect = 1.5;
  vec2 fit = vec2(min(1.0, uAspect / imageAspect), min(1.0, imageAspect / uAspect));
  // Keep the photographic subject in frame on narrow phones.
  if (uAspect < 1.0) focus.x = mix(focus.x, 0.69, 0.8);
  return (uv - 0.5) * fit / zoom + focus;
}
vec4 photograph(sampler2D photo, sampler2D depthMap, float hasDepth, vec2 uv) {
  float depth = texture2D(depthMap, clamp(uv, 0.001, 0.999)).r;
  vec2 movement = uPointer * 0.014 + vec2(sin(uScroll * 0.75) * 0.009, cos(uScroll * 0.8) * 0.006);
  // Depth-based reprojection moves near surfaces farther than the background.
  // Deliberately restrained to keep photographed object edges intact.
  uv += movement * (depth - 0.45) * hasDepth * uMotion;
  return texture2D(photo, clamp(uv, 0.002, 0.998));
}
void main() {
  vec2 uvA = imageUV(vUv, uZoomA, uFocusA);
  vec2 uvB = imageUV(vUv, uZoomB, uFocusB);
  vec4 a = photograph(uPhotoA, uDepthA, uDepthAmountA, uvA);
  vec4 b = photograph(uPhotoB, uDepthB, uDepthAmountB, uvB);
  // A soft spatial dissolve keeps both directions of scrolling continuous.
  float spread = 0.11;
  float transition = smoothstep(vUv.x * spread, 1.0 - spread + vUv.x * spread, uBlend);
  gl_FragColor = vec4(mix(a.rgb, b.rgb, transition), 1.0);
  #include <colorspace_fragment>
}`;

function PhotoWorld({ clock, reduced, onReady }: Props) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2());
  const { invalidate } = useThree();
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [depths, setDepths] = useState<THREE.Texture[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const owned: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const mobile = window.innerWidth < 768;
    const load = async (path: string, color: boolean) => {
      const t = await loader.loadAsync(path);
      if (cancelled) { t.dispose(); return t; }
      t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      owned.push(t);
      return t;
    };
    // Start with the first shot; the remaining shots share that texture until ready.
    load(`/images/journey/hero${mobile ? '-mobile' : ''}.webp`, true).then(async first => {
      if (cancelled) return;
      setTextures(photoAssets.map(() => first));
      const empty = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
      empty.needsUpdate = true; owned.push(empty);
      setDepths([empty, empty, empty]);
      onReady(); invalidate();
      const files = await Promise.all(photoAssets.map((name, i) => i === 0 ? Promise.resolve(first) : load(`/images/journey/${name}${mobile ? '-mobile' : ''}.webp`, true)));
      const maps = await Promise.all(['hero', 'serve'].map(name => load(`/images/journey/${name}-depth.webp`, false)));
      if (!cancelled) { setTextures(files); setDepths([empty, ...maps]); invalidate(); }
    }).catch(() => { if (!cancelled) { setFailed(true); onReady(); } });
    return () => { cancelled = true; owned.forEach(t => t.dispose()); };
  }, [invalidate, onReady]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.set((event.clientX / innerWidth - 0.5) * 2, -(event.clientY / innerHeight - 0.5) * 2);
      invalidate();
    };
    const update = () => invalidate();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('daybreak:progress', update);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('daybreak:progress', update); };
  }, [invalidate]);

  const uniforms = useMemo(() => ({
    uPhotoA: { value: null }, uPhotoB: { value: null }, uDepthA: { value: null }, uDepthB: { value: null },
    uDepthAmountA: { value: 0 }, uDepthAmountB: { value: 0 }, uBlend: { value: 0 }, uAspect: { value: 1.5 },
    uZoomA: { value: 1.03 }, uZoomB: { value: 1.03 }, uFocusA: { value: new THREE.Vector2(0.5, 0.5) },
    uFocusB: { value: new THREE.Vector2(0.5, 0.5) }, uPointer: { value: new THREE.Vector2() }, uScroll: { value: 0 }, uMotion: { value: 1 },
  }), []);

  useFrame(({ size }) => {
    if (!material.current || !textures.length || !depths.length) return;
    const { current, next, local, blend } = getPhotoFrame(clock.current.progress);
    const u = material.current.uniforms;
    u.uPhotoA.value = textures[current.image]; u.uPhotoB.value = textures[next.image];
    u.uDepthA.value = depths[current.depth]; u.uDepthB.value = depths[next.depth];
    u.uDepthAmountA.value = current.depth ? 1 : 0; u.uDepthAmountB.value = next.depth ? 1 : 0;
    u.uBlend.value = reduced ? (blend > 0.5 ? 1 : 0) : blend;
    u.uAspect.value = size.width / size.height;
    u.uZoomA.value = current.zoom + (reduced ? 0 : local * 0.055);
    u.uZoomB.value = next.zoom + (reduced ? 0 : (local - 1) * 0.035);
    u.uFocusA.value.set(...current.focus); u.uFocusB.value.set(...next.focus);
    if (current.image === next.image) {
      const t = reduced ? 0 : local * local * (3 - 2 * local);
      u.uZoomA.value = THREE.MathUtils.lerp(current.zoom, next.zoom, t);
      u.uFocusA.value.lerp(u.uFocusB.value, t);
      u.uBlend.value = 0;
    }
    u.uPointer.value.lerp(pointer.current, 0.04);
    if (!reduced && u.uPointer.value.distanceTo(pointer.current) > 0.002) invalidate();
    u.uScroll.value = clock.current.progress;
    u.uMotion.value = reduced ? 0 : 1;
  });
  if (failed) return null;
  return textures.length && depths.length ? <mesh frustumCulled={false}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthTest={false} depthWrite={false} toneMapped={false} />
  </mesh> : null;
}

class PhotoBoundary extends Component<{ children: ReactNode; onReady: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onReady(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function PhotoScene(props: Props) {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) { setSupported(false); props.onReady(); }
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }, [props.onReady]);
  return <div className="photographic-scene">
    {supported && <PhotoBoundary onReady={props.onReady}><Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }} aria-label="Photographic coffee journey animated with scroll-controlled zoom, transitions, and depth-map parallax"><PhotoWorld {...props} /></Canvas></PhotoBoundary>}
  </div>;
}
