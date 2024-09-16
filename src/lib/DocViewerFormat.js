import detectLanguage from "./detectLanguage";

export default class DocViewerFormat {
  static formatClasses = {};

  static each(parent) {
    const highlights =  [...new Set(parent.querySelectorAll('mark'))].map(mark => mark.textContent);

    const docViewerValue = parent.querySelector('.kbnDocViewer__value > span');
    const textContent = docViewerValue.textContent;
    let language = detectLanguage(textContent);
    const formatClass = DocViewerFormat.formatClasses[language]

    const format = new formatClass(parent);
    format.apply();

    // keep after hjls formatting
    UrlFormat.for(parent);
    JsonCustomerIdFormat.for(parent);

    highlights.forEach(highlight => {
      docViewerValue.innerHTML = docViewerValue.innerHTML.replace(new RegExp(`\\b${highlight}\\b`, 'g'), `<mark>${highlight}</mark>`);
    });
  }

  static for(parent) {
    IpLookupFormat.for(parent);
    CustomerIdFormat.for(parent);
    MillisecondFormat.for(parent);
    BytesFormat.for(parent);
  }

  static languageFormatting = 'auto';
  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('.kbnDocViewer__value > span');
  }

  apply() {
    this.parent.classList.add(`parent-language-${this.constructor.languageFormatting}`);
    this.element.classList.add('whitespace-pre-wrap');
    this.element.textContent = this.prettyPrintTextContent(this.element.textContent);
    this.element.classList.add(`language-${this.constructor.languageFormatting}`);
    hljs.highlightElement(this.element);
  }

  prettyPrintTextContent(textContent) {
    return textContent;
  }
}

class AutoFormat extends DocViewerFormat {
  apply() {}
}

class XmlFormat extends DocViewerFormat {
  static languageFormatting = 'xml';
}

class JsonFormat extends DocViewerFormat {
  static languageFormatting = 'json';

  prettyPrintTextContent(textContent) {
    return this.jsonPrettyPrint(textContent);
  }

  jsonPrettyPrint(jsonString) {
    let jsonObject;

    try {
      jsonObject = JSON.parse(jsonString);
      return JSON.stringify(jsonObject, null, 2);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.error(jsonString);
      return jsonString;
    }
  }
}

class RubyHashToJsonFormat extends JsonFormat {
  prettyPrintTextContent(textContent) {
    return super.prettyPrintTextContent(this.rubyHashToJson(textContent))
  }

  rubyHashToJson(rubyHashStr) {
    let jsonString = rubyHashStr
    jsonString = jsonString.replace(/=>\bnil\b/g, '=>null')
    jsonString = jsonString.replace(/:\bnil\b/g, ':null')
    jsonString = jsonString.replace(/:(\w+)=>/g, '"$1":')
    jsonString = jsonString.replace(/=>/g, ':')

    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (e) {
      console.error('Error parsing JSON in rubyHashToJson:', e);
      console.error(jsonString);
      return rubyHashStr;
    }
  }
}

// https://track.easypost.com/ABC123
// https://ehub-prod.s3.amazonaws.com/ABC123
// https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/ABC123


class UrlFormat {
  static URL_PATTERN = /(https:\/\/(track\.easypost\.com|[\w.-]+\.s3[\w.-]*\.amazonaws\.com)[^\s<>"]*)/g;
  static for(parent) {
    const format = new UrlFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('.kbnDocViewer__value > span');
  }

  apply() {
    this.element.innerHTML = this.element.innerHTML.replace(UrlFormat.URL_PATTERN, (url) => {
      return `<a href="${url}" class="auto-link" target="_blank">${url}</a>`;
    });
  }
}


class JsonCustomerIdFormat {
  static JSON_PATTERN = /(<span class="hljs-attr">"customer_id"<\/span>\s*<span class="hljs-punctuation">:<\/span>\s*<span class="hljs-string">)"(\d+)"(<\/span>)/g;
  static PATH_PATTERN = /(\/customers\/)(\d+)(\/)/g;

  // static PATTERN = /<span class="hljs-attr">"customer_id"<\/span>/g;
  static for(parent) {
    const format = new JsonCustomerIdFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('.kbnDocViewer__value > span');
  }

  apply() {
    this.element.innerHTML = this.element.innerHTML.replace(JsonCustomerIdFormat.JSON_PATTERN, (match, before, customerId, after) => {
      return `${before}"<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>"${after}`;
    });

    this.element.innerHTML = this.element.innerHTML.replace(JsonCustomerIdFormat.PATH_PATTERN, (match, before, customerId, after) => {
      return `${before}<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>${after}`;
    });
  }
}

class IpLookupFormat {
  static PATTERN = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;
  static for(parent) {
    const format = new IpLookupFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('tr[data-test-subj="tableDocViewRow-ip"] .kbnDocViewer__value > span');
  }

  apply() {
    if(!this.element) return;

    this.element.innerHTML = this.element.innerHTML.replace(IpLookupFormat.PATTERN, (ip) => {
      return `<a href="https://search.dnslytics.com/ip/${ip}" class="auto-link" target="_blank">${ip}</a>`;
    });
  }
}

class CustomerIdFormat {
  static for(parent) {
    const format = new CustomerIdFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('tr[data-test-subj="tableDocViewRow-customer_id"] .kbnDocViewer__value > span');
  }

  apply() {
    if(!this.element) return;

    const customerId = parseInt(this.element.textContent);
    if(isNaN(customerId)) return this.element.textContent;

    this.element.innerHTML =  `<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>`;
  }
}

class MillisecondFormat {
  static TYPES = ['duration', 'db', 'elapsed_time', 'server_time', 'view'];
  static for(parent) {
    const format = new MillisecondFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.elements = MillisecondFormat.TYPES.map(type => parent.querySelector(`tr[data-test-subj="tableDocViewRow-${type}"] .kbnDocViewer__value > span`)).filter(item => item !== null);
  }

  apply() {
    if(this.elements.length === 0) return;

    this.elements.forEach(element => {

      const value = parseFloat(element.textContent);
      if(isNaN(value)) return;

      element.innerHTML = `${value}<span class="ignore-text kibana-boost-gray-400">ms</span>`;
    });
  }
}

class BytesFormat {
  static TYPES = ['_size'];
  static for(parent) {
    const format = new BytesFormat(parent);
    format.apply();
  }

  constructor(parent) {
    this.parent = parent;
    this.elements = BytesFormat.TYPES.map(type => parent.querySelector(`tr[data-test-subj="tableDocViewRow-${type}"] .kbnDocViewer__value > span`)).filter(item => item !== null);
  }

  apply() {
    if(this.elements.length === 0) return;

    this.elements.forEach(element => {

      const value = parseFloat(element.textContent);
      if(isNaN(value)) return;

      element.innerHTML = `${value}<span class="ignore-text kibana-boost-gray-400"> bytes</span>`;
    });
  }
}

DocViewerFormat.formatClasses[AutoFormat.languageFormatting] = AutoFormat;
DocViewerFormat.formatClasses[XmlFormat.languageFormatting] = XmlFormat;
DocViewerFormat.formatClasses[JsonFormat.languageFormatting] = JsonFormat;
DocViewerFormat.formatClasses['ruby'] = RubyHashToJsonFormat;
