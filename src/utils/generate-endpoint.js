const path = require('path');

/**
 * Generates an endpoint configuration object based on provided parameters.
 *
 * @param {string} name - The unique name of the endpoint (e.g., 'playerProfile').
 * @param {string} realm - The realm/server name (e.g., 'mankrik').
 * @param {string} characterName - The name of the character (e.g., 'retei').
 * @param {string} namespace - The API namespace (e.g., 'profile-classic-us').
 * @param {string} locale - The locale setting (e.g., 'en_US').
 * @param {string} [dataDir='../data'] - The directory where JSON data will be saved.
 *
 * @returns {Object} An endpoint configuration object containing name, path, params, and savePath.
 *
 * @example
 *
 * const endpoint = generateEndpoint(
 *   'playerProfile',
 *   'mankrik',
 *   'retei',
 *   'profile-classic-us',
 *   'en_US'
 * );
 *
 * console.log(endpoint);
 * // {
 * //   name: 'playerProfile',
 * //   path: 'profile/wow/character/mankrik/retei',
 * //   params: {
 * //     namespace: 'profile-classic-us',
 * //     locale: 'en_US'
 * //   },
 * //   savePath: '/absolute/path/to/data/player_profile_data.json'
 * // }
 */
function generateEndpoint(name, endpointData, locale = 'en_US', dataDir = '../data') {
    const { realm, characterName, namespace } = endpointData;

    if (!name || !realm || !characterName || !namespace || !locale) {
        throw new Error('All parameters except locale and dataDir are required.');
    }

    let pathStr = ''

    if (name == 'playerProfile') {
        pathStr = `profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(characterName)}`
    } else {
        throw new Error('Unknown endpoint name')
    }
    
    const filename = `${name}.json`; // e.g., 'playerProfile.json'
    const savePath = path.join(__dirname, dataDir, filename);

    const params = {
        namespace,
        locale
    };

    return {
        name,
        path: pathStr,
        params,
        savePath
    };
}

module.exports = generateEndpoint;
