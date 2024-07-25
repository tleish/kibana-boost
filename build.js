const esbuild = require('esbuild');
const config = require('./esbuild.config.js');

const isWatchMode = process.argv.includes('--watch');

esbuild.build({
  ...config,
  watch: isWatchMode ? {
    onRebuild(error, result) {
      if (error) console.error('Watch build failed:', error);
      else console.log('Watch build succeeded:', result);
    },
  } : false,
}).catch(() => process.exit(1));
