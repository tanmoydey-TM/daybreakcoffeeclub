'use client';

import { useEffect, useRef } from 'react';
import { cinemaAt, captionAt, filmCaptions } from '@/lib/cinema';

const doorway = '/images/film-hd/door-00.webp';

/** Photographic layers + native video decoding. No WebGL or canvas renderer. */
export default function CinematicFilm({ clock, reduced, onReady }) {
  const stage = useRef(null), facade = useRef(null), left = useRef(null), right = useRef(null);
  const interior = useRef(null), brewLayer = useRef(null), latteLayer = useRef(null);
  const brew = useRef(null), latte = useRef(null), captions = useRef([]);
  const entrance = useRef(null);
  useEffect(() => {
    // SSR images can finish loading before React attaches its load listener.
    if (entrance.current?.complete) onReady();
  }, [onReady]);
  useEffect(() => {
    let raf = 0, stopped = false;
    const videos = [brew.current, latte.current];
    const desired = [0, 0];
    const requestSeek = index => {
      const video = videos[index];
      if (stopped || !video || !Number.isFinite(video.duration) || video.seeking) return;
      const target = Math.min(Math.max(0, video.duration - .045), desired[index] * video.duration);
      if (Math.abs(video.currentTime - target) > .025) video.currentTime = target;
    };
    // Coalesce rapid wheel events: finish the current decode, then seek to the
    // latest scroll target. The movies are encoded with every frame as a keyframe.
    const seekHandlers = videos.map((video, index) => {
      const seek = () => requestSeek(index);
      video.addEventListener('seeked', seek);
      video.addEventListener('loadedmetadata', seek);
      return seek;
    });
    const update = () => {
      raf = 0;
      if (stopped) return;
      const s = cinemaAt(clock.current.progress, reduced);
      stage.current.dataset.progress = s.p.toFixed(3);
      stage.current.dataset.mode = reduced ? 'still' : 'scrub';
      facade.current.style.visibility = s.facade ? 'visible' : 'hidden';
      facade.current.style.transform = `scale(${s.dolly})`;
      left.current.style.transform = `rotateY(${-s.door}deg)`;
      right.current.style.transform = `rotateY(${s.door}deg)`;
      interior.current.style.transform = `scale(${s.interior})`;
      brewLayer.current.style.clipPath = `circle(${s.brewReveal * 145}% at 68% 48%)`;
      brew.current.style.transform = `scale(${s.videoScale})`;
      latteLayer.current.style.clipPath = `inset(0 0 0 ${(1 - s.latteReveal) * 100}%)`;
      latte.current.style.transform = `scale(${1.08 - s.latteTime * .08})`;
      stage.current.style.setProperty('--film-finish', s.finish);
      // Defer the heavier second movie until the entrance has almost passed.
      if (!reduced && s.p > .65 && !brew.current.getAttribute('src')) {
        brew.current.src = '/video/espresso-scrub.mp4'; brew.current.load();
      }
      if (!reduced && s.p > 1.85 && !latte.current.getAttribute('src')) {
        latte.current.src = '/video/latte-scrub.mp4'; latte.current.load();
      }
      desired[0] = s.brewTime; desired[1] = s.latteTime;
      if (!reduced) { requestSeek(0); requestSeek(1); }
      captions.current.forEach((element, index) => {
        const { start, end } = filmCaptions[index];
        const alpha = captionAt(s.p, start, end);
        element.style.opacity = alpha;
        element.style.transform = `translateY(${reduced ? 0 : (1 - alpha) * 18}px)`;
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('daybreak:scroll', schedule);
    return () => {
      stopped = true; cancelAnimationFrame(raf);
      window.removeEventListener('daybreak:scroll', schedule);
      videos.forEach((video, i) => { video.removeEventListener('seeked', seekHandlers[i]); video.removeEventListener('loadedmetadata', seekHandlers[i]); });
    };
  }, [clock, reduced]);

  return <div ref={stage} className="cinema-stage" aria-hidden="true">
    <div className="cinema-picture">
      <img ref={interior} className="cinema-interior" src="/images/cafe-interior.webp" alt="" />
      <div ref={brewLayer} className="cinema-video cinema-brew"><video ref={brew} muted playsInline preload="auto" poster="/video/espresso-poster.webp" /></div>
      <div ref={latteLayer} className="cinema-video cinema-latte"><video ref={latte} muted playsInline preload="auto" poster="/video/latte-poster.webp" /></div>
      <div ref={facade} className="cinema-facade">
        <div className="door-coordinate-space">
          <img ref={entrance} className="door-surround" src={doorway} alt="" fetchPriority="high" onLoad={onReady} onError={onReady} />
          <div className="door-perspective"><img ref={left} className="door-leaf door-left" src={doorway} alt="" /><img ref={right} className="door-leaf door-right" src={doorway} alt="" /></div>
        </div>
      </div>
      <div className="cinema-light" />
    </div>
    <div className="cinema-captions">{filmCaptions.map((caption, i) => <div ref={el => { captions.current[i] = el; }} className={`film-caption caption-${i}`} key={caption.label}>
      <span>{caption.label}</span><div>{caption.lines[0]}<br /><em>{caption.lines[1]}</em></div>
    </div>)}</div>
    <div className="film-edge-note"><span>THE DAYBREAK RITUAL</span><span>TAKE YOUR TIME ↓</span></div>
  </div>;
}
