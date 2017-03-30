import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import Bookmarklet from './Bookmarklet';
import { js_beautify as beautify } from 'js-beautify';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/vim';

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
		this.handleDragover = this.handleDragover.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
		this.updateSource = this.updateSource.bind(this);
	}

	componentDidMount () {
		window.addEventListener('dragover', this.handleDragover);
		window.addEventListener('drop', this.handleDrop);
	}

	componentWillUnmount () {
		window.removeEventListener('dragover', this.handleDragover);
		window.removeEventListener('drop', this.handleDrop);
	}

	handleDragover (e) {
		e.preventDefault();
	}

	handleDrop (e) {
		e.preventDefault();
		[...e.dataTransfer.items].forEach((item) => {
			item.getAsString((str) => {
				if (str.substring(0, 11) === 'javascript:') {
					this.importBookmarklet(str);
				}
			});
		});
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

        updateEditorKeymap (keymap) {
          this.editorOptions.keyMap = keymap;
          debugger;
        }

	importBookmarklet (string) {
		const match = string.match(/^javascript:void\(\(\) ?=> ?{(.*?)}\)\(\);?$/);
		if (!match) {
			// Could not detect source
			// Exit early
			return;
		}
		const contents = match[1];
		const source = beautify(contents, {
			indent_size: 2,
		});
		this.updateSource(source);
	}

	render () {
		const { source } = this.state;
		return (
			<div className="bookmarklet-generator">
                                <select name="keymap" onChange={this.updateEditorKeymap }>
                                <option value="default">Default</option>
                                <option value="vim">Vim</option>
                                </select>
                                <br />
				<div className="source-container">
					<CodeMirror
						value={ source }
						onChange={ this.updateSource }
						options={ this.editorOptions }
					/>
				</div>
			</div>
		);
	}
}
