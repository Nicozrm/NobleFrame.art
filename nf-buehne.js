/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Buehne — Vorladeanzeige, Uhr, Vollbildmenue, Wechselwort

   Vier Auftritte, die die Seite als Auffuehrung rahmen statt als Dokument.

   ── Zur Vorladeanzeige, weil sie eine Vorgeschichte hat ────────────────

   Diese Seite hatte einmal einen Bootscreen mit Prozentzaehler. Der
   Zaehler war eine Animation, der „Bootvorgang" ein setTimeout ueber
   6,5 Sekunden, und geladen wurde in dieser Zeit nichts. Das war der
   schaedlichste Einzelbestandteil der alten Seite: ein Ladebalken fuer
   einen Ladevorgang, den es nicht gab, auf einer Seite, die mit sauberem
   Code wirbt.

   Diese hier zaehlt echte Dinge: Schriften, Bilder, das Dokument selbst.
   Sie hat keine Mindestdauer. Ist alles schon da — zweiter Besuch, warmer
   Cache —, ist sie einen Frame lang zu sehen und dann weg. Sie verzoegert
   nichts; sie zeigt nur an, was ohnehin passiert.

   Der Unterschied ist nicht kosmetisch. Ein Zaehler, der wartet, ist eine
   Behauptung. Ein Zaehler, der misst, ist ein Instrument.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const mono2 = (n) => String(n).padStart(2, '0');

  /* ═══ 1. Vorladeanzeige ═══════════════════════════════════════════════ */
  const vorhang = document.getElementById('curtainOverlay');
  const zaehler = document.querySelector('[data-nf-zaehler]');
  const balken  = document.querySelector('[data-nf-balken]');

  if (vorhang) {
    /* Die Bezugsgroesse: alles, worauf zu warten sich lohnt. Skripte sind
       nicht dabei — sie sind defer, also blockieren sie ohnehin nichts.

       Bilder mit loading="lazy" zaehlen ausdruecklich nicht mit. Sie
       laden erst, wenn man zu ihnen scrollt, also nie waehrend dieser
       Anzeige: sie stuenden fuer immer im Nenner und der Zaehler bliebe
       bei achtundzwanzig Prozent stehen. Genau das tat er. */
    const bilder = Array.from(document.images).filter((b) => b.loading !== 'lazy');
    const posten = 1 /* Schriften */ + 1 /* load */ + bilder.length;
    let erledigt = 0;
    let angezeigt = 0;
    let fertig = false;

    const melden = () => { erledigt++; };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(melden).catch(melden);
    } else {
      melden();
    }
    bilder.forEach((b) => {
      if (b.complete) { melden(); return; }
      b.addEventListener('load', melden, { once: true });
      b.addEventListener('error', melden, { once: true });
    });
    if (document.readyState === 'complete') melden();
    else addEventListener('load', melden, { once: true });

    const oeffnen = () => {
      if (fertig) return;
      fertig = true;
      vorhang.classList.add('open');
      /* Der Vorhang liegt ueber allem und faengt sonst Klicks ab, auch
         wenn man ihn nicht mehr sieht. */
      setTimeout(() => { vorhang.style.display = 'none'; }, 1400);
    };

    const tick = () => {
      const echt = posten ? erledigt / posten : 1;
      /* Die Anzeige zieht der Wahrheit hinterher, statt zu springen — aber
         sie ueberholt sie nie. Was sie zeigt, ist immer hoechstens so viel,
         wie tatsaechlich fertig ist. */
      angezeigt += (echt - angezeigt) * 0.18;
      if (echt >= 1 && angezeigt > 0.995) angezeigt = 1;

      const p = Math.floor(angezeigt * 100);
      if (zaehler) zaehler.textContent = p === 100 ? 'BEREIT' : String(p).padStart(3, '0');
      if (balken) balken.style.transform = 'scaleX(' + angezeigt.toFixed(4) + ')';

      if (angezeigt >= 1) { oeffnen(); return; }
      requestAnimationFrame(tick);
    };
    /* Erst zeigen, wenn wirklich gemessen wird. Bis dieses Skript laeuft,
       stuende dort eine Null, die nichts bedeutet — sie saehe aus wie ein
       haengender Zaehler, obwohl nur noch niemand zaehlt. */
    document.querySelector('.nf-lade').classList.add('an');
    requestAnimationFrame(tick);

    /* Sicherung: wenn ein Bild weder load noch error meldet (das kommt bei
       abgebrochenen Verbindungen vor), darf der Vorhang nicht stehen
       bleiben. Nach vier Sekunden geht er auf, egal was die Zaehlung sagt.
       Ein Vorhang, der klemmt, ist schlimmer als eine ungenaue Zahl. */
    setTimeout(oeffnen, 4000);
  }

  /* ═══ 2. Uhr ══════════════════════════════════════════════════════════
     Die Ortszeit des Ateliers. Sie sagt nichts Wichtiges — sie sagt, dass
     hier jemand ist. Deshalb laeuft sie sekundengenau und nicht in
     Minuten: eine Minutenanzeige sieht aus wie ein Datenfeld, eine
     Sekundenanzeige sieht aus wie ein Puls. */
  const uhren = Array.from(document.querySelectorAll('[data-nf-uhr]'));
  if (uhren.length) {
    const stellen = () => {
      const d = new Date();
      const t = mono2(d.getHours()) + ':' + mono2(d.getMinutes()) + ':' + mono2(d.getSeconds());
      uhren.forEach((u) => { u.textContent = t; });
    };
    stellen();
    setInterval(stellen, 1000);
  }

  /* ═══ 3. Wechselwort ══════════════════════════════════════════════════
     Ein Wort in der Ueberschrift wird ausgetauscht, nicht ueberblendet:
     das alte faehrt nach oben aus seiner Maske, das neue von unten hinein.
     Die Breite wird auf das laengste Wort festgestellt, sonst zappelt die
     ganze Zeile bei jedem Wechsel.

     Steht bei reduzierter Bewegung still — dann bleibt das erste Wort. */
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-nf-wechsel]').forEach((el) => {
    const woerter = el.dataset.nfWechsel.split(',').map((w) => w.trim()).filter(Boolean);
    if (woerter.length < 2) return;

    /* Breite messen, bevor irgendetwas ersetzt wird. */
    const messer = document.createElement('span');
    messer.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    el.appendChild(messer);
    let breit = 0;
    woerter.forEach((w) => {
      messer.textContent = w;
      breit = Math.max(breit, messer.getBoundingClientRect().width);
    });
    messer.remove();
    el.style.minWidth = Math.ceil(breit) + 'px';

    el.textContent = '';
    const innen = document.createElement('span');
    innen.className = 'nf-wechsel-i';
    innen.textContent = woerter[0];
    el.appendChild(innen);

    if (reduziert) return;

    let i = 0;
    setInterval(() => {
      i = (i + 1) % woerter.length;
      innen.classList.add('raus');
      /* Der Tausch passiert am Ende der Ausfahrt, nicht in ihrer Mitte —
         sonst sieht man das Wort wechseln, statt es ersetzt zu bekommen. */
      setTimeout(() => {
        innen.textContent = woerter[i];
        innen.classList.remove('raus');
        innen.classList.add('rein');
        requestAnimationFrame(() => requestAnimationFrame(() => innen.classList.remove('rein')));
      }, 320);
    }, 2600);
  });
})();
