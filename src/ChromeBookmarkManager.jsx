import BookmarkManagerInterface from './BookmarkManagerInterface';

export default class ChromeBookmarkManager extends BookmarkManagerInterface {
  getItems(id, callback) {
    return chrome.bookmarks.getChildren(id, callback);
  }

  create(bookmarkObject, callback) {
    return chrome.bookmarks.create(bookmarkObject, callback);
  }

  update(id, bookmarkObject, callback) {
    return chrome.bookmarks.update(id, bookmarkObject, callback);
  }

  remove(id, callback) {
    return chrome.bookmarks.remove(id, callback);
  }

}
