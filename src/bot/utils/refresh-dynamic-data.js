require('dotenv').config();
const BlizzardAPI = require('@api/blizzard-api.js');
const ProcessEndpoints = require('@api/process-endpoints');
const path = require('path');

async function saveData() {
    await processEndpoints.fetchAll(true);
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
    },
];

const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_SECRET_ID);
const processEndpoints = new ProcessEndpoints(blizzardAPI, endpoints);

saveData();