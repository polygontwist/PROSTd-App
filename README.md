Offline Version von PROSTd - ein Tool zum einfachen erfassen von Projektstunden.
Erstellt mit electron (v6.1.12).
Ausgespielt für Windows; Linux und mac ist auch möglich - siehe Doku http://electron.atom.io/


#### release notes ####

* 0.1.6 Sort by Date; scroll to aktuellen Tag
* 0.1.7 add Monatsauswertung
* 0.1.8 openDevTool per klick; Tabelle sortierbar (add TableSort.js)
* 0.1.9 Einstellungen, Fensterpos, Developerbutton 
* 0.1.10 Projektinfos ("Einstellungen")
* 0.1.12 Gesammtstunden; Einstellungen:Links zu GitHub
* 0.1.13 TODO-Liste
* 0.1.15 Versionsnummer im Titel; "neues Projekt" wird gleich in Editor geladen
* 0.1.16 TODO-Liste fix; online check auf updates
* 0.1.17 Dateinamen fix ('.', ',' oder Leerzeichen werden zu '-')
* 0.1.18 Projektliste: Speicherung der Sortierungsauswahl, +Spalte Kunde; MonatsprojektitemCSS + Kundenname (Farbe je Kunde möglich)
* 0.1.19 fix: MonatsprojektitemCSS mit Kundenname (jetzt ohne Leerzeichen, Komma, Simikolon und Punkt und immer kleingeschrieben); Developertools per STRG + d aufrufbar; etwas aufgeräumt; Feiertage bis 2021 erfasst (dazu feiertage.json vor start löschen)
* 0.1.20 "mein Projekt" Stunden nach Datum sortiert; "mein Tag" CSS: Eintrag Standardbreite 95%
* 0.1.21 die TODO-Liste ist nun per drag&drop zu sortieren, kleine CSS Optimierungen
* 0.1.22 den Projekten kann eine Farbe zugewiesen werden, diese wird in der Monats- und Projektliste benutzt
* 0.1.23 "mein Tag": Tag in der ganzen Zeile klickbar, direkter Link zum download-Ordner, bugfixes, Jahresübersicht in Überblick
* 0.1.24 Urlaub kann auch eingefärbt werden, in Jahresübersicht haben Tage mit Urlaub einen unteren Strich. bugfixes.
* 0.1.25 bugfixes (Übersicht: Sortierung, Textfehler), Farbdialogposition:fixed
* 0.1.26 bugfixes Tagesstundenberechnung, gerundet auf eine Stelle hinterm Komma, Jahresübersicht: keine 0-Stunden-Projekte außer Urlaub & Feiertage
* 0.1.27 bugfix: Rundungsfehler "mein Tag" Monatsstunden (zu viele Nachkommastellen)
* 0.1.28 Suchleiste über Projektliste; Electron: v6.0.4
* 0.1.29 Einstellungen: Auswahl der Arbeitstage pro Woche (in Zusammenspiel mit Arbeitsstunden pro Tag); Gültigkeit der Urlaubstageanzahl pro Jahr, Urlaub: neuer Tab zum einfachen verteilen des Jahresurlaubes, CSS: Darstellung der Einträge optimiert - Eintrag geht über ganze Zeile, bugfixes
* 0.1.30 Fehler (fehlende Variabelninitialisierung) von 0.1.29 beseitigt
* 0.1.31 Fehler (fehlende Variabelninitialisierung bei Neuinstallation) von 0.1.30 beseitigt
* 0.1.32 bugfix (Monatsgesammtzählung); Urlaub mit halben Tagen (in "meine Projekte"); Urlaubs-Konvertbutton für alte Daten entfernt
* 0.1.33 Projektsuchfilter bleibt bei Wechsel der Ansichten erhalten
* 0.1.34 JSON-Parse-Fix; create fix wenn keine Daten vorhanden (für PHP Version)
* 0.1.35 Projekt zeigt das aktuelle Jahr, vergangene Jahre können per Schalter ein- oder ausgeblended werden
* 0.1.36 Überblick: Filterschalter um Projekte vom gleichen Auftragsgeber zusammen zu fassen
* 0.1.37 Überstundenanzeige, Fix 0.1.36
* 0.1.38 Überstundenanzeige Fix, Feiertage bis 2025 (feiertage.json löschen um sie zu erhalten)
* 0.1.39 Überstundenanzeige Fix Arbeitstagberechnung
* 0.1.40 Bugfix bei Überblick
* 0.1.41 Bugfix bei: speichern der Optionen, Fensterpositionierung bei Mehrmonitorbetrieb; Downlodlink bei "Einstellungen" 
* 0.1.42 Bugfix; Export der Projektdaten als CSV - z.B. für Exel; Erweiterung Feiertage bis 2028 für MV
* 0.1.43 CSV Zahlen Export abhängig von Sprache; Sprachumschalter DE/EN(experimentell)
* 0.1.44 jeder Tageseintrag kann weitere Infos aufnehmen, z.B. ein Weblink
* 0.1.45 Bugfix (Tageseintrag-URL); neue Tageseintrag-Infotypenbuttons: Pfad zu Ordner, Link auf Datei

#### Programm auf Windows 10 installieren ####
Da ich momentan noch kein signiertes Installationsprogramm erzeugen kann, muss nach dem download und doppelklick im folgenden Dialog "Weitere Informationen" und dann "Trotzdem ausführen" geklickt werden.
<img src="https://github.com/polygontwist/PROSTd-App/blob/master/screenshots/win10install.png" width="806" alt="win10 install">

#### allgemeine Infos ####

Ab Verison 0.1.14 gibt es eine Projektbasierende TODO-Liste (ab Version 0.1.16 Sortierung gefixt).

<img src="https://github.com/polygontwist/PROSTd-App/blob/master/screenshots/prost0-1-14.png" width="593" alt="Screenshot TODO">

Screenshot (Version 0.1.5. mit userstyles):<br>
<img src="https://github.com/polygontwist/PROSTd-App/blob/master/screenshots/prost0-1-05.png" width="593" alt="Screenshot Übersicht">

Auf dem Screenshot sieht man ein Feld mit einem "R", hier trage ich die Art der Stunden:<br>
R = Realisation<br>
K = Konzeption<br>
Z = Reisezeit<br>
B = Besprechnung<br>
U = Urlaub<br>
F = Feiertag<br>

<img src="https://github.com/polygontwist/PROSTd-App/blob/master/screenshots/prost0-1-23.png" width="593" alt="Screenshot Übersicht">

#### Projekt bearbeiten ####
Für die Bearbeitung diese Projektes benötigt man:<br>
https://nodejs.org dabei ist der npm-Packetmanager<br>
mit<br>
> npm install --global electron

wird electron global installiert.
mit<br>
> npm install electron-builder

kommt noch der builder zum packen des Projektes hinzu.

In der Eingabeaufforderung kann, im Verzeichnis des Projektes mit<br>
> electron .

das Programm gestartet werden (Entwicklungsversion).<br>
Mit (Stand 25.8.2019)<br>
> npm run dist --ia32

kann ein Packet zur Installation erzeugt werden.
Das kann dann wie jedes normale Programm von Nutzern installiert werden. 
Das Installationsprogramm ist dann im Verzeichnis `dist` zu finden.

siehe auch https://github.com/polygontwist/PROSTd/

#### Projekt exportieren ####

Im Tab "Meine Projekte" gibt es seit Version 0.1.42 die Option, die Daten als csv zu exportieren. Z.B. für die Weiterverarbeitung in Exel, Calc oder andere.
Die Trennung der Datenfelder ist mit einem ";" umgesetzt.

<img src="https://github.com/polygontwist/PROSTd-App/blob/master/screenshots/prost0-1-42.png" width="593" alt="Screenshot Übersicht">

