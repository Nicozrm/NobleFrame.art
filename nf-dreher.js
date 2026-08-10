/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Zustand — was die WebGL-Ebene wirklich tut

   Diese Datei war einmal groesser. Sie brachte Lader, Uhr und Wechselwort
   mit — bis nf-buehne.js auf main landete und dieselben drei Dinge besser
   loeste: deren Zaehler misst echte Posten (Schriften, Bilder, Dokument)
   und hat keine Mindestdauer, meiner lief in ungleichen Schritten und
   behauptete damit einen Fortschritt, den er nicht kannte. Zwei Lader auf
   einer Seite waeren nicht doppelt so gut gewesen, sondern zwei halbe.

   Uebrig bleibt das eine Stueck, das es dort nicht gibt: die Anzeige in
   der Hero-Metazeile. Sie meldet, ob die WebGL-Ebene tatsaechlich laeuft —
   nicht, ob sie geplant war. Eine Seite, die „VANTA.NET / AKTIV" schreibt,
   waehrend nichts rechnet, behauptet etwas.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const zustand = document.querySelector('[data-nf-zustand]');
  if (!zustand) return;

  const pruefen = () => {
    /* Drei Stufen, absteigend ehrlich: laeuft das Netz, ist ueberhaupt
       WebGL da, oder steht die Seite flach. */
    if (document.querySelector('.nf-vanta canvas')) return 'VANTA.NET / AKTIV';
    if (document.querySelector('canvas.nf-sph-leinwand')) return 'WEBGL / AKTIV';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'BEWEGUNG / REDUZIERT';
    try {
      const c = document.createElement('canvas');
      if (!(window.WebGLRenderingContext && c.getContext('webgl'))) return 'WEBGL / NICHT VERFÜGBAR';
    } catch (_) { return 'WEBGL / NICHT VERFÜGBAR'; }
    return 'WEBGL / BEREIT';
  };

  const melden = () => { zustand.textContent = pruefen(); };
  melden();
  /* Das Netz kommt bedarfsgesteuert; ein einmaliger Blick beim Laden
     wuerde es systematisch verpassen. Sechs Blicke ueber zwoelf Sekunden
     genuegen — danach aendert sich der Zustand nicht mehr. */
  let n = 0;
  const takt = setInterval(() => { melden(); if (++n >= 6) clearInterval(takt); }, 2000);
})();

/* ═══════════════════════════════════════════════════════════════════════
   Der Lader

   Ein Zaehler von 000 auf 100 und eine Haarlinie, die sich fuellt, dann
   hebt sich die Flaeche als Vorhang. Zusammen knapp zwei Sekunden.

   Der Zaehler zaehlt nicht die Ladefortschritte — das waere eine Luege,
   denn zum Zeitpunkt seines Erscheinens ist das Dokument bereits da. Er
   laeuft in ungleichen Schritten bis 100 und wartet zusaetzlich auf das
   `load`-Ereignis, bevor der Vorhang geht. Was er anzeigt, ist also keine
   erfundene Prozentzahl, sondern eine Zeitspanne, die tatsaechlich
   vergeht — und sie endet nicht vor der Seite.

   Einmal je Sitzung: wer von einer Unterseite zurueckkommt, hat den
   Auftakt schon gesehen. sessionStorage merkt sich das.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const lader = document.getElementById('nfLader');
  if (!lader) return;

  const zahl   = lader.querySelector('[data-nf-laderzahl]');
  const balken = lader.querySelector('[data-nf-laderbalken]');
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Der Hero steigt erst auf, wenn der Vorhang geht — nicht dahinter.
     Ein maskierter Aufstieg, den niemand sieht, ist keine Choreografie,
     sondern nur verbrauchte Zeit. */
  const heroAn = () => {
    const h = document.querySelector('.nf-hero');
    if (h) requestAnimationFrame(() => h.classList.add('in'));
  };

  const fort = () => {
    lader.classList.add('weg');
    heroAn();
    document.documentElement.classList.add('nf-geladen');
    const ende = () => lader.classList.add('fort');
    lader.addEventListener('transitionend', ende, { once: true });
    setTimeout(ende, 1100);
  };

  /* Schon gesehen, oder reduzierte Bewegung: kein Auftakt, nur weg damit.
     Der Vorhang wird dabei nicht animiert — er war nie zu sehen. */
  let gesehen = false;
  try { gesehen = sessionStorage.getItem('nf-lader') === '1'; } catch (_) { /* privater Modus */ }
  if (gesehen || reduziert) {
    lader.style.transition = 'none';
    fort();
    return;
  }
  try { sessionStorage.setItem('nf-lader', '1'); } catch (_) { /* egal */ }

  /* Waehrend der Auftakt laeuft, gehoert der Scroll niemandem. Lenis wird
     angehalten, falls es schon steht; sonst genuegt die Sperre am Body. */
  const halten = () => {
    document.body.style.overflow = 'hidden';
    if (window.__nfLenis && typeof window.__nfLenis.stop === 'function') window.__nfLenis.stop();
  };
  const loesen = () => {
    document.body.style.overflow = '';
    if (window.__nfLenis && typeof window.__nfLenis.start === 'function') window.__nfLenis.start();
  };
  halten();

  let wert = 0;
  let dokumentFertig = document.readyState === 'complete';
  addEventListener('load', () => { dokumentFertig = true; }, { once: true });

  const takt = setInterval(() => {
    /* Ungleiche Schritte: ein gleichmaessiger Zaehler sieht aus wie eine
       Fortschrittsanzeige, die nichts misst. Ungleichmaessig sieht er aus
       wie Arbeit. Ab 92 wird gewartet, bis das Dokument wirklich steht. */
    const rest = wert < 92 ? 6 + Math.random() * 12 : (dokumentFertig ? 4 : 0);
    wert = Math.min(100, wert + rest);
    if (zahl) zahl.textContent = String(Math.round(wert)).padStart(3, '0');
    if (balken) balken.style.width = wert.toFixed(1) + '%';

    if (wert >= 100) {
      clearInterval(takt);
      if (zahl) zahl.textContent = 'BEREIT';
      setTimeout(() => { loesen(); fort(); }, 260);
    }
  }, 90);

  /* Notbremse: sollte `load` nie kommen (haengendes Bild, toter Request),
     darf der Auftakt die Seite nicht dauerhaft verschliessen. */
  setTimeout(() => {
    if (!lader.classList.contains('weg')) { clearInterval(takt); loesen(); fort(); }
  }, 6000);
})();
