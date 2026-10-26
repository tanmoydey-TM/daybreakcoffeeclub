'use client';

import { useEffect, useRef } from 'react';
import { FRAME_COUNT, filmAt, frameUrl } from '@/lib/film';
import { frameNeighborhood, trimFrames } from '@/lib/frame-cache';

/** Decoded HTML images only. No canvas, WebGL, model, opacity tween or video autoplay. */
export default function FrameSequence({ clock, reduced, onReady }) {
  const stage = useRef(null), image = useRef(null);
  useEffect(() => {
    let stopped = false, queued = 0, displayed = -1, target = 0, wanted = [];
    const decoded = new Map(), pending = new Set(), failed = new Set();
    // Prioritize the current seek. At most three decodes run concurrently and
    // eight frames remain referenced, rather than retaining the whole HD film.
    const pump = () => {
      if (stopped) return;
      for (const index of wanted) {
        if (pending.size >= 3) break;
        if (decoded.has(index) || pending.has(index) || failed.has(index)) continue;
        pending.add(index);
        const bitmap = new Image();
        bitmap.src = frameUrl(index);
        bitmap.decode().then(() => {
          if (stopped) return;
          decoded.set(index, bitmap);
          trimFrames(decoded, target, displayed);
        }).catch(() => {
          if (stopped) return;
          failed.add(index);
          if (index === target && displayed < 0 && image.current) {
            image.current.src = '/images/journey/serve.webp';
            onReady();
          }
        }).finally(() => { pending.delete(index); if (!stopped) schedule(); });
      }
    };
    const draw = () => {
      queued = 0;
      if (stopped || !image.current) return;
      const state = filmAt(clock.current.progress, reduced);
      target = state.frame;
      wanted = reduced ? [target] : frameNeighborhood(target, FRAME_COUNT);
      image.current.style.transform = `scale(${state.scale})`;
      stage.current.dataset.targetFrame = state.frame;
      stage.current.dataset.shot = state.shot;
      if (displayed !== state.frame && decoded.has(state.frame)) {
        image.current.src = decoded.get(state.frame).src;
        stage.current.dataset.frame = state.frame;
        displayed = state.frame;
        onReady();
      }
      // Hold the last decoded picture while seeking; never flash an unloaded image.
      trimFrames(decoded, target, displayed);
      stage.current.dataset.cachedFrames = decoded.size;
      pump();
    };
    const schedule = () => { if (!stopped && !queued) queued = requestAnimationFrame(draw); };
    schedule();
    window.addEventListener('daybreak:scroll', schedule);
    return () => { stopped = true; cancelAnimationFrame(queued); window.removeEventListener('daybreak:scroll', schedule); decoded.clear(); };
  }, [clock, reduced, onReady]);

  return <div ref={stage} className="film-stage" data-frame="0" aria-hidden="true">
    <img ref={image} src={frameUrl(0)} alt="" decoding="async" fetchPriority="high" />
    <div className="film-readability" />
  </div>;
}
