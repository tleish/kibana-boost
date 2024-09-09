export default class ButtonHandler {
  constructor(buttonId, buttonText, onClickCallback) {
    this.buttonId = buttonId;
    this.buttonText = buttonText;
    this.onClickCallback = onClickCallback;
    this.button = this.createButton();
  }

  createButton() {
    const button = document.createElement('button');
    button.id = this.buttonId;
    button.textContent = this.buttonText;
    button.classList.add('kuiLocalMenuItem');
    button.addEventListener('click', this.onClickCallback);

    return button;
  }
}
