# daybreakcoffeeclub

A bright photographic coffee-shop concept in Next.js and JavaScript/JSX. The active homepage uses HTML images, GSAP ScrollTrigger and Lenis, with no canvas, WebGL or loaded 3D model.

## Local development

Run `npm install`, `npm run dev`, `npm test`, and `npm run build`.
Open http://localhost:3000. Node 24 was used locally. All source, images and fonts are in the project. No TypeScript build step is required.

## The scroll film

Three generated photographic actions form a reversible 48-frame edit: the cafe door opens, espresso extracts into a coral cup, then a hand serves the finished cup and withdraws.

Scroll selects a decoded image directly. Shot boundaries use cuts, not fades. Small continuous image-scale changes provide camera movement between frame changes. Nothing advances on a timer. Lenis uses GSAP's ticker to keep content and frames synchronized. Touch scrolling keeps native momentum. Reduced motion disables easing and zoom and shows one still per shot.

The active set contains 48 individually regenerated photographs at 1672 x 940 pixels or larger, encoded as WebP without resizing. Original PNGs are saved inside `assets/film-hd`; the website uses `public/images/film-hd`. The previous 412 x 232 contact-sheet extracts remain archived in `public/images/film` and are no longer used by the player. At most eight decoded images are retained by the player, with three concurrent decodes.

Motion limitation: these are individually generated keyframes, not temporally consistent video footage. Compositional differences and stepped motion remain. This is an image-sequence prototype, not seamless 60fps video or a continuous 3D camera journey. High-resolution footage with consistent motion is required for that quality. Update src/lib/film.js and the manifest when replacing the sequence or changing frame count.

## Files

- src/components/CinematicExperience.jsx: centered content, navigation, motion control, menu and local order dialog.
- src/components/journey/FrameSequence.jsx: demand-driven HTML image player, decode cache and bounded background loading.
- src/lib/film.js: reversible edit and shot boundaries.
- src/lib/journey.js: scene labels, sample menu and business configuration.
- src/app/film.css: image treatment and responsive layout.
- assets/film/: original generated contact sheets.
- assets/film-hd/: 48 full-size generated PNG source frames.
- public/images/film-hd/: 48 active WebP frames and their resolution/size manifest.
- scripts/prepare-film-hd.mjs: validates source resolution and encodes the active set. Run `node scripts/prepare-film-hd.mjs` to rebuild it.
- docs/film-prompts.md: built-in image-generation prompts and provenance.
- scripts/prepare-film.mjs: deterministic sheet extraction, border trimming and WebP conversion. Run `node scripts/prepare-film.mjs` to rebuild from saved sheets.

Earlier photographic/Three.js prototypes and the supplied cup model are preserved but not imported by the active page. The homepage does not load those models or Three.js.

## Interactions and launch configuration

The menu has category filters, milk selection, an in-memory bag, quantities and totals. Nothing is sent and no payment service is connected. Sample prices are in USD. Address, hours, map and contact details are unset in the shop configuration; visible copy says coming soon. Fill them with verified business information before launch. Search indexing remains disabled for this concept.

Existing menu photographs are illustrative and reused for some products; they are not exact photos of every listed item. Generated scenery represents a concept cafe, not an existing verified business.

## Verification

`npm test` includes boundary, reverse and reduced-motion checks for the edit and verifies all 48 assets. `npm run build` checks the production build. Browser review separately checks layout, frame advancement and reversal, no canvas, menu interaction, reduced motion and runtime errors. 60fps across devices has not been benchmarked or guaranteed.
