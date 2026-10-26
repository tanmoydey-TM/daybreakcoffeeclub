'use client';

import { useEffect, useRef } from 'react';

// Existing photographs only. No canvas, models, or generated replacement assets.
const shots = [
  { image: 'hero', start: 0, end: 1.8, x: 67, y: 50, depth: true },
  { image: 'grind', start: 1.8, end: 2.9, x: 58, y: 48 },
  { image: 'tamp', start: 2.9, end: 4.05, x: 58, y: 53 },
  { image: 'hero', start: 4.05, end: 5.8, x: 65, y: 49, depth: true },
  { image: 'espresso', start: 5.8, end: 7.85, x: 60, y: 50 },
  { image: 'steam', start: 7.85, end: 8.9, x: 58, y: 50 },
  { image: 'pour', start: 8.9, end: 10.05, x: 58, y: 51 },
  { image: 'serve', start: 10.05, end: 11.8, x: 65, y: 56, depth: true },
];
const clamp = n => Math.max(0, Math.min(1, n));

export default function PhotoJourney({ clock, reduced, onReady }) {
  const root = useRef(null);
  useEffect(() => {
    const stage = root.current;
    if (!stage) return;
    const panels = [...stage.querySelectorAll('.film-shot')];
    const pointer = { x: 0, y: 0 }, current = { x: 0, y: 0 };
    let raf = 0;
    const paint = () => {
      raf = 0;
      const p = clock.current.progress;
      current.x += (pointer.x - current.x) * 0.12;
      current.y += (pointer.y - current.y) * 0.12;
      const active = Math.max(0, shots.findLastIndex(shot => p >= shot.start));
      panels.forEach((panel, i) => {
        const shot = shots[i];
        // Direct photographic cuts: never dissolve, fade, or wipe between shots.
        // Every photograph is preloaded so changing shots cannot flash blank.
        panel.style.visibility = i === active ? 'visible' : 'hidden';
        if (i !== active) return;
        const travel = clamp((p - shot.start) / (shot.end - shot.start));
        const zoom = reduced ? 1.02 : 1.05 + travel * 0.2;
        const direction = i % 2 ? -1 : 1;
        const x = reduced ? 0 : (travel - 0.5) * direction * 3 + current.x * 0.7;
        const y = reduced ? 0 : (travel - 0.5) * -2 + current.y * 0.5;
        const imagePlane = panel.querySelector('.film-plane');
        imagePlane.style.transform = `perspective(1600px) translate3d(${x}%,${y}%,0) scale(${zoom}) rotateY(${reduced ? 0 : current.x * 0.7}deg)`;
        const foreground = panel.querySelector('.film-depth');
        if (foreground) foreground.style.transform = `translate3d(${reduced ? 0 : current.x * 5 + Math.sin(p * 0.9) * 2}px,${reduced ? 0 : current.y * 3}px,0) scale(1.004)`;
      });
      stage.dataset.scene = shots[active].image;
      stage.dataset.progress = p.toFixed(3);
      stage.style.setProperty('--film-drift', `${reduced ? 0 : p * -9}px`);
      if (!reduced && (Math.abs(pointer.x - current.x) + Math.abs(pointer.y - current.y)) > 0.002) raf = requestAnimationFrame(paint);
    };
    const update = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const move = event => {
      if (reduced || event.pointerType !== 'mouse') return;
      pointer.x = event.clientX / innerWidth - 0.5;
      pointer.y = event.clientY / innerHeight - 0.5;
      update();
    };
    window.addEventListener('daybreak:progress', update);
    window.addEventListener('pointermove', move, { passive: true });
    paint();
    return () => {
      window.removeEventListener('daybreak:progress', update);
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, [clock, reduced]);

  return <div ref={root} className="photo-film" aria-label="Photographic coffee-making journey animated as you scroll">
    {shots.map((shot, i) => <div className="film-shot" key={`${shot.image}-${i}`} style={{ zIndex: i, visibility: i === 0 ? 'visible' : 'hidden', '--focus-x': `${shot.x}%`, '--focus-y': `${shot.y}%` }}>
      <div className="film-plane">
        <picture><source media="(max-width:767px)" srcSet={`/images/journey/${shot.image}-mobile.webp`} /><img src={`/images/journey/${shot.image}.webp`} alt="" loading="eager" fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" onLoad={i === 0 ? onReady : undefined} /></picture>
        {shot.depth && <div className="film-depth" style={{ maskImage: `url(/images/journey/${shot.image}-depth.webp)` }} aria-hidden="true"><img src={`/images/journey/${shot.image}.webp`} alt="" /></div>}
      </div>
    </div>)}
  </div>;
}
