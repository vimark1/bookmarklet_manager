import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';

import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';

import { Grid, Row, Col } from 'react-flexbox-grid';

import safeEval from 'safe-eval';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/vim';

import BrowserBookmarkManager from '../BrowserBookmarkManager';

const LOCAL_STORAGE_KEY = 'bookmarklet-generator-state';

export default class BookmarkletGenerator extends Component {
  constructor (props) {
    super(props);
    this.state = this.retrieveState() || {
      source: '',
      keyMap : 'default',
      title: 'Untitled bookmarklet',
      error : null,
      message : null,
      open : false,
    };

    // state error is always null
    this.state.error = null;

    this.editorOptions = {
      mode: 'javascript',
      keyMap: 'default',
      lineNumbers: true,
    };
    this.browserBookmarksManager = new BrowserBookmarkManager();
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
    const functions = safeEval(`
      (function Namespace() {
        ${source}
        if(main) return main();
      })();
    `);

    this.browserBookmarksManager.sync(functions)
      .then(result => console.info(result))
      .catch(err => {
        this.setState({
          open: true,
          message: `Error: ${err.toString()}`
        });
      });
  }

  updateEditorKeymap (keymap) {
    this.editorOptions.keyMap = keymap.target.value;
  }

  // <List>
  //   <Subheader inset={true}>Bookmarks</Subheader>
  //   <ListItem
  //     leftAvatar={<Avatar icon={<FileFolder />} />}
  //     primaryText="Something else"
  //     secondaryText="Jan 9, 2014"
  //   />
  //   <ListItem
  //     leftAvatar={<Avatar icon={<FileFolder />} />}
  //     primaryText="Photos"
  //     secondaryText="Jan 9, 2014"
  //   />
  //   <ListItem
  //     leftAvatar={<Avatar icon={<FileFolder />} />}
  //     primaryText="Photos"
  //     secondaryText="Jan 9, 2014"
  //   />
  // </List>

  render () {
    const { source } = this.state;
    return (
      <Grid fluid>
        <Row>
          <Col md={12}>
            <p>All you need to do is define your functions here, then define a function called <code>main</code> which returns an array of all the functions you want to create as bookmark</p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <RaisedButton fullWidth={false} primary={true} label="Save" onClick={ this.saveSource } />
            { /* <pre>{ JSON.stringify(this.state, null, 2) }</pre> */ }
            <Snackbar
              open={this.state.open}
              message={this.state.message}
              autoHideDuration={3000}
            />
            <br />
            <br />
          </Col>
        </Row>
        <Row>
          <Col md={9} className="source-container">
            <CodeMirror value={ source } onChange={ this.updateSource } options={ this.editorOptions } />
          </Col>
          <Col md={3} className="sidebar">
            Settings:
            {/*
            <SelectField floatingLabelText="Key mapping" value={this.state.keyMap}>
              <MenuItem value={1} primaryText={ "Default" } />
              <MenuItem value={2} primaryText={ "Vim" } />
            </SelectField>
            */}
          </Col>
        </Row>
      </Grid>
    );
  }
}
