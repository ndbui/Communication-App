define(['jquery'],function($){
	// Initializing the db 
    function initDB(name) {
        var $def = $.Deferred();
        if (!window.indexedDB) {
            $def.reject('There is no indexedDB');
            return $def;
        }
        var request = indexedDB.open(name, 3);
        if (!request) {
            $def.reject('Attempting to open the db returns null');
            return $def;
        }
        request.onerror = function(event) {
            $def.reject('Failed to open the db');
        };
        request.onupgradeneeded = function(event) {
            var db = event.target.result,
        		SoundStore = event.currentTarget.result.createObjectStore(
                 "Sounds", {autoIncrement: false });
                //SoundStore.createIndex("Blobs", "Blobs" , {unique: true });
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            console.log("db successfully initialized");
            $def.resolve(db);
        }
        return $def;
    }

    //Deleting the db
    function deleteDB(name) {
        var $def = $.Deferred();
        var req = indexedDB.deleteDatabase(name);
        req.onsuccess = function () {
            console.log("db has been deleted")
        	initDB(name);
            $def.resolve();
        };
        req.onerror = function () {
            $def.reject('error on delete');
        };
        req.onblocked = function () {
            $def.reject('delete blocked');
        };
        return $def;
    }

    function readRecord(db,storeName,key){
    	var $def= $.Deferred();;
    	var transaction=db.transaction([storeName],'readonly'),
    		store=transaction.objectStore(storeName),
    		request=store.get(key);
    	request.onsuccess=function(e){
    		$def.resolve(e.target.result);
    	};
    	request.onerror=function(e){
    		$def.reject();
    	};
    	return $def;
    }

    function deleteRecord(db,storeName,id){
    	var $def=$.Deferred();
    	var transaction=db.transaction([storeName],'readwrite'),
    		tempID=parseInt(id),
    		request=transaction.objectStore(storeName).delete(tempID);
    	request.onerror=function(e){
    		$def.reject("Failed to delete record");
    	};
    	transaction.oncomplete=function(e){
    		$def.resolve();
    	};
    	return $def;
    }

    function addRecord(db,storeName,newData,key){
    	var $def=$.Deferred();
    	var transaction=db.transaction([storeName],"readwrite");
        var objectStore=transaction.objectStore(storeName);
        var request=objectStore.put({"data":newData},key);
        request.onsuccess=function(e){
            console.log("data",newData);
            console.log("New Sound has been added");
            $def.resolve();
        };
    	return $def;
    }

    function clearStore(db,storeName){
    	var $def=$.Deferred(),
    		transaction=db.transaction([storeName],"readwrite"),
    		store=transaction.objectStore(storeName),
    		request=store.clear();
    	transaction.oncomplete=function(event){
    		$def.resolve();
    	};
    	transaction.onerror=function(error){
    		$def.reject(error);
    	};
    	return $def;
    }

    //base64 encode a blob
    function encodeBlob(blob){
    	var $def=$.Deferred();
    	var reader=new FileReader();
    	reader.onload=function(event){
    		$def.resolve(event.target.result);
    	};
    	reader.readAsDataURL(blob);
    	return $def;
    }

    function reset(db){
    	var $def=$.Deferred();
    	clearStore(db,"Sounds").then(function(){
    		$def.resolve();
    	});
    	return $def;
    }

    /* promise-based sequential map */
    function pmap(values, func) {
        var results = [];
        return values.reduce(function(sequence, item) {
            return sequence.then(function() {
                return func(item);
            }).then(function(result) {
                results.push(result);
            });
        }, $.when()).then(function() {
            return results;
        });
    }

    function getBlobs(db,Path){
        /*var Blobs=[]
            $def=$.Deferred();
        Blobs= Path.map(function(px){
            return readRecord(db,"Sounds",parseInt(px));
        });
        $.when.apply($,Blobs).done(function(){
            blobs=arguments;
            $def.resolve(blobs);
        });
        return $def;*/
        return pmap(Path, function(px){
            return readRecord(db,"Sounds",parseInt(px));
        });
    }
    
    function getIDs(db,storeName){
    	var ids=[];
    	var $def=$.Deferred();
    	var transaction=db.transaction([storeName],"readonly");
    	var objectStore = transaction.objectStore(storeName);
    	var request=objectStore.openCursor();
    	
    	transaction.oncomplete=function(){
    		$def.resolve(ids);
    	};
    	
    	request.onsuccess=function(evt){
    		var cursor=evt.target.result;
    		if(cursor){
    			ids.push(cursor.key)
    			cursor.continue();
    		}
    	};
    	
    	return $def;
    }
    
    
    function getAllRecords(db,storeName){
    	var records={};
    	var $def=$.Deferred();
    	var transaction=db.transaction([storeName],"readonly");
    	var objectStore = transaction.objectStore(storeName);
    	var request=objectStore.openCursor();
    	
    	transaction.oncomplete=function(){
    		$def.resolve(records);
    	};
    	
    	request.onsuccess=function(evt){
    		var cursor=evt.target.result;
    		if(cursor){
    			records[cursor.key]=cursor.value.data;
    			cursor.continue();
    		}
    	};
    	return $def;
    }
    
    function deleteRecordByKey(db,storeName,key){
    	var $def=$.Deferred();
    	var transaction=db.transaction([storeName],"readwrite");
    	var objectStore = transaction.objectStore(storeName);
    	var request=objectStore.openCursor();
    	
    	transaction.oncomplete=function(){
    		$def.resolve();
    	};
    	
    	request.onsuccess=function(evt){
    		var cursor=evt.target.result;
    		if(cursor){
    			if(cursor.key==key){
    				cursor.delete();
    			}
    			cursor.continue();
    		}
    	};
    	return $def;
    }

    return{
        initDB: initDB,
        readRecord: readRecord,
        deleteDB:deleteDB,
        deleteRecord: deleteRecord,
        addRecord: addRecord,
        reset: reset,
        getBlobs: getBlobs,
        encodeBlob: encodeBlob,
        getIDs: getIDs,
        getAllRecords:getAllRecords,
        deleteRecordByKey:deleteRecordByKey
    };

});