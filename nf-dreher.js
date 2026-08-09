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

  /* Die Zeile soll beim Wechsel nicht springen: der Schacht bekommt die
     Breite des breitesten Wortes als Untergrenze und wandert von dort aus
     nur noch nach oben, nie zurueck unter das, was schon stand. */
  schacht.style.display = 'inline-block';
  schacht.style.transition = 'width .5s cubic-bezier(.76,0,.24,1)';
  schacht.style.width = messen(worte[0]).toFixed(1) + 'px';

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

    // Breite zuerst: sie laeuft parallel zur Fahrt, nicht danach.
    schacht.style.width = messen(naechstes).toFixed(1) + 'px';

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

  addEventListener('resize', () => {
    const jetzt = schacht.querySelector('.nf-wort-alt');
    if (jetzt) schacht.style.width = messen(jetzt.textContent).toFixed(1) + 'px';
  }, { passive: true });

  takten();
})();
