// ==UserScript==
// @name         Kibana Boost
// @namespace    https://github.com/tleish/
// @version      0.6.0
// @updateURL    https://github.com/tleish/kibana-boost/raw/main/dist/kibana_boost.meta.js
// @downloadURL  https://github.com/tleish/kibana-boost/raw/main/dist/kibana_boost.user.js
// @description  Updates Kibana view
// @match        http://127.0.0.1:9200/_plugin/kibana/app/kibana*
// @copyright    2024+, tleish
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        GM_openInTab
// ==/UserScript==
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/lib/DocViewerObserver.js
  var DocViewerObserver = class {
    constructor({ eachNewChildrenCallback, newChildrenCallback }) {
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
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          this.observeDocViewer(mutation.target);
          const children = [...mutation.target.querySelectorAll(".kbnDocViewer__value > span")];
          this.applyEachNewChildrenCallback(children);
          this.applyNewChildrenCallback(children[0]);
        }
      }
    }
    observeDocViewer(parentElement) {
      const element = parentElement.querySelector(".kbnDocViewer__content");
      if (!element) {
        return;
      }
      this.observeElement(element);
    }
    applyEachNewChildrenCallback(elements) {
      elements.forEach((element) => {
        const parent = element.closest("td");
        if (parent.classList.contains("doc-viewer-parent")) {
          return;
        }
        parent.classList.add("doc-viewer-parent");
        this.eachNewChildrenCallback(parent);
      });
    }
    applyNewChildrenCallback(element) {
      if (!element)
        return;
      this.newChildrenCallback(element.closest(".kbnDocViewer__content"));
    }
  };

  // src/lib/detectLanguage.js
  function detectLanguage(str) {
    if (isJson(str)) {
      return "json";
    } else if (isRubyHash(str)) {
      return "ruby";
    } else if (isXml(str)) {
      return "xml";
    } else {
      return "auto";
    }
  }
  function isRubyHash(str) {
    return str.includes("=>");
  }
  function isJson(str) {
    str = str.trim();
    if (str.startsWith("{") && str.endsWith("}") || str.startsWith("[") && str.endsWith("]")) {
      try {
        const parsed = JSON.parse(str);
        return parsed !== null && (typeof parsed === "object" || Array.isArray(parsed));
      } catch (_e) {
        return false;
      }
    }
    return false;
  }
  function isXml(str) {
    str = str.trim();
    return str.startsWith("<") && str.endsWith(">");
  }

  // src/lib/DocViewerFormat.js
  var _DocViewerFormat = class {
    static each(parent) {
      const highlights = [...new Set(parent.querySelectorAll("mark"))].map((mark) => mark.textContent);
      const docViewerValue = parent.querySelector(".kbnDocViewer__value > span");
      const textContent = docViewerValue.textContent;
      let language = detectLanguage(textContent);
      const formatClass = _DocViewerFormat.formatClasses[language];
      const format = new formatClass(parent);
      format.apply();
      UrlFormat.for(parent);
      JsonCustomerIdFormat.for(parent);
      highlights.forEach((highlight) => {
        docViewerValue.innerHTML = docViewerValue.innerHTML.replace(new RegExp(`\\b${highlight}\\b`, "g"), `<mark>${highlight}</mark>`);
      });
    }
    static for(parent) {
      IpLookupFormat.for(parent);
      CustomerIdFormat.for(parent);
      MillisecondFormat.for(parent);
      BytesFormat.for(parent);
    }
    constructor(parent) {
      this.parent = parent;
      this.element = parent.querySelector(".kbnDocViewer__value > span");
    }
    apply() {
      this.parent.classList.add(`parent-language-${this.constructor.languageFormatting}`);
      this.element.classList.add("whitespace-pre-wrap");
      this.element.textContent = this.prettyPrintTextContent(this.element.textContent);
      this.element.classList.add(`language-${this.constructor.languageFormatting}`);
      hljs.highlightElement(this.element);
    }
    prettyPrintTextContent(textContent) {
      return textContent;
    }
  };
  var DocViewerFormat = _DocViewerFormat;
  __publicField(DocViewerFormat, "formatClasses", {});
  __publicField(DocViewerFormat, "languageFormatting", "auto");
  var AutoFormat = class extends DocViewerFormat {
    apply() {
    }
  };
  var XmlFormat = class extends DocViewerFormat {
  };
  __publicField(XmlFormat, "languageFormatting", "xml");
  var JsonFormat = class extends DocViewerFormat {
    prettyPrintTextContent(textContent) {
      return this.jsonPrettyPrint(textContent);
    }
    jsonPrettyPrint(jsonString) {
      let jsonObject;
      try {
        jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, 2);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        console.error(jsonString);
        return jsonString;
      }
    }
  };
  __publicField(JsonFormat, "languageFormatting", "json");
  var RubyHashToJsonFormat = class extends JsonFormat {
    prettyPrintTextContent(textContent) {
      return super.prettyPrintTextContent(this.rubyHashToJson(textContent));
    }
    rubyHashToJson(rubyHashStr) {
      let jsonString = rubyHashStr;
      jsonString = jsonString.replace(/=>\bnil\b/g, "=>null");
      jsonString = jsonString.replace(/:\bnil\b/g, ":null");
      jsonString = jsonString.replace(/:(\w+)=>/g, '"$1":');
      jsonString = jsonString.replace(/=>/g, ":");
      try {
        JSON.parse(jsonString);
        return jsonString;
      } catch (e) {
        console.error("Error parsing JSON in rubyHashToJson:", e);
        console.error(jsonString);
        return rubyHashStr;
      }
    }
  };
  var _UrlFormat = class {
    static for(parent) {
      const format = new _UrlFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.element = parent.querySelector(".kbnDocViewer__value > span");
    }
    apply() {
      this.element.innerHTML = this.element.innerHTML.replace(_UrlFormat.URL_PATTERN, (url) => {
        return `<a href="${url}" class="auto-link" target="_blank">${url}</a>`;
      });
    }
  };
  var UrlFormat = _UrlFormat;
  __publicField(UrlFormat, "URL_PATTERN", /(https:\/\/(track\.easypost\.com|[\w.-]+\.s3[\w.-]*\.amazonaws\.com)[^\s<>"]*)/g);
  var _JsonCustomerIdFormat = class {
    static for(parent) {
      const format = new _JsonCustomerIdFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.element = parent.querySelector(".kbnDocViewer__value > span");
    }
    apply() {
      this.element.innerHTML = this.element.innerHTML.replace(_JsonCustomerIdFormat.JSON_PATTERN, (match, before, customerId, after) => {
        return `${before}"<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>"${after}`;
      });
      this.element.innerHTML = this.element.innerHTML.replace(_JsonCustomerIdFormat.PATH_PATTERN, (match, before, customerId, after) => {
        return `${before}<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>${after}`;
      });
    }
  };
  var JsonCustomerIdFormat = _JsonCustomerIdFormat;
  __publicField(JsonCustomerIdFormat, "JSON_PATTERN", /(<span class="hljs-attr">"customer_id"<\/span>\s*<span class="hljs-punctuation">:<\/span>\s*<span class="hljs-string">)"(\d+)"(<\/span>)/g);
  __publicField(JsonCustomerIdFormat, "PATH_PATTERN", /(\/customers\/)(\d+)(\/)/g);
  var _IpLookupFormat = class {
    static for(parent) {
      const format = new _IpLookupFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.element = parent.querySelector('tr[data-test-subj="tableDocViewRow-ip"] .kbnDocViewer__value > span');
    }
    apply() {
      if (!this.element)
        return;
      this.element.innerHTML = this.element.innerHTML.replace(_IpLookupFormat.PATTERN, (ip) => {
        return `<a href="https://search.dnslytics.com/ip/${ip}" class="auto-link" target="_blank">${ip}</a>`;
      });
    }
  };
  var IpLookupFormat = _IpLookupFormat;
  __publicField(IpLookupFormat, "PATTERN", /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g);
  var CustomerIdFormat = class {
    static for(parent) {
      const format = new CustomerIdFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.element = parent.querySelector('tr[data-test-subj="tableDocViewRow-customer_id"] .kbnDocViewer__value > span');
    }
    apply() {
      if (!this.element)
        return;
      const customerId = parseInt(this.element.textContent);
      if (isNaN(customerId))
        return this.element.textContent;
      this.element.innerHTML = `<a href="https://app.ehub.com/home/index?customer_id=${customerId}" class="auto-link" target="_blank">${customerId}</a>`;
    }
  };
  var _MillisecondFormat = class {
    static for(parent) {
      const format = new _MillisecondFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.elements = _MillisecondFormat.TYPES.map((type) => parent.querySelector(`tr[data-test-subj="tableDocViewRow-${type}"] .kbnDocViewer__value > span`)).filter((item) => item !== null);
    }
    apply() {
      if (this.elements.length === 0)
        return;
      this.elements.forEach((element) => {
        const value = parseFloat(element.textContent);
        if (isNaN(value))
          return;
        element.innerHTML = `${value}<span class="ignore-text kibana-boost-gray-400">ms</span>`;
      });
    }
  };
  var MillisecondFormat = _MillisecondFormat;
  __publicField(MillisecondFormat, "TYPES", ["duration", "db", "elapsed_time", "server_time", "view"]);
  var _BytesFormat = class {
    static for(parent) {
      const format = new _BytesFormat(parent);
      format.apply();
    }
    constructor(parent) {
      this.parent = parent;
      this.elements = _BytesFormat.TYPES.map((type) => parent.querySelector(`tr[data-test-subj="tableDocViewRow-${type}"] .kbnDocViewer__value > span`)).filter((item) => item !== null);
    }
    apply() {
      if (this.elements.length === 0)
        return;
      this.elements.forEach((element) => {
        const value = parseFloat(element.textContent);
        if (isNaN(value))
          return;
        element.innerHTML = `${value}<span class="ignore-text kibana-boost-gray-400"> bytes</span>`;
      });
    }
  };
  var BytesFormat = _BytesFormat;
  __publicField(BytesFormat, "TYPES", ["_size"]);
  DocViewerFormat.formatClasses[AutoFormat.languageFormatting] = AutoFormat;
  DocViewerFormat.formatClasses[XmlFormat.languageFormatting] = XmlFormat;
  DocViewerFormat.formatClasses[JsonFormat.languageFormatting] = JsonFormat;
  DocViewerFormat.formatClasses["ruby"] = RubyHashToJsonFormat;

  // src/lib/DocViewerButtons.js
  var DocViewerButtons = class {
    static for(parent) {
      const buttons = [
        new ExpandButton(parent).element,
        new CopyButton(parent).element,
        new NewFilterButton(parent).element
      ].filter((button) => button !== null);
      const docViewerButtons = new DocViewerButtons(buttons);
      parent.insertBefore(docViewerButtons.element, parent.firstChild);
    }
    constructor(buttons) {
      this.buttons = buttons;
    }
    get element() {
      const divElement = document.createElement("div");
      divElement.classList.add("doc-viewer-buttons");
      this.buttons.forEach((button) => divElement.appendChild(button));
      return divElement;
    }
  };
  var Button = class {
    constructor(parent) {
      this.parent = parent;
    }
    get element() {
      this.button = document.createElement("button");
      this.button.classList.add("doc-viewer-button", `doc-viewer-button-${this.constructor.iconClass}`, "kuiButton", "kuiButton--small", "kuiButton--secondary");
      this.button.appendChild(this.createIcon());
      this.button.appendChild(this.createTooltip());
      this.button.addEventListener("click", this.clickHandler.bind(this));
      return this.button;
    }
    createIcon() {
      this.icon = document.createElement("i");
      this.icon.classList.add("fa", `fa-${this.constructor.iconClass}`);
      return this.icon;
    }
    createTooltip() {
      this.tooltip = document.createElement("span");
      this.tooltip.classList.add("tooltiptext");
      this.tooltip.textContent = this.constructor.toolTipText;
      return this.tooltip;
    }
    clickHandler() {
      console.log("Button clicked");
    }
    updateTooltip(text) {
      this.tooltip.textContent = text;
    }
    updateIcon(iconClass) {
      const removeClasses = [...this.icon.classList].filter((cssClass) => cssClass.includes("fa-"));
      this.icon.classList.remove(...removeClasses);
      this.icon.classList.add(`fa-${iconClass}`);
    }
  };
  __publicField(Button, "iconClass", "");
  __publicField(Button, "toolTipText", "");
  var ExpandButton = class extends Button {
    get element() {
      const docViewerHeight = this.parent.querySelector(".kbnDocViewer__value").clientHeight;
      if (docViewerHeight <= 300) {
        return null;
      }
      this.parent.classList.add("collapsed");
      this.parent.closest("tr").addEventListener("dblclick", (event) => {
        if (window.getSelection().toString().length === 0) {
          this.clickHandler(event);
        }
      });
      return super.element;
    }
    clickHandler() {
      const expanded = this.parent.classList.toggle("collapsed");
      if (expanded) {
        this.updateTooltip("Show More");
        this.updateIcon("expand");
      } else {
        this.updateTooltip("Show Less");
        this.updateIcon("compress");
      }
    }
  };
  __publicField(ExpandButton, "iconClass", "expand");
  __publicField(ExpandButton, "toolTipText", "Show More");
  var CopyButton = class extends Button {
    clickHandler(_event) {
      const clonedElement = this.parent.querySelector(".kbnDocViewer__value").cloneNode(true);
      clonedElement.querySelectorAll(".ignore-text").forEach((el) => el.remove());
      const value = clonedElement.textContent.trim();
      navigator.clipboard.writeText(value).then(() => {
        this.copiedStatus(value);
        setTimeout(() => this.resetStatus(), 1e3);
      }, (err) => {
        console.error("Error copying value to clipboard:", err);
      });
    }
    copiedStatus(value) {
      console.log("Value copied to clipboard:", value);
      this.updateIcon("check");
      this.updateTooltip("Copied!");
    }
    resetStatus() {
      this.updateIcon("copy");
      this.updateTooltip("Copy");
    }
  };
  __publicField(CopyButton, "iconClass", "copy");
  __publicField(CopyButton, "toolTipText", "Copy");
  var NewFilterButton = class extends Button {
    clickHandler(_event) {
      const rowElement = this.parent.closest("tr");
      const filterForButton = rowElement.querySelector('button[aria-label="Filter for value"]');
      filterForButton.click();
      const removeFilterButtons = document.querySelectorAll("button.filter-remove");
      [...removeFilterButtons].slice(0, -1).reverse().forEach((button) => button.click());
      const url = new URL(window.location);
      const href = url.href.replace(/,query:\(language:lucene,query:[^\)]+\)/, "");
      history.go(removeFilterButtons.length * -1);
      GM_openInTab(href, { active: true });
    }
  };
  __publicField(NewFilterButton, "iconClass", "search");
  __publicField(NewFilterButton, "toolTipText", "Only");

  // src/lib/ButtonHandler.js
  var ButtonHandler = class {
    constructor(buttonId, buttonText, onClickCallback) {
      this.buttonId = buttonId;
      this.buttonText = buttonText;
      this.onClickCallback = onClickCallback;
      this.button = this.createButton();
    }
    createButton() {
      const button = document.createElement("button");
      button.id = this.buttonId;
      button.textContent = this.buttonText;
      button.classList.add("kuiLocalMenuItem");
      button.addEventListener("click", this.onClickCallback);
      return button;
    }
  };

  // src/lib/NavRowButtons.js
  var NavRowButtons = class {
    constructor() {
      this.buttons = [];
      this.observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            const menu = document.querySelector(".kuiLocalNavRow");
            let menuButton;
            if (menu) {
              this.buttons.forEach(({ button, afterButton }) => {
                menuButton = document.querySelector(afterButton);
                if (document.querySelector(`#${button.id}`) || !menuButton) {
                  return;
                }
                menuButton.parentNode.insertBefore(button, menuButton.nextSibling);
              });
              this.observer.disconnect();
              break;
            }
          }
        }
      });
    }
    observe() {
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
    addButton(button, afterButton) {
      this.buttons.push({ button, afterButton });
    }
  };

  // src/lib/CsvDownloader.js
  var CsvDownloader = class {
    static download(csv, filename = "kibana-data.csv") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", filename);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // src/lib/JsonToCsvConverter.js
  var JsonToCsvConverter = class {
    static convert(data) {
      if (!data || !data.length) {
        return "";
      }
      const keys = Object.keys(data[0]);
      if (keys.includes("@timestamp")) {
        keys.unshift("timestamp_end");
        keys.unshift("timestamp_start");
      }
      const csvRows = [];
      csvRows.push(keys.join(","));
      data.forEach((item) => {
        if (item["@timestamp"]) {
          const timestamp_end = new Date(item["@timestamp"]);
          const duration = item["duration"] || 0;
          const timestamp_start = new Date(timestamp_end - duration * 1e3);
          timestamp_start.setMinutes(timestamp_start.getMinutes() - timestamp_start.getTimezoneOffset());
          timestamp_end.setMinutes(timestamp_end.getMinutes() - timestamp_end.getTimezoneOffset());
          item["timestamp_start"] = timestamp_start.toISOString().replace("T", " ").replace("Z", "");
          item["timestamp_end"] = timestamp_end.toISOString().replace("T", " ").replace("Z", "");
        }
        const values = keys.map((key) => {
          let value = item[key];
          if (Array.isArray(value)) {
            value = value.join(",");
          }
          if (typeof value === "string") {
            value = escapeString(value);
          } else if (value !== null && typeof value === "object") {
            value = escapeObject(value);
          }
          return value || "";
        });
        csvRows.push(values.join(","));
      });
      return csvRows.join("\n");
    }
  };
  function escapeString(value) {
    value = value.replace(/"/g, '""');
    if (value.includes(",") || value.includes('"')) {
      value = `"${value}"`;
    }
    return value;
  }
  function escapeObject(value) {
    value = JSON.stringify(value).replace(/"/g, '""');
    return `"${value}"`;
  }

  // src/lib/XHRListener.js
  var XHRListener = class {
    constructor(dataStorage, shouldListen) {
      this.dataStorage = dataStorage;
      this.shouldListen = shouldListen;
      this.init();
    }
    init() {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      const listener = this;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._shouldListen = listener.shouldListen(url);
        return originalOpen.apply(this, [method, url, ...rest]);
      };
      XMLHttpRequest.prototype.send = function(...args) {
        if (this._shouldListen) {
          this.addEventListener("load", function() {
            try {
              const data = JSON.parse(this.responseText).responses[0].hits.hits.map((hit) => hit._source);
              listener.dataStorage.storeData(JSON.stringify(data));
            } catch (error) {
              console.error("Error handling XHR response:", error);
            }
          });
        }
        return originalSend.apply(this, args);
      };
    }
  };

  // src/lib/DataStorage.js
  var DataStorage = class {
    constructor(element) {
      this.element = element;
      if (!this.element) {
        throw new Error(`DataStorage Element not found.`);
      }
    }
    storeData(data) {
      this.element.textContent = data;
    }
    getData() {
      return JSON.parse(this.element.textContent || "[]");
    }
  };

  // src/assets/style.css
  var style_default = '.kbnDocViewer__value .whitespace-pre-wrap {\n  white-space: pre-wrap;\n}\n\n.doc-viewer-parent {\n  position: relative;\n  /*width: 100%;*/\n  /*white-space: normal!important;*/\n}\n\n.doc-viewer-parent .doc-viewer-buttons {\n  visibility: hidden;\n  position: -webkit-sticky; /* Safari */\n  position: absolute;\n  top: 4px;\n  right: 20px;\n  z-index: 1000;\n  display: flex;\n  flex-direction: row; /* This ensures the buttons are positioned horizontally */\n  justify-content: space-between; /* Optional: controls the spacing between buttons */\n  align-items: center; /* Optional: vertically aligns the buttons within the container */\n}\n\n.doc-viewer-parent .doc-viewer-buttons button {\n  position: relative;\n  line-height: 12px;\n  border-radius: 4px;\n  border: 1px solid #B5D8FF;\n  background-color: #FFF;\n  width: 22px;\n  height: 22px;\n  align-items: center;\n  justify-content: center;\n}\n\n.doc-viewer-parent .doc-viewer-buttons button svg {\n  width: 14px;\n  height: 14px;\n}\n\n.doc-viewer-parent .doc-viewer-buttons:hover {\n  background-color: white;\n}\n\ntr[data-test-subj^="tableDocViewRow"]:hover,\ntr[data-test-subj^="tableDocViewRow"]:hover .hljs {\n  background-color: #f9fafb;\n}\n\n.doc-viewer-parent .doc-viewer-buttons:hover ~ .kbnDocViewer__value,\n.doc-viewer-parent .doc-viewer-buttons:hover ~ .kbnDocViewer__value .hljs {\n  background-color: #B5D8FF;\n}\n\n.doc-viewer-parent .doc-viewer-buttons:hover ~ .kbnDocViewer__value .ignore-text {\n  color: transparent;\n}\n\n.doc-viewer-parent:hover .doc-viewer-buttons {\n  visibility: visible;\n}\n\n.doc-viewer-parent.collapsed .kbnDocViewer__value {\n  overflow: auto;\n  max-height: 300px;\n}\n\n.kbnDocViewer__value {\n  width: 100%;\n}\n\n.doc-viewer-button {\n  display: flex!important;\n}\n\n/* Tooltip text */\n.doc-viewer-button .tooltiptext {\n  visibility: hidden;\n  width: 70px;\n  top: 100%;\n  left: 50%;\n  margin-left: -30px; /* Use half of the width (120/2 = 60), to center the tooltip */\n  background-color: #474D4F;\n  color: #fff;\n  text-align: center;\n  padding: 5px 0;\n  border-radius: 6px;\n  font-size: 12px;\n\n  /* Position the tooltip text - see examples below! */\n  position: absolute;\n  z-index: 1;\n}\n\n/*.doc-viewer-button .fa {*/\n/*  margin-left: -4px;*/\n/*}*/\n\n\n/* Show the tooltip text when you mouse over the tooltip container */\n.doc-viewer-button:hover .tooltiptext {\n  visibility: visible;\n}\n\n.doc-viewer-button .tooltiptext:hover {\n  pointer-events: none; /* Prevent tooltip from affecting the hover state */\n}\n\n.auto-link {\n  text-decoration: underline;\n}\n\n.kibana-boost-gray-400 {\n  color: #9ca3af;\n}\n';

  // src/index.js
  var discoverUrlPattern = "http://127.0.0.1:9200/_plugin/kibana/app/kibana#/discover";
  function runForDiscover() {
    if (!window.location.href.startsWith(discoverUrlPattern)) {
      return;
    }
    if (!window.hljs) {
      GM_addElement("link", {
        href: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/xcode.min.css",
        rel: "stylesheet"
      });
      GM_addElement("script", {
        src: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
        type: "text/javascript"
      });
      const observer = new MutationObserver((mutationsList, observer2) => {
        const kibanaBody = document.getElementById("kibana-body");
        if (kibanaBody) {
          observer2.disconnect();
          GM_addStyle(style_default);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    new DocViewerObserver({
      eachNewChildrenCallback: (parent) => {
        DocViewerFormat.each(parent);
        DocViewerButtons.for(parent);
      },
      newChildrenCallback: DocViewerFormat.for
    }).start();
  }
  function initDiscoverDownloadCsv() {
    let discoverResponseDataElement = document.getElementById("discover-response-data");
    if (!window.location.href.startsWith(discoverUrlPattern) || discoverResponseDataElement) {
      return;
    }
    discoverResponseDataElement = document.createElement("script");
    discoverResponseDataElement.id = "discover-response-data";
    discoverResponseDataElement.type = "application/json";
    document.head.appendChild(discoverResponseDataElement);
    const dataStorage = new DataStorage(discoverResponseDataElement);
    const shouldIntercept = (url) => url.includes("/_plugin/kibana/elasticsearch/_msearch");
    new XHRListener(dataStorage, shouldIntercept);
    const navRowButtons = new NavRowButtons();
    const exportButton = new ButtonHandler("download-discover-response-data", " Export ", () => {
      const data = dataStorage.getData();
      const csv = JsonToCsvConverter.convert(data);
      CsvDownloader.download(csv);
    });
    navRowButtons.addButton(exportButton.button, 'button.kuiLocalMenuItem[data-test-subj="shareTopNavButton"]');
    navRowButtons.observe();
  }
  var isDocRowToggling = false;
  function run() {
    runForDiscover();
    initDiscoverDownloadCsv();
    document.addEventListener("dblclick", (event) => {
      const docRow = event.target.closest(".kbnDocTable__row");
      const docViewer = event.target.closest(".kbnDocViewer__value");
      if (window.getSelection().toString().length === 0 && !docViewer && docRow && !isDocRowToggling) {
        isDocRowToggling = true;
        docRow.querySelector('[data-test-subj="docTableExpandToggleColumn"]').click();
        setTimeout(() => {
          isDocRowToggling = false;
        }, 100);
      }
    });
  }
  run();
  window.addEventListener("hashchange", run, false);
})();
