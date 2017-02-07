Offline Version von PROSTd - ein Tool zum einfachen erfassen von Projektstunden.
Erstellt mit elektron.
Ausgespielt für Windows; Linux und mac ist auch möglich - siehe Doku http://electron.atom.io/

Screenshot (Version 0.1.5. mit userstyles):<br>
![prostd_app](https://cloud.githubusercontent.com/assets/3751286/21822205/9107aa04-d776-11e6-99c3-75c97c9160c6.png)

Auf dem Screenshot sieht man ein Feld mit einem "R", hier trage ich die Art der Stunden:<br>
R = Realisation<br>
K = Konzeption<br>
Z = Reisezeit<br>
B = Besprechnung<br>
U = Urlaub<br>
F = Feiertag<br>

#Projekt bearbeiten#
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
Mit<br>
> build

kann ein Packet zur Installation erzeugt werden.
Das kann dann wie jedes normale Programm von Nutzern installiert werden. 
Das Installationsprogramm ist dann im Verzeichnis `dist` zu finden.

siehe auch https://github.com/polygontwist/PROSTd/
