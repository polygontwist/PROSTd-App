// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
//var elect = require('electron'); 

const electron = require('electron');
const {remote} = electron;
const {dialog, BrowserWindow} = remote;
const fs = require('fs');


/*const //remote = require('remote'), 
      app2 = remote.require('app');*/
var app = require('electron').remote; 

//const appPath = process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname
const basepath=process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname;
//
var basepathDATA="";

var path = require('path');
path.join(__dirname, 'templates');
/*
path.join(__dirname, 'userData');
//console.log("#",path);
//console.log("#",path.normalize(basepathDATA));
*/
var	basepathTEMPLATES=basepath+"/templates/";
	basepathTEMPLATES=path.normalize(basepathTEMPLATES);
var datafileendung='.json';

var eleWin;

var AppBridge=function(){
	//var path = dialog.showOpenDialog({properties: ['openDirectory']});
	//console.log("elect",electron,fs);
	//console.log("elect",remote.systemPreferences);
	///console.log("elect",remote.process.resourcesPath);
	//console.log("basepath:",basepath);//"D:\elektron\PROSTd_lokal"
		
	//console.log("elect",{properties: ['openDirectory']});
	//console.log("elect",remote.process.platform);//win32
	//console.log("elect",remote.process.title);//C:\WINDOWS\system32\cmd.exe - electron   . //s
	//console.log(elect);
	//readFile(path+"optionen.txt");
	
	
	
	var projekttemplate={
			"id":"$ID",
			"titel":"$TITEL",
			"isnew":true,
			"info":{
				"isended":false,
				"auftraggeber":"",
				"projektleiter":"",
				"startdatum":"$HEUTE",
				"enddatum":"",
				"status":"",
				"projektart":[],
				"gruppe":[]
			},
			"stunden":[]
		};
	
	
	var refunction=undefined;
	var zurl="";
		//exists
		//mkdir
		//readdir
	
	var readFile=function(filepath){
		if(fs.existsSync(filepath)){
			fs.readFile(
				filepath, 
				'utf-8', 
				function (err, data) {
					var redata={};
					var sstatus="OK";
//console.log(filepath,data);
					if(err){
					  //alert("An error ocurred reading the file :" + err.message);
					  console.log("!!Error",err.message);
					  var dataERR={"user":"lokal",
								"lastaction":zurl,
								"status":"404:notfound",
								"dat":err.message};
					  sstatus="404:notfound";
					};
						
					if(zurl=="getoptionen"){
						if(sstatus=="404:notfound"){
							redata.dat="{\"tabaktiv\":0}";
							sstatus="OK";
						}
						redata={
							"user":"lokal",
							"dat":JSON.parse(data) ,
							"lastaction":zurl,
							"status":sstatus
						};
						
					}else
					if(zurl=="projektdata"){
						redata=JSON.parse(data);
					}


					if(refunction!=undefined)refunction(JSON.stringify(redata));
					//console.log(sstatus,zurl, data,refunction);
						  
					  
				}
			);
		}
		else{
			var dataERR={"user":"lokal",
								"lastaction":zurl,
								"status":"404:notfound",
								"dat":""};
			if(zurl=="getoptionen"){
				dataERR.dat={"tabaktiv":0};
				dataERR.status="OK";
				}	
			
			console.log("ERROR:filenotexist",JSON.stringify(dataERR));
			if(refunction!=undefined)refunction(JSON.stringify(dataERR));
		}
		
	};
	
	var addStundeneintrag=function(id,stddata){
		var i,st,handlingstatus="";
		var filepath=basepathDATA+id+datafileendung;
		var redat={"user":"lokal",
					"id":id,
					"handlingstatus":"",
					"dateipfadname":filepath,					
					"lastaction":zurl,
					"status":"OK"};
		
		stddata=JSON.parse( decodeURI(stddata));
//console.log(stddata);		
		if(fs.existsSync(filepath)){
			var datei=fs.readFileSync(filepath, 'utf-8');
			datei=JSON.parse(datei);
			
			stundenliste=datei.stunden;
			var eintragen=true;
			var stundenlisteneu=[];
			for(i=0;i<stundenliste.length;i++){
				st=stundenliste[i];
				if(st.dat==stddata.dat){//Datum gefunden
					eintragen=false;
					if(stddata.deleting==true){
						redat.handlingstatus="deleting";
					}
					else{
						redat.handlingstatus="change";
						stundenlisteneu.push(stddata);
					}
					console.log("gefunden",stddata,redat.handlingstatus);
				}
				else{
					stundenlisteneu.push(stundenliste[i]);
				}
			}
			if(eintragen){
				stundenlisteneu.push(stddata);
				redat.handlingstatus="add";
			}
			datei.stunden=stundenlisteneu;
			
			fs.writeFile(filepath, JSON.stringify(datei),'utf-8' ,
				function(err) {
					if(err){
						console.log(">>",err);
						redat.status="404:notwrite";
					}
					else{
						console.log("The file "+filepath+" was saved!",err ,datei);
					}
					if(refunction!=undefined)refunction(JSON.stringify(redat));
				}
			);
		}
		else{
			redat.status="404:notfound";
			if(refunction!=undefined)refunction(JSON.stringify(redat));
		}
	}
	
	var refreshTitel=function(id,ddata){
		var i,st,handlingstatus="";
		var filepath=basepathDATA+id+datafileendung;
		var redat={"user":"lokal",
					"id":id,
					"handlingstatus":"",
					"dateipfadname":filepath,					
					"lastaction":zurl,
					"status":"OK"};
		
		ddata=JSON.parse( decodeURI(ddata));
		if(fs.existsSync(filepath)){
			var datei=fs.readFileSync(filepath, 'utf-8');
			datei=JSON.parse(datei);
			datei.titel=ddata.titel;
			fs.writeFile(filepath, JSON.stringify(datei),'utf-8' ,
				function(err) {
					if(err){
						console.log("refreshTitel>>",err);
						redat.status="404:notwrite";
					}
					else{
						//console.log("The file was saved!",redat);
					}
					if(refunction!=undefined)refunction(JSON.stringify(redat));
				}
			);
		}
		else{
			redat.status="404:notfound";
			if(refunction!=undefined)refunction(JSON.stringify(redat));
		}
		
	}
	
	var refreshInfo=function(id,ddata){
		var i,st,handlingstatus="";
		var filepath=basepathDATA+id+datafileendung;
		var redat={"user":"lokal",
					"id":id,
					"handlingstatus":"projektinfoupdate",
					"dateipfadname":filepath,					
					"lastaction":zurl,
					"status":"OK"};
		
		ddata=JSON.parse( decodeURI(ddata));
		if(fs.existsSync(filepath)){
			var datei=fs.readFileSync(filepath, 'utf-8');
			datei=JSON.parse(datei);
			//datei.titel=ddata.titel;
			datei.info=ddata;
			
			
			fs.writeFile(filepath, JSON.stringify(datei),'utf-8' ,
				function(err) {
					if(err){
						console.log("refreshTitel>>",err);
						redat.status="404:notwrite";
					}
					else{
						//console.log("The file was saved!",redat);
					}
					if(refunction!=undefined)refunction(JSON.stringify(redat));
				}
			);
			
		}
		else{
			redat.status="404:notfound";
			if(refunction!=undefined)refunction(JSON.stringify(redat));
		}
		
	}
	
	var getformdata=function(dat){
		var re=dat.getFullYear()+'-';
			if((dat.getMonth()+1)<10)re+='0';
			re+=(dat.getMonth()+1)+'-';
			if(dat.getDate()<10)re+='0';
			re+=dat.getDate()+' ';
			if(dat.getHours()<10)re+='0';
			re+=dat.getHours()+':';
			if(dat.getMinutes()<10)re+='0';
			re+=dat.getMinutes()+':';
			if(dat.getSeconds()<10)re+='0';
			re+=dat.getSeconds();
		return re;
	}
	
	var getFiles=function(myDir,filterend){
		var relist=[];
		var fdirectory=myDir;
		
		if(fdirectory.charCodeAt(fdirectory.length-1)==92){
			//console.log(">",fdirectory.charCodeAt(fdirectory.length-1))
			fdirectory=fdirectory.slice(0,fdirectory.length-1);
			}
		
		var redata=function(err,dir){
			var i,fsdat;
//console.log("getFiles",myDir,dir);
			for(i=0;i<dir.length;i++){
				if(filterend!=""){
					if(dir[i].indexOf(filterend)>0){
						fsdat=fs.lstatSync(myDir+dir[i]);
						relist.push({
							"name":(dir[i].split(filterend)[0]),
							"dat":getformdata(fsdat.mtime)
							});//"2017-12-11 11:11:11"	
					}
				}
				else{
					fsdat=fs.lstatSync(myDir+dir[i]);
					relist.push({"name":dir[i],"dat":getformdata(fsdat.mtime)});//"2017-12-11 11:11:11"
					}
			}
			
			
			var data={"user":"lokal",
				"lastaction":"",
				"status":"OK",
				"dat":relist	//"name":"test","dat":"2017-12-11 11:11:11"	
			}
			//
			if(refunction!=undefined)refunction(JSON.stringify(data));
			else{
				console.log("no refunction",relist);
			}
		};
		
		fs.readdir(fdirectory, redata );
		
	}
	
	var getSentvar=function(s){
		var i,v,re={},
			variabeln=(s+'').split('&');
		//id=fairydustrocket&data=%7B
		for(i=0;i<variabeln.length;i++){
			v=variabeln[i].split('=');
			re[v[0]]=v[1];
		}
		
		return re;
	}
	
	var clearfilename=function(sname){
		//sname = decodeURI(sname);
		sname = sname.split(" ").join("");//str_replace(' ', '', $string);
		sname = sname.split("ä").join("ae");//str_replace('ä', 'ae', $string);
		sname = sname.split("ö").join("oe");//str_replace('ö', 'oe', $string);
		sname = sname.split("ü").join("ue");//str_replace('ü', 'ue', $string);
		sname = sname.split("ß").join("ss");//str_replace('ß', 'ss', $string);
		sname = sname.split("Ä").join("ae");//str_replace('Ä', 'ae', $string);
		sname = sname.split("Ö").join("oe");//str_replace('Ö', 'oe', $string);
		sname = sname.split("Ü").join("ue");//str_replace('Ü', 'ue', $string);
		sname = sname.split(".").join("");//str_replace('Ü', 'ue', $string);
		sname = sname.split("$").join("");//str_replace('Ü', 'ue', $string);
		
		//$string = str_replace("%20", "", $string);
		// %...
		
		//$erlaubt = '/[a-z0-9\_\.\-]+/i'; 
		//preg_match_all($erlaubt, $string, $treffer);// "split"
		//$string = implode('', $treffer[0]); 		// "join"
		var match=sname.match(/[a-z0-9\_\.\-]+/i);
		if(match==null){
			sname="file";
		}
		else
			sname=match[0];
		
	 return sname;
	}	
	
	var createnewProjektfile=function(pd){
		var filename=clearfilename(decodeURI(pd.newdata));
		var titel=decodeURI(pd.newdata);
		if(filename.length<10){//10
			filename=filename+"_";
			while(filename.length<10){
				filename+=Math.floor(Math.random()*9);
			}
		}
		var counter=0;
		while(fs.existsSync(basepathDATA+filename+datafileendung)){
			filename=filename+counter;
			$counter++;
			if($counter>20){
				filename+='br';
				break;}
		}
		
		var template=JSON.stringify(projekttemplate);
		if(fs.existsSync(basepathTEMPLATES+"proj_template.js")){
			template=fs.readFileSync(basepathTEMPLATES+"proj_template.js", 'utf-8');
		}
		var heute=new Date();
		var tmp=heute.getFullYear()+'-';
		if((heute.getMonth()+1)<10)tmp+='0';
		tmp+=(heute.getMonth()+1)+'-';
		if(heute.getDate()<10)tmp+='0';
		tmp+=heute.getDate();
		
		template=template.split('$ID').join(filename);//str_replace('$ID', $newProjektname, $buffer);
		template=template.split('$TITEL').join(titel);//htmlentities(urldecode($namedata));
		template=template.split('$HEUTE').join(tmp);//date("Y-m-d");
		var data={"user":"lokal",
			"dat":"",
			"dateiname":filename,
			"titel":pd.newdata,
			"lastaction":"newprojekt",
			"info":tmp,
			"status":"OK"
		};
				
		fs.writeFile(basepathDATA+filename+datafileendung, template,'utf-8' ,
			function(err) {
				if(err){
					console.log(">>",err);
					data.status="404:notwrite";
				}
				else{
					//console.log("The file was saved!",redat);
				}
				if(refunction!=undefined)refunction(JSON.stringify(data));
			}
		);	
	};
	
	//system (loadDataAPP)<->elektron 
	this.DataIO=function(url, auswertfunc,getorpost,daten){
		//console.log("DataIO",globaldata.user,url,getorpost,daten,fs);
		var pd=getSentvar(daten);
		var data={};

		if(basepathDATA=="")return;
		
		refunction=auswertfunc;
		zurl=url;
		if(url=="getoptionen"){//OK:Optionen laden
			readFile(basepathDATA+"optionen.txt");//id=lokal&data=%7B%22tabaktiv%22:0,%22showscramblebutt%22:false%7D
			//auswertfunc(JSON.stringify(data));
		}
		else
		if(url=="projektliste"){//OK:Liste der Projekte als Dateinamen + Dateiänerungsdatum
			//auswertfunc(JSON.stringify(data));
			getFiles(basepathDATA,datafileendung);
		}
		else
		if(url=="setoptionen"){//OK:Optionen speichern
			data={"user":"lokal",
				"lastaction":"",
				"status":"OK"
			}
			
			if(!fs.existsSync(basepathDATA+"optionen.txt")){
				console.log(":-(");
			}
			
			fs.writeFile(basepathDATA+"optionen.txt", decodeURI(pd.data),'utf-8',
				function(err) {
					if(err){
						console.log(">>",err);
						data.status="404:notwrite";
					}
					else{
						//console.log("The file was saved!",redat);
					}
					if(refunction!=undefined)refunction(JSON.stringify(data));
				}
			);
		}
		else
		if(url=="maindata"){//alive 
			data={"user":"lokal",
			"dat":"maindata",
			"lastaction":"maindata",
			"status":"OK"
			};
			auswertfunc(JSON.stringify(data));
		}
		else
		if(url=="projektdata"){
			var filename=pd.name;
			readFile(basepathDATA+filename+datafileendung);
		}
		else
		if(url=="newprojekt"){
			createnewProjektfile(pd);
		}
		else
		if(url=="projektstundenlisteupdate"){
			addStundeneintrag(pd.id,pd.data);//nur ein Entrag wird aktualisiert!
		}
		else
		if(url=="projekttitelupdate"){
			refreshTitel(pd.id,pd.data);
		}
		else
		if(url=="projektinfoupdate"){
			refreshInfo(pd.id,pd.data);
		}
		else
			alert("load\n"+globaldata.user+'\n'+url+'\n'+getorpost+'\n'+daten);
	}

	this.Message=function(s,data){
		if(s=="changeInputSwitch"){
			var win=remote.getCurrentWindow();
			//console.log(win.webContents);
			if(data.id=="cbb_scramble"){
				if(data.aktiv)
					win.webContents.openDevTools();
					else
					win.webContents.closeDevTools();
			}
		};		
	};
	
}


var AppeleWin=function(){
	var win=remote.getCurrentWindow();
	
	var ini=function(){
		
		/*console.log('basepath',basepath);
		console.log('_dirname',__dirname);
		console.log('data',fs.existsSync(basepathDATA));
		console.log('templates',fs.existsSync(basepathTEMPLATES));
		console.log('getAppPath',remote.app.getAppPath());
		console.log('getAppPath.data',remote.app.getAppPath('data'));
		console.log('getAppPath.appData',remote.app.getAppPath('appData'));
		console.log('getAppPath.userData',remote.app.getAppPath('userData'));*/
		/*
		console.log(":Directory:",fs.readdirSync(basepath));
		console.log(":Directory:",fs.readdirSync(basepath+'/userData'));
		console.log(":Directory:",fs.readdirSync(basepathDATA));
		
		console.log(":documents:",app.app.getPath('documents'));
		*/
		
		var userdokumente=app.app.getPath('documents');// C:\Users\andreas\Documents !
		var tmp;
		var firststart=false;
		
		if(!fs.existsSync(userdokumente+"/PROSTd")){
			//create dir
			fs.mkdirSync(userdokumente+"/PROSTd");
		}
		if(!fs.existsSync(userdokumente+"/PROSTd/userData")){
			//create dir
			fs.mkdirSync(userdokumente+"/PROSTd/userData");
			firststart=true;
		}
		
		//create urlaub
		if(!fs.existsSync(userdokumente+"/PROSTd/userData/urlaub"+datafileendung)){
			if(fs.existsSync(basepathTEMPLATES+"urlaub"+datafileendung)){
				console.log("create urlaub");
				tmp=fs.readFileSync(basepathTEMPLATES+"urlaub"+datafileendung,'utf-8');
				fs.writeFileSync(userdokumente+"/PROSTd/userData/urlaub"+datafileendung,tmp,'utf-8');
			}
		}
		//create feiertage
		if(!fs.existsSync(userdokumente+"/PROSTd/userData/feiertage"+datafileendung)){
			if(fs.existsSync(basepathTEMPLATES+"feiertage"+datafileendung)){
				console.log("create feiertage");
				tmp=fs.readFileSync(basepathTEMPLATES+"feiertage"+datafileendung,'utf-8');
				fs.writeFileSync(userdokumente+"/PROSTd/userData/feiertage"+datafileendung,tmp,'utf-8');
			}
		}
		
		//usercss
		if(fs.existsSync(userdokumente+"/PROSTd/userData/style.css")){
			var newNode=document.createElement("link");
			newNode.type="text/css";
			newNode.rel="stylesheet";
			newNode.href=userdokumente+"/PROSTd/userData/style.css";
			document.head.appendChild(newNode);
		}
		
		
		//basepathDATA=basepath+"/userData/";
		basepathDATA=userdokumente+"/PROSTd/userData/";
		basepathDATA=path.normalize(basepathDATA);

		
		//console.log("!",fs.readFileSync(basepathDATA+"optionen.txt",'utf-8'));
		
		console.log("basepath",basepath);
		console.log("basepathDATA",basepathDATA);
		console.log("basepathTEMPLATES",basepathTEMPLATES);
		
		
		console.log(":Directory:",fs.readdirSync(basepath));
		console.log(":Directory:",fs.readdirSync(basepathDATA));
		//console.log(":Directory:",fs.readdirSync(basepath+'/userData'));
		
		//SetWindowSize
		
		if(fs.existsSync(basepathDATA+"optionen.txt")){
			var r=fs.readFileSync(basepathDATA+"optionen.txt",'utf-8',"a");
			if(r!=""){
				var optionen=JSON.parse(r);
				if(optionen.windowsize!=undefined){
					win.setPosition(optionen.windowsize.x,optionen.windowsize.y);
					if(optionen.windowsize.width>0 && optionen.windowsize.height>0)
						win.setSize(optionen.windowsize.width,optionen.windowsize.height);
				}
			}
		}
		//console.log("##",win);
		win.on('move',resizer);//OK
		//http://electron.atom.io/docs/api/web-contents/
		window.addEventListener('resize',resizer );
		
		if(firststart)
			alert("Deine Daten findest Du unter:\n"+basepathDATA);
	}
	
	var resizer=function(event){
		//var win=remote.getCurrentWindow();
		var bereich=win.getBounds();// x: 279, y: 84, width: 1250, height: 640
		
		if(typeof(o_sysPROST)!="undefined")
			if(o_sysPROST!=undefined){
				o_sysPROST.Message("resize",bereich)
			}
	}
	
	ini();
}



window.addEventListener('load', function (event) {
		//console.log(">>",globaldata);
		//mainWindow.webContents.openDevTools()
		//app.BrowserWindow
		eleWin=new AppeleWin();
	});