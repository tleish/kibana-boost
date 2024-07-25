export default class XHRListener {
  constructor(dataStorage, shouldListen) {
    this.dataStorage = dataStorage;
    this.shouldListen = shouldListen;
    this.init();
  }

  init() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const listener = this;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._shouldListen = listener.shouldListen(url);
      return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      if (this._shouldListen) {
        this.addEventListener('load', function() {
          try {
            const data = JSON.parse(this.responseText).responses[0].hits.hits.map(hit => hit._source);
            listener.dataStorage.storeData(JSON.stringify(data));
          } catch (error) {
            console.error('Error handling XHR response:', error);
          }
        });
      }
      return originalSend.apply(this, args);
    };
  }
}
