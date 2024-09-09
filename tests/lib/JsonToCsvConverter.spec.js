import JsonToCsvConverter from 'JsonToCsvConverter';

describe('JsonToCsvConverter', () => {
  test('should return an empty string for empty data', () => {
    const data = [];
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe('');
  });

  test('should convert simple JSON array to CSV', () => {
    const data = [
      { name: 'John Doe', age: 30, city: 'New York' },
      { name: 'Jane Smith', age: 25, city: 'Los Angeles' }
    ];
    const expectedCsv = 'name,age,city\nJohn Doe,30,New York\nJane Smith,25,Los Angeles';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should handle strings with quotes and commas', () => {
    const data = [
      { name: 'John "Johnny" Doe', city: 'New York, NY' }
    ];
    const expectedCsv = 'name,city\n"John ""Johnny"" Doe","New York, NY"';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should convert arrays to comma-separated strings', () => {
    const data = [
      { name: 'John Doe', hobbies: ['reading', 'travelling'] }
    ];
    const expectedCsv = 'name,hobbies\nJohn Doe,"reading,travelling"';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should convert objects to JSON strings', () => {
    const data = [
      { name: 'John Doe', address: { street: '123 Main St', city: 'New York' } }
    ];
    const expectedCsv = 'name,address\nJohn Doe,"{""street"":""123 Main St"",""city"":""New York""}"';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should handle null and undefined values', () => {
    const data = [
      { name: 'John Doe', age: null, city: undefined }
    ];
    const expectedCsv = 'name,age,city\nJohn Doe,,';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should handle mixed data types', () => {
    const data = [
      { name: 'John Doe', age: 30, hobbies: ['reading', 'travelling'], address: { street: '123 Main St', city: 'New York' }, notes: 'Enjoys "long" walks, and sunsets' }
    ];
    const expectedCsv = 'name,age,hobbies,address,notes\nJohn Doe,30,"reading,travelling","{""street"":""123 Main St"",""city"":""New York""}","Enjoys ""long"" walks, and sunsets"';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should convert timestamps to a format excel can support', () => {
    const data = [
      { 'duration': 1.40697, '@timestamp': '2024-08-19T09:08:59.990Z' }
    ];
    const expectedCsv = 'timestamp_start,timestamp_end,duration,@timestamp\n2024-08-19 02:08:58.583,2024-08-19 02:08:59.990,1.40697,2024-08-19T09:08:59.990Z';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });

  test('should convert handle if no duration', () => {
    const data = [
      { 'duration': null, '@timestamp': '2024-08-19T09:08:59.990Z' }
    ];
    const expectedCsv = 'timestamp_start,timestamp_end,duration,@timestamp\n2024-08-19 02:08:59.990,2024-08-19 02:08:59.990,,2024-08-19T09:08:59.990Z';
    const result = JsonToCsvConverter.convert(data);
    expect(result).toBe(expectedCsv);
  });
});
