import XHRListener from 'XHRListener';

describe('XHRListener', () => {
  let dataStorageMock;
  let shouldListenMock;
  let originalOpen;
  let originalSend;
  let originalSetRequestHeader;

  beforeEach(() => {
    // Mock dataStorage and shouldListen
    dataStorageMock = {
      storeData: jest.fn(),
    };
    shouldListenMock = jest.fn();

    // Mock XMLHttpRequest methods and properties
    originalOpen = XMLHttpRequest.prototype.open;
    originalSend = XMLHttpRequest.prototype.send;
    originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = jest.fn(function(method, url, ...rest) {
      this._shouldListen = shouldListenMock(url);
      this._method = method;
      this._url = url;
      this._requestHeaders = {};
      return originalOpen.apply(this, [method, url, ...rest]);
    });

    XMLHttpRequest.prototype.setRequestHeader = jest.fn(function(header, value) {
      if (this._shouldListen) {
        this._requestHeaders[header] = value;
      }
      return originalSetRequestHeader.apply(this, arguments);
    });

    XMLHttpRequest.prototype.send = jest.fn(function(body) {
      if (this._shouldListen) {
        const requestData = {
          method: this._method,
          url: this._url,
          headers: this._requestHeaders,
          body: body
        };
        dataStorageMock.storeData(JSON.stringify(requestData));
      }
      return originalSend.apply(this, arguments);
    });

    // Instantiate the XHRListener
    new XHRListener(dataStorageMock, shouldListenMock);
  });

  afterEach(() => {
    // Restore original XMLHttpRequest methods
    XMLHttpRequest.prototype.open = originalOpen;
    XMLHttpRequest.prototype.send = originalSend;
    XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader;
    jest.clearAllMocks();
  });

  test('should listen to specific URLs based on shouldListen', () => {
    const mockUrl = 'http://example.com/api';
    shouldListenMock.mockReturnValue(true);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);

    expect(shouldListenMock).toHaveBeenCalledWith(mockUrl);
    expect(xhr._shouldListen).toBe(true);
  });

  test('should not listen to URLs that shouldListen returns false for', () => {
    const mockUrl = 'http://example.com/api';
    shouldListenMock.mockReturnValue(false);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);

    expect(shouldListenMock).toHaveBeenCalledWith(mockUrl);
    expect(xhr._shouldListen).toBe(false);
  });

  test('should store request details when shouldListen is true', () => {
    const mockUrl = 'http://example.com/api';
    const mockBody = JSON.stringify({ key: 'value' });

    shouldListenMock.mockReturnValue(true);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', mockUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(mockBody);

    const expectedRequestData = JSON.stringify({
      method: 'POST',
      url: mockUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body: mockBody,
    });

    expect(dataStorageMock.storeData).toHaveBeenCalledWith(expectedRequestData);
  });
});
