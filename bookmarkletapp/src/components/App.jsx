import React from 'react';
import BookmarkletGenerator from './BookmarkletGenerator';

const App = () => (
	<div className="app">
		<h1>
			<a href="https://en.wikipedia.org/wiki/Bookmarklet" title="'Bookmarklet' on Wikipedia">Bookmarklet</a>
		</h1>
		<BookmarkletGenerator />
	</div>
);

export default App;
