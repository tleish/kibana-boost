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
            <td width="1%" class="doc-viewer-buttons" ng-if="filter">
              <span ng-if="mapping[field].filterable">
                <button class="doc-viewer-button" aria-label="Filter for value" ng-click="filter(mapping[field], flattened[field], '+')" data-test-subj="addInclusiveFilterButton" tooltip="Filter for value" tooltip-append-to-body="1">
                  <i class="fa fa-search-plus"></i>
                </button>
      
                <button class="doc-viewer-button" aria-label="Filter out value" ng-click="filter(mapping[field], flattened[field],'-')" tooltip="Filter out value" tooltip-append-to-body="1">
                  <i class="fa fa-search-minus"></i>
                </button>
              </span>
              <span ng-if="canToggleColumns()">
                <button class="doc-viewer-button" aria-label="Toggle column in table" aria-pressed="true" ng-click="toggleColumn(field)" tooltip-append-to-body="1" tooltip="Toggle column in table">
                  <i class="fa fa-columns"></i>
                </button>
              </span>
              <span ng-if="!indexPattern.metaFields.includes(field) &amp;&amp; !mapping[field].scripted">
                <button class="doc-viewer-button" aria-label="Filter for field present" ng-click="filter('_exists_', field, '+')" tooltip="Filter for field present" tooltip-append-to-body="1">
                  <i class="fa fa-asterisk"></i>
                </button>
              </span>
            </td>
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

  it('adds the open in new window button', () => {
    expect(parent.querySelector('.doc-viewer-button-search')).toBeTruthy();
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
    const button = parent.querySelector('.doc-viewer-button-copy')
    const toolTip = button.querySelector('.tooltiptext');
    expect(toolTip.textContent).toBe('Copy');
    button.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('my value');
    await waitFor(() => {
      expect(toolTip.textContent).toBe('Copied!');
    });
    // wait for the tooltip to reset
    jest.runAllTimers();
    expect(toolTip.textContent).toBe('Copy');
  });

  it('creates an href using the filter', async () => {
    const button = parent.querySelector('.doc-viewer-button-search')
    const toolTip = button.querySelector('.tooltiptext');
    expect(toolTip.textContent).toBe('Only');

    const searchPlusButton = document.querySelector('button[aria-label="Filter for value"]');
    let searchPlusButtonClicked = false
    searchPlusButton.onclick = () => searchPlusButtonClicked = true

    global.GM_openInTab = jest.fn(); // Mock the function
    const goSpy = jest.spyOn(window.history, 'go').mockImplementation((steps) => {
      // Simulate the history go behavior
    });

    button.click();

    expect(goSpy).toHaveBeenCalledWith(-0);
    expect(searchPlusButtonClicked).toBeTruthy();
  });
});
