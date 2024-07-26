export default class XHRListener {
  constructor(dataStorage, shouldListen) {
    this.dataStorage = dataStorage;
    this.shouldListen = shouldListen;
    this.init();
  }

  init() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const listener = this;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._shouldListen = listener.shouldListen(url);
      this._method = method;
      this._url = url;
      this._requestHeaders = {};
      return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      if (this._shouldListen) {
        this._requestHeaders[header] = value;
      }
      return originalSetRequestHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
      if (this._shouldListen) {
        const requestData = {
          method: this._method,
          url: this._url,
          headers: this._requestHeaders,
          body: body
        };
        listener.dataStorage.storeData(JSON.stringify(requestData));
      }
      return originalSend.apply(this, arguments);
    };
  }
}
