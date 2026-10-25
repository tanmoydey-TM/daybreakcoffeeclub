# Daybreak Coffee Club

A colorful, twelve-chapter coffee-shop website built with Next.js, React, Three.js / React Three Fiber, and GSAP ScrollTrigger. All source files and final artwork live in this project folder.

## Run locally

Requires Node.js 20.9+ (tested with Node 24).

```sh
npm install
npm run dev
```

Open http://localhost:3000. For an optimized version, use `npm run build` followed by `npm start`.

## The visual experience

The primary page uses seven original AI-generated photographic coffee scenes, two generated depth maps, and twelve distinct camera compositions. GSAP maps each real section position to a reversible timeline. Three.js samples the photos and depth maps in a custom shader to produce restrained depth parallax, scroll-controlled zooming, pointer movement, and soft transitions.

This is **photo-based 2.5D scrollytelling**, not video footage or a physically simulated fluid sequence. Individual photographs show key brewing moments; zoom, depth and transitions animate between them. It does not generate intermediate video frames of hands or liquid moving. The earlier procedural full-3D renderer is retained in `src/components/CoffeeScene.tsx` as a reusable alternative, but the requested photographic treatment is the active homepage.

The canvas renders on demand while scroll/pointer state changes. Local WebP photos, mobile variants, and bundled fonts avoid remote runtime asset dependencies. An HTML photograph remains visible if WebGL fails. The Motion control disables parallax and smooth transitions; system reduced-motion preference is respected.

## Included interactions

- Twelve scroll chapters, chapter navigation, progress indicator, and replay.
- Native accessible menu dialog, category filters, Escape dismissal, and modal focus management.
- Oat/dairy/almond selection carried through the latte description. The photographs themselves are not regenerated when milk changes.
- Responsive navigation, disclosure questions, and reduced-motion control.

## Customize

- `src/components/CoffeeExperience.tsx`: name, copy, menu interface, chapter content, café information.
- `src/lib/brew.ts`: chapter names, colors, example menu items/prices, procedural brewing timeline.
- `src/lib/photo-story.ts`: image mapping, framing, zoom, and section-position mapping.
- `src/components/PhotoScene.tsx`: depth shader and texture loading.
- `src/app/globals.css`: typography, color treatment, layouts and responsive styles.
- `src/app/layout.tsx`: title, description and icons. Search indexing is intentionally disabled for this concept; replace business details before removing `robots: { index: false, follow: false }`.

Daybreak is a fictional concept name. Menu prices are illustrative USD. No real location, opening hours, booking, ordering, email submission or payment service is connected. No testimonials or customer claims are fabricated.

## Assets

Original generated PNGs: `assets/source/`.
Web-ready desktop/mobile images and depth maps: `public/images/journey/`.
Supporting café photograph: `public/images/cafe-interior.webp` (source PNG beside it).
Generation prompts and asset lineage: `docs/asset-prompts.md`.

Regenerate optimized files after changing source PNGs:

```sh
npm run assets
```

This uses Sharp, supplied by the Next.js installation. Image sources and generation history remain local. The source images are intentionally outside `public/` to avoid downloading production-sized PNGs in the website.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

Tests cover variable-height chapter alignment, photo timeline bounds, reverse scrolling determinism, brewing order, and final process completion. Browser checks cover responsive framing and user interactions. Windows sandbox policies may require permission to launch Next.js/test worker processes.

Built locally; no Git commits, pushes, or deployment have been performed.
