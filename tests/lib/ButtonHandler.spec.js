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
    expect(button.classList.contains('euiLink')).toBe(true);
    expect(button.classList.contains('euiLink--primary')).toBe(true);
  });

  test('should create an icon inside the button', () => {
    const button = document.getElementById('testButton');
    const icon = button.querySelector('i');
    expect(icon).not.toBeNull();
    expect(icon.classList.contains('fa')).toBe(true);
    expect(icon.classList.contains('fa-download')).toBe(true);
  });

  test('should call the callback when the button is clicked', () => {
    const button = document.getElementById('testButton');
    button.click();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
