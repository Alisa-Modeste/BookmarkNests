BookmarkNests
=============

A bookmark manager with nested tagging.

About
-----
This is a Google Chrome extension that is written in Javascript. It uses indexeddb. A screenshot can be viewed here: https://github.com/Alisa-Modeste/BookmarkNests/blob/master/screenshot.md

Instead of trying to decide which of your folders your bookmark is better suited for, put it in both "folders." BookmarkNests is capable of "dynamic folders." When searching through your bookmarks, click the first tag, or "folder," then pick one of the sub-tags. The installation guide is here: https://github.com/Alisa-Modeste/BookmarkNests/blob/master/INSTALLATION.md

####The current version is ideal for a smaller number of bookmarks. (i.e closer to 100 than 5000).

##Acknowledgements
###Functions
- traverseBookmarks() found in importingBookmarks.js. I used serg's function to traverse Chrome's bookmarks. http://stackoverflow.com/a/5571850/1689437
- I used "ISOTOPE LIVE SEARCH PROTO" by Charlie Perrins as a starting place to get the search part of the manager's filter setup. http://charlieperrins.com/isotope-live-search/

###Plugins
- jQuery UI (http://jqueryui.com/)
- jQuery Tag-it (http://aehlke.github.com/tag-it/)
- jQuery Simulate (https://github.com/eduardolundgren/jquery-simulate)
- Async.js (https://github.com/caolan/async)
- jQuery Isotope (https://github.com/desandro/isotope)
- jQuery.tagcloud.js (https://github.com/addywaddy/jquery.tagcloud.js/)

###Images
The icon is owned by mitopencourseware http://www.flickr.com/photos/mitopencourseware/4482555552/sizes/o/in/photostream/

###Layout
The stylesheet and layout is based upon this isotope demo: http://isotope.metafizzy.co/demos/combination-filters.html
