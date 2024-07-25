export default class JsonToCsvConverter {
  static convert(data) {
    if (!data || !data.length) {
      return '';
    }

    const keys = Object.keys(data[0]);
    const csvRows = [];

    // Add the header row
    csvRows.push(keys.join(','));

    // Add the data rows
    data.forEach(item => {
      const values = keys.map(key => {
        let value = item[key];

        // Convert arrays to comma-separated strings
        if (Array.isArray(value)) {
          value = value.join(',');
        }

        // Handle strings by escaping quotes and enclosing in quotes if necessary
        if (typeof value === 'string') {
          value = JsonToCsvConverter.escapeString(value);
        }
        // Handle objects by converting to JSON string and escaping quotes
        else if (value !== null && typeof value === 'object') {
          value = JsonToCsvConverter.escapeObject(value);
        }

        return value || '';
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  static escapeString(value) {
    value = value.replace(/"/g, '""'); // Escape double quotes
    if (value.includes(',') || value.includes('"')) {
      value = `"${value}"`; // Enclose in quotes if it contains commas or quotes
    }
    return value;
  }

  static escapeObject(value) {
    value = JSON.stringify(value).replace(/"/g, '""'); // Escape double quotes in JSON string
    return `"${value}"`; // Enclose in quotes
  }
}
