--Wo sind meine Daten?--
Deine Projektdaten findest Du in Deinem Dokumente-Ordner (z.B. "C:\Users\akosm\Documents\PROSTd\userData")
 
 
--Kann ich die Einträge selber gestalten?--
Ja, ab Version 0.1.4 kann in Deinem Datenordner eine "style.css" abgelegt werden. Mit der kann man das Programm umgestalten.
 
Beispiel:
jeder Eintrag hat als Klasse die Projekt-ID (=Dateiname), z.B. "urlaub".
Mit 
.projektitem.urlaub{
	background-color:#ff0000;
}
kann man die Hintergrundfarbe ändern.
 
Beispiel 2:
Ist die Projekt-ID (Dateiname) "div_803464" lautet der CSS Eintrag so:
.projektitem.div_803464{
	background-color:rgba(0,128,25,0.5);
}
 
Beispiel 3 Einfärbung des aktuellen Tages:
.monatsliste .heute{
	background-color:rgb(255, 255, 137);
}