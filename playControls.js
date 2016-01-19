require.config({
  paths:{
    "jquery":"Lib/jquery",
    "Recorder":"https://cdn.webrtc-experiment.com/MediaStreamRecorder",
    "Storage":"Lib/modules/Storage",
    "Audio":"Lib/modules/Audio",
  }
});

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

function getFilesJSON(){
	var $def=$.Deferred();
	
	var path="JSONs/"+key+".json";
	$.getJSON(path,function(data){
		$def.resolve(data);
	});
	
	return $def;
}

var maxPic=40;
var currentIndex=0;
var files;
var key;
var id=1;

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
					//Key gets randomly generated key
				}
				else{
					key=JSONdata.fileKey;
				}
				$('#img1').css('background-image','url(Images/'+files[0]+')');
				$('#img2').css('background-image','url(Images/'+files[1]+')');
				$('#img3').css('background-image','url(Images/'+files[2]+')');
				$('#img4').css('background-image','url(Images/'+files[3]+')');	
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
    

  });
   

  //Playing sounds
  $('#img1').on("tap",function(){
	  
	if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img1';
    addFocus(currentEle);  
    console.log("tap")
    require(["Audio","Storage"],function(Audio,Storage){
    	
		Storage.initDB("RecorderSounds").then(function(db){
          Storage.readRecord(db,"Sounds",$(currentEle).css("background-image")).then(function(result){
            console.log(result);
            var sound=new Howl({
              urls:[result.data]
            }).play();
          });
        });
    });
	
  });

  $('#img2').on("tap",function(){
  	if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img2';
    addFocus(currentEle);   
    console.log("tap")
    require(["Audio","Storage"],function(Audio,Storage){
    	
		Storage.initDB("RecorderSounds").then(function(db){
          Storage.readRecord(db,"Sounds",$(currentEle).css("background-image")).then(function(result){
          	console.log($(currentEle).css("background-image"));
            console.log(result);
            var sound=new Howl({
              urls:[result.data]
            }).play();
          });
        });
    });
    
  });

  $('#img3').on("tap",function(){
    if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img3';
    addFocus(currentEle);   
    console.log("tap")
    require(["Audio","Storage"],function(Audio,Storage){
    	
		Storage.initDB("RecorderSounds").then(function(db){
          Storage.readRecord(db,"Sounds",$(currentEle).css("background-image")).then(function(result){
          	console.log($(currentEle).css("background-image"));
            console.log(result);
            var sound=new Howl({
              urls:[result.data]
            }).play();
          });
        });
    });
   
  });

  $('#img4').on("tap",function(){
  	if(currentEle!==null){
      removeFocus(currentEle);
    }
    currentEle='#img4';
    addFocus(currentEle);     
    console.log("tap")
    require(["Audio","Storage"],function(Audio,Storage){
    	
		Storage.initDB("RecorderSounds").then(function(db){
          Storage.readRecord(db,"Sounds",$(currentEle).css("background-image")).then(function(result){
          	console.log($(currentEle).css("background-image"));
            console.log(result);
            var sound=new Howl({
              urls:[result.data]
            }).play();
          });
        });
    });
  });
    



});