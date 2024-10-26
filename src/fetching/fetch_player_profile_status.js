const fs = require('fs');
const fetch = require('node-fetch'); 

const clientId = '307c0637ae55477c89c5e6688ff59881';
const clientSecret = 'W9pD451ogJ6Qg7bKBxynm77Rw2JHS3lD';

async function getAccessToken() {
    const authUrl = 'https://oauth.battle.net/token';
    const credentials = btoa(`${clientId}:${clientSecret}`);

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

async function getPlayerStatus(slug, characterName) {
    const accessToken = await getAccessToken();
    const apiUrl = `https://us.api.blizzard.com/profile/wow/character/${slug}/${characterName}/status?namespace=profile-classic-us&locale=en_US`;

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

    fs.writeFile('../../data/player_status_data.json', JSON.stringify(auctionData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('Auction data saved to player_profile_data.json');
        }
    });
}

slug = 'mankrik'
characterName = 'retei'
getPlayerStatus(slug, characterName);