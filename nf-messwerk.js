/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame — Messwerk

   Zwei Triebwerke über der Werkzeichnung. Beide rechnen wirklich; keines
   stellt etwas dar, das es nicht gibt.

     1. Messwerk    Die Seite vermisst sich selbst und schreibt das
                    Ergebnis in ihr eigenes Schriftfeld: übertragene
                    Bytes, Anfragen, Knoten im Dokument, Schriftschnitte,
                    LCP, Verschiebung, Bildrate.

     2. Rasterwerk  Ein Konstruktionslayer, wie man ihn in einem
                    Zeichenprogramm zuschaltet: Spaltenraster, Ränder,
                    Fadenkreuz mit Koordinate. Taste G.

   Warum das hier steht und nicht in nf-motion.js: das eine ist Bedienung,
   das andere Instrumentierung. Wer die Messung nicht will, lässt diese
   Datei weg, und die Seite bleibt vollständig.

   Der Grundsatz „keine Aussage ohne Deckung" wird damit wörtlich. Die
   Zahlen im Schriftfeld tippt niemand ein — sie werden bei jedem Aufruf
   gemessen, auf diesem Gerät, in dieser Sitzung. Wenn eine davon
   schlechter wird, sieht der Besucher es vor uns.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const slots = $$('[data-mess]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');


  /* ── 1. Messwerk ──────────────────────────────────────────────────────
     Werte werden in ein Register geschrieben und von dort in alle Slots
     gespiegelt, die danach fragen. So kann dieselbe Zahl an mehreren
     Stellen stehen, ohne zweimal gemessen zu werden. */
  const werte = Object.create(null);

  function setze(name, wert) {
    werte[name] = wert;
    slots.forEach((el) => {
      if (el.getAttribute('data-mess') === name) el.textContent = wert;
    });
  }

  const kb = (bytes) => (bytes / 1024).toFixed(1).replace('.', ',') + ' kB';

  /* Übertragene Bytes und Anfragen.

     transferSize ist 0, wenn eine Antwort aus dem Cache kommt oder die
     Timing-Allow-Origin-Regel fehlt. Das ist kein Fehler, sondern die
     Wahrheit über diesen Aufruf: beim zweiten Besuch wird wirklich nichts
     übertragen. Wir zählen deshalb beides getrennt — Anfragen immer,
     Bytes nur, soweit sie messbar sind. */
  function vermessen() {
    const res = performance.getEntriesByType('resource');
    const nav = performance.getEntriesByType('navigation')[0];

    let bytes = nav && nav.transferSize ? nav.transferSize : 0;
    res.forEach((r) => { bytes += r.transferSize || 0; });

    setze('anfragen', String(res.length + 1));
    setze('bytes', bytes ? kb(bytes) : 'aus Cache');
    setze('knoten', String(document.getElementsByTagName('*').length));

    if (document.fonts && document.fonts.size !== undefined) {
      setze('schriften', String(document.fonts.size));
    }
  }

  /* Der Ladevorgang ist erst nach `load` vollständig in der Timeline.
     Vorher gemessene Werte wären systematisch zu niedrig. */
  if (document.readyState === 'complete') vermessen();
  else addEventListener('load', () => setTimeout(vermessen, 0));

  /* Größter Inhaltsbereich (LCP) — die Zahl, die zählt, wenn jemand
     fragt, wann die Seite „da" war. */
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver((list) => {
        const e = list.getEntries();
        const last = e[e.length - 1];
        if (last) setze('lcp', Math.round(last.startTime) + ' ms');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) { /* Browser ohne LCP-Eintrag */ }

    /* Layoutverschiebung. Nur Verschiebungen ohne vorangehende Eingabe
       zählen — was nach einem Klick springt, ist eine Reaktion, kein
       Fehler. */
    try {
      let cls = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => { if (!e.hadRecentInput) cls += e.value; });
        setze('cls', cls.toFixed(3).replace('.', ','));
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) { /* Browser ohne Layout-Shift-Eintrag */ }
  }

  /* Bildrate. Über eine Sekunde gemittelt und nur solange gemessen, wie
     ein Slot danach fragt und das Dokument sichtbar ist — eine Messung,
     die im Hintergrund weiterläuft, misst nichts und kostet Strom. */
  if (slots.some((el) => el.getAttribute('data-mess') === 'bildrate') && !reduced.matches) {
    let frames = 0, t0 = performance.now(), raf = 0;
    const takt = (now) => {
      frames++;
      if (now - t0 >= 1000) {
        setze('bildrate', Math.round((frames * 1000) / (now - t0)) + ' fps');
        frames = 0; t0 = now;
      }
      raf = requestAnimationFrame(takt);
    };
    const an = () => { if (!raf) { t0 = performance.now(); frames = 0; raf = requestAnimationFrame(takt); } };
    const aus = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    document.addEventListener('visibilitychange', () => (document.hidden ? aus() : an()));
    an();
  }


  /* ── 2. Rasterwerk ────────────────────────────────────────────────────
     Der Konstruktionslayer. In einem Zeichenprogramm blendet man Hilfs-
     linien ein, wenn man wissen will, woran etwas ausgerichtet ist —
     genau das macht diese Taste.

     Es ist bewusst kein Effekt: der Layer zeigt die tatsächlichen Werte
     aus dem Design-System. Verschiebt jemand `--bahn` oder `--rand`,
     verschiebt sich das Raster mit. Ein Raster, das die eigene Vorgabe
     nicht kennt, wäre eine hübsche Lüge. */
  let layer = null, an = false;

  function baue() {
    layer = document.createElement('div');
    layer.className = 'nf-raster';
    layer.setAttribute('aria-hidden', 'true');

    const spalten = document.createElement('div');
    spalten.className = 'nf-raster__bahn';
    for (let i = 0; i < 12; i++) spalten.appendChild(document.createElement('i'));

    const kreuz = document.createElement('div');
    kreuz.className = 'nf-raster__kreuz';
    kreuz.innerHTML = '<i class="nf-raster__x"></i><i class="nf-raster__y"></i>' +
                      '<span class="nf-raster__koord"></span>';

    const fahne = document.createElement('div');
    fahne.className = 'nf-raster__fahne';
    fahne.textContent = 'Konstruktionslayer — G zum Schließen';

    layer.append(spalten, kreuz, fahne);
    document.body.appendChild(layer);

    const koord = $('.nf-raster__koord', layer);
    let tick = false, mx = 0, my = 0;
    const zeichne = () => {
      tick = false;
      kreuz.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      koord.textContent = 'X ' + mx + ' · Y ' + Math.round(my + scrollY);
    };
    addEventListener('pointermove', (e) => {
      if (!an) return;
      mx = Math.round(e.clientX); my = Math.round(e.clientY);
      if (!tick) { tick = true; requestAnimationFrame(zeichne); }
    }, { passive: true });
  }

  function schalte(zustand) {
    if (!layer) baue();
    an = zustand;
    layer.classList.toggle('on', an);
    $$('[data-raster-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(an)));
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tippt = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
                  document.activeElement.isContentEditable;
    if (tippt) return;
    if (e.key === 'g' || e.key === 'G') { e.preventDefault(); schalte(!an); }
    else if (e.key === 'Escape' && an) { e.preventDefault(); schalte(false); }
  });

  $$('[data-raster-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => schalte(!an));
  });
})();
