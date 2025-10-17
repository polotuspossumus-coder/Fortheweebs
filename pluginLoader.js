const fs = require('fs');
const path = require('path');

function loadPlugins(app, pluginDir = './plugins') {
  fs.readdirSync(pluginDir).forEach(file => {
    const plugin = require(path.join(pluginDir, file));
    if (typeof plugin === 'function') plugin(app);
  });
}

module.exports = loadPlugins;
