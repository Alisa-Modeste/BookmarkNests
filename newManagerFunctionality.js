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

//the containers for the items filtered by isotope
var $container = $('#container');
var $choice = $('#tag_choice');//should be 
var $chosen = $('#tags_chosen');

var selector;

    $container.isotope({
      itemSelector : '.color-shape',
	  layoutMode:'straightDown'
    });
	
	$choice.isotope({
      itemSelector : '.tag',
    layoutMode : 'fitRows'
   
    });
	
	$chosen.isotope({
      itemSelector : '.tag',
   layoutMode : 'fitRows'
   
    });
	
$chosen.isotope({ filter: '.clicked' });


 $(function(){
	
	//For choice and chosen
	var chosenTags = [];

	  
	var items = []; // Declare item array up here so our custom function can use it as well as doc-ready stuff

	  
	

	
    // filter buttons
    $('.filter a').click(function(){
      var $this = $(this);
	  
	  var $section = $this.parents('.option-set');
	 

	  // store filter value in object
      // i.e. filters.color = 'red'
 	  
	  $section = $section.attr('data-filter-group');
	  
	  //if tag clicked in choice section
	  if( $section == 'color'){
		chosenTags.push($this.attr('data-filter-value'));
		console.log('adding');
		
		$this.parents('li').addClass('clicked');
		
		var $correctValue = $this.attr('data-filter-value');
		$correctValue = $correctValue.replace('=','\\=');
		$('#tags_chosen').find('*[data-filter-value="' + $correctValue +'"]').parents('li').addClass('clicked');
	}
	//otherwise is was clicked in the chosen section
	else{

		removeByValue(chosenTags,$this.attr('data-filter-value'));
		console.log('subtracting');
		
		$this.parents('li').removeClass('clicked');
		
		var $correctValue = $this.attr('data-filter-value');
		$correctValue = $correctValue.replace('=','\\=');
		$('#tag_choice').find('*[data-filter-value="' + $correctValue +'"]').parents('li').removeClass('clicked');
		
	}

	  if(typeof(selector) != 'string'){
		chosenTags.push(':not(.miss):not(.hidden)');
	  }
	  selector = chosenTags.join('');
      $container.isotope({ filter: selector });
	  console.log(selector);
	  
		tagFilter();
		updateTags();

      return false;
    });

	      // convert object into array
	
	function removeByValue(arr, val) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}






//=============================
       // stick items into the array declared above as a series of objects
		$('p.name').each(function(){
                var tmp = {};
                tmp.id = $(this).parent().attr('id');
                tmp.name = ($(this).text().toLowerCase());
                items.push( tmp );
        });
                
        // User types in search box - call our search function and supply lower-case keyword as argument
        $('#search').bind('keyup', function() {
                isotopeSearch( $(this).val().toLowerCase(), selector );
        });
        
        // User clicks 'show all', make call to search function with an empty keyword var
        $('#showAll').click(function(){
                $('#search').val(''); // reset input el value
                isotopeSearch(false); // restores all items
				
				$('#tag_choice').find('li').removeClass('clicked hidden');
				
				$('#tags_chosen').find('li').removeClass('clicked');
				
				tagFilter()
				
				chosenTags = [];
				
                return false;   
        });
                


/**
 * Function takes single keyword as argument,
 * checks array of item objects and looks for substring matches between item.name and keyword,
 * if matches are found calls isotope.filter() function on our collection.
 */
function isotopeSearch(kwd,selector){
        // reset results arrays
        var matches = [];
        var misses = [];

        $('.item').removeClass('match miss'); // get rid of any existing classes
        $('#noMatches').hide(); // ensure this is always hidden when we start a new query

        if ( (kwd != '') && (kwd.length >= 2) ) { // min 2 chars to execute query:
                
                // loop through items array             
				$.each(items, function(index,value){
                        if ( value.name.indexOf(kwd) !== -1 ) { // keyword matches element
                                matches.push( $('#'+value.id)[0] );
                        } else {
                                misses.push( $('#'+value.id)[0] );
                        }
                });

				
				//make sure both the title and url don't contain search terms
				for (var i=0;i< misses.length;i++){
					for (var j =0;j<matches.length;j++){
						if(misses[i] == matches[j]){
							//remove from misses
							misses.splice(i, 1);
							i--;
							break;
						}
					}
					
				}

				// add appropriate class and call isotope.filter
				$(misses).addClass('miss');
			
			updateTags();
                
				if(typeof(selector) !== 'undefined'){

						$container.isotope({ filter: selector });
				}
				else{
						  $container.isotope({ filter: ':not(.miss):not(.hidden)' }); 
				}
				
                if (matches.length == 0) {
                        $('#noMatches').show(); // deal with empty results set
                }
				$('#tooShort').hide();
                
        } else {
                // show all if keyword less than 2 chars
                if(typeof(selector) !== 'undefined'){
					 // var selector = isoFilters2.join('');
						$container.isotope({ filter: selector });
				}
				else{
						  $container.isotope({ filter: '.item' }); 
				}
				if(kwd.length == 1) {
                        $('#tooShort').show(); // respond to user
                }
				else if(kwd.length == 0)
				{
					$('#tooShort').hide();
				}
				
        }


}

//find out which tags are left and filter out the rest
function updateTags(){

	setTimeout(function() { 
	var tagsLeft = [];
	
	$('#container').children().each(function(){
   var $hi = $(this).attr('class'); // This is your rel value
 
   if($hi.indexOf('isotope-hidden') == -1){
		$(this).find('span').each(function(){

		var gg = $(this).text()
		
		tagsLeft.push(gg);

		});
		tagsLeft = uniqueArray(tagsLeft);
		
   }
   
});

//filter out non-existing tags
$('#tag_choice').find('li').each(function(){
		
	 var $hi = $(this).attr('class'); 
   if($hi.indexOf('isotope-hidden') == -1){

		
		$(this).find('a').each(function(){
		

		var gg = $(this).text()
		for(var i=0;i<tagsLeft.length;i++){
			if(gg == tagsLeft[i]){
				break;
			}
			else if(i==tagsLeft.length-1){

				$(this).parents('li').addClass('hidden');
			}
		}
	});
	}
	else if($hi.indexOf('clicked') == -1){
		$(this).find('a').each(function(){
	

		var gg = $(this).text()
		for(var i=0;i<tagsLeft.length;i++){
			if(gg == tagsLeft[i]){
				$(this).parents('li').removeClass('hidden');
				break;
			}

		}
		});
	}
	
   });
   



//apply filter
tagFilter();

	},1000);
	
}

//after changing the classes, trigger the isotope filter for the tag sections
function tagFilter(){
		$chosen.isotope({ filter: '.clicked' }); 
		
		$choice.isotope({ filter: ':not(.clicked):not(.hidden)' });
		
}


$('#container a').hover(function(){
	
	$(this).find('.tagit-choice').addClass('ui-state-hover');
	$(this).css({'background-color':'white','border':'2px solid white'});
},function(){

	$(this).find('.tagit-choice').removeClass('ui-state-hover');
	$(this).css({'background-color':'#9CB770','border':'0'});
});



  });
  
var autoHeight = true;

  $('input#editPosition').toggle(function() {
$('#container a').on('click', function(e) {
	e.preventDefault();
	var gg = $(this).find('ul').attr('id');
	
	//get bookmark based upon key
	var store = dbTransaction(store_name, 'readonly');
	
	gg = parseInt(gg)
	var keyRange = IDBKeyRange.only(gg);
	var cursorRequest = store.openCursor(keyRange);
 
 var record;
  cursorRequest.onsuccess = function(event) {

		if (event.target.result != null){
			record = event.target.result.value;
			console.log('the info is',record.title,event);
		}
		else{
			console.log('oops',event);
		}
		
	
	//show dialog box
	$("#popup").dialog({
	
	modal: true,
	width:'500px',
	dialogClass: 'editor',
	stack: true,
	title: 'Edit Bookmark',
	autoOpen: false
	
	});
	
	$("#popup").dialog('open');
	
	//for some reason the first time to popup is opened it's height is too small.
	if(autoHeight){
		autoHeight = false;
		console.log('it\'s not false');
		$("#popup").dialog('close');
		setTimeout(function(){$("#popup").dialog('open');}, 5);
		
	}
	
	//append the form and its values - title and tags
	$("#popup").children().remove();
	
	$("#popup").append("<form id='form1'><input type='hidden' class='key' id='" + record.id + "' /><p><label>Title </label><input name='title' id='title' value='" + record.title + "' tabindex='0'/></p><p><label style='display:inline'>Tags </label> <ul class='myTagsB' id='tagBar'></ul></p><p><button id='tags' type='button'>View Current Tags </button></p><p><button type='submit' id='update'>Save</button> <button id='delete'>Delete</button> <button type='reset' id='cancel'>Cancel</button></p></form> ");
	console.log("I should be on - editor");

	for(var i in record.tags){
	$("#popup ul").append("<li class='myTagsB'>" + record.tags[i] + "</li>");
	}	
	
	//the form uses the regular styling
	$(".myTagsB").tagit();
		
		
		
	$('#tags,#update,#delete,#cancel').on('click',function(e){

e.preventDefault();

switch($(this).attr('id')){
	case "tags":
		showTags(e);
		break;
	
	case "update":
		var tags = [];
		$(this).parents('form').find('input:not([class]):not([id])').each(function(){
			console.log('two',$(this).parents('li').children('span').text());
			tags.push($(this).parents('li').children('span').text());
		});

		var title = $(this).parents('form').find('input#title').val()
	
		var id = $(this).parents('form').children('input.key').attr('id');
		id = parseInt(id);
		console.log('id is',id);
		var formObj = {id: id, title: title, tags: tags};
		console.log('formObj is',formObj);
		
		var proceed = formValidation(formObj, '#popup');
		if(proceed){
			formObj.title = formObj.title.replace(/[<>]/g, '');
			updateBookmark(formObj);
		}
		

		break;
		
	case "delete":
		
		var id = $(this).parents('form').children('input.key').attr('id');
		var title = $(this).parents('form').find('input#title').val()
		id = parseInt(id);
		console.log('id is',id);
		deleteBookmark(id,title);
		
		closePopup();
		break;
	
	case "cancel":
		closePopup();
		break;
	}

});


	};
	

	
		
});
$("#editPosition").prop('value', 'Turn Off Edit Mode');
}, function(e) {

$('#container a').off('click');
	console.log("I should be off - editor");
	
$("#editPosition").prop('value', 'Turn On Edit Mode');	
});

function updateBookmark(bookmarkObj){
	//bookmarkObj.url
	//var bookmarkObj = {title: title, id: id, tags:tags};
	//don't use the new date if in db already
	
	async.waterfall([
				function(callback){
	
				//get dateAdded and url
					
					//var store = dbTransaction(store_name, 'readwrite');
					var store = dbTransaction(store_name, 'readonly');
					var keyRange = IDBKeyRange.only(bookmarkObj.id);
					console.log("the bookmark's id", bookmarkObj.id);
	var cursorRequest = store.openCursor(keyRange);
 
 var record;
  cursorRequest.onsuccess = function(event) {

			if($(event.target.result.value.tags).not(bookmarkObj.tags).length != 0 || $(bookmarkObj.tags).not(event.target.result.value.tags).length != 0){
								update = true;
							}
							
							else if (event.target.result.value.title != bookmarkObj.title){
								update = true;
							}
							
							if(update){
								bookmarkObj.dateAdded = event.target.result.value.dateAdded;
								bookmarkObj.id = event.target.result.value.id;
								bookmarkObj.url = event.target.result.value.url;
								
								
								var store = dbTransaction(store_name, 'readwrite');
								var req;
								req = store.put(bookmarkObj);
								req.onsuccess = function(event) {
									console.log("Moving on to the DB");
									//callback(null);
									callback(null,bookmarkObj);
								};
								req.onerror = function() {
								  console.log("addPublication error", this.error);
								};
								
							}
			
				   }
				   cursorRequest.onerror = function(event) {
						console.log("Error:",event);
				   }
				},
				function(bookmarkObj, callback){
				//edit manager 
	
					var id = $('#container #_'+bookmarkObj.id).find('ul').attr('id');
					$('#container #_'+bookmarkObj.id).find('ul').remove();

					
					$('#container #_'+bookmarkObj.id).append("<ul class='myTagsA' style='display:inline;' id='" + id + "'></ul></a>");
					
					for(var i in bookmarkObj.tags){
						$('#container #_'+bookmarkObj.id).find('ul').append("<li class='myTagsA'>" + bookmarkObj.tags[i] + "</li>");
						
					}	
	
	$(".myTagsA").tagitRows(editOff);
	
	
	$('#container #_'+bookmarkObj.id  + ' .title').text(bookmarkObj.title);
					closePopup()
						}
						
						
					
			], function (err) {
			//on to the next one, if applicable
				console.log(err);

			});
}

//delete the bookmark from db and hide from view
function deleteBookmark(id,title){

  	$("#deleteWarning").dialog({
	
	modal: true,
	width:'500px',
	dialogClass: 'deleteMsg',
	stack: true,
	title: 'WARNING',
	autoOpen: false
	
	});
	
	$("#deleteWarning").dialog('open');
	
	$("#deleteWarning").children().remove();
  
  //are you sure? message
  $("#deleteWarning").append("<p>Are you sure you want to delete \"" + title + "\"?</p><p><input type='button' id='deleteYes' value='Delete'/>   <input type='button' id='deleteNo' value='Cancel'/>");
  
  $('#deleteYes,#deleteNo').on('click',function(){
	
	
	switch($(this).attr('id')){
		case "deleteYes":
			//console.log('id:',id,'title',title);
			var store = dbTransaction(store_name, 'readwrite')
			var req = store.delete(id);
			req.onsuccess = function(event) {
				console.log('It\'s gone.');
				$("#deleteWarning").dialog('close');
				$('#container #_'+id).addClass('hidden');
		//filter. check to see if selector or isoFilter is defined
		if(typeof(selector) !== 'undefined'){
					 // var selector = isoFilters2.join('');
						$container.isotope({ filter: selector });
				}
				else{
						  $container.isotope({ filter: ':not(.miss):not(.hidden)' }); 
				}
			}
			break;
		
		case "deleteNo":
			$("#deleteWarning").dialog('close');
			break;
	}
	});

  //closePopup();
}

//close the form used to edit a bookmark
function closePopup(){
	$("#popup").dialog('close');
}

$('#close').on('click',function(){
	closeTab();
});