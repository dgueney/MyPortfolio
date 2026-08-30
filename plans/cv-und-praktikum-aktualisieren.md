---
name: CV und Praktikum aktualisieren
overview: Die deutsche und englische Portfolio-Version werden inhaltlich auf das Bosch-Pflichtpraktikum ausgerichtet und um die erworbenen Data-/BI-Kompetenzen ergänzt. Zusätzlich entsteht ein separater, semantischer und ATS-freundlicher HTML-Lebenslauf, der aus einer zweisprachigen strukturierten Datenquelle statisch erzeugt und im Browser als PDF gespeichert werden kann.
todos:
  - id: portfolio-content
    content: Bosch-, Jelbi-, Profil- und Skill-Inhalte in der deutschen und englischen Portfolio-Seite aktualisieren
    status: completed
  - id: resume-source
    content: Zweisprachige strukturierte Lebenslauf-Daten und statischen Generator anlegen
    status: completed
  - id: resume-layout
    content: ATS-freundliche CV-Seiten samt Drucklayout erzeugen und im Portfolio verlinken
    status: completed
  - id: verify-output
    content: Chronologie, Übersetzungen, Responsivität, Druckansicht und semantische Struktur prüfen
    status: completed
isProject: false
---

# Bosch-Praktikum und ATS-Lebenslauf integrieren

## Portfolio aktualisieren

- In [index.html](index.html) und [en.html](en.html) den Bosch-Eintrag auf den offiziellen Titel „Pflichtpraktikum Wirtschaftsinformatik – Data Excellence / Business Intelligence“ anpassen und die umfangreichen Angaben auf etwa fünf prägnante, ergebnisorientierte Punkte verdichten: Data-Quality-Framework, Power-BI-Change-Report, Historisierungs-/Delta-Logik, CAFM-/DWH-Datenmodellierung sowie Reporting-Governance und bereichsübergreifende Zusammenarbeit.
- Die Jelbi-Station als abgeschlossene Tätigkeit konsistent direkt vor Bosch führen. Der gewünschte Zeitraum ist im aktuellen Stand bereits korrekt als April 2026 bis März 2026 eingetragen; Titel, Arbeitgeberdarstellung und Übersetzung werden zwischen DE/EN vereinheitlicht.
- Hero, Kurzprofil und „Über mich“ auf den Schwerpunkt Data Excellence, Business Intelligence und Data Quality aktualisieren, ohne den bisherigen Produkt-/Fraud-Hintergrund zu verlieren.
- Den Skills-Bereich fachlich neu gruppieren: „Data & BI“ (Power BI, Power Query, SQL, Datenmodellierung), „Python & Analytics“ (Python, pandas, NumPy, Streamlit, Plotly), „Systeme & Methoden“ (Excel, Jira, Archibus, Data Quality, Data Governance, Anforderungsmanagement, agile Zusammenarbeit) sowie Sprachen. Weniger relevante vorhandene Technologien bleiben erhalten, werden aber nachrangig dargestellt.

## ATS-freundlichen Lebenslauf erzeugen

- Eine zentrale zweisprachige Datenquelle für Profil, Berufserfahrung, Bildung, Fähigkeiten und Kontaktdaten anlegen, statt Inhalte direkt in der Darstellung zu verteilen.
- Ein kleines Build-Skript ohne zusätzliche Abhängigkeiten erstellen, das daraus [cv.html](cv.html) und [cv-en.html](cv-en.html) als vollständig statische Dokumente erzeugt. Semantische Überschriften, echte Textlisten, lineare DOM-Reihenfolge und klare Datums-/Arbeitgeberfelder sorgen dafür, dass der Inhalt auch ohne JavaScript maschinenlesbar bleibt.
- Eine separate druckoptimierte Gestaltung ergänzen: einspaltiges A4-Layout, gute Schwarz-Weiß-Lesbarkeit, keine Skill-Balken/Icons/Tabellen, kontrollierte Seitenumbrüche und ein sichtbarer „Drucken / als PDF speichern“-Button, der beim Druck ausgeblendet wird.
- Die bisherigen PDF-Links in beiden Portfolio-Seiten auf die jeweilige HTML-CV-Seite umstellen; dort kann der Lebenslauf direkt geöffnet, gedruckt oder als PDF gespeichert werden. So gibt es keinen toten Verweis mehr auf die aktuell fehlende `DenizcanLebenslauf.pdf`.

## Qualitätssicherung

- Generator ausführen und prüfen, dass DE/EN-Ausgaben dieselbe Chronologie und denselben fachlichen Umfang besitzen.
- Responsives Layout, Druckvorschau/A4-Umbruch, Tastaturbedienung, Links und HTML-Struktur prüfen; außerdem sicherstellen, dass Bosch als laufend bis September 2026 und Jelbi als beendet im März 2026 eindeutig erkennbar sind.
