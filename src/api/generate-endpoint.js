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
function generateEndpoint(name, endpointParams, locale = 'en_US', dataDir = '../data') {
    const { namespace, orderby, id, _pageSize, _page } = endpointParams;

    const endpointTemplates = {
        'playerProfile': `profile/wow/character/{realm}/{characterName}`,
        'realmData': `data/wow/search/connected-realm`,
        'classIndex': `data/wow/playable-class/index`,
        'itemClassIndex': `data/wow/item-class/index`,
        'itemClass': `data/wow/item-class/{itemClassId}`,
        'itemMedia': `data/wow/media/item/{itemId}`,
        'itemSearch': `data/wow/search/item`,
        'regionIndex': `data/wow/region/index`,
        'auctionHouseIndex': `data/wow/connected-realm/{realmId}/auctions/index`,
        'auctionHouseListings': `data/wow/connected-realm/{realmId}/auctions/{auctionHouseId}`
    };

    const template = endpointTemplates[name];

    if (!template) {
        throw new Error(`Unknown endpoint name: ${name}`);
    }

    // Replace placeholders with actual values from endpointData
    const pathStr = template.replace(/\{(\w+)\}/g, (_, key) => {
        const value = endpointParams[key];
        if (value === undefined) {
            throw new Error(`Missing parameter "${key}" for endpoint "${name}"`);
        }
        return encodeURIComponent(value);
    });

    const filename = `${name}.json`; // e.g., 'playerProfile.json'
    const savePath = path.join(__dirname, dataDir, filename);

    const rawParams = { namespace, locale, orderby, id, _pageSize, _page };
    const params = Object.fromEntries(
      Object.entries(rawParams).filter(([_, v]) => v !== undefined)
    );

    return {
        name,
        path: pathStr,
        params,
        savePath
    };
}

module.exports = generateEndpoint;
