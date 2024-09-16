const test = {eachNewChildrenCallback: [], newChildrenCallback: 12};

export default class DocViewerObserver {
  constructor({eachNewChildrenCallback, newChildrenCallback}) {
    this.eachNewChildrenCallback = eachNewChildrenCallback;
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
        this.observeDocViewer(mutation.target);
        const children = [...mutation.target.querySelectorAll('.kbnDocViewer__value > span')];
        this.applyEachNewChildrenCallback(children)
        this.applyNewChildrenCallback(children[0]);
      }
    }
  }

  observeDocViewer(parentElement) {
    const element = parentElement.querySelector('.kbnDocViewer__content');
    if (!element) {
      return;
    }
    
    this.observeElement(element);
  }

  applyEachNewChildrenCallback(elements) {
    elements.forEach((element) => {
      const parent = element.closest('td');
      if (parent.classList.contains('doc-viewer-parent')) {
        return;
      }
      parent.classList.add('doc-viewer-parent');

      this.eachNewChildrenCallback(parent);
    });
  }
  applyNewChildrenCallback(element) {
    if(!element) return;

    this.newChildrenCallback(element.closest('.kbnDocViewer__content'));
  }
}
