export default class DocViewerButtons {
  static for(parent) {
    const buttons = [
      (new ExpandButton(parent)).element,
      (new CopyButton(parent)).element,
      (new NewFilterButton(parent)).element
    ].filter(button => button !== null);
    const docViewerButtons = new DocViewerButtons(buttons);
    parent.insertBefore(docViewerButtons.element, parent.firstChild);
  }

  constructor(buttons) {
    this.buttons = buttons;
  }

  get element() {
   const divElement = document.createElement('div');
   divElement.classList.add('doc-viewer-buttons');
   this.buttons.forEach(button => divElement.appendChild(button) );
   return divElement;
  }
}

class Button {
  static iconClass = '';
  static toolTipText = '';
  constructor(parent) {
    this.parent = parent;
  }

  get element() {
    this.button = document.createElement('button');
    this.button.classList.add('doc-viewer-button', `doc-viewer-button-${this.constructor.iconClass}`, 'kuiButton', 'kuiButton--small', 'kuiButton--secondary');
    this.button.appendChild(this.createIcon());
    this.button.appendChild(this.createTooltip());
    this.button.addEventListener('click', this.clickHandler.bind(this));
    return this.button;
  }

  createIcon() {
    this.icon = document.createElement('i');
    this.icon.classList.add('fa', `fa-${this.constructor.iconClass}`);
    return this.icon;
  }

  createTooltip() {
    this.tooltip = document.createElement('span');
    this.tooltip.classList.add('tooltiptext');
    this.tooltip.textContent = this.constructor.toolTipText;
    return this.tooltip;
  }

  clickHandler() {
    console.log('Button clicked');
  }

  updateTooltip(text) {
    this.tooltip.textContent = text;
  }

  updateIcon(iconClass) {
    const removeClasses = [...this.icon.classList].filter(cssClass => cssClass.includes('fa-'));
    this.icon.classList.remove(...removeClasses);
    this.icon.classList.add(`fa-${iconClass}`);
  }
}

class ExpandButton extends Button {
  static iconClass = 'expand';
  static toolTipText = 'Show More';

  get element() {
    const docViewerHeight = this.parent.querySelector('.kbnDocViewer__value').clientHeight;
    if(docViewerHeight <= 300) {
      return null;
    }

    this.parent.classList.add('collapsed');
    this.parent.closest('tr').addEventListener('dblclick', (event) => {
      if (window.getSelection().toString().length === 0) {
        this.clickHandler(event)
      }
    });
    return super.element;
  }

  clickHandler() {
    const expanded = this.parent.classList.toggle('collapsed');
    if(expanded) {
      this.updateTooltip('Show More')
      this.updateIcon('expand')
    } else {
      this.updateTooltip('Show Less')
      this.updateIcon('compress')
    }
  }
}

class CopyButton extends Button {
  static iconClass = 'copy';
  static toolTipText = 'Copy';

  clickHandler(_event) {
    const clonedElement = this.parent.querySelector('.kbnDocViewer__value').cloneNode(true)
    clonedElement.querySelectorAll('.ignore-text').forEach(el => el.remove());
    const value = clonedElement.textContent.trim();
    navigator.clipboard.writeText(value).then(() => {
      this.copiedStatus(value);
      setTimeout(() => this.resetStatus(), 1000);
    }, (err) => {
      console.error('Error copying value to clipboard:', err);
    });
  }
  copiedStatus(value) {
    console.log("Value copied to clipboard:", value);
    this.updateIcon('check')
    this.updateTooltip('Copied!')
  }

  resetStatus() {
    this.updateIcon('copy')
    this.updateTooltip('Copy')
  }
}

class NewFilterButton extends Button {
  static iconClass = 'search';
  static toolTipText = 'Only';
  
  clickHandler(_event) {
    const rowElement = this.parent.closest('tr');
    const filterForButton = rowElement.querySelector('button[aria-label="Filter for value"]');
    filterForButton.click();

    // filter-remove
    const removeFilterButtons = document.querySelectorAll('button.filter-remove');
    [...removeFilterButtons].slice(0, -1).reverse().forEach(button => button.click());

    const url = new URL(window.location);
    // http://127.0.0.1:9200/_plugin/kibana/app/kibana#/discover?_g=()&_a=(columns:!(email),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'155fb710-1370-11e9-859e-35ec3c707e4d',key:action,negate:!f,params:(query:create_and_ship,type:phrase),type:phrase,value:create_and_ship),query:(match:(action:(query:create_and_ship,type:phrase))))),index:'155fb710-1370-11e9-859e-35ec3c707e4d',interval:auto,query:(language:lucene,query:label_image),sort:!('@timestamp',desc))
    // http://127.0.0.1:9200/_plugin/kibana/app/kibana#/discover?_g=()&_a=(columns:!(email),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'155fb710-1370-11e9-859e-35ec3c707e4d',key:request_id,negate:!f,params:(query:'5f951ade-2995-4874-9f31-586d0c51aac3',type:phrase),type:phrase,value:'5f951ade-2995-4874-9f31-586d0c51aac3'),query:(match:(request_id:(query:'5f951ade-2995-4874-9f31-586d0c51aac3',type:phrase))))),index:'155fb710-1370-11e9-859e-35ec3c707e4d',interval:auto,query:(language:lucene,query:label_image),sort:!('@timestamp',desc))
    const href = url.href.replace(/,query:\(language:lucene,query:[^\)]+\)/, '');

    history.go(removeFilterButtons.length * -1);
    GM_openInTab(href, { active: true });
  }
}
