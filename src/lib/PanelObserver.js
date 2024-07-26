export default class PanelObserver {
  constructor(targetSelector, textContent, callback) {
    this.targetSelector = targetSelector;
    this.textContent = textContent;
    this.callback = callback;
    this.observer = null;
  }

  init() {
    this.createObserver();
    this.startObserving();
    this.checkForPanel();
  }

  createObserver() {
    this.observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.checkForPanel();
        }
      }
    });
  }

  startObserving() {
    const config = { childList: true, subtree: true };
    this.observer.observe(document.body, config);
  }

  checkForPanel() {
    const panel = this.findPanel();
    if (panel) {
      this.callback(panel);
      this.observer.disconnect();
    }
  }

  findPanel() {
    return [...document.querySelectorAll(this.targetSelector)].filter((panel) => panel.textContent.includes(this.textContent))[0];
  }
}
