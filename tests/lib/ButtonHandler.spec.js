import ButtonHandler from 'ButtonHandler';

describe('ButtonHandler', () => {
  let buttonHandler;
  const mockCallback = jest.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    buttonHandler = new ButtonHandler('testButton', 'Click Me', mockCallback);
    document.body.appendChild(buttonHandler.button);
  });

  test('should create a button with the correct id and text', () => {
    const button = document.getElementById('testButton');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Click Me');
  });

  test('should add the correct classes to the button', () => {
    const button = document.getElementById('testButton');
    expect(button.classList.contains('kuiLocalMenuItem')).toBe(true);
  });

  test('should call the callback when the button is clicked', () => {
    const button = document.getElementById('testButton');
    button.click();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
