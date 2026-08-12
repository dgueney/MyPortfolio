# Portfolio & Lebenslauf – Denizcan Güney

Statische Portfolio-Seite (`index.html` / `en.html`) plus ein generierter, ATS-freundlicher Lebenslauf.

## Lebenslauf generieren

Alle Inhalte des Lebenslaufs stehen in `resume-data.json`. Die HTML-Dateien werden daraus erzeugt und
sollten nicht von Hand bearbeitet werden – Änderungen gehen beim nächsten Lauf verloren.

```bash
node generate-cv.js                 # cv.html + cv-en.html (vollständige Fassung)
node generate-cv.js --profile=data  # cv-data.html + cv-data-en.html
node generate-cv.js --all           # alle Profile
```

Voraussetzung ist nur Node.js, es gibt keine Abhängigkeiten.

## Profile

In `resume-data.json` liegen unter `profiles` die Zielrollen. Jedes Profil hat eine eigene Headline
und ein eigenes Kurzprofil. Bullets, Projekte und Skill-Gruppen tragen ein `tags`-Feld und erscheinen
nur in den dort genannten Profilen; `full` enthält immer alles.

| Profil    | Zielrolle                          | Dateien                             |
| --------- | ---------------------------------- | ----------------------------------- |
| `full`    | Allgemein, verlinkt im Portfolio   | `cv.html`, `cv-en.html`             |
| `data`    | Data Analyst / Business Intelligence | `cv-data.html`, `cv-data-en.html`   |
| `product` | Product / Business Analyst         | `cv-product.html`, `cv-product-en.html` |

Für ein neues Profil genügt ein weiterer Eintrag unter `profiles` mit `suffix`, `headline` und
`summary`; die Tags an den bestehenden Bullets werden entsprechend ergänzt.

## PDF erzeugen

Die CV-Seite im Browser öffnen und „Drucken / als PDF speichern" wählen. Das Drucklayout ist auf A4
ausgelegt, Bedienelemente werden ausgeblendet. Im Druckdialog sollten Kopf- und Fußzeilen
deaktiviert und der Dateiname sprechend gesetzt werden, zum Beispiel `Lebenslauf_Denizcan_Gueney.pdf`.

## Offene Punkte

Die Bullets bei Bosch sind bewusst ergebnisorientiert formuliert, enthalten aber noch keine
Kennzahlen. Sobald verfügbar, gehören dort Zahlen hinein: Anzahl geprüfter Datensätze und Regeln im
Data-Quality-Framework, eingesparte Zeit durch den Change-Report, Anzahl der nutzenden Fachbereiche.
