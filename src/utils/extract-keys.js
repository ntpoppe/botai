/**
 * Extracts all keys from a JSON object, excluding specified keys
 * @param {object} obj - The JSON object to extract keys from
 * @param {array} excludeKeys - List of keys to exclude
 * @param {string} prefix - Prefix for nested keys
 * @returns {array} - List of keys in dot notation
 */
function extractKeys(obj, excludeKeys = [], prefix = '') {
    let keysList = [];

    for (const key in obj) {
        if (excludeKeys.includes(key)) continue;

        const fullKey = prefix ? `${prefix}.${key}` : key;
        keysList.push(fullKey);

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keysList = keysList.concat(extractKeys(obj[key], excludeKeys, fullKey));
        }
    }

    return keysList;
}

module.exports = extractKeys;
