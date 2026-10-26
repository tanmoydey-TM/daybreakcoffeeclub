'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { brewAt, smooth } from '@/lib/journey';

export function SoftBox({ size, color = '#fff1ce', position, rotation, radius = 0.1, ...props }) {
  return <RoundedBox args={size} radius={radius} smoothness={2} position={position} rotation={rotation} {...props}><meshStandardMaterial color={color} roughness={0.38} /></RoundedBox>;
}
export function Disc({ radius = 3, color = '#e8d6f4', position = [0, -1.35, 0] }) {
  return <mesh position={position} receiveShadow><cylinderGeometry args={[radius, radius * 0.95, 0.2, 64]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>;
}
export function Shadow({ scale = [2.3, 1, 1.4], position = [0, -1.2, 0], opacity = 0.12 }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}><circleGeometry args={[1, 48]} /><meshBasicMaterial color="#927459" transparent opacity={opacity} depthWrite={false} /></mesh>;
}

export function SuppliedCup({ scale = 2.4, ...props }) {
  const { scene } = useGLTF('/models/daybreak-cup.glb');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone), center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    clone.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true; object.receiveShadow = true;
      object.material = object.material.clone();
      object.material.roughness = 0.42;
    });
    return clone;
  }, [scene]);
  return <group {...props} scale={scale}><primitive object={model} /></group>;
}

export function SimpleCup({ color = '#fa987a', foam = true, ...props }) {
  const profile = useMemo(() => [[0, 0], [0.28, 0], [0.34, 0.08], [0.43, 0.63], [0.42, 0.69], [0.38, 0.69], [0.37, 0.59], [0.3, 0.1], [0, 0.09]].map(p => new THREE.Vector2(...p)), []);
  return <group {...props}>
    <mesh castShadow><latheGeometry args={[profile, 40]} /><meshPhysicalMaterial color={color} roughness={0.22} clearcoat={0.5} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.45, 0.36, 0]} scale={[0.8, 1, 1]} castShadow><torusGeometry args={[0.22, 0.065, 10, 28]} /><meshStandardMaterial color={color} roughness={0.25} /></mesh>
    <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.72, 0.58, 0.08, 48]} /><meshStandardMaterial color="#fff4d9" roughness={0.28} /></mesh>
    {foam && <><mesh position={[0, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.385, 48]} /><meshStandardMaterial color="#c9925a" roughness={0.55} /></mesh>{[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[0, 0.645 + i * 0.001, -0.14 + i * 0.07]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 - i * 0.12, 0.4, 1]}><ringGeometry args={[0.16, 0.19, 32, 1, 0.1, Math.PI * 1.9]} /><meshBasicMaterial color="#fff3d5" side={THREE.DoubleSide} /></mesh>)}</>}
  </group>;
}

// Instancing keeps dozens of beans to two draw calls, including their creases.
export function Beans({ clock, index = 0, count = 20, mode = 'orbit', reduced }) {
  const body = useRef(null), seam = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const tint = useMemo(() => [new THREE.Color('#9aab61'), new THREE.Color('#c99b52'), new THREE.Color('#825133')], []);
  useFrame(({ clock: timer }) => {
    if (!body.current || Math.abs(clock.current.progress - index) > 1.2) return;
    const p = clock.current.progress, time = reduced ? 0 : timer.elapsedTime * 0.12;
    const roast = brewAt(p).roast;
    if (mode === 'roast') color.copy(roast < 0.5 ? tint[0] : tint[1]).lerp(roast < 0.5 ? tint[1] : tint[2], roast < 0.5 ? roast * 2 : (roast - 0.5) * 2);
    else color.copy(tint[2]);
    body.current.material.color.copy(color);
    for (let i = 0; i < count; i++) {
      const a = i * 2.399 + p * 1.3 + time;
      const radius = mode === 'roast' ? 1.1 + (i % 4) * 0.3 : 2.6 + (i % 3) * 0.42;
      const scale = mode === 'roast' ? 0.22 + i % 3 * 0.045 : 0.16 + i % 3 * 0.035;
      dummy.position.set(Math.cos(a) * radius, mode === 'roast' ? 0.3 + Math.sin(a * 1.3) * 0.9 : 0.4 + Math.sin(a) * 1.4, Math.sin(a) * radius * 0.55);
      dummy.rotation.set(a + i, a * 0.4, i + time);
      dummy.scale.set(scale * 0.72, scale, scale * 0.52); dummy.updateMatrix(); body.current.setMatrixAt(i, dummy.matrix);
      dummy.translateZ(scale * 0.49); dummy.scale.set(scale * 0.06, scale * 0.78, scale * 0.06); dummy.updateMatrix(); seam.current.setMatrixAt(i, dummy.matrix);
    }
    body.current.instanceMatrix.needsUpdate = true; seam.current.instanceMatrix.needsUpdate = true;
  });
  return <group><instancedMesh ref={body} args={[null, null, count]} frustumCulled={false}><sphereGeometry args={[1, 12, 10]} /><meshPhysicalMaterial color="#825133" roughness={0.4} clearcoat={0.3} /></instancedMesh><instancedMesh ref={seam} args={[null, null, count]} frustumCulled={false}><sphereGeometry args={[1, 6, 6]} /><meshStandardMaterial color="#5c3c2c" roughness={0.7} /></instancedMesh></group>;
}

export function Steam({ position = [0, 1, 0], reduced, active = true }) {
  const group = useRef(null);
  useFrame(({ clock }) => {
    if (!group.current || !active) return;
    group.current.children.forEach((mesh, i) => {
      const t = reduced ? i / 6 : (clock.elapsedTime * 0.23 + i / 6) % 1;
      mesh.position.set(Math.sin(t * 5 + i) * 0.15, t * 1.4, Math.cos(i) * 0.12);
      mesh.scale.set(0.08 + t * 0.15, 0.18 + t * 0.22, 0.08 + t * 0.1);
      mesh.material.opacity = Math.sin(t * Math.PI) * 0.16;
    });
  });
  return <group ref={group} position={position}>{Array.from({ length: 6 }, (_, i) => <mesh key={i}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#fffdf1" transparent opacity={0.1} depthWrite={false} /></mesh>)}</group>;
}

export function HeroStation({ clock, mobile, reduced, finale = false }) {
  const cup = useRef(null), index = finale ? 6 : 0;
  useFrame(({ clock: timer }) => {
    if (!cup.current || Math.abs(clock.current.progress - index) > 1.2) return;
    const local = clock.current.progress - index;
    cup.current.rotation.set(0.08 + local * 0.15, -0.35 + local * 1.6, -0.09 + Math.sin(reduced ? 0 : timer.elapsedTime * 0.55) * 0.025);
    cup.current.position.y = -0.25 + (reduced ? 0 : Math.sin(timer.elapsedTime * 0.65) * 0.1);
  });
  return <><Shadow position={[0, -1.4, 0]} scale={[2.4, 1, 1.5]} /><group ref={cup}>{mobile ? <SimpleCup scale={2.4} position={[0, -0.6, 0]} /> : <SuppliedCup scale={2.6} />}</group><Beans clock={clock} index={index} count={mobile ? 12 : 22} reduced={reduced} /><Steam position={[0, 0.7, 0]} reduced={reduced} /></>;
}

function Plant({ position, scale = 1 }) {
  return <group position={position} scale={scale}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.035, 0.055, 0.9, 8]} /><meshStandardMaterial color="#8e8051" /></mesh>{[-1, 1].flatMap(side => [0, 1, 2].map(i => <mesh key={`${side}-${i}`} position={[side * (0.2 + i * 0.03), 0.4 + i * 0.23, 0]} rotation={[0.1, side * 0.4, side * -0.8]} scale={[0.12, 0.33, 0.045]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? '#75a778' : '#458c6a'} roughness={0.6} /></mesh>))}{[-1, 1].map(side => <mesh key={side} position={[side * 0.09, 0.63, 0.08]} scale={[0.1, 0.13, 0.1]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color="#ed8068" roughness={0.3} /></mesh>)}</group>;
}

export function FarmStation({ clock, mobile }) {
  const sun = useRef(null);
  useFrame(() => { if (sun.current) sun.current.position.y = 1.6 + smooth(clock.current.progress, 0.5, 1.2) * 1.4; });
  return <>
    <group ref={sun} position={[-3.2, 3, -3]}><mesh><sphereGeometry args={[0.85, 32, 24]} /><meshBasicMaterial color="#ffd472" /></mesh><mesh><sphereGeometry args={[1.05, 24, 16]} /><meshBasicMaterial color="#ffe9a9" transparent opacity={0.3} depthWrite={false} /></mesh></group>
    {[[-3, -1.8, -2, 3.4, '#b9dba6'], [2, -2, -3, 4, '#a0cfb5'], [0, -2.3, 0.5, 4, '#c2dda0'], [-4.2, -2.1, 1.2, 2.5, '#d3e7af']].map(([x, y, z, size, color], i) => <mesh key={i} position={[x, y, z]} scale={[size, 1.8, size * 0.7]}><sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>)}
    {Array.from({ length: mobile ? 8 : 16 }, (_, i) => <Plant key={i} position={[-3.3 + i % 5 * 1.5, -0.9 + Math.sin(i) * 0.15, -1.5 + Math.floor(i / 5) * 1.2]} scale={0.7 + i % 3 * 0.15} />)}
    <group position={[3.4, -0.3, -0.9]}><SoftBox size={[1.35, 1.3, 1.1]} color="#fff1c7" /><mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.1, 0.7, 4]} /><meshStandardMaterial color="#ed9478" /></mesh><SoftBox size={[0.35, 0.75, 0.04]} position={[0, -0.24, 0.57]} color="#93bdb9" radius={0.03} /></group>
  </>;
}

export function RoastStation({ clock, mobile, reduced }) {
  const ring = useRef(null);
  useFrame(() => { if (ring.current) ring.current.rotation.z = clock.current.progress * 1.8; });
  return <><Disc radius={3.2} color="#f5c6b1" /><Shadow /><group ref={ring} position={[0, 0.2, -0.7]} rotation={[0.3, 0, 0]}><mesh><torusGeometry args={[2.1, 0.085, 12, 72]} /><meshStandardMaterial color="#d49657" roughness={0.28} metalness={0.3} /></mesh>{Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 6) * 2.1, Math.sin(i * Math.PI / 6) * 2.1, 0]} rotation={[0, 0, i * Math.PI / 6]}><boxGeometry args={[0.23, 0.11, 0.12]} /><meshStandardMaterial color="#fff0c5" /></mesh>)}</group><SoftBox size={[2.8, 0.45, 1.5]} position={[0, -1, -0.3]} color="#edb48f" /><Beans clock={clock} index={2} mode="roast" count={mobile ? 18 : 36} reduced={reduced} /></>;
}

export function BrewStation({ clock, reduced }) {
  const kettle = useRef(null), water = useRef(null), coffee = useRef(null), fill = useRef(null);
  const start = useMemo(() => new THREE.Vector3(), []), end = useMemo(() => new THREE.Vector3(0, 1.25, 0.3), []), direction = useMemo(() => new THREE.Vector3(), []), up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame(() => {
    const state = brewAt(clock.current.progress);
    if (!kettle.current || !water.current) return;
    kettle.current.rotation.z = -0.12 - state.pour * 0.35;
    start.set(1.05, 0.1, 0).applyQuaternion(kettle.current.quaternion).add(kettle.current.position);
    direction.subVectors(end, start);
    water.current.position.copy(start).addScaledVector(direction, 0.5);
    water.current.scale.set(state.stream, direction.length(), state.stream);
    water.current.quaternion.setFromUnitVectors(up, direction.normalize());
    water.current.visible = state.stream > 0.01; coffee.current.visible = state.stream > 0.01;
    fill.current.scale.setScalar(Math.max(0.01, 0.8 + state.fill * 0.2));
    fill.current.position.y = -0.55 + state.fill * 0.35;
    fill.current.visible = state.fill > 0;
  });
  return <><Disc radius={3} color="#c8dfe9" /><Shadow /><group ref={kettle} position={[-1.4, 2.15, 0.3]}><mesh scale={[0.8, 0.65, 0.7]} castShadow><sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color="#f5d47f" roughness={0.25} clearcoat={0.5} /></mesh><mesh position={[-0.68, 0.2, 0]}><torusGeometry args={[0.45, 0.08, 12, 32]} /><meshStandardMaterial color="#e9ae65" /></mesh><mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.43, 0.5, 0.08, 32]} /><meshStandardMaterial color="#fff0c9" /></mesh><mesh position={[0.75, 0.02, 0]} rotation={[0, 0, -Math.PI / 2.3]}><cylinderGeometry args={[0.07, 0.17, 0.75, 20]} /><meshStandardMaterial color="#e5b86b" roughness={0.3} /></mesh><mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#e4aa65" /></mesh></group>
    <mesh ref={water}><cylinderGeometry args={[0.035, 0.025, 1, 12]} /><meshPhysicalMaterial color="#c3e7ee" transparent opacity={0.75} roughness={0.12} /></mesh>
    <group position={[0, 0.85, 0.3]}><mesh><cylinderGeometry args={[0.72, 0.2, 0.85, 40, 1, true]} /><meshStandardMaterial color="#ee9279" side={THREE.DoubleSide} roughness={0.3} /></mesh><mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.66, 0.17, 0.82, 40, 1, true]} /><meshStandardMaterial color="#fff2d5" side={THREE.DoubleSide} /></mesh><mesh position={[0, 0.13, 0]}><cylinderGeometry args={[0.48, 0.3, 0.07, 32]} /><meshStandardMaterial color="#98603c" /></mesh></group>
    <SoftBox size={[1.9, 0.12, 0.85]} position={[0, 0.37, 0.3]} color="#c4ac86" radius={0.03} /><SoftBox size={[0.13, 1.55, 0.16]} position={[-0.8, -0.36, 0.55]} color="#c4ac86" radius={0.03} /><SoftBox size={[0.13, 1.55, 0.16]} position={[0.8, -0.36, 0.55]} color="#c4ac86" radius={0.03} />
    <SimpleCup position={[0, -0.9, 0.3]} color="#fff1d6" foam={false} /><mesh ref={fill} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0.3]}><circleGeometry args={[0.38, 40]} /><meshStandardMaterial color="#b27b49" /></mesh><mesh ref={coffee} position={[0, 0.06, 0.3]}><cylinderGeometry args={[0.018, 0.013, 0.7, 10]} /><meshStandardMaterial color="#9b633c" /></mesh><Steam position={[0.1, 1.2, 0.3]} reduced={reduced} /></>;
}

export function IcedDrink(props) {
  return <group {...props}><mesh><cylinderGeometry args={[0.4, 0.31, 1.2, 32, 1, true]} /><meshPhysicalMaterial color="#d9f1f3" transparent opacity={0.3} side={THREE.DoubleSide} roughness={0.14} /></mesh><mesh position={[0, -0.18, 0]}><cylinderGeometry args={[0.35, 0.29, 0.8, 32]} /><meshStandardMaterial color="#c99565" roughness={0.4} /></mesh>{Array.from({ length: 5 }, (_, i) => <SoftBox key={i} size={[0.24, 0.22, 0.24]} position={[Math.sin(i * 2) * 0.17, 0.22 + i % 2 * 0.15, Math.cos(i * 2) * 0.15]} rotation={[i, i, i]} color="#e6f5f3" radius={0.03} />)}<mesh position={[0.15, 0.6, 0]} rotation={[0, 0, -0.13]}><cylinderGeometry args={[0.025, 0.025, 1.4, 10]} /><meshStandardMaterial color="#ed9d9e" /></mesh></group>;
}
export function Croissant(props) {
  return <group {...props}>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[(i - 4) * 0.13, 0.12 - Math.abs(i - 4) * 0.014, Math.pow((i - 4) * 0.13, 2) * 1.2]} rotation={[0, 0, (i - 4) * -0.13]} scale={[0.18, 0.29 - Math.abs(i - 4) * 0.035, 0.36 - Math.abs(i - 4) * 0.04]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={i % 2 ? '#d79347' : '#efb664'} roughness={0.35} /></mesh>)}</group>;
}
export function MenuStation({ clock, reduced }) {
  const group = useRef(null);
  useFrame(({ clock: time }) => { if (group.current) { group.current.rotation.y = (clock.current.progress - 4) * 0.5; group.current.position.y = reduced ? 0 : Math.sin(time.elapsedTime * 0.5) * 0.08; } });
  return <group ref={group}><SimpleCup position={[-3.3, 0.3, -1]} scale={1.4} color="#faab8b" /><IcedDrink position={[3.5, 0.8, -1]} scale={1.4} /><Croissant position={[-3.6, -0.8, 1]} scale={1.3} /><mesh position={[3.5, -0.8, 1]}><torusGeometry args={[0.5, 0.14, 12, 40]} /><meshStandardMaterial color="#e6c269" /></mesh></group>;
}

function ShopSign() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fbefcd'; ctx.fillRect(0, 0, 1024, 256); ctx.fillStyle = '#b95236'; ctx.textAlign = 'center'; ctx.font = 'bold 110px sans-serif'; ctx.fillText('daybreak', 512, 140); ctx.font = '25px sans-serif'; ctx.fillText('C O F F E E   C L U B', 512, 203);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, []);
  return <mesh position={[0, 1.95, 0.84]}><planeGeometry args={[2.7, 0.68]} /><meshBasicMaterial map={map} /></mesh>;
}
export function ShopStation() {
  return <><Disc radius={3.8} color="#d3dcb6" /><SoftBox size={[4.8, 3.2, 1.5]} position={[0, 0.35, -0.05]} color="#f8edcf" radius={0.12} /><SoftBox size={[5, 0.18, 1.7]} position={[0, 2, -0.05]} color="#fff2cf" radius={0.04} /><ShopSign />
    {[-1.55, 1.55].map(x => <group key={x}><SoftBox size={[1.22, 1.65, 0.06]} position={[x, 0.1, 0.74]} color="#9bc9ca" radius={0.15} /><SoftBox size={[0.05, 1.55, 0.08]} position={[x, 0.1, 0.8]} color="#fff1cf" radius={0.01} /><SoftBox size={[1.1, 0.05, 0.08]} position={[x, 0.1, 0.8]} color="#fff1cf" radius={0.01} /></group>)}
    <SoftBox size={[0.85, 2.05, 0.09]} position={[0, -0.2, 0.74]} color="#7baaa0" radius={0.15} /><SoftBox size={[0.63, 1.3, 0.03]} position={[0, 0.12, 0.8]} color="#c0dcd7" radius={0.1} /><mesh position={[0.25, -0.35, 0.84]}><sphereGeometry args={[0.04, 12, 8]} /><meshStandardMaterial color="#e2b16c" /></mesh>
    {Array.from({ length: 12 }, (_, i) => <SoftBox key={i} size={[0.4, 0.12, 1.25]} position={[-2.2 + i * 0.4, 1.3, 1.22]} rotation={[-0.18, 0, 0]} color={i % 2 ? '#fff1d0' : '#ec9a7d'} radius={0.03} />)}
    {[-2.5, 2.5].map(x => <group key={x} position={[x, -1.1, 1.1]}><mesh><cylinderGeometry args={[0.35, 0.26, 0.45, 24]} /><meshStandardMaterial color="#edac88" /></mesh><Plant position={[0, 0.1, 0]} scale={1.2} /></group>)}
    <group position={[-1.7, -1.06, 2.1]}><mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.55, 0.55, 0.08, 32]} /><meshStandardMaterial color="#f2d383" /></mesh><mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.06, 0.06, 0.52, 12]} /><meshStandardMaterial color="#b4c7ae" /></mesh><SimpleCup position={[0, 0.52, 0]} scale={0.3} /></group>
  </>;
}
