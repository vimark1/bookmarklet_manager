import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import { js_beautify as beautify } from 'js-beautify';

import safeEval from 'safe-eval';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/vim';

import BookmarkletChrome from '../Chrome.jsx'

const LOCAL_STORAGE_KEY = 'bookmarklet-generator-state';

export default class BookmarkletGenerator extends Component {
  constructor (props) {
    super(props);
    this.state = this.retrieveState() || {
      source: '',
      title: 'Untitled bookmarklet',
    };
    this.editorOptions = {
      mode: 'javascript',
      keyMap: 'default',
      lineNumbers: true,
    };
    this.chrome = new BookmarkletChrome();
    this.updateSource = this.updateSource.bind(this);
    this.saveSource = this.saveSource.bind(this);
    // this.updateEditorKeymap = this.updateEditorKeymap.bind(this);
  }

  componentDidMount () {
  }

  componentWillUnmount () {
  }

  persistState (state) {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    } catch (err) {
      // Ignore errors
    }
  }

  retrieveState () {
    try {
      const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
      return JSON.parse(serialized);
    } catch (err) {
      return null;
    }
  }

  updateSource (source) {
    this.setState({
      source,
    }, () => this.persistState(this.state));
  }

  saveSource () {
    const { source } = this.state;

    const updatedSource = `
      (function Namespace() {
        ${source}
        if(main) return main();
      })();
    `;

    const functions = safeEval(updatedSource);

    this.chrome.sync(functions)
      .then(result => console.info(result))
      .catch(err => alert(`Error: ${err}`));
  }

  updateEditorKeymap (keymap) {
    this.editorOptions.keyMap = keymap.target.value;
  }

  render () {
    const { source } = this.state;
    return (
      <div className="bookmarklet-generator">
        <p>All you need to do is define your functions here, then define a function called <code>main</code> which returns an array of all the functions you want to create as bookmark</p>
        <div className="source-container">
          <CodeMirror value={ source } onChange={ this.updateSource } options={ this.editorOptions } />
        </div>
        <br />
        <button className="save-btn" onClick={ this.saveSource } >Save</button>
      </div>
    );
  }
}
