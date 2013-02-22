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
	inserter(count);
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

//input the bookmarks into the db, one at a time
function inserter(count){

	run = false;
	setTimeout(function() {
		async.forEachSeries(bookmarkArr, function(item, finished){
			//item = [bookmarkObj, bookmarkParent]
			
			async.waterfall([
				function(callback){
				//does url exist?
					
					var store = dbTransaction(store_name, 'readonly');
					var index = store.index('url');
					var find = index.get(item[0].url);
					find.onsuccess = function(event) {

						if (event.target.result != null){
							//updating
							var tempTags = event.target.result.tags;
							tempTags.push(item[1].title);

							tempTags = uniqueArray(tempTags);
							var bookmarkInfo = {id: event.target.result.id, title: event.target.result.title, url: item[0].url, dateAdded: item[0].dateAdded, tags: tempTags};
						}
						else{
							//add
							var bookmarkInfo = {id: -1, title: item[0].title, url: item[0].url, dateAdded: item[0].dateAdded, tags: [item[1].title]};
							
							bookmarkInfo.title = bookmarkInfo.title.replace(/[<>]/g, '');
						}
						

						callback(null, bookmarkInfo);

				   }
				   find.onerror = function(event) {
						cnsole.log("Error:",event);

				   }
				},
				function(bookmarkInfo, callback){
				//edit db
				
					if(bookmarkInfo.id == -1){
						//add
						delete bookmarkInfo.id;
						
						var store = dbTransaction(store_name, 'readwrite');
						var req;
						req = store.add(bookmarkInfo);

						req.onsuccess = function(event) {
							if(item[1].title == 'Bookmarks bar' || item[1].title == 'Other bookmarks'){
								track++;
							}
							
							console.log("Insertion in DB successful - new.",track,'of',count);

							callback();
						};
						req.onerror = function() {
						  console.log("addPublication error", this.error);
						};
					}
					else{
						//put
						var store = dbTransaction(store_name, 'readwrite');
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

						
					}

			], function (err) {
			//on to the next one, if applicable
				console.log("Finished round");
				console.log(err);


			   finished();
			});
		}, function(err){
		//errors

		
		//finished importing, go to manager
			window.location.href=managerPage;

		});
	},  count * 20);
	
}
