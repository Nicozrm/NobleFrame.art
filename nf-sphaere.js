/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Sphaere — das Drahtgitter, das die Seite zusammenhaelt

   Ein Globus aus Meridianen und Breitenkreisen, langsam gedreht, leicht
   dem Zeiger nachgeneigt. Er steht im Hero und noch einmal im Footer —
   dieselbe Form am Anfang und am Ende, damit die Seite einen Rahmen hat
   und nicht nur ein Ende.

   Warum von Hand gebaut und nicht `wireframe: true`:
   Ein Wireframe-Material zeigt die Triangulierung — jede Kugel bekommt
   Diagonalen, die niemand gezeichnet hat, und sieht aus wie ein Netz aus
   der Grafikbibliothek. Meridiane und Breitenkreise sind das, was ein
   Globus tatsaechlich hat. Es sind rund 2400 Punkte in einem einzigen
   Zeichenaufruf, also billiger als jede Bibliothekslösung, und es sieht
   aus wie eine Zeichnung statt wie ein Rechenergebnis.

   ── Die drei Regeln, die diese Datei teuer machen wuerden, wenn sie
      fehlten ─────────────────────────────────────────────────────────

   1. EIN Kontext pro Seite. Nicht einer je Montagepunkt. Die Leinwand
      wird zwischen Hero und Footer umgehaengt, der WebGL-Kontext bleibt
      derselbe. Browser geben pro Dokument nur eine Handvoll Kontexte
      heraus und raeumen die aeltesten still ab — zwei Sphaeren waeren
      also nicht doppelt so schoen, sondern irgendwann gar keine.

   2. Die Sphaere weicht Vanta aus. Auf den Unterseiten haengt das
      Konstellationsnetz im `.page-hero`, auf der Startseite in der
      CTA-Sektion direkt ueber dem Footer. Zwei WebGL-Flaechen in einem
      Blickfeld sind kein doppelter Eindruck, sondern zwei halbe. Ist ein
      Vanta-Wirt im Bild, haelt die Sphaere an und blendet sich aus —
      nicht als Notfall, sondern als Vorfahrtsregel.

   3. Der Loop laeuft nur im Blick. Kein Montagepunkt sichtbar, Tab
      versteckt, Kontext verloren: der Loop endet, statt im Leerlauf
      Bilder zu rechnen. Das ist dasselbe Muster wie in nf-feld.js —
      bewusst kein neuer, dritter Taktgeber-Stil, sondern der, den diese
      Seite schon hat.

   Ausfallverhalten: Bei prefers-reduced-motion, fehlendem WebGL, zu
   schwachem Geraet oder wenn Three.js nicht laedt, passiert schlicht
   nichts. Es gibt keinen Platzhalter, der nachgeladen werden muesste —
   der Footer sah vorher gut aus und sieht dann genauso aus.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const wirte = Array.from(document.querySelectorAll('[data-nf-sphaere]'));
  if (!wirte.length) return;

  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduziert) return;

  /* ── Torwaechter ──────────────────────────────────────────────────────
     Dieselben Schwellen wie beim Netz in nf-tech.js. Sie stehen hier
     noch einmal statt in einer geteilten Datei, weil beide Schichten
     unabhaengig voneinander ausfallen koennen muessen — eine gemeinsame
     Hilfsdatei waere ein gemeinsamer Fehlerpunkt fuer zwei Zugaben, die
     sich sonst nichts teilen.                                          */
  function webglDa() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (_) { return false; }
  }

  function erlaubt() {
    if (matchMedia('(max-width: 768px)').matches) return false;   // Mobil: nie
    if (matchMedia('(pointer: coarse)').matches) return false;    // Touch: nie
    const c = navigator.connection || {};
    if (c.saveData) return false;
    if (/^(slow-)?2g$/.test(c.effectiveType || '')) return false;
    if ((navigator.deviceMemory || 8) < 4) return false;
    if ((navigator.hardwareConcurrency || 8) < 4) return false;
    return webglDa();
  }

  if (!erlaubt()) return;

  /* ── Geteilter Skriptlader ────────────────────────────────────────────
     Three.js wiegt 589 KB. Vanta braucht es und diese Datei braucht es —
     wer zuerst fragt, laedt, der zweite bekommt dasselbe Versprechen
     zurueck. Ohne diesen Zwischenspeicher wuerde die Bibliothek auf den
     Unterseiten zweimal ausgewertet und `window.THREE` mitten im Betrieb
     ersetzt; die bereits laufende Vanta-Szene haengt dann an Klassen, die
     es nicht mehr gibt.                                                 */
  const laden = (src) => {
    const cache = (window.__nfSkript = window.__nfSkript || {});
    if (cache[src]) return cache[src];
    cache[src] = new Promise((ok, fehl) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = ok; s.onerror = fehl;
      document.head.appendChild(s);
    });
    return cache[src];
  };

  /* ── Stil ─────────────────────────────────────────────────────────────
     Aus dem Skript, nicht aus einer CSS-Datei: die Leinwand entsteht hier
     ohnehin erst zur Laufzeit, und eine weitere Datei waere eine weitere
     Anfrage fuer vier Regeln.                                           */
  {
    const css = document.createElement('style');
    css.textContent =
      '.nf-sph-wirt{position:relative}' +
      '.nf-sph-leinwand{position:absolute;inset:0;width:100%;height:100%;' +
      'z-index:0;pointer-events:none;opacity:0;transition:opacity .6s ease}' +
      '.nf-sph-leinwand.an{opacity:1}';
    document.head.appendChild(css);
  }

  /* Inhalte ueber die Leinwand heben — ohne Layouteingriff. Nur
     position:static → relative; das verschiebt nichts, es aendert allein
     die Stapelreihenfolge. Bereits positionierte Deko bleibt unberuehrt.
     Dasselbe Vorgehen wie beim Netz, damit sich beide Schichten in einem
     Wirt gleich verhalten. */
  const wirtVorbereiten = (wirt) => {
    wirt.classList.add('nf-sph-wirt');
    Array.from(wirt.children).forEach((kind) => {
      if (getComputedStyle(kind).position === 'static') {
        kind.style.position = 'relative';
        kind.style.zIndex = '1';
      }
    });
  };
  wirte.forEach(wirtVorbereiten);

  /* ── Vanta-Vorfahrt ───────────────────────────────────────────────────
     Das Netz haengt sich als `.nf-vanta` in seinen Wirt, aber erst wenn
     dessen Sektion in Reichweite kommt — beim Laden dieser Datei gibt es
     das Element also noch nicht. Deshalb wird nicht einmal gesucht,
     sondern der Wirt beobachtet: sobald irgendein Vanta-Wirt im Bild ist,
     tritt die Sphaere zurueck.

     Beobachtet werden die Sektionen, die nf-tech.js als Wirt waehlt —
     dieselbe Auswahl in derselben Reihenfolge.

     Die Vorfahrt ist vergleichend, nicht absolut. Eine Regel „ist das Netz
     irgendwo im Bild, schweigt die Sphaere" klingt sauber und ist auf der
     Startseite falsch: dort liegt die CTA-Sektion unmittelbar ueber dem
     Footer, am Seitenende teilen sich beide den Schirm etwa haelftig
     (gemessen: 46 % zu 54 %) — die Sphaere kaeme nie zum Vorschein.
     Deshalb entscheidet, wer mehr Viewport besitzt. Das ergibt eine
     Uebergabe statt eines Verbots: im Anfahren der CTA gehoert das Bild
     dem Netz, am Grund der Seite dem Globus.                            */
  const vantaWirte = Array.from(document.querySelectorAll('.nf-hero, .page-hero, .cta-section'))
    .filter((el) => !el.hasAttribute('data-nf-sphaere'))
    .slice(0, 1);                   // nf-tech.js bespielt genau einen Wirt

  /* Anteil an der Fensterhoehe, 0..1 — das Mass, in dem hier alles
     verglichen wird. Zwei Aufrufe je Entscheidung, kein Layout-Thrash. */
  const anteil = (el) => {
    const r = el.getBoundingClientRect();
    const sicht = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    return sicht / Math.max(1, innerHeight);
  };

  /* ── Zustand ────────────────────────────────────────────────────────── */
  let THREE = null;
  let renderer = null, szene = null, kamera = null, globus = null;
  let leinwand = null;
  let wirtJetzt = null;          // wo die Leinwand gerade haengt
  let sichtbare = new Set();     // Montagepunkte im Bild
  let laeuft = false, tot = false, gebaut = false;
  let letzter = 0, bildrate = 60;
  let dpr = Math.min(devicePixelRatio || 1, 1.75);
  let neigeZiel = [0, 0], neige = [0, 0];
  let breite = 0, hoehe = 0;

  /* ── Der Globus ───────────────────────────────────────────────────────
     Meridiane und Breitenkreise als ein einziges LineSegments-Objekt:
     jede Linie wird als Punktpaar abgelegt, damit alles in einem
     Zeichenaufruf durchgeht. Ein Ring je Objekt waere lesbarer und
     zwanzigmal so teuer.                                                */
  function globusBauen(radius, meridiane, breitengrade, segmente) {
    const p = [];

    const ring = (fn) => {
      for (let i = 0; i < segmente; i++) {
        const a = (i / segmente) * Math.PI * 2;
        const b = ((i + 1) / segmente) * Math.PI * 2;
        p.push.apply(p, fn(a));
        p.push.apply(p, fn(b));
      }
    };

    // Meridiane: Kreise durch die Pole, um die Y-Achse gedreht.
    for (let m = 0; m < meridiane; m++) {
      const rot = (m / meridiane) * Math.PI;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      ring((a) => {
        const x = Math.cos(a) * radius, y = Math.sin(a) * radius;
        return [x * cos, y, x * sin];
      });
    }

    /* Breitenkreise ohne die Pole selbst: ein Kreis mit Radius 0 waere
       ein Punkt aus `segmente` doppelten Eintraegen. */
    for (let b = 1; b <= breitengrade; b++) {
      const phi = (b / (breitengrade + 1)) * Math.PI - Math.PI / 2;
      const r = Math.cos(phi) * radius, y = Math.sin(phi) * radius;
      ring((a) => [Math.cos(a) * r, y, Math.sin(a) * r]);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }

  /* Ein einzelner Ring in Coral, schraeg gelegt: die Umlaufbahn. Sie ist
     der Grund, warum das Ding nicht wie ein Gitternetzdiagramm aussieht —
     ein Element, das sich nicht an die Ordnung der anderen haelt. */
  function bahnBauen(radius, segmente) {
    const p = [];
    for (let i = 0; i < segmente; i++) {
      const a = (i / segmente) * Math.PI * 2;
      const b = ((i + 1) / segmente) * Math.PI * 2;
      p.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      p.push(Math.cos(b) * radius, 0, Math.sin(b) * radius);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }

  function bauen() {
    if (gebaut) return true;

    try {
      leinwand = document.createElement('canvas');
      leinwand.className = 'nf-sph-leinwand';
      leinwand.setAttribute('aria-hidden', 'true');

      renderer = new THREE.WebGLRenderer({
        canvas: leinwand,
        alpha: true,          // Cream scheint durch — keine eigene Flaeche
        antialias: true,      // Linien ohne Glaettung sind Treppen
        powerPreference: 'low-power',
        depth: false,
        stencil: false
      });
      renderer.setPixelRatio(dpr);
      renderer.setClearAlpha(0);

      szene = new THREE.Scene();
      kamera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      kamera.position.set(0, 0, 3.6);

      globus = new THREE.Group();

      /* Ink statt Coral fuer das Gitter: die Sphaere ist Struktur, kein
         Akzent. Steht sie in der Akzentfarbe, konkurriert sie mit den
         Schaltflaechen darueber und die Seite hat zwei Zentren.

         Deckkraft und Dichte sind zweimal zurueckgenommen worden. Der
         erste Aufbau — zwoelf Meridiane, sieben Breitenkreise, 0.20 —
         stand als Gitternetz hinter den Navigationsspalten des Footers
         und machte deren Beschriftung schlechter lesbar. Ein Motiv, das
         die Funktion darunter beschaedigt, ist keine Zugabe mehr. Neun
         zu fuenf bei 0.11 liest sich als Wasserzeichen: man sieht es,
         wenn man hinsieht, und es steht niemandem im Weg. */
      /* Die Linienfarbe richtet sich nach dem Grund, auf dem der Wirt steht.
         Seit der Farbbogen den Footer nach Tiefe gedreht hat, waere ein
         festes Ink dort unsichtbar — dieselbe Zeile Code, dasselbe Motiv,
         und trotzdem nichts zu sehen. Gefragt wird das Markup, nicht eine
         zweite Liste im Skript: was sich als tief ausweist, bekommt Cream. */
      const tief = wirte.some((w) => w.closest('[data-grund="tief"]'));
      const linie = tief ? 0xECE0C6 : 0x1D1D1D;
      const staerke = tief ? 0.16 : 0.11;

      const gitter = new THREE.LineSegments(
        globusBauen(1, 9, 5, 64),
        new THREE.LineBasicMaterial({
          color: linie, transparent: true, opacity: staerke, depthWrite: false
        })
      );
      globus.add(gitter);

      const bahn = new THREE.LineSegments(
        bahnBauen(1.30, 96),
        new THREE.LineBasicMaterial({
          color: 0xF4583D, transparent: true, opacity: 0.30, depthWrite: false
        })
      );
      bahn.rotation.set(Math.PI * 0.14, 0, Math.PI * 0.20);
      globus.add(bahn);

      globus.rotation.x = 0.22;   // leichte Achsneigung, wie bei einem Globus
      szene.add(globus);

      gebaut = true;
      return true;
    } catch (_) {
      /* Konstruktion fehlgeschlagen: alles wieder abraeumen und still
         verschwinden. Ein halb gebauter Renderer haelt sonst einen
         Kontext fest, den niemand mehr benutzt. */
      abraeumen();
      return false;
    }
  }

  /* ── Messen ───────────────────────────────────────────────────────────
     Gegen den Wirt, nicht gegen das Fenster: Hero und Footer haben
     verschiedene Hoehen, und eine Kugel, die im Footer oval wird, ist
     schlimmer als gar keine.                                            */
  const messen = () => {
    if (!wirtJetzt || !renderer) return;
    const r = wirtJetzt.getBoundingClientRect();
    const b = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (b === breite && h === hoehe) return;
    breite = b; hoehe = h;
    renderer.setSize(b, h, false);
    kamera.aspect = b / h;

    /* Die Sphaere soll in einem flachen Footer nicht oben und unten
       abgeschnitten werden. Deshalb rueckt die Kamera zurueck, sobald der
       Wirt breiter als hoch ist — der Globus bleibt vollstaendig im Bild,
       statt nur seinen Aequator zu zeigen. */
    const eng = Math.min(1, h / Math.max(1, b));
    kamera.position.z = 3.6 + (1 - eng) * 2.1;
    kamera.updateProjectionMatrix();
  };

  /* ── Umhaengen ────────────────────────────────────────────────────────
     Der Kern der Datei: eine Leinwand, mehrere Orte. Beim Wechsel wird
     nichts neu gebaut, nur der Elternknoten getauscht und neu gemessen.
     Der Kontext, die Geometrie und die Materialien bleiben bestehen.    */
  const umhaengen = (wirt) => {
    if (wirt === wirtJetzt) return;
    wirtJetzt = wirt;
    if (!wirt) { leinwand.classList.remove('an'); return; }
    wirt.insertBefore(leinwand, wirt.firstChild);
    breite = 0;                       // Messung erzwingen
    messen();
    /* Erst im naechsten Frame einblenden: sonst sieht man ein Bild lang
       die alte Groesse am neuen Ort. */
    requestAnimationFrame(() => {
      if (wirtJetzt === wirt) leinwand.classList.add('an');
    });
  };

  /* Welcher Montagepunkt bekommt die Sphaere? Der mit dem groessten
     Anteil am Bild — und nur, wenn kein Vanta-Wirt einen groesseren hat.

     Die 0.04-Schwelle haelt den Globus davon ab, fuer einen Streifen von
     vierzig Pixeln anzuspringen, der beim naechsten Radimpuls wieder weg
     ist. Der Gleichstand geht bewusst an das Netz: es war zuerst da.    */
  const wirtWaehlen = () => {
    let bester = null, bestAnteil = 0.04;
    sichtbare.forEach((w) => {
      const a = anteil(w);
      if (a > bestAnteil) { bestAnteil = a; bester = w; }
    });
    if (!bester) return null;

    for (let i = 0; i < vantaWirte.length; i++) {
      if (anteil(vantaWirte[i]) >= bestAnteil) return null;
    }
    return bester;
  };

  /* ── Loop ─────────────────────────────────────────────────────────── */
  const rahmen = (jetzt) => {
    if (tot || document.hidden || !wirtJetzt) { laeuft = false; return; }

    const dt = letzter ? Math.min((jetzt - letzter) / 1000, 0.05) : 0.016;
    letzter = jetzt;

    /* Adaptive Aufloesung, dieselbe Regelung wie im Feld: lieber einmal
       grober rechnen als dauerhaft Bilder fallen lassen. */
    bildrate += ((1 / Math.max(dt, 0.001)) - bildrate) * 0.05;
    if (bildrate < 45 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.35);
      renderer.setPixelRatio(dpr);
      breite = 0; messen();
      bildrate = 60;
    }

    messen();

    // Grunddrehung: eine Umdrehung in gut 60 Sekunden.
    globus.rotation.y += dt * 0.105;

    /* Der Zeiger neigt den Globus, er dreht ihn nicht. Nachgezogen, weil
       eine direkt gesetzte Neigung bei jedem Mausruck springt. */
    neige[0] += (neigeZiel[0] - neige[0]) * 0.045;
    neige[1] += (neigeZiel[1] - neige[1]) * 0.045;
    globus.rotation.x = 0.22 + neige[1] * 0.30;
    globus.rotation.z = neige[0] * -0.13;

    renderer.render(szene, kamera);
    requestAnimationFrame(rahmen);
  };

  const anwerfen = () => {
    if (laeuft || tot || document.hidden || !wirtJetzt) return;
    laeuft = true; letzter = 0;
    requestAnimationFrame(rahmen);
  };

  /* ── Schaltstelle ─────────────────────────────────────────────────────
     Jede Zustandsaenderung — Sichtbarkeit, Vanta, Tabwechsel — laeuft
     hier zusammen. Ein Ort, an dem entschieden wird, ob und wo gerendert
     wird, statt drei Stellen, die sich gegenseitig ueberschreiben.      */
  let holt = false;
  function pruefen() {
    if (tot) return;

    const ziel = wirtWaehlen();

    if (!ziel) {                      // nichts zu zeigen: anhalten
      if (leinwand) leinwand.classList.remove('an');
      wirtJetzt = null; laeuft = false;
      return;
    }

    if (!gebaut) {                    // erster Bedarf: jetzt erst laden
      if (holt) return;
      holt = true;
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
      idle(() => {
        laden('vendor/three.min.js')
          .then(() => {
            holt = false;
            if (tot || !window.THREE) return;
            THREE = window.THREE;
            if (!bauen()) { tot = true; return; }
            leinwandBinden();
            pruefen();
          })
          .catch(() => { holt = false; /* still: Footer bleibt wie er war */ });
      });
      return;
    }

    umhaengen(ziel);
    anwerfen();
  }

  /* ── Aufraeumen ───────────────────────────────────────────────────── */
  function abraeumen() {
    laeuft = false;
    try { if (globus) globus.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    }); } catch (_) { /* noop */ }
    try { if (renderer) renderer.dispose(); } catch (_) { /* noop */ }
    try { if (leinwand && leinwand.parentNode) leinwand.parentNode.removeChild(leinwand); } catch (_) { /* noop */ }
    renderer = null; szene = null; kamera = null; globus = null;
    gebaut = false;
  }

  /* Kontextverlust ist kein Fehler, sondern ein normaler Vorgang: das
     Betriebssystem darf den Kontext jederzeit einziehen. Danach steht der
     Footer ohne Sphaere — und niemand sieht eine kaputte Seite. */
  function leinwandBinden() {
    leinwand.addEventListener('webglcontextlost', (e) => {
      e.preventDefault(); tot = true; laeuft = false;
      leinwand.classList.remove('an');
    });
  }

  /* ── Beobachter & Ereignisse ──────────────────────────────────────── */
  const wache = new IntersectionObserver((eintraege) => {
    eintraege.forEach((e) => {
      if (e.isIntersecting) sichtbare.add(e.target);
      else sichtbare.delete(e.target);
    });
    pruefen();
  }, { threshold: 0.01, rootMargin: '120px 0px' });
  wirte.forEach((w) => wache.observe(w));

  addEventListener('pointermove', (e) => {
    /* Gegen das Fenster gemessen, nicht gegen den Wirt: der Zeiger neigt
       den Globus auch, wenn er nicht ueber ihm steht — sonst reagiert die
       Sphaere im Footer erst, wenn man sie schon fast beruehrt. */
    neigeZiel[0] = (e.clientX / Math.max(1, innerWidth)) * 2 - 1;
    neigeZiel[1] = (e.clientY / Math.max(1, innerHeight)) * 2 - 1;
  }, { passive: true });

  /* Die Uebergabe zwischen Netz und Globus haengt an Flaechenanteilen, und
     die aendern sich mit jedem Pixel Scroll — der Beobachter oben meldet
     aber nur das Ueberschreiten seiner Schwellen. Ohne diesen Anstoss
     bliebe die Sphaere genau dort stehen, wo der letzte Schwellenwert
     gefallen ist. Auf einen Frame gedrosselt: die Pruefung selbst kostet
     zwei Messungen, aber sie soll nicht dreimal je Bild laufen. */
  let scrollWartet = false;
  addEventListener('scroll', () => {
    if (scrollWartet) return;
    scrollWartet = true;
    requestAnimationFrame(() => { scrollWartet = false; pruefen(); });
  }, { passive: true });

  let messTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(messTimer);
    messTimer = setTimeout(() => { breite = 0; messen(); }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { if (!document.hidden) pruefen(); });

  addEventListener('pagehide', () => { tot = true; abraeumen(); });

  pruefen();
})();
