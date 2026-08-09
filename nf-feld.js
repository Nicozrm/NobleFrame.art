/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Feld — eigener GLSL-Shader, ein Bildschirm lang

   Das ist die Stelle, an der die Seite aufhoert zu behaupten, dass hier
   Leute Grafik koennen, und es stattdessen tut: ein Fragment-Shader ueber
   die volle Hoehe, der auf den Zeiger reagiert.

   Kein Vanta, kein Three.js — roher WebGL-Kontext, ein Dreieck, ein
   Fragmentprogramm. Die gesamte Datei ist kleiner als die Bibliothek,
   die man sonst dafuer laedt.

   Was darin passiert: fbm-Rauschen, dessen Koordinatenraum von einem
   zweiten Rauschen verzogen wird (domain warping). Das ergibt Strukturen,
   die stroemen statt zu flackern — der Unterschied zwischen einer
   Fluessigkeit und einem Fernsehrauschen. Der Zeiger verzieht diesen Raum
   zusaetzlich, weshalb das Feld dem Zeiger sichtbar folgt, ohne dass
   irgendetwas „animiert" wird.

   Kosten, weil sie hier das Design sind:
   - Der Loop laeuft nur, waehrend der Abschnitt im Blick ist (IO).
   - Aufloesung gedeckelt (DPR <= 1.5) und bei schwacher Bildrate gesenkt.
   - Kontext wird bei pagehide freigegeben, Loop bei verstecktem Tab aus.
   - Faellt WebGL aus oder ist reduzierte Bewegung gesetzt, bleibt der
     Abschnitt als flaches Feld stehen. Es fehlt dann nichts ausser der
     Bewegung — Text und Bedienung liegen ohnehin darueber, nicht darin.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const abschnitt = document.querySelector('[data-nf-feld]');
  if (!abschnitt) return;

  const leinwand = abschnitt.querySelector('canvas');
  const anzeige  = abschnitt.querySelector('[data-nf-telemetrie]');
  if (!leinwand) return;

  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduziert) return;                    // flaches Feld, kein Kontext

  const gl = leinwand.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power', preserveDrawingBuffer: false
  });
  if (!gl) return;

  /* ── Programm ───────────────────────────────────────────────────────── */
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_zeit;
uniform vec2  u_maus;      // 0..1, nachgezogen
uniform float u_kraft;     // 0..1, Sichtbarkeit des Abschnitts

float hash(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }

float rausch(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* Fuenf Oktaven. Jede weitere kostet eine Textur-freie Runde und ist ab
   hier nicht mehr zu sehen — das ist die Grenze, nicht der Geschmack. */
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){
    s += a * rausch(p);
    p = p * 2.02 + vec2(37.1, 17.3);
    a *= 0.5;
  }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  float t = u_zeit * 0.045;

  /* Domain Warping: der Raum, in dem das Rauschen ausgewertet wird, wird
     selbst von Rauschen verschoben. Zwei Stufen genuegen fuer den
     Eindruck von Stroemung; drei kosten spuerbar und sehen gleich aus. */
  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
  vec2 z = p * 1.9 + q * 1.15;

  /* Der Zeiger zieht den Raum zu sich. Nicht als Leuchtfleck — als
     Verzerrung. Deshalb sieht man die Reaktion auch dort, wo der Zeiger
     nicht ist. */
  vec2  m  = (u_maus - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 2.0;
  float d  = length(p - m);
  z += (p - m) / (d * d + 0.55) * 0.28;

  vec2 r = vec2(fbm(z + vec2(1.7, 9.2)), fbm(z + vec2(8.3, 2.8)));
  float f = fbm(p * 1.9 + r * 1.6 + t * 0.6);

  f = clamp(f * 1.25 - 0.12, 0.0, 1.0);
  f = mix(0.5, f, 0.35 + 0.65 * u_kraft);   // beim Verlassen beruhigt sich das Feld

  /* Rampe: Tiefe → Coral → Cream. Drei Halte, keine Regenbogen.

     Die Schwellen liegen bewusst hoch. Bei niedrigeren Werten fuellt das
     Coral fast die ganze Flaeche, und eine Flaeche, die ganz in der
     Akzentfarbe steht, wirkt nicht wertvoll, sondern laut — dasselbe
     Problem wie beim alten Gold, nur in einem anderen Ton. So bleibt der
     groesste Teil dunkel, das Coral ist die Ausnahme darin, und das
     Cream kommt nur an den hellsten Graten vor. */
  vec3 tief  = vec3(0.043, 0.039, 0.043);
  vec3 coral = vec3(0.957, 0.345, 0.239);
  vec3 cream = vec3(0.925, 0.878, 0.776);

  vec3 c = mix(tief, coral, smoothstep(0.46, 0.78, f));
  c = mix(c, cream, smoothstep(0.82, 0.99, f));

  /* Randabdunklung, damit die Schrift darueber immer auf Tiefe sitzt. */
  float vig = smoothstep(1.15, 0.30, length(uv - 0.5) * 1.35);
  c *= mix(0.42, 1.0, vig);

  /* Korn: dieselbe Rauheit wie ueber der uebrigen Seite, damit das Feld
     nicht wie ein eingeklebtes Video wirkt. */
  c += (hash(gl_FragCoord.xy + fract(u_zeit)) - 0.5) * 0.035;

  gl_FragColor = vec4(c, 1.0);
}`;

  const bauen = (typ, quelle) => {
    const s = gl.createShader(typ);
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };

  const vs = bauen(gl.VERTEX_SHADER, VERT);
  const fs = bauen(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;                   // stilles Fallback: flaches Feld

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const puffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, puffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uZeit  = gl.getUniformLocation(prog, 'u_zeit');
  const uMaus  = gl.getUniformLocation(prog, 'u_maus');
  const uKraft = gl.getUniformLocation(prog, 'u_kraft');

  /* ── Zustand ────────────────────────────────────────────────────────── */
  let dpr = Math.min(devicePixelRatio || 1, 1.5);
  let breite = 0, hoehe = 0;
  let mausZiel = [0.5, 0.45], maus = [0.5, 0.45];
  let kraft = 0;
  let sichtbar = false, laeuft = false, tot = false;
  let letzter = 0, bildrate = 60, seitAnzeige = 0;

  const messen = () => {
    const r = leinwand.getBoundingClientRect();
    const b = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (b === breite && h === hoehe) return;
    breite = b; hoehe = h;
    leinwand.width = b; leinwand.height = h;
    gl.viewport(0, 0, b, h);
  };

  const rahmen = (jetzt) => {
    if (tot || !sichtbar || document.hidden) { laeuft = false; return; }

    const dt = letzter ? Math.min((jetzt - letzter) / 1000, 0.05) : 0.016;
    letzter = jetzt;

    /* Adaptive Aufloesung: bleibt die Bildrate laenger unter 45, wird
       einmal grober gerechnet statt Bilder fallen zu lassen. Ein Feld,
       das ruckelt, wirkt billiger als eines, das weicher ist. */
    bildrate += ((1 / Math.max(dt, 0.001)) - bildrate) * 0.05;
    if (bildrate < 45 && dpr > 0.75) { dpr = Math.max(0.75, dpr - 0.25); breite = 0; messen(); bildrate = 60; }

    messen();

    // Der Zeiger wird nachgezogen, nicht gesetzt — sonst springt das Feld.
    maus[0] += (mausZiel[0] - maus[0]) * 0.08;
    maus[1] += (mausZiel[1] - maus[1]) * 0.08;

    const r = abschnitt.getBoundingClientRect();
    const anteil = 1 - Math.min(1, Math.abs(r.top + r.height / 2 - innerHeight / 2) / (innerHeight * 0.9));
    kraft += (Math.max(0, anteil) - kraft) * 0.06;

    gl.uniform2f(uRes, breite, hoehe);
    gl.uniform1f(uZeit, jetzt / 1000);
    gl.uniform2f(uMaus, maus[0], maus[1]);
    gl.uniform1f(uKraft, kraft);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* Telemetrie: die tatsaechlichen Uniform-Werte, viermal je Sekunde.
       Das ist kein Zierrat — es ist der Beleg, dass da wirklich etwas
       gerechnet wird, und die einzige Stelle der Seite, an der man ihr
       beim Denken zusehen kann. */
    if (anzeige && jetzt - seitAnzeige > 250) {
      seitAnzeige = jetzt;
      anzeige.textContent =
        'U.ZEIT ' + (jetzt / 1000).toFixed(2).padStart(7, '0') +
        '   U.MAUS ' + maus[0].toFixed(3) + ' / ' + maus[1].toFixed(3) +
        '   U.KRAFT ' + kraft.toFixed(2) +
        '   ' + Math.round(bildrate) + ' FPS';
    }

    requestAnimationFrame(rahmen);
  };

  const anwerfen = () => {
    if (laeuft || tot || !sichtbar || document.hidden) return;
    laeuft = true; letzter = 0;
    requestAnimationFrame(rahmen);
  };

  new IntersectionObserver((e) => {
    sichtbar = e[0].isIntersecting;
    if (sichtbar) anwerfen();
  }, { threshold: 0.02 }).observe(abschnitt);

  addEventListener('pointermove', (e) => {
    const r = leinwand.getBoundingClientRect();
    mausZiel[0] = (e.clientX - r.left) / Math.max(1, r.width);
    mausZiel[1] = 1 - (e.clientY - r.top) / Math.max(1, r.height);
  }, { passive: true });

  addEventListener('resize', () => { breite = 0; messen(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) anwerfen(); });

  /* Kontextverlust ist kein Fehlerfall, sondern ein normaler Vorgang —
     das Betriebssystem darf ihn jederzeit einziehen. Danach steht das
     flache Feld, und niemand sieht eine kaputte Seite. */
  leinwand.addEventListener('webglcontextlost', (e) => { e.preventDefault(); tot = true; laeuft = false; });

  addEventListener('pagehide', () => {
    tot = true; laeuft = false;
    const x = gl.getExtension('WEBGL_lose_context');
    if (x) x.loseContext();
  });

  abschnitt.dataset.nfFeld = 'aktiv';
  messen();
})();
