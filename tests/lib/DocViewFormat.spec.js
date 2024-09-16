import DocViewerFormat from 'DocViewerFormat';

// Mock window.hljs
// beforeAll(() => {
//   global.hljs = {
//     highlightElement: jest.fn(),
//   };
// });

describe('DocViewerFormat', () => {
  let parent, element;
  test('it adds whitespace-pre-wrap class', () => {
    document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}</span></div></td></tr></table>
      `;
    parent = document.querySelector('td');
    element = document.querySelector('span');
    DocViewerFormat.each(parent);
    expect(element.classList.contains('whitespace-pre-wrap')).toBeTruthy();
  });

  describe('when language is Ruby', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}</span></div></td></tr></table>
      `;

      parent = document.querySelector('td');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
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

    // test('it highlights the element', () => {
    //   expect(hljs.highlightElement).toHaveBeenCalledWith(element);
    // });

    test('parses typical ruby hash', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}\t   \t`
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json.shipment.to_location.first_name).toBe('John');
    });

    test('parses ruby keys as symbols', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:name=>"John Doe", :street1=>"1234 Main St"}, :verify=>true}`;
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.name).toBe('John Doe');
    });

    test('parses dates with ":"', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{ "created_at"  =>"2024-07-19T21:01:59.000Z", "updated_at" => "2024-07-19T21:01:59.000Z" }`;
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json.created_at).toBe('2024-07-19T21:01:59.000Z');
    });

    test('parses keys with dashes', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{"X-Started-At"=>"1721425235.567658"}`;
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json['X-Started-At']).toBe('1721425235.567658');
    });

    test('handles =>nil values', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:company=>nil, "street1"=>nil, "street2":nil}}`;
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.company).toBe(null);
    });

    test('does not change words that include the word "nil"', () => {
      element.classList.remove('whitespace-pre-wrap');
      element.textContent = `{:address=>{:company=>"Va nil la Inc."}}`;
      DocViewerFormat.each(parent);
      const json = JSON.parse(element.textContent);
      expect(json.address.company).toBe('Va nil la Inc.');
    });
  });

  describe('when language is XML', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>&lt;note&gt;&lt;to&gt;Tove&lt;/to&gt;&lt;from&gt;Jani&lt;/from&gt;&lt;heading&gt;Reminder&lt;/heading&gt;&lt;body&gt;Don't forget me this weekend!&lt;/body&gt;&lt;/note&gt;</span></div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
    });

    it('it assigns the language-json class', () => {
      expect(element.classList.contains('language-xml')).toBeTruthy();
    });
  });

  describe('when language is JSON', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"}}}</span></div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
    });

    it('it assigns the language-json class', () => {
      expect(element.classList.contains('language-json')).toBeTruthy();
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

    it('it highlights the element', () => {
      expect(element.classList.contains('hljs')).toBeTruthy()
    });
  });

  describe('when language is marked', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>
        {"shipment" => {"to_location": {"first_name": "<mark>John</mark>", "middle_name": "<mark>John</mark>", "last_name": "Johnson", "<mark>age</mark>": <mark>23</mark>, "street1" : "123 <mark>last</mark> ln"}}}
        </span></div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
    });

    it('it highlights the element', () => {
      expect(element.outerHTML.match(/<mark>John<\/mark>/g).length).toBe(2)
      expect(element.outerHTML.match(/<mark>23<\/mark>/g).length).toBe(1)
      expect(element.outerHTML.match(/<mark>last<\/mark>/g).length).toBe(1)
    });
  });

  describe('when language is auto', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>Hello, world!</span></div></td></tr></table>
      `;
      parent = document.querySelector('td');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
    });

    it('does not assign language-auto class', () => {
      expect(element.classList.contains('language-auto')).toBeFalsy();
    });

    it('it does not collapse the parent element', () => {
      expect(element.classList.contains('collapsed')).toBeFalsy();
    });
  });

  describe('when value includes URL', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>This is a <span id="keeps_html">test</span> of a https://anything.s3.amazonaws.com/file.png and <span>https://track.easypost.com/ABC12</span> other link</span></div></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);
    });

    it('replaces multiple URLs', () => {
      expect(element.innerHTML).toBe('This is a <span id="keeps_html">test</span> of a <a href="https://anything.s3.amazonaws.com/file.png" class="auto-link" target="_blank">https://anything.s3.amazonaws.com/file.png</a> and <span><a href="https://track.easypost.com/ABC12" class="auto-link" target="_blank">https://track.easypost.com/ABC12</a></span> other link');
    });
  });

  describe('when value includes IP', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table><tr data-test-subj="tableDocViewRow-ip"><td><div class="kbnDocViewer__value"><span>10.2.3.4</span></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.for(parent);
    });

    it('creates ip lookup', () => {
      expect(element.innerHTML).toBe('<a href="https://search.dnslytics.com/ip/10.2.3.4" class="auto-link" target="_blank">10.2.3.4</a>');
    });
  });

  describe('when value includes customer_id', () => {
    it('creates customer_id link', () => {
      document.body.innerHTML = `
        <table><tr data-test-subj="tableDocViewRow-customer_id"><td><div class="kbnDocViewer__value"><span>123</span></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.for(parent);

      expect(element.innerHTML).toBe('<a href="https://app.ehub.com/home/index?customer_id=123" class="auto-link" target="_blank">123</a>');
    });

    it('does not create customer_id link for non-integers', () => {
      document.body.innerHTML = `
        <table><tr data-test-subj="tableDocViewRow-customer_id"><td><div class="kbnDocViewer__value"><span>-</span></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.for(parent);

      expect(element.innerHTML).toBe('-');
    });
  });

  describe('when value includes milliseconds', () => {
    it('adds ms text to ', () => {
      document.body.innerHTML = `
        <table><tr data-test-subj="tableDocViewRow-duration"><td><div class="kbnDocViewer__value"><span>123.45</span></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.for(parent);
      expect(element.innerHTML).toBe('123.45<span class="ignore-text kibana-boost-gray-400">ms</span>');
    });
  });

  describe('when value includes bytes', () => {
    it('adds bytes text to ', () => {
      document.body.innerHTML = `
        <table><tr data-test-subj="tableDocViewRow-_size"><td><div class="kbnDocViewer__value"><span>12345</span></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.for(parent);
      expect(element.innerHTML).toBe('12345<span class="ignore-text kibana-boost-gray-400"> bytes</span>');
    });
  });

  describe('when value includes customer_id', () => {
    it('creates customer_id link', () => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>
        <span class="hljs-attr">"customer_id"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"123"</span><span class="hljs-punctuation">,</span>
        </span></div></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);

      expect(element.innerHTML.trim()).toBe('<span class="hljs-attr">"customer_id"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"<a href="https://app.ehub.com/home/index?customer_id=123" class="auto-link" target="_blank">123</a>"</span><span class="hljs-punctuation">,</span>');
    });

    it('does not create customer_id link for non-integers', () => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>
        <span class="hljs-attr">"customer_id"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">""</span><span class="hljs-punctuation">,</span>
        </span></div></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);

      expect(element.innerHTML.trim()).toBe('<span class="hljs-attr">"customer_id"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">""</span><span class="hljs-punctuation">,</span>');
    });
  });

  describe('when value includes label or tracking URLs', () => {
    it('replaces multiple URLs', () => {
      document.body.innerHTML = `
        <table><tr><td><div class="kbnDocViewer__value"><span>This is a <span id="keeps_html">test</span> of a https://anything.s3.amazonaws.com/file.png and <span>https://track.easypost.com/ABC12</span> other link</span></div></td></tr></table>
      `;
      parent = document.querySelector('table');
      element = document.querySelector('span');
      DocViewerFormat.each(parent);

      expect(element.innerHTML).toBe('This is a <span id="keeps_html">test</span> of a <a href="https://anything.s3.amazonaws.com/file.png" class="auto-link" target="_blank">https://anything.s3.amazonaws.com/file.png</a> and <span><a href="https://track.easypost.com/ABC12" class="auto-link" target="_blank">https://track.easypost.com/ABC12</a></span> other link');
    });
  });
});
