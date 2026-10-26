# Cinematic rebuild — 26 October 2026

## Reference observations

- https://youtube.com/shorts/giioVGL4Hss — coffee demonstration by @codingwithmoji. Full-bleed brewing imagery, small centered type, several close camera positions. Observed water meeting grounds and espresso pouring into a glass.
- https://youtube.com/shorts/Gjhb-jiVqZY — @democode's WebGL example. A car is revealed beneath a cloth; the scene uses perspective and a moving viewpoint. Its dark theme is not carried into this project.
- https://youtube.com/shorts/VwFlsB1dqRw — @WebLoved's scroll-driven example. Stacked photographic planes create visible depth and movement through the composition.

The site uses photographic door planes with CSS perspective, a forward camera move, continuous native video seeking, restrained centered captions, and a separate pastel menu/shop. No canvas, WebGL, or procedural coffee model is active. The entrance is a composited photographic effect; the films are separate editorial shots, not footage recorded inside the generated cafe.

## Active footage

- Espresso: Nathan Baldwin, https://www.pexels.com/video/a-machine-pouring-coffee-in-a-cup-9399042/ — original 1920x1080, 50fps. Saved as assets/footage/extraction.mp4.
- Latte art: Kampus Production, https://www.pexels.com/video/a-person-making-a-latte-art-6683383/ — original 3840x2160, 25fps. Saved as assets/footage/latte-art.mp4.
- License: https://www.pexels.com/license/ — permits free website use and modification. No endorsement is implied. Sources checked 26 October 2026.

Prepared as silent, 1600x900, all-intra H.264 with faststart. Every frame is a keyframe so reverse/random seeks do not need a long GOP decode. The browser only loads the films near their scroll positions; reduced motion uses still posters. Reproduce with `node scripts/prepare-cinema.mjs`.

The generated entrance and cafe interior from the existing project are reused. The old 48 generated frames are archived, not used as the active scroll movie. Earlier trial footage preparation.mp4 (Taryn Elliott / Pexels 3772015) and latte.mp4 (Rachel Claire / Pexels 8855727) is retained under assets/footage for provenance but not shipped to the browser.
