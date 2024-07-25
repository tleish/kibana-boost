import DocViewerFormat from 'DocViewerFormat';

// Mock window.hljs
beforeAll(() => {
  global.hljs = {
    highlightElement: jest.fn(),
  };
});

describe('DocViewerFormat', () => {
  let parent, element;
  test('it adds whitespace-pre-wrap class', () => {
    document.body.innerHTML = `
        <table><tr><td><div class="doc-viewer-value">{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}</div></td></tr></table>
      `;
    parent = document.querySelector('td');
    element = document.querySelector('div');
    DocViewerFormat.for(parent);
    expect(element.classList.contains('whitespace-pre-wrap')).toBeTruthy();
  });

  describe('when language is Ruby', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="doc-viewer-value">{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}</div></td></tr></table>
      `;

      parent = document.querySelector('td');
      element = document.querySelector('div');
      DocViewerFormat.for(parent);
    });

    test('it prettyPrints JSON', () => {
      // expect should compare to pretty printed json
      expect(element.textContent).toBe(`{
  "shipment": {
    "to_location": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}`);
      expect(element.classList.contains('language-json')).toBeTruthy();
    });

    test('it assigns the language-json class', () => {
      expect(element.classList.contains('language-json')).toBeTruthy();
    });

    test('it highlights the element', () => {
      expect(hljs.highlightElement).toHaveBeenCalledWith(element);
    });

    test('parses typical ruby hash', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}\t   \t`
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json.shipment.to_location.first_name).toBe('John');
    });

    test('parses ruby keys as symbols', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:name=>"John Doe", :street1=>"1234 Main St"}, :verify=>true}`;
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.name).toBe('John Doe');
    });

    test('parses dates with ":"', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{ "created_at"  =>"2024-07-19T21:01:59.000Z", "updated_at" => "2024-07-19T21:01:59.000Z" }`;
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json.created_at).toBe('2024-07-19T21:01:59.000Z');
    });

    test('parses keys with dashes', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{"X-Started-At"=>"1721425235.567658"}`;
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json['X-Started-At']).toBe('1721425235.567658');
    });

    test('handles =>nil values', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:company=>nil, "street1"=>nil, "street2":nil}}`;
      element = document.querySelector('div');
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.company).toBe(null);
    });

    test('does not change words that include the word "nil"', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:company=>"Va nil la Inc."}}`;
      DocViewerFormat.for(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.company).toBe('Va nil la Inc.');
    });
  });

  describe('when language is XML', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="doc-viewer-value">&lt;note&gt;&lt;to&gt;Tove&lt;/to&gt;&lt;from&gt;Jani&lt;/from&gt;&lt;heading&gt;Reminder&lt;/heading&gt;&lt;body&gt;Don't forget me this weekend!&lt;/body&gt;&lt;/note&gt;</div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('div');
      DocViewerFormat.for(parent);
    });

    it('it assigns the language-json class', () => {
      expect(element.classList.contains('language-xml')).toBeTruthy();
    });

    it('it highlights the element', () => {
      expect(hljs.highlightElement).toHaveBeenCalledWith(element);
    });
  });

  describe('when language is JSON', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="doc-viewer-value">{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"}}}</div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('div');
      DocViewerFormat.for(parent);
    });

    it('it assigns the language-json class', () => {
      expect(element.classList.contains('language-json')).toBeTruthy();
    });

    it('it highlights the element', () => {
      expect(hljs.highlightElement).toHaveBeenCalledWith(element);
    });
    
    test('it prettyPrints JSON', () => {
      // expect should compare to pretty printed json
      expect(element.textContent).toBe(`{
  "shipment": {
    "to_location": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}`);
      expect(element.classList.contains('language-json')).toBeTruthy();
    });
  });

  describe('when language is auto', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="doc-viewer-value">Hello, world!</div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('div');
      DocViewerFormat.for(parent);
    });

    it('does not assign language-auto class', () => {
      expect(element.classList.contains('language-auto')).toBeFalsy();
    });

    it('it does not collapse the parent element', () => {
      expect(element.classList.contains('collapsed')).toBeFalsy();
    });
  });
});
