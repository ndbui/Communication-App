
require.config({
  paths:{
    "jquery":"Lib/jquery",
    "Recorder":"https://cdn.webrtc-experiment.com/MediaStreamRecorder",
    "Storage":"Lib/modules/Storage",
    "Audio":"Lib/modules/Audio",
  }
});


function has_crypto() {

	if (window.crypto && window.crypto.getRandomValues) { 
		return(true);
	}

	return(false);

}

function die_roll() {

	var retval;

	if (has_crypto()) {
		var a = new Uint32Array(1);
		window.crypto.getRandomValues(a);
		retval = (a[0] % 6) + 1;

	} else {
		//
		// Fall back to something way less secure.  The user has already 
		// been warned.
		//
		retval = Math.floor(Math.random() * 6) + 1;

	}

	return(retval);

} 

function roll_dice() {
	var retval = [];
	retval.push(die_roll());
	retval.push(die_roll());
	retval.push(die_roll());
	retval.push(die_roll());
	retval.push(die_roll());
	return(retval);
}

function get_word(wordlist, index) {
	var retval = wordlist[index];
	retval = retval[0].toUpperCase() + retval.slice(1);
	return(retval);
}


function getKey(){
		
	var num_dice=2;
	var passphrase = [];

	var rolls = [];
	for (var i=0; i<num_dice; i++) {

		var roll = [];
		roll.dice = roll_dice();
		roll.word = get_word(wordlist, roll.dice.join(""));
		rolls.push(roll);
		passphrase.push(roll.word);

	}
	
	var keyPhrase= passphrase[0]+passphrase[1];
	return keyPhrase;

}

function saveFiles(has_saved){
	$def=$.Deferred();
	require(['Storage'],function(Storage){
		Storage.initDB("RecorderSounds").then(function(db){
			Storage.getAllRecords(db,"Sounds").then(function(recordData){
				console.log(recordData);
				var fileName="JSONs/"+key+".json";
				/*if(recordData.length===undefined){
					//recordData={"0":"0"};
				}*/
				if(has_saved===false){
					alert("Your key is: " +key+". To come back to this picture-sound gallery again add ?=(insert your key here) to the url without parentheses");
				}
				Data={"records":recordData,"pictures":files,"maxPic":maxPic,"fileKey":key};
				console.log(Data);
				console.log(recordData);
				$.ajax({
				   type: "POST",
				    url: "JsonSave.php",
				    dataType: 'json',
				    data: {data:Data,file:fileName},
				    success:function(){
				    	return true;
				    }
				});	
			});
		});
	});
	return $def;
	
}




function getFilesJSON(){
	var $def=$.Deferred();
	
	var path="JSONs/"+key+".json";
	$.getJSON(path,function(data){
		$def.resolve(data);
	});
	
	return $def;
}

function updateIDs(){
	var $def=$.Deferred();
	require(['Audio','Storage'],function(Audio,Storage){
		Storage.initDB("RecorderSounds").then(function(db){
			Storage.getIDs(db,"Sounds").then(function(ids){
				$def.resolve(ids);
			});
		});	
	});
	return $def;
	
}

function updateCheckMarks(){
	$('#check1').attr("src","");
	$('#check2').attr("src","");
	$('#check3').attr("src","");
	$('#check4').attr("src","");
	if($.inArray($('#img1').css("background-image"),completeIDs)!=-1){
		$('#check1').attr("src","Symbols/GreenCheck.gif");
	}
	if($.inArray($('#img2').css("background-image"),completeIDs)!=-1){
		$('#check2').attr("src","Symbols/GreenCheck.gif");
	}
	if($.inArray($('#img3').css("background-image"),completeIDs)!=-1){
		$('#check3').attr("src","Symbols/GreenCheck.gif");
	}
	if($.inArray($('#img4').css("background-image"),completeIDs)!=-1){
		$('#check4').attr("src","Symbols/GreenCheck.gif");
	}
}

function updatePics(index){
	$('#img1').css('background-image','url(Images/'+files[index]+')');
	$('#img2').css('background-image','url(Images/'+files[index+1]+')');
	$('#img3').css('background-image','url(Images/'+files[index+2]+')');
	$('#img4').css('background-image','url(Images/'+files[index+3]+')');
}

function addFocus(id){
  $(id).css({     
    "border": "yellow 5px solid",
  });
}

function removeFocus(id){
  $(id).css({     
    "border": "black 5px solid",
  });
}

function updateFiles(){
	console.log("length:"+files.length)
	var leftovers=files.length%4;
	if(leftovers!==0){
		for(var x=0;x<4-leftovers;x++){
			files.push("");
		}
	}
	
}

var maxPic;
var currentIndex=0;
var id=1;
var completeIDs=[];
var files;
var has_saved=false;


jQuery.getScript("./wordlist.js").done(
	function(data) {

		//
		// If "debug" is set in the GET data, roll the dice on page load.
		// Speed up my development a bit. :-)
		//
		if (location.search.indexOf("debug") != -1) {
			jQuery("#roll_dice").click(); // Debugging
		}

	}).fail(
	function(jqxhr, settings, exception) {
		console.log("Error loading Javascript:", jqxhr.status, settings, exception);

	});



if(window.location.search.indexOf("key=")==-1){
	var key="";
}
else{
	var key=window.location.search.substring(window.location.search.indexOf("key=")+4);

}
console.log(key);
if(key===""){
	key="0";
}
getFilesJSON().then(function(JSONdata){
	console.log(JSONdata);
	require(['Storage'],function(Storage){
		Storage.initDB("RecorderSounds").then(function(db){
			Storage.reset(db).then(function(){
				$.each(JSONdata.records, function(key, value) {
					console.log(key);
					console.log(value);
		            Storage.addRecord(db,"Sounds",value,key);
		        });
		        files=JSONdata.pictures;
				maxPic=JSONdata.maxPic;
				if(key=="0"){
					key=getKey();
				}
				else{
					key=JSONdata.fileKey;
					has_saved=true;
				}
				$('#img1').css('background-image','url(Images/'+files[0]+')');
				$('#img2').css('background-image','url(Images/'+files[1]+')');
				$('#img3').css('background-image','url(Images/'+files[2]+')');
				$('#img4').css('background-image','url(Images/'+files[3]+')');
				updateIDs().then(function(IDs){
				   	completeIDs=IDs;
				   	updateCheckMarks();
				   	console.log(completeIDs);
			    });	
			});
			
		});
	});
});
	


$(document).ready(function() {
  var currentEle=null;

  $(window).swiperight(function() {  
    removeFocus(currentEle);
    currentEle=null;
    if(currentIndex-4<0){
      currentIndex=files.length-4;
    }
    else{
    	currentIndex-=4;
    }
    updatePics(currentIndex);
    updateCheckMarks();

  });  
  $(window).swipeleft(function() {  
    removeFocus(currentEle);
    currentEle=null;
    if(currentIndex+4>files.length-1){
    
    	currentIndex=0;
    	
    }
    else{
    	currentIndex+=4;
    }
    updatePics(currentIndex);
    updateCheckMarks();

  });
   

  $('#img1').on("tap",function(){
    if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img1';
    addFocus(currentEle);
    id=currentIndex;
    //alert($(currentEle).css("background-image"));
  });

  $('#img2').on("tap",function(){
    if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img2';
    addFocus(currentEle);
    id=(currentIndex+1);
    //alert($(currentEle).css("background-image"));
  });

  $('#img3').on("tap",function(){
    if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img3';
    addFocus(currentEle);
    id=(currentIndex+2);
    //alert($(currentEle).css("background-image"));
  });

  $('#img4').on("tap",function(){
    if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img4';
    addFocus(currentEle);
    id=(currentIndex+3);
    //alert($(currentEle).css("background-image"));
  });

  /*document.getElementById("btnUpload").addEventListener("click",function(){
	upload=document.getElementById("file").files;
	
	/*for(var x=0; x<upload.length;x++){
		files.push(upload[x].name);
	}
	//alert(upload)
	saveFiles();
	alert(files.length);
	$.ajax({
		type: "POST",
		url: "upload.php",
		data:{"files":file},
		success: function(result){
			alert("Success");
		}
	});

  });*/
  document.getElementById('btnUpload').addEventListener('click',function(e){
  		e.preventDefault();
        var formData = new FormData($(this).parents('form')[0]);

        $.ajax({
            url: 'upload.php',
            type: 'POST',
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
            },
            success: function (data) {
                console.log("Data Uploaded: "+data);
                var uploads=document.getElementById("uploadFiles").files;
                for(var x=0;x<uploads.length;x++){
                	files.push(uploads[x].name);
                }
                console.log(files.length);
                maxPic++;
                updateFiles();
                saveFiles(has_saved).then(function(){
                	has_saved=true;
                	console.log("reload");
                	window.location.reload();
                });
            },
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        });
        return false;
  });
  
 
  
  
  require(['Audio','Storage'],function(Audio,Storage){
   
   
    
    Audio.initRecorder().then(function(yourRecorder){
      document.getElementById("btnSave").addEventListener("click",function(){
      	$('#btnDel').prop('disabled', true);
      	$('#btnUpload').prop('disabled', true);
      	$('#btnPlay').prop('disabled', true);
      	
    
      	saveFiles(has_saved).then(function(){
      		has_saved=true;
      		$('#btnDel').prop('disabled', false);
	      	$('#btnUpload').prop('disabled', false);
	      	$('#btnPlay').prop('disabled', false);
      	});
      	console.log("JSON saved");
      });
      
      document.getElementById("btnRecord").addEventListener("click",function(){
      	$('#btnDel').prop('disabled', true);
      	$('#btnUpload').prop('disabled', true);
      	$('#btnPlay').prop('disabled', true);
      	$('#btnSave').prop('disabled', true);
        if(!Audio.isRecording() && currentEle!==null){
          Audio.startRecording(yourRecorder);
          var currentCheck="#check"+currentEle.charAt(currentEle.length-1);
          console.log(currentCheck);
          $(currentCheck).attr("src","Symbols/Recording.png");
        }
      });

      document.getElementById("btnStopRecord").addEventListener("click",function(){
        if(Audio.isRecording() && currentEle!==null){
          Audio.stopRecording(yourRecorder).then(function(data){
            console.log("data to be added:",data);
            require(['Storage'],function(Storage){
              Storage.initDB("RecorderSounds").then(function(db){
                Storage.addRecord(db,"Sounds",data,$(currentEle).css("background-image")).then(function(){
                	updateIDs().then(function(IDs){
                		$('#btnDel').prop('disabled', false);
				      	$('#btnUpload').prop('disabled', false);
				      	$('#btnPlay').prop('disabled', false);
				      	$('#btnSave').prop('disabled', false);
                		completeIDs=IDs;
                		updateCheckMarks();
                		if(completeIDs.length==maxPic){
                			alert("You have recorded a sound for every picture! Return to the home page and press play to enter play mode. Once in play mode save the website onto your mobile device for easy access!")
                		}
                	});
                });
              });
            });
            
          });
        }
      });

	  document.getElementById("btnDel").addEventListener("click",function(){
	  	//Delete image
	  	
		files.splice(currentIndex, 1);
		console.log("Before "+files.length);
		maxPic--;
		if(maxPic%4===0){
			files.splice(files.length-files.length%4,files.length%4);	
		}
		else{
			updateFiles();
		}
		console.log(files.length);
		Storage.initDB("RecorderSounds").then(function(db){
			Storage.deleteRecordByKey(db,"Sounds",$(currentEle).css("background-image")).then(function(){
				saveFiles().then(function(){
					window.location.reload();
				});
			});
		});
	  });

      document.getElementById("btnPlay").addEventListener("click",function(){
		$('#btnDel').prop('disabled', true);
      	$('#btnUpload').prop('disabled', true);
      	$('#btnRecord').prop('disabled', true);
      	$('#btnStopRecord').prop('disabled', true);
      	$('#btnSave').prop('disabled', true);
   
        Storage.initDB("RecorderSounds").then(function(db){
          Storage.readRecord(db,"Sounds",$(currentEle).css("background-image")).then(function(result){
          	console.log($(currentEle).css("background-image"));
            console.log(result);
            var sound=new Howl({
              urls:[result.data],
              
              onend:function(){
              	$('#btnDel').prop('disabled', false);
		      	$('#btnUpload').prop('disabled', false);
		      	$('#btnRecord').prop('disabled', false);
		      	$('#btnStopRecord').prop('disabled', false);
		      	$('#btnSave').prop('disabled', false);
              }
            }).play();
          });
        });
      });
    });
  });
    



});