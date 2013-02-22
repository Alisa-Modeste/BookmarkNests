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

chrome.browserAction.onClicked.addListener(function(tab) {
	
//This is to put the manager one tab to the right
var myIndex = tab.index;
chrome.tabs.create({index : myIndex + 1, url: "mainMenu.html"});

});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabState){
	console.log('on update',changeInfo.url);
	console.log('using tab state',tabState.url);
	
		var store = dbTransaction(store_name, 'readonly');
		var index = store.index('url');
		var find = index.get(tabState.url);
		find.onsuccess = function(event) {

			if (event.target.result != null){
				console.log("Got it");
				chrome.browserAction.setBadgeText({text: 'YES',tabId: tabId });
			}
			else{
				console.log("Nope");
				chrome.browserAction.setBadgeText({text: 'NO',tabId: tabId });
			}
		};


});

chrome.tabs.onActivated.addListener(function(activeInfo){
	var id = activeInfo.tabId;
	console.log(id);

	chrome.tabs.get(id, function(info) {
		console.log('active changed',info.url);

		var store = dbTransaction(store_name, 'readonly');
		var index = store.index('url');
		var find = index.get(info.url);
		find.onsuccess = function(event) {

			if (event.target.result != null){
				console.log("Got it");
				chrome.browserAction.setBadgeText({text: 'YES',tabId: id });
			}
			else{
				console.log("Nope");
				chrome.browserAction.setBadgeText({text: 'NO',tabId: id });
			}
		};
	});

});