export default class DataStorage {
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
    return JSON.parse(this.element.textContent || '[]');
  }
}
