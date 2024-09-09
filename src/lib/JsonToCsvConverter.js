export default class JsonToCsvConverter {
  static convert(data) {
    if (!data || !data.length) {
      return '';
    }

    const keys = Object.keys(data[0]);
    if (keys.includes('@timestamp')) {
      // add timestamp_start and timestamp_end
      keys.unshift('timestamp_end');
      keys.unshift('timestamp_start');
    }
    
    const csvRows = [];

    // Add the header row
    csvRows.push(keys.join(','));

    // Add the data rows
    data.forEach(item => {

      if(item['@timestamp']){
        // Create start/end timestamp
        const timestamp_end = new Date(item['@timestamp']);
        const duration = item['duration'] || 0;
        const timestamp_start = new Date(timestamp_end - duration * 1000);

        // convert from UTC to local time
        timestamp_start.setMinutes(timestamp_start.getMinutes() - timestamp_start.getTimezoneOffset());
        timestamp_end.setMinutes(timestamp_end.getMinutes() - timestamp_end.getTimezoneOffset());

        item['timestamp_start'] = timestamp_start.toISOString().replace('T', ' ').replace('Z', '');
        item['timestamp_end'] = timestamp_end.toISOString().replace('T', ' ').replace('Z', '');
      }

      const values = keys.map(key => {
        let value = item[key];

        // Convert arrays to comma-separated strings
        if (Array.isArray(value)) {
          value = value.join(',');
        }
        // Handle objects by converting to JSON string and escaping quotes
        if (typeof value === 'string') {
          value = escapeString(value);
        }
        // Handle objects by converting to JSON string and escaping quotes
        else if (value !== null && typeof value === 'object') {
          value = escapeObject(value);
        }

        return value || '';
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}


function escapeString(value) {
  value = value.replace(/"/g, '""'); // Escape double quotes
  if (value.includes(',') || value.includes('"')) {
    value = `"${value}"`; // Enclose in quotes if it contains commas or quotes
  }
  return value;
}

function escapeObject(value) {
  value = JSON.stringify(value).replace(/"/g, '""'); // Escape double quotes in JSON string
  return `"${value}"`; // Enclose in quotes
}

function isISO8601(str) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return iso8601Regex.test(str);
}

function convertToExcelDateTime(str) {
  const date = new Date(str);
  return date;
}
