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

var firstLoad = true;

//display the bookmarks
function printBookmarks(nextSet){
	//cursor loop
	var store = dbTransaction(store_name, 'readonly');
	var vacant = firstLoad;
	var allTagsLinks = [];
	var allTagsNames = [];
	var count =0;

	//var key = window.location.search.match(/\d+/) || 0
	var keys = getKeys();
	console.log("keys", getKeys())
	//key = parseInt(keys[0])

	// keys greater than key
	//var lowerBoundOpenKeyRange = IDBKeyRange.lowerBound(key, true);
	//var lowerBoundOpenKeyRange = IDBKeyRange.lowerBound(key);

	if (nextSet){
		var key = parseInt(keys[1])

		// keys greater than key
		var openKeyRange = IDBKeyRange.lowerBound(key, true);
		var direction = "next";

		
	}
	else {
		var key = parseInt(keys[0])

		var openKeyRange = IDBKeyRange.upperBound(key, true);
		var direction = "prev";

		console.log('prev top',openKeyRange.upper)
		console.log('prev bottom',openKeyRange.lower)
	}

	


	store.openCursor(openKeyRange, direction).onsuccess = function(event) {
	//store.openCursor(null, direction).onsuccess = function(event) {
		
		var cursor = event.target.result;

		console.log(count)
		if (cursor && count < 8) {
			//this is the first time through and there are bookmarks
			if (count == 0) {
				$("#container").empty();
			}
		
			vacant = false;

			var tagString = [];
			var tempTag;
			for(var i=0;i<cursor.value.tags.length;i++){
			
				tempTag = cursor.value.tags[i].replace(' ','=');
				
				tagString.push(tempTag);
			}
			
			tagString = tagString.join(' ');
			
			if (nextSet){
				$("#container").append("<a href='" + cursor.value.url + "' style='display:block; width:100%' class='color-shape item " + tagString + "' id='_" + cursor.key +  "'><p class='name title' style='display:inline; float:left'>" + cursor.value.title + "</p><p style='display:inline; float:left'>&nbsp;&nbsp;&nbsp; </p><p class='name' style='display:inline; float:left; color:gray'> " + cursor.value.url + "</p><p style='display:inline; float:left'>&nbsp;&nbsp; </p> <ul class='myTagsA' style='display:inline; ' id='" + cursor.key + "'></ul></a>");
			}
			else {
				$("#container").prepend("<a href='" + cursor.value.url + "' style='display:block; width:100%' class='color-shape item " + tagString + "' id='_" + cursor.key +  "'><p class='name title' style='display:inline; float:left'>" + cursor.value.title + "</p><p style='display:inline; float:left'>&nbsp;&nbsp;&nbsp; </p><p class='name' style='display:inline; float:left; color:gray'> " + cursor.value.url + "</p><p style='display:inline; float:left'>&nbsp;&nbsp; </p> <ul class='myTagsA' style='display:inline; ' id='" + cursor.key + "'></ul></a>");
			}
			
			for(var i=0;i<cursor.value.tags.length;i++){
				
				$('#' +cursor.key).append("<li class='myTagsA'>" + cursor.value.tags[i] + "</li>");

				tempTag = cursor.value.tags[i].replace(' ','\\=');
				
				allTagsLinks.push(tempTag);
				allTagsNames.push(cursor.value.tags[i]);
			}

			console.log('count is now',count);
			console.log("cursor.key is",cursor.key)
			count++;

			if (count == 2){
				console.log("second cursor.key is",cursor.key)
			}
			
			cursor.continue();
			
		}
		//end of cursor loop
		
		else if(vacant){
			console.log('i"m inside vacant');
			
			$("#content").append("<div id='empty'>You don't have any bookmarks yet. <a href='#' style='display:inline'>Click here</a> to import your Chrome bookmarks.</div>");
			$("#container").removeAttr("id");
		
			$("#content #empty a").on('click',function(e){
			e.preventDefault();
			appendScript('importingBookmarks.js');
			//startImport();
			console.log('hopefully second call',typeof(startImport));
				async.until(function(){ return typeof(startImport) == 'function'}, 
					function(callback){ setTimeout(callback, 25);},
					function(err){startImport()}
					);
			});
		}
		else{
			
			console.log('I got to the end.');
			
			
			if (firstLoad) {
				firstLoad = false;

				$(".myTagsA").tagitRows(editOff);

				

		
				allTagsNames = uniqueArray(allTagsNames);
				allTagsLinks = uniqueArray(allTagsLinks);
				
				
				for(var i=0;i<allTagsNames.length;i++){
				
					$(".tag_choice .filter").append("<li class='tag'> <a href='#' data-filter-value='." + allTagsLinks[i] + "'>" + allTagsNames[i] +"</a></li>");
					$(".tags_chosen .filter").append("<li class='tag'> <a href='#' data-filter-value='." + allTagsLinks[i] + "'>" + allTagsNames[i] +"</a></li>");

				}
				
				$(".tag").button();

				appendScript('newManagerFunctionality.js');

			}

			var keys = getKeys();
			addPageLinks(keys);

		}

	}




}

function getKeys(){
	if (firstLoad) {
		return [0,0]
	}
	var previousKey = $("#container a:first-child").attr('id').slice(1)
	var nextKey = $("#container a:last-child").attr('id').slice(1)

	console.log("the [previousKey, nextKey]",previousKey, nextKey)
	return [previousKey, nextKey]
}

function addPageLinks(keys){
	//$(".links").html("<p>First link" + keys[0] + "</p>")

	$(".links").html("<div><a href='#' id='previous'>Previous page</a></div>")
	$(".links").append("<div><a href='#' id='next'>Next page</a></div>")
}


function appendScript(file){
	console.log('just got here.');
	var headID = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = file;
    headID.appendChild(newScript);
	
}