export default class ButtonHandler {
  constructor(buttonId, buttonText, onClickCallback) {
    this.buttonId = buttonId;
    this.buttonText = buttonText;
    this.onClickCallback = onClickCallback;
    this.button = this.createButton();
  }

  createButton() {
    const icon = document.createElement('i');
    icon.classList.add('fa', 'fa-download');

    const button = document.createElement('button');
    button.id = this.buttonId;
    button.textContent = this.buttonText;
    button.classList.add('euiLink', 'euiLink--primary');
    button.addEventListener('click', this.onClickCallback);
    button.appendChild(icon);

    return button;
  }
}
