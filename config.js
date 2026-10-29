/**
 * NOCTIS Scrollytelling Configuration
 * All section heights, chapter ranges, frame counts, frame paths, and callout coordinates.
 */

const CONFIG = {
  // Frame sequences
  hero: {
    desktopPath: 'assets/frames/hero/frame_',
    mobilePath: 'assets/frames/hero-mobile/frame_',
    extension: '.webp',
    frameCount: 598,
    padLength: 4,
    wrapperHeight: '600vh',
    // Chapters within hero section (progress 0.0 -> 1.0)
    chapters: [
      {
        id: 'hero-ch1',
        start: 0.0,
        end: 0.12,
        hudChapter: '01/04',
        title: 'NOCTIS',
        subtitle: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT'
      },
      {
        id: 'hero-ch2',
        start: 0.22,
        end: 0.40,
        hudChapter: '02/04',
        headline: "It doesn't need the city's light."
      },
      {
        id: 'hero-ch3',
        start: 0.50,
        end: 0.68,
        hudChapter: '03/04',
        headline: 'It brings its own.'
      },
      {
        id: 'hero-ch4',
        start: 0.80,
        end: 1.00,
        hudChapter: '04/04',
        model: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        ctaText: 'Discover the GT-E',
        ctaHref: '#lineup'
      }
    ],
    // HUD metrics at start and end
    hud: {
      speedStart: 0,
      speedEnd: 118,
      speedUnit: 'KM/H',
      distanceStart: 0.0,
      distanceEnd: 4.2,
      distanceUnit: 'KM'
    },
    // Fade to solid black over the last 5% of scroll (0.95 -> 1.00)
    fadeToBlackStart: 0.95
  },

  dismantle: {
    desktopPath: 'assets/frames/dismantle/frame_',
    mobilePath: 'assets/frames/dismantle-mobile/frame_',
    extension: '.webp',
    frameCount: 192,
    padLength: 4,
    wrapperHeight: '350vh',
    title: 'Look closer.',
    // Callouts appear sequentially after 70% progress (0.70 -> 1.00)
    calloutsStart: 0.70,
    callouts: [
      {
        id: 'callout-body',
        tag: 'BODY',
        desc: 'Carbon composite monocoque',
        startProgress: 0.72,
        // Percentages relative to stage (0 - 100%)
        dotX: 42,
        dotY: 34,
        labelX: 20,
        labelY: 26,
        lineDirection: 'top-left'
      },
      {
        id: 'callout-light',
        tag: 'LIGHT',
        desc: 'Single-line LED signature',
        startProgress: 0.79,
        dotX: 22,
        dotY: 62,
        labelX: 10,
        labelY: 74,
        lineDirection: 'bottom-left'
      },
      {
        id: 'callout-battery',
        tag: 'BATTERY',
        desc: '110 kWh structural pack',
        startProgress: 0.86,
        dotX: 52,
        dotY: 66,
        labelX: 62,
        labelY: 82,
        lineDirection: 'bottom-right'
      },
      {
        id: 'callout-drive',
        tag: 'DRIVE',
        desc: 'Dual axial-flux motors, 680 kW',
        startProgress: 0.93,
        dotX: 78,
        dotY: 58,
        labelX: 80,
        labelY: 42,
        lineDirection: 'top-right'
      }
    ]
  },

  statement: {
    label: '02 — ENGINEERING',
    text: 'Every part was designed to disappear into one line of light.'
  },

  lineup: {
    label: '03 — THE LINEUP',
    title: 'Five ways to drive the night.',
    hoverDebounceMs: 80,
    models: [
      {
        id: 'gt-e',
        num: '01',
        name: 'GT-E',
        subtitle: 'The grand tourer.',
        range: '640 km',
        accel: '3.1 s',
        power: '680 kW',
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe side profile',
        swatches: ['#121418', '#07080A', '#EDEAE4', '#1E232B'],
        defaultSwatch: 0
      },
      {
        id: 's',
        num: '02',
        name: 'S',
        subtitle: 'Four doors, no compromise.',
        range: '600 km',
        accel: '3.6 s',
        power: '520 kW',
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S four-door sport sedan satin bone white side profile',
        swatches: ['#EDEAE4', '#121418', '#2C2F36', '#0E1116'],
        defaultSwatch: 0
      },
      {
        id: 'x',
        num: '03',
        name: 'X',
        subtitle: 'Higher, never heavier.',
        range: '560 km',
        accel: '4.2 s',
        power: '480 kW',
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue coupe roofline electric SUV side profile',
        swatches: ['#0B1B32', '#121418', '#EDEAE4', '#1C2530'],
        defaultSwatch: 0
      },
      {
        id: 'r',
        num: '04',
        name: 'R',
        subtitle: 'Built for the track.',
        range: '420 km',
        accel: '2.4 s',
        power: '900 kW',
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R two-seat track coupe satin black side profile',
        swatches: ['#0A0A0C', '#E1251B', '#222327', '#EDEAE4'],
        defaultSwatch: 0
      },
      {
        id: 'one',
        num: '05',
        name: 'ONE',
        subtitle: 'The future, early.',
        range: 'Concept',
        accel: 'Sub 2.0 s',
        power: '1200 kW',
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE concept hypercar liquid silver side profile',
        swatches: ['#CFE3FF', '#8A8F98', '#121418', '#07080A'],
        defaultSwatch: 0
      }
    ]
  },

  reserve: {
    title: 'Drive the night.',
    body: 'Production strictly limited. Allocation opens at midnight.',
    buttonText: 'RESERVE YOUR NOCTIS'
  },

  preloader: {
    initialHeroFrameCount: 40
  }
};

window.CONFIG = CONFIG;
