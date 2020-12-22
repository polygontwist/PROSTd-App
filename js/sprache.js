var spracheaktiv="DE";
var sprachen=[
	{"language":"DE",
	 "description":"deutsch",
	 "words":{//"id":"wort in Sprache"
		 "loading":"lade daten...",
		 "meinTag":"mein Tag",
		 "meinProj":"meine Projekte",
		 "todo":"TODO",
		 "ueberblick":"Überblick",
		 "einstellungen":"Einstellungen",
		 "projekt":"Projekt",
		 "projekte":"Projekte",
		 "kunde":"Kunde",
		 "datum":"Datum",
		 "Tag":"Tag",
		 "Monat":"Monat",
		 "letzte12mon":"die letzten 12 Monate",
		 "filterby":"zeige Daten von ",
		 "zeigebeendete":"zeige beendete Projekte",
		 "datzeigebeendete":"zeige beendete Projekte",
		 "reststunden":"geplante Reststunden",
		 "circa":"ca.",
		 "ok":"OK",
		 "abbrechen":"abbrechen",
		 
		 "Januar":"Januar",
		 "Februar":"Februar",
		 "März":"März",
		 "April":"April",
		 "Mai":"Mai",
		 "Juni":"Juni",
		 "Juli":"Juli",
		 "August":"August",
		 "September":"September",
		 "Oktober":"Oktober",
		 "November":"November",
		 "Dezember":"Dezember",
		 "kurzJanuar":"Jan",
		 "kurzFebruar":"Feb",
		 "kurzMärz":"Mär",
		 "kurzApril":"Apr",
		 "kurzMai":"Mai",
		 "kurzJuni":"Jun",
		 "kurzJuli":"Jul",
		 "kurzAugust":"Aug",
		 "kurzSeptember":"Sep",
		 "kurzOktober":"Okt",
		 "kurzNovember":"Nov",
		 "kurzDezember":"Dez",
		 
		 "KalWoch":"KW",
		 
		 "Mo":"Mo",
		 "Di":"Di",
		 "Mi":"Mi",
		 "Do":"Do",
		 "Fr":"Fr",
		 "Sa":"Sa",
		 "So":"So",
		 "stdtaggesammt":"h/Tag",
		 "Kommentar":"Kommentar",
		 "worktyp":"Typ",
		 "Stunden":"Stunden",
		 "monatsauswertung":"Monatsauswertung",
		 "stundengesammt":"Arbeitsstunden im Monat: ",
		 "stundengesammt2":" von ",
		 "gesammtstunden":"Gesamtstunden",
		 "urlaub":"Urlaub",
		 "aenderungsaved":"Änderung gespeichert.",
		 "selectaday":"Wähle einen Tag!",
		 "firstcreateaprojekt":"Bitter erst ein Projekt anlegen.",
		 "selectaprojekt":"Welches Projekt soll eingefügt werden?",
		 "listegeladen":"Liste geladen.",
		 "deleteeintrag":"Eintrag löschen?",
		 "projtitel":"Projekttitel",
		 "Infos":"Infos",
		 "projid":"ProjektID / Dateiname",
		 "keinestunden":"Noch keine Stunden vorhanden.",
		 
		 "datisended":"Ist Projekt beendet?",
		 "datauftraggeber":"Auftraggeber",
		 "datprojektleiter":"Projektleiter",
		 "datstartdatum":"Startdatum",
		 "datenddatum":"Enddatum",
		 "datstatus":"Status",
		 "datprojektart":"Projektart",
		 "datgruppe":"Gruppe",
		 "dattage":"Tage",
		 "datland":"Land",
		 "datgeplantestunden":"geplante Stunden",
		 "datfarb":"Farbe",
		 
		 "dattodotext":"TODO-Listentext",
		 "datintodo":"in TODO-Liste?",
		 "dattodonr":"TODO-Listenposition",
		 "datfarbe":"Farbe",
		 
		 "datdat":"Datum",
		 "datstunden":"Stunden",
		 "dattyp":"Typ",
		 "datkommentar":"Kommentar",
		 "datuser":"Benutzer",
		 "datvonjahr":"von Jahr",
		  "datutagteiler":"Teiler",
		
		 "version":"Version",
		 "projektpage":"die Projektpage liegt auf",
		 "speicherort":"Deine Daten liegen in",
		 
		 "wahleprojekt":"Wähle das zu bearbeitende Projekt aus!",
		 "buttdel":"löschen",
		 "inp_newProj":"Projektname",
		 "inp_filternamen":"suche",
		 "butt_newProj":"neues Projekt",
		 "butt_filternamen":"filtern",
		 "butt_viewpreMon":"zeige",
		 "butt_viewnexMon":"zeige",
		 "farbwaehler":"Farbe wählen",
		 "farbwaehlertitel":"Farbe wählen",
		 
		 "butt_entfernen":"von Liste entfernen",
		// "butt_up":"▲",
		// "butt_down":"▼",
		 "butt_move":"▲▼",
		 
		 "getnewProName":"Wie soll das neue Projekt heißen?",
		 "mesage_inputnamekurz":"Leider zu kurz, gebe bitte mindestens 3 Zeichen ein!",
		 "mesage_inputnamenoinput":"Ohne Name kann ich kein neues Projekt anlegen.",
		 
		 "datdefaulttyp":"Defaultstundentyp",
		 "datshowscramblebutt":"Developertoolbutton anzeigen",
		 "datstundenproArbeitstag":"Stunden pro Arbeitstag",
		 "datwochenarbeitstage":"Arbeitstage in der Woche",
		 "daturlabstageprojahr":"Urlaubstage pro Jahr",
		 "daturlabstageprojahrabjahr":"Urlaubstage pro Jahr gültig ab",
		 
		 "frei":"frei",
		 "waehletagimkalender":"Wählen einen Tag im Kalender!",
		 "tagsconbelegt":"Dieser Tag ist schon belegt, bitte wähle einen anderen.",
		 "tagistfeiertag":"Dieser Tag ein Feiertag, bitte wähle einen anderen.",
		 "tagistwochenende":"Urlaubstag am Wochenende setzen?",
		 "hinweisurlaubtab":"Hier siehst Du Deine Urlaubsverteilung, rechts die noch verfügbaren Tage. Wähle rechts einen freien Tag.<br>Bearbeite Deinen Eintrag bei 'meine Projekte'.",
		 "sonderurlaub":"Sonderurlaub",
		 
		 "zeige":"zeige",
		 "verberge":"verberge",
		 
		 "Autraggeber_zusammenfassen":"gleiche Auftraggeber zusammenfassen",
		 "Überstunden":"Überstunden",
		 "Reststunden":"Reststunden",
		 "Jahresüberstunden":"Jahresüberstunden",
		 "Jahresreststunden":"Jahresreststunden",
		 
		 "neueVersion":"Es gibt eine neue Version :-)"
		}
	},
	{"language":"EN",
	 "description":"english",
	 "words":{
		  "loading":"loading..."
	 }
	}
];


var getWort=function(s){
	var i,spra;
	for(i=0;i<sprachen.length;i++){
		spra=sprachen[i];
		if(spra.language==spracheaktiv){
			if(spra.words[s]!=undefined)
				return spra.words[s];		//gefunden Übersetzung zurückgeben
		}
	}	
	return s; //nicht gefunden, Eingabe zurückgeben
};

