import PanelObserver from 'PanelObserver';

describe('PanelObserver', () => {
  let callbackMock;
  let panelObserver;
  let mutationObserverMock;
  let observeMock;
  let disconnectMock;
  let mutationCallback;

  beforeEach(() => {
    // Set up the callback function
    callbackMock = jest.fn();

    // Mock the MutationObserver and its methods
    observeMock = jest.fn();
    disconnectMock = jest.fn();

    mutationObserverMock = jest.fn((callback) => {
      mutationCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
      };
    });

    global.MutationObserver = mutationObserverMock;

    // Instantiate the PanelObserver
    panelObserver = new PanelObserver('.panel', 'target text', callbackMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should initialize and start observing the document body', () => {
    panelObserver.init();
    expect(observeMock).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
  });

  test('should call the callback when a panel with the target text is found', () => {
    panelObserver.init();

    // Simulate adding a new panel element
    const newPanel = document.createElement('div');
    newPanel.classList.add('panel');
    newPanel.textContent = 'This is a panel with the target text';
    document.body.appendChild(newPanel);

    // Trigger the mutation observer callback
    mutationCallback([{ type: 'childList', addedNodes: [newPanel] }]);

    expect(callbackMock).toHaveBeenCalledWith(newPanel);
    expect(disconnectMock).toHaveBeenCalled();
  });

  test('should not call the callback if no panel with the target text is found', () => {
    panelObserver.init();

    // Ensure no panel is present initially
    expect(document.querySelector('.panel')).toBeNull();

    // Simulate adding a new panel element without the target text
    const newPanel = document.createElement('div');
    newPanel.classList.add('no-panel');
    newPanel.textContent = 'This is a panel without the target text';
    document.body.appendChild(newPanel);

    // Trigger the mutation observer callback
    mutationCallback([{ type: 'childList', addedNodes: [newPanel] }]);

    expect(callbackMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  test('should stop observing after finding the panel with the target text', () => {
    panelObserver.init();

    // Simulate adding a new panel element
    const newPanel = document.createElement('div');
    newPanel.classList.add('panel');
    newPanel.textContent = 'This is a panel with the target text';
    document.body.appendChild(newPanel);

    // Trigger the mutation observer callback
    mutationCallback([{ type: 'childList', addedNodes: [newPanel] }]);

    // Simulate adding another panel after the observer has been disconnected
    const anotherPanel = document.createElement('div');
    anotherPanel.classList.add('panel');
    anotherPanel.textContent = 'Another panel with the target text';
    document.body.appendChild(anotherPanel);

    // Ensure the callback is not called again and the observer is disconnected
    expect(callbackMock).toHaveBeenCalledTimes(1);
    expect(disconnectMock).toHaveBeenCalled();
  });
});
