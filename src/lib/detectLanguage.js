export default function detectLanguage(str) {
  if (isJson(str)) {
    return 'json';
  } else if (isRubyHash(str)) {
    return 'ruby';
  } else if (isXml(str)) {
    return 'xml';
  } else {
    return 'auto';
  }
}

function isRubyHash(str) {
  // Check for Ruby Hash arrow '=>'
  return str.includes('=>');
}

function isJson(str) {
  // Remove any leading or trailing whitespace
  str = str.trim();

  // Check if the string starts with '{' and ends with '}' or starts with '[' and ends with ']'
  if ((str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))) {
    try {
      // Attempt to parse the string as JSON
      const parsed = JSON.parse(str);

      // Ensure that the parsed result is an object or array
      return parsed !== null && (typeof parsed === 'object' || Array.isArray(parsed));
    // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      return false;
    }
  }

  return false;
}

function isXml(str) {
  // Remove any leading or trailing whitespace
  str = str.trim();

  // Check if the string starts with '<' and ends with '>'
  return str.startsWith('<') && str.endsWith('>');
}
