/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Zeiger — Ring und Punkt

   Der eigene Zeiger aus der Vorlage: ein gefuellter Punkt, der dem
   Cursor eng folgt, und ein Ring, der ihm nachhaengt. Zwei Traegheiten,
   ein Loop — daraus entsteht das Nachziehen, nicht aus einer Animation.

   Drei Zustaende, mehr gibt es nicht:

     ruhe   Punkt und Ring in ihrer Groesse
     griff  ueber allem Bedienbaren: Ring waechst, Punkt tritt zurueck
     sicht  ueber den Arbeitskarten: Ring wird eine Scheibe mit „ÖFFNEN"

   Der Systemcursor wird nur dort versteckt, wo dieser hier wirklich
   laeuft. Das ist der Unterschied zwischen einem eigenen Zeiger und
   einem verschwundenen: faellt das Skript aus, bleibt der echte da.

   Aus bei grober Zeigereingabe (Finger, Stift), bei reduzierter Bewegung
   und unter 1025 px. Auf einem Touchgeraet ist ein nachziehender Ring
   kein Zeiger, sondern ein Fleck, der zu spaet kommt.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (innerWidth < 1025) return;

  const css = document.createElement('style');
  css.textContent = [
    'html.nf-zeiger, html.nf-zeiger *{cursor:none !important}',
    '.nfz{position:fixed;top:0;left:0;pointer-events:none;z-index:2147483002;',
      'will-change:transform;opacity:0;transition:opacity .2s linear}',
    '.nfz.sichtbar{opacity:1}',
    /* Der Punkt ist die Spitze: er sitzt genau dort, wo der Systemcursor
       waere, und darf deshalb nicht nachhaengen. */
    '.nfz-punkt{width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;',
      'background:#F4583D;transition:opacity .12s linear,transform .12s ease}',
    /* Der Ring traegt die Zustaende. mix-blend-mode:difference haelt ihn
       auf Cream wie auf dem dunklen Feld sichtbar, ohne zwei Farben. */
    '.nfz-ring{width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;',
      'border:1px solid rgba(29,29,29,.55);mix-blend-mode:difference;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:width .18s ease,height .18s ease,margin .18s ease,',
      'background-color .18s ease,border-color .18s ease}',
    '.nfz-ring span{font-family:\'JetBrains Mono\',monospace;font-size:.52rem;',
      'letter-spacing:.14em;text-transform:uppercase;color:#ECE0C6;opacity:0;',
      'transition:opacity .12s linear;white-space:nowrap}',
    /* griff */
    'html[data-nfz="griff"] .nfz-ring{width:54px;height:54px;margin:-27px 0 0 -27px;',
      'border-color:#F4583D}',
    'html[data-nfz="griff"] .nfz-punkt{opacity:0}',
    /* sicht */
    'html[data-nfz="sicht"] .nfz-ring{width:82px;height:82px;margin:-41px 0 0 -41px;',
      'background:#F4583D;border-color:#F4583D;mix-blend-mode:normal}',
    'html[data-nfz="sicht"] .nfz-ring span{opacity:1}',
    'html[data-nfz="sicht"] .nfz-punkt{opacity:0}'
  ].join('');
  document.head.appendChild(css);

  const punkt = document.createElement('div');
  punkt.className = 'nfz nfz-punkt';
  punkt.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.className = 'nfz nfz-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<span>Öffnen</span>';
  document.body.appendChild(ring);
  document.body.appendChild(punkt);
  document.documentElement.classList.add('nf-zeiger');

  let zx = innerWidth / 2, zy = innerHeight / 2;   // Ziel
  let px = zx, py = zy, rx = zx, ry = zy;
  let laeuft = false, gesehen = false;

  const rahmen = () => {
    /* Zwei Traegheiten: der Punkt fast sofort, der Ring deutlich weicher.
       Genau diese Differenz ist der Effekt — ein einzelner nachziehender
       Kreis sieht aus wie Verzoegerung, zwei sehen aus wie Masse. */
    px += (zx - px) * 0.38;
    py += (zy - py) * 0.38;
    rx += (zx - rx) * 0.16;
    ry += (zy - ry) * 0.16;

    punkt.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
    ring.style.transform  = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';

    if (Math.abs(zx - rx) + Math.abs(zy - ry) > 0.3) requestAnimationFrame(rahmen);
    else laeuft = false;
  };

  const anwerfen = () => { if (!laeuft) { laeuft = true; requestAnimationFrame(rahmen); } };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    zx = e.clientX; zy = e.clientY;
    if (!gesehen) {
      gesehen = true;
      px = rx = zx; py = ry = zy;
      punkt.classList.add('sichtbar');
      ring.classList.add('sichtbar');
    }
    anwerfen();
  }, { passive: true });

  /* Verlaesst der Zeiger das Fenster, verschwindet auch seine Darstellung —
     sonst klebt ein Ring am Rand, waehrend die Maus im Nachbarfenster ist. */
  document.documentElement.addEventListener('pointerleave', () => {
    punkt.classList.remove('sichtbar');
    ring.classList.remove('sichtbar');
    gesehen = false;
  });
  document.documentElement.addEventListener('pointerenter', () => { anwerfen(); });

  /* ── Zustaende ────────────────────────────────────────────────────────
     Ueber Delegation statt ueber Listener auf jedem Element: die Seite
     baut Knoten zur Laufzeit um (Rollentext, Wort-Scrub, Bahn), und an
     jedem einzelnen zu haengen hiesse, sie nach jedem Umbau erneut zu
     verdrahten. */
  const SICHT = '.live-card, .work-card, .nf-endkarte, .service-card';
  const GRIFF = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

  addEventListener('pointerover', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const zustand = t.closest(SICHT) ? 'sicht' : (t.closest(GRIFF) ? 'griff' : '');
    if (zustand) document.documentElement.dataset.nfz = zustand;
    else delete document.documentElement.dataset.nfz;
  }, { passive: true });

  /* Beim Verlassen des Fensters darf kein Zustand haengenbleiben. */
  addEventListener('blur', () => { delete document.documentElement.dataset.nfz; });

  /* Wird das Fenster schmal oder kommt ein Finger dazu, raeumt sich der
     Zeiger selbst ab — der Systemcursor muss dann zurueck. */
  const pruefen = () => {
    if (innerWidth >= 1025) return;
    document.documentElement.classList.remove('nf-zeiger');
    delete document.documentElement.dataset.nfz;
    punkt.remove(); ring.remove();
    removeEventListener('resize', pruefen);
  };
  addEventListener('resize', pruefen, { passive: true });
})();
