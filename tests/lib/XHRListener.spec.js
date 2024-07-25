import XHRListener from 'XHRListener';

describe('XHRListener', () => {
  let dataStorageMock;
  let shouldListenMock;
  let xhrListener;
  let originalOpen;
  let originalSend;
  let mockXHR;

  beforeEach(() => {
    // Mock dataStorage and shouldListen
    dataStorageMock = {
      storeData: jest.fn(),
    };
    shouldListenMock = jest.fn();

    // Mock XMLHttpRequest methods and properties
    originalOpen = XMLHttpRequest.prototype.open;
    originalSend = XMLHttpRequest.prototype.send;

    mockXHR = {
      open: jest.fn(),
      send: jest.fn(),
      addEventListener: jest.fn(),
      responseText: '',
      _shouldListen: false,
    };

    XMLHttpRequest.prototype.open = jest.fn(function (...args) {
      mockXHR._shouldListen = shouldListenMock(args[1]);
      originalOpen.apply(this, args);
    });

    XMLHttpRequest.prototype.send = jest.fn(function (...args) {
      if (mockXHR._shouldListen) {
        this.addEventListener('load', function () {
          try {
            const data = JSON.parse(mockXHR.responseText).responses[0].hits.hits.map(hit => hit._source);
            dataStorageMock.storeData(JSON.stringify(data));
          } catch (error) {
            console.error('Error handling XHR response:', error);
          }
        });
      }
      originalSend.apply(this, args);
    });

    // Instantiate the XHRListener
    xhrListener = new XHRListener(dataStorageMock, shouldListenMock);
  });

  afterEach(() => {
    // Restore original XMLHttpRequest methods
    XMLHttpRequest.prototype.open = originalOpen;
    XMLHttpRequest.prototype.send = originalSend;
    jest.clearAllMocks();
  });

  test('should listen to specific URLs based on shouldListen', () => {
    const mockUrl = 'http://example.com/api';
    shouldListenMock.mockReturnValue(true);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);

    expect(shouldListenMock).toHaveBeenCalledWith(mockUrl);
    expect(mockXHR._shouldListen).toBe(true);
  });

  test('should not listen to URLs that shouldListen returns false for', () => {
    const mockUrl = 'http://example.com/api';
    shouldListenMock.mockReturnValue(false);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);

    expect(shouldListenMock).toHaveBeenCalledWith(mockUrl);
    expect(mockXHR._shouldListen).toBe(false);
  });

  test('should store data from XHR response when shouldListen is true', () => {
    const mockUrl = 'http://example.com/api';
    const mockResponse = {
      responses: [
        {
          hits: {
            hits: [
              { _source: { field1: 'value1' } },
              { _source: { field2: 'value2' } },
            ],
          },
        },
      ],
    };

    shouldListenMock.mockReturnValue(true);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);
    xhr.send();

    mockXHR.responseText = JSON.stringify(mockResponse);

    // Simulate the load event
    const loadEvent = new Event('load');
    xhr.dispatchEvent(loadEvent);

    expect(dataStorageMock.storeData).toHaveBeenCalledWith(
      JSON.stringify([
        { field1: 'value1' },
        { field2: 'value2' },
      ])
    );
  });

  test('should handle errors in XHR response parsing gracefully', () => {
    const mockUrl = 'http://example.com/api';

    shouldListenMock.mockReturnValue(true);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', mockUrl);
    xhr.send();

    mockXHR.responseText = 'Invalid JSON';

    // Mock console.error to suppress error logging in test output
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate the load event
    const loadEvent = new Event('load');
    xhr.dispatchEvent(loadEvent);

    expect(consoleErrorMock).toHaveBeenCalled;

    // Restore console.error
    consoleErrorMock.mockRestore();
  });
});
