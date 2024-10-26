const fs = require('fs');
const fetch = require('node-fetch'); 
const config = require('../config.json')

async function getAccessToken() {
    const authUrl = 'https://oauth.battle.net/token';
    const credentials = btoa(`${config.wowClientId}:${config.wowClientSecret}`);

    const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function getPlayerProfile(slug, characterName) {
    const accessToken = await getAccessToken();
    const apiUrl = `https://us.api.blizzard.com/profile/wow/character/${slug}/${characterName}?namespace=profile-classic-us&locale=en_US`;

    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        console.error('Error fetching player profile data:', response.statusText);
        return;
    }

    const auctionData = await response.json();

    fs.writeFile('../../data/player_profile_data.json', JSON.stringify(auctionData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('Player profile data saved to player_profile_data.json');
        }
    });
}

slug = 'mankrik'
characterName = 'retei'
getPlayerProfile(slug, characterName);

const jsonData = JSON.parse(fs.readFileSync('../../data/player_profile_data.json', 'utf8'));

function extractKeys(obj, prefix = '') {
    let keysList = [];

    for (const key in obj) {
        if (key === 'equipped_items') continue; // Skip "equipped_items"

        const fullKey = prefix ? `${prefix}.${key}` : key;
        keysList.push(fullKey);

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keysList = keysList.concat(extractKeys(obj[key], fullKey));
        }
    }
    return keysList;
}

const keysOnly = extractKeys(jsonData);
console.log(keysOnly.join('\n'));