define(['jquery','Storage','Recorder'],function($,Storage,Recorder){
	var $URLdef;
	var curURL=null;
	function initRecorder(){
		var $def=$.Deferred();
		navigator.getUserMedia({audio:true}, onMediaSuccess, onMediaError);
		function onMediaSuccess(stream){
			var mediaRecorder=new MediaStreamRecorder(stream);
			console.log("MediaRecorder is on");
			mediaRecorder.mimeType = 'audio/ogg';
			recording=false;
			mediaRecorder.ondataavailable = function (blob){
				$URLdef=$.Deferred();
				
				Storage.encodeBlob(blob).then(function(newData){
					$URLdef.resolve(newData);
				});	
			}
			$def.resolve(mediaRecorder);
		}
		function onMediaError(e){
			$def.reject("Failed to initialize MediaRecorder");
		}
		return $def;
	}

	function startRecording(yourMediaRecorder){
		recording=true;
		console.log('recording');
	    yourMediaRecorder.start(10000);
	}


	function stopRecording(yourMediaRecorder){
		
		recording=false;
		console.log('recording has been stopped');
		yourMediaRecorder.stop();
		return $URLdef;

		

	}


	function isRecording(){
		return recording;
	}

	return{
		initRecorder: initRecorder,
		startRecording: startRecording,
		stopRecording: stopRecording,
		
		isRecording: isRecording
	};

});