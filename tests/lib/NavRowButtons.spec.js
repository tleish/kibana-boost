import NavRowButtons from 'NavRowButtons';

describe('NavRowButtons', () => {
  let navRowButtons, mockObserver, mockMenu, button, afterButton;

  beforeEach(() => {
    // Create a mock MutationObserver and spy on observe method
    mockObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
    global.MutationObserver = jest.fn(function (callback) {
      this.observe = mockObserver.observe;
      this.disconnect = mockObserver.disconnect;
      this.trigger = (mutationsList) => callback(mutationsList);
    });

    // Create the NavRowButtons instance
    navRowButtons = new NavRowButtons();

    // Set up a mock menu and buttons
    mockMenu = document.createElement('div');
    mockMenu.classList.add('kuiLocalNavRow');
    document.body.appendChild(mockMenu);

    button = document.createElement('button');
    button.id = 'newButton';
    afterButton = '.afterButton';

    const existingButton = document.createElement('button');
    existingButton.classList.add('afterButton');
    mockMenu.appendChild(existingButton);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should instantiate with empty buttons array', () => {
    expect(navRowButtons.buttons).toEqual([]);
  });

  test('should call MutationObserver observe on observe method', () => {
    navRowButtons.observe();
    expect(mockObserver.observe).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
  });

  test('should add button to buttons array on addButton', () => {
    navRowButtons.addButton(button, afterButton);
    expect(navRowButtons.buttons.length).toBe(1);
    expect(navRowButtons.buttons[0]).toEqual({ button, afterButton });
  });

  test('should insert button after the specified element in the DOM', () => {
    navRowButtons.addButton(button, afterButton);

    // Simulate a DOM mutation
    navRowButtons.observer.trigger([
      {
        type: 'childList',
      },
    ]);

    // Verify button is inserted after the target element
    expect(mockMenu.children.length).toBe(2);
    expect(mockMenu.children[1]).toBe(button);

    // Verify that the observer is disconnected
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  test('should not insert button if button is already in the DOM', () => {
    navRowButtons.addButton(button, afterButton);
    mockMenu.appendChild(button); // Simulate the button already being in the DOM

    // Simulate a DOM mutation
    navRowButtons.observer.trigger([
      {
        type: 'childList',
      },
    ]);

    // Ensure button is not duplicated
    expect(mockMenu.children.length).toBe(2);
    expect(mockMenu.children[1]).toBe(button);
  });

  test('should do nothing if afterButton is not found', () => {
    navRowButtons.addButton(button, '.nonExistentButton');

    // Simulate a DOM mutation
    navRowButtons.observer.trigger([
      {
        type: 'childList',
      },
    ]);

    // Ensure button is not inserted
    expect(mockMenu.children.length).toBe(1);
    expect(mockMenu.children[0].id).not.toBe(button.id);
  });
});
