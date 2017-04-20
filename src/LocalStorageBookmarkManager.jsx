import BookmarkManagerInterface from './BookmarkManagerInterface';

export default class LocalStorageBookmarkManager extends BookmarkManagerInterface {

  _storage() {
    localStorage['items'] = localStorage['items'] || '[]';
    let storage = localStorage['items'];
    return JSON.parse(storage);
  }

  _save(obj) {
    localStorage['items'] = JSON.stringify(obj);
  }

  getItems(id, callback) {
    let storage = this._storage();
    return callback(storage);
  }

  create(bookmarkObject, callback) {
    let storage = this._storage();
    storage.push(bookmarkObject);
    bookmarkObject.id = Date.now();
    this._save(storage);
    return callback(bookmarkObject);
  }

  update(id, bookmarkObject, callback) {
    let storage = this._storage();
    let index = false;
    storage.forEach((item, idx) => {
      if(item.id === id) {
        index = idx;
      }
    });

    if(index !== false) {
      storage[index] = Object.assign({}, storage[index], bookmarkObject);
    }

    this._save(storage);
    return callback(bookmarkObject);
  }
}

