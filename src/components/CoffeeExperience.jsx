'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Coffee, Leaf, Menu, Minus, Plus, RotateCcw, Sparkles, Sun, Waves, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { chapters, drinks } from '@/lib/brew';
import { getStoryProgress } from '@/lib/photo-story';
import PhotoJourney from './PhotoJourney';
function SunMark({ className = '' }) {
    return <svg className={className} viewBox="0 0 48 40" fill="none" aria-hidden="true"><path d="M11 29a13 13 0 0 1 26 0M7 35h34M24 3v6M7 11l5 5M41 11l-5 5M2 26h6M40 26h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
}
function Stamp() {
    return <div className="sun-stamp" aria-hidden="true"><span>A LITTLE CUP OF</span><SunMark /><strong>good energy</strong><span>BREWED WITH CARE</span></div>;
}
function MenuDialog({ open, close }) {
    const dialog = useRef(null);
    const [filter, setFilter] = useState('All');
    useEffect(() => {
        if (open)
            dialog.current?.showModal();
        else
            dialog.current?.close();
        if (!open)
            return;
        const old = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = old; };
    }, [open]);
    return <dialog ref={dialog} className="menu-dialog" data-lenis-prevent onCancel={close} onClick={e => { if (e.target === dialog.current)
        close(); }} aria-labelledby="menu-title">
    <div className="menu-sheet">
      <div className="menu-top"><span className="eyebrow"><Sun size={15}/> THE GOOD STUFF</span><button className="icon-button" onClick={close} aria-label="Close menu"><X /></button></div>
      <h2 id="menu-title">Find your <em>usual.</em></h2>
      <p>Something warm. Something fresh. Something just for you.</p>
      <div className="menu-filters" aria-label="Filter menu">{['All', 'Coffee', 'Cold', 'Other', 'Bakery'].map(f => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>)}</div>
      <div className="menu-items">{drinks.filter(d => filter === 'All' || d.category === filter).map(d => <article key={d.name} className="menu-item"><div><small>{d.note}</small><h3>{d.name}</h3><p>{d.description}</p></div><span>${d.price}</span></article>)}</div>
      <div className="menu-disclaimer"><Leaf size={16}/><span>Oat & almond options available in this concept menu. Illustrative prices in USD; confirm ingredients and allergens with the café before ordering.</span></div>
      <p className="concept-note">Daybreak is a café concept. Menu and prices are sample content.</p>
    </div>
  </dialog>;
}
function Chapter({ index, children, className = '' }) {
    const item = chapters[index];
    return <section id={item.id} className={`chapter chapter-${index} ${className}`} aria-labelledby={`title-${index}`} data-chapter={index}>
    <div className="chapter-content"><div className="section-kicker"><span>{String(index + 1).padStart(2, '0')} / 12</span><i /><span>{item.short}</span></div>{children}</div>
  </section>;
}
export default function CoffeeExperience() {
    const root = useRef(null);
    const clock = useRef({ progress: 0 });
    const smoothScroll = useRef(null);
    const progressLine = useRef(null);
    const [active, setActive] = useState(0);
    const [ready, setReady] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [milk, setMilk] = useState('Oat');
    const [faq, setFaq] = useState(null);
    const markReady = useCallback(() => setReady(true), []);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        const update = () => setReduced(query.matches);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        let syncScroll = () => { };
        let disposed = false;
        const context = gsap.context(() => {
            const state = { value: 0 };
            let lastProgress = -1;
            const colors = chapters.slice(0, -1).map((chapter, i) => gsap.utils.interpolate(chapter.color, chapters[i + 1].color));
            let offsets = [...document.querySelectorAll('.chapter')].map(el => el.offsetTop);
            const render = () => {
                const p = state.value;
                if (p === lastProgress)
                    return;
                lastProgress = p;
                clock.current.progress = p;
                window.dispatchEvent(new Event('daybreak:progress'));
                const i = Math.min(10, Math.floor(p));
                const current = Math.min(11, Math.floor(p + 0.35));
                setActive(previous => previous === current ? previous : current);
                if (progressLine.current)
                    progressLine.current.style.transform = `scaleX(${p / 11})`;
                if (root.current) {
                    const color = colors[i](p - i);
                    root.current.style.backgroundColor = color;
                    root.current.style.setProperty('--scene-color', color);
                    root.current.dataset.progress = p.toFixed(3);
                }
            };
            const sync = () => {
                state.value = getStoryProgress(window.scrollY, offsets);
                render();
            };
            syncScroll = sync;
            ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: sync, onRefresh: () => {
                    offsets = [...document.querySelectorAll('.chapter')].map(el => el.offsetTop);
                    state.value = getStoryProgress(window.scrollY, offsets);
                    render();
                } });
        }, root);
        // One animation clock drives wheel easing, chapter reveals, and the photo scene.
        // Touch keeps the browser's own momentum; reduced motion uses native scrolling.
        const lenis = reduced ? null : new Lenis({
            lerp: 0.085,
            smoothWheel: true,
            syncTouch: false,
            wheelMultiplier: 0.85,
            anchors: true,
            autoRaf: false,
        });
        smoothScroll.current = lenis;
        const update = () => { syncScroll(); ScrollTrigger.update(); };
        const tick = (time) => lenis?.raf(time * 1000);
        if (lenis) {
            lenis.on('scroll', update);
            gsap.ticker.add(tick, false, true);
            gsap.ticker.lagSmoothing(0);
        }
        const refresh = () => { if (!disposed) {
            lenis?.resize();
            ScrollTrigger.refresh();
        } };
        document.fonts.ready.then(refresh);
        // Keep image state exact even when a background tab throttles GSAP's ticker.
        window.addEventListener('scroll', syncScroll, { passive: true });
        return () => {
            disposed = true;
            window.removeEventListener('scroll', syncScroll);
            gsap.ticker.remove(tick);
            lenis?.destroy();
            smoothScroll.current = null;
            context.revert();
        };
    }, [reduced]);
    useEffect(() => {
        if (menuOpen)
            smoothScroll.current?.stop();
        else
            smoothScroll.current?.start();
    }, [menuOpen, reduced]);
    const jump = (id) => {
        setNavOpen(false);
        const target = document.getElementById(id);
        if (!target)
            return;
        if (smoothScroll.current)
            smoothScroll.current.scrollTo(target, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 3) });
        else
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    return <div ref={root} className={`experience photographic photofilm${reduced ? ' reduced-motion' : ''}`}>
    <a className="skip-link" href="#menu">Skip to the menu</a>
    <header className="site-header">
      <a href="#hello" className="brand" aria-label="Daybreak Coffee Club home" onClick={e => { e.preventDefault(); jump('hello'); }}><SunMark /><span>daybreak<small>COFFEE CLUB</small></span></a>
      <nav className={navOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        <a href="#beans" onClick={e => { e.preventDefault(); jump('beans'); }}>The journey</a>
        <button onClick={() => { setNavOpen(false); setMenuOpen(true); }}>Our menu</button>
        <a href="#ritual" onClick={e => { e.preventDefault(); jump('ritual'); }}>Our little world</a>
      </nav>
      <a href="#visit" className="header-visit" onClick={e => { e.preventDefault(); jump('visit'); }}>Come say hello <ArrowUpRight size={16}/></a>
      <button className="mobile-toggle icon-button" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X /> : <Menu />}</button>
    </header>

    <div className="scene-stage" aria-label="Scroll-controlled coffee preparation">
      <PhotoJourney clock={clock} reduced={reduced} onReady={markReady}/>
      <div className="photo-wash"/>
      <div className={`scene-loading${ready ? ' loaded' : ''}`} aria-hidden={ready}><Coffee size={24}/><span>Warming up the coffee bar…</span></div>
      <div className="scene-caption"><span className="live-dot"/><span>{reduced ? 'A moment of stillness' : chapters[active].step}</span><span className="scene-caption-right">BEAN TO HAPPY</span></div>
      {active === 0 && <Stamp />}
    </div>

    <aside className="chapter-rail" aria-label="Jump to a chapter">{chapters.map((c, i) => <button key={c.id} className={active === i ? 'active' : ''} aria-label={`Chapter ${i + 1}: ${c.name}`} aria-current={active === i ? 'step' : undefined} onClick={() => jump(c.id)}><span>{c.short}</span><i /></button>)}</aside>

    <main>
      <Chapter index={0} className="hero">
        <div className="eyebrow"><span className="little-spark">✳</span> GOOD COFFEE. BETTER DAYS.</div>
        <h1 id="title-0">A little<br />{' '}<em>brighter.</em></h1>
        <p className="hero-description">Great days start with good coffee.<br />{' '}Take a trip around our coffee bar. We’re making yours.</p>
        <div className="hero-actions"><button className="button button-rust" onClick={() => jump('beans')}>Let’s make a coffee <ArrowDown size={18}/></button><button className="text-link" onClick={() => setMenuOpen(true)}>Explore the menu <ArrowUpRight size={16}/></button></div>
        <div className="hero-footnote"><span className="mini-sun">☼</span><span>A slower morning.<br />{' '}<strong>A better kind of buzz.</strong></span><span className="handwritten">made for your everyday ↗</span></div>
      </Chapter>

      <Chapter index={1}>
        <div className="eyebrow"><Leaf size={15}/> SMALL BEAN. BIG PERSONALITY.</div>
        <h2 id="title-1">Good things<br />{' '}start <em>small.</em></h2>
        <p>Before the first sip, there’s a tiny bean with a whole lot to give. Sweetness, warmth, and a little surprise.</p>
        <div className="flavor-notes"><span>Cocoa</span><span>Caramel</span><span>A little citrus</span></div>
        <div className="editorial-note"><span>01</span><p>The beginning of something good.<br />{' '}<strong>Whole beans. Full of possibility.</strong></p></div>
      </Chapter>

      <Chapter index={2}>
        <div className="eyebrow"><Sparkles size={15}/> FRESHLY GROUND, JUST FOR YOU</div>
        <h2 id="title-2">You can almost<br />{' '}<em>smell it.</em></h2>
        <p>That first little burst of aroma? That’s your morning waking up. We grind the beans just before the brew.</p>
        <div className="process-note"><span className="sound-bars"><i /><i /><i /><i /><i /></span><div><strong>A moment worth slowing down for.</strong><span>Scroll a little. Watch the grounds fall.</span></div></div>
      </Chapter>

      <Chapter index={3}>
        <div className="eyebrow">A SMALL RITUAL OF CARE</div>
        <h2 id="title-3">A little care.<br />{' '}<em>In every cup.</em></h2>
        <p>Evenly settled. Gently leveled. Firmly tamped. Small details make room for a beautifully balanced espresso.</p>
        <div className="three-steps"><div><span>01</span><strong>Distribute</strong></div><ArrowRight size={16}/><div><span>02</span><strong>Level</strong></div><ArrowRight size={16}/><div><span>03</span><strong>Tamp</strong></div></div>
        <span className="handwritten standalone">good things take a little care.</span>
      </Chapter>

      <Chapter index={4}>
        <div className="eyebrow">THE HEART OF OUR COFFEE BAR</div>
        <h2 id="title-4">A match made<br />{' '}in <em>coffee.</em></h2>
        <p>The portafilter locks into place. Warm water meets freshly ground coffee. Our favorite part is just about to begin.</p>
        <div className="machine-ticket"><SunMark /><div><small>THE DAYBREAK WAY</small><strong>Thoughtfully prepared.<br />{' '}Happily shared.</strong></div></div>
      </Chapter>

      <Chapter index={5}>
        <div className="eyebrow">MAKE A LITTLE ROOM IN YOUR DAY</div>
        <h2 id="title-5">Your morning.<br />{' '}<em>Your moment.</em></h2>
        <p>A catch-up with a friend. A chapter of your book. Five lovely minutes with absolutely nowhere to be.</p>
        <div className="photo-note"><Image src="/images/cafe-interior.webp" alt="Sunlight fills a colorful café with pistachio counters and coral stools" width={600} height={400}/><span>A little corner of happy. <Sun size={14}/></span></div>
      </Chapter>

      <Chapter index={6}>
        <div className="eyebrow"><Sun size={15}/> HERE COMES THE GOOD PART</div>
        <h2 id="title-6">Liquid<br />{' '}<em>sunshine.</em></h2>
        <p>First a drop. Then a golden stream. Rich espresso gathers beneath a delicate layer of crema.</p>
        <div className="espresso-word">Oh,<span>that’s good.</span><svg viewBox="0 0 190 30" aria-hidden="true"><path d="M3 16Q95-3 185 12M18 25Q105 7 163 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></div>
      </Chapter>

      <Chapter index={7}>
        <div className="eyebrow">THERE’S A CUP WITH YOUR NAME ON IT</div>
        <h2 id="title-7">Find your<br />{' '}kind of <em>happy.</em></h2>
        <div className="mini-menu">{drinks.slice(0, 3).map((d, i) => <button key={d.name} onClick={() => setMenuOpen(true)}><span className={`drink-dot drink-dot-${i}`}><Coffee size={20}/></span><span><strong>{d.name}</strong><small>{i === 0 ? 'Our signature, your new usual' : d.description}</small></span><ArrowUpRight size={19}/></button>)}</div>
        <button className="text-link" onClick={() => setMenuOpen(true)}>See the whole menu <ArrowRight size={17}/></button>
      </Chapter>

      <Chapter index={8}>
        <div className="eyebrow"><Waves size={16}/> MAKE IT YOURS</div>
        <h2 id="title-8">A softer<br />{' '}side of <em>coffee.</em></h2>
        <p>A little steam turns milk into silky microfoam. Choose your favorite for your Daybreak latte.</p>
        <div className="milk-options" role="group" aria-label="Choose your latte milk">{['Oat', 'Dairy', 'Almond'].map(m => <button key={m} onClick={() => setMilk(m)} aria-pressed={milk === m}>{milk === m ? <Check size={16}/> : <Plus size={16}/>}{m}</button>)}</div>
        <p className="selection-note" aria-live="polite">Your cup, with {milk.toLowerCase()} milk.</p>
      </Chapter>

      <Chapter index={9}>
        <div className="eyebrow">THE DAYBREAK SIGNATURE</div>
        <h2 id="title-9">A little love<br />{' '}<em>on top.</em></h2>
        <p>Espresso and silky {milk.toLowerCase()} milk, coming together in one lovely pour. Finished with a flourish. Always with care.</p>
        <div className="signature-card"><span className="little-spark">✳</span><div><small>MEET YOUR NEW USUAL</small><strong>The Daybreak Latte</strong><span>Warm. Balanced. A bright little ritual.</span></div></div>
        <button className="text-link" onClick={() => setMenuOpen(true)}>Meet the rest of the menu <ArrowUpRight size={16}/></button>
      </Chapter>

      <Chapter index={10}>
        <div className="eyebrow">SOME THINGS JUST BELONG TOGETHER</div>
        <h2 id="title-10">Coffee’s<br />{' '}better with <em>company.</em></h2>
        <p>Something buttery. Something warm. Something to leave a few happy crumbs on the table.</p>
        <div className="pairing-photo"><Image src="/images/journey/serve.webp" alt="A freshly made latte with a golden croissant" width={480} height={320}/><span>A little taste of your morning.</span></div>
        <div className="pairing-list"><button onClick={() => setMenuOpen(true)}><span>01</span><strong>Golden butter croissant</strong><ArrowUpRight size={17}/></button><button onClick={() => setMenuOpen(true)}><span>02</span><strong>Cinnamon morning bun</strong><ArrowUpRight size={17}/></button></div>
        <span className="handwritten standalone">save a little room for the good stuff.</span>
      </Chapter>

      <Chapter index={11} className="final-chapter">
        <div className="eyebrow"><Sun size={16}/> YOU’VE ARRIVED</div>
        <h2 id="title-11">Stay for<br />{' '}<em>a while.</em></h2>
        <p>Your coffee is ready. Pull up a chair.<br />{' '}There’s always room for a brighter day.</p>
        <div className="visit-note"><span className="live-dot"/><div><strong>A little café. A fresh beginning.</strong><span>Our first address & opening hours are coming soon.</span></div></div>
        <div className="visit-questions">{[{ q: 'What is Daybreak?', a: 'A colorful coffee-shop concept built around the joy of the everyday. This preview uses an illustrative menu and café imagery.' }, { q: 'Can I visit or place an order?', a: 'Not yet. The café location and ordering service are not available. For now, explore the menu and make yourself another virtual coffee.' }].map((item, i) => <div key={item.q}><button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} aria-controls={`faq-${i}`}>{item.q}{faq === i ? <Minus size={16}/> : <Plus size={16}/>}</button><p id={`faq-${i}`} hidden={faq !== i}>{item.a}</p></div>)}</div>
        <div className="final-actions"><button className="button button-rust" onClick={() => setMenuOpen(true)}>Find your favorite <ArrowUpRight size={17}/></button><button className="text-link" onClick={() => jump('hello')}><RotateCcw size={15}/> Brew it again</button></div>
        <div className="end-brand">daybreak<span>GOOD COFFEE. BETTER DAYS.</span></div>
      </Chapter>
    </main>

    <footer className="journey-bar">
      <button className="scroll-cue" onClick={() => jump(chapters[Math.min(11, active + 1)].id)}><span className="scroll-mouse"><i /></span><span>{active === 11 ? 'A little brighter, together' : 'SCROLL TO BREW'}</span><ChevronDown size={14}/></button>
      <div className="journey-progress"><span>{String(active + 1).padStart(2, '0')}</span><div className="progress-track"><div ref={progressLine}/></div><span>12</span></div>
      <button className="motion-toggle" onClick={() => setReduced(!reduced)} aria-pressed={reduced}><span className={reduced ? '' : 'motion-active'}/>{reduced ? 'Motion off' : 'Motion on'}</button>
    </footer>
    <MenuDialog open={menuOpen} close={() => setMenuOpen(false)}/>
  </div>;
}
