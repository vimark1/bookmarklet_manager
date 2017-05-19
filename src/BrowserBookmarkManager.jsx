var debug = console.info;
// var debug = function() {};

import BookmarkManagerFactory from './BookmarkManagerFactory';

export default class BrowserBookmarkManager {

  constructor () {
    this.manager = BookmarkManagerFactory.getInstance();
  }

  /**
   * Receives the bookmarklet javascript functions as an array and create
   * folders and bookmarlets when required,  if nothing needs update, then
   * nothning happens
   */
  sync(bookmarkletFunctions) {
    const self = this;
    const bookmarkBarId = '1'; // this is the default bookmark id in chrome

    if(!Array.isArray(bookmarkletFunctions)) {
      return Promise.reject('No bookmarklet functions found');
    }

    if(bookmarkletFunctions.some(fun => typeof fun !== 'function')) {
      return Promise.reject('Not all itmes are functions');
    }

    const newBookmarkFolder = {
      parentId: bookmarkBarId,
      title: 'Bookmarklet manager'
    };

    return new Promise(function(resolve, reject) {
      self.createOrReuseFolder(bookmarkBarId, newBookmarkFolder, function(folderId) {
        var count = 0;
        bookmarkletFunctions.forEach(function(func) {
          var newBookmark = self.createBookmarkFromFunction(folderId, func);
          self.syncBookmark(folderId, newBookmark, function() {
            if(++count === bookmarkletFunctions.length) {
              self.removeUnusedFunctions(bookmarkletFunctions, folderId, function(err) {
                if(err) {
                  return reject(err);
                }
                resolve('Bookmarklet sync completed');
              });
            }
          });
        });
      });
    });
  }

  removeUnusedFunctions(functions, folderId, callback) {
    const self = this;
    functions = [...functions];
    if(!callback) {
      callback = function() {};
    }
    functions = functions.reduce(function(acc, cur) {
      acc[cur.name] = true;
      return acc;
    }, {});
    this.manager.getItems(folderId, function(children) {
      const toRemove = [];
      children.forEach(item => {
        if(!functions[item.title]){
          toRemove.push(item.id);
        }
      });
      let count = 0;
      toRemove.forEach(item => {
        self.manager.remove(item, function() {
          if(++count === toRemove.length) {
            callback(null, toRemove);
          }
        });
      });
    });
  }

  /**
   * Creates a folder when it doesn't yet exist and do nothing when it exists
   */
  createOrReuseFolder(parentFolderId, newFolder, callback) {
    if(!callback) {
      callback = function() {};
    }
    const manager = this.manager;
    manager.getItems(parentFolderId, function(children) {
      var existingFolder = children.filter(function(item) {
        return item.title === newFolder.title;
      });
      var folderExists = !!existingFolder.length;
      if(folderExists) {
        return callback(existingFolder[0].id);
      }
      manager.create(newFolder, function(createdFolder) {
        return callback(createdFolder.id);
      });
    });
  }


  /**
   * Create a new bookmark when it doesnt exist
   * Update the bookmark when it exists but the bookmarklet code has changes
   * Do nothing if nothing has changed
   */
  syncBookmark(folderId, newBookmark, callback) {
    if(!callback) {
      callback = function() {};
    }
    const manager = this.manager;
    manager.getItems(folderId, function(children) {
      var existingBookmark = children.filter(function(item) {
        return item.title === newBookmark.title;
      });
      var bookmarkExists = !!existingBookmark.length;
      if(bookmarkExists) {
        existingBookmark = existingBookmark[0];
        if(existingBookmark.url == newBookmark.url) {
          debug('no update required for ' + newBookmark.title);
          return callback(null);
        }
        var bookmarkUpdates = { url : newBookmark.url };
        manager.update(existingBookmark.id, bookmarkUpdates, function(createdBookmark) {
          debug('updated bookmark since code was different ' + newBookmark.title);
          return callback(createdBookmark.id);
        });
      } else {
        // when bookmark doesnt exist yet
        manager.create(newBookmark, function(createdBookmark) {
          debug(`created new bookmark ${newBookmark.title}`);
          return callback(createdBookmark.id);
        });
      }
    });
  }

  /**
   * Takes a javascript function and converts it to a bookmark object
   * accepted by chrome
   */
  createBookmarkFromFunction(parentId, func) {
    const title = func.name;
    const url = `javascript:(function() { ${func.toString()} ${title}.call(this); })();`;
    return {
      title,
      parentId,
      url
    };
  }

}


