const fs = require('fs');
const fetch = require('node-fetch');
const config = require('../config.json')

const mankrikId = 4384;
const allianceHouseId = 2;
const hordeHouseId = 6;
const blackwaterHouseId = 7;

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

async function getAuctionData(houseId) {
    const accessToken = await getAccessToken();
    const apiUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${mankrikId}/auctions/${houseId}?namespace=dynamic-classic-us`

    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'dynamic-us'
        }
    });

    if (!response.ok) {
        console.error('Error fetching auction house data:', response.statusText);
        return;
    }

    const auctionData = await response.json();

    fs.writeFile('../../data/auction_data.json', JSON.stringify(auctionData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('Auction data saved to auction_data.json');
        }
    });
}

getAuctionData(hordeHouseId);