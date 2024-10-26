const fs = require('fs');
const fetch = require('node-fetch'); 

const mankrikId = 4384
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

async function getAuctionIndex() {
    const accessToken = await getAccessToken();
    const apiRealmsUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${mankrikId}/auctions/index?namespace=dynamic-classic-us`

    const response = await fetch(apiRealmsUrl, {
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

    fs.writeFile('../data/auction_index_data.json', JSON.stringify(auctionData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('Auction data saved to auction_index_data.json');
        }
    });
}

getAuctionIndex();