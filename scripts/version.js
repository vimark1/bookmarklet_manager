
const json = require('json-update');
const packageJson = require('../package.json');

json.update('./manifest.json', { version : packageJson.version })
  .then(function(manifest) {
    console.log(manifest.version);
  });

