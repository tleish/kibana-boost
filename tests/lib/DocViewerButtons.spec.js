import { waitFor } from '@testing-library/dom';
import DocViewerButtons from 'DocViewerButtons';

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockImplementation(() => Promise.resolve())
    }
  });
});

describe('DocViewerButtons.for', () => {
  let docViewValueElement, parent, span;

  beforeEach(() => {
    document.body.innerHTML = `
    <table>
        <tr>
            <td class="doc-viewer-parent">
              <div class="doc-viewer-value">
                <span>my value</span>
              </div>
            </td>
        </tr>
    </table>
    `;

    parent = document.querySelector('.doc-viewer-parent');
    docViewValueElement = document.querySelector('.doc-viewer-value');
    span = docViewValueElement.querySelector('span');
    DocViewerButtons.for(parent);
    jest.useFakeTimers()
  });

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('prepends the buttons', () => {
    expect(parent.querySelector('.doc-viewer-buttons')).toBeTruthy();
  });

  it('adds the expand button', () => {
    expect(parent.querySelector('.doc-viewer-button-expand')).toBeTruthy();
  });

  it('adds the copy button', () => {
    expect(parent.querySelector('.doc-viewer-button-copy')).toBeTruthy();
  });

  it('toggles the doc viewer', () => {
    const button = parent.querySelector('.doc-viewer-button-expand')
    const toolTip = button.querySelector('.tooltiptext');
    const icon = button.querySelector('i');
    parent.classList.add('collapsed');
    button.click();
    expect(parent.classList.contains('collapsed')).toBeFalsy();
    expect(toolTip.textContent).toBe('Show Less');
    expect(icon.classList.contains('fa-compress')).toBeTruthy();
    button.click();
    expect(parent.classList.contains('collapsed')).toBeTruthy();
    expect(toolTip.textContent).toBe('Show More');
    expect(icon.classList.contains('fa-expand')).toBeTruthy();
  });

  it('copies the value to the clipboard', async () => {
    const copyButton = parent.querySelector('.doc-viewer-button-copy')
    const toolTip = copyButton.querySelector('.tooltiptext');
    expect(toolTip.textContent).toBe('Copy');
    copyButton.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('my value');
    await waitFor(() => {
      expect(toolTip.textContent).toBe('Copied!');
    });
    // wait for the tooltip to reset
    jest.runAllTimers();
    expect(toolTip.textContent).toBe('Copy');
  });
});
