export default class DocViewerButtons {
  static for(parent) {
    const buttons = [
      (new ExpandButton(parent)).element,
      (new CopyButton(parent)).element
    ];
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
    this.parent.classList.add('collapsed');
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
    const value = this.parent.querySelector('.doc-viewer-value').textContent.trim();
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
