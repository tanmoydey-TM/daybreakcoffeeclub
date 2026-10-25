'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { getBrewState, phase } from '@/lib/brew';

export type SceneClock = { progress: number };
type SceneProps = { clock: MutableRefObject<SceneClock>; reduced: boolean; milk: string; onReady: () => void };
const green = '#548875';
const cream = '#fff2d4';
const orange = '#d9653e';
const metal = '#d7dedb';

function Block({ position = [0, 0, 0], size, color, radius = 0.06, metallic = 0 }: {
  position?: [number, number, number]; size: [number, number, number]; color: string; radius?: number; metallic?: number;
}) {
  return <RoundedBox args={size} position={position} radius={radius} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={metallic ? 0.26 : 0.34} metalness={metallic} />
  </RoundedBox>;
}

function Cylinder({ position, args, color, metallic = 0, rotation = [0, 0, 0] }: {
  position: [number, number, number]; args: [number, number, number, number?]; color: string; metallic?: number; rotation?: [number, number, number];
}) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[...args.slice(0, 3), args[3] ?? 48] as [number, number, number, number]} />
    <meshStandardMaterial color={color} metalness={metallic} roughness={metallic ? 0.22 : 0.4} />
  </mesh>;
}

function Tube({ points, radius = 0.035, color = metal }: { points: [number, number, number][]; radius?: number; color?: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  return <mesh castShadow><tubeGeometry args={[curve, 36, radius, 10, false]} /><meshStandardMaterial color={color} metalness={0.8} roughness={0.2} /></mesh>;
}

function useLabel(kind: 'brand' | 'gauge' | 'cup' | 'dial') {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = kind === 'brand' || kind === 'cup' ? 256 : 512;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (kind === 'brand' || kind === 'cup') {
      ctx.fillStyle = kind === 'brand' ? '#fff2d4' : '#b84224';
      ctx.textAlign = 'center'; ctx.font = 'bold 76px Georgia';
      ctx.fillText('daybreak', 256, 118);
      ctx.font = '500 24px sans-serif'; ctx.letterSpacing = '5px'; ctx.fillText('COFFEE CLUB', 256, 166);
    } else {
      ctx.fillStyle = '#fff8e5'; ctx.beginPath(); ctx.arc(256, 256, 247, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3f5048'; ctx.lineWidth = 4;
      for (let i = 0; i <= 24; i++) {
        const a = Math.PI * 0.75 + (i / 24) * Math.PI * 1.5;
        ctx.beginPath(); ctx.moveTo(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190);
        ctx.lineTo(256 + Math.cos(a) * (i % 4 === 0 ? 154 : 174), 256 + Math.sin(a) * (i % 4 === 0 ? 154 : 174)); ctx.stroke();
      }
      ctx.fillStyle = '#3f5048'; ctx.font = '30px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(kind === 'gauge' ? 'PRESSURE' : 'TEMP °C', 256, 340);
      ctx.font = '22px sans-serif'; ctx.fillText('0', 111, 365); ctx.fillText(kind === 'gauge' ? '15' : '120', 399, 365);
    }
    const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Label({ kind, position, size }: { kind: 'brand' | 'cup' | 'gauge' | 'dial'; position: [number, number, number]; size: [number, number] }) {
  const map = useLabel(kind);
  return <mesh position={position}><planeGeometry args={size} /><meshBasicMaterial map={map} transparent depthWrite={false} side={THREE.DoubleSide} /></mesh>;
}

function Bean({ position, scale = 0.12, rotation = [0, 0, 0] }: { position: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  return <group position={position} rotation={rotation} scale={scale}>
    <mesh scale={[0.7, 1, 0.54]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#71442c" roughness={0.6} /></mesh>
    <mesh position={[0, 0, 0.51]} rotation={[0, 0, 0.12]} scale={[0.055, 0.8, 0.07]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color="#3b231b" /></mesh>
  </group>;
}

function Machine({ clock }: { clock: MutableRefObject<SceneClock> }) {
  const needle = useRef<THREE.Group>(null);
  useFrame(() => { if (needle.current) needle.current.rotation.z = 1.85 - getBrewState(clock.current.progress).extraction * 3.5; });
  return <group position={[0.45, 0, 0]}>
    <Block position={[0, 0.23, -0.38]} size={[2.18, 2.65, 1.24]} color={green} radius={0.18} />
    <Block position={[0, 0.98, 0.23]} size={[2.2, 1.15, 0.65]} color={green} radius={0.12} />
    <Block position={[0, -0.44, 0.28]} size={[1.94, 1.33, 0.13]} color={metal} metallic={0.85} radius={0.035} />
    <Block position={[0, 1.57, -0.23]} size={[2.15, 0.11, 1.25]} color={metal} metallic={0.8} radius={0.04} />
    <Block position={[0, -1.14, 0.1]} size={[2.35, 0.22, 1.97]} color={green} radius={0.09} />
    <Block position={[0, -0.99, 0.57]} size={[1.98, 0.09, 0.94]} color="#263f36" radius={0.03} />
    {Array.from({ length: 17 }, (_, i) => <Block key={i} position={[-0.91 + i * 0.114, -0.928, 0.57]} size={[0.025, 0.02, 0.85]} color={metal} radius={0.008} metallic={0.9} />)}
    {[-0.85, 0.85].map(x => <Cylinder key={x} position={[x, -1.33, -0.05]} args={[0.13, 0.12, 0.18]} color="#33473d" />)}
    <Label kind="brand" position={[0, 1.14, 0.565]} size={[1.18, 0.59]} />
    <Cylinder position={[-0.61, 0.67, 0.58]} args={[0.22, 0.22, 0.09]} rotation={[Math.PI / 2, 0, 0]} color={metal} metallic={0.9} />
    <Label kind="gauge" position={[-0.61, 0.67, 0.632]} size={[0.385, 0.385]} />
    <group ref={needle} position={[-0.61, 0.67, 0.64]}><mesh position={[0, 0.06, 0]}><boxGeometry args={[0.012, 0.14, 0.01]} /><meshBasicMaterial color={orange} /></mesh></group>
    <Cylinder position={[-0.61, 0.67, 0.65]} args={[0.018, 0.018, 0.014]} rotation={[Math.PI / 2, 0, 0]} color="#42544a" />
    {[0.16, 0.44, 0.72].map((x, i) => <group key={x}>
      <Cylinder position={[x, 0.64, 0.58]} args={[0.079, 0.079, 0.09]} color={i === 2 ? orange : cream} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[x, 0.82, 0.572]}><sphereGeometry args={[0.022, 12, 12]} /><meshStandardMaterial color="#f5e6a5" emissive="#f5bf63" emissiveIntensity={0.4} /></mesh>
    </group>)}
    <Cylinder position={[0, 0.27, 0.67]} args={[0.29, 0.26, 0.22]} color={metal} metallic={0.9} />
    <Cylinder position={[0, 0.14, 0.67]} args={[0.32, 0.3, 0.07]} color="#33473d" metallic={0.5} />
    <Tube points={[[0.85, 0.35, 0.58], [1.17, 0.2, 0.75], [1.3, -0.19, 0.9], [1.49, -0.45, 0.96]]} radius={0.04} />
    <Cylinder position={[0.91, 0.56, 0.52]} args={[0.095, 0.095, 0.19]} rotation={[Math.PI / 2, 0, 0]} color="#edb475" />
    <Tube points={[[-0.97, 1.7, -0.72], [-0.97, 1.77, 0.18], [0.97, 1.77, 0.18], [0.97, 1.7, -0.72]]} radius={0.025} />
    {[-0.47, 0.15].map(x => <group key={x} position={[x, 1.66, -0.34]} scale={0.34} rotation={[Math.PI, 0, 0]}><Cup /></group>)}
  </group>;
}

function Grinder({ clock }: { clock: MutableRefObject<SceneClock> }) {
  const falling = useRef<THREE.Group>(null);
  const grounds = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = clock.current.progress;
    const b = getBrewState(p);
    if (falling.current) {
      falling.current.visible = p > 0.55 && p < 2;
      falling.current.children.forEach((bean, i) => {
        const t = ((b.beans * 2.6 + i * 0.137) % 1);
        bean.position.set(Math.sin(i * 2.4) * 0.32, 2.9 - t * 1.7, Math.cos(i * 2.4) * 0.27);
        bean.rotation.set(t * 4 + i, i, t * 3);
      });
    }
    if (grounds.current) {
      grounds.current.visible = p > 1.8 && p < 2.85;
      grounds.current.children.forEach((g, i) => { g.position.y = 0.02 - ((b.grounds * 5 + i * 0.08) % 1) * 0.5; });
    }
  });
  return <group position={[-1.5, 0, -0.06]}>
    <Block size={[0.9, 0.13, 1.04]} position={[0, -1.2, 0.05]} color={cream} radius={0.06} />
    <Block size={[0.72, 1.27, 0.73]} position={[0, -0.52, -0.13]} color={cream} radius={0.16} />
    <Cylinder position={[0, 0.13, -0.13]} args={[0.41, 0.36, 0.35]} color={green} />
    <Cylinder position={[0, 0.49, -0.13]} args={[0.45, 0.29, 0.4]} color="#b8c7ba" metallic={0.5} />
    <mesh position={[0, 0.93, -0.13]}><cylinderGeometry args={[0.49, 0.38, 0.55, 32, 1, true]} /><meshPhysicalMaterial color="#e3eee5" transparent opacity={0.25} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    {Array.from({ length: 30 }, (_, i) => <Bean key={i} position={[Math.sin(i * 2.4) * (0.12 + i % 3 * 0.08), 0.74 + (i % 4) * 0.065, -0.13 + Math.cos(i * 2.4) * 0.25]} scale={0.065} rotation={[i, i * 0.7, i * 1.1]} />)}
    <Cylinder position={[0, 1.23, -0.13]} args={[0.51, 0.51, 0.065]} color={green} />
    <Cylinder position={[0, 1.3, -0.13]} args={[0.1, 0.1, 0.08]} color={cream} />
    <Block size={[0.22, 0.26, 0.43]} position={[0, 0.05, 0.43]} color={metal} metallic={0.85} radius={0.04} />
    <Label kind="cup" position={[0, -0.56, 0.241]} size={[0.54, 0.27]} />
    <Cylinder position={[0, -0.23, 0.25]} args={[0.08, 0.08, 0.08]} color={orange} rotation={[Math.PI / 2, 0, 0]} />
    <group ref={falling} position={[0, 0, -0.13]}>{Array.from({ length: 16 }, (_, i) => <Bean key={i} position={[0, 0, 0]} scale={0.075} />)}</group>
    <group ref={grounds} position={[0, 0, 0.52]}>{Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[Math.sin(i * 5) * 0.07, 0, Math.cos(i * 7) * 0.07]}><sphereGeometry args={[0.018, 5, 5]} /><meshStandardMaterial color="#684129" /></mesh>)}</group>
  </group>;
}

function Cup({ liquid = 0, milk = 0, art = 0, color = '#ef8b66' }: { liquid?: number; milk?: number; art?: number; color?: string }) {
  const points = useMemo(() => [new THREE.Vector2(0.02, 0.04), new THREE.Vector2(0.23, 0.04), new THREE.Vector2(0.26, 0.06), new THREE.Vector2(0.32, 0.13), new THREE.Vector2(0.37, 0.3), new THREE.Vector2(0.39, 0.53), new THREE.Vector2(0.385, 0.58), new THREE.Vector2(0.355, 0.58), new THREE.Vector2(0.35, 0.52), new THREE.Vector2(0.32, 0.28), new THREE.Vector2(0.26, 0.12), new THREE.Vector2(0, 0.1)], []);
  return <group>
    <mesh castShadow receiveShadow><latheGeometry args={[points, 64]} /><meshStandardMaterial color={color} roughness={0.22} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.42, 0.31, 0]} scale={[0.82, 1, 1]} castShadow><torusGeometry args={[0.19, 0.065, 12, 32]} /><meshStandardMaterial color={color} roughness={0.24} /></mesh>
    <mesh position={[0, 0.577, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.37, 0.017, 8, 64]} /><meshStandardMaterial color={cream} roughness={0.3} /></mesh>
    {liquid > 0 && <group position={[0, 0.13 + liquid * 0.2 + milk * 0.2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.27 + liquid * 0.045 + milk * 0.035, 64]} /><meshStandardMaterial color={milk > 0.4 ? '#ba814a' : '#8d512a'} roughness={0.23} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}><ringGeometry args={[0.23 + milk * 0.055, 0.272 + liquid * 0.045 + milk * 0.032, 64]} /><meshStandardMaterial color="#d8a65f" roughness={0.38} /></mesh>
      {art > 0 && <group scale={art} position={[0, 0.008, 0]}>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 0.001, -0.13 + i * 0.04]} scale={[0.9 - i * 0.08, 0.38, 1]}><ringGeometry args={[0.12, 0.15, 32, 1, 0, Math.PI * 1.85]} /><meshStandardMaterial color="#fff4dc" side={THREE.DoubleSide} /></mesh>)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0.04]} scale={[0.16, 1, 1]}><circleGeometry args={[0.16, 24]} /><meshStandardMaterial color="#fff4dc" /></mesh>
      </group>}
    </group>}
  </group>;
}

function BrewingTools({ clock, milk }: Pick<SceneProps, 'clock' | 'milk'>) {
  const basket = useRef<THREE.Group>(null);
  const tamper = useRef<THREE.Group>(null);
  const puck = useRef<THREE.Mesh>(null);
  const cup = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Mesh>(null);
  const art = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Group>(null);
  const pitcher = useRef<THREE.Group>(null);
  const milkStream = useRef<THREE.Mesh>(null);
  const steam = useRef<THREE.Group>(null);
  const pastry = useRef<THREE.Group>(null);
  const tray = useRef<THREE.Group>(null);
  const milkColor = useMemo(() => new THREE.Color(milk === 'Oat' ? '#f8e5bf' : milk === 'Almond' ? '#edddba' : '#fff6e4'), [milk]);
  const liquidColor = useMemo(() => new THREE.Color(), []);
  const pitcherPoints = useMemo(() => [new THREE.Vector2(0.02, 0), new THREE.Vector2(0.25, 0), new THREE.Vector2(0.31, 0.07), new THREE.Vector2(0.27, 0.63), new THREE.Vector2(0.25, 0.64), new THREE.Vector2(0.28, 0.08), new THREE.Vector2(0, 0.04)], []);
  useFrame(() => {
    const p = clock.current.progress;
    const b = getBrewState(p);
    if (basket.current) {
      basket.current.position.set(THREE.MathUtils.lerp(-1.5, 0.45, b.insert), THREE.MathUtils.lerp(-0.48, 0.04, b.insert), THREE.MathUtils.lerp(0.48, 0.67, b.insert));
      basket.current.rotation.y = -0.55 + b.insert * 0.55;
    }
    if (puck.current) puck.current.scale.set(1, Math.max(0.02, b.grounds * (1 - b.tamp * 0.4)), 1);
    if (tamper.current) { tamper.current.visible = p > 2.75 && p < 4.1; tamper.current.position.y = 0.7 - b.tamp * 0.98; }
    if (cup.current) {
      cup.current.position.set(THREE.MathUtils.lerp(1.95, 0.45, b.cup) - b.serve * 0.4, -0.9 - b.serve * 0.28, THREE.MathUtils.lerp(1.6, 0.75, b.cup) + b.serve * 1.6);
      cup.current.rotation.y = b.serve * 0.25;
    }
    if (liquid.current) {
      liquid.current.visible = b.coffee > 0;
      liquid.current.position.y = 0.14 + b.coffee * 0.2 + b.pour * 0.19;
      liquid.current.scale.setScalar(0.8 + b.coffee * 0.1 + b.pour * 0.1);
      liquidColor.set('#9b5b2a').lerp(new THREE.Color('#c48d52'), b.pour);
      (liquid.current.material as THREE.MeshStandardMaterial).color.copy(liquidColor);
    }
    if (art.current) { art.current.visible = b.art > 0; art.current.scale.setScalar(b.art); }
    if (stream.current) { stream.current.visible = b.extraction > 0; stream.current.scale.y = b.extraction; }
    if (pitcher.current) {
      const go = phase(p, 8.4, 9.05), back = phase(p, 9.75, 10.2);
      pitcher.current.position.set(1.98 - go * 0.92 + back, -0.94 + go * 1.42 - back * 1.42, 1 + go * 0.15);
      pitcher.current.rotation.z = go * 0.68 * (1 - back);
    }
    if (milkStream.current) { milkStream.current.visible = b.milkStream > 0; milkStream.current.scale.y = b.milkStream; }
    if (steam.current) {
      steam.current.visible = b.steam > 0;
      steam.current.children.forEach((particle, i) => {
        const t = ((p * 2.5 + i * 0.11) % 1);
        particle.position.set(Math.sin(t * 5 + i) * 0.14, t * 0.9, Math.cos(i) * 0.1);
        particle.scale.setScalar(0.07 + t * 0.12);
        (particle as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>).material.opacity = (1 - t) * 0.25 * b.steam;
      });
    }
    if (pastry.current) { pastry.current.visible = b.serve > 0.01; pastry.current.scale.setScalar(b.serve); }
    if (tray.current) { tray.current.visible = b.serve > 0.01; tray.current.scale.setScalar(0.7 + b.serve * 0.3); }
  });
  return <>
    <group ref={basket}>
      <Cylinder position={[0, 0, 0]} args={[0.24, 0.2, 0.14]} color={metal} metallic={0.85} />
      <mesh ref={puck} position={[0, 0.079, 0]}><cylinderGeometry args={[0.215, 0.215, 0.055, 32]} /><meshStandardMaterial color="#4c3021" roughness={1} /></mesh>
      <Cylinder position={[0, -0.1, 0]} args={[0.12, 0.08, 0.1]} color={metal} metallic={0.85} />
      <Tube points={[[-0.09, -0.13, 0], [-0.09, -0.18, 0.08], [0.09, -0.18, 0.08], [0.09, -0.13, 0]]} radius={0.022} />
      <Cylinder position={[0, 0, 0.43]} args={[0.072, 0.09, 0.64]} rotation={[Math.PI / 2, 0, 0]} color="#c9854d" />
      <Cylinder position={[0, 0, 0.79]} args={[0.078, 0.078, 0.05]} rotation={[Math.PI / 2, 0, 0]} color={metal} metallic={0.8} />
    </group>
    <group ref={tamper} position={[-1.5, 0.7, 0.48]}>
      <Cylinder position={[0, -0.1, 0]} args={[0.22, 0.22, 0.07]} color={metal} metallic={0.9} />
      <Cylinder position={[0, 0.02, 0]} args={[0.1, 0.07, 0.19]} color="#c9854d" />
      <mesh position={[0, 0.16, 0]} scale={[0.16, 0.11, 0.16]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#c9854d" roughness={0.4} /></mesh>
    </group>
    <group ref={cup} position={[1.95, -0.9, 1.6]}>
      <Cylinder position={[0, -0.025, 0]} args={[0.61, 0.5, 0.065]} color={cream} />
      <Cup />
      <mesh ref={liquid} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35, 64]} /><meshStandardMaterial color="#a46534" roughness={0.22} /></mesh>
      <group ref={art} position={[0, 0.541, 0]}>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 0.0008, -0.12 + i * 0.038]} scale={[1 - i * 0.085, 0.42, 1]}><ringGeometry args={[0.12, 0.145, 32, 1, 0, Math.PI * 1.92]} /><meshStandardMaterial color={milkColor} side={THREE.DoubleSide} /></mesh>)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0.03]} scale={[0.13, 1, 1]}><circleGeometry args={[0.17, 24]} /><meshStandardMaterial color={milkColor} /></mesh>
      </group>
    </group>
    <group ref={stream} position={[0.45, -0.15, 0.75]}>
      {[-0.08, 0.08].map(x => <mesh key={x} position={[x, -0.3, 0]}><cylinderGeometry args={[0.017, 0.012, 0.6, 10]} /><meshStandardMaterial color="#663215" roughness={0.18} /></mesh>)}
    </group>
    <group ref={pitcher} position={[1.98, -0.94, 1]}>
      <mesh castShadow><latheGeometry args={[pitcherPoints, 48]} /><meshStandardMaterial color={metal} metalness={0.95} roughness={0.2} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0.34, 0.34, 0]} scale={[0.7, 1, 1]}><torusGeometry args={[0.2, 0.027, 8, 24]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.25, 32]} /><meshStandardMaterial color={milkColor} roughness={0.3} /></mesh>
      <mesh position={[-0.25, 0.58, 0]} rotation={[0, 0, -0.55]}><coneGeometry args={[0.085, 0.22, 3, 1, true]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} /></mesh>
    </group>
    <mesh ref={milkStream} position={[0.57, 0.02, 0.85]} rotation={[0, 0, -0.24]}><cylinderGeometry args={[0.035, 0.02, 0.84, 12]} /><meshStandardMaterial color={milkColor} roughness={0.25} /></mesh>
    <group ref={steam} position={[1.98, -0.4, 1]}>{Array.from({ length: 9 }, (_, i) => <mesh key={i}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} /></mesh>)}</group>
    <group ref={tray} position={[0.05, -1.29, 2.25]}><Block size={[2.9, 0.1, 1.65]} color="#b9854f" radius={0.12} /><Block position={[0, 0.065, 0]} size={[2.73, 0.03, 1.48]} color="#d8ad75" radius={0.11} /></group>
    <group ref={pastry} position={[-0.83, -1.15, 2.15]} rotation={[0, -0.3, 0]}>
      <Cylinder position={[0, 0, 0]} args={[0.55, 0.48, 0.06]} color="#e7ecdb" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = (i - 4) * 0.086;
        return <mesh key={i} position={[x, 0.17 - Math.abs(i - 4) * 0.016, Math.pow(x, 2) * 1.5]} rotation={[0, 0, (i - 4) * -0.13]} scale={[0.12, 0.18 - Math.abs(i - 4) * 0.018, 0.24 - Math.abs(i - 4) * 0.025]} castShadow><sphereGeometry args={[1, 14, 12]} /><meshStandardMaterial color={i % 2 ? '#cb762b' : '#e69b41'} roughness={0.48} /></mesh>;
      })}
    </group>
  </>;
}

const views = [
  [6.7, 4.4, 8.8, 0, 0.12, 0.3, 42],
  [3.5, 3.3, 6.5, -0.7, 0.65, 0, 43],
  [2.1, 2.5, 5.8, -0.72, -0.03, 0.3, 42],
  [1.8, 3.6, 6.1, -0.7, -0.05, 0.4, 40],
  [4.8, 2.7, 6.8, 0.35, 0.1, 0.4, 42],
  [4.9, 2.5, 7.1, 0.6, -0.15, 0.6, 40],
  [3.1, 1.1, 4.9, 0.48, -0.3, 0.65, 40],
  [3.1, 2.5, 5.1, 0.55, -0.35, 0.72, 42],
  [5.7, 3.1, 6.3, 1, -0.1, 0.55, 42],
  [2.6, 3.4, 4.9, 0.55, -0.2, 0.85, 40],
  [4.1, 4.8, 6.9, 0.15, -0.4, 1.4, 41],
  [4.1, 4.4, 7.6, 0.1, -0.1, 0.8, 43],
];

function World({ clock, reduced, milk, onReady }: SceneProps) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { onReady(); }, [onReady]);
  useFrame(({ camera, size, invalidate }) => {
    const p = reduced ? 11 : clock.current.progress;
    const i = Math.min(10, Math.floor(p));
    const t = phase(p, i, i + 1);
    const a = views[i], b = views[i + 1];
    const v = a.map((n, j) => THREE.MathUtils.lerp(n, b[j], t));
    target.set(v[3], v[4], v[5]);
    position.set(v[0], v[1], v[2]);
    const ratio = size.width / size.height;
    const distance = ratio < 0.9 ? 1.1 : ratio > 1.6 ? 0.97 : 1;
    position.sub(target).multiplyScalar(distance).add(target);
    camera.position.copy(position); camera.lookAt(target);
    if (camera instanceof THREE.PerspectiveCamera) { camera.fov = v[6]; camera.updateProjectionMatrix(); }
    // Demand-rendered canvas: continue only while the GSAP clock is changing.
    if (!reduced) invalidate();
  });
  return <>
    <ambientLight intensity={0.8} />
    <hemisphereLight args={['#fff8de', '#afc1a4', 1.4]} />
    <directionalLight position={[-4, 7, 5]} intensity={3.5} color="#fff3d9" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={0.035} />
    <directionalLight position={[5, 3, -4]} intensity={2} color="#d8ecf7" />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={4} color="#ffffff" position={[-4, 5, 3]} scale={[6, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={3} color="#fff0cb" position={[4, 3, -3]} scale={[4, 7, 1]} target={[0, 0, 0]} />
    </Environment>
    <group rotation={[0, -0.06, 0]}>
      <Cylinder position={[0, -1.53, 0.4]} args={[3.45, 3.45, 0.19, 96]} color="#f5e6c3" />
      <Cylinder position={[0, -1.69, 0.4]} args={[3.3, 3.15, 0.17, 96]} color="#d6b487" />
      <Machine clock={clock} />
      <Grinder clock={clock} />
      <BrewingTools clock={clock} milk={milk} />
      {Array.from({ length: 9 }, (_, i) => <Bean key={i} position={[-1.95 + Math.sin(i * 5) * 0.5, -1.39, 1.15 + Math.cos(i * 3) * 0.4]} scale={0.065} rotation={[Math.PI / 2, i * 2, 0]} />)}
      <group position={[-2.28, -1.42, -0.92]}>
        <Cylinder position={[0, 0.17, 0]} args={[0.27, 0.21, 0.35]} color={orange} />
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[Math.sin(i * 2.4) * 0.16, 0.57 + i % 3 * 0.08, Math.cos(i * 2.4) * 0.16]} rotation={[Math.cos(i) * 0.7, i, Math.sin(i) * 0.6]} scale={[0.11, 0.42, 0.04]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={i % 2 ? '#5c8550' : '#799c5d'} /></mesh>)}
      </group>
    </group>
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function CoffeeScene(props: SceneProps) {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (!context) setSupported(false);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);
  const fallback = <div className="scene-fallback"><img src="/images/cafe-interior.webp" alt="A sunny café with a latte and croissant on an oak table" /><span>The coffee journey is available in the chapters below.</span></div>;
  if (!supported) return fallback;
  return <SceneBoundary fallback={fallback}><Canvas shadows dpr={[1, 1.5]} camera={{ position: [6.7, 4.4, 8.8], fov: 42, near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} frameloop={props.reduced ? 'demand' : 'always'} aria-label="Interactive 3D espresso machine. Scroll to grind, tamp, brew, steam, and serve your coffee.">
    <Suspense fallback={null}><World {...props} /></Suspense>
  </Canvas></SceneBoundary>;
}
