import detectLanguage from "./detectLanguage";

export default class DocViewerFormat {
  static formatClasses = {};
  static for(parent) {
    const highlights =  [...new Set(parent.querySelectorAll('mark'))].map(mark => mark.textContent);

    const docViewerValue = parent.querySelector('.doc-viewer-value');
    const textContent = docViewerValue.textContent;
    let language = detectLanguage(textContent);
    const formatClass = DocViewerFormat.formatClasses[language]

    const format = new formatClass(parent);
    format.apply();

    highlights.forEach(highlight => {
      docViewerValue.innerHTML = docViewerValue.innerHTML.replace(new RegExp(`\\b${highlight}\\b`, 'g'), `<mark>${highlight}</mark>`);
    });
  }

  static languageFormatting = 'auto';
  constructor(parent) {
    this.parent = parent;
    this.element = parent.querySelector('.doc-viewer-value');
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

DocViewerFormat.formatClasses[AutoFormat.languageFormatting] = AutoFormat;
DocViewerFormat.formatClasses[XmlFormat.languageFormatting] = XmlFormat;
DocViewerFormat.formatClasses[JsonFormat.languageFormatting] = JsonFormat;
DocViewerFormat.formatClasses['ruby'] = RubyHashToJsonFormat;
