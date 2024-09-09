export default class NavRowButtons {

  constructor() {
    this.buttons = [];
    this.observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // Check if the desired button has been added
          const menu = document.querySelector('.kuiLocalNavRow');
          let menuButton;
          if (menu) {
            this.buttons.forEach(({ button, afterButton }) => {
              menuButton = document.querySelector(afterButton);

              if (document.querySelector(`#${button.id}`) || !menuButton) {
                return;
              }

              menuButton.parentNode.insertBefore(button, menuButton.nextSibling);
            });

            // Optionally, you can disconnect the observer once the button appears
            this.observer.disconnect();
            break;
          }
        }
      }
    });
  }

  observe() {
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  addButton(button, afterButton) {
    this.buttons.push({ button, afterButton });
  }
}
