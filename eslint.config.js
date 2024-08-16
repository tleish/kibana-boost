const jest = require('eslint-plugin-jest');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  {
    files: ['src/**/*.js'], // Specify the file pattern to match your JS files in src/
    ignores: ['test/**/*.spec.js'], // Optionally exclude specific files or patterns
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly', // Define browser globals
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        XMLHttpRequest: 'readonly',
        MutationObserver: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        GM_addElement: 'readonly',
        GM_addStyle: 'readonly',
        GM_openInTab: 'readonly',
        hljs: 'readonly',
        setTimeout: 'readonly',
      },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
    },
    rules: {
      'no-unused-vars': ["error", { "argsIgnorePattern": "^_" }],
      'no-undef': 'error',
    },
  },
  {
    files: ['test/**/*.spec.js', '**/__tests__/**/*.js'], // Specify the pattern for test files
    plugins: {
      jest: jest, // Use the Jest plugin
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        jest: 'readonly', // Define Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        window: 'readonly', // Include browser globals for test files as well
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        XMLHttpRequest: 'readonly',
        MutationObserver: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        GM_addElement: 'readonly',
        GM_addStyle: 'readonly',
        GM_openInTab: 'readonly',
      },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
    },
    rules: {
      // Add Jest-specific rules here
    },
  },
];
