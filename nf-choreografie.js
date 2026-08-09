/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Choreografie — die Scrollstrecke

   Diese Schicht macht aus einer Abfolge von Sektionen eine Fahrt. Sie nutzt
   die Motoren, die ohnehin an Bord sind — Lenis fuer den Scrollstrom,
   die vorhandene WebGL-Ebene fuer die Atmosphaere — und fuegt das hinzu,
   was zwischen ihnen fehlte: eine Dramaturgie.

   Sechs Bausteine:

   1. Marken & Masken   — Sektionskoordinaten und Ueberschriften, die aus
                          ihrer eigenen Kante aufsteigen (IntersectionObserver)
   2. Wort-Scrub        — ein Satz, der sich beim Lesen aufhellt
   3. Horizontalfahrt   — gepinnte Buehne, Bahn 1:1 am Scroll, Bilder mit
                          Gegenversatz
   4. Laufband          — Grunddrift plus Scrollgeschwindigkeit, mit Vorzeichen
   5. Rollentext        — Beschriftungen werden getauscht, nicht aufgehellt
   6. Zaehlwerk & Fahrtanzeige — Zahlen laufen hoch, der Stand steht rechts unten

   Warum genau ein rAF-Loop: jeder zusaetzliche Loop ist ein zweiter
   Taktgeber, der gegen den ersten laeuft. Hier lesen alle scrollabhaengigen
   Teile denselben Frame und schreiben in derselben Phase — Lesen zuerst,
   Schreiben danach, kein erzwungenes Reflow-Pingpong.

   Der Loop laeuft nur, wenn er etwas zu tun hat: er stoppt bei verstecktem
   Tab und wenn kein scrollabhaengiges Element im Blick ist.

   Ausfallverhalten: Ohne JavaScript oder bei einem Fehler in dieser Datei
   bleibt html.nf-choreo aus — dann versteckt kein Stylesheet etwas, die
   Bahn ist eine Liste, der Satz steht voll da. Bei prefers-reduced-motion
   wird zusaetzlich html.nf-statisch gesetzt: dasselbe Markup, kein Transport.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const wurzel = document.documentElement;
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;

  wurzel.classList.add('nf-choreo');
  if (reduziert) wurzel.classList.add('nf-statisch');

  /* ── Werkzeug ───────────────────────────────────────────────────────── */
  const klemme = (v, a, b) => v < a ? a : (v > b ? b : v);
  const alle = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* Ein Beobachter fuer alles, was beim Eintritt genau einmal etwas tut.
     Ein zweiter Observer waere kein zweiter Gedanke, nur ein zweiter
     Callback im selben Frame. */
  const eintritt = new IntersectionObserver((eintraege) => {
    eintraege.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const fn = e.target.__nfEintritt;
      if (fn) { fn(); e.target.__nfEintritt = null; }
      eintritt.unobserve(e.target);
    });
  }, { threshold: .2, rootMargin: '0px 0px -6% 0px' });

  /* ═══ 1. Marken & Masken ══════════════════════════════════════════════ */
  alle('.nf-marke').forEach((el) => eintritt.observe(el));

  /* Die Ueberschrift wird nicht ersetzt, sondern eingepackt: ihre inneren
     Auszeichnungen (das goldene <span>) bleiben unangetastet. */
  alle('[data-nf-maske]').forEach((el) => {
    const innen = document.createElement('span');
    innen.className = 'nf-maske-i';
    while (el.firstChild) innen.appendChild(el.firstChild);
    el.appendChild(innen);
    el.classList.add('nf-maske');
    eintritt.observe(el);
  });

  /* ═══ 1b. Sucherrahmen ════════════════════════════════════════════════
     Vier Haarlinien-Ecken, die nur ueber den dunklen Abschnitten stehen —
     der Kinosequenz und dem Feld. Dort ist der Blick ein Sucher. Auf
     Cream waere derselbe Rahmen eine Verzierung, deshalb geht er dort aus.

     Ein eigener Beobachter, weil dieser mehrfach schaltet: der obige
     meldet jedes Ziel genau einmal und gibt es dann frei. */
  const rahmenEl = document.getElementById('nfRahmen');
  const dunkel = alle('.cine-wrap, .nf-feld');
  if (rahmenEl && dunkel.length){
    const drin = new Set();
    const wache = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => {
        if (e.isIntersecting) drin.add(e.target); else drin.delete(e.target);
      });
      const imDunkeln = drin.size > 0;
      rahmenEl.classList.toggle('an', imDunkeln);
      /* Das Feld bringt eine eigene Anzeige mit (die Uniform-Werte). Die
         Fahrtanzeige stuende an derselben Ecke und saehe aus wie ein
         zweiter Zaehler ueber demselben Wert. Sie tritt zurueck. */
      wurzel.classList.toggle('nf-dunkel', imDunkeln);
    }, { threshold: .35 });
    dunkel.forEach((el) => wache.observe(el));
  }

  /* ═══ 2. Wort-Scrub ═══════════════════════════════════════════════════
     Der Satz wird in Woerter zerlegt. Jedes Wort bekommt ein eigenes
     Fenster auf der Scrollstrecke des Blocks, leicht gegeneinander
     versetzt — dadurch wandert die Helligkeit durch den Satz, statt ihn
     als Ganzes hochzudrehen.

     Nur Textknoten werden zerlegt: vorhandene Auszeichnungen im Satz
     bleiben als Elemente erhalten und werden mitgezaehlt. */
  const scrubs = [];
  alle('[data-nf-scrub]').forEach((block) => {
    const schluessel = (block.dataset.nfSchluessel || '')
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const woerter = [];

    const zerlegen = (knoten) => {
      Array.from(knoten.childNodes).forEach((k) => {
        if (k.nodeType === 3) {
          const teile = k.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          teile.forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const s = document.createElement('span');
            s.className = 'nf-wort';
            s.textContent = t;
            const nackt = t.replace(/[^\wäöüß]/gi, '').toLowerCase();
            if (schluessel.includes(nackt)) s.classList.add('nf-schluessel');
            frag.appendChild(s);
            woerter.push(s);
          });
          knoten.replaceChild(frag, k);
        } else if (k.nodeType === 1) {
          zerlegen(k);
        }
      });
    };
    zerlegen(block);
    block.classList.add('nf-scrub');
    if (woerter.length) scrubs.push({ block, woerter });
  });

  /* ═══ 3. Horizontalfahrt ══════════════════════════════════════════════
     Die Buehne klebt oben, die Bahn faehrt seitlich. Die Hoehe der
     Huelle ist keine Designentscheidung, sondern eine Rechnung: so viel
     Scrollweg, wie die Bahn Ueberhang hat — plus eine Viewporthoehe, in
     der die Buehne steht. Dadurch faehrt die Bahn 1:1 mit dem Rad, nicht
     schneller und nicht langsamer als die Hand.

     Kein Federglied dazwischen: eine Feder auf einer Scrub-Achse fuehlt
     sich nicht weich an, sondern lose. */
  const bahnen = [];
  alle('[data-nf-pin]').forEach((huelle) => {
    const bahn = huelle.querySelector('[data-nf-bahn]');
    const stand = huelle.querySelector('[data-nf-stand]');
    if (!bahn) return;
    bahnen.push({ huelle, bahn, stand, weg: 0, oben: 0, karten: alle('.live-card, .nf-endkarte', bahn) });
  });

  const bahnenMessen = () => {
    const aus = !wurzel.classList.contains('nf-choreo')
      || wurzel.classList.contains('nf-statisch')
      || innerWidth < 1025;
    bahnen.forEach((b) => {
      if (aus) {
        b.huelle.style.height = '';
        b.bahn.style.transform = '';
        b.weg = 0;
        b.karten.forEach((k) => {
          const bild = k.querySelector('.live-shot img');
          if (bild) bild.style.removeProperty('--nf-gegen');
        });
        return;
      }
      /* Nicht scrollWidth: Chromium zaehlt den rechten Innenabstand eines
         Flex-Containers nicht mit, die Bahn haette 72 px zu frueh gehalten
         und die letzte Karte waere nie ganz angekommen. Gemessen wird
         deshalb die rechte Kante der letzten Karte plus dieser Abstand.

         Vorher die Transformation zuruecksetzen — sonst misst der Rect die
         Bahn dort, wo die letzte Fahrt sie stehen liess. */
      b.bahn.style.transform = '';
      const letzte = b.bahn.lastElementChild;
      const padRechts = parseFloat(getComputedStyle(b.bahn).paddingRight) || 0;
      const inhalt = letzte
        ? (letzte.getBoundingClientRect().right - b.bahn.getBoundingClientRect().left) + padRechts
        : b.bahn.scrollWidth;
      b.weg = Math.max(0, Math.round(inhalt) - innerWidth);
      b.huelle.style.height = (b.weg + innerHeight) + 'px';
      /* offsetTop waere hier falsch: es misst gegen den offsetParent, und
         die Huelle liegt in einer positionierten Sektion — die Fahrt haette
         an der falschen Linie begonnen. Der Rect plus Scrollstand misst
         immer gegen das Dokument. Einmal hier, nicht pro Frame. */
      b.oben = b.huelle.getBoundingClientRect().top + scrollY;
    });
  };

  /* ═══ 3b. Tiefe ═══════════════════════════════════════════════════════
     Bis hierher hatte die Seite zwei Stellen, an denen Scrollen etwas
     bewegt — die Kinosequenz und die Bahn. Dazwischen blendete Inhalt
     einmal ein und stand dann still, waehrend man daran vorbeizog. Das
     ist der Unterschied zwischen einer Seite, die reagiert, und einer,
     die nur Zustaende hat.

     Diese Schicht koppelt Elemente durchgehend an den Scroll. Zwei
     Angaben genuegen:

       data-nf-tiefe="0.14"   senkrechter Versatz, Anteil der Elementhoehe
       data-nf-zug="0.5"      waagerechter Versatz, Anteil der Breite

     Das Vorzeichen ist die Tiefe: positiv zieht schneller als die Seite
     (naeher), negativ langsamer (weiter weg). Dass beide Werte relativ
     sind, ist wichtig — ein fester Pixelwert waere auf einem Telefon ein
     Sprung und auf einem grossen Schirm unsichtbar.

     Gemessen wird der Fortschritt eines Elements durch das Fenster:
     0, wenn seine Oberkante gerade unten hereinkommt, 1, wenn seine
     Unterkante oben verschwindet. Der Versatz ist darauf zentriert, damit
     jedes Element auf halber Strecke exakt dort steht, wo es im Layout
     steht — sonst verschoebe die Tiefe das Design statt es zu beleben. */
  const tiefen = [];
  alle('[data-nf-tiefe], [data-nf-zug]').forEach((el) => {
    tiefen.push({
      el,
      y: parseFloat(el.dataset.nfTiefe) || 0,
      x: parseFloat(el.dataset.nfZug) || 0
    });
  });

  /* ═══ 4. Laufband ═════════════════════════════════════════════════════
     Das Band braucht doppelten Inhalt, damit der Ruecksprung an der
     Nahtstelle unsichtbar ist. Verdoppelt wird einmal, nicht pro Frame. */
  const baender = [];
  if (!reduziert) {
    alle('[data-nf-laufband]').forEach((spur) => {
      const original = spur.innerHTML;
      spur.innerHTML = original + original;
      spur.setAttribute('aria-hidden', 'false');
      baender.push({ spur, x: 0, breite: 0 });
    });
  }
  const baenderMessen = () => {
    baender.forEach((b) => { b.breite = b.spur.scrollWidth / 2; });
  };

  /* ═══ 5. Rollentext ═══════════════════════════════════════════════════
     Nur reine Textbeschriftungen: sobald ein Link ein Icon oder eigene
     Auszeichnung enthaelt, bliebe von der zweiten Zeile ein leerer
     Kasten stehen. Solche Links behalten ihr bisheriges Verhalten. */
  alle('[data-nf-roll]').forEach((el) => {
    const text = el.textContent.trim();
    if (!text || el.children.length) return;
    el.textContent = '';
    const maske = document.createElement('span');
    maske.className = 'nf-roll';
    const a = document.createElement('span');
    a.className = 'nf-roll-a';
    a.textContent = text;
    const b = document.createElement('span');
    b.className = 'nf-roll-b';
    b.textContent = text;
    b.setAttribute('aria-hidden', 'true');
    maske.appendChild(a);
    maske.appendChild(b);
    el.appendChild(maske);
  });

  /* ═══ 6. Zaehlwerk ════════════════════════════════════════════════════
     Zahlen laufen einmal hoch, wenn sie in den Blick kommen. Gezaehlt
     wird nur, was auch eine Zahl ist — „Headless" bleibt „Headless".
     Die Breite ist vorher reserviert, damit das Layout beim Zaehlen
     nicht springt. */
  if (!reduziert) {
    alle('[data-nf-zaehl]').forEach((el) => {
      const roh = el.textContent.trim().replace(/\./g, '').replace(',', '.');
      const ziel = parseFloat(roh);
      if (!isFinite(ziel) || ziel <= 0) return;
      const nachkomma = (roh.split('.')[1] || '').length;
      const fmt = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma
      });
      const endtext = el.textContent;
      el.style.display = 'inline-block';
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      el.__nfEintritt = () => {
        const start = performance.now();
        const dauer = 1100;
        const tick = (jetzt) => {
          const t = klemme((jetzt - start) / dauer, 0, 1);
          const e = 1 - Math.pow(1 - t, 4); // easeOutQuart
          el.textContent = t < 1 ? fmt.format(ziel * e) : endtext;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      eintritt.observe(el);
    });
  }

  /* Fahrtanzeige */
  let readout = null;
  if (!reduziert) {
    readout = document.createElement('div');
    readout.className = 'nf-readout';
    readout.setAttribute('aria-hidden', 'true');
    readout.innerHTML = 'Fahrt <b>000</b>%';
    document.body.appendChild(readout);
  }
  const readoutWert = readout ? readout.querySelector('b') : null;
  let readoutLetzter = -1;

  /* ═══ Der Loop ════════════════════════════════════════════════════════
     Eine Runde: erst alles lesen, dann alles schreiben. Dazwischen wird
     nichts abgefragt, was das Layout neu berechnen liesse. */
  let laeuft = false;
  let letzterFrame = 0;

  const rahmen = (jetzt) => {
    if (document.hidden) { laeuft = false; return; }
    const dt = letzterFrame ? klemme((jetzt - letzterFrame) / 1000, 0, .05) : .016;
    letzterFrame = jetzt;

    /* ── Lesen ── */
    const y = scrollY;
    const hoehe = innerHeight;
    const dok = document.documentElement.scrollHeight - hoehe;
    /* Lenis fuehrt bereits eine geglaettete Geschwindigkeit mit — die
       nochmal selbst zu messen hiesse, zwei Wahrheiten ueber dieselbe
       Bewegung zu haben. */
    const tempo = (window.__nfLenis && window.__nfLenis.velocity) || 0;

    /* ── Schreiben ── */

    // Wort-Scrub
    for (let i = 0; i < scrubs.length; i++) {
      const s = scrubs[i];
      const r = s.block.getBoundingClientRect();
      if (r.bottom < -200 || r.top > hoehe + 200) continue;
      /* Fenster: der Block beginnt bei 85 % Viewporthoehe zu leuchten und
         ist bei 45 % durch — der Satz ist also fertig, bevor er den
         oberen Rand erreicht, und nicht erst danach. */
      const start = hoehe * .85;
      const ende = hoehe * .45;
      const p = klemme((start - r.top) / Math.max(1, (start - ende) + r.height * .6), 0, 1);
      const n = s.woerter.length;
      for (let j = 0; j < n; j++) {
        const w = s.woerter[j];
        const eigen = klemme((p * (n + 6) - j) / 5, 0, 1);
        w.style.opacity = (.16 + eigen * .84).toFixed(3);
        if (w.classList.contains('nf-schluessel')) w.classList.toggle('hell', eigen > .6);
      }
    }

    // Horizontalfahrt
    for (let i = 0; i < bahnen.length; i++) {
      const b = bahnen[i];
      if (!b.weg) continue;
      const p = klemme((y - b.oben) / b.weg, 0, 1);
      b.bahn.style.transform = 'translate3d(' + (-p * b.weg).toFixed(2) + 'px,0,0)';
      // Gegenversatz der Bilder: die Karte wird zum Fenster.
      const gegen = (p * 2 - 1) * 5;
      for (let k = 0; k < b.karten.length; k++) {
        const bild = b.karten[k].querySelector('.live-shot img');
        if (bild) bild.style.setProperty('--nf-gegen', gegen.toFixed(2) + '%');
      }
      if (b.stand) {
        const nr = Math.min(b.karten.length, Math.floor(p * b.karten.length) + 1);
        const soll = String(nr).padStart(2, '0');
        if (b.stand.textContent !== soll) b.stand.textContent = soll;
      }
    }

    // Tiefe: durchgehende Kopplung an den Scroll.
    for (let i = 0; i < tiefen.length; i++) {
      const t = tiefen[i];
      const r = t.el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > hoehe + 120) continue;
      /* -0.5 .. +0.5 ueber die gesamte Durchfahrt, 0 in der Mitte. */
      const p = ((hoehe - r.top) / (hoehe + r.height)) - 0.5;
      const dy = t.y ? (-p * t.y * r.height).toFixed(2) : 0;
      const dx = t.x ? (-p * t.x * r.width).toFixed(2) : 0;
      t.el.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
    }

    // Laufband: Grunddrift plus Scrollgeschwindigkeit mit Vorzeichen.
    for (let i = 0; i < baender.length; i++) {
      const m = baender[i];
      if (!m.breite) continue;
      const schub = klemme(tempo * 1.6, -420, 420);
      m.x -= (46 + Math.abs(schub) * .6) * dt * (schub < -60 ? -1 : 1);
      if (m.x <= -m.breite) m.x += m.breite;
      if (m.x > 0) m.x -= m.breite;
      m.spur.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
    }

    // Fahrtanzeige
    if (readoutWert && dok > 0) {
      const pr = Math.round(klemme(y / dok, 0, 1) * 100);
      if (pr !== readoutLetzter) {
        readoutLetzter = pr;
        readoutWert.textContent = String(pr).padStart(3, '0');
      }
    }

    requestAnimationFrame(rahmen);
  };

  const anwerfen = () => {
    if (laeuft || document.hidden) return;
    laeuft = true;
    letzterFrame = 0;
    requestAnimationFrame(rahmen);
  };

  /* Der Loop haengt am Scroll, nicht an der Uhr: er wird beim Scrollen
     angeworfen und laeuft weiter, solange der Tab sichtbar ist. Das
     Laufband braucht ihn ohnehin dauerhaft — es driftet auch im Stand. */
  addEventListener('scroll', anwerfen, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) anwerfen();
  });

  /* Messen erst, wenn Schriften und Bilder stehen: eine Bahn, die vor dem
     Font-Swap gemessen wurde, faehrt danach am Ziel vorbei. */
  const messen = () => { bahnenMessen(); baenderMessen(); };
  messen();
  addEventListener('load', messen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(messen).catch(() => {});

  let messTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(messTimer);
    messTimer = setTimeout(messen, 150);
  }, { passive: true });

  anwerfen();
})();
