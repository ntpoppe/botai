const BlizzardAPI = require('@api/blizzard-api.js');
const ProcessEndpoints = require('@api/process-endpoints');
const config  = require('@src/config');
const path = require('path');

async function saveData() {
    await processEndpoints.fetchAll(true);
    //await saveApiData.processSavedData('playerProfile', ['equipped_items']);
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
        savePath: path.join(__dirname, '../../data/realm_data.json')
    },
    {
        name: 'auctionIndex',
        path: `data/wow/connected-realm/${mankrikId}/auctions/index`,
        params: {
            namespace: 'dynamic-classic-us',
            locale: ''
        },
        savePath: path.join(__dirname, '../../data/auction_house_index.json')
    },
    {
        name: 'auctionData',
        path: `data/wow/connected-realm/${mankrikId}/auctions/${hordeHouseId}`,
        params: {
            namespace: 'dynamic-classic-us',
            locale: 'en_US'
        },
        savePath: path.join(__dirname, '../../data/auction_house_data.json')
    }
];

const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
const processEndpoints = new ProcessEndpoints(blizzardAPI, endpoints);

saveData();