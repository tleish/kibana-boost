import DocViewerObserver from 'DocViewerObserver';

describe('DocViewerObserver', () => {
  let newChildrenCallback;
  let docViewerObserver;
  let mutationObserverMock;
  let observeMock;
  let disconnectMock;
  let mutationCallback;

  beforeEach(() => {
    // Set up the callback function
    newChildrenCallback = jest.fn();

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

    // Instantiate the DocViewerObserver
    docViewerObserver = new DocViewerObserver(newChildrenCallback);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should observe the document body for child list changes', () => {
    docViewerObserver.start();
    expect(observeMock).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
  });

  test('should observe new elements with the specified data-test-subj attribute', () => {
    const element = document.createElement('tr');
    element.setAttribute('data-test-subj', 'docTableDetailsRow');
    document.body.appendChild(element);

    docViewerObserver.observeNewElements();

    expect(observeMock).toHaveBeenCalledWith(element, {
      childList: true,
      subtree: false,
    });
  });

  test('should handle new children and call the callback function', () => {
    const parentElement = document.createElement('td');
    parentElement.classList.add('kbnDocViewer__value');
    const newElement = document.createElement('span');
    const spanElement = document.createElement('span');
    newElement.appendChild(spanElement);
    parentElement.appendChild(newElement);
    document.body.appendChild(parentElement);

    const mutation = {
      type: 'childList',
      addedNodes: [newElement],
      target: parentElement,
    };

    docViewerObserver.handleNewChildren([mutation]);

    expect(newChildrenCallback).toHaveBeenCalledWith(parentElement);
  });

  test('should not call the callback function for already observed elements', () => {
    const element = document.createElement('tr');
    element.setAttribute('data-test-subj', 'docTableDetailsRow');
    element.observed = true;
    document.body.appendChild(element);

    docViewerObserver.observeNewElements();

    expect(observeMock).not.toHaveBeenCalledWith(element, {
      childList: true,
      subtree: false,
    });
  });

  test('should apply the callback to new child elements', () => {
    const parentElement = document.createElement('td');
    const newElement = document.createElement('span');
    newElement.classList.add('kbnDocViewer__value');
    const spanElement = document.createElement('span');
    newElement.appendChild(spanElement);
    parentElement.appendChild(newElement);
    document.body.appendChild(parentElement);

    const mutation = {
      type: 'childList',
      addedNodes: [newElement],
      target: parentElement,
    };

    docViewerObserver.handleNewChildren([mutation]);

    expect(parentElement.classList.contains('doc-viewer-parent')).toBe(true);
    expect(newChildrenCallback).toHaveBeenCalledWith(parentElement);
  });

  test('should observe newly added rows and call the callback', () => {
    docViewerObserver.start();

    const newRow = document.createElement('tr');
    newRow.setAttribute('data-test-subj', 'docTableDetailsRow');
    const newCell = document.createElement('td');
    const newSpan = document.createElement('span');
    newSpan.classList.add('kbnDocViewer__value');
    const nestedSpan = document.createElement('span');
    newSpan.appendChild(nestedSpan);
    newCell.appendChild(newSpan);
    newRow.appendChild(newCell);
    document.body.appendChild(newRow);

    mutationCallback([{ type: 'childList', addedNodes: [newRow] }]);

    // Directly invoke the observeElement method for the newRow
    docViewerObserver.observeElement(newRow);

    // Simulate the mutation on the newRow
    const childMutation = {
      type: 'childList',
      addedNodes: [newSpan],
      target: newRow,
    };
    docViewerObserver.handleNewChildren([childMutation]);

    expect(observeMock).toHaveBeenCalledWith(newRow, {
      childList: true,
      subtree: false,
    });
    expect(newChildrenCallback).toHaveBeenCalledWith(newCell);
  });
});
