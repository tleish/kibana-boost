const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const cssStringPlugin = {
  name: 'css-string',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const fs = require('fs').promises;
      const css = await fs.readFile(args.path, 'utf8');
      return {
        contents: `export default ${JSON.stringify(css)};`,
        loader: 'js',
      };
    });
  },
};

let userScriptBanner = `
// ==UserScript==
// @name         Kibana Boost
// @namespace    https://github.com/tleish/
// @version      0.1
// @updateURL     https://github.com/tleish/kibana-boost/raw/main/dist/kibana_boost.meta.js
// @downloadURL   https://github.com/tleish/kibana-boost/raw/main/dist/kibana_boost.user.js
// @description  Updates Kibana view
// @match        http://127.0.0.1:9200/_plugin/kibana/app/kibana*
// @copyright    2024+, tleish
// @grant        GM_addElement
// @grant        GM_addStyle
// ==/UserScript==
`.trim();

// let metaScriptBanner = userScriptBanner;
// // Add the require directive to the banner if ENV is development
// if (process.env.NODE_ENV !== 'production') {
//   userScriptBanner += `\n// @require      file://${path.resolve(__dirname, 'dist/kibana_boost.dev.user.js')}`;
// }
//
// userScriptBanner += `\n// ==/UserScript==`;
// metaScriptBanner += `\n// ==/UserScript==`;


module.exports = {
  entryPoints: ['src/index.js'],
  bundle: true, // Ensure bundling is enabled
  outfile: 'dist/kibana_boost.user.js',
  minify: false, // Ensure minification is disabled to keep comments
  watch: process.env.NODE_ENV === 'development',
  // logLevel: 'verbose',
  resolveExtensions: ['.js', '.json'],
  platform: 'node',
  format: "iife", // wrap the output in (() => { ... })() to avoid polluting the global scope
  target: 'es2015',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  plugins: [
    cssStringPlugin,
    {
      name: 'meta-file',
      setup(build) {
        build.onEnd(async (result) => {
          await fs.promises.writeFile('dist/kibana_boost.meta.js', userScriptBanner);
          const searchValue = /(\/\/ ==\/UserScript==)/;
          const replaceValue = `// @require      file://${path.resolve(__dirname, 'dist/kibana_boost.user.js')}\n$1`;
          const userScriptUpdate = userScriptBanner.replace(searchValue, replaceValue);
          fs.writeFileSync('dist/kibana_boost.dev.meta.js', userScriptUpdate, 'utf8');
        });
      }
    }
  ],
  legalComments: 'inline', // Choose how to handle legal comments
  banner: { js: userScriptBanner }
};
