/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Tech Layer — Lenis · Vanta/Three.js WebGL · Scroll-Motion
   ─────────────────────────────────────────────────────────────────────────
   Rein additiv und layout-neutral: kein Eingriff in Design, Inhalt oder
   bestehende Seiten-Logik (Reveals, Magnetic, Cinematic Engine laufen
   unverändert weiter). Drei Bausteine:

   1. Lenis            — trägheitsbasiertes Smooth-Scrolling (lenis.dev).
                         Ersetzt das CSS-`scroll-behavior:smooth`, nutzt den
                         echten Scrollstrom → alle scrollbasierten Features
                         (Nav, Fortschritt, Cinematic-Scrub) funktionieren
                         unverändert, nur geschmeidiger. In-Page-Anker werden
                         über Lenis mit Nav-Offset angesteuert.
   2. Vanta.NET        — WebGL-Konstellation (Three.js) im Seiten-Hero bzw.
                         in der CTA-Sektion der Startseite. Gold auf Schwarz,
                         `mix-blend-mode:screen` → das Netz verschmilzt mit
                         den vorhandenen .bg-effects statt sie zu überdecken.
                         Mausreaktiv, renderpausiert außerhalb des Viewports.
   3. Glow-Parallax    — die Ambient-Glows der Seiten driftet gestaffelt
                         mit dem Scroll (Tiefenwirkung, transform-only).

   Robustheit: komplett deaktiviert bei prefers-reduced-motion; WebGL wird
   vorab getestet — schlägt Context oder Init fehl, bleibt das statische
   Design exakt wie bisher (still fallback). Zerstörung bei pagehide.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GOLD = 0xF4583D;

  /* ── 1. Lenis Smooth Scroll ─────────────────────────────────────────── */
  let lenis = null;
  if (!reduced && typeof window.Lenis === 'function') {
    try {
      // Natives CSS-Smoothing abklemmen — Lenis übernimmt das Gefühl.
      document.documentElement.style.scrollBehavior = 'auto';
      /* lerp 0.095 lief nach einem Radimpuls 771 ms nach (138 ms bis zur
         halben Strecke) — das ist Glide, nicht Glaettung, und der Scroll
         gehoert waehrenddessen nicht mehr der Person, die ihn ausgeloest
         hat. 0.2 misst 50 ms / 362 ms: die Traegheit bleibt spuerbar, die
         Eingabe bleibt direkt. */
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.2,
        smoothWheel: true,
        wheelMultiplier: 1
      });
      // Für die Shader-Ebene (nf-shader.js liest hier die Scroll-Velocity)
      window.__nfLenis = lenis;

      // In-Page-Anker (#ziele) über Lenis anfahren — mit Offset für die
      // fixe Navigation. Capture-Phase: läuft vor den Seiten-Handlern und
      // ersetzt deren scrollIntoView gezielt (stopPropagation).
      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href.length < 2) return;
        let target = null;
        try { target = document.querySelector(href); } catch (_) { return; }
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        // Offenes Mobilmenü schließen (Seitenverhalten spiegeln)
        const menu = document.getElementById('mobileMenu');
        const toggle = document.getElementById('navMobileToggle');
        if (menu && menu.classList.contains('active')) {
          menu.classList.remove('active');
          if (toggle) toggle.classList.remove('active');
          document.body.style.overflow = '';
        }
        /* 1,4 s fuer einen Ankersprung ist eine Reise, keine Navigation.
           0,7 s liest sich als Bewegung und laesst niemanden warten. */
        lenis.scrollTo(target, { offset: -92, duration: 0.7 });
      }, true);
    } catch (_) { lenis = null; }
  }

  /* ── 2. Vanta.NET WebGL-Konstellation im Hero ───────────────────────────
     Three.js wiegt 589 KB (145 KB gzip) und blockiert beim eager Laden den
     Hauptthread lange genug, um den ersten Bildaufbau um Sekunden zu
     verzögern. Deshalb: nichts davon liegt im HTML. Der Stack wird erst
     geholt, wenn die Zielsektion in Reichweite kommt — und auf Geräten, die
     ihn ohnehin nicht tragen, nie. Das Netz ist eine Zugabe; die Seite ist
     ohne es vollständig.                                                  */
  function webglAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (_) { return false; }
  }

  /* Geräte, die den Stack nicht bekommen sollen. Jede Bedingung einzeln
     ausreichend — im Zweifel lieber ohne Netz als mit Ruckeln. */
  function vantaAllowed() {
    if (reduced) return false;
    if (matchMedia('(max-width: 768px)').matches) return false;   // Mobil: nie
    if (matchMedia('(pointer: coarse)').matches) return false;    // Touch: nie
    const c = navigator.connection || {};
    if (c.saveData) return false;                                 // Datensparmodus
    if (/^(slow-)?2g$/.test(c.effectiveType || '')) return false;
    if ((navigator.deviceMemory || 8) < 4) return false;          // < 4 GB RAM
    if ((navigator.hardwareConcurrency || 8) < 4) return false;   // < 4 Kerne
    return webglAvailable();
  }

  /* Geteilt mit nf-sphaere.js: beide Schichten brauchen Three.js, aber die
     Bibliothek darf nur einmal ausgewertet werden. Ohne diesen
     Zwischenspeicher ersetzt der zweite Ladevorgang `window.THREE` mitten
     im Betrieb — die bereits laufende Szene haengt dann an Klassen, die es
     nicht mehr gibt. Wer zuerst fragt, laedt; der zweite bekommt dasselbe
     Versprechen zurueck. */
  function loadScript(src) {
    const cache = (window.__nfSkript = window.__nfSkript || {});
    if (cache[src]) return cache[src];
    cache[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    return cache[src];
  }

  if (vantaAllowed()) {
    // Inhaltsseiten: .page-hero · Startseite: .cta-section (ihr Hero gehört
    // bereits der Cinematic Engine — das Netz akzentuiert dort die CTA).
    //
    // Vorfahrt: trägt ein Kandidat bereits `data-nf-sphaere`, gehört das
    // Blickfeld dem Drahtgitter aus nf-sphaere.js. Zwei WebGL-Flächen
    // übereinander sind kein doppelter Eindruck, sondern zwei halbe — und
    // zwei Kontexte, von denen der Browser den älteren still einzieht.
    // Der nächste Kandidat rückt dann nach; gibt es keinen, bleibt die
    // Seite ohne Netz, was sie ohnehin verträgt.
    const hero = Array.prototype.find.call(
      document.querySelectorAll('.page-hero, .cta-section'),
      (el) => !el.hasAttribute('data-nf-sphaere')
    ) || null;
    if (hero) {
      /* Erst laden, wenn die Sektion in Reichweite kommt. 300 px Vorlauf:
         genug, damit das Netz beim Eintreffen steht, zu wenig, um den
         ersten Bildaufbau zu belasten. */
      const gate = new IntersectionObserver((entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
        idle(() => {
          loadScript('vendor/three.min.js')
            .then(() => loadScript('vendor/vanta.net.min.js'))
            .then(() => {
              if (window.VANTA && window.VANTA.NET && window.THREE) initVanta(hero);
            })
            .catch(() => { /* still fallback: Seite bleibt exakt wie sie ist */ });
        });
      }, { rootMargin: '300px 0px' });
      gate.observe(hero);
    }
  }

  function initVanta(hero) {
    {
      const css = document.createElement('style');
      css.textContent =
        '.nf-vanta{position:absolute;inset:0;z-index:0;overflow:hidden;' +
        'mix-blend-mode:screen;opacity:.58}' +
        '@media(max-width:768px){.nf-vanta{opacity:.3}}';
      document.head.appendChild(css);

      const host = document.createElement('div');
      host.className = 'nf-vanta';
      host.setAttribute('aria-hidden', 'true');
      hero.insertBefore(host, hero.firstChild);

      // Statische Hero-Inhalte über das Netz heben — ohne Layouteingriff:
      // nur position:static → relative (verschiebt nichts, ändert nur die
      // Stapelreihenfolge). Bereits positionierte Deko (cta-glow, cta-frame,
      // Collagen-Bilder) bleibt unangetastet.
      [...hero.children].forEach((child) => {
        if (child === host) return;
        if (getComputedStyle(child).position === 'static') {
          child.style.position = 'relative';
          child.style.zIndex = '1';
        }
      });

      const mobile = matchMedia('(max-width: 768px)').matches;
      let vanta = null;
      try {
        vanta = window.VANTA.NET({
          el: host,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: GOLD,
          backgroundColor: 0xECE0C6,
          points: mobile ? 6 : 11,
          maxDistance: 23,
          spacing: mobile ? 17 : 19,
          showDots: true
        });
      } catch (_) {
        host.remove();
        vanta = null;
      }

      if (vanta) {
        // Renderpause außerhalb des Viewports / im Hintergrund-Tab
        if (typeof vanta.pause === 'function' && typeof vanta.play === 'function') {
          const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => { en.isIntersecting ? vanta.play() : vanta.pause(); });
          }, { threshold: 0.02 });
          io.observe(hero);
          document.addEventListener('visibilitychange', () => {
            if (document.hidden) vanta.pause();
            else vanta.play();
          });
        }
        addEventListener('pagehide', () => { try { vanta.destroy(); } catch (_) { /* noop */ } });
      }
    }
  }

  /* ── 3. Ambient-Glow-Parallax ───────────────────────────────────────── */
  if (!reduced) {
    const glows = [...document.querySelectorAll('.ambient-glow')];
    if (glows.length) {
      const FACTORS = [-0.055, 0.085, -0.04]; // gestaffelte Tiefenschichten
      let tick = false;
      const paint = (y) => {
        tick = false;
        glows.forEach((g, i) => {
          g.style.transform = 'translate3d(0,' + (y * FACTORS[i % FACTORS.length]).toFixed(1) + 'px,0)';
        });
      };
      const onScroll = (y) => {
        if (!tick) { tick = true; requestAnimationFrame(() => paint(y)); }
      };
      if (lenis && typeof lenis.on === 'function') {
        lenis.on('scroll', (e) => onScroll(typeof e.scroll === 'number' ? e.scroll : scrollY));
      }
      // Abdeckung für natives Scrollen (Tastatur, Touch, reduced-data …)
      addEventListener('scroll', () => onScroll(scrollY), { passive: true });
      paint(scrollY);
    }
  }
})();
