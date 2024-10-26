const BlizzardAPI = require('./api/blizzard-api');
const SaveApiData = require('./api/save-api-data');
const path = require('path');
const config  = require('./config.json');

// Update data

async function saveData() {
    await saveApiData.fetchAndSaveAll();

    await saveApiData.processSavedData('playerProfile', ['equipped_items']);
}

const mankrikId = 4384
const hordeHouseId = 6;

const endpoints = [
    {
        name: 'realmData',
        path: `data/wow/search/connected-realm?namespace=dynamic-classic-us`,
        params: {
            namespace: 'dynamic-classic-us',
            locale: 'en_US'
        },
        savePath: path.join(__dirname, '../data/realm_data.json')
    },
    {
        name: 'playerProfile',
        path: `profile/wow/character/mankrik/retei`,
        params: {
            namespace: 'profile-classic-us',
            locale: 'en_US'
        },
        savePath: path.join(__dirname, '../data/player_profile_data.json')
    },
    {
        name: 'auctionIndex',
        path: `data/wow/connected-realm/${mankrikId}/auctions/index`,
        params: {
            namespace: 'dynamic-classic-us',
            locale: ''
        },
        savePath: path.join(__dirname, '../data/auction_house_index.json')
    },
    {
        name: 'auctionData',
        path: `data/wow/connected-realm/${mankrikId}/auctions/${hordeHouseId}`,
        params: {
            namespace: 'dynamic-classic-us',
            locale: 'en_US'
        },
        savePath: path.join(__dirname, '../data/auction_house_data.json')
    }
];

const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
const saveApiData = new SaveApiData(blizzardAPI, endpoints);

saveData();