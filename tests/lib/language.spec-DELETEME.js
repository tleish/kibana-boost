import { rubyHashToJson, detectLanguage, jsonPrettyPrint } from 'language';

describe('detectLanguage', () => {
  test('detects Ruby hash', () => {
    const str = `{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}\t   \t`
    expect(detectLanguage(str)).toBe('language-ruby');
  });

  test('detects JSON', () => {
    const str = `{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"}}}`
    expect(detectLanguage(str)).toBe('language-json');
  });

  test('detects XML', () => {
    const str = `<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>`
    expect(detectLanguage(str)).toBe('language-xml');
  });

  test('detects auto', () => {
    const str = `Hello, world!`
    expect(detectLanguage(str)).toBe('language-auto');
  });
});

describe('rubyHashToJson', () => {
  test('parses typical ruby hash', () => {
    const src = `{"shipment"=>{"to_location"=>{"first_name"=>"John", "last_name"=>"Doe"}}}\t   \t`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json.shipment.to_location.first_name).toBe('John');
  });

  test('parses ruby keys as symbols', () => {
    const src = `{:address=>{:name=>"John Doe", :street1=>"1234 Main St"}, :verify=>true}`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json.address.name).toBe('John Doe');
  });

  test('parses dates with ":"', () => {
    const src = `{ "created_at"  =>"2024-07-19T21:01:59.000Z", "updated_at" => "2024-07-19T21:01:59.000Z" }`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json.created_at).toBe('2024-07-19T21:01:59.000Z');
  });

  test('parses keys with dashes', () => {
    const src = `{"X-Started-At"=>"1721425235.567658"}`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json['X-Started-At']).toBe('1721425235.567658');
  });

  test('handles nil values', () => {
    const src = `{:address=>{:company=>nil}}`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json.address.company).toBe(null);
  });

  test('does not change words that include the word "nil"', () => {
    const src = `{:address=>{:company=>"Va nil la Inc."}}`
    const json = JSON.parse(rubyHashToJson(src));
    expect(json.address.company).toBe('Va nil la Inc.');
  });
});

describe('jsonPrettyPrint', () => {
  test('pretty prints JSON', () => {
    const src = `{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"}}}`
    const pretty = jsonPrettyPrint(src);
    expect(pretty).toBe(`{
  "shipment": {
    "to_location": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}`);
  });
  test('invalid JSON returns original string', () => {
    const src = `{"shipment": {"to_location": {"first_name": "John", "last_name": "Doe"`
    const pretty = jsonPrettyPrint(src);
    expect(pretty).toBe(src);
  });
});

