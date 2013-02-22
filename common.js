/*

	Copyright 2013 Alisa Modeste

	This file is part of BookmarkNests.

    BookmarkNests is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    BookmarkNests is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with BookmarkNests.  If not, see <http://www.gnu.org/licenses/>.

*/

var indexedDB = window.indexedDB || window.webkitIndexedDB;
var db;

var triggerAppending = true;

initDb();


function dbTransaction(store_name, mode){
var tx = db.transaction(store_name, mode);
var store = tx.objectStore(store_name);
return store;
}

function initDb() {
	var request = indexedDB.open("bookmarkDB", 1);  
	console.log("I got past the request");
    request.onsuccess = function (evt) {
        db = this.result;           
	console.log("the request was successful. db is", db);	

	if(typeof(printBookmarks) == 'function'){
		printBookmarks();
	}


	
    };
 
    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode, evt);
    };
 
    request.onupgradeneeded = function (evt) {   
		console.log("Upgrading",evt);	
        var objectStore = evt.currentTarget.result.createObjectStore(store_name, { keyPath: "id", autoIncrement: true });
        //                                       ,true);
 
        //objectStore.createIndex("tags", "tags", { unique: false, multientry: true });
		
		objectStore.createIndex("url", "url", { unique: true });
	
    };
}





function dbReading(store_name){
		var tx = db.transaction(store_name, 'readonly');
			var store = tx.objectStore(store_name);
		store.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				
				console.log("Key:", cursor.key,"Title:", cursor.value.title, "Tags:", cursor.value.tags, "URL", cursor.value.url,"Date Added", cursor.value.dateAdded);
				cursor.continue();
		    }
		    else {
				alert("No more entries!");
				console.log(cursor);
			}
		}
}
	

//$.unique didn't always work. Even with sorting
function uniqueArray(repetitiveArray){
  var b = [];
  for(var i=0; i<repetitiveArray.length; i++){
     if(b.indexOf(repetitiveArray[i]) == -1) b.push(repetitiveArray[i]);
  }
  return b;
}									   

//closes the current tab and focuses on the one to the left
function closeTab(){
	chrome.tabs.getCurrent(function tabCloser(obj){

		console.log("the current tab's info",obj);

		var currentIndex = obj.index;
		var currentID = obj.id;

	
	chrome.tabs.query({index : currentIndex - 1}, function secondID(focusedID){
		console.log("the focused tab's id",focusedID[0]);
		chrome.tabs.update(focusedID[0].id, {active:true});
		chrome.tabs.remove(currentID);
	});
		

	});
}

function tagCount(){
	var tagCounter = [];
	
	var store = dbTransaction(store_name, 'readonly');
	var vacant = true;
	store.openCursor().onsuccess = function(event) {	
		
		var cursor = event.target.result;
		if (cursor) {
			for(var i =0;i<cursor.value.tags.length;i++){

				if(tagCounter[0] != null){
				for (var j=0;j<tagCounter.length;j++){
					
					if(cursor.value.tags[i] == tagCounter[j].name){

						tagCounter[j].count = tagCounter[j].count +1;
						
						break;
						
					}
					else if(j==tagCounter.length-1){
						tagCounter.push({name :cursor.value.tags[i],count:1});
						
						break;
						

					}
				}
				}
				else{
					tagCounter.push({name :cursor.value.tags[i],count:1});
					
				}
			}
			cursor.continue();
		}
		else{
			addTags(tagCounter);
		}
	}
}


function showTags(e){
	e.preventDefault();
	console.log("call tag function");
	if(triggerAppending){
	
	triggerAppending = false;
	tagCount();
	}	
    $("#cloud").dialog({
	
	width:'500px',
	dialogClass: 'alert',
	autoOpen: false
	});
	
	$("#cloud").dialog('open');
	
	$("#cloud").dialog("option", "position", ['right','center']);

	
}

function addTags(tags){

	for(var i in tags){
		$("#cloud").append("<a href='#' rel='" + tags[i].count + "'>" + tags[i].name + "</a> ");
		console.log(tags[i].name);
	}
	

	$("#cloud").append("<p><button id='closeDialog'>Close</button></p>");

	
	$.fn.tagcloud.defaults = {
  size: {start: 14, end: 18, unit: 'pt'},
  color: {start: '#cde', end: '#f52'}
};

$(function () {
  $('#cloud a').tagcloud();
  
  $('#cloud a').on('click', function(e) {

	e.preventDefault();
	
	//add text input
	var gg = $(this).text();

	$('.ui-widget-content .ui-autocomplete-input').simulate("key-sequence", {sequence: gg + ' '});
	});
	$('#cloud button').on('click', function(e) {
		console.log(e);
		$("#cloud").dialog('close');
	});
});
}



function formValidation(formValues, formID){

	var valid = true;
	
	if(formValues.title == ''){

		$('#title').after('<p style="display:inline" id="titleError" >The bookmark must have a title.</p>');
		
		$(formID).on('keydown', function(e){

	
			$(formID + ' #titleError').remove();
		});
		
		valid = false;
	}
		for (var i in formValues.tags){
			if(formValues.tags[i].match('=')){
			//error message
			
			$('#tagBar').after('<p style="display:inline" id="tagError" >Tags cannot contain equal signs.</p>');
			
			$(formID).on('keydown', function(e){

				console.log('errors',$(formID + ' #tagError'));
				
				$(formID + ' #tagError').remove();
			});
		
			return false;
			}
		}
	return valid;

}