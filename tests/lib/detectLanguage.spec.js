import detectLanguage from 'detectLanguage';

describe('detectLanguage', () => {
  test('detects Ruby hash', () => {
    const str = `{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}\t   \t`
    expect(detectLanguage(str)).toBe('ruby');
  });

  test('detects JSON', () => {
    const str = `{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"}}}`
    expect(detectLanguage(str)).toBe('json');
  });

  test('detects XML', () => {
    const str = `<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>`
    expect(detectLanguage(str)).toBe('xml');
  });

  test('detects auto', () => {
    const str = `Hello, world!`
    expect(detectLanguage(str)).toBe('auto');
  });
});

