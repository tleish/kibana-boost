import DataStorage from 'DataStorage';

describe('DataStorage', () => {
  let element;

  beforeEach(() => {
    // Set up a mock element before each test
    element = document.createElement('div');
    element.id = 'testElement';
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  test('should throw an error if the element is not found', () => {
    expect(() => new DataStorage(null)).toThrow('DataStorage Element not found');
  });

  test('should store data correctly', () => {
    const dataStorage = new DataStorage(element);
    const data = JSON.stringify([{ id: 1, value: 'test' }]);

    dataStorage.storeData(data);

    expect(element.textContent).toBe(data);
  });

  test('should retrieve data correctly', () => {
    const dataStorage = new DataStorage(element);
    const data = [{ id: 1, value: 'test' }];
    element.textContent = JSON.stringify(data);

    const retrievedData = dataStorage.getData();

    expect(retrievedData).toEqual(data);
  });

  test('should return an empty array if no data is stored', () => {
    const dataStorage = new DataStorage(element);

    const retrievedData = dataStorage.getData();

    expect(retrievedData).toEqual([]);
  });
});
