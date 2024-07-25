import CsvDownloader from 'CsvDownloader';

describe('CsvDownloader', () => {
  let createObjectURLMock;
  let revokeObjectURLMock;

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    createObjectURLMock = jest.fn(() => 'blob:url');
    revokeObjectURLMock = jest.fn();

    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      },
      writable: true,
    });

    jest.clearAllMocks();
  });

  test('should create a Blob with the correct CSV data and type', () => {
    const csvData = 'column1,column2\nvalue1,value2';

    CsvDownloader.download(csvData);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURLMock.mock.calls[0][0];
    expect(blobArg instanceof Blob).toBe(true);
    expect(blobArg.type).toBe('text/csv');

    const reader = new FileReader();
    reader.onload = () => {
      expect(reader.result).toBe(csvData);
    };
    reader.readAsText(blobArg);
  });

  test('should set the correct download attribute and click the link', () => {
    const csvData = 'column1,column2\nvalue1,value2';
    const filename = 'test.csv';

    const aElementMock = {
      setAttribute: jest.fn(),
      click: jest.fn(),
    };
    document.createElement = jest.fn(() => aElementMock);

    CsvDownloader.download(csvData, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(aElementMock.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
    expect(aElementMock.setAttribute).toHaveBeenCalledWith('download', filename);
    expect(aElementMock.click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:url');
  });

  test('should use the default filename if none is provided', () => {
    const csvData = 'column1,column2\nvalue1,value2';

    const aElementMock = {
      setAttribute: jest.fn(),
      click: jest.fn(),
    };
    document.createElement = jest.fn(() => aElementMock);

    CsvDownloader.download(csvData);

    expect(aElementMock.setAttribute).toHaveBeenCalledWith('download', 'kibana-data.csv');
  });
});
