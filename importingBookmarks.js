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

var run = true;
var count = 0;
var bookmarkArr = [];
var managerPage = 'newManager.html';

function startImport(){
	
	$('body').html("<div style='font-size:50px; text-align:center; margin-top:5%; margin-bottom:5%'>Loading</div><div style=' text-align:center'><img src='files/images/load05.gif' /></div>");
	
	$.when( getBookmarks() ).progress(
		function(data){

		importer(data);
		}
	);
}


//cycles through to get Chrome bookmarks
function getBookmarks(){
var deferred = $.Deferred();
	
	var level = 0;//did I get to the end of the outermost "loop"
	
	chrome.bookmarks.getTree(
	function traverseBookmarks(bookmarkTreeNodes) {
			 
			 for(var i=0;i<bookmarkTreeNodes.length;i++) {
			 
			 
			if(bookmarkTreeNodes[i].url != null){//it's not a folder
				count++;
			
				deferred.notify(bookmarkTreeNodes[i]);
				
			}
	
		
	if(bookmarkTreeNodes[i].children) {

			level++;

            traverseBookmarks(bookmarkTreeNodes[i].children);
			level--;


        } 		

	
}		


if(i==bookmarkTreeNodes.length && level == 0){
	useInserter(count);
}


	});

	
	return(deferred.promise());
	
	
	
}
	//ends here
	
	
//gets all the parents/folders for a bookmark
function importer(bookmarkObj){

	var bookmarkParent = bookmarkObj;


	function getParents(bookmarkObj, bookmarkParent, callback){
		chrome.bookmarks.get(bookmarkParent.parentId, 
				
			(function(bookmarkParents2) {
					




			if(bookmarkParents2[0] != null && bookmarkParents2[0].title != ""){
					
	
				bookmarkArr.push([bookmarkObj, bookmarkParents2[0]]);

				callback(bookmarkParents2[0]);
			}
		}));




	}
					

					
	getParents(bookmarkObj, bookmarkParent, function getTitle(bookmarkParents2){


		if (bookmarkParents2.parentId != null){
		getParents(bookmarkObj, bookmarkParents2, getTitle);
		}


	});

}


//keep track
var track = 0;

function inserter(item, finished){
	async.waterfall([
		function(callback){
		//does url exist?
			
			var store = dbTransaction(store_name, 'readwrite');
			var index = store.index('url');
			var find = index.get(item[0].url);
			find.onsuccess = function(event) {
				console.log("Input successful");

				if (event.target.result != null){
					//updating
					var tempTags = event.target.result.tags;
					tempTags.push(item[1].title);

					tempTags = uniqueArray(tempTags);
					var bookmarkInfo = {id: event.target.result.id, title: event.target.result.title, url: item[0].url, dateAdded: item[0].dateAdded, tags: tempTags};

					var req = store.put(bookmarkInfo);

					req.onsuccess = function(event) {
						//console.log("Insertion in DB successful");
						
						if(item[1].title == 'Bookmarks bar' || item[1].title == 'Other bookmarks'){
							track++;
						}
						
						console.log("Insertion in DB successful - update.",track,'of',count);

						callback();
					};

					req.onerror = function() {
					  console.log("addPublication error", this.error);
					};
				}
				else{
					//add
					var bookmarkInfo = {title: item[0].title, url: item[0].url, dateAdded: item[0].dateAdded, tags: [item[1].title]};
					
					bookmarkInfo.title = bookmarkInfo.title.replace(/[<>]/g, '');

					var req = store.add(bookmarkInfo);

					req.onsuccess = function(event) {
						if(item[1].title == 'Bookmarks bar' || item[1].title == 'Other bookmarks'){
							track++;
						}
						
						console.log("Insertion in DB successful - new.",track,'of',count);

						callback();
					};
					req.onerror = function() {
					  console.log("addPublication error", this.error);
					 // inserter(item, finished)
					  console.log("Do it again")
					};
				}
				

				callback();

		   }
		   find.onerror = function(event) {
				console.log("Error:",event);

		   }
		}
	], function (err) {
	//on to the next one, if applicable
		console.log("Finished round");
		console.log(err);


	   finished();
	});
}

//input the bookmarks into the db, one at a time
function useInserter(count){

	run = false;
//	setTimeout(function() {
		async.forEach(bookmarkArr, function(item, finished){
			//item = [bookmarkObj, bookmarkParent]
			inserter(item, finished)

		}, function(err){
		//errors

		
		//finished importing, go to manager
			window.location.href=managerPage;

		});
//	},  count);
	
}
