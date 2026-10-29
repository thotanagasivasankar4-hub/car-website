/**
 * NOCTIS — Main Scrollytelling Engine
 * Pure Vanilla JavaScript. Zero libraries. Zero frameworks.
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
    // Hide preloader immediately for reduced motion
    setTimeout(() => {
      document.body.classList.add('is-loaded');
      document.body.classList.remove('is-loading');
      // Draw first frame of hero and dismantle
      loadSingleFrame(getFrameUrl(heroPath, 1, CONFIG.hero.padLength)).then(img => {
        if (img && heroCtx && heroCanvas) drawScrollyFrame(heroCtx, heroCanvas, img);
      });
      loadSingleFrame(getFrameUrl(dismantlePath, 1, CONFIG.dismantle.padLength)).then(img => {
        if (img && dismantleCtx && dismantleCanvas) drawScrollyFrame(dismantleCtx, dismantleCanvas, img);
      });
    }, 50);
  }

  /* ==========================================================================
     1. FILM GRAIN OVERLAY (Offscreen Noise Tile Shifted ~8 times/sec)
     ========================================================================== */
  const grainCanvas = document.getElementById('grain-canvas');
  if (grainCanvas && !prefersReducedMotion) {
    const grainCtx = grainCanvas.getContext('2d');
    const tileSize = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(tileSize, tileSize);
    const buffer32 = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer32.length; i++) {
      const val = (Math.random() * 255) | 0;
      buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    offCtx.putImageData(imgData, 0, 0);

    function resizeGrain() {
      grainCanvas.width = window.innerWidth;
      grainCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGrain);
    resizeGrain();

    let lastGrainTime = 0;
    function drawGrain(timestamp) {
      if (timestamp - lastGrainTime > 125) { // ~8 FPS
        lastGrainTime = timestamp;
        grainCtx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
        const shiftX = (Math.random() * tileSize) | 0;
        const shiftY = (Math.random() * tileSize) | 0;

        for (let x = -shiftX; x < grainCanvas.width; x += tileSize) {
          for (let y = -shiftY; y < grainCanvas.height; y += tileSize) {
            grainCtx.drawImage(offscreen, x, y);
          }
        }
      }
      requestAnimationFrame(drawGrain);
    }
    requestAnimationFrame(drawGrain);
  }

  /* ==========================================================================
     2. CUSTOM CURSOR ("THE HEADLIGHT")
     ========================================================================== */
  const cursorEl = document.getElementById('cursor');
  const cursorLabel = cursorEl ? cursorEl.querySelector('.cursor-label') : null;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorEl && isFinePointer && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      cursorEl.classList.add('is-pressed');
      setTimeout(() => {
        cursorEl.classList.remove('is-pressed');
      }, 120);
    });

    function updateCursor() {
      // Lerp 0.18
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    function handleCursorHover(e) {
      const target = e.target.closest('a, button, [role="button"], [data-cursor]');
      if (!target) {
        cursorEl.classList.remove('is-hovering');
        return;
      }

      cursorEl.classList.add('is-hovering');
      let label = target.getAttribute('data-cursor');
      if (!label) {
        if (target.tagName === 'A') label = 'VIEW';
        else if (target.tagName === 'BUTTON') label = 'SELECT';
        else label = 'OPEN';
      }
      if (cursorLabel) cursorLabel.textContent = label;
    }

    document.addEventListener('mouseover', handleCursorHover);
  }

  /* ==========================================================================
     3. FRAME PRELOADER & IMAGE CACHE
     ========================================================================== */
  const isMobile = window.innerWidth < 768;
  const heroPath = isMobile ? CONFIG.hero.mobilePath : CONFIG.hero.desktopPath;
  const dismantlePath = isMobile ? CONFIG.dismantle.mobilePath : CONFIG.dismantle.desktopPath;

  const heroFrames = [];
  const dismantleFrames = [];

  function getFrameUrl(basePath, index, padLength) {
    const numStr = String(index).padStart(padLength, '0');
    return `${basePath}${numStr}${CONFIG.hero.extension}`;
  }

  const preloaderEl = document.getElementById('preloader');
  const preloaderLine = document.getElementById('preloader-line');
  const preloaderCounter = document.getElementById('preloader-counter');

  let initialLoadedCount = 0;
  const initialTarget = Math.min(CONFIG.preloader.initialHeroFrameCount, CONFIG.hero.frameCount);

  function loadSingleFrame(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      if ('decode' in img) {
        img.decode()
          .then(() => resolve(img))
          .catch(() => {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          });
      } else {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      }
    });
  }

  async function preloadInitialBatch() {
    for (let i = 1; i <= initialTarget; i++) {
      const url = getFrameUrl(heroPath, i, CONFIG.hero.padLength);
      const img = await loadSingleFrame(url);
      heroFrames[i - 1] = img;
      initialLoadedCount++;

      const progress = initialLoadedCount / initialTarget;
      if (preloaderLine) preloaderLine.style.transform = `scaleX(${progress})`;
      if (preloaderCounter) {
        const pct = Math.round(progress * 100);
        preloaderCounter.textContent = `${String(pct).padStart(3, '0')}%`;
      }
    }

    if (preloaderLine) preloaderLine.classList.add('flash');
    setTimeout(() => {
      document.body.classList.add('is-loaded');
      document.body.classList.remove('is-loading');

      // Draw initial frame immediately
      if (heroFrames[0] && heroCtx && heroCanvas) {
        drawScrollyFrame(heroCtx, heroCanvas, heroFrames[0]);
      }

      loadRemainingFrames();
    }, 150);
  }

  async function loadRemainingFrames() {
    for (let i = initialTarget + 1; i <= CONFIG.hero.frameCount; i++) {
      const url = getFrameUrl(heroPath, i, CONFIG.hero.padLength);
      const img = await loadSingleFrame(url);
      heroFrames[i - 1] = img;
    }

    for (let i = 1; i <= CONFIG.dismantle.frameCount; i++) {
      const url = getFrameUrl(dismantlePath, i, CONFIG.dismantle.padLength);
      const img = await loadSingleFrame(url);
      dismantleFrames[i - 1] = img;
    }
  }

  preloadInitialBatch();

  /* ==========================================================================
     4. NAVIGATION SCROLL HIDE/SHOW
     ========================================================================== */
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 100 && currentScrollY > lastScrollY) {
      siteHeader.classList.add('is-hidden');
    } else {
      siteHeader.classList.remove('is-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  /* ==========================================================================
     5. HERO & DISMANTLE CANVASES
     ========================================================================== */
  const heroWrapper = document.getElementById('hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
  const heroProgressBar = document.getElementById('hero-progress-bar');
  const heroBlackout = document.getElementById('hero-blackout');

  const hudChapterVal = document.getElementById('hud-chapter-val');
  const hudSpeedVal = document.getElementById('hud-speed-val');
  const hudDistVal = document.getElementById('hud-dist-val');

  const chapterEls = [
    document.getElementById('hero-ch1'),
    document.getElementById('hero-ch2'),
    document.getElementById('hero-ch3'),
    document.getElementById('hero-ch4')
  ];

  let heroTargetFrame = 0;
  let heroCurrentFrame = 0;
  let lastDrawnHeroIndex = -1;

  const dismantleWrapper = document.getElementById('dismantle');
  const dismantleCanvas = document.getElementById('dismantle-canvas');
  const dismantleCtx = dismantleCanvas ? dismantleCanvas.getContext('2d') : null;
  const dismantleProgressBar = document.getElementById('dismantle-progress-bar');

  let dismantleTargetFrame = 0;
  let dismantleCurrentFrame = 0;
  let lastDrawnDismantleIndex = -1;

  function resizeCanvas(canvas, ctx) {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function handleResize() {
    if (heroCanvas && heroCtx) {
      resizeCanvas(heroCanvas, heroCtx);
      lastDrawnHeroIndex = -1;
    }
    if (dismantleCanvas && dismantleCtx) {
      resizeCanvas(dismantleCanvas, dismantleCtx);
      lastDrawnDismantleIndex = -1;
    }
    updateCalloutLines();
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  function drawScrollyFrame(ctx, canvas, img) {
    if (!ctx || !canvas || !img) return;
    const cw = canvas.getBoundingClientRect().width;
    const ch = canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const isPortrait = ch > cw;

    if (!isPortrait) {
      // Landscape: Cover fit
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // Portrait: Contain fit, vertically centred on --asphalt, car never cropped
      const scale = Math.min(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }
  }

  function getNearestLoadedFrame(framesArray, targetIdx) {
    if (framesArray[targetIdx]) return framesArray[targetIdx];
    for (let offset = 1; offset < framesArray.length; offset++) {
      if (targetIdx - offset >= 0 && framesArray[targetIdx - offset]) {
        return framesArray[targetIdx - offset];
      }
      if (targetIdx + offset < framesArray.length && framesArray[targetIdx + offset]) {
        return framesArray[targetIdx + offset];
      }
    }
    return null;
  }

  /* ==========================================================================
     6. DISMANTLE CALLOUT SVG LINES
     ========================================================================== */
  function updateCalloutLines() {
    const stage = document.querySelector('.dismantle-stage');
    if (!stage) return;
    const stageW = stage.offsetWidth;
    const stageH = stage.offsetHeight;

    CONFIG.dismantle.callouts.forEach(cfg => {
      const itemEl = document.getElementById(cfg.id);
      if (!itemEl) return;
      const lineEl = itemEl.querySelector('.callout-line');
      if (!lineEl) return;

      const dotX = (cfg.dotX / 100) * stageW;
      const dotY = (cfg.dotY / 100) * stageH;
      const cardEl = itemEl.querySelector('.callout-card');
      if (cardEl) {
        const cardX = (cfg.labelX / 100) * stageW;
        const cardY = (cfg.labelY / 100) * stageH;
        // Connect to nearest edge of card
        const targetX = dotX > cardX ? cardX + cardEl.offsetWidth : cardX;
        const targetY = dotY > cardY ? cardY + (cardEl.offsetHeight / 2) : cardY;

        lineEl.setAttribute('x1', dotX);
        lineEl.setAttribute('y1', dotY);
        lineEl.setAttribute('x2', targetX);
        lineEl.setAttribute('y2', targetY);
      }
    });
  }

  /* ==========================================================================
     7. SECTION 2 — STATEMENT (Word-by-word reveal)
     ========================================================================== */
  const statementEl = document.getElementById('statement');
  const statementSentence = document.getElementById('statement-sentence');
  let statementWords = [];

  if (statementSentence) {
    const rawText = statementSentence.textContent.trim();
    const words = rawText.split(/\s+/);
    statementSentence.innerHTML = '';
    statementWords = words.map((word) => {
      const span = document.createElement('span');
      span.className = 'word-reveal';
      span.textContent = word + ' ';
      statementSentence.appendChild(span);
      return span;
    });
  }

  /* ==========================================================================
     8. GLOBAL ANIMATION LOOP (Single requestAnimationFrame)
     ========================================================================== */
  function updateScrollProgress() {
    const innerH = window.innerHeight;

    // --- Hero Section ---
    if (heroWrapper) {
      const heroRect = heroWrapper.getBoundingClientRect();
      const heroTotalScroll = heroWrapper.offsetHeight - innerH;
      const heroProgress = Math.max(0, Math.min(1, -heroRect.top / Math.max(heroTotalScroll, 1)));

      heroTargetFrame = Math.round(heroProgress * (CONFIG.hero.frameCount - 1));
      heroCurrentFrame += (heroTargetFrame - heroCurrentFrame) * 0.15;
      const roundedHeroFrame = Math.round(heroCurrentFrame);

      if (roundedHeroFrame !== lastDrawnHeroIndex) {
        lastDrawnHeroIndex = roundedHeroFrame;
        const img = getNearestLoadedFrame(heroFrames, roundedHeroFrame);
        if (img) {
          drawScrollyFrame(heroCtx, heroCanvas, img);
        }
      }

      if (heroProgressBar) {
        heroProgressBar.style.transform = `scaleX(${heroProgress})`;
      }

      if (hudSpeedVal) {
        const speed = Math.round(CONFIG.hero.hud.speedStart + heroProgress * (CONFIG.hero.hud.speedEnd - CONFIG.hero.hud.speedStart));
        hudSpeedVal.textContent = `${String(speed).padStart(3, '0')} ${CONFIG.hero.hud.speedUnit}`;
      }
      if (hudDistVal) {
        const dist = (CONFIG.hero.hud.distanceStart + heroProgress * (CONFIG.hero.hud.distanceEnd - CONFIG.hero.hud.distanceStart)).toFixed(1);
        hudDistVal.textContent = `${dist} ${CONFIG.hero.hud.distanceUnit}`;
      }

      CONFIG.hero.chapters.forEach((ch, idx) => {
        const el = chapterEls[idx];
        if (!el) return;
        const isActive = heroProgress >= ch.start && heroProgress <= ch.end;
        if (isActive && !el.classList.contains('is-active')) {
          el.classList.add('is-active');
          if (hudChapterVal) hudChapterVal.textContent = ch.hudChapter;
        } else if (!isActive && el.classList.contains('is-active')) {
          el.classList.remove('is-active');
        }
      });

      if (heroBlackout) {
        if (heroProgress >= CONFIG.hero.fadeToBlackStart) {
          const fadeProg = (heroProgress - CONFIG.hero.fadeToBlackStart) / (1 - CONFIG.hero.fadeToBlackStart);
          heroBlackout.style.opacity = fadeProg;
        } else {
          heroBlackout.style.opacity = 0;
        }
      }
    }

    // --- Statement Section Reveal ---
    if (statementEl && statementWords.length > 0) {
      const stRect = statementEl.getBoundingClientRect();
      const enter = innerH;
      const totalRange = stRect.height + innerH * 0.5;
      const progress = Math.max(0, Math.min(1, (enter - stRect.top) / totalRange));

      const totalWords = statementWords.length;
      const wordsToReveal = Math.floor(progress * totalWords * 1.4);

      statementWords.forEach((span, idx) => {
        if (idx < wordsToReveal) {
          span.classList.add('revealed');
        } else {
          span.classList.remove('revealed');
        }
      });
    }

    // --- Dismantle Section ---
    if (dismantleWrapper) {
      const disRect = dismantleWrapper.getBoundingClientRect();
      const disTotalScroll = dismantleWrapper.offsetHeight - innerH;
      const disProgress = Math.max(0, Math.min(1, -disRect.top / Math.max(disTotalScroll, 1)));

      dismantleTargetFrame = Math.round(disProgress * (CONFIG.dismantle.frameCount - 1));
      dismantleCurrentFrame += (dismantleTargetFrame - dismantleCurrentFrame) * 0.15;
      const roundedDisFrame = Math.round(dismantleCurrentFrame);

      if (roundedDisFrame !== lastDrawnDismantleIndex) {
        lastDrawnDismantleIndex = roundedDisFrame;
        const img = getNearestLoadedFrame(dismantleFrames, roundedDisFrame);
        if (img) {
          drawScrollyFrame(dismantleCtx, dismantleCanvas, img);
        }
      }

      if (dismantleProgressBar) {
        dismantleProgressBar.style.transform = `scaleX(${disProgress})`;
      }

      CONFIG.dismantle.callouts.forEach((cfg) => {
        const itemEl = document.getElementById(cfg.id);
        if (!itemEl) return;
        if (disProgress >= cfg.startProgress) {
          itemEl.classList.add('is-visible');
        } else {
          itemEl.classList.remove('is-visible');
        }
      });
    }

    requestAnimationFrame(updateScrollProgress);
  }

  requestAnimationFrame(updateScrollProgress);

  /* ==========================================================================
     9. SECTION 4 — LINEUP ACCORDION (Hover, Debounce, Touch & Keyboard)
     ========================================================================== */
  const lineupSection = document.getElementById('lineup');
  const slides = Array.from(document.querySelectorAll('.lineup-slide'));
  let activeSlideIndex = 0;
  let hoverTimeout = null;

  if (lineupSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lineupSection.classList.add('is-in-view');
        }
      });
    }, { threshold: 0.2 });
    observer.observe(lineupSection);
  }

  function setActiveSlide(newIndex) {
    if (newIndex === activeSlideIndex || newIndex < 0 || newIndex >= slides.length) return;

    slides[activeSlideIndex].classList.remove('is-open');
    slides[activeSlideIndex].setAttribute('aria-expanded', 'false');

    slides[newIndex].classList.add('is-open');
    slides[newIndex].setAttribute('aria-expanded', 'true');

    activeSlideIndex = newIndex;
  }

  slides.forEach((slide, idx) => {
    slide.addEventListener('mouseenter', () => {
      if (!isFinePointer) return;
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        setActiveSlide(idx);
      }, CONFIG.lineup.hoverDebounceMs); // 80ms debounce
    });

    slide.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
    });

    slide.addEventListener('click', () => {
      setActiveSlide(idx);
    });

    slide.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (idx + 1) % slides.length;
        setActiveSlide(nextIdx);
        slides[nextIdx].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (idx - 1 + slides.length) % slides.length;
        setActiveSlide(prevIdx);
        slides[prevIdx].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveSlide(idx);
      }
    });

    slide.addEventListener('mousemove', () => {
      if (!cursorLabel) return;
      if (slide.classList.contains('is-open')) {
        cursorLabel.textContent = 'CONFIGURE';
      } else {
        cursorLabel.textContent = 'OPEN';
      }
    });
  });

  const swatchButtons = document.querySelectorAll('.swatch');
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentRow = btn.closest('.swatches-row');
      parentRow.querySelectorAll('.swatch').forEach(s => s.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

})();
