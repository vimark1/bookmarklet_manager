import React from 'react';
import BookmarkletGenerator from './BookmarkletGenerator';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const App = () => (
  <MuiThemeProvider>
    <BookmarkletGenerator />
  </MuiThemeProvider>
);

export default App;
