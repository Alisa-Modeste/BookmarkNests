document.addEventListener("DOMContentLoaded",function(e) {

	prefillForm();

	$(".myTags4").tagit();

});


document.getElementById("demos").addEventListener("click",function(e) {

console.log(e);

  if(e.target && e.target.nodeName == "BUTTON") {
    // List item found!  Output the ID!
    console.log("List item ",e.target.id," was clicked!");
	
	switch(e.target.id){
	case "import":
		startImport();
		break;
		
	case "manager":
		openManager();
		break;
		
	case "tags":
		showTags(e);
		break;
	
	case "save":
		saveBookmark(e);
		//prefillTitle(e);
		break;
	
	case "cancel":
		closeTab();
		break;
	
	}
	
}

});

//originally pressing enter would trigger the submit function (saveBookmark), but it stopped working
document.getElementById("bk").addEventListener("keydown", function(evt) {
	if(evt.keyCode == 13){
	evt.preventDefault();
	saveBookmark(evt)}

    }, false);
	
	


//add a bookmark for the current tab or update it
function saveBookmark(e){
	e.preventDefault();
	var title = document.bk.title.value;

	var tags = $(".myTags4").tagit("assignedTags");
		console.log(tags);
		console.log(title);
		
	
	var date = Math.round(new Date().getTime()/1000.0);
	var currentBookmark = {title: title, dateAdded: date, url: url, tags:tags};
	
	var proceed = formValidation(currentBookmark, '#bk');
	console.log(currentBookmark);
	if(proceed){
		//var currentBookmark = {title: title2, dateAdded: date, url: url2};
		
		
		currentBookmark.title = currentBookmark.title.replace(/[<>]/g, '');
		console.log(currentBookmark);
		
		addUpdateBookmarkForm(currentBookmark);
		closeTab();

	}
	
}

function addUpdateBookmarkForm(bookmarkObj){
	//bookmarkObj.url
	//var bookmarkObj = {title: title, dateAdded: date, url: url, tags:tags};
	//don't use the new date if in db already
	
	async.waterfall([
				function(callback){
				//does url exist?
					
					var store = dbTransaction(store_name, 'readonly');
					var index = store.index('url');
					var find = index.get(bookmarkObj.url);
					find.onsuccess = function(event) {

						if (event.target.result != null){
							//update if necessary
							
							var update = false;
	
	
							if($(event.target.result.tags).not(bookmarkObj.tags).length != 0 || $(bookmarkObj.tags).not(event.target.result.tags).length != 0){
								update = true;
							}
							
							else if (event.target.result.title != bookmarkObj.title){
								update = true;
							}
							
							if(update){
								bookmarkObj.dateAdded = event.target.result.dateAdded;
								bookmarkObj.id = event.target.result.id;
								bookmarkObj.url = event.target.result.url;
								
								/*var store = dbTransaction(store_name, 'readwrite');
								var req;
								req = store.put(bookmarkObj);
								req.onsuccess = function(event) {*/

									callback(null,bookmarkObj);
								/*};
								req.onerror = function() {
								  console.log("addPublication error", this.error);
								};*/
								
							}
						}
						else{
							//add
							//var id = -1
							//var bookmarkInfo = {id: -1, title: item[0].title, url: item[0].url, dateAdded: item[0].dateAdded, tags: [item[1].title]}
							
								/*var store = dbTransaction(store_name, 'readwrite');
								var req;
								req = store.put(bookmarkObj);
								req.onsuccess = function(event) {*/

									callback(null,bookmarkObj);
								/*};
								req.onerror = function() {
								  console.log("addPublication error", this.error);
								};*/
						}
						

					//	callback(null, bookmarkObj);

				   }
				   find.onerror = function(event) {
						console.log("Error:",event);

				   }
				},
				function(bookmarkObj, callback){
				//edit db
					
					if(bookmarkObj.id == -1){
						//add
						delete bookmarkObj.id;						
						
						var store = dbTransaction(store_name, 'readwrite');
						var req = store.add(bookmarkObj);
						req.onsuccess = function(event) {
							console.log("Insertion in DB successful");

							callback();
						};
						req.onerror = function() {
						  console.log("addPublication error", this.error);
						};
					}
					else{
						//update
						
						var store = dbTransaction(store_name, 'readwrite');
						var req = store.put(bookmarkObj);
						req.onsuccess = function(event) {
							console.log("Insertion in DB successful");

							callback();
						};
						req.onerror = function() {
						  console.log("addPublication error", this.error);
						};
					}
					
					
				}

			], function (err) {
				console.log(err);

			});
}



function openManager(){
	window.location.href=managerPage;

}

//prefills the title input area in the form and sets the url
function prefillForm(){

	async.waterfall([
				function(callback){
				//get tab info
			
			chrome.tabs.getCurrent(function tabCloser(obj){
		
		var currentIndex = obj.index;
	
	chrome.tabs.query({index : currentIndex - 1}, function findObj(focusedObj){
		
		var originalTitle = focusedObj[0].title;
		url = focusedObj[0].url;
		
							callback(null, originalTitle);
		
		});
	});
						

	


				},
				function(originalTitle, callback){
				//search db and prefill form
					
					var store = dbTransaction(store_name, 'readonly');
					var index = store.index('url');
					var find = index.get(url);
					find.onsuccess = function(event) {

						if (event.target.result != null){
							//url exists
							
							for(var gg in event.target.result.tags){
								console.log('here is a tag',event.target.result.tags);
								$('.ui-widget-content .ui-autocomplete-input').simulate("key-sequence", {sequence: event.target.result.tags[gg] + ' '});
								
							}
								
							$('#title').each(function(){
								$(this).val( event.target.result.title );
							});
						}
						else{
							$('#title').each(function(){
								$(this).val( originalTitle );
							});
						}
						
				   }
				   find.onerror = function(event) {
						console.log("Error:",event);

				   }
				}

			], function (err) {
				console.log(err);

			});
}

		
