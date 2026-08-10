/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Interactions — site-weite Mikrointeraktions-Schicht
   ─────────────────────────────────────────────────────────────────────────
   Rein additiv und layout-neutral: eigene Fixed-Overlays, keine Eingriffe
   in bestehende Transforms/Reveals der Seiten. Vier Bausteine:

   1. Scroll-Fortschritt  — 2px-Goldlinie am oberen Rand (alle Geräte)
   2. (frei)              — die Cursor-Aura ist nach nf-zeiger.js gewandert
   3. Klick-Schockwelle   — expandierender Goldring an der Klickposition
                            (passend zu den Ringen des Cinematic-Engine)
   4. Magnetischer CTA    — .nav-cta neigt sich sanft zum Cursor (max. 4px)

   Respektiert prefers-reduced-motion (dann nur Scroll-Fortschritt, statisch
   nachgeführt ohne Animation der Overlays). Registriert außerdem den
   Service Worker (network-first Shell, siehe service-worker.js).
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── Service Worker ─────────────────────────────────────────────────────
     Relativ registrieren, nicht '/service-worker.js'. Der Registrierungspfad
     bestimmt den Scope: absolut gaebe das immer den Domain-Root, auch wenn
     die Seite unter einem Unterpfad liegt — der Worker wuerde dann entweder
     gar nicht gefunden oder kontrollierte Seiten, die ihm nicht gehoeren. */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const GOLD = '244,88,61';
  const GOLD_HI = '196,63,38';

  /* ── Styles (einmalig injiziert, keine Selektoren auf Seiten-DOM) ───── */
  const css = document.createElement('style');
  css.textContent =
    '.nfi-progress{position:fixed;top:0;left:0;width:100%;height:2px;z-index:2147483000;' +
      'background:linear-gradient(90deg,rgba(' + GOLD + ',.85),rgba(' + GOLD_HI + ',.95));' +
      'transform-origin:0 50%;transform:scaleX(0);pointer-events:none}' +
    '.nfi-ring{position:fixed;border-radius:50%;pointer-events:none;z-index:2147483001;' +
      'border:1px solid rgba(' + GOLD_HI + ',.9);width:12px;height:12px;margin:-6px 0 0 -6px;' +
      'animation:nfi-ring .9s cubic-bezier(.22,.61,.36,1) forwards}' +
    '@keyframes nfi-ring{from{transform:scale(1);opacity:.85}to{transform:scale(9);opacity:0}}' +
    '.nfi-ring--soft{border-width:2px;filter:blur(1px);animation-duration:1.2s}';
  document.head.appendChild(css);

  /* ── 1. Scroll-Fortschritt ──────────────────────────────────────────── */
  const bar = document.createElement('div');
  bar.className = 'nfi-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barTick = false;
  function paintBar() {
    barTick = false;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - innerHeight, 1);
    bar.style.transform = 'scaleX(' + Math.min(scrollY / max, 1).toFixed(4) + ')';
  }
  addEventListener('scroll', () => {
    if (!barTick) { barTick = true; requestAnimationFrame(paintBar); }
  }, { passive: true });
  paintBar();

  if (reduced) return; // Aura/Ringe/Magnet nur mit erlaubter Bewegung

  /* ── 2. Cursor-Aura — entfernt ──────────────────────────────────────
     Hier lag ein weiches Lichtfeld, das der Maus folgte. Es stammt aus
     der dunklen Fassung: auf Schwarz hellt ein Schein auf, auf Cream gibt
     es nichts aufzuhellen. Seine Aufgabe — den Zeiger sichtbar begleiten —
     uebernimmt jetzt nf-zeiger.js mit Ring und Punkt. Zwei Systeme, die
     beide am Cursor haengen, waeren eines zu viel. */

  /* ── 3. Klick-Schockwelle ───────────────────────────────────────────── */
  let ringCount = 0;
  addEventListener('pointerdown', (e) => {
    // Formulare nicht stören; Cinematic-Stage zeichnet eigene Canvas-Ringe
    if (e.target.closest('input,textarea,select,label,[data-cine]')) return;
    if (ringCount > 6) return;
    for (let i = 0; i < 2; i++) {
      const ring = document.createElement('div');
      ring.className = 'nfi-ring' + (i ? ' nfi-ring--soft' : '');
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      document.body.appendChild(ring);
      ringCount++;
      ring.addEventListener('animationend', () => { ring.remove(); ringCount--; }, { once: true });
    }
  }, { passive: true });

  /* ── 4. Magnetischer CTA ────────────────────────────────────────────── */
  if (finePointer) {
    document.querySelectorAll('.nav-cta').forEach((el) => {
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
          const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          el.style.transform = 'translate(' + (dx * 4).toFixed(1) + 'px,' + (dy * 3).toFixed(1) + 'px)';
        });
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.style.transform = '';
      }, { passive: true });
    });
  }
})();
