# NobleFrame

Premium Digital Atelier — statische Website inkl. OMEGA-OS-Showcase.

**Live:** https://nicozrmn.github.io/NobleFrame/

Jeder Push auf `main` wird automatisch über GitHub Actions auf GitHub Pages
deployt. Details zum Deployment (GitHub Pages & Cloudflare Pages) in
[DEPLOY.md](DEPLOY.md).

## NF·Engine

`nf-engine.js` ist eine eigene, dependency-freie WebGL2-Rendering-Engine:
GPU-Partikel via Transform Feedback (bis 300k), Stable-Fluids-Simulation,
volumetrisches Licht mit God Rays, SDF-Raymarching (3D-Monument mit Gold-PBR
und Soft Shadows), HDR-Post-Processing (Bloom, ACES, Auto-Exposure/Eye-
Adaption, Chromatic Aberration, anamorphotische Flares, Lens Dirt, Film-Gate),
Shockwaves, Gravitationssenke (Klick halten → Entladung mit prozeduralen
Gold-Blitzen), Soft-Body-Seidenbänder (Verlet), Meteore, Kinokamera mit
Scroll-Dolly und Scene-Direction, Per-Letter-Physik, Portal-Transitions und
generativer Audio-Score.
Sie wird auf den Hauptseiten per `<script src="nf-engine.js" defer>` geladen,
regelt ihre Qualität adaptiv (LOW→ULTRA), respektiert
`prefers-reduced-motion` und schaltet sich auf zu schwachen Geräten selbst ab.
Debug/Erzwingen: `?nfq=off|low|med|high|ultra`.
