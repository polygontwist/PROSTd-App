var pro_stunden_app=function(){
	//--var--
	var basis=undefined;
	var tabnav=undefined;
	var statusDlg=undefined;
	var inputDlg=undefined;
	var optionsleiste=undefined;
	var geladeneprojekte=undefined;
	var _appthis=this;
	var versionsinfos=undefined;
	var optspeichernaktiv=false;
	var suchfilterbegriff="";

	var loadDataURL="getdata.php";
	
	var tabs=[
		{"id":"tab_editTag" ,"butttitel":"meinTag" ,aktiv:false, d_objekt:undefined}
		,{"id":"tab_editTodolist","butttitel":"todo",aktiv:false, d_objekt:undefined}
		,{"id":"tab_editProj","butttitel":"meinProj",aktiv:false, d_objekt:undefined}
		,{"id":"tab_editUrlaub","butttitel":"urlaub",aktiv:false, d_objekt:undefined}
		,{"id":"tab_editUeberblick","butttitel":"ueberblick",aktiv:false, d_objekt:undefined}
		,{"id":"tab_editEinstellungen","butttitel":"einstellungen",aktiv:false, d_objekt:undefined}
	];
	
	//ids siehe Sprache
	var MonatsnameID = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
	var wochentagID=["Mo","Di","Mi","Do","Fr","Sa","So"];
	
	var dateheute=new Date();
	var lokalDataVorlage={//als Einstellungen gespeichert
		//projektlistfilter:undefined,
		tabaktiv:0,
		stundenproArbeitstag:8,
		urlabstageprojahr:20,
		urlabstageprojahrabjahr:dateheute.getFullYear(),
		wochenarbeitstage:[true,true,true,true,true,false,false],//mo,di,...
				
		windowsize:{x:0,y:0,width:0,height:0},
		zeigebeendete:false,
		settings_projektliste:{sortby:"projekte", updown:"up"}	
	};
	
	
	var lokalData=lokalDataVorlage;
	
	var defaultfarben={
		"urlaub":"rgb(94,156,201)",
		"feiertage":"rgb(94,156,201)"
	};
		
	//--"const"--
	var msg_nouser="404:no user",
		msg_error_FileNotfound="404:notfound",
		msg_error_FileNotwrite="404:notwrite",
		msg_error_FileNotread="404:notread",
		msg_input_noName="noname",
		msg_input_shortName="shortname",
		msg_OK="OK";

	//---------
	var checkneueOptionen=function(projekt){
		//console.log("projekt=",projekt);
		if(projekt.id!="urlaub" && projekt.id!="feiertage"){
			if(projekt.info.geplantestunden==undefined){//neue Option
				projekt.info.geplantestunden=0;
			}
			if(projekt.info.farbe==undefined){//neue Option
				projekt.info.farbe="";
			}
		}
		if(projekt.id=="urlaub" || projekt.id=="feiertage"){
			if(projekt.info.farbe==undefined)projekt.info.farbe="";
		}
	}
		
	//--basic--
	var gE=function(id){if(id=="")return undefined; else return document.getElementById(id);}
	var cE=function(z,e,id,cn){
		var newNode=document.createElement(e);
		if(id!=undefined && id!="")newNode.id=id;
		if(cn!=undefined && cn!="")newNode.className=cn;
		if(z)z.appendChild(newNode);
		return newNode;
	}
	var istClass=function(htmlNode,Classe){
		if(htmlNode!=undefined && htmlNode.className){
			var i,aClass=htmlNode.className.split(' ');
			for(i=0;i<aClass.length;i++){
					if(aClass[i]==Classe)return true;
			}	
		}		
		return false;
	}
	var addClass=function(htmlNode,Classe){	
		var newClass;
		if(htmlNode!=undefined){
			newClass=htmlNode.className;
			if(newClass==undefined || newClass=="")newClass=Classe;
			else
			if(!istClass(htmlNode,Classe))newClass+=' '+Classe;			
			htmlNode.className=newClass;
		}			
	}

	var subClass=function(htmlNode,Classe){
		var aClass,i;
		if(htmlNode!=undefined && htmlNode.className!=undefined){
			aClass=htmlNode.className.split(" ");	
			var newClass="";
			for(i=0;i<aClass.length;i++){
				if(aClass[i]!=Classe){
					if(newClass!="")newClass+=" ";
					newClass+=aClass[i];
					}
			}
			htmlNode.className=newClass;
		}
	}
	var delClass=function(htmlNode){
		if(htmlNode!=undefined) htmlNode.className="";		
	}
	var getClasses=function(htmlNode){return htmlNode.className;}

	var getDataTyp=function(o){//String:'[object Array]' '[object String]'  '[object Number]' '[object Boolean]'
		return Object.prototype.toString.call(o); 
	}
		
	var getMonatstage=function(Monat,Jahr){//Monat 1..12
		var tageimMonat = 31;
		if(Monat != 2) {
			if(Monat == 9 ||
			   Monat == 4 ||
			   Monat == 6 ||
			   Monat == 11) {
				tageimMonat =30;
			} 
			else {
				tageimMonat =31;
			}
		}
		else {
			tageimMonat = (Jahr % 4) == "" && (Jahr % 100) !="" ? 29 : 28;
		}
		//console.log(Monat,Jahr,tageimMonat);
		return tageimMonat;
	}
	
	var getTageimJahr=function(Jahr){//integer
		var i,re=0;
		for(i=1;i<13;i++){
			re+=getMonatstage(i,Jahr);
		}
		return re;
	}	
	var getTageimJahrList=function(Jahr){//Liste der Tage in den Monaten
		var i,re=[];
		for(i=1;i<13;i++){
			re.push(getMonatstage(i,Jahr));
		}
		return re;
	}	
	
	var getKalenderwoche=function(tag,monat,jahr){
		function getdonnerstag(datum) {
			var Do=new Date();
			Do.setTime(datum.getTime() + (3-((datum.getDay()+6) % 7)) * 86400000);
			return Do;
		}
		var Datum=new Date(jahr,monat-1,tag);
		var DoDat=getdonnerstag(Datum);
		var kwjahr=DoDat.getFullYear();
		var DoKW1=getdonnerstag(new Date(kwjahr,0,4));
		return Math.floor(1.5+(DoDat.getTime()-DoKW1.getTime())/86400000/7)
	}
	
	var decodeString=function(s){
		//s=s.split('<').join('%38lt;');
		//s=s.split('>').join('%38gt;');
		if(getDataTyp(s)=='[object String]'){
			s=s.split('&').join('%38');
		}
		return s;
	}
	var encodeString=function(s){
		if(getDataTyp(s)=='[object String]'){
			s=s.split('%38').join('&');
		}
		return s;
	}
	
	var clearNewDateiname=function(s){
		s=s.split('.').join('-'); //keine Punkte im Dateinamen
		s=s.split(',').join('-'); //keine Kommas im Dateinamen
		s=s.split(' ').join('-');
		s=s.split(';').join('-');
		s=s.toLowerCase();					
		return s;
	}
	var convertToDatum=function(s){//String:"YYYY-mm-dd" convert to "dd.mm.jjjj"
		var ar=s.split('-');
		if(ar.length==3){
			return ar[2]+'.'+ar[1]+'.'+ar[0];
		}
		else
			return s;
	}
	
	var isAppBridge=function(){
		if(typeof(globaldata)==="object"){
			if(globaldata.modus==="app"){
				if(typeof(AppBridge)!="undefined"){
					return true;
				}
			}
		}
		return false;
	}
	
	var parseJSON=function(s){
		var re={};
		if(s=="undefined")s="{}";
		if(s==undefined)s="{}";
		if(s==null)s="{}";
		s=s.split("\n").join('').split("\r").join('').split("\t").join('');	
		s=s.split("'").join('"');	//passend formatieren ' -> "
		try{
			re=JSON.parse(s);
		}
		catch(err) {
			console.log("JSONfehler",err.message,{"s":s});
			re={};
		}
		return re;
	}
	 
	var JSONistemty=function(obj){
		for(var key in obj){
			return false; // not empty
		}
		return true; // empty
	}
	
	var loadData=function(url, auswertfunc,getorpost,daten){
		
		if(isAppBridge()){
			var AB=new AppBridge();
			AB.DataIO(url, auswertfunc,getorpost,daten);
			return;
		}
		
		
		var loObj=new Object();
		loObj.url=url;    
		try {
			// Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
			loObj.xmlloader = new XMLHttpRequest();
		} 
		catch(e) 
		{
		   try {                        
				 loObj.xmlloader  = new ActiveXObject("Microsoft.XMLHTTP");// MS Internet Explorer (ab v6)
				} 
				catch(e) 
				{
						try {                                
								loObj.xmlloader  = new ActiveXObject("Msxml2.XMLHTTP");// MS Internet Explorer (ab v5)
						} catch(e) {
								loObj.xmlloader  = null;
						}
				}
		}
		
		if(!loObj.xmlloader){
				console.log('XMLHttp nicht möglich.');
			}
			else
			{
			loObj.load=function(url){	
					var loader=loObj.xmlloader;		
					loader.parserfunc=loObj.parseFunc;
					loader.open(getorpost,url,true);
					loader.responseType='text'; //! 
					loader.onreadystatechange = function(){                
						if (loader.readyState == 4) { 
								loader.parserfunc(loader.responseText);
						}
					};
					loader.setRequestHeader('Content-Type', 'text/plain'); //text/xml
					loader.setRequestHeader('Cache-Control', 'no-cache'); 
					if(daten!=undefined){
						loader.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						loader.setRequestHeader("Pragma","no-cache");
						loader.send(daten);
					}
					else{
						loader.send(null);
					}
			}
			loObj.parseFunc = auswertfunc;    
			loObj.load(loadDataURL+"?dat="+url);    
		}
	}
		
	var stringfarbeToRGB=function(s){
		var re={r:0,g:0,b:0,a:1},tmp;
		if(s.indexOf("#")==0){
			if(s.length==7){
				re.r=parseInt('0x'+s.substr(1,2));
				re.g=parseInt('0x'+s.substr(3,2));
				re.b=parseInt('0x'+s.substr(5,2));
			}
			else
			if(s.length==4){
				re.r=parseInt('0x'+s.substr(1,1))*16;
				re.g=parseInt('0x'+s.substr(3,1))*16;
				re.b=parseInt('0x'+s.substr(5,1))*16;
			}
		}
		else
		if(s.indexOf("rgb")==0){
			s=s.split("(")[1];
			s=s.split(")")[0];
			s=s.split(",");
			re.r=parseInt(s[0]);
			re.g=parseInt(s[1]);
			re.b=parseInt(s[2]);
			if(s.length==4)
				re.a=parseInt(s[3]);
		}
		else
		if(s.indexOf("hsl")==0)
		{
			console.log(":-/");
		}
		
		return re;
	}
	var RGBtoHSL=function(ir,ig,ib){
		if(ir<0)ir=0;if(ir>255)ir=255;
		if(ig<0)ig=0;if(ig>255)ig=255;
		if(ib<0)ib=0;if(ib>255)ib=255;
		var max = Math.max(Math.max(ir, ig), ib);
		var min = Math.min(Math.min(ir, ig), ib);
		var h,s,d; 
		var l = (max + min) / 2;
		if(max == min){
				h = 0;
				s = 0; // achromatic
			}
			else{
				d = max - min;
				s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
				switch(max){
					case ir: h = (ig - ib) / d + (ig < ib ? 6 : 0); break;
					case ig: h = (ib - ir) / d + 2; break;
					case ib: h = (ir - ig) / d + 4; break;
				}
				h = h/6;
			}
		return {"h":h, "s":s, "l":l};//Farbe°(0..360),Sättigung%(0..100),Hellwert(0..255)
	}
	var getPixelColor=function (canvas,pxy){
		var cc=canvas.getContext("2d");
		var p = cc.getImageData(pxy.x, pxy.y, 1, 1).data; 
		return {"r":p[0],"g":p[1],"b":p[2]};
	}
	var getHexstrformRGB=function(r,g,b){
		var farbe= r*256*256 + g*256 +b;
		var f=farbe.toString(16);  
		while(f.length<6){
			f='0'+f;
		}
		return f;
	}
		
	//--mouse--
	var getMouseP=function(e){
			return{
				x:document.all ? window.event.clientX : e.pageX,	//pageX
				y:document.all ? window.event.clientY : e.pageY};
		}
	var getBoundingCR=function(re,o){
			var r=o.getBoundingClientRect();
			re.x-=r.left;
			re.y-=r.top;
			return re;
		}
	var relMouse=function(e,o){
			return getBoundingCR(getMouseP(e),o);
	}	
		
		
	//--canvas--
	var drawLine=function(cancontex,x1,y1,x2,y2,size,color){
		cancontex.lineWidth=size;
		cancontex.strokeStyle=color;
		cancontex.beginPath();
		cancontex.moveTo(x1,y1);
		cancontex.lineTo(x2,y2);
		cancontex.stroke();
	}
	var drawText=function(cancontex,x,y,color,font,stext){
		cancontex.fillStyle=color;
		cancontex.font=font;
		cancontex.fillText(stext,x,y);
	}
	
	//--allgemeine Func--
	var handleError=function(msg){
		console.log("handleError:",msg);
		switch(msg){
			case msg_input_noName:
					//alert(getWort("mesage_inputname"));
					statusDlg.show("Fehler",getWort("mesage_inputname"));
					break;
			case msg_input_shortName:
					//alert(getWort("mesage_inputnamekurz"));
					statusDlg.show("Fehler",getWort("mesage_inputnamekurz"));
					break;
			
			case msg_error_FileNotfound:
					console.log(msg_error_FileNotfound);
			case msg_nouser: //go to login
					document.location.href="index.php";
					break;
			case msg_error_FileNotwrite: //"404:notwrite";
					//alert(getWort(msg_error_FileNotwrite));
					statusDlg.show("Fehler",getWort(msg_error_FileNotwrite));
					break;
			case msg_error_FileNotread: //"404:notread";
					//alert(getWort(msg_error_FileNotwrite));
					statusDlg.show("Fehler",getWort(msg_error_FileNotread));
					break;
		}		
	}

	var hatProjekte=function(){
		if(geladeneprojekte!=undefined){
			return geladeneprojekte.hatprojekte();
		}
	}
	
	var o_statusDialog=function(zielnode){
		var dlgbasis=undefined;
		var viewtime=5*1000;//sec
		var timer=undefined;
		var ini=function(){
			dlgbasis=cE(zielnode,"div","statusMSG");
			dlgbasis.addEventListener('click',dlgclose);
			dlgbasis.className="off";
		}
		
		var dlgclose=function(){
			dlgbasis.className="off";
			if(timer!=undefined)clearTimeout(timer);
			timer=undefined;
		}
		
		//---api---
		this.destroy=function(){}
		
		this.show=function(sTitel,sMSG,classe){
			var HTMLNode;
			
			if(dlgbasis==undefined)return;
			if(timer!=undefined)clearTimeout(timer);
			if(sMSG==""){dlgclose();return;}
				
			dlgbasis.innerHTML="";
			dlgbasis.className="";
			if(sTitel!="" && sTitel!=undefined){
				HTMLNode=cE(dlgbasis,"h1");
				HTMLNode.innerHTML=sTitel;
			}
			if(sMSG!=""){
				HTMLNode=cE(dlgbasis,"p");
				HTMLNode.innerHTML=sMSG;
				timer=setTimeout(dlgclose,viewtime);
				if(classe!=undefined)
					dlgbasis.className=classe;
			}else{
				//clear
				dlgbasis.innerHTML="";
			}
		}
		
		ini();
	};
	
	var o_inputDialog=function(zielnode){
		var dlgbasis,buttAbr,buttConfirm,nodetext,nodeinput,nodetitel,
			Fauswertfunc;
		
		var ini=function(){
			var node,n;
			dlgbasis=cE(zielnode,"div","inputDLG");
			dlgbasis.className="off";
			window.addEventListener("keyup",dlgKeyUP);
			
			node=cE(dlgbasis,"div","dialogBox");
			nodetitel=cE(node,"h1");
			
			nodetext=cE(node,"p");
			
			n=cE(node,"div",undefined,"inputb center");
			nodeinput=cE(n,"input",undefined,"center");
			nodeinput.addEventListener("keyup",inputKeyUp);
			
			n=cE(node,"div",undefined,"buttons");
			
			buttAbr=cE(n,"a",undefined,"button buttabr");
			buttAbr.addEventListener("click",clickAbbr);
			buttAbr.innerHTML=getWort("abbrechen");
			
			buttConfirm=cE(n,"a",undefined,"button buttok");
			buttConfirm.addEventListener("click",clickConfirm);
			buttConfirm.innerHTML=getWort("OK");
			
		}
		var dlgclose=function(){
			dlgbasis.className="off";
		}
		
		var clickAbbr=function(e){
			dlgclose();
		}
		var clickConfirm=function(e){
			sendvalue();
			dlgclose();
			//remessage
		}
		var inputKeyUp=function(e){
			if(e.key=="Enter"){
				sendvalue();
				dlgclose();
			}
		}
		var dlgKeyUP=function(e){
			if(e.key=="Escape")dlgclose();
			if(e.key=="Enter" && !istClass(dlgbasis,"off") ){ 
				sendvalue();
				dlgclose();
			}
		}
		var sendvalue=function(){
			var val=nodeinput.value;
			if(typeof Fauswertfunc=="function")Fauswertfunc(val);
		}
		
		this.destroy=function(){
			dlgclose();
		}
		this.close=function(){
			dlgclose();
		}
		
		this.show=function(typ,sTitel,sMSG,defvalue,auswertfunc){//"prompt",.....
			//dlgbasis.innerHTML="";
			dlgbasis.className="";
			nodetitel.innerHTML=sTitel;
			nodetext.innerHTML=sMSG;
			if(defvalue==undefined)
				addClass(nodeinput,"off");
				else{
				subClass(nodeinput,"off");
				nodeinput.value=defvalue;
				}
			Fauswertfunc=auswertfunc;
		}
		
		ini();
	}
	
	
	var sortbyDate=function(a,b){//nach datum, neuste oben
			if(a.dat ==undefined || b.dat==undefined)return 0;		
			var aa=getdatumsObj(a.dat);
			var bb=getdatumsObj(b.dat);
			if(aa.getTime()<bb.getTime())return -1;
			if(aa.getTime()>bb.getTime())return 1;
			return 0;			
	}
	
	//--API--
	this.ini=function(id){
		var i,e,o;
		basis=gE(id);
		if(basis==undefined)return;
		basis.innerHTML="";
		tabnav=gE("tabnav");
		tabnav.innerHTML="";
		for(i=0;i<tabs.length;i++){
			tabs[i].d_objekt=new createTab(basis,tabnav,tabs[i]);
			tabs[i].d_objekt.ini();
		}
		
		optionsleiste=new o_optionsleiste(basis);
		statusDlg=new o_statusDialog(basis);
		inputDlg=new o_inputDialog(basis);
		geladeneprojekte=new o_ProjektDataIOHandler(basis);

		loadData("getoptionen",iniLoadOptionen,"GET");
		
		versionsinfos=new versionscheck();
		
		var ses=new sessionaliver();	

		if(isAppBridge())
			window.addEventListener('keydown',winkeydown );	

		console.log("%cready","color:#ddff00;background-color:#008800;font-weight:bold;padding:2px;");
	}
	
	var isdevtool=false;
	var winkeydown=function(e){
		if(e.keyCode==68 && e.ctrlKey){//strg+d
			showDevTools(!isdevtool);
			e.preventDefault(); 
		}
	}
	var showDevTools=function(b){
		var win=remote.getCurrentWindow();
		if(b===true)				
			win.webContents.openDevTools();
			else
			win.webContents.closeDevTools();
		isdevtool=b;
	}
	
	this.Message=function(s,data){
		//console.log(s,data);
		if(s=="resize"){
			lokalData.windowsize=data;
			saveOptionen(false);
		}
	}
	
	var iniLoadOptionen=function(data){
		parseoptiondata(data,"ini");
		optspeichernaktiv=true;
	}
	
	var parseoptiondata=function(sdata,typ){
		var prop;
		sdata=sdata.split("%7B").join("{");
		sdata=sdata.split("%7D").join("}");
		sdata=sdata.split("%22").join('"');
		sdata=sdata.split("%5B").join('[');
		sdata=sdata.split("%5D").join(']');
			
		var data=JSON.parse(sdata);
		//check error
		if(data.status!=undefined){
			if(data.status!=msg_OK){
				handleError(data.status);
				}
			else{
				lokalData=data.dat;
								
				for(prop in lokalDataVorlage) {
					if(lokalData[prop]==undefined){
						lokalData[prop]=JSON.parse( JSON.stringify(lokalDataVorlage[prop]));
						console.log("create",prop,lokalData[prop]);
					}
				}
								
				if(typ==="ini"){
					setTabaktiv(tabs[lokalData.tabaktiv].id);
				}
			}
		}		
	}

	var sessionaliver=function(){
		var timer;
		var start=function(){
			if(timer!=undefined)clearTimeout(timer);
			timer=setTimeout(timeoutfunc,1000*30);
		};
		var timeoutfunc=function(){
			loadData("maindata",parsedata,"GET");
		};
		var parsedata=function(data){
			if(data==""){
				handleError(msg_nouser);
				return;
			}
			data=JSON.parse(data);
			//check error
			if(data.status!=undefined){
				if(data.status!=msg_OK)
					handleError(data.status);
				else{
					start();
				}
			};		
		};
		start();
	}
	
	
	//--innerfun--
	var getdatumsObj=function(s){//convert "2016-12-23" to Date()
		//tt.mm.yyyy hh:mm:ss || yyyy-mm-tt
		s=s.split(' ');
		var dat,tim;
		var re=new Date();
			re.setMilliseconds(1);
			re.setHours(12);		//default 12, falls Zeitverschiebung...	
			re.setMinutes(0);
			re.setSeconds(0);
			
		if(s.length==2){//tt.mm.yyyy hh:mm:ss 
			if(s[0].indexOf(".")>0)
				dat=s[0].split('.');
				else
				dat=s[0].split('-');
			tim=s[1].split(':');
			re.setFullYear(parseInt(dat[2]));
			re.setMonth( parseInt(dat[1])-1);
			re.setDate(parseInt(dat[0]));
			re.setHours(parseInt(tim[0]));		
			re.setMinutes(parseInt(tim[1]));
			re.setSeconds(parseInt(tim[2]));
		}
		else{//yyyy-mm-tt
			dat=s[0].split('-');
			re.setFullYear(parseInt(dat[0]));
			re.setMonth( parseInt(dat[1])-1);
			re.setDate(parseInt(dat[2]));
		}
		return re;
	}
		
	var setTabaktiv=function(id){
		var i,tab;
		inputDlg.close();
		
		for(i=0;i<tabs.length;i++){
			tab=tabs[i];
			tab.d_objekt.aktiv(tab.id==id);
			if(tab.id==id)lokalData.tabaktiv=i;
		}
		var sdata="id="				+globaldata.user
				+"&data="+JSON.stringify(lokalData);
		
		if(optspeichernaktiv)
			loadData("setoptionen",parseSEToptiondata,"POST",encodeURI(sdata));//befehl="projektstundenlisteupdate"
	}
	var parseSEToptiondata=function(data){
		data=JSON.parse(data);
		//console.log(data);
		if(data.status!=undefined){
			if(data.status!=msg_OK)
				handleError(data.status);	
		}
	}
	
	//------------------------------------
	
	var o_optionsleiste=function(ziel){
		var _this=this;
		var connects=[];
		
		var tdJahr,tdbeendete;
		var anzeigeoptionen=[];
		var oziel=ziel;
		var obasis=undefined;
		var oselect=undefined;
		var ocheckbox=undefined;
		var d=new Date();
		var jahrdata={min:d.getFullYear(),max:d.getFullYear(),jahre:{}};
		
		var create=function(){
			obasis=cE(oziel,"div","optionsleiste");
			//obasis.innerHTML="zeige:[alle,2002,....,2016]";
		}
		this.ini=function(){
			var HTMLnode, tab,tr,td;
			connects=[];
			//inputs=[];
			obasis.innerHTML="";
			
			tab=cE(obasis,"table");
			tr=cE(tab,"tr");
			td=cE(tr,"td");
			tdJahr=td;
			
			HTMLnode=cE(td,"span");
			HTMLnode.innerHTML=getWort("filterby")+" ";
			
			oselect=cE(td,"select");
			//inputs.push(oselect);			
			
			td=cE(tr,"td");
			tdbeendete=td;
			HTMLnode=cE(td,"span");
			HTMLnode.innerHTML=getWort("zeigebeendete")+"";
						
			ocheckbox=cE(td,"input","cb_filter_zeigebeendete","booleanswitch");
			ocheckbox.type="checkbox";
			HTMLnode=cE(td,"label");
			HTMLnode.htmlFor=ocheckbox.id;
			ocheckbox.addEventListener('change',changeCBInput);
			ocheckbox.checked=lokalData.zeigebeendete;
			
			if(anzeigeoptionen.length>0){
				var i;
				tdJahr.style.display="none";
				tdbeendete.style.display="none";
				
				for(i=0;i<anzeigeoptionen.length;i++){
					if(anzeigeoptionen[i]==="jahr")tdJahr.style.display="";			
					if(anzeigeoptionen[i]==="beendete")tdbeendete.style.display="";			
				}
			}
			else{
				tdJahr.style.display="";
				tdbeendete.style.display="";
			}
		}
		this.destroy=function(){}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			if(s=="allProjektsloaded"){
				addProjktoption(data.meta);// { min: 2001, max: 2017, jahre: Object }
			}
		}
		var sendMSG=function(s,data){
			/*
				"selectFilterJahr",string|int
			*/
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}		
		var addProjktoption=function(data){
			var i,t,proj,std,HTMLnode,jahr,anz,d,property;
			jahrdata=data;
			if(oselect!=undefined){
				//min/max-Jahr und Jahre ansich der Stunden herrausholen
				var jahreliste=[];
				for( property in jahrdata.jahre ) {
					jahreliste.push(jahrdata.jahre[property]);
				}
				jahreliste=jahreliste.sort();
				
				oselect.innerHTML="";
				HTMLnode=cE(oselect,"option");
				HTMLnode.value="alle";
				HTMLnode.innerHTML="alle";
				
				anz=0;
				d=new Date();
				
				for(i=0;i<jahreliste.length;i++){
					HTMLnode=cE(oselect,"option");
					HTMLnode.value=jahreliste[i];
					HTMLnode.innerHTML=jahreliste[i];
					anz++;
					if(jahreliste[i]==d.getFullYear())oselect.selectedIndex =anz;
				}
				
				var v=HTMLnode.value;
				if(!isNaN(v)){
					v=d.getFullYear();//aktuelles Jahr
					}
				sendMSG("selectFilterJahr",v);
				
				oselect.addEventListener('change',changeInput);
			}
		}
		var changeInput=function(e){
			//console.log(this.children[this.selectedIndex].value,this);
			var v=(this.children[this.selectedIndex].value);
			if(!isNaN(v))v=parseInt(v);
			sendMSG("selectFilterJahr",v);
		}
		
		var changeCBInput=function(e){
			//console.log(this.checked);
			lokalData.zeigebeendete=this.checked;
			sendMSG("selectFilterBeendet",!this.checked);
			saveOptionen(false);
			//save optionen lokalData
		}
		
		this.anzeigen=function(an){
			if(an)
				obasis.style.display="block";
			else
				obasis.style.display="none";
		}
		
		this.showoptionen=function(opt){//["jahr","beendete"])
			anzeigeoptionen=opt;	
		}		
		
		create();
	}
	
	var o_ProjektDataIOHandler=function(ziel){ //Handling Projekte laden, speichern
		var _this=this;
		var connects=[];
		var d=new Date();
		var jahrdata={min:d.getFullYear(),max:d.getFullYear(),jahre:{}};
		var projekte=[];
		
		var oziel=ziel;
		var create=function(){//nur einmal
			
		}
		this.ini=function(){//immer wenn Tab gedrückt
			connects=[];
		}
		this.destroy=function(){}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		this.Message=function(s,data){
			if(s=="reloadprojektlist"){
				loadData("projektliste",parsedata,"GET");
			}			
			if(s=="createnewprojekt"){
				loadData("newprojekt",parsenewProjdata,"POST",encodeURI(data));

			}			
			//if(s=="getProjektliste"){return projekte;}
			//if(s=="getProjektdata"){return projekte[].id==data;}
			if(s=="starttabs"){
				loadData("projektliste",parsedata,"GET");
			}		
		}
		
		this.hatprojekte=function(){
			return(projekte.length>0);
		}
		
		var sendMSG=function(s,data){
			/*
				"allProjektsloaded",projektliste
			*/
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		var parsenewProjdata=function(data){
			data=JSON.parse(data);
			if(data.status=="OK"){
				//reload Projektliste
				loadData("projektliste",parsedata,"GET");
			}
			else
				handleError(data.status);
		}
		
		var parsedata=function(data){
			var i,o,onew;
			data=JSON.parse(data);

			if(data.status!=msg_OK){
				handleError(data.status);
				return;
			}			
			//sort by datum
			var sortliste=data.dat.sort(sortbyDate);		
			
			projekte=[];
			for(i=0;i<sortliste.length;i++){
				o=sortliste[i];
				o.date=getdatumsObj(o.dat);
				onew={id:o.name,pro:o,data:undefined}
				projekte.push(onew);
			}
			
			projektepointer=-1;
			getProjektdata();
		}
		
		var projektepointer=-1;
		var getProjektdata=function(){
			projektepointer++;
			var o;
			if(projektepointer<projekte.length){
				o=projekte[projektepointer];
				loadData("projektdata",parseProdata,"POST",encodeURI("name="+o.pro.name));
			}
			else{
				//fertig
				getProData();
				sendMSG("allProjektsloaded",{"projekte":projekte,"meta":jahrdata});
			}
		}
		var parseProdata=function(data){
			var i,o;
			try {
				data=JSON.parse(data);
				//check error
				if(data.status!=undefined){
					if(data.status!=msg_OK){
						handleError(data.status);
						return;
						}
				};
				
				for(i=0;i<projekte.length;i++){//geladene Projektdaten dem Projekt zuordnen
					o=projekte[i];
					if(o.id==data.id)o.data=data;			
				}
			} 
			catch(e) 
			{
				console.log("%cparse FEHLER","background-color:red",data);				
			}
			
			getProjektdata();//next
		}
		
		var getProData=function(){
			//var jahreliste=[];
			var i,t,proj,std,jahr;
			var d=new Date();
			jahrdata={min:d.getFullYear(),max:d.getFullYear(),jahre:{}};
			for(i=0;i<projekte.length;i++){
				proj=projekte[i];

				if(proj!=undefined)
				if(proj.data!=undefined)
				if(proj.data.stunden!=undefined)
				for(t=0;t<proj.data.stunden.length;t++){
					std=proj.data.stunden[t];
					jahr=parseInt(std.dat.split("-")[0]);//"2016-12-26"
					jahrdata.min=Math.min(jahrdata.min,jahr); 
					jahrdata.max=Math.max(jahrdata.max,jahr);
					jahrdata.jahre['j'+jahr]=jahr;
				}
			};
			
		};
		create();
	}
	
	
	var o_Farbdialog=function(ziel,data,onchange){
		var farbe=data.farbe;//"#rrggbb" "grb(r,g,b)"
		var nodedialog=cE(ziel,"div",undefined,"farbdialoghidden");
		var _this=this;
		var canF1,canF2,canF2zeiger,divFold,divFnew;
		nodedialog.FD=_this;
		
		
		var closeclick=function(e){
			_this.destroy();
			e.preventDefault();
		}
		
		var okclick=function(e){
			if(onchange!=undefined){
				var c=stringfarbeToRGB(farbe);
				onchange("#"+getHexstrformRGB(c.r,c.g,c.b));
			}
			_this.destroy();
			e.preventDefault();
		}
		
		var mdCan1=function(e){canF1.mausdown=true;}
		var mmCan1=function(e){
			if(canF1.mausdown===true)clickCan1(e);
			e.stopPropagation();
		}
		var muCan1=function(e){canF1.mausdown=false;e.stopPropagation();}
		
		var clickCan1=function(e){//farbe+helligkeit
			var p=relMouse(e,canF1);
			var c=getPixelColor(canF1,p);
			farbe="rgb("+c.r+","+c.g+","+c.b+")";
			divFnew.style.backgroundColor=farbe;
		}
		
		var mdCan2=function(e){canF2.mausdown=true;}
		var mmCan2=function(e){
			if(canF2.mausdown===true)clickCan2(e);
			e.stopPropagation();
		}
		var muCan2=function(e){canF2.mausdown=false;e.stopPropagation();}
		var clickCan2=function(e){//farbe
			var p=relMouse(e,canF2);
			var c=getPixelColor(canF2,p);
			farbe="rgb("+c.r+","+c.g+","+c.b+")";
			drawColorWB(canF1);
			divFnew.style.backgroundColor=farbe;
			canF2zeiger.style.top=canF2.offsetTop+(p.y-5)+"px";
		}
		
		
		var drawRGBstripe=function(canvas){
			var cc=canvas.getContext("2d");
			var grad = cc.createLinearGradient(0, 0, canvas.width, canvas.height);
			grad.addColorStop(0, 		"hsl(0 ,100%, 50%)");  		//rot
			grad.addColorStop(0.125,	"hsl(60 ,100%, 50%)");  	//gelb (60)
			grad.addColorStop(0.25, 	"hsl(120 ,100%, 50%)");   	//grün (120)
			grad.addColorStop(0.5, 		"hsl(180 ,100%, 50%)");  	//türkies
			grad.addColorStop(0.75, 	"hsl(240 ,100%, 50%)");   	//blau (240)
			grad.addColorStop(0.875, 	"hsl(300 ,100%, 50%)");  	//lila (300)
			grad.addColorStop(1, 		"hsl(360 ,100%, 50%)");   	//rot
			cc.fillStyle = grad;
			cc.fillRect( 0, 0,  canvas.width, canvas.height);
			
			//canF2zeiger
			var f=stringfarbeToRGB(farbe);
			var hsl=RGBtoHSL(f.r,f.g,f.b);
			canF2zeiger.style.left=(canvas.offsetLeft+canvas.width)+'px';
			canF2zeiger.style.top=(canvas.offsetTop+canvas.offsetHeight*hsl.h-5)+'px';			
		}
		
		var drawColorWB=function(canvas){
			var f=stringfarbeToRGB(farbe);
			var hsl=RGBtoHSL(f.r,f.g,f.b);
			//weiß.....farbe(hsl.h)
			// ..       ..
			//schwarz..schwarz
			var cc=canvas.getContext("2d");
			
			var grd=cc.createLinearGradient(0,0,canvas.width,0);
			grd.addColorStop(0,"white");
			grd.addColorStop(1,"hsl("+360*hsl.h+" ,100%, 50%)");
			cc.fillStyle=grd;
			cc.fillRect( 0, 0,  canvas.width, canvas.height);
			
			grd=cc.createLinearGradient(0,0,0,canvas.height);
			grd.addColorStop(0,"rgba(255,255,255,0)");
			grd.addColorStop(1,"rgba(0,0,0,1");
			cc.fillStyle=grd;
			cc.fillRect( 0, 0,  canvas.width, canvas.height);
		}
		
		this.show=function(){
			subClass(nodedialog,"farbdialoghidden");
			addClass(nodedialog,"farbdialog");
			
			var h1=cE(nodedialog,"h1");
			h1.innerHTML=getWort("farbwaehlertitel");
			
			var a=cE(h1,"a");
			a.innerHTML="X";
			a.href="#";
			a.addEventListener("click",closeclick);
			
			var divinhalt=cE(nodedialog,"div",undefined,"farbdialoginhalt");
			
			canF1=cE(divinhalt,"canvas",undefined,"farbdialogcan1");
			canF1.width=256;
			canF1.height=256;
			canF1.addEventListener("click",clickCan1);
			canF1.addEventListener("mousemove"	,mmCan1);
			canF1.addEventListener("mousedown"	,mdCan1);
			canF1.addEventListener("mouseup"	,muCan1);
			canF1.addEventListener("mouseout"	,muCan1);
			drawColorWB(canF1);
						
			canF2zeiger=cE(divinhalt,"div",undefined,"farbdialogcan2zeiger");
			
			canF2=cE(divinhalt,"canvas",undefined,"farbdialogcan2");
			canF2.width=22;
			canF2.height=256;
			canF2.addEventListener("click",clickCan2);
			canF2.addEventListener("mousemove"	,mmCan2);
			canF2.addEventListener("mousedown"	,mdCan2);
			canF2.addEventListener("mouseup"	,muCan2);
			canF2.addEventListener("mouseout"	,muCan2);
			drawRGBstripe(canF2);
						
			divFold=cE(divinhalt,"div",undefined,"farbdialogFold");
			divFold.style.backgroundColor=farbe;
			
			divFnew=cE(divinhalt,"div",undefined,"farbdialogFnew");
			divFnew.style.backgroundColor=farbe;
			
			a=cE(divinhalt,"a",undefined,"button buttok");
			a.href="#";
			a.innerHTML=getWort("ok");
			a.addEventListener("click",okclick);
		};
		
		this.destroy=function(){
			nodedialog.innerHTML="";
			addClass(nodedialog,"farbdialoghidden");
			subClass(nodedialog,"farbdialog");
		}
		
		var create=function(){
			_this.show();
		}
		
		create();
	}
	
	//--Versionscheck--
	var versionscheck=function(){
		var url="https://raw.githubusercontent.com/polygontwist/PROSTd-App/master/package.json";
		var data_versionsinfos={version:"0.0.0"};
		var _this=this;
		//-----
		var ladeSeiteO={
			url:""
		};	
		var letzteAnfrage=undefined;
		
		var ladeData=function(url){
			if(url=="")return;
			ladeSeiteO.url=url;		
			
			if(letzteAnfrage!=undefined){
				letzteAnfrage.abort();				
			}

			url=url+"?"+Date.parse(new Date());
			
			letzteAnfrage=new Object();
			letzteAnfrage.url=url;    
			try {
				// Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
				letzteAnfrage.xmlloader = new XMLHttpRequest();			
				} 
				catch(e) 
				{
					   try {                        
							 letzteAnfrage.xmlloader  = new ActiveXObject("Microsoft.XMLHTTP");// MS Internet Explorer (ab v6)
							} catch(e) {
									try {                                
											letzteAnfrage.xmlloader  = new ActiveXObject("Msxml2.XMLHTTP");// MS Internet Explorer (ab v5)
									} catch(e) {
											letzteAnfrage.xmlloader  = null;
									}
							}
				}	
				if(!letzteAnfrage.xmlloader){console.log('XMLHttp nicht möglich.');return;}
				if (letzteAnfrage.overrideMimeType) {
					letzteAnfrage.overrideMimeType('text/xml');
					// zu dieser Zeile siehe weiter unten
				}
			 
				letzteAnfrage.load=function(url){	
					var loader=this.xmlloader;		
					loader.parserfunc=letzteAnfrage.parseFunc;
					loader.open('GET',url,true);//open(method, url, async, user, password)
					loader.responseType='text'; //!                
					loader.setRequestHeader('Content-Type', 'text/plain'); 
					loader.setRequestHeader('Cache-Control', 'no-cache'); 
					
					loader.onreadystatechange = function(){                
						if (this.readyState == 4) { 
							this.parserfunc(this.responseText);
						}
					};
					// loader.timeout=  //ms
					loader.send(null);
					return false;
				}
			 
			letzteAnfrage.parseFunc = parseData;    
			letzteAnfrage.load(url); 
			
		}	

		var ladeError=function(xOptions, error){
			if(error!="abort"){
				/*var s="<h1 style='color:#f62;'>Entschuldigung ein Fehler ist aufgetreten</h1>";
				s+="<p>Die Daten ";
				s+='"'+ladeSeiteO.url+'"';
				s+=" konnte nicht geladen werden ("+xOptions.status+" "+xOptions.statusText+").</p>";
				s+="<p>Bitte Informieren Sie Ihren zuständigen Admin oder Kursleiter.</p>";*/
				console.log("err",xOptions.status,xOptions.statusText);
			}
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<tabs.length;i++){
				if(tabs[i].aktiv){
					tabs[i].d_objekt.Message(s,data);
				}
			}
		}
		
		var parseData=function(data){	
			data_versionsinfos=JSON.parse(data);
			
			var app=remote.app;
			if(vergleiche(app.getVersion())){
				statusDlg.show("",getWort("neueVersion"),"statneueVers");
				sendMSG("versionfromgitloaded",undefined);
				
				console.log("%cVersion:"+app.getVersion()+'>>>'+data_versionsinfos.version,"color:#ddff00;background-color:#008800;font-weight:bold;padding:2px;");
			}
		}		
		//-----
		var holeInfos=function(){
			ladeData(url);
		}
		
		var vergleiche=function(version){
			if(!isAppBridge())return false;
			//0.1.15
			var i,numA=0,numG=0;
			var aktuell= version.split('.');
			var aufgit=	data_versionsinfos.version.split('.');
			//console.log(aktuell,aufgit);
			if(parseInt(aktuell[0])<parseInt(aufgit[0]))return true;
			if(parseInt(aktuell[1])<parseInt(aufgit[1]))return true;
			if(parseInt(aktuell[2])<parseInt(aufgit[2]))return true;
			return false;			
		}
		
		//--API---
		this.getVersion=function(){return data_versionsinfos.version}
		
		this.gibtsneue=function(version){			
			return vergleiche(version);			
		}
		
		if(isAppBridge())holeInfos();
	}
	
	//--innerfunObjekts--
	var createTab=function(contentziel,tabbuttziel,data){
		var tab,tr,td;
		
		var odata={
			"ziel":contentziel,
			"tabbuttziel":tabbuttziel,
			"data":data,
			
			"content":undefined,
			"tabbutt":undefined,
			
			"inhalte":[]
		};
		//--API--
		this.ini=function(){
			var htmlnode;
			//create basics
			if(odata.tabbuttziel!=undefined){
				htmlnode=cE(odata.tabbuttziel,"a");
				htmlnode.href="#";
				htmlnode.innerHTML=getWort(odata.data.butttitel);
				htmlnode.onclick=klickTab;
				htmlnode.className="tab";
				odata.tabbutt=htmlnode;
			}
			if(odata.ziel!=undefined){
				odata.content=cE(odata.ziel,"div",undefined,odata.data.id);
				odata.content.innerHTML=getWort('loading');
			}
		}
		this.aktiv=function(b){
			odata.data.aktiv=b;
			if(b){
				subClass(odata.content,"panelinaktiv");
				addClass(odata.tabbutt,"tabaktiv");
				loadInhalt(odata.data.id);
				}else{
				addClass(odata.content,"panelinaktiv");
				subClass(odata.tabbutt,"tabaktiv");
				}
		}
		this.Message=function(s,data){
			var i;
			for(i=0;i<odata.inhalte.length;i++){
				odata.inhalte[i].Message(s,data);
			}
		}
		
		//--actions--
		var klickTab=function(e){
			setTabaktiv(odata.data.id);
			return false;
		}
		
		//--inhalt--
		var loadInhalt=function(id){
			var inhaltsobjekt,i,k;
			for(i=0;i<odata.inhalte.length;i++){
				odata.inhalte[i].destroy();
			}
			odata.inhalte=[];
			if(optionsleiste!=undefined){
				odata.inhalte.push(optionsleiste);
				optionsleiste.anzeigen(true);
				optionsleiste.showoptionen(["jahr","beendete"]);
				}
			
			if(geladeneprojekte!=undefined)odata.inhalte.push(geladeneprojekte);
						
			odata.content.innerHTML="";
			if(statusDlg!=undefined)statusDlg.show("","");
			
			if(id=="tab_editTag"){
				//div->Monatsliste
				inhaltsobjekt=new Monatsliste(odata.content);
				odata.inhalte.push(inhaltsobjekt);
				//div->Projektliste
				inhaltsobjekt=new Projektliste(odata.content,{"namensfilter":true});
				inhaltsobjekt.setfilter(["feiertage"]);
				odata.inhalte.push(inhaltsobjekt);
				document.title=getWort("meinTag");
			}
			
			if(id=="tab_editTodolist"){
				//Projekte,TODO-Liste
				//editorProjekt
				inhaltsobjekt=new editorTODO(odata.content);
				odata.inhalte.push(inhaltsobjekt);
				//div->Projektliste
				inhaltsobjekt=new Projektliste(odata.content,{"namensfilter":true});
				odata.inhalte.push(inhaltsobjekt);
				document.title=getWort("todo");
				
			}
			
			if(id=="tab_editProj"){
				//Projekte, neu, edit
				//editorProjekt
				inhaltsobjekt=new editorProjekt(odata.content);
				odata.inhalte.push(inhaltsobjekt);
				//div->Projektliste
				inhaltsobjekt=new Projektliste(odata.content,{"namensfilter":true,"createprojektbutt":true});
				odata.inhalte.push(inhaltsobjekt);
				document.title=getWort("meinProj");
				
			}
			if(id=="tab_editUrlaub"){
				inhaltsobjekt=new editorUrlaub(odata.content);
				odata.inhalte.push(inhaltsobjekt);
				document.title=getWort("urlaub");
				
				if(optionsleiste!=undefined)optionsleiste.showoptionen(["jahr"]);//,"beendete"
			}			
			
			if(id=="tab_editUeberblick"){
				//Statistik
				inhaltsobjekt=new ueberblickProjekte(odata.content);
				inhaltsobjekt.setfilter(["feiertage"]);//,"urlaub"
				odata.inhalte.push(inhaltsobjekt);
				document.title=getWort("ueberblick");
			}
			
			if(id=="tab_editEinstellungen"){
				//Einstellungen
				//user css, hilfstexte an/aus (Anzeigedauer)
				inhaltsobjekt=new Progeinstellungen(odata.content);
				odata.inhalte.push(inhaltsobjekt);
				
				document.title=getWort("einstellungen");
				if(optionsleiste!=undefined)optionsleiste.anzeigen(false);
			}
			
			
			for(i=0;i<odata.inhalte.length;i++){
				//Inhalt initialisieren
				odata.inhalte[i].ini();				
				//Inhalt miteinander verknüpfen
				for(k=0;k<odata.inhalte.length;k++){
					if(i!=k)
						odata.inhalte[i].connect(odata.inhalte[k].connect());
				}
			}
			//laden erst nach connect anstoßen!
			for(i=0;i<odata.inhalte.length;i++){
				odata.inhalte[i].Message("starttabs");
			}
			
			if(isAppBridge()){
				var app=remote.app;
				document.title = document.title+' - PROSTd '+app.getVersion();
				if(versionsinfos!=undefined)
				if(versionsinfos.getVersion()!=undefined)
				{
					if(versionsinfos.gibtsneue( app.getVersion() ) )
						document.title +=' ('+versionsinfos.getVersion()+')'
				}
			}
		}
		
	}
	
	var editorUrlaub=function(zielnode){	
	/*
		Urlaubsstack,
		Anzahl der Tage wird	über einstellungen "urlabstageprojahr" definiert
		
		[Kalenderansicht, aktuelles Jahr] 		
		[Stack mit nicht verwendeten Tagen]
		
		->verfallender Urlaub!
		->sonderurlaub!
		
		
		löschen:
		"dat=projektstundenlisteupdate"
		Formulardaten	
		"id=urlaub"
		data	{"dat":"2019-08-19",
				"kommentar":"15 von 28 (2019)",
				"stunden":0,
				"typ":"U",
				"user":"andreas",
				"vonjahr":2019,
				"utagteiler":1,
				"deleting":true							<!!
				}
	*/
		var _this=this,
			urlaubsdata,
			kalenderdiv,urlaubsstackdiv,usdlul,
			lastfilter,
			connects=[],filter=[],
			projektedata=undefined,
			urlaubsstack=[],
			ojahresuebersicht,
			ojahresuebersichten=[],			
			naechstefreienummer=0,
			freeurlaubsitemselect=undefined;
		
		
		this.ini=function () {
			kalenderdiv=cE(zielnode,"div",undefined,"editorProjekt");
			urlaubsstackdiv=cE(zielnode,"div",undefined,"stackliste");
			usdlul=cE(urlaubsstackdiv,"ul");
		}
		this.destroy=function () {}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		this.Message=function(s,data){
			if(s=="allProjektsloaded"){
				projektedata=data.projekte;
				parsedata(data.projekte,lastfilter);
			}
			else
			if(s=="selectFilterJahr"){
				//data=2019	
				lastfilter=data;
				parsedata(projektedata,data);	
			}
			else
			if(s=="tagwahl"){
				if(naechstefreienummer>0){
					createnewUrlaub(data);
				}
			}
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		var stdisinfilter=function(data,jahresfilter){
			var i,re=false,s;
			if(jahresfilter==="alle")return true;
			if(data.vonjahr!=undefined){
				if(data.vonjahr===jahresfilter)re=true;
			}
			else{
				s=data.dat;			
				if(typeof s=="string")
					if(s.indexOf(jahresfilter)==0)re=true;
			}
			return re;
		}
		
		
		this.setfilter=function(arr){//bestimmte Projekte nicht anzeigen 
			console.log("setfilter",arr);
			filter=arr;
		}

		var createnewUrlaub=function(data){
			
			//
			
			if(data.tag<10)data.tag='0'+data.tag;
			if(data.monat<10)data.monat='0'+data.monat;
			
			var senddatatemp={
					dat: data.jahr+'-'+data.monat+'-'+data.tag,
					kommentar: naechstefreienummer+getWort("stundengesammt2")+lokalData.urlabstageprojahr,
					stunden: 0,
					typ: "U",
					user: globaldata.user,
					vonjahr: data.jahr,
					utagteiler:1
			}
			
			if(freeurlaubsitemselect!=undefined){
				var dat=freeurlaubsitemselect.getdata();
				senddatatemp.kommentar=dat.titel;
				if(dat.sonderurlaub===true)
					senddatatemp.sonderurlaub=true;
				
				if(dat["stackjahr"]!=undefined){
					senddatatemp.vonjahr=dat["stackjahr"]
				}
				
				subClass(dat.node,"select");
			}
			freeurlaubsitemselect=undefined;
			
			urlaubsdata.data.stunden.push(senddatatemp);
			console.log("createnewUrlaub",urlaubsdata);
			saveurlaubdataTag(senddatatemp);
		}
		
		var parsedata=function(data,jahrfilter){
			var i,o,t,t2,tj,d,eintragen,property,anzges,onew,u2dat,teiler,utag,
				heute= new Date(),utitel;
			
			if(data==undefined)return;	
		
	
			usdlul.innerHTML="";
			urlaubsstack=[];
			
			for(i=0;i<ojahresuebersichten.length;i++){
				ojahresuebersichten[i].destroy();
			}
			ojahresuebersichten=[];
			
			kalenderdiv.innerHTML="";
			o=cE(kalenderdiv,"p");
			o.innerHTML=getWort("hinweisurlaubtab");
			
			ojahresuebersicht=new aktuellesJahr(kalenderdiv,lastfilter);
			ojahresuebersicht.setparentModul(_this);
			ojahresuebersichten.push(ojahresuebersicht);
			
			ojahresuebersicht=new aktuellesJahr(kalenderdiv,ojahresuebersicht.getjahr()+1);
			ojahresuebersicht.setparentModul(_this);
			ojahresuebersichten.push(ojahresuebersicht);
			
			
			var getNextfreeNumber=function(jahr,startnum,anzbelegt){
				var re=startnum,i,t,dat,s;
				s=re+getWort("stundengesammt2");//" von "
				
				for(i=0;i<urlaubsstack.length;i++){
					dat=urlaubsstack[i].getdata();
					if(dat.vonjahr==jahr){
						if(dat.kommentar.indexOf(s)>-1){
							re++;
							s=re+getWort("stundengesammt2");
						}
					}
				}
				if(re<anzbelegt)re=anzbelegt+1;
				
				
				return re;
			}
			
			
			
			for(i=0;i<data.length;i++){
				o=data[i];
				
				if(o.id=="feiertage"){//feiertage im kalender anzeigen
					onew={id:o.id,pro:o.pro,data:o.data,divnode:undefined ,mod:"ustack"};
					for(tj=0;tj<ojahresuebersichten.length;tj++){
						ojahresuebersichten[tj].add(onew);
					}
				}
				
				if(o.id=="urlaub"){
					urlaubsdata=o;					
					o.data.stunden=o.data.stunden.sort(sortbyDate);
					
					//onew={id:o.id,pro:o.pro,data:o.data,divnode:undefined ,mod:"ustack"};
					var ufreejear={};
					//gesammten Urlaub durchgehen
					for(t=0;t<o.data.stunden.length;t++){
						utag=o.data.stunden[t];

						if(utag.vonjahr!=undefined){
							if(ufreejear[""+utag.vonjahr]==undefined){//neues Jahr
								ufreejear[""+utag.vonjahr]=0;
							}
							// anfügen
							//console.log(utag);
							if(!(utag.sonderurlaub===true)){
								teiler=1;
								if(utag["utagteiler"]!=undefined){
									teiler=utag["utagteiler"];
								}
								ufreejear[""+utag.vonjahr]=ufreejear[""+utag.vonjahr]+teiler;
							}
						}
						
						if(stdisinfilter(utag,lastfilter)){
								
								if(!(utag.deleting===true) ){
									urlaubsstack.push(new ustack(usdlul,utag));//aktuelles Jahr
									
									onew={
										id:o.id,
										proj:{
											stack:urlaubsstack[urlaubsstack.length-1],
											data:o.data
											},
										std:utag
									};
									
									//Kalender zuordnen
									for(tj=0;tj<ojahresuebersichten.length;tj++){
										ojahresuebersichten[tj].addSingel(onew);
									}
								}
						}else{
								onew={
										id:o.id,
										proj:{
											stack:1,
											data:o.data
											},
										std:utag
									};
									
								//Kalender zuordnen
								for(tj=0;tj<ojahresuebersichten.length;tj++){
									ojahresuebersichten[tj].addSingel(onew);
								}
						}
					}					
			
					//belegte Tage zusammenzählen Tage ermiteln
					
//console.log('-->',ufreejear);					
					if(ufreejear[heute.getFullYear()]==undefined)
						ufreejear[heute.getFullYear()]=0;
					
					if(lastfilter!="alle"){
						if(ufreejear[lastfilter]==undefined)
							ufreejear[lastfilter]=0;
					}
						
					for(property in ufreejear){
						if(	(
								lastfilter=="alle" 
								||  
								parseInt(lastfilter)==parseInt(property)
								||
								parseInt(lastfilter-1)==parseInt(property)
							)
							&&
							(
							parseInt(property)+2>heute.getFullYear()	//nur dieses Jahr und voriges betrachten
							)
							&&
							(
							parseInt(property)>=lokalData.urlabstageprojahrabjahr//ab dem Jahr der Gültigkeit
							)
						  )
						{	
							naechstefreienummer=ufreejear[property]+1;
							var tempt=ufreejear[property];
							
							var anzahlfreie=lokalData.urlabstageprojahr-ufreejear[property];
							var nextnum=1;

							for(t=0;t<anzahlfreie;t++){
								nextnum=getNextfreeNumber(property,nextnum,lokalData.urlabstageprojahr-anzahlfreie);
								utitel=nextnum+getWort("stundengesammt2")+lokalData.urlabstageprojahr;
								
								urlaubsstack.push(
									new freeUrlaubitem(usdlul,
										getWort("frei")+': '+utitel+' ('+property+')',
											{
												"titel":utitel,
												"nr":nextnum,
												"stackjahr":parseInt(property)
											}
										)
									)
								nextnum++;
							}
						}
					}
					
					urlaubsstack.push(new freeUrlaubitem(usdlul,getWort("sonderurlaub"),
											{
												"titel":getWort("sonderurlaub"),
												"sonderurlaub":true
											}
										))
					
					//lokalData.urlabstageprojahr
					//o.data.stunden[]
					/*
						{dat: "2001-06-14", ->an welchem Tag gesetzt
						stunden: 0, 
						typ: "U", 				->immer bei U
						kommentar: "4 von 22", //als INfo, kann überschrieben werden
						user: "andreas"}
					neu:	
						.vonjahr:"2019"
						.utagteiler=1		//2 halbe -> 0.5
						
						
					*/
					
				}
			}
		}
		
		
		var saveurlaubdataTag=function(tagdata,reload){
			var returnFdata=function(data){
				var tj;
				data=JSON.parse(data);
				//check error
				if(data.status!=undefined){
					if(data.status!=msg_OK)
						handleError(data.status);
					else{
						statusDlg.show("",getWort("aenderungsaved"),"statok");
						if(data.lastaction!=undefined && data.lastaction=="projektstundenlisteupdate"){
							if(reload===true){
								
								for(tj=0;tj<ojahresuebersichten.length;tj++){
									ojahresuebersichten[tj].destroy();
								}
								ojahresuebersichten=[];
								
								sendMSG("reloadprojektlist",undefined);
							}
							else
								parsedata(projektedata,lastfilter);
						}
					}
				}
			}
			
			
			var sdata="id="	+urlaubsdata.id
					+"&data="+JSON.stringify(tagdata);
			loadData("projektstundenlisteupdate",returnFdata,"POST",encodeURI(sdata));
		}
		
		
		
		var ustack=function(ziel,data){//gesetzter Tag
			var jahrvermutlich=0,
				eintragsdata=data;
			
			this.getdata=function(){return data}
			
			var clickdelStunde=function(e){//Button:Stundeneintrag löschen
				//web+electron
				if(confirm(getWort("deleteeintrag"))){
					eintragsdata.deleting=true;
					saveurlaubdataTag(eintragsdata,true);
				}
				e.preventDefault();
			}
			
			var create=function(){
				var node,li;
				li=cE(ziel,"li");
				//button löschen
				node=cE(li,"a",undefined,"button buttdel");
				node.innerHTML=getWort("buttdel");
				node.addEventListener("click",clickdelStunde);
				
				node=cE(li,"span",undefined,"datum");
				node.innerHTML=convertToDatum(data.dat);
				node=cE(li,"span",undefined,"kommentar");
				node.innerHTML=data.kommentar;
				
				//utagteiler
				
				/*node=cE(li,"span",undefined,"halbtag");
				node.innerHTML=getWort("halbertag");
				node=cE(li,"input");
				node.type="checkbox";
				node.titel=getWort("datutagteiler");
				if(data["utagteiler"]!=undefined){
					if(data["utagteiler"]==0.5)node.checked=true;
				}*/
				
				if(data.vonjahr==undefined){
					if(data.kommentar.indexOf('von')>-1 
						&& data.kommentar.indexOf('(')>-1
						&& data.kommentar.indexOf(')')>-1){
							jahrvermutlich=data.kommentar.split('(')[1].split(')')[0];
						}
						else{
							jahrvermutlich=data.dat.split('-')[0];
						}
				}
			}
			
			
			create();
		}
		
		var freeUrlaubitem=function(ziel,titel,data){
			var _this=this,anode,itemdata={};
			
			var addUrlaubclick=function(e){
				var tj;
				freeurlaubsitemselect=_this;
				statusDlg.show("",getWort("waehletagimkalender"),"statok");
				
				for(tj=0;tj<ojahresuebersichten.length;tj++){
					ojahresuebersichten[tj].setMode("tagwahl");
				}
				
				addClass(anode,"select");
				e.preventDefault();
			}
		
			var create=function(){
				var li=cE(ziel,"li")			
				anode=cE(li,"a",undefined,"button newurlaubbutt");
				anode.innerHTML=titel;
				anode.addEventListener('click',addUrlaubclick);
				if(data!=undefined){
					itemdata=data;
				}
				itemdata.node=anode;
			}
			
			this.getdata=function(){return itemdata}
			
			create();
		}
		
	}
	
	var aktuellesJahr=function(ziel,lastfilter){
		var div=cE(ziel,"div"),
			tmonate=[],
			zeit = new Date(),jahr,
			kalendermode="",
			_this=this,
			heute = new Date(),
			zeigezeit = new Date(),
			parentModul=undefined;
			
		zeigezeit.setMilliseconds(1);
		zeigezeit.setHours(12);		//default 12, falls Zeitverschiebung...	
		zeigezeit.setMinutes(0);
		zeigezeit.setSeconds(0);
		zeigezeit.setDate(1);		//1. des Monats
		zeigezeit.setMonth(0);		//Januar
		if(lastfilter!=undefined && !isNaN(lastfilter)){//Jahresfilter 'alle', 2016,2017...
			zeigezeit.setFullYear(lastfilter);
		}
		jahr=zeigezeit.getFullYear();
		
		this.setMode=function(mode){
			subClass(ziel,kalendermode);
			kalendermode=mode;//"tagwahl"
			addClass(ziel,mode);
		}
		this.setparentModul=function(opm){
			parentModul=opm;
		}
		this.destroy=function(){
			div.innerHTML="";
		}
		this.getjahr=function(){return jahr;}
		
		var addto=function(zjahr,monat,tag,projekt,stundendat){
			var i,span,t,titel="",dat,s,
				ziel=tmonate[monat-1][tag-1];
			if(ziel!=undefined){//Kalenderelement gefunden					
				ziel.projekte.push(projekt);
				addClass(ziel.node,"hatdaten");
				for(i=0;i<ziel.projekte.length;i++)
					subClass(ziel.node,"anzahlP"+i);
				addClass(ziel.node,"anzahlP"+ziel.projekte.length);
			
				if(ziel.node.div==undefined){
					ziel.node.div=cE(ziel.node,"div");
					ziel.node.div.spans=[];
				}
				
				span=cE(ziel.node.div,"span");
				ziel.node.div.spans.push(span);	
				titel=projekt.data.titel;
				
				if(projekt.data.id=="feiertage"){
					span.style.backgroundColor=defaultfarben.feiertage.split('rgb').join("rgba").split(')').join(",1)");
					
					if(projekt.mod==="ustack"){
						addClass(span.parentNode.parentNode,"feiertag");	
					}
					else{
						if(projekt.data.info.farbe!=undefined && projekt.data.info.farbe!="")
							span.parentNode.style.borderTop="2px solid "+projekt.data.info.farbe;
							else
							span.parentNode.style.borderTop="2px solid "+defaultfarben.feiertage;
					}
				}
				
				if(projekt.data.id=="urlaub"){						
					span.style.backgroundColor=defaultfarben.urlaub.split('rgb').join("rgba").split(')').join(",1)");
					
					
					if(projekt.stack!=undefined){//#ffcc99
						addClass(span.parentNode.parentNode,"urlaubstack");	
						
						if(stundendat.vonjahr==undefined ||stundendat.kommentar.indexOf(stundendat.vonjahr)>-1)
							titel=titel+' '+stundendat.kommentar;
						else
							titel=titel+' '+stundendat.vonjahr+': '+stundendat.kommentar;
						//hover-listehover?	
						//console.log(stundendat);				
					}
					else{
						if(projekt.data.info.farbe!=undefined && projekt.data.info.farbe!="")
							span.parentNode.style.borderBottom="2px solid "+projekt.data.info.farbe;
							else
							span.parentNode.style.borderBottom="2px solid "+defaultfarben.urlaub;						
					}
					
				}
				if(projekt.data.info.farbe!=undefined && projekt.data.info.farbe!=""){
					span.style.backgroundColor=projekt.data.info.farbe;
				}
				
				
				if(projekt.data.id=="feiertage"){//bei Feuertagen, Kommentar als Titel nehmen
					for(t=0;t<projekt.data.stunden.length;t++){
						s=projekt.data.stunden[t];
						dat=s.dat.split('-');
						if(parseInt(dat[0])==zjahr && parseInt(dat[1])==monat && parseInt(dat[2])==tag)
							titel=s.kommentar;
					}
				}
				
				if(ziel.node.div.title.indexOf(titel)<0){
					titel=titel.split('&ouml;').join('ö');
					titel=titel.split('&auml;').join('ä');
					titel=titel.split('&uuml;').join('ü');
					titel=titel.split('&Ouml;').join('Ö');
					titel=titel.split('&Auml;').join('Ä');
					titel=titel.split('&Uuml;').join('Ü');
					
					if(ziel.node.div.title.length>0)ziel.node.div.title+=", ";
					ziel.node.div.title+=titel;
				}
				
				for(i=0;i<ziel.node.div.spans.length;i++){
					ziel.node.div.spans[i].style.height=100/ziel.node.div.spans.length+'%';
				}
			}	
			
		}
			
		this.addSingel=function(data){
			var dat=data.std.dat.split('-');//"2017-06-08"
				
			if(parseInt(dat[0])==jahr){
				addto(parseInt(dat[0]),parseInt(dat[1]),parseInt(dat[2]),data.proj,data.std);//monat,tag,data
			}
		}
			
		this.add=function(projektdata){//komplettes Projekt
			var i,t,s,dat,eintragen,
				data=projektdata.data,
				stunden=data.stunden;
				
			for(i=0;i<stunden.length;i++){
				s=stunden[i];
				dat=s.dat.split('-');//"2017-06-08"
				
				eintragen=parseInt(dat[0])==jahr;		//wenn aktuelles Jahr,
				if(s.stunden<=0 && 						//keine stunden -> nicht aufnehmen
					(projektdata.id!="urlaub"			//wenn Urlaub -> doch aufnehemen
					 &&
					 projektdata.id!="feiertage"
					)			
					)
					eintragen=false;		
				
				
				if(eintragen){//in Übersicht aufnehmen
					addto(parseInt(dat[0]),parseInt(dat[1]),parseInt(dat[2]),projektdata,s);//monat,tag,data
				}
			}
			
		}
		
		var clicktag=function(e){
			if(kalendermode=="tagwahl"){
				if(istClass(this,"tag5") || istClass(this,"tag6")){
					if(!confirm(getWort("tagistwochenende")))return;
				}	
				
				
				if(istClass(this,"urlaubstack"))
					statusDlg.show("Fehler",getWort('tagsconbelegt'));
					//alert(getWort("tagsconbelegt"))
				else
				if(istClass(this,"feiertag")){
					statusDlg.show("Fehler",getWort('tagistfeiertag'));
					//alert(getWort("tagistfeiertag"))
				}	
				else
				if(parentModul!=undefined){
					parentModul.Message(kalendermode,this.data)
					_this.setMode("");
				}
			}
		}
		
		var createMonat=function(Monat,Jahr,zielnode,tliste){
			var i,node,table,th,tr,td,tagz=0,
				tageimMonat =getMonatstage(Monat+1,Jahr),
				MzeigeZeit = new Date(Jahr,Monat,1);
			
			//Anzahl der Tage im Monat und mit welchem Wochentag der Monat anfängt
			var Start = MzeigeZeit.getDay();//0=Monatg
			if(Start > 0) 
						Start--;
					else 
						Start = 6;
			
			table=cE(zielnode,"table");
			tr=cE(table,"tr");
			th=cE(tr,"th");
			th.innerHTML=MonatsnameID[Monat];
			th.colSpan=7;
			
			tr=cE(table,"tr");
			for(i=0;i<Start;i++){
				td=cE(tr,"td",undefined,"leer");
				td.innerHTML="&nbsp;";
				tagz++;
			}
			
			for(i=0;i<tageimMonat;i++){
				td=cE(tr,"td");
				td.innerHTML=i+1;
				
				td.addEventListener("click",clicktag);
				td.data={"tag":i+1,"jahr":Jahr,"monat":Monat+1};
				
				td.className="tag"+(Start % 7);
				Start++;
				
				tliste.push({"node":td,"Y":Jahr,"projekte":[]});
				
				tagz++;
				if(tagz==7){
					tagz=0;
					tr=cE(table,"tr");
				}
			}
			if(tagz>0)
			for(i=tagz;i<7;i++){
				td=cE(tr,"td",undefined,"leer");
				td.innerHTML="&nbsp;";
			}
		}
		
		var create=function(){
			var d,i,monatdata;
			d=cE(div,"h1",undefined,"monattabH");
			d.innerHTML=jahr;
			
			d=cE(div,"div",undefined,"monattab");//monate
			for(i=0;i<12;i++){
				monatdata=[];
				createMonat(i,jahr,d,monatdata);
				tmonate.push(monatdata);
			};
			
			//aktuellen Tag markieren
			if(jahr==heute.getFullYear()){
				var zieltag=tmonate[heute.getMonth()][heute.getDate()-1];
				if(zieltag){
					addClass(zieltag.node,"heute");
				}
			}
		}
		
		create();
	}	
	
	var ueberblickProjekte=function(zielnode){//Balken etc.
		//Statistik
		var ziel=zielnode;
		var basis=undefined;
		var _this=this;
		var connects=[];
		var projekte=[];
		var filter=[];					//keine Feiertage zeigen: ["feiertage"]
		var projektedata=undefined;
		var lastfilter=undefined;		
		var projekteliste2=undefined;
		var localfilter={
			"auftraggeber_zusammenfassen":false
		}
		
		this.ini=function(){			
			basis=cE(ziel,"div",undefined,"projektueberblick");
		}
		this.destroy=function(){}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			if(s=="allProjektsloaded"){
				projektedata=data.projekte;
				parsedata(data.projekte,lastfilter);
			}
			if(s=="selectFilterJahr"){
				lastfilter=data;
				parsedata(projektedata,data);
			}
			if(s=="selectFilterBeendet"){
				//data=true|false
				parsedata(projektedata,lastfilter);
			}
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
				
		var isinfilter=function(data){
			var i,re=false;
			for(i=0;i<filter.length;i++){
				if(data.id==filter[i])re=true;
			}
			
			if(lokalData.zeigebeendete!=undefined){
				if(lokalData.zeigebeendete===false){
					if(	data.data!=undefined && 
						data.data.info!=undefined &&						
						data.data.info.isended!=undefined)
					{
						if(data.data.info.isended==true)
							re=true;
					}
				}
			}
			
			return re;
		}
		this.setfilter=function(arr){//bestimmte Projekte nicht anzeigen 
			filter=arr;
		}

		var parsedata=function(data,jahrfilter){
			var i,t,o,HTMLnode,onew,eintragen,std,a;
			basis.innerHTML="";
			
			if(data==undefined)return;
			
			var jahresuebersicht=new aktuellesJahr(basis,lastfilter);
			
			//Ergebnis			
			projekte=[];
			for(i=0;i<data.length;i++){
				o=data[i];
				
				eintragen=!isinfilter(o);//Filter by Art

				if(eintragen && jahrfilter!=undefined && jahrfilter!="alle"){
					eintragen=false;
					//gucken ob Stunden passend zum Filter da sind, dann Eintrag zeigen
					for(t=0;t<o.data.stunden.length;t++){
						std=o.data.stunden[t];						
						a=parseInt(std.dat.split('-')[0]);		
						if(!isNaN(a)){
							if(jahrfilter==a)eintragen=true;
						}
					}
				}
				if(eintragen){
					onew={id:o.id,pro:o.pro,data:o.data,divnode:undefined};
					projekte.push(onew);
					
					HTMLnode=cE(basis,"div");
					HTMLnode.innerHTML=encodeString(o.data.titel);
					//sendMSG("scramble",HTMLnode);
					onew.divnode=HTMLnode;
					
					showinfosonCanvas(onew);
					jahresuebersicht.add(onew);
				}
				if(!eintragen && o.id=="feiertage"){
					onew={id:o.id,pro:o.pro,data:o.data,divnode:undefined};
					jahresuebersicht.add(onew);
				}
				
			}
			
			
			
			
			
			projekteliste2=cE(basis,"div");
			showprojekteliste2();
		}
		
		var showinfosonCanvas=function(dat){//aktuelles jahr
			var i,HTMLnode,can,cc,div,
				datumstd,maxstunden,stundenliste;
			var posfix=0.5;//sonst keine 1px linien ...
			
			var zeigezeit = new Date();
			zeigezeit.setMilliseconds(1);
			zeigezeit.setHours(12);		//default 12, falls Zeitverschiebung...	
			zeigezeit.setMinutes(0);
			zeigezeit.setSeconds(0);
			zeigezeit.setDate(1);		//1. des Monats
			zeigezeit.setMonth(0);		//Januar
			if(lastfilter!=undefined && !isNaN(lastfilter)){//Jahresfilter 'alle', 2016,2017...
				zeigezeit.setFullYear(lastfilter);
			}
			
			dat.divnode.innerHTML="";
			if(dat.data.stunden.length==0)return;//keine Stunden zum anzeigen vorhanden
			
			HTMLnode=cE(dat.divnode,"h1");
			HTMLnode.innerHTML=encodeString(dat.data.titel);
			
			//sort Stunden by datum
			dat.data.stunden=dat.data.stunden.sort(sortbyDate);
			
			maxstunden=8;
			stundenliste=[];
			var posX=0;
			//maximale Anzahl Stunden pro Eintrag/Tag, für Canvasheigt-Multiplikator
			//xPosition im canvas
			for(i=0;i<dat.data.stunden.length;i++){
				datumstd=getdatumsObj(dat.data.stunden[i].dat);		//convert to date
				if(datumstd.getFullYear()==zeigezeit.getFullYear()){//Stunden im Bereich vom aktuellen Jahr?
					posX=(datumstd.getTime()-zeigezeit.getTime())/1000/60/60/24;//Tag im Jahr
					stundenliste.push( {
						"x":posX,
						"datum":datumstd,							//Eintrag als Datum
						"stunden":dat.data.stunden[i].stunden, 		//Anzahl Stunden
						"std":dat.data.stunden[i].dat 				//original
						} );										//merken
				} 
				if(maxstunden<dat.data.stunden[i].stunden)maxstunden=dat.data.stunden[i].stunden;
			}
			
			if(stundenliste.length==0){
				HTMLnode.innerHTML="";
				return;
			}
			
			//Anzahl der Tage im Jahr =canvar width
			var anzahlTage=getTageimJahr(zeigezeit.getFullYear());
			var monatsTage=getTageimJahrList(zeigezeit.getFullYear());
			
			var canWidth=anzahlTage;
			var canHeight=50;//px
			var x,y;
			
			can=cE(dat.divnode,"canvas");//,undefined,"clickcanvasJahr"
			can.width =canWidth+1;
			can.height=canHeight;
			can.title =getWort("letzte12mon");
			cc=can.getContext('2d');
			cc.lineWidth=1;
			div=cE(dat.divnode,"div");
			//can.addEventListener('click' ,clickcanvas);
			//can.data={"div":div,"data":dat,"monatsTage":monatsTage};
			
			//Monatstrenner, Monatskürzel, aktuelles Jahr
			x=0;
			drawText(cc,2+posfix,canHeight-3+posfix,"#e0e0e0","20px Verdana",zeigezeit.getFullYear());
			for(i=0;i<monatsTage.length;i++){
				if(i==0)drawLine(cc, x+posfix,0+posfix,x+posfix,canHeight+posfix,1,"#e0e0e0");
				drawText(cc,x+2+posfix,10+posfix,"#c0c0c0","10px Verdana",getWort('kurz'+MonatsnameID[i]).toUpperCase());
				x+=monatsTage[i];
				drawLine(cc, x+posfix,0+posfix,x+posfix,canHeight+posfix,1,"#e0e0e0");				
			}
			drawLine(cc, canWidth+posfix,0+posfix,canWidth+posfix,canHeight+posfix,1,"#e0e0e0");
			drawLine(cc, 0+posfix,canHeight+posfix-1,canWidth+posfix,canHeight+posfix-1,1,"#e0e0e0");

			
			//Tagesstunden zeichnen
			var farbe="rgba(127,202,93,0.7)";
			if(dat.id=="urlaub")farbe=defaultfarben.urlaub.split('rgb').join("rgba").split(')').join(",0.7)");//"rgba(94,156,201,0.7)";
			for(i=0;i<stundenliste.length;i++){
				datumstd=stundenliste[i];
				x=datumstd.x;
				y=Math.floor(canHeight - (canHeight/(maxstunden+1)* datumstd.stunden));
				if(dat.id=="urlaub")y=0;
				drawLine(cc, x+posfix,canHeight+posfix,x+posfix,y+posfix,1,farbe);
				
				drawLine(cc, x+posfix,canHeight+posfix,x+posfix,canHeight-2+posfix,2,"#333333");
			}
						
			//sendMSG("scramble",dat.divnode);
		}
		
		/*var clickcanvas=function(e){
			var i;
			var div=this.data.div;
			var dat=this.data.data.stunden;
			var mt=this.data.monatsTage;
			
			console.log(this.data,mt,e);
		}*/
	
	
		var sortlistebyhour=function(a,b){
			if(a.stundenges ==undefined || b.stundenges==undefined)return 0;		
			if(a.stundenges<b.stundenges)return 1;
			if(a.stundenges>b.stundenges)return -1;
			return 0;	
		}
	
	
		var changelocaloptionprojektliste=function(e){
			localfilter["auftraggeber_zusammenfassen"]=this.checked;
			showprojekteliste2();
		}
	
		var showprojekteliste2=function(){//Querbalken
			if(projekteliste2==undefined)return;
			//Projekt|----gesammtstunden
			var i,t,tabelle,tr,th,td,o,div,div2,stdjahr,property,
				inp,label;
			
			var zeigezeit = new Date();
				zeigezeit.setMilliseconds(1);
				zeigezeit.setHours(12);		//default 12, falls Zeitverschiebung...	
				zeigezeit.setMinutes(0);
				zeigezeit.setSeconds(0);
				zeigezeit.setDate(1);		//1. des Monats
				zeigezeit.setMonth(0);		//Januar
				if(lastfilter!=undefined && !isNaN(lastfilter)){//Jahresfilter 'alle', 2016,2017...
					zeigezeit.setFullYear(lastfilter);
				}
				
			projekteliste2.innerHTML="";

			//gleiche Auftraggeber zusammenfassen
			
			div=cE(projekteliste2,"div",undefined,"localoptionen");
			div.innerHTML="<span>"+getWort("Autraggeber_zusammenfassen")+"</span>";
			inp=cE(div,"input",undefined,"booleanswitch");			
			inp.type="checkbox";
			inp.id='cb_auftraggeberzus';
			inp.checked=localfilter.auftraggeber_zusammenfassen;
			label=cE(div,"label");
			label.htmlFor=inp.id;					
			inp.addEventListener("change",changelocaloptionprojektliste);
			
			div2=cE(projekteliste2,"p",undefined,"hinweis");
			div2.innerHTML=getWort("hinweis_beendete_projekte");

			var tempprojektliste=[];
			var tempprojekte={};
			if(localfilter.auftraggeber_zusammenfassen===true){
				
				
				for(i=0;i<projekte.length;i++){
					o=projekte[i];
					if(o.data.info.auftraggeber!=""){
						if(tempprojekte[o.data.info.auftraggeber]===undefined){
							tempprojekte[o.data.info.auftraggeber]={
								"data":JSON.parse( JSON.stringify(o.data)),//copy
								"id":o.data.info.auftraggeber//o.id
							};
							
							tempprojekte[o.data.info.auftraggeber].data.titel=o.data.info.auftraggeber;
							
						}else{
							//stunden hinzufügen
							for(t=0;t<o.data.stunden.length;t++){
								tempprojekte[o.data.info.auftraggeber].data.stunden.push(o.data.stunden[t]);
								//console.log("add",);
							}
						}
						
					}
					else{
						tempprojektliste.push(o);
					}
					//console.log("##",o);
				}
				
				for( property in tempprojekte ) { 		
					tempprojektliste.push(tempprojekte[property]);
				}
				
				
			}else{
				tempprojektliste=projekte;
			}

			var maxstd=0,stundenproproj;
			for(i=0;i<tempprojektliste.length;i++){
				o=tempprojektliste[i].data;
				//console.log("##",o);
				
				tempprojektliste[i].stundenimJahr={};
				stundenproproj=0;
				for(t=0;t<o.stunden.length;t++){					
					if(lastfilter=="alle"){
						stundenproproj+=o.stunden[t].stunden;
						stdjahr=parseInt(o.stunden[t].dat.split('-')[0]);
						
						if(tempprojektliste[i].stundenimJahr[stdjahr]!=undefined)
							tempprojektliste[i].stundenimJahr[stdjahr]+=o.stunden[t].stunden;
						else
							tempprojektliste[i].stundenimJahr[stdjahr]=o.stunden[t].stunden;
						
					}else{
						stdjahr=parseInt(o.stunden[t].dat.split('-')[0]);
						if(stdjahr==zeigezeit.getFullYear()){
							stundenproproj+=o.stunden[t].stunden;
							if(tempprojektliste[i].stundenimJahr[stdjahr]!=undefined)
								tempprojektliste[i].stundenimJahr[stdjahr]+=o.stunden[t].stunden;
							else
								tempprojektliste[i].stundenimJahr[stdjahr]=o.stunden[t].stunden;	
						}					
					}
				}
				tempprojektliste[i].stundenges=stundenproproj;
				if(maxstd<stundenproproj)maxstd=stundenproproj;
			}
			tempprojektliste=tempprojektliste.sort(sortlistebyhour); //ist=by last change Date
			
			tabelle=cE(projekteliste2,"table");
			for(i=0;i<tempprojektliste.length;i++){
				o=tempprojektliste[i];
				if(o.id!="urlaub"){
					tr=cE(tabelle,"tr");
					th=cE(tr,"th");
					th.innerHTML=encodeString(o.data.titel);
					//sendMSG("scramble",th);
					td=cE(tr,"td");
					div=cE(td,"div",undefined,"balkenstunden");
					div.style.width=(100/maxstd*o.stundenges)+"%";
					
					if(o.data.info.isended!=undefined){
						if(o.data.info.isended===true)addClass(div,"proisended");
					}
					//Pro Jahr ein Strich, aktuelles markern "jahrselect"
					
					for( property in o.stundenimJahr ){
							div2=cE(div,"div",undefined,"balkenstundenaktuellesJahr");
							div2.style.width=(100/o.stundenges*o.stundenimJahr[property])+"%";
							div2.title=property+': '+parseInt(o.stundenimJahr[property])+'h';
							if(parseInt(property)==zeigezeit.getFullYear()) addClass(div2,"jahrselect");
						
					}	
						
					div2=cE(div,"div",undefined,"balkenstundentext");
					if(o.stundenges>0)div2.innerHTML=parseInt(o.stundenges)+"h";
				}
			}
		}
	}
	
	var editorTODO=function(zielnode){//TODO-Liste
		/*
			TODO-Liste von Projekten
			Projekteigenschaften:
			.intodo=true //"isended":true
			.todotext=""
		*/
		var ziel=zielnode;
		var _this=this;
		var connects=[];
		var projektaktiv=undefined;
		var projinputs=[];
		
		var todoliste=[];
		var tab=undefined;
		var tbody;
		
		var todlistdiv;
		
		this.ini=function(){
			//create
			basis=cE(ziel,"div",undefined,"editorTODO");
			basis.innerHTML="";
			todlistdiv=basis;
			tab=cE(basis,"table");
		}
		this.destroy=function(){
			
		}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			if(s=="allProjektsloaded"){
				showTODOdata(data);
			}
			if(s=="selectProjekt"){
				addProjectToTODO(data);
				sendMSG("deselect",undefined);
			}
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		
		var sortbynr=function(a,b){
			var ad=a.data.info.todonr;
			var bd=b.data.info.todonr;
			if(ad>bd)
				return 1;
			else
			if(ad==bd)
				return 0;
			else
				return -1;
		}		
		
		var showTODOdata=function(data){
			var i,o,nummer,
				liste=data.projekte;
				
			basis.innerHTML="";
			todoliste=[];
			
			var gesetztenummern=[];
			var nummervergeben=function(nr){
				var i,re=false;
				for(i=0;i<gesetztenummern.length;i++){
					if(nr==gesetztenummern[i])re=true;
				}
				return re;
			}
			
			for(i=0;i<liste.length;i++){
				o=liste[i];
				if(o.data!=undefined)
				if(o.data.info!=undefined)
				if(o.data.info.intodo!=undefined){						
					if(o.data.info.intodo===true){
						
						if(o.data.info.todonr==undefined){
							nummer=todoliste.length;			
						}else{
							nummer=o.data.info.todonr;
						}
						
						while(nummervergeben(nummer)){
							nummer++
						}
						o.data.info.todonr=nummer;
						
						//anzeigen											
						todoliste.push(o);
					}
				}
			}
			
			todoliste=todoliste.sort(sortbynr);
			
			tab=cE(basis,"table");
			tbody=cE(tab,"tbody");
			
			
			var newnum=false;
			for(i=0;i<todoliste.length;i++){
				o=todoliste[i];
				addItem(o,i);
				if(o.data.info.todonr!=i){
					o.data.info.todonr=i;
					postNewData("projektinfoupdate",{"projektdata": o, "daten": o.data.info,"noreload":true });
					newnum=true;
				}
			}
			if(newnum){
				//MESSAGE reloadprojektlist undefined
				sendMSG("reloadprojektlist",undefined);
			}
		}
		
		
		var addProjectToTODO=function(projekt){//von Projektliste übernehmen
			projekt.data.info.intodo=true;
			if(projekt.data.info.todotext==undefined){
				projekt.data.info.todotext="";				
			}
			
			projekt.data.info.todonr=todoliste.length;				
			
			
			addItem(projekt,todoliste.length);
			todoliste.push(projekt);
			
			//save Data
			//sendMSG("addProjekt",projekt.dat);
			
			//console.log("projekt",projekt);
			postNewData("projektinfoupdate",{"projektdata": projekt, "daten": projekt.data.info });
		}
		
		var addItem=function(projekt,nr){
			var tr,td,input,saving=false;
			if(tab==undefined)return;
			if(projekt.data.info.todotext==undefined){
				projekt.data.info.todotext="";				
			}
			
			tr=cE(tbody,"tr");
			tr.data={"projektdata":projekt};
			
			td=cE(tr,"td",undefined,"todoTDNR");
			td.innerHTML=projekt.data.info.todonr+1;
			
			td=cE(tr,"td",undefined,"todoTDAktions");
			
			input=cE(td,"input");
			input.className="button buttMove";
			input.type="button";
			input.value=getWort("butt_move");
			input.data={"projektdata":projekt};
			input.addEventListener('mousedown' ,listeMDown);
			input.addEventListener('mouseup' ,listeMUP);
			
			todlistdiv.addEventListener('mousemove' ,listeDMove);
			todlistdiv.addEventListener('mouseup' ,listeMUP);
			
			td=cE(tr,"td",undefined,"todoTDtitel");
			td.innerHTML=projekt.data.titel;
			
			td=cE(tr,"td",undefined,"todoTDinputtext");
			input=cE(td,"input",undefined,"todoText");
			input.type="text";
			input.data={"projektdata":projekt,"node":projekt.data.info.todotext,"timer":undefined};
			input.value=projekt.data.info.todotext;
					
			input.addEventListener('keyup' ,changeTextInput);
			input.addEventListener('change',changeTextInput);
			
			td=cE(tr,"td",undefined,"todoTDButtDel");
			input=cE(td,"input");
			input.className="button buttdel";
			input.type="button";
			input.value=getWort("butt_entfernen");
			input.data={"projektdata":projekt,timer:undefined};
			input.addEventListener('click' ,delfromlist);
			
			
		}
		
		
		var getTR=function(e){
			var i,trh,
				py=0,
				re={node:undefined,nr:-1},
				scrollY=todlistdiv.scrollTop,
				mxy=relMouse(e,todlistdiv),
				ypos=mxy.y+scrollY,					
				tabtr=tab.getElementsByTagName("tr");			
			
			for(i=0;i<tabtr.length;i++){
					trh=tabtr[i].offsetHeight;
					if(ypos>=py && ypos<=py+trh){
						re.node=tabtr[i];
						re.nr=i;
					}
					py+=trh;
				}
				
			return re;
		}
		
		var dragdrop={
			aktiv:false,
			quelle:undefined,
			lastsetcss:[],
			quellenr:-1,
			zielvornr:-1
			};
			
		var listeMDown=function(e){
			dragdrop.aktiv=true;
			var qtr=getTR(e);
			dragdrop.quelle=qtr.node;
			dragdrop.quellenr=qtr.nr;
			if(dragdrop.quelle)addClass(dragdrop.quelle,"dragdropquelle");
			}
		var listeMUP=function(e){
			var tabtr,i;
			subClass(dragdrop.quelle,"dragdropquelle");
			
			if(dragdrop.aktiv && dragdrop.quelle!=undefined && dragdrop.lastsetcss.length>0){
				if(dragdrop.quellenr!=dragdrop.zielvornr && dragdrop.quellenr+1!=dragdrop.zielvornr){
					var qprojekt=dragdrop.quelle.data.projektdata;
					var projekt;				
					var laufnr=0;
					var isset=false;
					
					tabtr=tab.getElementsByTagName("tr");
					
					for(i=0;i<tabtr.length;i++){
						projekt=tabtr[i].data.projektdata;
						if(i<dragdrop.zielvornr){
							//bleibt so
						}
						else
						if(i==dragdrop.zielvornr){
							qprojekt.data.info.todonr=laufnr;
							laufnr++;
							projekt.data.info.todonr=laufnr;
							postNewData("projektinfoupdate",{"projektdata": projekt, "daten": projekt.data.info,"noreload":true });
							isset=true;
						}
						else
						if(i>dragdrop.zielvornr && i!=dragdrop.quellenr){
							projekt.data.info.todonr=laufnr;
							postNewData("projektinfoupdate",{"projektdata": projekt, "daten": projekt.data.info,"noreload":true});
						}
						laufnr++;
					}
					if(!isset){
						laufnr++;
						qprojekt.data.info.todonr=laufnr;
					}
					
					tab.style.opacity="0.5";
					postNewData("projektinfoupdate",{"projektdata": qprojekt, "daten": qprojekt.data.info});//& reload
				}
				
				dragdrop.quellenr=-1;
				dragdrop.zielvornr=-1;
			}
			
			dragdrop.aktiv=false;
			dragdrop.quelle=undefined;
		}
		
		var listeDMove=function(e){
			var i,py,trh,
				scrollY=todlistdiv.scrollTop,
				mxy=relMouse(e,todlistdiv),
				ypos=mxy.y+scrollY,					
				tabtr=tab.getElementsByTagName("tr");
			
			if(dragdrop.lastsetcss.length>0){
					for(i=0;i<dragdrop.lastsetcss.length;i++){
						subClass(dragdrop.lastsetcss[i],"indavor");
						subClass(dragdrop.lastsetcss[i],"indanach");
					}
					dragdrop.lastsetcss=[];
				}
			
			if(e.buttons>0 && dragdrop.quellenr!=-1){//1: Left; 2:Right; 4 : middle;8 : Fourth; 16 : Fifth  3=1+2
				py=0;
				for(i=0;i<tabtr.length;i++){
					trh=tabtr[i].offsetHeight;
					if(ypos>=py && ypos<=py+trh){
						if(ypos>py+trh*0.5){
							//danach
							if(i+1!=dragdrop.quellenr){
								addClass(tabtr[i],"indanach");
							}
							dragdrop.zielvornr=i+1;
						}
						else{
							//davor
							if(i-1!=dragdrop.quellenr){
								addClass(tabtr[i],"indavor");
							}
							dragdrop.zielvornr=i;
						}
						dragdrop.lastsetcss.push(tabtr[i]);
						
					}
					py+=trh;
				}
				
				e.stopPropagation();
				e.preventDefault();
			}
		}
		
		
		var getProjNr=function(nr){
			var i,o;			
			for(i=0;i<todoliste.length;i++){
				o=todoliste[i];
				if(o.data.info.todonr==nr){
					return o;
				}
			}
			return undefined;
		}
		
		var delfromlist=function(s){
			this.data.projektdata.data.info.intodo=false;
			sendtiteldatatimer(this);
		}
		
		var changeTextInput=function(e){//'keyup'/'change'
			var val=decodeString(this.value);//string
			
			//test ob sich der Wert geändert hat (sonst wurde er schon gespeichert)
			var istanders=!((this.data.node+'')==(val+''));
			if(e.type=="keyup" && e.keyCode==13)istanders=true;
			if(!istanders)return;
			
			//Timer ggf. löschen
			if(this.data.timer!=undefined){
				clearTimeout(this.data.timer);
				this.data.timer=undefined;
			}
			
			//Daten zuweisen
			this.data.projektdata.data.info.todotext=this.value;
			this.data.node=this.value;
			
			//neuer Text
			if(e.type=="keyup" && e.keyCode==13){
				sendtiteldatatimer(this);				
			}
			else{
				
				this.data.timer=setTimeout(sendtiteldatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
			}
		}
		
		var sendtiteldatatimer=function(node){
			//console.log(node.data);
			postNewData("projektinfoupdate",{"projektdata": node.data.projektdata, "daten": node.data.projektdata.data.info });
		}		
				
		
		var postNewData=function(befehl,data){
			//"projektinfoupdate", (.projektdata,.daten)
			//daten			-> projekt.info
			//projektdata 	-> projekt
			
			//console.log("postNewData:",befehl,data);//.typ .data .id
			var sdata="id="					+data.projektdata.id
					+"&data="+JSON.stringify(data.daten);

			if(data.noreload!=undefined &&
				data.noreload===true)
				loadData(befehl,function(d){},"POST",encodeURI(sdata));//befehl="projektstundenlisteupdate"
				else
				loadData(befehl,parseNewdataRE,"POST",encodeURI(sdata));//befehl="projektstundenlisteupdate"
		};		
		
		var parseNewdataRE=function(data){
			data=JSON.parse(data);
			//check error
			if(data.status!=undefined){
				if(data.status!=msg_OK)
					handleError(data.status);
				else{
					statusDlg.show("",getWort("aenderungsaved"),"statok");
					if(data.lastaction!=undefined && data.lastaction=="projektinfoupdate")
						sendMSG("reloadprojektlist",undefined);
				}
			}
			//OK
		}
		
	}
	
	
	var editorProjekt=function(zielnode){//meine Projekte
		var ziel=zielnode;
		var _this=this;
		var connects=[];
		var projektaktiv=undefined;
		var projinputs=[];
		var newprojektadded=undefined;
		
		this.ini=function(){
			//create
			basis=cE(ziel,"div",undefined,"editorProjekt");
			basis.innerHTML="";
			if(hatProjekte())
				statusDlg.show("",getWort("wahleprojekt"),"posprojektlist");//selectaprojekt
		}
		this.destroy=function(){
			var i,inp;
			if(projinputs.length>0){//Aufräumen
				for(i=0;i<projinputs.length;i++){
					inp=projinputs[i];
					if(inp.data.o_sibling!=undefined){
						if(inp.data.o_sibling.timer!=undefined)clearTimeout(inp.data.o_sibling.timer);
					}
					inp.removeEventListener('keyup' ,changeActivityInput);
					inp.removeEventListener('change',changeActivityInput);
				}
			}
			
		}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			//statusDlg.show("","");
			//
			if(s=="selectProjekt"){
				//Daten dieses Projektes anzeigen
				//console.log(">>>",s,data);
				showProjektdata(data.data);
				sendMSG("deselect",undefined);
			}
			if(s=="createnewprojekt"){
				newprojektadded=data;//ein neues Projekt wurde erzeugt
			}
			if(s=="allProjektsloaded"){
				if(newprojektadded!=undefined){//neues Projekt anzeigen
					var name=newprojektadded.split("=")[1];
					var i,p;
					for(i=0;i<data.projekte.length;i++){
						p=data.projekte[i];
						if(p.data.titel==name){
							showProjektdata(p.data);							
							return;
						}
					}
					newprojektadded=undefined;
				}
			}
			
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
				
		var getcolorButt=function(ziel,data){
			var node;
			var dialog=undefined;
			
			var onchangeFD=function(sfarbe){
				data.inputnode.value=sfarbe;
				data.inputnode.style.backgroundColor=sfarbe;
				
				//addClass(data.inputnode,"isedit");
				//daten übernehmen
				data.inputnode.data.node[data.inputnode.data.nodeid]=decodeString(sfarbe);
				//speichern
				sendinfodatatimer(data.inputnode);
			}
			
			var click=function(e){
				if(dialog!=undefined)
					dialog.show();
				else
					dialog=new o_Farbdialog(basis,{"farbe":data.inputnode.value},onchangeFD);
			}			
			
			var ini=function(){
				node=cE(ziel,"button",undefined,"button inputtanbutt");
				node.innerHTML=getWort("farbwaehler");
				node.addEventListener("click",click);
			}
			
			ini();
		}
		
		var farbchage=function(e){
			var f=this.value;
			this.style.backgroundColor=f;
		}
		
		var showProjektdata=function(projekt){
			checkneueOptionen(projekt);
			
			var tab,tr,th,td,i,inp,label,std,property,h1,htmlNode,tmp,butt;
			var tab2,tr2,td2,th2;
			var o_sibling;
			var stundengesammt=0;
			var datum=new Date();
			
			projektaktiv=projekt;
			var datumeditable=false;
			if(projektaktiv.id=="feiertage")datumeditable=true;
			
			if(projinputs.length>0){//Aufräumen
				for(i=0;i<projinputs.length;i++){
					inp=projinputs[i];
					if(inp.data.o_sibling!=undefined){
						if(inp.data.o_sibling.timer!=undefined)clearTimeout(inp.data.o_sibling.timer);
					}
					inp.removeEventListener('keyup' ,changeActivityInput);
					inp.removeEventListener('change',changeActivityInput);
				}
			}
			
			projinputs=[];
			basis.innerHTML="";
			
			tab=cE(basis,"table");
			
			//input ID
			tr=cE(tab,"tr");
			th=cE(tr,"th");
			th.innerHTML=getWort("projid")+':';
			td=cE(tr,"td",undefined,"textid");
			td.innerHTML=encodeString(projekt.id);
			
			//input titel
			tr=cE(tab,"tr");
			th=cE(tr,"th");
			th.innerHTML=getWort("projtitel")+':';
			td=cE(tr,"td");
			inp=cE(td,"input");
			inp.value=encodeString(projekt.titel);
			inp.data={
					"property":"titel",
					"typ":"titel",
					"node":projekt ,
					"nodeid":"titel",
					"projektdata":projekt,
					"o_sibling":{timer:undefined,elemente:[inp]}
					};
			projinputs.push(inp);
			
			//infos			
			tr=cE(tab,"tr");
			td=cE(tr,"td");
			h1=cE(td,"h1");
			h1.innerHTML=getWort("Infos");
			td.colSpan=2;
			o_sibling={
					timer:undefined,
					elemente:[]
				}
			for( property in projekt.info ) { 		
				//console.log(property,"=", projekt.info[property]);
				tr=cE(tab,"tr",undefined,"infoth tr"+property);
				td=cE(tr,"th");
				td.innerHTML=getWort("dat"+property)+':';//getWort("projtitel")
				td=cE(tr,"td");
				inp=cE(td,"input");
				inp.value=encodeString(projekt.info[property]);
				inp.data={
						"property":property,
						"typ":"info",
						"node":projekt.info ,
						"nodeid":property,
						"projektdata":projekt,
						"o_sibling":o_sibling};
				projinputs.push(inp);
				
				//console.log(getDataTyp(projekt.info[property]));
				if(getDataTyp(projekt.info[property])=='[object Boolean]'){
					inp.type="checkbox";
					inp.id='cb_'+property;
					inp.checked=projekt.info[property];
					addClass(inp,"booleanswitch");
					label=cE(td,"label");
					label.htmlFor=inp.id;					
				}
				if(getDataTyp(projekt.info[property])=='[object Number]'){
					inp.type="number";
					inp.step=0.01;
					//inp.min=0;
				}
				if(property=="farbe"){
					butt=new getcolorButt(td,{"inputnode":inp});
					if(inp.value.length>0)inp.style.backgroundColor=inp.value;
					inp.addEventListener('keyup',farbchage);
					inp.addEventListener('change',farbchage);
				}
				
				o_sibling.elemente.push(inp);
			}
			
			tab=cE(basis,"table");
			//stunden
			tr=cE(tab,"tr");
			td=cE(tr,"td");
			h1=cE(td,"h1");
			h1.innerHTML=getWort("Stunden");
			td.colSpan=2;
			
			if(projekt.stunden.length==0){
				tr=cE(tab,"tr");
				td=cE(tr,"td");
				td.innerHTML=getWort("keinestunden");
				td.colSpan=2;
			}
			
			//sort by date
			var templiste=projekt.stunden.sort(sortbyDate);
			var ujahr="0000",ujahralt="0000";	
			var aktuell=datum.getFullYear()+"";
			
			
			for(i=0;i<templiste.length;i++){
				std=templiste[i];				
				ujahr=std.dat.split('-')[0];
				
				if(projektaktiv.id=="urlaub"){
					if(std["vonjahr"]==undefined){
						std["vonjahr"]=0;
					}
					if(std["utagteiler"]==undefined){
						std["utagteiler"]=1;
					}
				}
				
				if(ujahralt!=ujahr){
					tr=cE(tab,"tr",undefined,"tr_schalter");
					td=cE(tr,"td");
					td.colSpan=2;
					
					htmlNode=cE(td,"a",undefined,"button jahrschalter");
					htmlNode.innerHTML=""+ujahr;
					htmlNode.data={j:ujahr,tab:tab,t1:getWort("zeige"),t2:getWort("verberge")};
					if(aktuell==ujahr)
						htmlNode.innerHTML=htmlNode.data.t2+" "+ujahr;
					else
						htmlNode.innerHTML=htmlNode.data.t1+" "+ujahr;
					htmlNode.href="#";
					htmlNode.addEventListener("click",clickJahrschalter);
				}
				
				if(aktuell!=ujahr)
					tr=cE(tab,"tr",undefined,"tr_"+ujahr+" ausgeblendet");
				else
					tr=cE(tab,"tr",undefined,"tr_"+ujahr);
				td=cE(tr,"td");
				td.colSpan=2;
				
				
				tab2=cE(td,"table",undefined,"stdtab");
				tr2=cE(tab2,"tr");
				for( property in std ) { 
					td2=cE(tr2,"th");
					td2.innerHTML=getWort("dat"+property)+':';
					if(projektaktiv.id=="urlaub" && (property=="stunden" || property=="typ")){
						td2.style.display="none";
					}
				}
				td2=cE(tr2,"th");
				
				tr2=cE(tab2,"tr");
				o_sibling={
					timer:undefined,
					elemente:[]
				}
				
				
				for( property in std ) { 
					td2=cE(tr2,"td");
					inp=cE(td2,"input");
					inp.value=encodeString(std[property]);
					inp.data={"property":property,"typ":"stunde","node":std ,"nodeid":property,"projektdata":projekt,"datstunde":std,"o_sibling":o_sibling};
					inp.className="inpdat"+property;
					o_sibling.elemente.push(inp);
					
					if(property=="stunden"){
							inp.type="number";//
							inp.step=0.01;
							inp.min=0;
							stundengesammt+=parseFloat(encodeString(std[property]));
						}
					
					if(property=="vonjahr"){
							inp.type="number";//
							inp.step=1;
							inp.min=0;
						}
					if(property=="utagteiler"){
							inp.type="number";//
							inp.step=0.5;
							inp.min=0.5;
							inp.max=1;
						}
					
					if(typeof(std[property])=='boolean'){
							inp.type="checkbox";
							inp.checked=std[property];
						}
					
					if(property=="dat" && !datumeditable) inp.readOnly=true;//außer Feiertage!
					if(property=="user")inp.readOnly=true;
					projinputs.push(inp);
					if(projektaktiv.id=="urlaub" && (property=="stunden" || property=="typ")){
						td2.style.display="none";
					}
				}	


				
				td2=cE(tr2,"th");
				htmlNode=cE(td2,"a",undefined,"button buttdel");
				htmlNode.innerHTML=getWort("buttdel");
				htmlNode.href="#";
				htmlNode.data={"typ":"stunde","datstunde":std ,"projektdata":projekt,"zeilenode":td};
				htmlNode.onclick=delStunde;
				
				ujahralt=ujahr;
			};
			
			
			if(stundengesammt>0){
				htmlNode=cE(basis,"p");
				htmlNode.innerHTML=getWort("gesammtstunden")+': '+stundengesammt;
				
				var planstunden=projekt.info.geplantestunden;
				if(planstunden>0){
					htmlNode=cE(basis,"p");
					tmp=getWort("reststunden")+': '+(planstunden-stundengesammt);
					
					if(lokalData.stundenproArbeitstag!=undefined){
						tmp+=" ("+getWort("circa")+" "+Math.floor((planstunden-stundengesammt)/lokalData.stundenproArbeitstag)+getWort("dattage")+")";
					}
					
					htmlNode.innerHTML=tmp;
						
				}
			
				
			}
			
			for(i=0;i<projinputs.length;i++){
				if(projinputs[i].readOnly!=true){
					projinputs[i].addEventListener('keyup' ,changeActivityInput);
					projinputs[i].addEventListener('change',changeActivityInput);
					//console.log(projinputs[i].type);//number,text,checkbox
				}
				//sendMSG("scramble",projinputs[i]);
			}
			
			
		}
		
		var changeActivityInput=function(e){//'keyup'/'change'
			var val=this.value;
			if(this.type=="checkbox")val=this.checked;
	
			//test ob sich der Wert geändert hat (sonst wurde er schon gespeichert)
			var istanders=!((this.data.node[this.data.nodeid]+'')==(val+''));
			if(this.type=="checkbox")istanders=true;
			if(e.type=="keyup" && e.keyCode==13)istanders=true;
			if(!istanders)return;
			
			//'[object Array]' '[object String]'  '[object Number]' 
			//neu abspeichern
			var dtyp=getDataTyp(this.data.node[this.data.nodeid]);
			if( dtyp=== '[object Array]'){
				this.data.node[this.data.nodeid]=val.split(',');//in Array wandeln, Trenner ist ein Komma
			}
			else
			if( dtyp=== '[object Number]'){
				if(isNaN(parseFloat(val)))val=0;
				this.data.node[this.data.nodeid]=parseFloat(val); //Number
			}
			else
			if( dtyp=== '[object Boolean]'){					//boolean
				this.data.node[this.data.nodeid]=val;
			}
			else{
				this.data.node[this.data.nodeid]=decodeString(val); //String
			}
			
			if(this.data.o_sibling.timer!=undefined){console.log("clear timer ");
				clearTimeout(this.data.o_sibling.timer);
				this.data.o_sibling.timer=undefined;
			}
			addClass(this,"isedit");
			
			if(this.data.typ=="stunde"){//stundeneintrag wurde geändert
				if(e.type=="keyup" && e.keyCode==13){
					sendstundendatatimer(this);				
				}
				else{
					//sonst etwas warten fals noch weitere Eingaben kommen
					//send projektdate/stundendata
					this.data.o_sibling.timer=setTimeout(sendstundendatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
				}
			}
			if(this.data.typ=="info"){
				//infoblock hat sich geändert
				if(e.type=="keyup" && e.keyCode==13 || this.type=="checkbox"){
					sendinfodatatimer(this);				
				}
				else{
					this.data.o_sibling.timer=setTimeout(sendinfodatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
				}
			}
			if(this.data.typ=="titel"){
				//neuer Titel
				if(e.type=="keyup" && e.keyCode==13){
					sendtiteldatatimer(this);				
				}
				else{
					this.data.o_sibling.timer=setTimeout(sendtiteldatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
				}
			}
			
		}
		
		var sendtiteldatatimer=function(input){
			var i,value;
			//editmarker entfernen
			for(i=0;i<input.data.o_sibling.elemente.length;i++){
				subClass(input.data.o_sibling.elemente[i],"isedit");
			}
			//nur den neuen titel senden
			value=input.data.node.titel;
			postNewData("projekttitelupdate",{"projektdata": input.data.projektdata, "daten": {'titel':value} });
		}		
		
		var sendinfodatatimer=function(input){
			var i;
			//editmarker entfernen
			for(i=0;i<input.data.o_sibling.elemente.length;i++){
				subClass(input.data.o_sibling.elemente[i],"isedit");
			}
			
			//console.log("POST info",input.data);
			postNewData("projektinfoupdate",{"projektdata": input.data.projektdata, "daten": input.data.node });//data.node=info.
		}
		
		var sendstundendatatimer=function(input){
			var i;
			//editmarker entfernen
			for(i=0;i<input.data.o_sibling.elemente.length;i++){
				subClass(input.data.o_sibling.elemente[i],"isedit");
			}	
			//nur der Eintrag wird gesendet, bzw. geändert! Nicht alle Daten werden gespeichert!
			postNewData("projektstundenlisteupdate",{"projektdata": input.data.projektdata, "daten": input.data.datstunde});
		}
		
		var clickJahrschalter=function(e){
			var i,node,modezeigen=false,
				liste=this.data.tab.getElementsByClassName("tr_"+this.data.j);
				
			for(i=0;i<liste.length;i++){
				node=liste[i];
				if(istClass(node,"ausgeblendet"))
					subClass(node,"ausgeblendet");
				else{
					addClass(node,"ausgeblendet");
					modezeigen=true;
				}
			}
			
			if(modezeigen)
				this.innerHTML=this.data.t1+" "+this.data.j;
			else
				this.innerHTML=this.data.t2+" "+this.data.j;
			
			e.preventDefault() ;
		}
		
		var delStunde=function(e){//Button:Stundeneintrag löschen
			//console.log("delStunde",this.data);
			var i,std,newList=[];
			
			//web+electron
			if(confirm(getWort("deleteeintrag"))){
				this.data.datstunde.deleting=true;
					
				postNewData("projektstundenlisteupdate",{"projektdata": this.data.projektdata, "daten": this.data.datstunde });
				//Listenelement löschen
				for(i=0;i<this.data.projektdata.stunden.length;i++){
					std=this.data.projektdata.stunden[i];
					if(std.deleting===true){}
						else
							newList.push(std);
				}
				this.data.projektdata.stunden=newList;
				
				//HTMLNode löschen
				var parentnode=this.data.zeilenode;
				parentnode.parentNode.removeChild(parentnode);
			}
			
			e.preventDefault();
		}
		
		var postNewData=function(befehl,data){
			//console.log("postNewData:",befehl,data.projektdata.id);//id=dateiname
			var sdata="id="+data.projektdata.id
					+"&data="+JSON.stringify(data.daten);

			loadData(befehl,parseNewdataRE,"POST",encodeURI(sdata));//befehl="projektstundenlisteupdate"
		};		
		
		var parseNewdataRE=function(data){
			data=JSON.parse(data);
			//check error
			if(data.status!=undefined){
				if(data.status!=msg_OK)
					handleError(data.status);
				else{
					statusDlg.show("",getWort("aenderungsaved"),"statok");
					if(data.lastaction!=undefined && data.lastaction=="projekttitelupdate")
						sendMSG("reloadprojektlist",undefined);
				}
			}
			//OK
		}
		
	}
	
	var Projektliste=function(zielnode,optionen){//Liste der Projekte
		var ziel=zielnode;
		var basis=undefined;
		var selectedProjekt=undefined;
		var optionsplane=undefined;
		var _this=this;
		var connects=[];
		var filter=[];//Projektnamen nicht anzeigen
		
		var projekte=undefined;
		var lastfilter=undefined;		
		
		this.ini=function(){//create
			basis=cE(ziel,"div",undefined,"projektliste");
		}
		this.destroy=function(){}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			if(s=="addTag"){ //Tag & Projekt sind ausgewählt
				//add Tag/Stunden zum Projekt
				if(selectedProjekt!=undefined){//StundenTag dem Projekt hinzufügen
					addTag(data);
				}
			}
			if(s=="selectTag"){//Tag ausgewählt
				if(selectedProjekt!=undefined){//Wenn Projekt ausgewählt
					addTag(data); //StundenTag zum Projekt hinzufügen
				}
			}
			if(s=="deselect"){
				deselect();
			}
			if(s=="allProjektsloaded"){
				parsedata(data.projekte,lastfilter);
			}
			if(s=="selectFilterJahr"){//data=string|int "alle"|2016
				lastfilter=data;
				parsedata(projekte,data);
			}
			if(s=="selectFilterBeendet"){//data=true|false
				parsedata(projekte,lastfilter);
			}
		}
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		this.setfilter=function(arr){//bestimmte Projekte nicht anzeigen ["Feiertage"]
			filter=arr;
		}
		
		var createNewProjektButt=function(ziel){
			var ini=function(){
				var HTMLnode,inp;
				var zeile=cE(ziel,"div");
				inp=cE(zeile,"input",undefined,"inp_newpro");
				inp.type="text";
				inp.placeholder=getWort("inp_newProj");
				inp.addEventListener('keydown',keydownnewPro);
				
				HTMLnode=cE(zeile,"a",undefined,"button optbutt");
				HTMLnode.href="#";
				HTMLnode.data={"inp":inp};
				HTMLnode.innerHTML=getWort("butt_newProj");
				HTMLnode.addEventListener('click',bklicknewPro);
			}
			
			var createNewProjekt=function(name){
				if(name!=null){
					if(name==""){
						statusDlg.show("Fehler",getWort('mesage_inputnamenoinput'));
						//alert(getWort("mesage_inputnamenoinput"));
					}
					else
					if(name.length<3){
						statusDlg.show("Fehler",getWort('mesage_inputnamekurz'));
						//alert(getWort("mesage_inputnamekurz"));
					}
					else{
						sendMSG("createnewprojekt","newdata="+name);
					}
				}
			}
			
			var keydownnewPro=function(e){
				if(e.keyCode==13)createNewProjekt(this.value);
			}
			
			var bklicknewPro=function(e){
				createNewProjekt(this.data.inp.value);
				e.preventDefault()
			}
			
			ini();
		}
		
		var createNewNamensFilter=function(ziel,table){
			var inpnode;
			
			this.filterInit=function(){
				if(suchfilterbegriff.length>0){
					filtern(suchfilterbegriff);
				}
			}
			
			var ini=function(){
				var zeile=cE(ziel,"div");
				
				inpnode=cE(zeile,"input",undefined,"inp_filternamen");
				inpnode.type="text";
				inpnode.value=suchfilterbegriff;
				inpnode.placeholder=getWort("inp_filternamen");
				inpnode.addEventListener('keyup',keydownfilter);
				
				var HTMLnode=cE(zeile,"a",undefined,"button optbutt clearbutt");
				HTMLnode.href="#";
				HTMLnode.innerHTML=("x");
				HTMLnode.addEventListener('click',resetclick);
			}
			var resetclick=function(e) {
				inpnode.value="";
				filtern("");
				e.preventDefault();
			}
			
			var getinnerhtml=function(node){
				var nl=node.children;
				if(nl!=undefined && nl.length>0)
					return getinnerhtml(nl[0]);
				else
					return node.innerHTML;
			}
			
			var filtern=function(filtertext){
				suchfilterbegriff=filtertext;
				var tbody=table.getElementsByTagName("tbody")[0];
				var anzahl=0;
				filtertext=filtertext.toLowerCase();
				
				if(tbody){
					var i,trCN,tds,tr,
						projektname,kundenname,
						trs=tbody.getElementsByTagName("tr"),
						filtern=filtertext.length>0;
					
					for(i=0;i<trs.length;i++){
						tr=trs[i];
						tds=tr.getElementsByTagName("td");
						projektname=getinnerhtml(tds[0]).toLowerCase();
						kundenname=tds[1].innerHTML.toLowerCase();
						
						if(	projektname.indexOf(filtertext)>-1 
							|| kundenname.indexOf(filtertext)>-1 
							|| !filtern)
						{
							tr.style.display="";
							anzahl++;
						}else{
							tr.style.display="none";
						}
					}
					
					if(anzahl==0){
						addClass(inpnode,"notfound");
					}
					else{
						subClass(inpnode,"notfound");
					}
					
				}
				//table->tbody->tr ->className
			}
			
			var keydownfilter=function(e){
				filtern(this.value);
			}
			
			ini();
		}
		
		
		var isinfilter=function(data){
			var i,re=false;
			for(i=0;i<filter.length;i++){
				if(data.name==filter[i])re=true;
			}
			
			if(lokalData.zeigebeendete!=undefined){
				if(lokalData.zeigebeendete===false){
					if(	data.data!=undefined && 
						data.data.info!=undefined &&						
						data.data.info.isended!=undefined)
					{
						if(data.data.info.isended==true)
							re=true;
					}
					//console.log(data);
				}
			}
			
			return re;
		}
		
		var addTag=function(data){
			sendMSG("addProjekt",selectedProjekt);
			sendMSG("deselect",undefined);
			deselect();
		}
				
		var parsedata=function(data,jahrfilter){
			var i,t,o,p,a,htmlNode,table,tr,td,th1,th2,th3,eintragen,std
				,thead,tbody;
			
			basis.innerHTML="";
			projekte=data;
			if(data==undefined)return;
			
			//data-sort
			var sortliste=data;
			var filterobj=undefined;
			var c1="";
			var c2="";
			var c3="";
			var sortrichtung="";
			if(lokalData.settings_projektliste==undefined){
				lokalData.settings_projektliste={updown:"up",sortby:"projekte"}
			}
			if(lokalData.settings_projektliste.updown=="up"){
				sortrichtung="sortiere+"
			}else{
				sortrichtung="sortiere-"
			}
			
			if(lokalData.settings_projektliste.sortby=="projekte"){
				c1+="sortierbar"+sortrichtung;
				c2+="sortierbar";
				c3+="sortierbar";
				//c3+="plistdat "+sortrichtung;
			}else
			if(lokalData.settings_projektliste.sortby=="kunde"){
				c1+="sortierbar";
				c2+="sortierbar "+sortrichtung;
				c3+="sortierbar ";
			}
			else{
				c1+="sortierbar";
				c2+="sortierbar";
				c3+="sortierbar"+sortrichtung;
			}
			
			optionsplane=cE(basis,"div",undefined,"listactions");
			table=cE(basis,"table");
			
			if(optionen.namensfilter===true)
				filterobj=new createNewNamensFilter(optionsplane,table);
			
			if(optionen.createprojektbutt===true)
				new createNewProjektButt(optionsplane);
				
			//Ergebnis
			addClass(table,"sortierbar");
			thead=cE(table,"thead");
			tr=cE(thead,"tr");
			th1=cE(tr,"th",undefined,c1);//
			th1.innerHTML=getWort('projekte');
			th2=cE(tr,"th",undefined,c2);
			th2.innerHTML=getWort('kunde');
			th3=cE(tr,"th",undefined,c3);
			th3.innerHTML=getWort('datum');
			
			tbody=cE(table,"tbody");
			for(i=0;i<sortliste.length;i++){
				o=sortliste[i];
				o.date=getdatumsObj(o.pro.dat);
				eintragen=!isinfilter(o);//Filter by Art
				
				if(o.data==undefined || o.data.stunden==undefined)
				{
					console.log("keine Stunden",o);
					eintragen=false;
				}
				else{						
					if(eintragen && jahrfilter!=undefined && jahrfilter!="alle"){
						
						eintragen=o.data.stunden.length>0;
						//gucken ob Stunden passend zum Filter da sind, dann Eintrag zeigen
						for(t=0;t<o.data.stunden.length;t++){
							std=o.data.stunden[t];
							a=parseInt(std.dat.split('-')[0]);
							if(!isNaN(a)){
								if(jahrfilter==a)eintragen=true;
							}
						}
					}						
					if(o.data.stunden.length==0)eintragen=true;
				}
				
				if(eintragen){
					if(o.data.info.auftraggeber==undefined)o.data.info.auftraggeber="";
					
					tr=cE(tbody,"tr",undefined,"pltr_"+o.id);
					tr.data=o;		
					addClass(tr,clearNewDateiname(o.data.info.auftraggeber));
					
					if(o.data.info.farbe!=undefined){
						if(o.data.info.farbe.length>3){
							var f=stringfarbeToRGB(o.data.info.farbe);
							tr.style.backgroundColor="rgba("+f.r+","+f.g+","+f.b+",0.2)";
						}
					}
					
					
					td=cE(tr,"td",undefined,"pltd_"+o.id);				
					a=cE(td,"a",undefined,"pla_"+o.id);
					a.data=o;
					a.innerHTML=encodeString(o.data.titel);
					a.href="#";
					a.onclick=klickProj;
					
					if(	o.data!=undefined && 
						o.data.info!=undefined &&						
						o.data.info.isended!=undefined)
					{
						if(o.data.info.isended==true)
						{
							addClass(a,"projektistbeendet");
						}
					}
					
					//sendMSG("scramble",a);
					o.anode=a;
					o.trnode=tr;
					
					td=cE(tr,"td");
					td.innerHTML=o.data.info.auftraggeber;//console.log(">",o);
					
					td=cE(tr,"td");	
					htmlNode=cE(td,"span");
					htmlNode.innerHTML=convertToDatum(encodeString(o.pro.dat.split(' ')[0]));
				}
			}
			new JB_Table(table);
			
			htmlNode=th1.getElementsByTagName('button')[0];
			if(htmlNode!=undefined){
				htmlNode.addEventListener('click',clicksortButt);
				htmlNode.id="sort_projekte";
				htmlNode=th2.getElementsByTagName('button')[0];
				htmlNode.addEventListener('click',clicksortButt);
				htmlNode.id="sort_kunde";
				htmlNode=th3.getElementsByTagName('button')[0];
				htmlNode.addEventListener('click',clicksortButt);
				htmlNode.id="sort_datum";
			}
			if(filterobj!=undefined)filterobj.filterInit();
		}
		
		var clicksortButt=function(e){
			var name=this.id;
				name=name.split('_')[1];//"sort_projekte" -> "projekte"
			var isup=istClass(this,'sortsym_up');
			var updown="down";
			if(isup)updown="up";
			
			lokalData.settings_projektliste={sortby:name, updown:updown};
			saveOptionen(false);
		}
		
		var deselect=function(){
			subClass(selectedProjekt.trnode,"p_aktiv");
			selectedProjekt=undefined;
		}
		
		var klickProj=function(e){
			var waraktiv=istClass(this.data.trnode,"p_aktiv");
			if(selectedProjekt!=undefined)
				subClass(selectedProjekt.trnode,"p_aktiv");
			if(waraktiv){
				selectedProjekt=undefined;
				statusDlg.show("","");
				return false
				}
			selectedProjekt=this.data;			
			addClass(this.data.trnode,"p_aktiv");
			
			sendMSG("selectProjekt",this.data);
			return false;
		}
	}
	
	var Monatsliste=function(zielnode){
		var ziel=zielnode;
		var basis=undefined;
		var projekte=[];
		var projektepointer=-1;
		var stundenprotag=8;
		if(lokalData.stundenproArbeitstag!=undefined)
				stundenprotag=lokalData.stundenproArbeitstag;
		
		var _this=this;
		var connects=[];
		var tabellendata=[];
		
		var projektedata=undefined;
		var lastfilter=undefined;
		var scrolltoday=false;
		
		this.ini=function(){//create
			tabellendata=[];
			scrolltoday=true;
			basis=cE(ziel,"div",undefined,"monatsliste");
			
		}
		this.destroy=function(){
			
		}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		this.Message=function(s,data){
			//console.log("Monatsliste MSG:",s,data);
			
			if(s=="selectProjekt" && trselect!=undefined){//Projekt ausgewählt nachdem Tag ausgewählt wurde
				//Projekt in Liste eintragen
				sendMSG("addTag",trselect.data);
				statusDlg.show("","");
			}
			if(s=="selectProjekt" && trselect==undefined){
				statusDlg.show("",getWort("selectaday"));
			}
			if(s=="deselect" && trselect!=undefined){ //Daten wurden in Projekt eingetragen, Tagselection aufheben
				deselect();
			}
			if(s=="addProjekt" && trselect!=undefined){
				//Projekt dem Tag hinzufügen
				addnewProjektToMonList(data);
				refreshTab();
			}
			
			if(s=="allProjektsloaded"){//data:Objekt
				projektedata=data.projekte;
				parseListdata(data.projekte,lastfilter);
			}
			if(s=="selectFilterJahr"){//data:string|int
				lastfilter=data;
				parseListdata(projektedata,data);
			}
			if(s=="selectFilterBeendet"){//data=true|false
				//in Monatsliste ignorieren
				//parseListdata(projektedata,lastfilter);
			}
		}
		
		var addnewProjektToMonList=function(data){//neuer Stundeneintrag in Monatsliste
			var id=trselect.data.jahr+'_';
				if(trselect.data.monat<10)id+="0";
				id+=trselect.data.monat+'_';
				if(trselect.data.tag<10)id+="0";
				id+=trselect.data.tag+'-'+data.id;//
			var thetag=trselect.data.jahr+'-';
				if(trselect.data.monat<10)thetag+="0";
				thetag+=trselect.data.monat+'-';
				if(trselect.data.tag<10)thetag+="0";
				thetag+=trselect.data.tag;
				
			var a,inp,selectlist,slistopt,defaulttyp="R";
			var HTMLnode=gE(id);
			if(HTMLnode==undefined && data.data!=undefined){
				
				if(data.data.info!=undefined && data.data.info.defaulttyp!=undefined){
					defaulttyp=data.data.info.defaulttyp;
				}
				
				var stagstundeneintrag={
					"dat":thetag,
					"kommentar":"",
					"stunden":0,
					"typ":defaulttyp,					
					"user":globaldata.user
				};
				
				data.data.stunden.push(stagstundeneintrag);
				
				var newdata={
							"id":id,
							"data":{"projektdata":data.data},
							"titel":data.data.titel,
							"datstd":stagstundeneintrag
							};
				
				if(data.id=="urlaub"){
//TODO: urlaub im Tab urlaub händeln!					
					
					var datum=new Date(),			//getdatumsObj(data.pro.dat),
						jahr=datum.getFullYear();
					
						 				
					stagstundeneintrag.typ="U";
					
					//stagstundeneintrag.stack="U";
					stagstundeneintrag.vonjahr=jahr;
					//stagstundeneintrag.tag=getresturlaubstage(data);//halbe tage "2.5" "2.5" = "2" 
			
					//utagteiler
					
					stagstundeneintrag.kommentar=getresturlaubstage(data)
										+" von "
										+lokalData.urlabstageprojahr;
										//+' ('+jahr+')';
								
					}
				if(data.id=="feiertage"){
					stagstundeneintrag.typ="F";
					stagstundeneintrag.kommentar="";					
					}
				
				createProjektItem(trselect.data.node_data,newdata);
				
				postNewStundenData({"typ": "new", 
						"projektdata": data.data, 
						"datstunde": stagstundeneintrag});
				
			}
		}
		
		var getresturlaubstage=function (dat) {
			var i,st,y,kom,
				gesetzt=0,utpj=lokalData.urlabstageprojahr,
				jahr=dateheute.getFullYear();
				
//Problem: halbe Urlaubstage
//Resturlaub
			
			for(i=0;i<dat.data.stunden.length;i++){
				st=dat.data.stunden[i];
				y=parseInt(st.dat.split("-")[0]);//in welchem Jahr eingetragen
				
				kom=st.kommentar;
				//$tag von $gesammt ($vonjahr)
				if(kom.indexOf("(")>-1 && 
					kom.indexOf(")")>-1 &&
					kom.indexOf(" von ")>-1				
				) {
					var yy=parseInt(kom.split("(")[1].split(")")[0]);
					if(jahr==yy)gesetzt++;
					console.log(kom)
				}
				else
				if(st.vonjahr!=undefined){
					if(jahr==st.vonjahr)gesetzt++;
				}
			}
			
			if(gesetzt>0){
				return gesetzt+1;	
			}
		
			return "";
		}
		
		var createProjektItem=function(ziel,data){//HTMLNode in Liste erzeugen
			var a,inp,HTMLnode,tmp;
			if(gE(data.id)!=undefined)return;//ist schon drinn
			
			var isturlaub=data.datstd.typ.indexOf("U")>-1;
			var istfeiertag=data.datstd.typ.indexOf("F")>-1;
			
			//css auf tr
			if(isturlaub)
				addClass(ziel.parentNode,"urlaub");
				else
			if(istfeiertag)
				addClass(ziel.parentNode,"feiertag");
				else
				addClass(ziel.parentNode,"hatdata");
			
			addClass(ziel.parentNode,"tr_"+data.data.projektdata.id);
			
			
			var o_sibling={
					timer:undefined,
					elemente:[]
				}
			
			HTMLnode=cE(ziel,"div",data.id, "projektitem");
			addClass(HTMLnode,data.data.projektdata.info.auftraggeber);

			if(isturlaub)addClass(HTMLnode,"urlaubtext");
			if(istfeiertag)addClass(HTMLnode,"feiertagtext");
			
			tmp=data.data.projektdata.id;//.split('_')[0];
			addClass(HTMLnode,tmp);//console.log("classe>",tmp);//projektitem
			
			a=cE(HTMLnode,"a");
			a.innerHTML=encodeString(data.titel);//.titel			
			
			a.href="#";
			a.data={"typ":"a","projektdata":data.data.projektdata,"datstunde":data.datstd};
			a.onclick=klickProjektInListe;
			a.addEventListener('click',blockclick);
			
			if(data.data.projektdata.info.farbe!=undefined){
				if(data.data.projektdata.info.farbe.length>3){
					var f=stringfarbeToRGB(data.data.projektdata.info.farbe);
					a.style.backgroundColor="rgba("+f.r+","+f.g+","+f.b+",1)";
					
					HTMLnode.style.backgroundColor="rgba("+f.r+","+f.g+","+f.b+",0.2)";
				}
			}
			
			HTMLnode.data={
				"item":data,
				"inputStunden":undefined//zum Stundenzusammenzählen (pro Tag/Monat)
			}
			
			
			inp=cE(HTMLnode,"input",undefined,"inputKommentar");
			inp.title=getWort("Kommentar");
			inp.value=encodeString(data.datstd.kommentar);
			inp.data={"typ":"komm",		"projektdata":data.data.projektdata,"datstunde":data.datstd,"nodeid":"kommentar","o_sibling":o_sibling};
			inp.addEventListener('click',blockclick);
			//inp.addEventListener('change',changeActivityInput);
			inp.addEventListener('keyup',changeActivityInput);
			o_sibling.elemente.push(inp);
			
//todoUrlaub: statt kommentar generieren: "3 von 28 (2019)"	
//				halbe Urlaubstage!		
			
			
			inp=cE(HTMLnode,"input",undefined,"inputArt");
			inp.value=encodeString(data.datstd.typ);
			inp.title=getWort("worktyp");
			inp.data={"typ":"art",		"projektdata":data.data.projektdata,"datstunde":data.datstd,"nodeid":"typ","o_sibling":o_sibling};
			inp.addEventListener('click',blockclick);
			//inp.addEventListener('change',changeActivityInput);
			inp.addEventListener('keyup',changeActivityInput);
			o_sibling.elemente.push(inp);
			
			inp=cE(HTMLnode,"input",undefined,"inputStunden");
			inp.value=encodeString(data.datstd.stunden);
			inp.title=getWort("Stunden");
			inp.data={"typ":"stunden",	"projektdata":data.data.projektdata,"datstunde":data.datstd,"nodeid":"stunden","o_sibling":o_sibling};
			inp.addEventListener('click',blockclick);
			inp.type="number";
			inp.step=0.01;
			inp.min=0;
			inp.addEventListener('change',changeActivityInput);
			inp.addEventListener('keyup',changeActivityInput);
			o_sibling.elemente.push(inp);
			HTMLnode.data.inputStunden=inp;//zum Stundenzusammenzählen verknüpfen
			
			//sendMSG("scramble",HTMLnode);
		}
		
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		var montabzeit=undefined;
		var parseListdata=function(data,jahrfilter){
			var i,div,monatdata,a;
			if(data==undefined)return;

			basis.innerHTML="";
			projekte=data;

			projektepointer=-1;
			var Zeitjetzt = new Date();	
			Zeitjetzt.setDate(1);
			if(jahrfilter!=undefined && jahrfilter!="alle"){
				Zeitjetzt.setFullYear(jahrfilter);			//Tabelle in diesem Jahr beginnen
			}
			
			var Monat=Zeitjetzt.getMonth()-1;
			Zeitjetzt.setMonth(Monat);
			
			div=cE(basis,"div");
			a=cE(div,"a",undefined,"button viewothermon");
			a.href="#";
			a.addEventListener('click',buttaddMonatsview);
			a.innerHTML=getWort("butt_viewpreMon")+' '+getWort(MonatsnameID[Zeitjetzt.getMonth()])+' '+Zeitjetzt.getFullYear();
			a.data={"ziel":div,"richtung":-1,"zeit":Zeitjetzt};
			
			
			div=cE(basis,"div");
			Zeitjetzt = new Date();	
			if(jahrfilter!=undefined && jahrfilter!="alle"){
				Zeitjetzt.setFullYear(jahrfilter);			//Tabelle in diesem Jahr beginnen
			}
			
			montabzeit=Zeitjetzt;
			tabellendata.push(createMonattab(div,Zeitjetzt.getMonth()+1,Zeitjetzt.getFullYear(),montabzeit));//Tabelle aufbauen
			
			Zeitjetzt.setDate(1);
			Monat=Zeitjetzt.getMonth()+1;
			Zeitjetzt.setMonth(Monat);
			div=cE(basis,"div");
			a=cE(div,"a",undefined,"button viewothermon");
			a.href="#";
			a.addEventListener('click',buttaddMonatsview);
			a.innerHTML=getWort("butt_viewnexMon")+' '+getWort(MonatsnameID[Zeitjetzt.getMonth()])+' '+Zeitjetzt.getFullYear();
			a.data={"ziel":div,"richtung":1,"zeit":Zeitjetzt};
			
			
			
			projektToTables();
			refreshTab();
		};
		
		var buttaddMonatsview=function(e){
			var ziel=this.data.ziel,
				richtung=this.data.richtung,
				Zeitjetzt=this.data.zeit,
				platzhalter,a,tabdiv,Monat;
			ziel.innerHTML="";
			
			if(richtung==-1)platzhalter=cE(ziel,"div");
			tabdiv=cE(ziel,"div");
			if(richtung==1)platzhalter=cE(ziel,"div");
			
			//create tab to: tabdiv
			tabellendata.push(createMonattab(tabdiv,this.data.zeit.getMonth()+1,this.data.zeit.getFullYear(),montabzeit ) );
			
			Monat=Zeitjetzt.getMonth()+richtung;
			Zeitjetzt.setMonth(Monat);
			
			a=cE(platzhalter,"a",undefined,"button viewothermon");
			a.href="#";
			a.addEventListener('click',buttaddMonatsview);
			if(richtung==1){
				a.innerHTML=getWort("butt_viewnexMon")+' '+getWort(MonatsnameID[Zeitjetzt.getMonth()])+' '+Zeitjetzt.getFullYear();
			}
			else{
				a.innerHTML=getWort("butt_viewpreMon")+' '+getWort(MonatsnameID[Zeitjetzt.getMonth()])+' '+Zeitjetzt.getFullYear();
			}
			
			a.data={"ziel":platzhalter,"richtung":richtung,"zeit":Zeitjetzt};				
				
			
			projektToTables();//Projekteitems eintragen
			refreshTab();
			return false;
		}
		
		var projektToTables=function(){
			var ip,i,o,data,s,HTMLnode,newdata;
			
			for(ip=0;ip<projekte.length;ip++){
				data=projekte[ip].data;
				//Stunden vorhandener Projekte in Tabelle eintragen
				if(data!=undefined)				
				if(data.stunden!=undefined)				
				for(i=0;i<data.stunden.length;i++){
					o=data.stunden[i];
					if(o!=null){
						s="trid"+o.dat;
						HTMLnode=gE(s);//tr
						if(HTMLnode!=undefined){
							//add
							newdata={
										"id":o.dat.split('-').join('_')+"-"+data.id,
										"data":{"projektdata":data},
										"titel":data.titel,
										"datstd":o
									};
							createProjektItem(HTMLnode.data.node_data,newdata);
						};
					}
				};
			}
			
		}
		
		var trselect=undefined;
		var createMonattab=function(zielHTML,Monat,Jahr,heute){//Monat 1..12
			var i,t,y,s;
			var tab,tr,th,td,inp,h3,span;
			
			var data={"tabtrtage":[],"node_geammt":undefined,"sollStundenproMon":0};
			
			//var oTag,oProjekt;
			//
			var Zeit = new Date(Jahr,Monat-1,1);
			var heuteReal = new Date();
			
			//Anzahl der Tage im Monat und mit welchem Wochentag der Monat anfängt
			var Start = Zeit.getDay();//0=Monatg
			if(Start > 0) 
						Start--;
					else 
						Start = 6;
			//Anzahl der Tage im Monat ermitteln
			var tageimMonat =getMonatstage(Monat,Jahr);// =31;
			//Monat--;
			/*if(Monat==4 ||Monat==6 || Monat==9 || Monat==11 ) --tageimMonat;//30
			if(Monat==2){
				 if(Jahr%4==0) tageimMonat-=2;		
				 if(Jahr%100==0) tageimMonat--;		
				 if(Jahr%400==0) tageimMonat++;		
				}*/
			//console.log(tageimMonat);	
			//Ausgabe
				
			h3=cE(zielHTML,"h2");
			h3.innerHTML=getWort(MonatsnameID[Monat-1])+' '+Jahr;
			h3.className="montabeh";
				
			var tabheadtext		=["Tag","Monat","Projekte","stdtaggesammt"];
			
			var spalten=tabheadtext.length;//Tag|Monat
			var sollStundenproMonat=0;
			var sollsundenproTag=8;
			
			tab=cE(zielHTML,"table");
			tab.className="monatstabelle";
			for(i=0;i<tageimMonat+1;i++){
				tr=cE(tab,"tr");
				if(i==0){//Head
					for(t=0;t<spalten;t++){
							th=cE(tr,"th");
							th.innerHTML=getWort(tabheadtext[t]);
							th.className="tabgrau sp"+t;
						}
				}
				else{//Tage/monat/Daten/Stunden pro Tag
					tr.data={
						"node_data":undefined,
						"node_stdTag":undefined,
						"stundenprotag":0,
						"iswochenende":false,
						"wochentag":Start,
						"tag":i,
						"monat":Monat,
						"jahr":Jahr
						};
					tr.addEventListener('click',clickTRMonYearTD);
					
					s="trid"+Jahr+'-';
					if(Monat<10)s+='0';
					s+=Monat+'-';
					if(i<10)s+='0';
					s+=i;
					tr.id=s;
					
					data.tabtrtage.push(tr);
					if(heuteReal.getDate()==i && heuteReal.getMonth()==Monat-1 && heuteReal.getFullYear()==Jahr){
						addClass(tr,"heute");
						}
					addClass(tr,"tag_"+wochentagID[Start]);
					
					
					if(Start>4){
							addClass(tr,"wochenende");
							tr.data.iswochenende=true;
							}
							
					if(lokalData.wochenarbeitstage!=undefined)
					if(lokalData.wochenarbeitstage[Start]==="true" || 
						lokalData.wochenarbeitstage[Start]===true)
						{
							if(!istClass(tr,"urlaub"))
								sollStundenproMonat+=sollsundenproTag;
						}else{
						  if(Start<5)addClass(tr,"keinarbeitstag");
						}
					
					
					for(t=0;t<spalten;t++){
							td=cE(tr,"td");
							
							if(tabheadtext[t]=="Tag"){
								td.innerHTML=i;
								td.className="tabgrau tag";
								}
							else
							if(tabheadtext[t]=="Monat"){
								td.innerHTML=getWort(MonatsnameID[Monat-1]);
								td.className="monat";
								if(Start==0){
									td.innerHTML=(getKalenderwoche(i,Monat,Jahr))+'.'+getWort('KalWoch');
									addClass(td,"kalwoche");
									}
								}
							else
							if(tabheadtext[t]=="stdtaggesammt"){
								td.innerHTML="";
								td.className="stdTaggesamt";
								tr.data.node_stdTag=td;
								}
							else{
								//Feld für Projektdaten
								tr.data.node_data=td;
								td.className="tddata";
								td.data={"tr":tr};
								//td.addEventListener('click',clickMonYearTD);
							}
					}
					
					Start++;
					if(Start>6)Start=0;
				}	
			}
			data.sollStundenproMon=sollStundenproMonat;
			//GesamtStunden/Monat
			tr=cE(tab,"tr");
			td=cE(tr,"td");
			td.className="stdgesamt";
			td.colSpan=spalten;
			data.node_geammt=td;
			
			return data;
		}
		
		var refreshTab=function(){
			//Stunden zählen
			var i,itd,t,tr,td,HTMLnode,std,gesstd,stundensoll,div,divmi,divbutt;
			var scrolltoPos=0;
			var getScrollToNode=true;
			var scrolltoviewNode=undefined;
			for(itd=0;itd<tabellendata.length;itd++){
				gesstd=0;
				stundensoll=0;
				for(i=0;i<tabellendata[itd].tabtrtage.length;i++){
					tr=tabellendata[itd].tabtrtage[i];
					if(istClass(tr,"heute")){
						getScrollToNode=false;
						if(getScrollToNode==undefined)scrolltoviewNode=tr;
						}
					if(getScrollToNode){scrolltoviewNode=tr;}
					
					if(lokalData.wochenarbeitstage!=undefined)
					if(lokalData.wochenarbeitstage[tr.data.wochentag]==="true" || 
						lokalData.wochenarbeitstage[tr.data.wochentag]===true){
						if(!istClass(tr,"urlaub") && !istClass(tr,"feiertag"))	
							stundensoll+=stundenprotag;					
						}
						
					
					std=0;
					td=tr.data.node_data;
					for(t=0;t<td.childNodes.length;t++){
						HTMLnode=td.childNodes[t];
						if(istClass(HTMLnode,"projektitem")){
							var stunode=HTMLnode.data.inputStunden;
							if(stunode){
								if(!isNaN(parseFloat(stunode.value)))
									std+=parseFloat(stunode.value);
							}
						}
					}
					if(!isNaN(std))tr.data.node_stdTag.innerHTML=Math.round(std*10)/10;
					gesstd+=std;
				}
				
				if(tabellendata[itd].node_geammt!=undefined){
					tabellendata[itd].node_geammt.innerHTML="";
					div=cE(tabellendata[itd].node_geammt,"div",undefined,"divmonauswert");
					
					divbutt=cE(div,"div",undefined,"relativ");
					
					divmi=cE(divbutt,"div",undefined,"moninfos off");
					divmi.innerHTML="*";
					
					HTMLnode=cE(divbutt,"a",undefined,"button monauswert");
					HTMLnode.href="#";
					HTMLnode.innerHTML=getWort("monatsauswertung");
					
					HTMLnode.addEventListener("click",klickMonAuswertung);
					HTMLnode.data={"zieldiv":divmi,"tabellendata":tabellendata[itd]};
					
					HTMLnode=cE(div,"span",undefined,"moninfotext");
					HTMLnode.innerHTML=getWort("stundengesammt")+(Math.floor(gesstd*100)/100)+getWort("stundengesammt2")+stundensoll;
				}
			}
			
			if(scrolltoday){
				if(scrolltoviewNode!=undefined)scrolltoviewNode.scrollIntoView({ behavior: 'smooth' });//behavior bisher nur im FF
				scrolltoday=false;
			}
		}
		
		var klickMonAuswertung=function(e){
			var i,itd,itdc,tab,tr,td,cn,itemdata,property;
			var stundendate=[];
			var monprojekte={};
			this.data.zieldiv.innerHTML="";
			if(istClass(this.data.zieldiv,"off")){
					subClass(this.data.zieldiv,"off");
					addClass(this,"aktiv");
					//items sammeln
					for(i=0;i<this.data.tabellendata.tabtrtage.length;i++){
						tr=this.data.tabellendata.tabtrtage[i];
						for(itd=0;itd<tr.childNodes.length;itd++){
							td=tr.childNodes[itd];
							for(itdc=0;itdc<td.childNodes.length;itdc++){
								cn=td.childNodes[itdc];
								if(istClass(cn,"projektitem")){
									itemdata=cn.data.item;
									stundendate.push(itemdata);
									
								}
							}
						}
						
					}
					//auswerten
					for(i=0;i<stundendate.length;i++){
						itemdata=stundendate[i];
						if(monprojekte[itemdata.data.projektdata.id]==undefined){
							monprojekte[itemdata.data.projektdata.id]={"stunden":itemdata.datstd.stunden,"titel":itemdata.titel}
						}
						else{
							monprojekte[itemdata.data.projektdata.id].stunden+=itemdata.datstd.stunden;
						}
					}
					//anzeigen
					tab=cE(this.data.zieldiv,"table",undefined,"monproausw");
					tr=cE(tab,"tr");
					td=cE(tab,"th");
					td.innerHTML=getWort("projekte");
					td=cE(tab,"th");
					td.innerHTML=getWort("Stunden");
					for( property in monprojekte ) { 
						if(monprojekte[property].stunden>0){
							tr=cE(tab,"tr");
							td=cE(tab,"td");
							td.innerHTML=monprojekte[property].titel;
							td=cE(tab,"td",undefined,"center");
							td.innerHTML=monprojekte[property].stunden;
						}
					};					
				}
				else{
					addClass(this.data.zieldiv,"off");
					subClass(this,"aktiv");
				}
			
			return false;
		}
		
		var clickTRMonYearTD=function(e){
			if(trselect!=undefined){
				subClass(trselect,"aktiv");
				
				if(trselect.id!=this.id){
					addClass(this,"aktiv");
					trselect=this;					
				}else{
					subClass(this,"aktiv");
					trselect=undefined;
					statusDlg.show("","");
				}
				
			}else{
				addClass(this,"aktiv");
				trselect=this;
			}
			//console.log(trselect);
			if(trselect!=undefined){
				if(hatProjekte())
					statusDlg.show("",getWort("selectaprojekt"),"posprojektlist");
					else
					statusDlg.show("",getWort("firstcreateaprojekt"),"posprojektlist");
				sendMSG("selectTag",trselect.data);
				}
			
			
			e.preventDefault();
		}
		
		var clickMonYearTD=function(e){
			if(trselect!=undefined){
				subClass(trselect,"aktiv");
				
				if(trselect.id!=this.data.tr.id){
					addClass(this.data.tr,"aktiv");
					trselect=this.data.tr;					
				}else{
					subClass(this.data.tr,"aktiv");
					trselect=undefined;
					statusDlg.show("","");
				}
				
			}else{
				addClass(this.data.tr,"aktiv");
				trselect=this.data.tr;
			}
			//console.log(trselect);
			if(trselect!=undefined){
				if(hatProjekte())
					statusDlg.show("",getWort("selectaprojekt"),"posprojektlist");
					else
					statusDlg.show("",getWort("firstcreateaprojekt"),"posprojektlist");
				sendMSG("selectTag",trselect.data);
				}
			e.preventDefault();
		}
		
		var deselect=function(){
			if(trselect!=undefined){
				subClass(trselect,"aktiv");
				trselect=undefined;
				statusDlg.show("","");
			}
		}

		var blockclick=function(e){
			e.stopPropagation();
			return false;}
		var klickProjektInListe=function(e){
			var i,delid,lasttyp;
			//dialog zum löschen?
						
			if(confirm(getWort("deleteeintrag"))){//web+electron
				this.data.datstunde.deleting=true;
				delid=this.data.projektdata.id;
				lasttyp=this.data.datstunde.typ;
				postNewStundenData({"typ":"del","projektdata": this.data.projektdata, "datstunde": this.data.datstunde });
				
				//Listenelement löschen
				var std,newList=[];
				for(i=0;i<this.data.projektdata.stunden.length;i++){
					std=this.data.projektdata.stunden[i];
					if(std.deleting===true){}
						else
							newList.push(std);
				}
				this.data.projektdata.stunden=newList;
				
				//HTMLNode löschen
				var parentnode=this.parentNode;
				var tr=parentnode.parentNode.parentNode;
				parentnode.parentNode.removeChild(parentnode);
				
				//CSS im TR zurücksetzen
				subClass(tr,delid);
				subClass(tr,"tr_"+delid);
				if(lasttyp=="U")subClass(tr,"urlaub");
				if(lasttyp=="F")subClass(tr,"feiertag");
				
				//daten aktualisieren
				refreshTab();
			};
			return false;
		}
		var changeActivityInput=function(e){
			//console.log(e);
			//Edit Stundeneintrag
			var val=this.value;//"123," ->Fehler!  ->inputKommentar
			
			var istanders=!((this.data.datstunde[this.data.nodeid]+'')==(val+''));
			if(e.type=="keyup" && e.keyCode==13)istanders=true;			
			if(!istanders)return;
			
			//'[object Array]' '[object String]'  '[object Number]' 
			//neu abspeichern, NAch Datentyp wandeln
			var dtyp=getDataTyp(this.data.datstunde[this.data.nodeid]);
			
			if(this.data.typ=="komm")dtyp=== '[String]';
			
			
			if( dtyp=== '[object Array]'){
				this.data.datstunde[this.data.nodeid]=val.split(',');//in Array wandeln, Trenner ist ein Komma
			}
			else
			if( dtyp=== '[object Number]'){
				if(isNaN(parseFloat(val)))val=0;
				this.data.datstunde[this.data.nodeid]=parseFloat(val); //Number
			}
			/*else
			if( dtyp=== '[object Boolean]'){
				
			}*/
			else{
				this.data.datstunde[this.data.nodeid]=decodeString(val); //String oder was anderes
			}
			
			if(this.data.o_sibling.timer!=undefined)clearTimeout(this.data.o_sibling.timer);
			
			
			addClass(this,"isedit");
			
			if(e.type=="keyup" && e.keyCode==13){//wenn Enter direkt senden (speichern)
				sendstundendatatimer(this);
			}
			else{
				//sonst etwas warten pb noch weitere Eingaben kommen
				//send projektdate/stundendata
				this.data.o_sibling.timer=setTimeout(sendstundendatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
			}
			refreshTab();
		}
		
		var sendstundendatatimer=function(input){
			var i;
			//editmarker entfernen
			for(i=0;i<input.data.o_sibling.elemente.length;i++){
				subClass(input.data.o_sibling.elemente[i],"isedit");
			}	
			postNewStundenData(input.data);
		}
		
		var postNewStundenData=function(data){
			/*einzelner Tages-Datensatz:
				datstunde:
					dat: "2019-08-28"
					kommentar: " von 28 (2019)"
					stunden: 0
					typ: "U"
					user: "andreas"
					vonjahr: 2019
				
				
				projektdata:
					id: "urlaub"
					info: Object ...
					stunden: Array ...
					titel: "Urlaub"
			*/
			console.log("postNewStundenData:",data);//.typ .data .id
			
			var sdata="id="+data.projektdata.id
					+"&data="+JSON.stringify(data.datstunde);

			loadData("projektstundenlisteupdate",parseNewStundendata,"POST",encodeURI(sdata));
		}
		var parseNewStundendata=function(data){
			var i,o,s,HTMLnode,newdata;
			//data=JSON.parse(data);
			data=parseJSON(data);
			//console.log("-->",data);
			
			//check error
			if(data.status!=undefined){
				if(data.status!=msg_OK)
					handleError(data.status);
				else{
					statusDlg.show("",getWort("aenderungsaved"),"statok");
				}
			}
			//OK
		}
		
	}

	var Progeinstellungen=function(zielnode){
		var ziel=zielnode;
		var basis=undefined;
		var _this=this;
		var connects=[];
		
		this.ini=function(){//create
			basis=cE(ziel,"div",undefined,"progeinstellungen");
		}
		this.destroy=function(){}
		this.connect=function(objekt){
			if(objekt!=undefined)
				connects.push(objekt);
			return _this;
		}
		
		this.Message=function(s,data){
			if(s=="allProjektsloaded"){
				loadData("getoptionen",parseoptiondataP,"GET");//
			}
			if(s=="versionfromgitloaded"){
				showOptionen();//reload
			}
		}
		var sendMSG=function(s,data){
			var i;
			for(i=0;i<connects.length;i++){
				connects[i].Message(s,data);
			}
		}
		
		var parseoptiondataP=function(data){
			parseoptiondata(data,"opteinstellungen");
			showOptionen();
		}
		
		//"user":"lokal","dat":{"tabaktiv":3},"lastaction":"getoptionen","status":"OK"
		var showOptionen=function(){
			var i,tab,th,tr,td,anzeigen,inp,property,label,a;
			var speichern=false;
			var o_sibling={
					timer:undefined,
					elemente:[]
				};
				
			//app oder web
			if(typeof(globaldata)!="undefined")
			if(globaldata.modus!=undefined){
				if(globaldata.modus=="app"){							//wenn app
					if(lokalData.windowsize==undefined){					//Datenobjekt nicht existent
						lokalData.windowsize={x:0,y:0,width:0,height:0};	//Datenobjekt erzeugen
					}
				}
			}
			
			var proginputs=[];
			basis.innerHTML="";
			
			tab=cE(basis,"table");
			
			if(isAppBridge()){
				var app=remote.app;
				tr=cE(tab,"tr");
				td=cE(tr,"td");
				td.innerHTML=getWort("version")+':';
				td=cE(tr,"td");
				td.innerHTML=app.getVersion();				
				
				console.log(">>>",versionsinfos.getVersion(),app.getVersion())
			
				if(versionsinfos!=undefined)
				if(versionsinfos.getVersion()!=undefined)
				if(versionsinfos.gibtsneue( app.getVersion() ) ){
					td.innerHTML+=" (neue Version verfügbar: "+versionsinfos.getVersion()+") ";
				
					a=cE(td,"a",undefined,"button");
					a.href="https://github.com/polygontwist/PROSTd-App/tree/master/dist";
					a.innerHTML="zum download";
					a.addEventListener('click',function(e){
							var shell = remote.shell;
							shell.openExternal("https://github.com/polygontwist/PROSTd-App/tree/master/dist");
							e.preventDefault();
							}
						);
					
				}
				
				//todo: check new Version
				//https://raw.githubusercontent.com/polygontwist/PROSTd-App/master/package.json
				
			}
			
			tr=cE(tab,"tr");
			td=cE(tr,"td");
			td.innerHTML=getWort("projektpage")+':';
			td=cE(tr,"td");
			a=cE(td,"a");
			a.href="#";
			a.innerHTML="https://github.com/polygontwist/PROSTd-App/";
			a.target="_blank";			
			if(isAppBridge()){
					a.addEventListener('click',function(e){
						var shell = remote.shell;
						shell.openExternal("https://github.com/polygontwist/PROSTd-App/");
						e.preventDefault();
					});
				}
				else{
					a.href="https://github.com/polygontwist/PROSTd";
					a.target="_blank";
				}
				
				
			if(isAppBridge()){
				var userdokumente=app.getPath('documents');
				tr=cE(tab,"tr");
				td=cE(tr,"td");
				td.innerHTML=getWort("speicherort")+':';
				td=cE(tr,"td");
				
				a=cE(td,"a");
				a.href="#";
				a.innerHTML=userdokumente+"\\PROSTd\\userData";
				a.target="_blank";	
				a.onclick=function(e){
					var shell = remote.shell;
					shell.showItemInFolder(userdokumente+"\\PROSTd\\userData\\");
					return false
				}
				
				tr=cE(tab,"tr");
				td=cE(tr,"td");
				td.innerHTML='<br>';
				td=cE(tr,"td");
			}
			
			var optionen=lokalData;
			//console.log("lokalData>",lokalData);
			
			for( property in optionen ) {
				anzeigen=true;
				
				//auslassen:
				if(property=="tabaktiv")anzeigen=false;
				if(property=="windowsize")anzeigen=false;
				if(property=="showscramblebutt")anzeigen=false;
				if(property=="settings_projektliste")anzeigen=false;
				//console.log("property>>",property);
				
				if(anzeigen){
					tr=cE(tab,"tr");
					td=cE(tr,"td");
					td.innerHTML=getWort("dat"+property)+':';
					td=cE(tr,"td");
					inp=cE(td,"input");
					inp.value=encodeString(optionen[property]);
					inp.data={"property":property,"node":optionen ,"nodeid":property,"o_sibling":o_sibling};


					if(getDataTyp(optionen[property])=='[object Boolean]'){
						inp.type="checkbox";
						inp.id='cb_'+property;
						inp.checked=optionen[property];
						addClass(inp,"booleanswitch");
						label=cE(td,"label");
						label.htmlFor=inp.id;					
					}
					if(getDataTyp(optionen[property])=='[object Number]'){
						inp.type="number";
						inp.step=1;
					}
					if(getDataTyp(optionen[property])=='[object Array]'){
						new createArrayInputs(td,inp,optionen[property],property);
					}
					proginputs.push(inp);
				}
				
			}
			
			for(i=0;i<proginputs.length;i++){
				if(proginputs[i].readOnly!=true){
					proginputs[i].addEventListener('keyup' ,changeActivityInput);
					proginputs[i].addEventListener('change',changeActivityInput);
					//console.log(proginputs[i].type);//number,text,checkbox
				}
			}
			
			
			if(speichern)saveOptionen(true);
		}
		
		var createArrayInputs=function(ziel,parentinput,liste,art){
			var inputs=[];
			
			var clickCB=function (e) {
				var i,val="";
				for(i=0;i<inputs.length;i++){
					if(inputs[i].type=="checkbox"){
						if(i>0)val=val+",";
						val=val+	inputs[i].checked;
					}
				}	
				parentinput.value=val;
				lokalData[parentinput.data.property]=val.split(',');
				saveOptionen(false);
			}
			
			var create=function () {
				parentinput.style.display="none";		
				var i,inp,span;
				for (i=0;i<liste.length;i++) {
					if(liste[i]=="true")liste[i]=true;
					if(liste[i]=="false")liste[i]=false;
				}
				
				for (i=0;i<liste.length;i++) {
					if(typeof(liste[i])=="boolean"){
						if(art=="wochenarbeitstage"){
							span=cE(ziel,"span");
							span.innerHTML=getWort(wochentagID[i]);						
						}
						inp=cE(ziel,"input",undefined,"inputarr");
						inp.type="checkbox";
						inp.checked=liste[i];
						inp.addEventListener('change',clickCB);
						inputs.push(inp)
					}
				}
			}
			
			create();
		}		
		
		var changeActivityInput=function(e){//'keyup'/'change'
			var val=this.value;
			if(this.type=="checkbox")val=this.checked;
		
			//test ob sich der Wert geändert hat (sonst wurde er schon gespeichert)
			var istanders=!((this.data.node[this.data.nodeid]+'')==(val+''));
			if(this.type=="checkbox")istanders=true;
			if(e.type=="keyup" && e.keyCode==13)istanders=true;
			if(!istanders)return;
			
			//'[object Array]' '[object String]'  '[object Number]' 
			//neu abspeichern
			var dtyp=getDataTyp(this.data.node[this.data.nodeid]);
			if( dtyp=== '[object Array]'){
				this.data.node[this.data.nodeid]=val.split(',');//in Array wandeln, Trenner ist ein Komma
			}
			else
			if( dtyp=== '[object Number]'){
				if(isNaN(parseFloat(val)))val=0;
				this.data.node[this.data.nodeid]=parseFloat(val); //Number
			}
			else
			if( dtyp=== '[object Boolean]'){					//boolean
				this.data.node[this.data.nodeid]=val;
			}
			else{
				this.data.node[this.data.nodeid]=decodeString(val); //String
			}
			
			if(this.data.o_sibling.timer!=undefined){
				clearTimeout(this.data.o_sibling.timer);
				this.data.o_sibling.timer=undefined;
			}
			addClass(this,"isedit");
			
			if(dtyp!= '[object Boolean]'){
				if(e.type=="keyup" && e.keyCode==13){
					senddatatimer(this);				
				}
				else{
					//sonst etwas warten ob noch weitere Eingaben kommen
					this.data.o_sibling.timer=setTimeout(senddatatimer,2000,this);//2 sec warten, dann senden, es sei vorher kommen neue daten
				}
			}else{
				senddatatimer(this);
			}
		}
		
		var senddatatimer=function(input){
			var i;
			//editmarker entfernen
			for(i=0;i<input.data.o_sibling.elemente.length;i++){
				subClass(input.data.o_sibling.elemente[i],"isedit");
			}
			saveOptionen(true);
		}
	}
	
	var saveOptionen=function(sysreload){
		var sdata="id="+globaldata.user
				+"&data="+JSON.stringify(lokalData);
		
		if(optspeichernaktiv){
			if(sysreload)
				loadData("setoptionen",parseOptionenSaved,"POST",encodeURI(sdata));
				else
				loadData("setoptionen",parseOptionenSavedNORL,"POST",encodeURI(sdata));
		}
	}
	var parseOptionenSaved=function(data){
		data=JSON.parse(data);
		//check error
		if(data.status!=undefined){
			if(data.status!=msg_OK)
				handleError(data.status);
			else{
				statusDlg.show("",getWort("aenderungsaved"),"statok");
				ProgReload();
			}
		}
	}
	var parseOptionenSavedNORL=function(data){
		data=JSON.parse(data);
		//check error
		if(data.status!=undefined){
			if(data.status!=msg_OK)
				handleError(data.status);
			else{
				
			}
		}
	}
	var ProgReload=function(){
		_appthis.ini(basis.id);
	}

	var debugdiv;
	var showdebugtext=function(s){
		if(debugdiv==undefined){
			debugdiv=cE(document.getElementsByTagName("body")[0],"div","debugdiv");//console.log("create",debugdiv);
		}
		debugdiv.innerHTML=s;
	}
}

//Maincontainer
document.write("<div id='app_psa'></div>");
var o_sysPROST;
//Start nach dem Laden
window.addEventListener('load', function (event) {
		o_sysPROST=new pro_stunden_app();
		o_sysPROST.ini("app_psa");
	});
