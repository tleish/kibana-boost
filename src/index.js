import DocViewerObserver from './lib/DocViewerObserver'
import DocViewerFormater from './lib/DocViewerFormat'
import DocViewerButtons from './lib/DocViewerButtons'
import ButtonHandler from "./lib/ButtonHandler";
import NavRowButtons from "./lib/NavRowButtons";
import CsvDownloader from "./lib/CsvDownloader";
import JsonToCsvConverter from "./lib/JsonToCsvConverter";
import XHRListener from "./lib/XHRListener";
import DataStorage from "./lib/DataStorage";
import css from './assets/style.css';

const discoverUrlPattern = 'http://127.0.0.1:9200/_plugin/kibana/app/kibana#/discover';
function runForDiscover() {
  if (!window.location.href.startsWith(discoverUrlPattern)) {
    return;
  }

  // check if hljs is already loaded
  if (!window.hljs) {
    GM_addElement('link', {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/xcode.min.css',
      rel: 'stylesheet'
    });
    GM_addElement('script', {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
      type: 'text/javascript'
    });
    GM_addStyle(css);
  }


  (new DocViewerObserver((parent) => {
    DocViewerFormater.for(parent)
    DocViewerButtons.for(parent);
  })).start();
}

function initDiscoverDownloadCsv() {
  let discoverResponseDataElement = document.getElementById('discover-response-data');
  if (!window.location.href.startsWith(discoverUrlPattern) || discoverResponseDataElement) {
    return;
  }

  discoverResponseDataElement = document.createElement('script');
  discoverResponseDataElement.id = 'discover-response-data';
  discoverResponseDataElement.type = 'application/json';
  document.head.appendChild(discoverResponseDataElement);

  const dataStorage = new DataStorage(discoverResponseDataElement);
  const shouldIntercept = (url) => url.includes('/_plugin/kibana/elasticsearch/_msearch');
  new XHRListener(dataStorage, shouldIntercept);

  const navRowButtons = new NavRowButtons();

  const exportButton = new ButtonHandler('download-discover-response-data', ' Export ', () => {
    const data = dataStorage.getData();
    const csv = JsonToCsvConverter.convert(data);
    CsvDownloader.download(csv);
  });

  navRowButtons.addButton(exportButton.button, 'button.kuiLocalMenuItem[data-test-subj="shareTopNavButton"]');
  navRowButtons.observe();
}

function run() {
  runForDiscover();
  initDiscoverDownloadCsv();
}

// Check the URL immediately
run();

// Optionally, listen for changes in the URL (e.g., for single-page applications)
window.addEventListener('hashchange', run, false);


