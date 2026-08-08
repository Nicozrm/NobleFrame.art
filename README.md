# NobleFrame

Digitales Atelier — statische Website inklusive der eigenen
Showcase-Systeme unter `/showcase/`.

**Live:** https://nobleframe.de

## Aufbau

Kein Build, kein Framework. Jede Seite ist eigenständiges HTML. Das
Gemeinsame liegt seit dem Redesign in einer Datei statt neunzehnmal
inline.

```
*.html                  Seiten (Root)
assets/css/nf.css       Design-System: Farben, Schrift, Teile, Rahmen, Lauf
assets/motion.css       Bewegungssystem + seitenübergreifende View Transitions
assets/fonts/           selbst gehostete Schriften (Anton, Outfit, JetBrains Mono)
assets/img/             Vorschaubilder der Showcase-Projekte (WebP)
favicon/                Favicons und PWA-Icons
nf-motion.js            Rahmen, Reveals, Zähler, Licht, Befehlsleiste, Register
service-worker.js       network-first für Seiten, SWR für Assets
_headers, wrangler.toml Cloudflare-Pages-Konfiguration
docs/NOBLEFRAME-2032.md Design-Dossier: Analyse, Vision, Architektur
```

Seiten-eigenes CSS steht weiterhin in der jeweiligen Seite — aber nur
das, was es genau dort gibt. Alles, was auf mehr als einer Seite
vorkommt, gehört nach `assets/css/nf.css`.

## Gestaltung

**Papier statt Bühne.** Der Grund ist ein warmer Bogen — Cream
`#ECE0C6` —, die Schrift ist Tinte `#1D1D1D`, und es gibt genau ein
Signal: Coral `#F4583D`. Es markiert, was anklickbar oder gerade lebendig
ist — nie Dekoration. Dazu ein warmes Bandset (Gold, Terra, Amber) für
die Leistungsliste: vier flache Farbfelder, ein Klima. Flächen, keine
Verläufe.

Der Wechsel von Schwarz/Gold auf Papier hat einen praktischen Grund. Die
Vorschaubilder der Projekte sind dunkel; auf hellem Grund liegen sie wie
Tafeln in einem Bildband. Dunkel auf dunkel war ein Nebel, in dem die
Arbeit verschwand.

**Drei Stimmen.** Anton für alles Große und ausschließlich versal — die
Displaystimme. Sie bringt ihre Enge mit, positives Tracking ist deshalb
verboten. Outfit für alles, was gelesen wird. JetBrains Mono für alles,
was ausgezeichnet wird: Nummern, Labels, Kennwerte — immer klein, immer
weit.

Ein Hinweis für deutschen Satz: Anton läuft mit Zeilenhöhe unter 1, und
Ä/Ö/Ü ragen über die Versalhöhe hinaus. Wo eine Displayzeile in einer
überlaufend beschnittenen Maske sitzt (`.rise`, `.marquee--giant`),
braucht sie oben Luft — sonst wird aus „VORFÜHREN" ein „VORFUHREN".

**Hell und dunkel.** Die Seite folgt dem System, bis jemand über den
Schalter in der Navigation widerspricht; der Widerspruch wird in
`localStorage` gemerkt. Ohne ihn steht kein `data-theme`, und
`prefers-color-scheme` entscheidet weiter.

## Grundsätze

Diese fünf Regeln sind der Grund, warum die Seite so aussieht, wie sie
aussieht. Die ersten vier stehen ausführlich in
`docs/NOBLEFRAME-2032.md`.

**Keine Aussage ohne Deckung.** Keine erfundenen Kundenlogos, keine
Kennzahl ohne Bezugsgröße, kein Ladebalken, der nichts lädt, keine
angekündigte Technologie, die nicht läuft. Wenn eine Zahl auf der Seite
steht, muss sie überprüfbar sein.

**Die Seite funktioniert, bevor die Zugaben laden.** `nf-motion.js` ist
eine Schicht über einem vollständigen Dokument, nie dessen Voraussetzung.
Die Reveal-Startzustände greifen erst, wenn das Skript `data-motion` auf
`<html>` gesetzt hat — fällt es aus, steht der Inhalt da.

**Keine Drittanbieter zur Laufzeit.** Schriften werden lokal
ausgeliefert, es gibt kein Tracking und keine einwilligungspflichtigen
Dienste — deshalb braucht die Seite keinen Cookie-Banner. Einzige
Ausnahme sind einige Bilder von Unsplash auf `about.html` und
`kontakt.html`; sie sind in der Datenschutzerklärung genannt.

**Alle Pfade relativ.** Die Seite muss auf einer Root-Domain und unter
einem Unterpfad laufen. Das gilt auch für den Service Worker: absolute
Pfade lassen den Offline-Cache still ins Leere zeigen.

**Kein Rauch.** Keine weichgezeichneten Lichtkreise, kein WebGL-Netz über
dem Text, kein Vorhang vor dem Inhalt, kein Raster-Overlay, keine
Cursor-Aura, keine Klick-Schockwellen. Was Tiefe erzeugt, sind Kante,
Fläche und Abstand. Wer eine Ausnahme braucht, schreibt dazu, welches
Problem sie löst.

Lautstärke entsteht über Maßstab, Fläche und Farbe: Displayzeilen bis
12rem, randlose Farbblöcke (`.slab`), warme Bänder (`.bands`), ein
Laufband in Displaygröße (`.marquee--giant`), Wischblenden (`.wipe`) und
ein scrollgebundener Wort-Scrub (`.scrub`). Alles davon ist Transform,
Opazität oder ein flaches Farbfeld — nichts davon ist ein Effekt über
dem Inhalt.

## Bedienung

Über die Maus hinaus:

| Taste       | Wirkung                                        |
|-------------|------------------------------------------------|
| `⌘K` / `^K` | Befehlsleiste: jede Seite, jedes Projekt       |
| `/`         | dasselbe, wenn der Fokus nicht im Feld steht   |
| `↑` `↓`     | durch die Treffer                              |
| `⏎`         | öffnen                                         |
| `Esc`       | schließen (auch das Mobilmenü)                 |

Das Verzeichnis der Befehlsleiste steht als `INDEX` in `nf-motion.js` —
bewusst dort und nicht im HTML: es ist auf jeder Seite identisch, und
eine Kopie pro Seite wäre wieder das Problem, das dieses Redesign
beseitigt hat. Neue Seite anlegen heißt: dort eine Zeile ergänzen.

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

# kein Rauch zurueckgekehrt
grep -rn 'ambient-glow\|bg-effects\|grid-overlay\|curtain-overlay' *.html
```

Der erste Befehl meldet `showcase/lunara/index.html` und
`showcase/omega-os/index.html`: die Showcase-Systeme liegen nicht im
Repository, sondern werden getrennt nach `/showcase/` deployed. Die
übrigen zwei Ausgaben müssen leer bleiben.
