# Portfolio & Lebenslauf – Denizcan Güney

Statische Portfolio-Seite plus generierte, ATS-freundliche Lebensläufe – alle Inhalte aus `resume-data.json`.

## Inhalte aktualisieren

Änderungen gehören in `resume-data.json`. Die HTML-Dateien werden daraus erzeugt und sollten nicht von Hand bearbeitet werden.

```bash
node generate-portfolio.js       # index.html + en.html
node generate-cv.js              # cv.html + cv-en.html (vollständige Fassung)
node generate-cv.js --profile=data # cv-data.html + cv-data-en.html
node generate-cv.js --all        # alle CV-Profile
```

Voraussetzung ist nur Node.js, es gibt keine Abhängigkeiten.

## Profile

In `resume-data.json` liegen unter `profiles` die Zielrollen. Jedes Profil hat eine eigene Headline
und ein eigenes Kurzprofil. Bullets, Projekte und Skill-Gruppen tragen ein `tags`-Feld und erscheinen
nur in den dort genannten Profilen; `full` enthält alle Tags, greift aber weiterhin die Limits unten.

| Profil    | Zielrolle                          | Dateien                             |
| --------- | ---------------------------------- | ----------------------------------- |
| `full`    | Allgemein, verlinkt im Portfolio   | `cv.html`, `cv-en.html`             |
| `data`    | Data Analyst / Business Intelligence | `cv-data.html`, `cv-data-en.html`   |
| `product` | Product / Business Analyst         | `cv-product.html`, `cv-product-en.html` |

Für ein neues Profil genügt ein weiterer Eintrag unter `profiles` mit `suffix`, `headline` und
`summary`; die Tags an den bestehenden Bullets werden entsprechend ergänzt.

## Umfang auf einer Seite halten

Der Lebenslauf ist auf eine A4-Seite ausgelegt. Dafür sorgt `limits` in `resume-data.json`:

```json
"limits": { "bulletsPerRole": 4, "projects": 2 }
```

Das Portfolio nutzt `portfolioLimits` (Standard: unbegrenzte Bullets pro Rolle) und den Abschnitt
`portfolio` für Hero, Navigation, About-Texte und Card-Labels. Projekte können optional ein
`portfolio.image`-Feld für Screenshots erhalten.

Bullets und Projekte stehen in absteigender Relevanz, der CV-Generator schneidet den Rest ab.

## PDF erzeugen

Die CV-Seite im Browser öffnen und „Drucken / als PDF speichern" wählen. Das Drucklayout ist auf A4
ausgelegt, Bedienelemente werden ausgeblendet. Im Druckdialog sollten Kopf- und Fußzeilen
deaktiviert, der Maßstab auf 100 % gesetzt und der Dateiname sprechend gewählt werden, zum Beispiel
`Lebenslauf_Denizcan_Gueney.pdf`. Chrome liefert das verlässlichste Ergebnis; Safari skaliert
standardmäßig anders und erzeugt sonst eine zusätzliche Seite.

## Hinweise

- Der GitHub-Link zu „Fix It Together“ zeigt auf `Fix-It-Togehter` – das ist der tatsächliche Repository-Name (Tippfehler upstream).
- Bosch-Bullets sind ergebnisorientiert formuliert; Kennzahlen können in `resume-data.json` ergänzt werden, sobald verfügbar (siehe `metricsNotes.bosch`).
