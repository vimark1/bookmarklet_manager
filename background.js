var debug = console.info;
// var debug = function() {};

chrome.browserAction.onClicked.addListener(function(tab) {
  var bookmarkBarId = '1';
  var bookmarkletFunctions = main();

  sync(bookmarkBarId, bookmarkletFunctions);
});

/**
 * Receives the bookmarklet javascript functions as an array and create
 * folders and bookmarlets when required,  if nothing needs update, then
 * nothning happens
 */
function sync(bookmarkBarId, bookmarkletFunctions) {
  var newBookmarkFolder = {
    parentId: bookmarkBarId,
    title: 'Bookmarklet manager (do not edit)'
  };

  createOrReuseFolder(bookmarkBarId, newBookmarkFolder, function(folderId) {
    var count = 0;
    bookmarkletFunctions.forEach(function(func, idx) {
      var funcAsString = func.toString();
      var funcExecStatement = func.name + '.call(this);';
      var newBookmark = {
        title: func.name,
        parentId: folderId,
        url: 'javascript:(function() { ' + funcAsString + funcExecStatement + ' })();'
      }
      syncBookmark(folderId, newBookmark, function(newBookmark) {
        if(++count === bookmarkletFunctions.length) {
          debug('Bookmarklet sync completed');
        }
      });
    });
  });
}

/**
 * Creates a folder when it doesn't yet exist and do nothing when it exists
 */
function createOrReuseFolder(parentFolderId, newFolder, callback) {
  if(!callback) {
    callback = function() {};
  }
  chrome.bookmarks.getChildren(parentFolderId, function(children) {
    var existingFolder = children.filter(function(item) {
      return item.title === newFolder.title;
    });
    var folderExists = !!existingFolder.length;
    if(folderExists) {
      return callback(existingFolder[0].id);
    }
    chrome.bookmarks.create(newFolder, function(createdFolder) {
      return callback(createdFolder.id);
    });
  });
}

/**
 * Create a new bookmark when it doesnt exist
 * Update the bookmark when it exists but the bookmarklet code has changes
 * Do nothing if nothing has changed
 */
function syncBookmark(folderId, newBookmark, callback) {
  if(!callback) {
    callback = function() {};
  }
  chrome.bookmarks.getChildren(folderId, function(children) {
    var existingBookmark = children.filter(function(item) {
      return item.title === newBookmark.title;
    });
    var bookmarkExists = !!existingBookmark.length;
    if(bookmarkExists) {
      var existingBookmark = existingBookmark[0];
      if(existingBookmark.url == newBookmark.url) {
        debug('no update required for ' + newBookmark.title);
        return callback(null);
      }
      var bookmarkUpdates = { url : newBookmark.url };
      chrome.bookmarks.update(existingBookmark.id, bookmarkUpdates, function(createdBookmark) {
        debug('updated bookmark since code was different ' + newBookmark.title);
        return callback(createdBookmark.id);
      });
    } else {
      // when bookmark doesnt exist yet
      chrome.bookmarks.create(newBookmark, function(createdBookmark) {
        return callback(createdBookmark.id);
      });
    }
  });
}

