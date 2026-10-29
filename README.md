# NOCTIS — The Light in Total Blackout

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional electric performance car brand.

Mood: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, precise — huge empty space, few words, perfect motion.

## Features
- **Scroll-Scrubbed Canvas Sequences**: Hero driving sequence (598 frames) and exploded architecture dismantle sequence (192 frames) drawn on `<canvas>` with lerp smoothing.
- **Strict Visual Discipline**: Zero gradients, zero glassmorphism, zero blur, zero drop shadows. Built strictly with flat solid colors, 1px hairlines, photography, and typography.
- **Left-Edge Telemetry HUD**: Interactive chapter indicator, speed gauge (`000 → 118 KM/H`), and distance counter (`0.0 → 4.2 KM`).
- **Engineering Statement Reveal**: Opacity-driven word-by-word scroll reveal.
- **Dismantle Callouts**: High-precision 1px hairlines connecting vehicle components (**BODY**, **BATTERY**, **DRIVE**, **LIGHT**) to technical descriptions.
- **Lineup Accordion**: Five models with 80ms debounced hover, 6% slide-in animation, 0.06s staggered text reveal, solid color swatches, and keyboard arrow navigation.
- **Headlight Custom Cursor**: 6px solid xenon dot inside a 28px 1px-stroke ring that morphs into a 44×2px light bar with contextual mono labels.
- **Pure Vanilla Stack**: HTML5, CSS3, vanilla JavaScript. Zero frameworks, zero libraries, zero build steps.

## Tech Stack
- Plain HTML5, CSS3, Vanilla JavaScript (`index.html`, `styles.css`, `main.js`, `config.js`)
- Google Fonts: **Archivo** (variable width 125% expanded), **Inter**, and **JetBrains Mono**
- Optimized WebP frame sequences for desktop (1600px) and mobile (960px)

## Running Locally
Open `index.html` with VS Code Live Server or run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

