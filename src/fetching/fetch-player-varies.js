const fs = require('fs');
const fetch = require('node-fetch'); 
const config = require('../config.json')

const media = "https://us.api.blizzard.com/profile/wow/character/mankrik/retei/character-media?namespace=profile-classic-us"

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

async function getVaries(slug, characterName) {
    const accessToken = await getAccessToken();
    const apiUrl = media;

    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
    }

    const auctionData = await response.json();

    fs.writeFile('../../data/player_varies.json', JSON.stringify(auctionData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('Data saved to player_varies.json');
        }
    });
}

slug = 'mankrik'
characterName = 'retei'
getVaries(slug, characterName);