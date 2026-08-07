# NobleFrame — Design-Dossier

**Kein Code. Keine Komponenten. Keine Bibliotheken.**
Fünf Phasen, zwei Verbote, eine Bewertungsinstanz.

Grundsatz über allem:

> **NobleFrame is a digital product that happens to run in a browser.**

---

## Phase 0 — Befund

Bevor irgendeine Meinung zählt: was steht tatsächlich im Repository.
Alles Folgende ist überprüfbar, nichts davon ist Interpretation.

| Befund | Beleg |
|---|---|
| `nf-engine.js` (122 KB WebGL2-Engine) wurde gelöscht | Commit `ff94efc`, `nf-boot.js` in `0c9f346` |
| **17 Seiten laden weiterhin `nf-boot.js`, 9 zusätzlich `nf-engine.js`** | jede `*.html` im Root |
| Der Service Worker precacht beide gelöschten Dateien | `service-worker.js:19-20` |
| Die README bewirbt die Engine noch immer als Zentrum der Seite | `README.md`, Abschnitt „NF·Engine" |
| `index.html` trägt eine 12-Punkt-Navigation, **alle anderen Seiten eine 7-Punkt-Navigation** | `index.html:466-477` vs. alle übrigen |
| 5 Ziele der Startseiten-Navigation existieren nicht: `team`, `referenzen`, `kompetenzen`, `portfolio`, `portal/login` | ebd. |
| `index 2.html` ist die neuere, vollständige Startseite — nie ausgeliefert | 85 KB vs. 48 KB, andere IA, andere Intro-Sequenz |
| Manifest-Icons zeigen auf `favicon/…` — dieses Verzeichnis existiert nicht | `manifest.json`, `site.webmanifest`, 16 `<link>`-Tags |
| `.github/`, `functions/` sind in `DEPLOY.md` dokumentiert, aber nicht vorhanden | — |
| Im Web-Root liegen: 16 `CFNetworkDownload_*.html`, `nobleframe-website.zip` (5,5 MB), `omega-os.zip`, `Banner .heic`, `favicon-128x128 2.png`, `… 3.png` | `ls` |
| Team-Porträts: `Nico.PNG` 2,8 MB, `Tobias.PNG` 2,5 MB, unkomprimiert | ebd. |

**Der Kern des Befunds:** Die Seite bewirbt an drei Stellen — README, Boot-Screen, Script-Tag — eine Rendering-Engine, die es nicht mehr gibt. Die ausgelieferte Startseite gehört zu einer früheren Version der Seite. Die neuere existiert im Repository und wurde nie hochgezogen.

Und die gelöschte Engine ist die eigentliche Pointe. Ihr dokumentierter Funktionsumfang:

> GPU-Partikel, Stable-Fluids, God Rays, SDF-Raymarching, Bloom, ACES, Auto-Exposure, Chromatic Aberration, anamorphotische Flares, Lens Dirt, Film-Gate, Shockwaves, Verlet-Seidenbänder, Meteore, Kinokamera, Per-Letter-Physik, Portal-Transitions, generativer Audio-Score.

Das ist keine Engine. Das ist die vollständige Awwwards-Checkliste 2019–2024, in eine Datei geschrieben. Sie wurde gebaut und wieder gelöscht — vermutlich, weil sie im Alltag nicht getragen hat.

**Diese Löschung war die beste Designentscheidung der bisherigen Projektgeschichte.** Sie ist nur nie zu Ende geführt worden. Phase 1 beginnt hier.

---

## Phase 1 — Analyse

### 1.1 Was ist bereits außergewöhnlich?

Vier Dinge. Sie sind alle unterbewertet, und drei davon sind versteckt.

**Der Showcase ist echt.** Fünf vollständige, eigenentwickelte Systeme — ein Smart-Home-Planungsstudio mit Echtzeit-3D und Grundriss-Editor, ein fenstergesteuertes Browser-Betriebssystem mit App Store, eine Reparatur-Plattform, eine Produktpräsentation, eine Luxury-Boutique. Nicht Screenshots. Nicht Case Studies. Anklickbare Software, ohne Anmeldung, live. Für ein Zwei-Personen-Atelier ist das außergewöhnlich — im Wortsinn: es kommt außerhalb der Norm vor. **Es ist der vierte Navigationspunkt.**

**Das Analyse-Tool ist echt.** `tools.html` ruft die PageSpeed-Insights-API auf und gibt eine tatsächliche Messung zurück. Das ist ein funktionierendes Diagnosewerkzeug, kein als Werkzeug getarntes Lead-Formular. Sehr selten. Kaum sichtbar.

**Die Farbdisziplin.** Ein Akzent (`#C9A962`), ein Schwarz, ein Weiß. Keine zweite Farbe, keine Sekundärpalette, keine Statusfarben außer in Formularmeldungen. Über 17 Seiten durchgehalten. Das ist Haltung, nicht Zufall.

**Das Performance-Fundament.** Kein Framework, kein Build, kritisches CSS inline, 48 KB Startseite. Die Seite ist schnell, weil sie so gebaut ist — nicht weil sie optimiert wurde. Dieses Fundament ist wertvoller als alles, was eine 122-KB-Engine je darauf hätte stellen können.

Und der Name. *NobleFrame* — der Rahmen. Das Logo ist ein Rahmen im Rahmen. Das ist ein tragfähiger konzeptueller Kern, mit dem bisher nichts gemacht wurde außer: ihn als Icon zu zeichnen. Phase 2 und 3 machen etwas damit.

### 1.2 Was wirkt generisch?

Nicht „ein bisschen austauschbar". Wörtlich vorhersagbar.

- **Das Hero-Bild** ist `photo-1497366216548-37526070297c` von Unsplash — „Modern workspace". Eines der meistverwendeten Stockfotos der Agentur-Webentwicklung überhaupt. Es nimmt **50 % der Startseite** ein. Der erste visuelle Eindruck eines Ateliers, das mit „kein Template, kein Drag-and-drop" wirbt, ist ein Bild, das zehntausend andere Seiten ebenfalls benutzen.
- **Cormorant Garamond + Gold auf Schwarz.** Das ist nicht Luxus, das ist die Voreinstellung für Luxus. Jede Hochzeitsfotografin, jede Boutique-Beratung, jedes Ghostwriting-Angebot benutzt dieselben zwei Entscheidungen.
- **Der Sektionsrhythmus.** Badge-Pille → Serif-Überschrift mit goldenem Gradient-Span → Untertitel → Grid. Fünfmal pro Seite, auf jeder Seite. Nach dem zweiten Durchlauf liest niemand mehr die Badge.
- **Vier gleichwertige Service-Cards** mit Icon-Quadrat, Heroicons-Strichzeichnung, `transform:translateY(-8px)` beim Hover (`index.html:128`). Das ist der Default.
- **„Bereit für Ihr Projekt?"** — 5× wortgleich im Repository, plus 2× als „Bereit, etwas…". Jede Seite endet identisch.
- **Der Tech-Marquee** in `index 2.html`: „React · TypeScript · GSAP · Tailwind · Supabase · Stripe · Cloudflare · Node.js · Figma", endlos laufend. Ein Logo-Ticker, der Werkzeuge nennt statt Ergebnisse.
- **Der 4-Schritt-Prozess** „Discovery → Konzept → Umsetzung → Launch". Das ist der Prozess jeder Agentur. Ihn aufzuschreiben unterscheidet niemanden von niemandem.

Die Diagnose ist präzise: **Die Seite beschreibt Außergewöhnlichkeit in vollständig gewöhnlicher Form.** Der Text sagt „Atelier, kein Baukasten" — das Layout ist ein Baukasten.

### 1.3 Was wirkt billig?

Härter formuliert: was beschädigt aktiv das Vertrauen.

**Die erfundenen Kundenlogos.** `index.html:628-633`:

```
LuxuryRetail · FinanceFlow · MedCare · TechVentures · ModernHome · DataSync
```

Sechs erfundene Firmen, gesetzt als SVG-Text in **Arial Bold**, auf 50 % Deckkraft — auf einer Seite, die sonst ausschließlich Cormorant und Outfit verwendet. Das ist der schädlichste einzelne Bestandteil der gesamten Seite, aus zwei Gründen gleichzeitig: es ist unwahr, und es ist schlecht gemacht. Ein Besucher, der Arial auf einer Gold-Serif-Seite bemerkt, hat den Bruch gesehen, bevor er die Namen gelesen hat. Danach glaubt er auch die Zahlen darüber nicht mehr.

**Die Zahlen widersprechen sich auf derselben Seite.** `index.html:550` sagt „100 % Weiterempfehlung". 68 Zeilen weiter, `index.html:618`, sagt dieselbe Seite „98 % Zufriedenheit". `index 2.html` sagt „100 % Eigener Code". Drei verschiedene 100-%-Behauptungen, keine davon belegt, zwei davon im selben Scroll-Verlauf sichtbar.

**Der Newsletter ist ein `mailto:`-Link.** `index.html:829`: Klick auf „Newsletter abonnieren" öffnet das Mailprogramm des Besuchers mit vorformuliertem Text, den er selbst abschicken muss. Auf anderen Seiten der gleichen Site läuft Formspree — die Fähigkeit ist also vorhanden, nur hier nicht. Ein Atelier, das High-Performance-E-Commerce verkauft, kann sein eigenes Newsletter-Formular nicht entgegennehmen.

**Fünf tote Links in der Hauptnavigation.** Darunter „Client Portal" als goldener Button oben rechts — der prominenteste Vertrauensbeweis der Seite („wir haben ein Kundenportal") führt auf 404.

**Jeder Seitenaufruf feuert 404s.** `nf-boot.js` auf 17 Seiten, `nf-engine.js` auf 9. In den Netzwerk-Tools jedes Entwicklers, der die Seite prüft, steht rot: die Engine, die im Boot-Screen angekündigt wird, existiert nicht.

**Der Boot-Screen selbst.** `index 2.html` öffnet mit „NF·Atelier BIOS v3 / WebGL2 · ULTRA / Atelier-System bootet" und einem Prozentzähler. Der Zähler ist eine `requestAnimationFrame`-Animation. Der „Bootvorgang" ist ein `setTimeout(goLive, 6550)`. Es gibt kein WebGL auf der Seite. Es wird nichts geladen. **6,5 Sekunden Fake-Ladebalken, der eine gelöschte Engine ankündigt** — auf einer Seite, deren Verkaufsargument „100 % eigener Code" ist. Wer das durchschaut, und die technische Zielgruppe durchschaut es in vier Sekunden, hat die Seite verstanden: sie inszeniert Kompetenz, statt sie zu zeigen.

**Der Web-Root ist ein Downloads-Ordner.** 16 `CFNetworkDownload_*.html` (Safari-Temporärdateien), `nobleframe-website.zip` mit 5,5 MB, `omega-os.zip`, `Banner .heic` (Dateiname mit Leerzeichen, Format, das kein Browser zuverlässig rendert), `favicon-128x128 2.png` und `… 3.png` (macOS-Duplikate). Alles öffentlich ausgeliefert. Der Quelltext ist Teil des Produkts, wenn das Produkt „sauberer Code" heißt.

**2,8 MB und 2,5 MB Team-Fotos.** Unkomprimierte PNG-Screenshots als Porträts, auf einer Seite, die mit „90+ PageSpeed" wirbt.

### 1.4 Wo entstehen Brüche?

**Der Hauptbruch ist die Informationsarchitektur.** Es existieren zwei Seiten gleichzeitig:

```
index.html      Home · Über Uns · Team · Referenzen · Kompetenzen · Portfolio ·
                Tools · Labs · Showcase · FAQ · Karriere · Kontakt      (12)

alle anderen    Home · Leistungen · Signatur · Showcase · Tools ·
                Über Uns · Kontakt                                      (7)
```

Ein Besucher landet auf der Startseite, sieht zwölf Punkte, klickt einen an — und die Navigation, mit der er gerade orientiert war, ist verschwunden. Fünf Punkte sind ersatzlos weg, „Signatur" ist neu da. Es gibt keine Möglichkeit, dorthin zurückzukommen, wo man war, weil es „dort" nicht mehr gibt. Das ist der schwerste Bruch, den eine Website haben kann: **die Startseite gehört nicht zu ihrer eigenen Site.**

Nachgelagert:

- **Zwei Intro-Systeme.** `index.html`: 1,8 s schwarzer Vorhang, ohne Skip, ohne Merker. `index 2.html`: 6,5 s Letterbox-BIOS mit Skip und `seen`-Flag. Zwei unterschiedliche erste Eindrücke derselben Marke.
- **„Leistungen" vs. „Kompetenzen".** Dasselbe Angebot unter zwei Namen. Der Footer verlinkt „Leistungen" auf `kompetenzen.html` (404), während `leistungen.html` existiert und von der Startseite aus unerreichbar ist.
- **Typografiebruch.** `index.html` lädt zwei Schriften, die neueren Seiten drei (JetBrains Mono). Monospace-Eyebrows existieren auf manchen Seiten, auf anderen nicht. Derselbe Sektionstyp sieht je nach Seite anders aus.
- **`labs.html` steht in der Hauptnavigation und ist eine „Hier entsteht etwas Neues"-Seite mit `noindex`.** Die Navigation weist auf einen Raum hin, der leer ist und den man aktiv vor Google versteckt. Und diese leere Seite lädt beide gelöschten Scripts.
- **Der Service Worker ist cache-first ohne Netzwerk-Vorrang für HTML.** Wiederkehrende Besucher bekommen die alte `index.html` ausgeliefert, bis jemand `nobleframe-v15` hochzählt. Der Bruch ist damit nicht nur im Repository, sondern in den Browsern der Besucher eingefroren.

### 1.5 Welche Emotion erzeugt jede Sektion?

Beabsichtigt → tatsächlich. Der Abstand dazwischen ist die Arbeit.

| Sektion | Beabsichtigt | Tatsächlich |
|---|---|---|
| Vorhang (1,8 s) | Zeremonie | **Maut.** Es lädt nichts. Das Schwarz ist Theater, und man zahlt es bei jedem Besuch erneut. |
| Hero-Bild | Souveränität | **Wiedererkennung — der falschen Art.** „Das kenne ich." |
| Hero-Titel | Anspruch | Kommt 2,7 s nach Aufruf zu Ende (1,8 s Vorhang + 0,9 s Delay). Bis dahin ist die Aufmerksamkeit weg. |
| Hero-Stats | Beweis | **Behauptung.** Drei Zahlen ohne Bezugsgröße. „100 % Weiterempfehlung" von wie vielen? |
| Service-Grid | Kompetenz | **Katalog.** Vier gleich große Karten: nichts ist betont, also wird nichts geglaubt. |
| Referenzen-Teaser | Vertrauen | **Zweifel.** Der Moment, in dem alles darüber rückwirkend entwertet wird. |
| CTA-Sektion | Einladung | **Template.** Fünfmal identisch, deshalb nirgends gemeint. |
| Footer | Pflicht | **Die ehrlichste Sektion der Seite.** Echte Adresse, echte Telefonnummer, echte Namen, echte Rechtstexte. Ausgerechnet hier stimmt alles. |
| Showcase | Portfolio | **Staunen. Echt.** Die einzige Sektion, die die Emotion erzeugt, die das Atelier braucht. |
| Cookie-Banner | Compliance | **Unterbrechung.** Erscheint nach 2,5 s über dem Hero. |

Die Zusammenfassung dieser Tabelle ist die Strategie: **Die einzige Sektion, die funktioniert, ist vier Klicks entfernt. Die Sektion, die den ersten Eindruck macht, ist ein Stockfoto.** Das ist umzudrehen — und das ist die zentrale strukturelle Entscheidung dieses Dossiers.

### 1.6 Welche Komponenten konkurrieren miteinander?

- **Zwei goldene Buttons nebeneinander in der Navigation.** „Client Portal" (Gold-Outline) und „Projekt anfragen" (Gold-Fläche). Zwei primäre Aktionen im selben Eck, eine davon führt auf 404. Der Besucher muss eine Entscheidung treffen, bevor er irgendetwas gelesen hat.
- **Vier Aktionen von Primärgewicht im ersten Viewport:** zwei in der Navigation, zwei im Hero („Projekt anfragen", „Referenzen ansehen"). Plus Scroll-Indikator. Fünf Dinge wollen geklickt werden.
- **Hero-Stats vs. Teaser-Stats.** `25+ / 90+ / 100%` oben, `25+ / 98% / ∅3 Mon.` unten. Dieselbe Seite, dieselbe Gestaltung, überlappende, teils widersprüchliche Zahlen. Sie entwerten sich gegenseitig.
- **Gold gegen Gold.** Ambient-Glows, Grid-Overlay, Rahmenlinien, Gradient-Text, Icon-Striche, Badge-Hintergründe, Card-Borders, Hover-Schatten — alles in `#C9A962` in acht verschiedenen Deckkräften. Wenn jedes Element dekoriert ist, kann kein Element Vordergrund werden. **Die Farbdisziplin aus 1.1 wird durch flächendeckende Anwendung wieder aufgehoben.**
- **Z-Index-Ordnung als Prioritätenaussage.** Cookie-Banner `10000` > Vorhang `9999` > Navigation `1000` > Mobile-Menü `999`. Das Einzige, was den Markenmoment überschreiben darf, ist ein Cookie-Hinweis für Cookies, die laut eigenem Text „technisch notwendig" sind — und für technisch notwendige Cookies braucht es nach TDDDG §25 Abs. 2 überhaupt keine Einwilligung. **Der Banner ist rechtlich nicht erforderlich und kostet den wichtigsten Moment der Seite.**

### 1.7 Welche Animationen sind unnötig?

| Animation | Ort | Urteil |
|---|---|---|
| Vorhang 1,8 s | `index.html:747` | **Weg.** Verzögerung als Design getarnt. Kein Skip, kein Merker. |
| Cold Open 6,55 s | `index 2.html` | **Weg.** Fake-Ladebalken für eine gelöschte Engine. |
| `badge-dot` pulse ∞ | `index.html:86` | **Weg.** Ein Punkt, der „live" signalisiert — über nichts. |
| `scroll-line` pulse ∞ | `index.html:115` | **Weg.** Fordert zum Scrollen auf einer offensichtlich scrollbaren Seite auf. |
| Titel-`slideUp` +0,9 s | `index.html:92-94` | **Weg.** Addiert sich auf den Vorhang zu 2,7 s bis zur Kernaussage. |
| Card-Hover `-8px` + Schatten | `index.html:128` | **Weg.** Der generischste Hover im Web. |
| `footer-links:hover{translateX(5px)}` | `index.html:174` | **Weg.** Bewegung in einer Linkliste — und funktioniert bei Inline-Elementen ohnehin nicht. |
| Count-up-Zahlen | `index 2.html` | **Weg.** Eine zählende Zahl ist eine unlesbare Zahl, und sie täuscht Live-Daten vor. |
| Laufender Timecode `TC 00:00:00:00` | `index 2.html` | **Weg.** Dauerhafte `requestAnimationFrame`-Schleife für eine Dekoration, die nichts Wahres aussagt. |
| Nav-Scrolled-State | `index.html:757` | **Bleibt.** Löst ein echtes Problem: Lesbarkeit über Inhalt. |
| Mobile-Menü-Transition | `index.html:70` | **Bleibt.** Räumliche Erklärung, wo etwas herkommt. |
| Fokus-/Hover-Zustände | überall | **Bleibt und wird ausgebaut.** Der einzige Bereich, in dem die Seite zu wenig Bewegung hat. |

Zusammengezählt: **acht permanente oder blockierende Animationen entfallen, drei bleiben.** Kein einziger Verlust an Information.

### 1.8 Wo wird Aufmerksamkeit verschwendet?

Aufmerksamkeit ist das einzige Budget, das der Besucher mitbringt. Die Seite gibt es so aus:

1. **Die ersten 2,7 Sekunden.** Nichts wird kommuniziert. In `index 2.html` sind es 6,5.
2. **50 % des ersten Bildschirms** für das Büro eines Fremden aus einer Stockfoto-Datenbank.
3. **Zwölf Navigationspunkte**, fünf davon ins Leere. Hick'sches Gesetz bestraft die Anzahl, die 404s bestrafen das Vertrauen.
4. **Die Logo-Wand.** Rund 200 px Höhe, sechs Elemente, **negativer** Wert — sie nimmt Platz und gibt Zweifel zurück.
5. **Gleichgewichtung in der Navigation.** Der Showcase — das stärkste Argument des Ateliers — hat dieselbe visuelle Priorität wie `labs.html`, eine leere Baustellenseite mit `noindex`.
6. **Fünf identische Schluss-CTAs.** Ein Aufruf, der überall gleich steht, ist nirgends ein Aufruf.
7. **Der Cookie-Banner nach 2,5 s** über dem Hero, für eine Einwilligung, die nicht eingeholt werden muss.
8. **Google Fonts von `fonts.googleapis.com`** auf jeder Seite: ein zusätzlicher DNS-, TLS- und Roundtrip vor dem ersten Text — und die Übertragung der Besucher-IP an einen Drittanbieter, die genau das ist, weswegen die Seite meint, einen Cookie-Banner zu brauchen. Selbst gehostete Schriften lösen beide Probleme in einem Schritt.

---

## Phase 2 — Vision

**Keine Komponenten. Keine Bibliotheken. Keine Frameworks.**

> **If Apple designed NobleFrame in 2032, how would it feel?**

Nicht wie es aussieht. Wie es sich anfühlt.

Vorbemerkung, ohne die der Rest nicht trägt: 2032 ist visuelle Qualität kostenlos. Jedes Modell erzeugt in Sekunden eine makellose, dunkle, goldakzentuierte Atelier-Seite mit Parallax und Rack-Focus. Schönheit ist dann kein Unterscheidungsmerkmal mehr — sie ist Grundwasser. Was 2032 noch etwas wert ist, ist das, was **nicht generierbar** ist: dass etwas tatsächlich funktioniert, tatsächlich schnell ist, tatsächlich stimmt.

Deshalb ist die Antwort auf die Frage nicht „spektakulärer". Sie ist **wahrer**.

Sieben Gefühle. Jedes mit einem Test, an dem sein Fehlen erkennbar ist.

### I. Ruhe unter Last

Es fühlt sich an wie ein Gerät, das nie beschäftigt ist. Nichts dreht sich, nichts lädt, nichts kündigt sich an. Kein Ladebalken, kein Prozentzähler, kein Skeleton, kein Spinner — nicht weil sie versteckt wären, sondern weil es nichts zu warten gibt. Die Antwort kommt so schnell, dass die Oberfläche als Zwischenschicht verschwindet und nur noch der Inhalt da ist.

*Test:* Existiert irgendwo in diesem Produkt ein Ladezustand? Dann ist dieses Gefühl nicht erreicht.

### II. Gewicht

Dinge haben Masse. Was sich bewegt, hat vorher gestanden und wird wieder stehen; es beschleunigt und bremst, weil es Trägheit hat — nicht weil eine Keyframe-Kurve es vorschreibt. Man spürt, dass eine Bewegung etwas *gekostet* hat. Das ist der Unterschied zwischen einem Ding, das sich bewegt, und einer Animation, die abgespielt wird.

*Test:* Kann eine Bewegung mitten im Verlauf unterbrochen und umgekehrt werden, ohne zu springen? Wenn nein, ist es keine Masse, sondern ein Video.

### III. Zutrauen

Das Produkt erklärt sich nicht. Es gibt keine Badge, auf der „Premium" steht. Keine Zahl, die „100 %" behauptet. Kein Eyebrow, das ankündigt, was gleich kommt. Es zeigt eine Sache, die funktioniert, und traut dem Besucher zu, die Schlussfolgerung selbst zu ziehen.

Apple schreibt nicht „premium" auf ein Produkt. Wer es schreiben muss, hat es nicht.

*Test:* Streiche jedes Adjektiv über die eigene Qualität von der Seite. Bleibt etwas übrig, das dasselbe aussagt? Wenn nein, war nichts da.

### IV. Der Rahmen bleibt

Man wird nie versetzt. Navigieren fühlt sich an wie den Kopf zu drehen, nicht wie ersetzt zu werden. Es gibt keinen Moment des Weiß, kein Nachladen, kein Zurücksetzen der Scrollposition, kein erneutes Aufbauen der Navigation. Der Rahmen steht; der Inhalt bewegt sich durch ihn hindurch.

Das ist die wörtliche Bedeutung des Namens, endlich benutzt: **Der Rahmen ist konstant. Was er hält, wechselt.** Bisher war das ein Icon. Ab hier ist es das Verhalten des Produkts.

*Test:* Gibt es beim Seitenwechsel ein einziges Frame, in dem der Rahmen nicht existiert? Dann ist es eine Website.

### V. Direktheit

Man fasst das Material an, nicht seine Abbildung. Die fünf Showcase-Produkte sind keine Screenshots, die man betrachtet — es sind Dinge, die man benutzt, an Ort und Stelle, bevor man irgendetwas eingegeben oder zugestimmt hat. Kein Video, kein Mockup in einem Laptop-Rahmen, kein „Live-Demo anfragen".

Das ist der einzige Beweis, den ein Atelier führen kann, der nicht behauptet werden muss.

*Test:* Wie viele Klicks bis zur ersten Interaktion mit echter eigener Software? Alles über eins ist zu weit.

### VI. Stille

Der Normalzustand ist: es passiert nichts. Keine Schleife, kein Puls, kein Ambient-Drift, kein laufender Timecode. Deshalb bedeutet Bewegung etwas, wenn sie auftritt — sie ist eine Antwort auf eine Handlung, nie ein Hintergrundgeräusch.

Eine Seite, auf der permanent etwas atmet, kann nichts betonen. Betonung ist ein Unterschied zur Ruhe, und wo keine Ruhe ist, gibt es keinen Unterschied.

*Test:* Screenshot nach 10 Sekunden Nichtstun und nach 60 Sekunden Nichtstun. Sind sie identisch? Wenn nein, warum bewegt sich etwas, das niemand angefasst hat?

### VII. Ehrlichkeit als Ästhetik

Jede Zahl auf der Seite ist in dem Moment gemessen, in dem sie angezeigt wird — oder sie steht nicht da. Jede behauptete Fähigkeit wird von der Seite selbst vorgeführt, während man sie liest. Nichts kündigt eine Engine an, die nicht läuft.

2032 geht der Besucher davon aus, dass alles, was er sieht, generiert sein könnte. Der einzige verbleibende Luxus ist **Überprüfbarkeit**. Eine Seite, die ihren eigenen Lighthouse-Wert live misst und anzeigt, während sie geladen ist, ist glaubwürdiger als jedes Zertifikat-Badge — und sie ist gleichzeitig eine Selbstverpflichtung, die man nicht mehr los wird.

*Test:* Zeige auf eine beliebige Zahl der Seite. Kann der Besucher sie in unter 30 Sekunden selbst nachprüfen? Wenn nein: löschen.

### Was es ausdrücklich nicht sein darf

Es darf sich **nicht beeindruckend** anfühlen. Nicht **cinematisch**. Nicht **immersiv**. Nicht **preisverdächtig**. Diese vier Gefühle sind alle Varianten desselben Fehlers: Die Seite macht sich zum Gegenstand der Aufmerksamkeit, statt sie weiterzureichen. Wer eine Seite bewundert, beauftragt sie nicht.

Es soll sich **unvermeidlich** anfühlen. So, als hätte es gar nicht anders sein können.

---

## Phase 3 — Experience

Erst jetzt: Scroll, Cursor, WebGL, Motion, Kamera, Audio, Licht, Reflektion, Material, Geschwindigkeit. **Nicht getrennt. Als System.**

### Das Gesetz

> **Ein Rahmen. Ein Material. Ein Licht. Eine Kamera.**

Alles Weitere ist Ableitung, nicht Ergänzung. Wenn eine Idee ein zweites Material, ein zweites Licht oder einen Schnitt braucht, ist die Idee falsch — nicht das Gesetz.

### Der Rahmen — das einzige persistente Objekt

Es gibt genau ein Element, das über die gesamte Sitzung existiert und nie neu aufgebaut wird. Es ist zugleich Logo, Viewport-Begrenzung und Behälter jedes gezeigten Produkts. Navigation, Scroll und Routenwechsel finden **darin** statt.

Konsequenz: Es gibt keine Seiten. Es gibt Zustände des Rahmens. Der Rahmen erinnert sich, wo man war.

### Kamera — zwei Bewegungen, kein Schnitt

Es gibt eine Kamera. Sie kann genau zwei Dinge:

- **Dolly** — gebunden an den Scroll, 1:1, umkehrbar.
- **Fokusverlagerung** — welche Ebene scharf ist, beantwortet die Frage „was soll ich jetzt lesen".

Kein Schnitt. Kein Shake. Kein Orbit. Keine Kamerafahrt, die der Besucher nicht ausgelöst hat. Schärfentiefe ist der einzige „Effekt" im System, und sie existiert ausschließlich zur Führung der Aufmerksamkeit — nie zur Verschönerung.

*Einschränkung, die aus der Bewertungsinstanz zurückkommt (siehe E-8): **Text wird nie unscharf.** Nur Ebenen hinter dem Text.*

### Scroll — Transport, nicht Auslöser

Scroll ist das Fortbewegungsmittel. Position im Dokument = Position im Raum, 1:1, jederzeit umkehrbar, jederzeit unterbrechbar. Wer zurückscrollt, sieht alles exakt rückwärts.

Verboten: Scroll-Jacking, gepinnte Sektionen, die die Kontrolle übernehmen, „scroll to continue"-Sperren, horizontale Umleitung, Scroll-Geschwindigkeit ≠ Eingabegeschwindigkeit.

Glättung: höchstens so viel, dass Trackpad-Jitter verschwindet — **≤ 60 ms**, nicht 1,2 s Nachlauf. Nachlauf ist keine Eleganz, sondern Latenz mit gutem Ruf.

### Cursor — nie ersetzt, immer beleuchtet

Der Systemcursor bleibt der Systemcursor. Er wird nicht durch einen Kreis, einen Punkt oder ein Wort ausgetauscht.

Stattdessen: Der Zeiger führt ein weiches gerichtetes Licht. Materialien reagieren darauf, weil sie Materialien sind — nicht weil ein Hover-Handler eine Klasse setzt. Das erzeugt dasselbe Gefühl von Präsenz, ohne dem Besucher sein Werkzeug wegzunehmen.

Auf Touch-Geräten folgt das Licht der letzten Berührung. **Das Design muss ohne dieses Licht vollständig sein** — es ist eine Schicht, keine Voraussetzung.

### Licht — Gold ist eine Lichtfarbe, keine Anstrichfarbe

Das ist die Einzeländerung mit der größten Wirkung im ganzen Dossier.

Heute ist `#C9A962` auf Text, Rahmen, Hintergründe, Icons, Schatten, Gradienten und Glows aufgetragen, in acht Deckkräften. Deshalb riecht die Seite nach „Luxus-Preset" (1.2), und deshalb kann nichts Vordergrund werden (1.6).

Ab hier: **Nichts ist gold. Dinge sind warm beleuchtet.** Ein Key-Light bei ~2700 K, ein Ambient. Gold entsteht dort, wo Licht auf eine Kante trifft — nicht dort, wo jemand eine Farbe zugewiesen hat. Dieselbe Markenfarbe, dieselbe Erkennbarkeit, aber physikalisch motiviert statt dekorativ verteilt. Und automatisch sparsam: Licht fällt nur auf einen Teil der Fläche.

### Material — eines, in Rauheitsstufen

Ein einziges Material für die gesamte Oberfläche. Alles ist dasselbe Material bei unterschiedlicher Rauheit. Typografie sitzt **auf** dem Material, nicht schwebend darüber.

*Korrektur aus der Bewertungsinstanz (E-6): Die Oberfläche ist nahezu strukturlos. Erkennbar wird sie ausschließlich daran, wie ihre Kante das Licht fängt. Gebürstetes Metall als Fläche ist ein Skeuomorph mit schlechter Vorgeschichte und wäre 2032 gealtert.*

### Motion — eine Feder, zwei Dauern

Eine kritisch gedämpfte Feder für das gesamte Produkt. Kein Bounce, kein Overshoot, kein `ease-in-out` per Hand.

Zwei Dauerklassen, mehr existieren nicht:

- **120 ms — Reaktion.** Etwas antwortet auf eine Eingabe.
- **320 ms — Transport.** Etwas bewegt sich von einem Ort zum anderen.

Alles, was länger dauern will, ist keine Bewegung, sondern Warten. **Warten ist im System nicht vorgesehen.**

### Geschwindigkeit — das Budget ist das Design

Geschwindigkeit ist hier kein Optimierungsziel, sondern eine gestalterische Eigenschaft auf derselben Ebene wie Typografie:

- Erster sinnvoller Inhalt **< 800 ms** auf kaltem 4G.
- Eingabelatenz **< 100 ms**.
- Layoutverschiebung **exakt 0**.
- **Die Seite ist vollständig benutzbar, bevor irgendetwas aus diesem Kapitel geladen ist.** WebGL, Licht, Material und Kamera sind eine Schicht über einem funktionierenden Dokument — nie deren Voraussetzung.

Das ist auch die Antwort auf den Befund aus Phase 0: Eine Engine, ohne die die Seite nicht funktioniert, ist eine Engine, die man nicht löschen kann. Eine Engine, die man jederzeit löschen kann, ohne dass es jemand merkt, ist richtig gebaut.

### Reflektion

Reflektion ist der Grund, warum eine Fläche als real gelesen wird. Genau eine: der Kontaktschatten unter dem gezeigten Produkt.

*Aus der Bewertungsinstanz (E-5): Screen-Space-Reflections wurden gestrichen. Ein physikalisch korrekter Kontaktschatten leistet dasselbe für einen Bruchteil der Kosten.*

### Audio

**Es gibt keins.**

*Diese Entscheidung stammt nicht aus Phase 3. Audio war hier vorgesehen — sparsam, opt-in, ein einzelnes physikalisches Sample. Die Bewertungsinstanz hat es gestrichen (E-7). Die Begründung steht dort.*

### Eintritt

Kein Vorhang. Kein BIOS. Kein Prozentzähler. Kein Skip-Button, weil es nichts zu überspringen gibt.

**Das erste Frame ist Inhalt.**

Die Zeremonie besteht darin, dass alles bereits da ist, wenn man ankommt. 2032 ist das das einzige Luxussignal, das noch funktioniert — weil alles andere sechs Sekunden braucht.

---

## Phase 4 — Architektur

Erst hier. Und nur so viel, wie Phase 3 zwingend verlangt.

### Rendering-Grundstruktur

- **Statisch generiertes HTML als Fundament**, React ausschließlich als Insel innerhalb interaktiver Produktflächen. Nicht React als Laufzeit für Fließtext. Das ist die direkte technische Entsprechung von „die Seite funktioniert, bevor die Engine lädt" — und es bewahrt das einzige echte Asset aus 1.1: das Performance-Fundament.
- **Ein einziger, über Routenwechsel hinweg persistenter WebGL2-Kontext.** Ein Renderer, ein Szenengraph, eine Kamera. Nicht ein Canvas pro Komponente — daran sterben Three.js-Agenturseiten, und zwar an Kontextlimits und Speicher, nicht an Rechenleistung.
- **Der persistente Rahmen aus Phase 3** wird über View Transitions realisiert, nicht über einen Client-Router mit eigenem History-Stack. Zurück-Button, Deep Links und Reload müssen unverändert funktionieren.

### Shader

- Handgeschriebenes GLSL, **ein Uber-Material** mit Uniforms für Rauheit und Kantenanisotropie. Kein Materialzoo.
- **Kein Post-Processing-Stack.** Bloom ist verboten — es ist das verlässlichste Erkennungsmerkmal von KI- und Awwwards-Ästhetik und war Bestandteil genau der Engine, die gelöscht wurde.
- Kein Chromatic Aberration, kein Film Grain, kein Lens Dirt, keine anamorphotischen Flares. Die vollständige Liste aus der README ist die vollständige Verbotsliste.

### Motion

- Framer Motion nur für DOM.
- **Genau eine Federkonfiguration**, exportiert aus einer Datei. Inline-Transitions sind im Review nicht zulässig. Das ist der einzige mechanische Schutz davor, dass Phase 3 nach zwölf Monaten wieder 44 Animationen hat wie `index 2.html` heute.

### Scroll

**Lenis wird nicht eingesetzt.** Nativer Scroll plus CSS Scroll-Timeline.

*Das widerspricht der Vorgabe aus der Aufgabenstellung. Die Begründung steht in der Bewertungsinstanz (E-10) — Lenis hat die eigene Prüfung nicht bestanden.*

### Worker

Der Hauptthread tut nichts außer auf Eingaben zu antworten. In Worker verlagert: Geometrie-Dekodierung, Texturtranscodierung (KTX2/Basis), Showcase-Daten, Suchindex.

### Performance-Manager

Misst in den ersten zwei Sekunden echte Frame-Zeiten und wählt eine Stufe:

| Stufe | Inhalt |
|---|---|
| **T0** | Kein WebGL. Vollständiges, korrektes Dokument. Muss allein ausgeliefert werden können. |
| **T1** | Flache Beleuchtung, keine Reflektion. |
| **T2** | Volles Ein-Licht-Modell. |
| **T3** | Zusätzlich Kontaktschatten. |

Regeln:
- Die Stufe ist **pro Sitzung stabil**. Herabstufen ist erlaubt, Heraufstufen mitten in der Sitzung nicht — sichtbare Qualitätswechsel sind schlimmer als eine dauerhaft niedrigere Stufe.
- `prefers-reduced-motion`, `saveData`, niedriger Akkustand und thermische Drosselung erzwingen T0/T1.
- **T0 ist kein Fallback, sondern die Basisauslieferung.** T1–T3 sind Zugaben.

### Asset-Pipeline

- AVIF + WebP, responsiv, mit festen Dimensionen (CLS = 0 ist eine Build-Anforderung, keine Hoffnung).
- KTX2/Basis für Texturen, glTF mit Meshopt.
- **Variable Fonts, subgesetzt, selbst gehostet.** Das entfernt in einem Schritt: den Drittanbieter-Roundtrip vor dem ersten Text, die IP-Übermittlung an Google und den größten Teil der Begründung für den Cookie-Banner (1.8).
- **Keine Drittanbieter zur Laufzeit.** Keine Analytics, die eine Einwilligung braucht. Damit entfällt der Cookie-Banner vollständig — das ist ein Designgewinn, kein juristischer Nebeneffekt: der z-Index-`10000`-Konflikt aus 1.6 löst sich auf, weil der Gegner verschwindet.

### Budgets, im CI erzwungen

```
JS auf dem kritischen Pfad   ≤ 120 KB
LCP (Moto G4 / 4G)           ≤ 1,2 s
CLS                          = 0
INP                          ≤ 100 ms
Tote interne Links           = 0
404s auf referenzierte Assets = 0
```

Überschreitung bricht den Build. **„Never reduce quality" ist nur real, wenn es mechanisiert ist.** Die letzten beiden Zeilen sind direkt aus Phase 0 abgeleitet: Genau diese beiden Prüfungen hätten den gesamten Befund verhindert.

---

## Phase 5 — Umsetzung

> **Nicht: Rewrite everything.**
> **Sondern: Never reduce quality in any step.**

Das ist keine Aufforderung zur Vorsicht. Es ist eine Reihenfolgenanweisung: Die Schritte, die die Qualität am stärksten heben, sind hier die billigsten — und sie kommen zuerst.

### Schritt 0 — Wahrheit herstellen (ein Tag, keine Gestaltung)

Nichts aus Phase 2–4 ist irgendetwas wert, solange das hier nicht stimmt:

- Erfundene Kundenlogos entfernen. Ersatzlos.
- Widersprüchliche Zahlen auf einen belegbaren Satz reduzieren.
- Fünf tote Navigationslinks auflösen — Ziel bauen oder Link entfernen.
- `nf-boot.js` / `nf-engine.js` aus 17 Seiten und aus dem Service Worker entfernen. Den Engine-Abschnitt der README entfernen.
- Die Navigation vereinheitlichen: `index 2.html` hochziehen oder die IA von `index.html` angleichen. Eine Seite, eine Navigation.
- Cache-Version des Service Workers hochzählen, sonst bleibt die alte Startseite in den Browsern eingefroren.
- Manifest-Icon-Pfade korrigieren (`favicon/` existiert nicht).
- `CFNetworkDownload_*.html`, `*.zip`, `Banner .heic`, doppelte Favicons aus dem Web-Root entfernen.
- Team-Fotos komprimieren (5,3 MB → < 200 KB).
- Newsletter an einen echten Endpunkt hängen — Formspree läuft bereits auf anderen Seiten dieser Site.
- Cookie-Banner entfernen, sobald Fonts selbst gehostet sind.

Danach ist die Aussage „sauberer Code, kompromisslose Qualität" zum ersten Mal durch die Seite selbst belegt. **Dieser Schritt kostet einen Tag und hebt die wahrgenommene Qualität stärker als alle folgenden zusammen.**

### Schritt 1 — Das stärkste Argument nach vorn

Der Showcase wird der erste Bildschirm. Nicht als Ankündigung, nicht als Karussell: ein laufendes, anfassbares eigenes System, im Rahmen, sofort bedienbar. Das Stockfoto entfällt in derselben Bewegung.

Das ist eine reine Umstellung — keine neue Technologie, kein neuer Stack. **Größter Einzelgewinn im ganzen Plan.**

### Schritt 2 — Vom Anstrich zum Licht

Das Gold-als-Farbe-System wird durch das Ein-Licht-System ersetzt. Eine Federdatei ersetzt alle Einzeltransitions. Die acht gestrichenen Animationen aus 1.7 verschwinden.

Noch immer kein WebGL. Das ist wichtig: Wenn Phase 3 sich nicht schon in reinem CSS richtig anfühlt, wird WebGL es nicht retten.

### Schritt 3 — Der Rahmen wird persistent

View Transitions. Kein Weiß zwischen zwei Zuständen. Ab hier ist es kein Website-Verhalten mehr.

### Schritt 4 — Die Schicht darüber

Erst jetzt WebGL, Licht, Material, Kontaktschatten — als T1–T3 über einem T0, das bereits vollständig ausgeliefert wird und für sich funktioniert.

### Die Regeln, die für jeden Schritt gelten

1. **Jeder Schritt muss allein auslieferbar sein.** Ein Schritt, der nur zusammen mit dem nächsten funktioniert, ist zu groß.
2. **Kein Schritt darf einen Ladezustand einführen.** Wenn ein Schritt einen Spinner braucht, ist der Schritt falsch geschnitten.
3. **Nach jedem Schritt ist die Seite besser als davor** — nicht „gleich gut, aber näher am Ziel". Kein Zwischenzustand, in dem etwas schlechter ist.
4. **Kein Schritt fügt eine Abhängigkeit hinzu, ohne eine zu entfernen.**

---

## Verbote

Die beiden Ausschlussregeln, wörtlich — mit den Erkennungsmerkmalen, ohne die sie nicht durchsetzbar wären.

### > Reject any design that resembles a modern agency portfolio.

Konkret verboten, alles davon aktuell auf der Seite vorhanden:

- Vollflächiges Stockfoto-Hero
- Badge-Pillen als Eyebrow über jeder Sektion
- Vierer-Grid gleichgewichteter Service-Cards mit Icon-Quadrat
- Serif-Überschriften mit Gold-Gradient-Clip
- Karten, die beim Hover hochfahren
- Endlos laufender Tech-Stack-Marquee
- Nummerierte Vier-Schritt-Prozesssektion
- Hochzählende Statistiken
- „Bereit für Ihr Projekt?" als Abschluss jeder Seite
- Erfundene Kundenlogo-Wände

### > Reject every design trend that became popular because of Awwwards unless it genuinely improves the experience.

Konkret verboten:

- Preloader mit Prozentzähler
- Ersetzte Cursor (Blob, Punkt, Wort)
- Scroll-Jacking, gepinnte Sektionen, horizontale Umleitung
- Text-Scramble- und Decrypt-Effekte
- Magnetische Buttons
- WebGL-Displacement bei Bild-Hover
- Letterbox-Balken und Fake-Timecodes
- Fake-BIOS- und Fake-Boot-Sequenzen
- Bloom, Chromatic Aberration, Lens Dirt, anamorphotische Flares, Film Grain
- Generative Ambient-Soundtracks

**Sechs Punkte dieser zweiten Liste sind heute auf der Seite. Neun weitere waren in der gelöschten Engine.** Die Liste ist keine Vorsichtsmaßnahme gegen eine hypothetische Zukunft — sie beschreibt die Vergangenheit dieses Projekts.

Der Zusatz „unless it genuinely improves the experience" bleibt in Kraft und wird nicht als Hintertür benutzt: Er greift nur, wenn sich das Problem benennen lässt, das ohne dieses Element ungelöst bliebe. „Es wirkt hochwertiger" ist kein Problem.

---

## Bewertungsinstanz

Für **jede** Designentscheidung, auch für die eigenen. Sieben Fragen. Eine einzige negative Antwort → **Redesign it.**

> Warum existiert sie? · Welches Problem löst sie? · Was kostet sie an Performance? · Ist sie in zwei Jahren noch modern? · Würde Apple sie behalten? · Würde Dieter Rams zustimmen? · Würde Jony Ive sie entfernen?

Zehn Entscheidungen dieses Dossiers, geprüft. **Vier haben nicht bestanden.**

---

**E-1 · Der persistente Rahmen** — ✅ **behalten**

Existiert, weil Navigation heute den Kontext zerstört (1.4). Löst: Orientierungsverlust beim Seitenwechsel. Kosten: nahe null, View Transitions sind nativ. In zwei Jahren: Persistenz veraltet nicht, sie ist die Abwesenheit eines Fehlers. Apple: behält es — es ist ihr Grundprinzip seit dem ersten iPhone. Rams: *„So wenig Design wie möglich"* — hier wird ein Element entfernt, nicht hinzugefügt. Ive: würde es nicht entfernen; es *ist* die Entfernung.

**E-2 · Ein Licht statt Gold als Anstrich** — ✅ **behalten**

Existiert, weil `#C9A962` derzeit in acht Deckkräften über alles gelegt ist und deshalb nichts mehr betonen kann (1.6). Löst: fehlende Hierarchie und den Preset-Geruch (1.2). Kosten: ein Gradient statt achtzig Farbzuweisungen — netto günstiger. In zwei Jahren: physikalisch motivierte Beleuchtung ist kein Trend. Apple/Rams/Ive: alle drei bejahen dieselbe Sache — Reduktion auf ein Prinzip statt Verteilung einer Eigenschaft.

**E-3 · Ersatzlose Streichung des Cold Open** — ✅ **behalten**

Existiert, weil 6,5 s Fake-Ladebalken eine gelöschte Engine ankündigen (1.3). Löst: 100 % verschwendete Aufmerksamkeit in den ersten Sekunden. Kosten: −6,5 s. Ive würde es entfernen — er hat es bereits, gedanklich, für uns.

**E-4 · WebGL-Nachbau der Showcase-Produkte** — ❌ **verworfen**

Ursprünglicher Gedanke: die fünf Produkte als WebGL-Szenen in den Rahmen setzen, mit Material und Licht.

*Welches Problem löst es?* Keins. Die Produkte **sind bereits echte, laufende Software**. Ein WebGL-Nachbau wäre eine Abbildung von etwas, das man auch direkt haben kann — also genau der Fehler, den Phase 2/V („Direktheit") verbietet.
*Kosten:* hoch. *Würde Apple das behalten?* Nein — Apple zeigt Produkte, keine Rendering-Nachbauten von Produkten.
**Redesign:** Nicht nachbauen. Das echte Produkt läuft im Rahmen, bedienbar, ohne Geräteattrappe. Der WebGL-Bedarf für den Showcase entfällt **vollständig**.

**E-5 · Screen-Space-Reflection unter dem Produkt** — ❌ **verworfen**

*Warum existiert sie?* Damit die Fläche real wirkt. *Kosten?* Ein zusätzlicher Render-Pass für einen dekorativen Verlauf.
*Rams:* nein — Dekoration, die als Funktion auftritt. *Ive:* entfernt es sofort.
**Redesign:** physikalisch korrekter Kontaktschatten. Gleiche Wirkung, ein Bruchteil der Kosten, und tatsächlich das, was Realität signalisiert — Objekte werfen Schatten, Fußböden spiegeln selten.

**E-6 · Gebürstetes Metall als Flächenmaterial** — ❌ **verworfen**

*In zwei Jahren noch modern?* Nein. Gebürstetes Metall ist ein Skeuomorph mit belasteter Geschichte (Aqua, 2003) und wird als „Retro-Premium" gelesen, sobald der Zyklus dreht.
*Würde Apple es behalten?* Nein — Apple ist seit über einem Jahrzehnt bei undifferenzierten Oberflächen.
**Redesign:** Die Fläche wird nahezu strukturlos. Anisotropie bleibt **ausschließlich an der Kante**. Das Material wird nicht durch seine Textur erkennbar, sondern dadurch, wie seine Kante Licht fängt. Näher an der Vision, billiger im Shader.

**E-7 · Audio** — ❌ **gestrichen** *(war in der Aufgabenstellung als Systembestandteil vorgesehen)*

*Welches Problem löst es?* Keins, das benennbar wäre.
*Kosten:* Dekodierung, Event-Handling, eine zusätzliche Einwilligungsfrage, ein Zustand mehr im System.
*In zwei Jahren?* Ambient-Sound auf Websites ist bereits jetzt ein Awwwards-Erkennungsmerkmal — fällt damit unter Verbot 2.
*Ive:* entfernt es sofort und ohne Diskussion.
**Kein Redesign. Ersatzlos.** Phase 3 führt Audio deshalb als „es gibt keins" — die Kategorie aus der Aufgabenstellung ist beantwortet, die Antwort lautet Null.

**E-8 · Fokusverlagerung als einziger Effekt** — ⚠️ **Redesign, dann behalten**

Grundsätzlich tragfähig: Schärfe beantwortet „was soll ich jetzt lesen".
*Fehlgeschlagene Frage:* Unscharfer Text ist eine Barriere — für Sehbeeinträchtigungen, für Screenshots, für Übersetzungswerkzeuge, für Textsuche im Browser.
**Redesign:** Text wird **nie** unscharf. Unschärfe existiert ausschließlich auf Ebenen **hinter** dem Text. Damit besteht die Entscheidung alle sieben Fragen.

**E-9 · Hochzählende Statistiken** — ❌ **verworfen** *(Bestand, aus `index 2.html`)*

*Warum existiert es?* Weil es alle machen. *Welches Problem löst es?* Keins — es verhindert das Lesen der Zahl während der Animation und suggeriert Live-Daten, die es nicht gibt.
Verstößt gegen Verbot 1 und gegen Phase 2/VII. **Ersatzlos.**

**E-10 · Lenis** — ❌ **verworfen** *(war in der Aufgabenstellung als Architekturbestandteil vorgesehen)*

*Welches Problem löst es?* Eingabe-Jitter auf Trackpads — real, aber klein.
*Kosten:* ~8 KB, ein rAF-Dauerläufer, und der Scroll gehört nicht mehr dem Betriebssystem. Scroll-Ankopplung, Barrierefreiheits-Werkzeuge und `scroll-behavior` müssen anschließend nachgebaut werden.
*Würde Apple es behalten?* **Nein.** Apple glättet Scroll auf den eigenen Seiten nicht. Sie machen den Inhalt schnell genug, dass nativer Scroll sich richtig anfühlt.
*Rams:* Ein Element, das eine Systemfunktion durch eine schlechtere Nachbildung ersetzt, ist die Definition von überflüssigem Design.
**Redesign:** Nativer Scroll + CSS Scroll-Timeline. Falls Jitter messbar stört, ≤ 60 ms Glättung in ~1 KB eigenem Code — nicht 1,2 s Nachlauf in 8 KB Abhängigkeit.

---

### Was die Bewertungsinstanz über sich selbst zeigt

Von zehn geprüften Entscheidungen sind vier gefallen und eine musste überarbeitet werden. **Zwei der gefallenen — Audio und Lenis — standen ausdrücklich in der Aufgabenstellung.**

Genau das ist der Zweck einer Bewertungsinstanz. Sie ist wertlos, wenn sie nur bestätigt. Eine Prüfung, die nichts streicht, ist keine Prüfung, sondern eine Präsentation.

Bemerkenswert ist außerdem, welche Frage am häufigsten getötet hat: nicht „ist es gut?", sondern **„ist es in zwei Jahren noch modern?"** und **„würde Jony Ive es entfernen?"**. Beide Fragen prüfen dasselbe — ob ein Element existiert, weil es gebraucht wird, oder weil es beeindruckt.

---

## Der Schluss, der am Anfang stand

> **NobleFrame is a digital product that happens to run in a browser.**

Das ist kein Slogan. Es hat Konsequenzen, und dies sind sie:

- **Es hat eine Version.** Sichtbar. Mit einem Änderungsprotokoll, das ein Mensch lesen kann.
- **Es hat keine Seiten, sondern Zustände.** Der Rahmen bleibt (Phase 2/IV).
- **Es erinnert sich.** Wo man war, was man gesehen hat, welche Qualitätsstufe das Gerät trägt.
- **Es funktioniert offline und ist installierbar.** Service Worker und Manifest existieren bereits — sie zeigen nur derzeit auf gelöschte Dateien und ein nicht existierendes Icon-Verzeichnis. Der Weg dorthin ist kurz.
- **Es misst sich selbst und zeigt das Ergebnis.** Nicht „90+ PageSpeed" als Behauptung im Hero, sondern der tatsächliche Wert dieses Aufrufs, auf diesem Gerät, jetzt. Das Werkzeug dafür steht bereits auf `tools.html` — es wird nur bisher auf fremde Websites angewendet statt auf die eigene.
- **Es wird gepflegt statt neu gemacht.** Das Repository enthält heute zwei Startseiten, eine gelöschte Engine, deren Aufrufe noch in siebzehn Dateien stehen, und einen Web-Root voller Safari-Downloads. Ein Produkt hat so etwas nicht. Eine Website kommt damit durch.

Der Unterschied zwischen einer Website und einem Produkt ist keine Technologie. Es ist die Frage, ob jemand dafür verantwortlich ist, dass jede einzelne Aussage darin stimmt.

**Das ist die eigentliche Arbeit. Alles in Phase 3 und 4 ist erst danach relevant.**

---

# Phase 6 — Der Anstrich fällt weg

*Nachtrag zum Redesign. Die Phasen 0–5 beschreiben die Seite, wie sie war,
und die Vorstellung, auf die sie zulief. Dieser Teil beschreibt, was davon
Bestand hatte und was nicht.*

## Der Befund, in einem Satz

Die Seite war dunkel und golden und wollte teuer wirken — und genau
deshalb wirkte sie billig. Nicht wegen der Farben, sondern wegen der
Mittel: weichgezeichnete Lichtkreise, ein WebGL-Netz über dem Text, ein
Vorhang vor dem Inhalt, ein Raster-Overlay, eine Gold-Aura am Cursor,
Ringe bei jedem Klick, ein magnetischer Knopf in der Navigation. Sieben
Schichten, die alle dasselbe taten: Aufmerksamkeit einfordern, ohne etwas
zu erklären.

Phase 1.3 hatte danach gefragt — „Was wirkt billig?" — und die Antwort
war die ganze Zeit im Repository sichtbar: eine 52 KB große, von keiner
Seite eingebundene Stylesheet-Leiche, die dreimal hintereinander
`@keyframes smokeFloat` und `.smoke-particle` definierte.

## Was entfernt wurde

| Weg | Warum |
|---|---|
| `CFNetworkDownload_BaQAbR.css` | Von keiner Seite eingebunden. Enthielt den Gold-Rauch — dreimal. |
| `cinematic-engine.js` | Canvas-Intro mit Nebel und Glyphen. Beschäftigte den ersten Bildaufbau, bevor der erste Satz lesbar war. |
| `nf-interactions.js` | Cursor-Aura, Klick-Schockwellen, magnetischer Knopf. Drei Antworten auf Fragen, die niemand gestellt hat. |
| `nf-tech.js` + `vendor/vanta.net.min.js` + `vendor/three.min.js` | Ein WebGL-Netz im Hero. 590 KB Three.js für einen Hintergrund. |
| `nf-shader.js` | WebGL-Akzent. Siehe oben. |
| `vendor/lenis.min.js` | Geglättetes Scrollen. Der Zeiger sagt eins, die Seite tut es einen Moment später. |

Zusammen 748 KB, die niemand angefordert hat.

Dass zwei dieser Entscheidungen — Lenis und die Bewegungsschicht — schon
in Phase 5 von der Bewertungsinstanz gestrichen worden waren und trotzdem
noch im Auslieferungsstand lagen, ist der eigentliche Befund. Eine
Prüfung, deren Ergebnis nicht umgesetzt wird, ist eine Präsentation.

## Was an ihre Stelle trat

**Papier statt Bühne.** Phase 3 hielt fest: „Gold ist eine Lichtfarbe,
keine Anstrichfarbe." Der Satz stimmt — nur trug die Seite es als
Anstrich. Jetzt ist der Grund ein warmer Bogen, die Schrift Tinte, und es
gibt genau ein Signal.

Der praktische Grund wiegt schwerer als der ästhetische: die
Vorschaubilder der fünf Systeme sind dunkel. Auf hellem Grund liegen sie
wie Tafeln in einem Bildband. Dunkel auf dunkel war ein Nebel, in dem die
eigene Arbeit verschwand — bei einem Atelier, dessen stärkstes Argument
diese Arbeit ist, war das der teuerste Fehler der alten Seite.

**Eine Datei statt neunzehn.** Rund 250 KB Inline-CSS lagen in neunzehn
Kopien in den Seiten, jede leicht anders. Was auf mehr als einer Seite
vorkommt, steht jetzt in `assets/css/nf.css`. Was eine Seite darüber
hinaus braucht, steht in dieser Seite — und nur dort.

**Der Bericht als Format.** Das Showcase zeigte ein Projekt. Vier weitere
existierten, liefen live, und ihre Vorschaubilder lagen ungenutzt im
Repository. Jetzt stehen alle fünf dort, jedes mit Aufgabe, Bauteilliste,
Kennwerten — und einem Abschnitt „Kanten": die Stellen, an denen es
schwierig wurde. Das ist der Abschnitt, den Agentur-Fallstudien weglassen,
und der einzige, der etwas beweist.

## Die Regel, die dazukam

> **Kein Rauch.** Was Tiefe erzeugt, sind Kante, Fläche und Abstand. Wer
> eine Ausnahme braucht, schreibt dazu, welches Problem sie löst.

Sie steht bewusst als Verbot da und nicht als Empfehlung. Die alte Seite
ist nicht durch eine große Entscheidung entstanden, sondern durch sieben
kleine, von denen jede für sich vertretbar war.
