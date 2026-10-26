'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, ArrowUpRight, ArrowRight, Sun, Plus, Minus, X, Menu as MenuIcon, MapPin, Clock3, Mail, ShoppingBag, VolumeX, Sparkles } from 'lucide-react';
import { scenes, storyProgress, menu, shop } from '@/lib/journey';

import CinematicFilm from './journey/CinematicFilm';

function SunLogo() {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="3" /><path d="M24 2v7m0 30v7M2 24h7m30 0h7M8.5 8.5l5 5m21 21 5 5m0-31-5 5m-21 21-5 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M20 26q4 5 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function ProductCard({ item, onSelect, index }) {
  const card = useRef(null);
  const move = e => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    card.current.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 10}deg`);
    card.current.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
  };
  const reset = () => { card.current.style.setProperty('--rx', '0deg'); card.current.style.setProperty('--ry', '0deg'); };
  return <button ref={card} className="product-card" style={{ '--card-color': item.color, '--card-index': index }} onPointerMove={move} onPointerLeave={reset} onClick={() => onSelect(item)}>
    <span className="product-art"><img src={item.image} alt="" loading="lazy" /><span className="product-sticker">{item.category === 'Bakery' ? 'oh, crumbs!' : 'sip happy'}</span></span>
    <span className="product-tag">{item.tag}</span><strong>{item.name}</strong><span className="product-note">{item.note}</span>
    <span className="product-bottom"><span>${item.price.toFixed(2)}</span><span className="round-plus"><Plus size={19} /></span></span>
  </button>;
}

function OrderDialog({ mode, product, close, bag, setBag }) {
  const dialog = useRef(null);
  const [milk, setMilk] = useState('Oat');
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setAdded(false);
    if (mode) dialog.current?.showModal(); else dialog.current?.close();
  }, [mode, product]);
  const add = () => {
    const id = `${product.id}-${product.category === 'Bakery' ? 'original' : milk}`;
    setBag(previous => {
      const existing = previous.find(item => item.key === id);
      return existing ? previous.map(item => item.key === id ? { ...item, quantity: item.quantity + 1 } : item) : [...previous, { ...product, key: id, milk: product.category === 'Bakery' ? null : milk, quantity: 1 }];
    });
    setAdded(true);
  };
  const quantity = (key, change) => setBag(previous => previous.map(item => item.key === key ? { ...item, quantity: item.quantity + change } : item).filter(item => item.quantity > 0));
  return <dialog ref={dialog} className="morning-dialog" data-lenis-prevent aria-labelledby="dialog-title" onCancel={close} onClick={e => { if (e.target === dialog.current) close(); }}>
    <div className="dialog-inner"><button className="close-button" onClick={close} aria-label="Close dialog"><X /></button><SunLogo />
      <span className="eyebrow">A LITTLE SOMETHING GOOD</span>
      <h2 id="dialog-title">{mode === 'product' ? product?.name : mode === 'bag' ? 'Your happy little order.' : 'Let’s meet for coffee.'}</h2>
      {mode === 'product' && product && <>
        <p>{product.note}</p>
        {product.category !== 'Bakery' && <div className="milk-picker" role="group" aria-label="Choose milk">{['Oat', 'Dairy', 'Almond'].map(option => <button key={option} onClick={() => setMilk(option)} aria-pressed={milk === option}>{option}</button>)}</div>}
        <button className="button coral" onClick={add}>{added ? 'Add another' : 'Add to your order'} <span>${product.price.toFixed(2)}</span><Plus size={18} /></button>
        <p className="added-message" aria-live="polite">{added ? 'Added. Your brighter morning is taking shape.' : 'Made your way. Enjoyed at your pace.'}</p>
      </>}
      {mode === 'bag' && <>
        {bag.length ? <div className="bag-items">{bag.map(item => <article key={item.key}><div><strong>{item.name}</strong><small>{item.milk ? `${item.milk} milk` : 'Fresh from the bakery'} · ${item.price.toFixed(2)}</small></div><div className="quantity"><button onClick={() => quantity(item.key, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => quantity(item.key, 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button></div></article>)}<div className="bag-total"><span>Your total</span><strong>${bag.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong></div></div> : <p>Your cup is waiting. Find something lovely on the menu.</p>}
        <button className="button coral" onClick={close}>Keep exploring <ArrowRight size={18} /></button>
      </>}
      {mode === 'visit' && <div className="visit-dialog-content"><p>We’re making room for your new favorite morning. Our first address, hours, and contact details are coming soon.</p>{shop.email && <a className="button coral" href={`mailto:${shop.email}`}>Say hello <ArrowUpRight size={18} /></a>}<button className="button pale" onClick={close}>Back to the sunshine <Sun size={17} /></button></div>}
      <p className="demo-note">Daybreak is a café concept. Sample menu in USD. Orders stay in this page; no payment or order is sent.</p>
    </div>
  </dialog>;
}

export default function CinematicExperience() {
  const root = useRef(null), clock = useRef({ progress: 0 }), lenis = useRef(null), cursor = useRef(null);
  const [active, setActive] = useState(0), [ready, setReady] = useState(false), [reduced, setReduced] = useState(false), [mobile, setMobile] = useState(true);
  const [navOpen, setNavOpen] = useState(false), [filter, setFilter] = useState('All'), [dialog, setDialog] = useState(null), [product, setProduct] = useState(null), [bag, setBag] = useState([]);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)'), narrow = matchMedia('(max-width: 767px)');
    const updateMotion = () => setReduced(motion.matches), updateSize = () => setMobile(narrow.matches);
    updateMotion(); updateSize();
    motion.addEventListener('change', updateMotion); narrow.addEventListener('change', updateSize);
    return () => { motion.removeEventListener('change', updateMotion); narrow.removeEventListener('change', updateSize); };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false, offsets = [], last = -1;
    const mix = scenes.slice(0, -1).map((scene, i) => [gsap.utils.interpolate(scene.color, scenes[i + 1].color), gsap.utils.interpolate(scene.glow, scenes[i + 1].glow)]);
    const sync = () => {
      const p = storyProgress(scrollY, offsets);
      if (last === p) return;
      last = p; clock.current.progress = p;
      const index = Math.min(5, Math.floor(p)), t = p - index;
      root.current.style.setProperty('--scene-color', mix[index][0](t));
      root.current.style.setProperty('--scene-glow', mix[index][1](t));
      root.current.style.setProperty('--journey-progress', p / 6);
      root.current.dataset.progress = p.toFixed(3);
      setActive(previous => previous === Math.round(p) ? previous : Math.round(p));
      window.dispatchEvent(new Event('daybreak:scroll'));
    };
    const refresh = () => { offsets = [...root.current.querySelectorAll('[data-scene]')].map(el => el.offsetTop); last = -1; sync(); };
    const context = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: sync, onRefresh: refresh });
      if (!reduced) {
        gsap.fromTo('.intro-reveal', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity' });
        gsap.utils.toArray('.scene-heading:not(.hero-heading)').forEach(el => gsap.fromTo(el, { y: 65, opacity: 0.2 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top 75%', end: 'top 15%', scrub: true } }));
      }
    }, root);
    const smooth = reduced ? null : new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, autoRaf: false });
    lenis.current = smooth;
    const tick = time => smooth?.raf(time * 1000);
    const update = () => { sync(); ScrollTrigger.update(); };
    smooth?.on('scroll', update);
    if (smooth) { gsap.ticker.add(tick, false, true); gsap.ticker.lagSmoothing(0); }
    window.addEventListener('scroll', sync, { passive: true });
    document.fonts.ready.then(() => { if (!disposed) { smooth?.resize(); ScrollTrigger.refresh(); } });
    refresh();
    return () => { disposed = true; window.removeEventListener('scroll', sync); gsap.ticker.remove(tick); smooth?.destroy(); lenis.current = null; context.revert(); };
  }, [reduced, mobile]);

  useEffect(() => { if (dialog) lenis.current?.stop(); else lenis.current?.start(); }, [dialog, reduced]);
  useEffect(() => {
    if (reduced || mobile || !cursor.current) return;
    const xTo = gsap.quickTo(cursor.current, 'x', { duration: 0.25, ease: 'power3' }), yTo = gsap.quickTo(cursor.current, 'y', { duration: 0.25, ease: 'power3' });
    const move = e => { xTo(e.clientX); yTo(e.clientY); cursor.current.style.opacity = '1'; cursor.current.dataset.link = Boolean(e.target.closest('a,button')); };
    const leave = () => { cursor.current.style.opacity = '0'; };
    window.addEventListener('pointermove', move); document.addEventListener('pointerleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); xTo.tween.kill(); yTo.tween.kill(); };
  }, [reduced, mobile]);

  const jump = id => { setNavOpen(false); const el = document.getElementById(id); if (lenis.current) lenis.current.scrollTo(el, { duration: 1.5 }); else el?.scrollIntoView({ behavior: 'instant' }); };
  const select = item => { setProduct(item); setDialog('product'); };
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);

  return <div ref={root} className={`daybreak ${reduced ? 'reduced' : ''} ${ready ? 'is-ready' : ''}`}>
    <a className="skip-link" href="#menu">Skip to menu</a>
    <div ref={cursor} className="sun-cursor" aria-hidden="true"><span>✳</span></div>
    <div className="world-backdrop" aria-hidden="true"><div className="sun-glow" /><div className="grain" /></div>
    <header className="site-header"><a className="brand" href="#hello" onClick={e => { e.preventDefault(); jump('hello'); }} aria-label="daybreakcoffeeclub home"><SunLogo /><span>daybreak<small>COFFEE CLUB</small></span></a>
      <nav className={navOpen ? 'navigation open' : 'navigation'} aria-label="Main navigation"><a href="#enter" onClick={e => { e.preventDefault(); jump('enter'); }}>Our story</a><a href="#menu" onClick={e => { e.preventDefault(); jump('menu'); }}>The good stuff</a><a href="#shop" onClick={e => { e.preventDefault(); jump('shop'); }}>Find your happy place</a></nav>
      <div className="header-actions"><button className="bag-button" aria-label={`Your order, ${count} items`} onClick={() => setDialog('bag')}><ShoppingBag size={18} /><span>{count}</span></button><button className="header-cta" onClick={() => jump('menu')}>Find your cup <ArrowUpRight size={16} /></button><button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-expanded={navOpen} aria-label={navOpen ? 'Close navigation' : 'Open navigation'}>{navOpen ? <X /> : <MenuIcon />}</button></div>
    </header>

    <div className="world-stage"><CinematicFilm clock={clock} reduced={reduced} onReady={onReady} />
      {!ready && <div className="colorful-loader" role="status"><span className="loader-sun"><SunLogo /></span><strong>A little sunshine is brewing.</strong><span>Setting the scene for a brighter day</span></div>}
    </div>

    <main>
      <div className="film-scroll-track">
        <section id="hello" className="film-beat" data-scene="0" aria-labelledby="hero-title"><h1 id="hero-title" className="sr-only">daybreakcoffeeclub. A slower morning. A brighter day.</h1><button className="film-start-button" onClick={() => jump('enter')}>Step inside <ArrowDown size={16} /></button></section>
        <section id="enter" className="film-beat" data-scene="1" aria-labelledby="enter-title"><h2 id="enter-title" className="sr-only">Come in. Leave the rush at the door.</h2></section>
        <section id="espresso" className="film-beat" data-scene="2" aria-labelledby="espresso-title"><h2 id="espresso-title" className="sr-only">The morning ritual. Freshly brewed coffee.</h2></section>
        <section id="serve" className="film-beat" data-scene="3" aria-labelledby="serve-title"><h2 id="serve-title" className="sr-only">The finishing touch. A little care, a lovely cup.</h2></section>
      </div>
      <section id="menu" className="story-scene menu-scene" data-scene="4" aria-labelledby="menu-title"><div className="scene-heading"><span className="eyebrow">04 / YOUR NEXT FAVORITE THING</span><h2 id="menu-title">What’s your<br /><span className="purple-word">kind of happy?</span></h2><p>Something warm. Something chilled. A few buttery crumbs.</p></div><div className="menu-content"><div className="menu-filters" role="group" aria-label="Filter menu">{['All', 'Coffee', 'Cold', 'Bakery'].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category === 'All' ? 'A little of everything' : category}</button>)}</div><div className="product-grid">{menu.filter(item => filter === 'All' || item.category === filter).map((item, index) => <ProductCard key={item.id} item={item} index={index} onSelect={select} />)}</div><p className="menu-footnote">Your milk, your way. Oat, dairy & almond options. <span>Illustrative menu · USD</span></p></div></section>
      <section id="shop" className="story-scene shop-scene" data-scene="5" aria-labelledby="shop-title"><div className="shop-photo"><img src="/images/cafe-interior.webp" alt="A sunny café concept with mint counters and warm wooden tables" loading="lazy" /></div><div className="scene-heading"><span className="eyebrow">05 / STAY FOR A WHILE</span><h2 id="shop-title">Your corner<br /><span className="green-word">of sunshine.</span></h2><p>For long chats, short breaks, and one more cup.<br />There’s a little room for everyone.</p></div><div className="shop-details"><div><MapPin size={19} /><span><strong>Our happy place</strong>{shop.address || 'Our first address is coming soon.'}</span></div><div><Clock3 size={19} /><span><strong>Make time for good coffee</strong>{shop.hours || 'Opening hours to be announced.'}</span></div><button className="button forest" onClick={() => setDialog('visit')}>Come say hello <ArrowUpRight size={18} /></button>{shop.mapUrl && <a className="text-link" href={shop.mapUrl} target="_blank" rel="noreferrer">Get directions <MapPin size={14} /></a>}</div></section>
      <section id="finale" className="story-scene finale-scene" data-scene="6" aria-labelledby="finale-title"><div className="scene-heading"><span className="eyebrow"><Sparkles size={15} /> A LITTLE BRIGHTER, TOGETHER</span><h2 id="finale-title">Same world.<br /><span className="coral-word">Brighter day.</span></h2><p>One good cup can change your whole morning.<br />Let’s make yours a little lovely.</p></div><div className="finale-actions"><button className="button coral" onClick={() => jump('menu')}>Find your favorite <ArrowRight size={18} /></button><button className="button outline" onClick={() => jump('shop')}>Visit daybreak <ArrowUpRight size={18} /></button></div><div className="site-signoff"><span>daybreakcoffeeclub</span><span>Good coffee. Better company. ☼</span><button onClick={() => jump('hello')}>A little replay? ↑</button><small>A café concept · Business details coming soon</small></div></section>
    </main>

    <aside className="scene-navigation" aria-label="Journey scenes">{scenes.map((scene, i) => <button key={scene.id} onClick={() => jump(scene.id)} aria-label={`Scene ${i + 1}: ${scene.label}`} aria-current={active === i ? 'step' : undefined}><span>{scene.label}</span><i /></button>)}</aside>
    <footer className="journey-controls"><button className="scroll-label" onClick={() => jump(scenes[Math.min(6, active + 1)].id)}><span className="scroll-pill"><ArrowDown size={13} /></span>{active === 6 ? 'HELLO, BRIGHTER DAY' : 'SCROLL TO EXPLORE'}</button><div className="journey-meter"><span>{String(active + 1).padStart(2, '0')}</span><div><i /></div><span>07</span></div><button className="motion-control" onClick={() => setReduced(!reduced)} aria-pressed={!reduced}><span className={!reduced ? 'enabled' : ''} />Motion {reduced ? 'off' : 'on'}</button></footer>
    <OrderDialog mode={dialog} product={product} close={() => setDialog(null)} bag={bag} setBag={setBag} />
  </div>;
}
