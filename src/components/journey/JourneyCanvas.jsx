'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { cameraAt } from '@/lib/journey';
import { HeroStation, FarmStation, RoastStation, BrewStation, MenuStation, ShopStation } from './Objects';

const fallbackImages = ['hero', 'hero', 'grind', 'pour', 'serve', 'hero', 'serve'];
function PhotoFallback({ active, onReady }) {
  useEffect(onReady, [onReady]);
  return <div className="world-fallback"><img src={`/images/journey/${fallbackImages[active]}-mobile.webp`} alt="A sunny moment at the Daybreak coffee bar" /><span>A little moment of sunshine</span></div>;
}
class WorldBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function World({ clock, reduced, mobile, onReady }) {
  const groups = useRef([]), pointer = useRef({ x: 0, y: 0 }), eased = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const { invalidate, gl } = useThree();
  useEffect(() => { onReady(); invalidate(); }, [onReady, invalidate]);
  useEffect(() => {
    const update = () => invalidate();
    const move = e => { if (e.pointerType !== 'mouse' || reduced) return; pointer.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 }; invalidate(); };
    window.addEventListener('daybreak:scroll', update); window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('visibilitychange', update);
    invalidate();
    return () => { window.removeEventListener('daybreak:scroll', update); window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', update); };
  }, [reduced, invalidate]);
  useFrame(({ camera }, delta) => {
    const p = reduced ? Math.round(clock.current.progress) : clock.current.progress;
    const shot = cameraAt(p);
    const damping = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    eased.current.x += ((reduced ? 0 : pointer.current.x) - eased.current.x) * damping;
    eased.current.y += ((reduced ? 0 : pointer.current.y) - eased.current.y) * damping;
    target.set(shot[3], shot[4] + (mobile ? 0.5 : 0.9), shot[5]);
    camera.position.set(shot[0] + eased.current.x * 0.45, shot[1] - eased.current.y * 0.25, shot[2] + (mobile ? 4.2 : 0));
    camera.lookAt(target);
    groups.current.forEach((group, i) => { if (group) group.visible = Math.abs(p - i) < 1.25; });
    gl.domElement.dataset.progress = p.toFixed(3);
    gl.domElement.dataset.camera = camera.position.toArray().map(n => n.toFixed(2)).join(',');
    if (!reduced && !document.hidden) invalidate();
  }, -1);
  const props = { clock, reduced, mobile };
  return <>
    <ambientLight intensity={1.1} /><hemisphereLight args={['#fff5df', '#b7c9b5', 1.8]} />
    <directionalLight position={[3, 8, 5]} intensity={3} color="#fff3de" />
    <Environment resolution={128} frames={1}><Lightformer position={[-4, 5, 5]} intensity={3} scale={[8, 8, 1]} target={[0, 0, 0]} /><Lightformer position={[5, 2, -4]} intensity={2} color="#ffe0b6" scale={[5, 7, 1]} target={[0, 0, 0]} /></Environment>
    {[<HeroStation key="hero" {...props} />, <FarmStation key="farm" {...props} />, <RoastStation key="roast" {...props} />, <BrewStation key="brew" {...props} />, <MenuStation key="menu" {...props} />, <ShopStation key="shop" />, <HeroStation key="finale" {...props} finale />].map((station, i) => <group key={i} position={[i * 18, -0.2, 0]} ref={el => { groups.current[i] = el; }}>{station}</group>)}
    {/* A trail of pastel markers links the sets while the camera travels. */}
    {!mobile && Array.from({ length: 30 }, (_, i) => <mesh key={i} position={[i * 3.6, -2.1 + Math.sin(i) * 0.2, -3 - i % 3]} rotation={[i, i * 0.7, i]}><icosahedronGeometry args={[0.12 + i % 3 * 0.05, 0]} /><meshStandardMaterial color={['#eac28f', '#d0dca8', '#e9bbbf'][i % 3]} /></mesh>)}
  </>;
}

export default function JourneyCanvas(props) {
  const [supported, setSupported] = useState(true), [dpr, setDpr] = useState(1.5);
  useEffect(() => {
    const canvas = document.createElement('canvas'), context = canvas.getContext('webgl2');
    if (!context) setSupported(false);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);
  const fallback = <PhotoFallback active={props.active} onReady={props.onReady} />;
  if (!supported) return fallback;
  return <WorldBoundary fallback={fallback}><Canvas dpr={props.mobile ? 1 : dpr} frameloop="demand" camera={{ position: [0.9, 2.8, 8.5], fov: 42, near: 0.1, far: 50 }} gl={{ alpha: true, antialias: !props.mobile, powerPreference: 'high-performance' }} aria-label="Scroll-controlled 3D journey from coffee farm to roasting, brewing and the final cup">
    <PerformanceMonitor onDecline={() => setDpr(1)}><Suspense fallback={null}><World {...props} /></Suspense></PerformanceMonitor>
  </Canvas></WorldBoundary>;
}
