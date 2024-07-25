export default class DocViewerObserver {
  constructor(newChildrenCallback) {
    this.newChildrenCallback = newChildrenCallback;
    this.parentObserver = new MutationObserver(() => this.observeNewElements());
  }

  start() {
    this.observeNewElements();
    this.observeParent();
  }

  observeParent() {
    this.parentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  observeNewElements() {
    const targetElements = document.querySelectorAll('tr[data-test-subj="docTableDetailsRow"]');
    targetElements.forEach((element) => {
      this.observeElement(element);
    });
  }

  observeElement(element) {
    if (!element.observed) {
      element.observed = true;
      const observer = new MutationObserver(this.handleNewChildren.bind(this));

      observer.observe(element, {
        childList: true,
        subtree: false
      });
    }
  }

  handleNewChildren(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        this.applyNewChildrenCallback([...mutation.target.querySelectorAll('.doc-viewer-value > span')])
      }
    }
  }

  applyNewChildrenCallback(elements) {
    elements.forEach((element) => {
      const parent = element.closest('td');
      if (parent.classList.contains('doc-viewer-parent')) {
        return;
      }
      parent.classList.add('doc-viewer-parent');

      this.newChildrenCallback(parent);
    });
  }
}
