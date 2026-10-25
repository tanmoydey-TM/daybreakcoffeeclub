# Generated artwork

All artwork was created with the built-in image-generation tool on 2026-10-25. The images are fictional café imagery, not photographs of a real operating business. No third-party template artwork is used.

## Café interior

Final file: `public/images/cafe-interior.webp`; original `public/images/cafe-interior.png`.

Prompt: A single high-quality, wide 3:2 editorial photograph of a sunny contemporary neighborhood coffee shop with butter-yellow walls, pale pistachio-green espresso bar, coral stools, light oak tables, a sky-blue latte cup and flaky croissant on the foreground table. Large windows, morning sunlight, natural shadows, green plants, analog warmth, realistic material detail. No people, logos, text, watermark or collage.

## Coffee journey

Shared direction: one photoreal editorial image per file, landscape 3:2. A consistent bright café with butter-yellow walls, pistachio-green retro espresso machine, brushed steel details, pale-blue tiles, honey-oak counter, coral cup and cream saucer. Warm daylight, natural textures, soft shadows. Main action on the right; quieter defocused environment on the left for text. No lettering, watermarks or collage.

| Source PNG in assets/source | Scene prompt |
| --- | --- |
| hero.png | Wide three-quarter view of the whole pistachio espresso machine and adjacent ivory grinder, empty coral cup and saucer, a few beans and a plant by a sunny window. Machine fully visible; no people. |
| grind.png | Fresh grounds falling from an ivory grinder into a steel portafilter with a walnut handle held by a barista. Beans visible in the hopper, grounds frozen in mid-fall, pistachio machine softly behind. |
| tamp.png | Barista pressing a walnut-handled steel tamper straight down into a filled portafilter resting securely on a rubber tamping mat. Focus on level tamp and fine grounds, machine softly blurred. |
| espresso.png | Two thin caramel espresso streams from a locked-in double-spout portafilter into a coral cup on the drip tray. Crema visible, rich liquid detail, macro photography. |
| steam.png | Barista holding a stainless milk pitcher at the steam wand. Tip below milk surface, gentle vapor, silky milk whirlpool; coral espresso cup nearby. |
| pour.png | Barista pouring a continuous fine milk stream from a steel pitcher into the coral cup, with white rosetta art forming. Machine and tiles softly behind. |
| serve.png | Finished coral latte with white rosetta, cream saucer and flaky croissant on pistachio plate, on an oak table by a sunny window. Warm café blurred in the background. |

Each source has a desktop WebP at up to 1536px wide and a mobile WebP at 768px. `scripts/prepare-assets.mjs` performs resizing and compression only.

## Depth maps

`hero-depth.png` references `hero.png`; `serve-depth.png` references `serve.png`.

Edit prompt: Convert this exact image to a smooth grayscale relative depth map for WebGL parallax. Preserve registration, framing, aspect ratio, composition and object silhouettes. Remove colors and texture detail. Near foreground is light gray/white, middle ground is medium-light gray, distant café and windows are dark gray/black. Use coherent depth gradients and smooth surfaces. No outlines, text or labels. Full bleed grayscale map matching the reference.

Depth maps are AI-estimated artistic depth, not calibrated geometry. Parallax displacement is kept small to avoid distorting edges. Other scenes use photographic zoom and panning without an inferred depth map.
