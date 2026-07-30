# NobleFrame

Premium Digital Atelier — statische Website inklusive der eigenen
Showcase-Systeme unter `/showcase/`.

**Live:** https://nobleframe.de

## Aufbau

Kein Build, kein Framework. Jede Seite ist eigenständiges HTML mit
inline-kritischem CSS; alles Weitere ist additiv und darf ausfallen, ohne
dass die Seite ihre Funktion verliert.

```
*.html                  Seiten (Root)
assets/fonts/           selbst gehostete Variable Fonts + fonts.css
assets/img/             Vorschaubilder der Showcase-Projekte (WebP)
favicon/                Favicons und PWA-Icons
vendor/                 Fremdbibliotheken (Lenis, Three.js, Vanta)
cinematic-engine.js     Canvas2D-Intro der Startseite
nf-interactions.js      Reveals, Zähler, Mobilmenü
nf-tech.js              Lenis, bedarfsgesteuertes Vanta, Glow-Parallax
nf-shader.js            WebGL-Akzent
service-worker.js       network-first für Seiten, SWR für Assets
_headers, wrangler.toml Cloudflare-Pages-Konfiguration
docs/NOBLEFRAME-2032.md Design-Dossier: Analyse, Vision, Architektur
```

## Grundsätze

Diese vier Regeln sind der Grund, warum die Seite so aussieht, wie sie
aussieht. Sie stehen ausführlich in `docs/NOBLEFRAME-2032.md`.

**Keine Aussage ohne Deckung.** Keine erfundenen Kundenlogos, keine
Kennzahl ohne Bezugsgröße, kein Ladebalken, der nichts lädt, keine
angekündigte Technologie, die nicht läuft. Wenn eine Zahl auf der Seite
steht, muss sie überprüfbar sein.

**Die Seite funktioniert, bevor die Zugaben laden.** WebGL, Vanta und
Smooth Scrolling sind Schichten über einem vollständigen Dokument, nie
dessen Voraussetzung. Fällt eine Schicht aus, bleibt die Seite intakt.

**Keine Drittanbieter zur Laufzeit.** Schriften werden lokal
ausgeliefert, es gibt kein Tracking und keine einwilligungspflichtigen
Dienste — deshalb braucht die Seite keinen Cookie-Banner. Einzige
Ausnahme sind einige Bilder von Unsplash auf `about.html`; sie sind in
der Datenschutzerklärung genannt.

**Alle Pfade relativ.** Die Seite muss auf einer Root-Domain und unter
einem Unterpfad laufen. Das gilt auch für den Service Worker: absolute
Pfade lassen den Offline-Cache still ins Leere zeigen.

## Entwickeln

Es gibt nichts zu installieren. Für lokales Testen genügt ein
statischer Server aus dem Projektverzeichnis:

```
python3 -m http.server 8000
```

Der Service Worker registriert sich nur über HTTPS — lokal über `http://`
ist er absichtlich inaktiv, damit kein Cache die Entwicklung stört. Nach
Änderungen an Dateien aus der `CORE`-Liste die Konstante `CACHE` in
`service-worker.js` hochzählen, sonst sehen wiederkehrende Besucher
weiter den alten Stand.

Debug-Schalter der Intro-Engine: `?cinefx=max` erzwingt volle Qualität
und schaltet die adaptive Regelung ab.

## Deploy

Siehe [DEPLOY.md](DEPLOY.md). Kurz: `npx wrangler pages deploy .` —
`functions/` (KI-Proxy für OMEGA OS) wird automatisch mitdeployed, der
Schlüssel liegt als Secret `ANTHROPIC_API_KEY` im Pages-Projekt.

## Vor dem Ausliefern prüfen

```
# tote interne Verweise
for f in *.html; do grep -oE 'href="[^"#?:]+\.html' "$f" | sed 's/href="//' |
  sort -u | while read -r l; do [ -e "$l" ] || echo "$f -> $l"; done; done

# fehlende Assets
grep -ohE '(src|href)="[^"h#][^":]*\.(js|css|png|jpg|webp|svg|ico|woff2|json)"' *.html |
  sed -E 's/^(src|href)="//;s/"$//' | sort -u |
  while read -r p; do [ -e "$p" ] || echo "fehlt: $p"; done
```

Beides muss leer bleiben.
