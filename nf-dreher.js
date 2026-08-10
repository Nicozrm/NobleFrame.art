/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Dreher — der Wort-Schacht im Hero

   Ein Wort in der Ueberschrift wird ausgetauscht, nicht ueberblendet: das
   alte faehrt nach oben aus dem Fenster, das neue kommt von unten nach.
   Beide bewegen sich im selben Frame — laesst man das alte erst gehen und
   holt das neue danach, sieht man dazwischen ein Loch, und die Zeile
   springt in der Hoehe.

   Warum die Breite mitwandert: „Shader" und „WebGL" sind verschieden
   breit. Ohne Uebergang auf der Breite ruckt die ganze Zeile bei jedem
   Wechsel. Gemessen wird an einem versteckten Zwilling, nicht am
   sichtbaren Wort — das steht waehrend der Fahrt halb ausserhalb seines
   Fensters und liefert einen falschen Wert.

   Ausfallverhalten: Bei prefers-reduced-motion bleibt ein Wort stehen.
   Ohne JavaScript steht ebenfalls das Wort da, das im Markup liegt — der
   Satz ist in jedem Fall vollstaendig lesbar, weil das erste Wort nicht
   erzeugt, sondern nur ersetzt wird.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const schacht = document.querySelector('[data-nf-dreher]');
  if (!schacht) return;

  const worte = (schacht.dataset.worte || '')
    .split(',').map((w) => w.trim()).filter(Boolean);
  if (worte.length < 2) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Der Messzwilling: dieselbe Schrift, derselbe Grad, aber ausserhalb des
     Sichtfelds und ohne Einfluss auf das Layout. */
  const lineal = document.createElement('span');
  lineal.setAttribute('aria-hidden', 'true');
  lineal.style.cssText =
    'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;left:-9999px;top:0';
  schacht.appendChild(lineal);

  const messen = (wort) => {
    lineal.textContent = wort;
    return lineal.getBoundingClientRect().width;
  };

  /* Der Schacht bekommt EINE feste Breite: die des breitesten Wortes.

     Zuerst wanderte sie je Wort mit, animiert. Das sah in der Theorie
     besser aus und war in der Praxis eine Fehlerquelle mit zwei Koepfen:
     die Messung fiel vor dem Font-Swap zu klein aus (Arial Narrow statt
     Anton), und weil die Breite zugleich animiert wurde, stand das Wort
     waehrend der halben Fahrt hinter einer zu engen Kante — „WEBGL" war
     rechts angeschnitten.

     Eine feste Breite kann beides nicht. Die Zeile springt ohnehin nicht,
     weil sich nichts mehr aendert, und der Rest ist eine Frage von
     wenigen Pixeln Luft. Die drei Pixel Zugabe fangen das Nachkommaende
     der negativen Laufweite ab, das sonst am letzten Buchstaben knabbert. */
  schacht.style.display = 'inline-block';

  const breiteSetzen = () => {
    let max = 0;
    worte.forEach((w) => { max = Math.max(max, messen(w)); });
    schacht.style.width = (max + 3).toFixed(1) + 'px';
  };
  breiteSetzen();

  let i = 0;
  let laeuft = false;
  let sichtbar = true;
  let timer = 0;

  const wechseln = () => {
    if (laeuft || !sichtbar || document.hidden) return;
    laeuft = true;

    const naechstes = worte[(i + 1) % worte.length];
    const alt = schacht.querySelector('.nf-wort-alt');
    if (!alt) { laeuft = false; return; }

    const neu = document.createElement('span');
    neu.className = 'nf-wort-neu';
    neu.textContent = naechstes;
    schacht.insertBefore(neu, lineal);

    /* Ein erzwungener Reflow zwischen Einfuegen und Klassenwechsel. Ohne
       ihn fasst der Browser beides zu einem Schritt zusammen und das neue
       Wort steht sofort am Ziel, statt hereinzufahren. */
    void neu.offsetWidth;
    schacht.classList.add('dreht');

    const fertig = () => {
      schacht.classList.remove('dreht');
      alt.remove();
      neu.className = 'nf-wort-alt';
      i = (i + 1) % worte.length;
      laeuft = false;
    };
    // transitionend ist die Wahrheit; der Timer faengt den Fall ab, dass
    // das Ereignis ausbleibt (verstecktes Tab, unterbrochene Transition).
    let erledigt = false;
    const einmal = () => { if (!erledigt) { erledigt = true; fertig(); } };
    neu.addEventListener('transitionend', einmal, { once: true });
    setTimeout(einmal, 700);
  };

  const takten = () => {
    clearInterval(timer);
    timer = setInterval(wechseln, 2400);
  };

  /* Nur drehen, solange der Hero im Bild ist. Ein Wort, das sich im
     Verborgenen weiterdreht, kostet Frames fuer niemanden. */
  const wirt = schacht.closest('section') || schacht;
  new IntersectionObserver((e) => {
    sichtbar = e[0].isIntersecting;
    if (sichtbar) takten(); else clearInterval(timer);
  }, { threshold: 0.05 }).observe(wirt);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else if (sichtbar) takten();
  });

  addEventListener('resize', breiteSetzen, { passive: true });

  /* Gemessen wird zweimal. Beim ersten Mal steht oft noch die Ersatz-
     schrift, und Arial Narrow ist deutlich schmaler als Anton — die Breite
     waere dauerhaft zu klein und das Wort rechts angeschnitten. Sobald die
     echte Schrift steht, wird nachgemessen. */
  const nachmessen = breiteSetzen;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(nachmessen).catch(() => {});
  }
  addEventListener('load', nachmessen, { once: true });

  takten();
})();

/* ═══════════════════════════════════════════════════════════════════════
   Hero-Meta: Uhr und Zustandsanzeige

   Die Zustandsanzeige ist kein Zierrat. Sie meldet, ob die WebGL-Ebene
   tatsaechlich laeuft — nicht, ob sie geplant war. Eine Seite, die
   „VANTA.NET / ACTIVE" schreibt, waehrend gar nichts rechnet, behauptet
   etwas; deshalb wird hier der reale Zustand abgefragt, mit Verzoegerung,
   weil das Netz erst bei Annaeherung geladen wird.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* Zwei Uhren: eine im Lader, eine im Hero. querySelector traf nur die
     erste, und die verschwindet mit dem Vorhang — im Hero stand danach
     dauerhaft --:--:--. */
  const uhren = Array.from(document.querySelectorAll('[data-nf-uhr]'));
  if (uhren.length) {
    const zwei = (n) => String(n).padStart(2, '0');
    const stellen = () => {
      const d = new Date();
      const s = zwei(d.getHours()) + ':' + zwei(d.getMinutes()) + ':' + zwei(d.getSeconds());
      uhren.forEach((u) => { u.textContent = s; });
    };
    stellen();
    setInterval(stellen, 1000);
  }

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
