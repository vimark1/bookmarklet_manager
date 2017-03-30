chrome.browserAction.onClicked.addListener(function(tab) {

  // chrome.tabs.executeScript(tab.id, {file: "bookmarklet.js"})

  var bookmarkBarId = 1;

  chrome.bookmarks.create({ parentId: bookmarkBarId, title: 'Bookmarklet manager' }, function(newFolder) {
    console.log("added folder: " + newFolder.title);
    debugger;
  });
});
