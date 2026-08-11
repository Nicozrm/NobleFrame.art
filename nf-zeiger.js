/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Zeiger — Punkt und Ring

   Zwei Elemente folgen dem Mauszeiger mit verschiedener Traegheit: ein
   kleiner gefuellter Punkt fast synchron, ein Ring merklich langsamer.
   Der Abstand zwischen beiden ist der ganze Effekt — er entsteht nur aus
   den unterschiedlichen Faktoren, nicht aus einer Spur aus Kopien.

   Warum der native Zeiger verschwindet und nicht nur ergaenzt wird:
   zwei Zeiger auf demselben Bildschirm sind kein Stilmittel, sondern eine
   Frage, welcher gilt. `cursor: none` steht deshalb erst, wenn dieser
   hier wirklich laeuft — faellt die Datei aus, bleibt der System-Zeiger,
   und niemand klickt blind.

   Wo er nicht erscheint:
   - Ohne feines Zeigegeraet (Touch, Stift). `(hover: hover)` und
     `(pointer: fine)` zusammen, weil manche Geraete das eine ohne das
     andere melden.
   - Unter 1024 px. Ein nachgezogener Ring auf einem kleinen Schirm ist
     kein Detail, sondern ein Hindernis.
   - Bei prefers-reduced-motion. Der Effekt IST die Bewegung; ihn
     stillzustellen ergaebe einen Kreis, der auf dem Zeiger klebt.

   Kosten: ein rAF-Loop, der nur laeuft, solange sich etwas bewegt. Steht
   der Zeiger und sind Punkt und Ring am Ziel, endet er von selbst und
   startet beim naechsten Mausereignis neu — im Ruhezustand kostet der
   Zeiger also nichts.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const fein = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gross = matchMedia('(min-width: 1024px)').matches;
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fein || !gross || reduziert) return;

  /* ── Stil ─────────────────────────────────────────────────────────────
     Aus dem Skript, weil die Elemente hier entstehen. `mix-blend-mode:
     difference` auf dem Ring: er invertiert seinen Grund und ist damit
     auf Cream wie auf Tiefe sichtbar, ohne dass irgendwo eine zweite
     Farbregel gepflegt werden muesste. */
  const css = document.createElement('style');
  css.textContent = [
    'html.nf-zeiger, html.nf-zeiger *{cursor:none !important}',
    '.nf-zg{position:fixed;top:0;left:0;pointer-events:none;z-index:10000;',
      'will-change:transform;opacity:0;transition:opacity .25s ease}',
    '.nf-zeiger-an .nf-zg{opacity:1}',
    '.nf-zg-punkt{width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;',
      'background:#F4583D;transition:opacity .25s ease,transform .25s cubic-bezier(.16,1,.3,1)}',
    '.nf-zg-ring{width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;',
      'border:1px solid #ECE0C6;mix-blend-mode:difference;',
      'transition:width .3s cubic-bezier(.16,1,.3,1),height .3s cubic-bezier(.16,1,.3,1),',
      'margin .3s cubic-bezier(.16,1,.3,1),border-color .3s ease,background-color .3s ease}',
    /* Ueber einem Bedienelement waechst der Ring und der Punkt tritt ab —
       sonst stehen zwei Marken auf demselben Ziel. */
    '.nf-zeiger-warm .nf-zg-ring{width:58px;height:58px;margin:-29px 0 0 -29px;border-color:#F4583D}',
    '.nf-zeiger-warm .nf-zg-punkt{opacity:0;transform:scale(.4)}',
    /* Ueber einer Arbeit wird der Ring zur Scheibe mit Beschriftung. */
    '.nf-zeiger-sicht .nf-zg-ring{width:86px;height:86px;margin:-43px 0 0 -43px;',
      'background:#F4583D;border-color:#F4583D;mix-blend-mode:normal}',
    '.nf-zg-wort{position:absolute;inset:0;display:grid;place-items:center;',
      'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.6rem;letter-spacing:.14em;',
      'text-transform:uppercase;color:#ECE0C6;opacity:0;transition:opacity .2s ease}',
    '.nf-zeiger-sicht .nf-zg-wort{opacity:1}',
    /* Faellt das Fenster weg oder verlaesst der Zeiger es, verschwinden
       beide — ein Ring, der am Rand klebt, sieht aus wie ein Fehler. */
    '.nf-zeiger-fort .nf-zg{opacity:0}'
  ].join('');
  document.head.appendChild(css);

  const punkt = document.createElement('div');
  punkt.className = 'nf-zg nf-zg-punkt';
  punkt.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'nf-zg nf-zg-ring';
  ring.setAttribute('aria-hidden', 'true');
  const wort = document.createElement('span');
  wort.className = 'nf-zg-wort';
  wort.textContent = 'Ansehen';
  ring.appendChild(wort);

  document.body.appendChild(ring);
  document.body.appendChild(punkt);

  const wurzel = document.documentElement;
  wurzel.classList.add('nf-zeiger');

  /* ── Zustand ────────────────────────────────────────────────────────── */
  let zielX = innerWidth / 2, zielY = innerHeight / 2;
  let pX = zielX, pY = zielY;   // Punkt
  let rX = zielX, rY = zielY;   // Ring
  let laeuft = false;
  let erstesMal = true;

  /* Zwei Faktoren, ein Loop. 0.35 fuer den Punkt liest sich als „folgt",
     0.15 fuer den Ring als „kommt nach" — der Unterschied ist der Effekt.
     Gleiche Werte ergaeben zwei konzentrische Kreise, die nichts sagen. */
  const rahmen = () => {
    pX += (zielX - pX) * 0.35;
    pY += (zielY - pY) * 0.35;
    rX += (zielX - rX) * 0.15;
    rY += (zielY - rY) * 0.15;

    punkt.style.transform = 'translate3d(' + pX.toFixed(1) + 'px,' + pY.toFixed(1) + 'px,0)';
    ring.style.transform  = 'translate3d(' + rX.toFixed(1) + 'px,' + rY.toFixed(1) + 'px,0)';

    /* Wenn beide praktisch am Ziel stehen, endet der Loop. Ein halber
       Pixel ist unterhalb dessen, was man sieht — weiterzurechnen waere
       Strom fuer nichts. */
    const ruht = Math.abs(zielX - rX) < 0.5 && Math.abs(zielY - rY) < 0.5 &&
                 Math.abs(zielX - pX) < 0.5 && Math.abs(zielY - pY) < 0.5;
    if (ruht) { laeuft = false; return; }
    requestAnimationFrame(rahmen);
  };

  const anwerfen = () => {
    if (laeuft || document.hidden) return;
    laeuft = true;
    requestAnimationFrame(rahmen);
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;   // Stift/Finger: nicht
    zielX = e.clientX; zielY = e.clientY;
    if (erstesMal) {
      /* Beim ersten Ereignis springen statt fahren: sonst faehrt der Ring
         sichtbar aus der Bildmitte an die Position, an der der Zeiger
         laengst steht. */
      erstesMal = false;
      pX = rX = zielX; pY = rY = zielY;
      document.body.classList.add('nf-zeiger-an');
    }
    anwerfen();
  }, { passive: true });

  /* ── Zustaende ────────────────────────────────────────────────────────
     Ueber Delegation statt ueber Listener je Element: die Seite baut
     Karten und Links zur Laufzeit um (Wort-Scrub zerlegt Saetze, die
     Choreografie packt Ueberschriften ein), und jede nachtraeglich
     erzeugte Verknuepfung haette sonst keinen Zustand. */
  const WARM = 'a,button,[role="button"],input,textarea,select,summary,label,[data-nf-roll]';
  /* Die Scheibe mit „Ansehen" gehoert ueber Arbeiten, nicht ueber jede
     verlinkte Flaeche. Zuerst standen hier auch die Leistungs-Baender
     drin — dort verspricht das Wort einen Blick auf ein Projekt und
     fuehrt auf eine Leistungsseite. Ein Zeiger, der etwas anderes
     ankuendigt als das, was folgt, ist schlechter als gar keiner. */
  const SICHT = '.work-card,.live-card';

  addEventListener('pointerover', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    const sicht = t.closest(SICHT);
    const warm = t.closest(WARM);
    document.body.classList.toggle('nf-zeiger-sicht', !!sicht);
    document.body.classList.toggle('nf-zeiger-warm', !!warm && !sicht);
  }, { passive: true });

  /* Verlaesst der Zeiger das Fenster, treten beide ab. `pointerout` mit
     leerem relatedTarget ist das verlaessliche Signal dafuer — mouseleave
     am Body meldet auch beim Wechsel zwischen Kindelementen. */
  addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) document.body.classList.add('nf-zeiger-fort');
  }, { passive: true });
  addEventListener('pointerover', () => {
    document.body.classList.remove('nf-zeiger-fort');
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { if (!document.hidden) anwerfen(); });

  /* Wird das Fenster schmal oder wechselt jemand auf ein Touchgeraet
     (Convertible, angedockter Laptop), raeumt sich der Zeiger ab und gibt
     den System-Zeiger zurueck. */
  const pruefen = () => {
    const weiterhin = matchMedia('(hover: hover) and (pointer: fine)').matches &&
                      matchMedia('(min-width: 1024px)').matches;
    if (weiterhin) return;
    wurzel.classList.remove('nf-zeiger');
    document.body.classList.remove('nf-zeiger-an', 'nf-zeiger-warm', 'nf-zeiger-sicht');
    punkt.remove(); ring.remove();
    laeuft = false;
  };
  addEventListener('resize', pruefen, { passive: true });
})();
