import LocalStorageBookmarkManager from './LocalStorageBookmarkManager';
import ChromeBookmarkManager from './ChromeBookmarkManager';

export default class BookmarkManagerFactory {

  static getInstance() {
    const isChromeAvailable = !!(chrome && chrome.bookmarks);
    if(isChromeAvailable){
      return new ChromeBookmarkManager();
    }

    return new LocalStorageBookmarkManager();
  }
}
