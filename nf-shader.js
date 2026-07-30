/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Shader Layer — lebendiger WebGL-Hintergrund (raw WebGL)
   ─────────────────────────────────────────────────────────────────────────
   Atmosphäre im Stil von lenis.dev, übersetzt in die Noir/Gold-Sprache:
   goldene Seiden-Flammen, die vom unteren Rand aufsteigen, schwebender
   Goldstaub (Bokeh), atmendes Bodenglühen und ein leises Maus-Licht.
   „Action im Hintergrund": Tempo und Leuchtkraft folgen der Scroll-
   Geschwindigkeit (Lenis-Velocity) — ruhige Eleganz im Stand, Energie
   beim Scrollen.

   Rein additiv: rendert in .bg-effects mit mix-blend-mode:screen →
   Grid-Overlay, Glows, Vanta-Netz und Inhalte bleiben unverändert
   darüber/davor. Keine Abhängigkeiten (kein Three.js nötig).

   Robustheit: aus bei prefers-reduced-motion, fehlendem WebGL oder
   Context-Verlust (stilles Fallback = bisheriges statisches Design).
   Adaptive Qualität: Render-Auflösung wird bei schwacher Framerate
   automatisch gesenkt. Pausiert im Hintergrund-Tab, bei verdecktem
   Viewport (Cinematic-Sequenz) und endet sauber bei pagehide.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bg = document.querySelector('.bg-effects');
  if (!bg) return; // Seiten ohne Atmosphären-Ebene (Recht, 404, Labs …)

  const canvas = document.createElement('canvas');
  canvas.className = 'nf-shader';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power', preserveDrawingBuffer: false
  });
  if (!gl) return;

  const css = document.createElement('style');
  css.textContent =
    '.nf-shader{position:absolute;inset:0;width:100%;height:100%;' +
    'mix-blend-mode:screen;pointer-events:none}';
  document.head.appendChild(css);
  bg.insertBefore(canvas, bg.firstChild);

  /* ── Shader ─────────────────────────────────────────────────────────── */
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_energy;
uniform vec2 u_mouse;

float hash(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}
  return v;
}

void main(){
  vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;
  float t=u_time;
  float e=u_energy;
  vec3 col=vec3(0.);

  /* 1 · Goldene Seiden-Flammen — steigen vom unteren Rand auf */
  {
    float speed=.2+e*1.1;
    vec2 q=vec2(p.x*1.4,p.y*.9-t*speed);
    float w1=fbm(q*2.+vec2(0.,-t*speed*1.7));
    float w2=fbm(q*3.5+vec2(4.7,t*speed*.6)+1.3*w1);
    float f=fbm(q*2.4+1.8*vec2(w1,w2));
    float mask=1.-smoothstep(-.35,1.05,p.y+.42*f);
    float flame=pow(max(f*1.35-.22,0.),1.35)*mask;
    vec3 c1=vec3(.22,.13,.04);
    vec3 c2=vec3(.72,.55,.26);
    vec3 c3=vec3(1.,.92,.66);
    vec3 fc=mix(c1,c2,smoothstep(.05,.5,flame));
    fc=mix(fc,c3,smoothstep(.45,.95,flame));
    col+=fc*flame*(1.15+1.3*e);
  }

  /* 2 · Goldstaub — schwebende Bokeh-Partikel in zwei Tiefenschichten */
  {
    float acc=0.;
    for(int L=0;L<2;L++){
      float sc=L==0?14.:26.;
      float sz=L==0?.05:.10;
      vec2 gp=p*sc;
      gp.y-=t*(.25+.18*float(L))*(1.+e*2.);
      gp.x+=sin(t*.13+float(L)*3.1)*.8;
      vec2 id=floor(gp);
      vec2 gv=fract(gp)-.5;
      float h=hash(id+float(L)*71.7);
      vec2 off=vec2(sin(t*.5+h*6.28),cos(t*.4+h*6.28))*.18;
      float d=length(gv-off);
      float tw=.55+.45*sin(t*(1.2+h*2.)+h*40.);
      acc+=smoothstep(sz,sz*.25,d)*step(.5,h)*tw*(L==0?.8:.45);
    }
    col+=vec3(.85,.70,.42)*acc*(.75+1.1*e);
  }

  /* 3 · Atmendes Bodenglühen + leises Maus-Licht */
  {
    float breathe=.75+.25*sin(t*.4);
    float g=exp(-pow(length(vec2(p.x*.8,(p.y+.75)*1.4)),2.)*2.2)*breathe;
    col+=vec3(.45,.33,.15)*g*(.48+.4*e);
    vec2 mp=u_mouse-.5;mp.x*=u_res.x/u_res.y;
    float m=exp(-dot(p-mp,p-mp)*6.);
    col+=vec3(.55,.44,.24)*m*.22;
  }

  /* Vignette + feines Korn */
  col*=1.-.3*dot(p,p);
  col+=(hash(gl_FragCoord.xy+fract(t))-.5)*.02;
  gl_FragColor=vec4(max(col,0.),1.);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, 'u_res'),
    time: gl.getUniformLocation(prog, 'u_time'),
    energy: gl.getUniformLocation(prog, 'u_energy'),
    mouse: gl.getUniformLocation(prog, 'u_mouse')
  };

  /* ── Größe & adaptive Qualität ──────────────────────────────────────── */
  let scale = 0.6; // Render-Auflösung (Flammen-Definition vs. Performance)
  function resize() {
    canvas.width = Math.max(2, Math.round(innerWidth * scale));
    canvas.height = Math.max(2, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  /* ── Scroll-Energie (Lenis-Velocity oder Fallback) ──────────────────── */
  let target = 0, energy = 0;
  const feed = (v) => { target = Math.min(1, Math.abs(v) / 22); };
  if (window.__nfLenis && typeof window.__nfLenis.on === 'function') {
    window.__nfLenis.on('scroll', (e) => feed(typeof e.velocity === 'number' ? e.velocity : 0));
  }
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    feed((y - lastY) * 2.2);
    lastY = y;
  }, { passive: true });

  /* ── Maus (sanft nachgeführt) ───────────────────────────────────────── */
  let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  addEventListener('pointermove', (e) => {
    tx = e.clientX / innerWidth;
    ty = 1 - e.clientY / innerHeight;
  }, { passive: true });

  /* ── Sichtbarkeit: Pause bei verdecktem Viewport / Hintergrund-Tab ──── */
  let covered = false;
  const cine = document.querySelector('[data-cine]');
  if (cine && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      es.forEach((en) => { covered = en.intersectionRatio > 0.92; });
    }, { threshold: [0, 0.92, 1] }).observe(cine);
  }

  /* ── Render-Loop mit FPS-Adaption ───────────────────────────────────── */
  let raf = 0, running = false, t0 = performance.now();
  let acc = 0, frames = 0;
  const tStart = t0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = now - t0;
    t0 = now;

    // FPS-Adaption (Aufwärmphase von 2s ausklammern)
    acc += dt; frames++;
    if (frames >= 90) {
      const avg = acc / frames;
      acc = 0; frames = 0;
      if (now - tStart > 2000) {
        if (avg > 26 && scale > 0.34) { scale = Math.max(0.34, scale - 0.08); resize(); }
        else if (avg < 14 && scale < 0.6) { scale = Math.min(0.6, scale + 0.05); resize(); }
      }
    }

    if (document.hidden || covered) return; // pausiert, Loop bleibt bestehen

    target *= 0.9;
    energy += (target - energy) * 0.1;
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;

    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, (now - tStart) / 1000);
    gl.uniform1f(U.energy, energy);
    gl.uniform2f(U.mouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function start() { if (!running) { running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    canvas.remove(); // Fallback: statisches Design bleibt
  });
  addEventListener('pagehide', () => {
    stop();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  });

  start();
})();
