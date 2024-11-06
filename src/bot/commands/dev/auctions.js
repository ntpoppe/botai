const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const BlizzardAPI = require('@api/blizzard-api')
const ProcessEndpoints = require('@api/process-endpoints')
const generateEndpoint = require('@api/generate-endpoint')
const dbRead = require('@db/read-data')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('auctions')
		.setDescription('Find a list of auctions for an item. Defaults to Mankrik Horde.')
		.addStringOption(option => 
			option.setName('name')
				.setDescription('Name of the item')
				.setRequired(true)
		)
        .addIntegerOption(option =>
            option.setName('house')
                .setDescription('Faction auction house')
                .setRequired(false)
				.addChoices(
					{ name: 'Horde', value: 6 },
					{ name: 'Alliance', value: 2 },
					{ name: 'Blackwater', value: 7 },
				)
		)
		.addStringOption(option => 
			option.setName('realm')
				.setDescription('Realm of the auction house')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('region')
				.setDescription('Region of the auction house')
				.setRequired(false)
				.addChoices(
					{ name: 'us', value: 'us' },
					{ name: 'eu', value: 'eu' },
					{ name: 'kr', value: 'kr' },
					{ name: 'tw', value: 'tw' },
				)
		),

	async createEmbed(payload) {
		const spacer = '\u00A0'.repeat(2);
		const extractedIconName = this.extractIconName(payload.itemMedia);

		const auctions = this.sortAuctionsByBid(payload.auctions)

		const parsedAuctions = auctions.map(auction => ({
			...auction,
			bid: this.convertCopperToGoldSilverCopper(auction.bid),
			buyout: this.convertCopperToGoldSilverCopper(auction.buyout),
		}));
		
		const embed = new EmbedBuilder()
		.setColor(0xB0B0B0)
		.setTitle(`Auctions for: ${payload.itemName}`)
		.setDescription(`AH: ${payload.realm} ${payload.house}\n\nTotal auctions: ${payload.totalAuctions}`)
		.setThumbnail(`https://wow.zamimg.com/images/wow/icons/large/${extractedIconName}`)
		.addFields(
			{ name: `${spacer}`, value: '------------------------------------------', inline: false },
			{ name: 'Cheapest Listings', value: `${spacer}`, inline: false },
			{ name: 'Bid', value: parsedAuctions.map(a => `${a.bid || 'N/A'}`).join('\n'), inline: true },
			{ name: 'Buyout', value: parsedAuctions.map(a => `${a.buyout || 'N/A'}`).join('\n'), inline: true },
			{ name: 'Qty', value: parsedAuctions.map(a => a.quantity || 'N/A').join('\n'), inline: true },
			{ name: `${spacer}`, value: `${spacer}`, inline: false },
			{ name: `${spacer}`, value: `**Average bid:** ${this.calculateAverageBid(payload.auctions)}`, inline: false },
			{ name: `${spacer}`, value: `**Average buyout:** ${this.calculateAverageBuyout(payload.auctions)}`, inline: false },
		)
		.setTimestamp();

		return embed
	},

	async fetchItemMedia(blizzardAPI, itemId, region = 'us') {
		const processEndpoints = new ProcessEndpoints(blizzardAPI);
		const endpointParams = { 'namespace': `static-classic-${region}`, 'locale': 'en_US' };
		const mediaEndpointName = 'itemMedia';
		const mediaEndpointParams = { ...endpointParams, itemId: itemId };
		const mediaEndpoint = generateEndpoint(mediaEndpointName, mediaEndpointParams);

		try {
			const mediaResponse = await processEndpoints.fetchEndpoint(mediaEndpoint);
			const mediaData = mediaResponse[mediaEndpointName];

			if (mediaData && mediaData.assets && mediaData.assets.length > 0) {
				const imageUrl = mediaData.assets.find(asset => asset.key === 'icon')?.value;
				return imageUrl || null;
			} else {
				console.warn(`No media data found for item ID ${itemId}`);
				return null;
			}
		} catch (error) {
			console.error(`Error fetching media for item ID ${itemId}:`, error);
			return null;
		}
	},

	extractIconName(url) {
		const parts = url.split('/');
		return parts[parts.length - 1];
	},

	parseValue(value) {
		const parsed = parseInt(value, 10);
		return isNaN(parsed) ? 0 : parsed;
	},

	sortAuctionsByBid(auctions, topN = 10) {
		return auctions.sort((a, b) => this.parseValue(a.buyout) - this.parseValue(b.buyout)).slice(0, topN);
	},

	convertCopperToGoldSilverCopper(totalCopper) {
		const copper = typeof totalCopper === 'string' ? parseInt(totalCopper, 10) : totalCopper;
		
		if (isNaN(copper) || copper < 0) {
			return '0g 0s 0c';
		}
		
		const gold = Math.floor(copper / 10000);
		const remainingAfterGold = copper % 10000;
		const silver = Math.floor(remainingAfterGold / 100);
		const remainingCopper = remainingAfterGold % 100;
		
		return `${gold}g ${silver}s ${remainingCopper}c`;
	},

	calculateAverageBid(auctions) {
		if (auctions.length === 0) return '0g 0s 0c';
	
		const bids = auctions.map(auction => parseInt(auction.bid, 10)).sort((a, b) => a - b);
		
		const q1 = this.calculatePercentile(bids, 0.25);
		const q3 = this.calculatePercentile(bids, 0.75);
		const iqr = q3 - q1;
	
		const lowerBound = q1 - 1.5 * iqr;
		const upperBound = q3 + 1.5 * iqr;
	
		const filteredBids = bids.filter(bid => bid >= lowerBound && bid <= upperBound);
	
		const totalCopper = filteredBids.reduce((sum, bid) => sum + bid, 0);
		const averageCopper = Math.floor(totalCopper / filteredBids.length);
	
		return this.convertCopperToGoldSilverCopper(averageCopper);
	},
	
	calculateAverageBuyout(auctions) {
		if (auctions.length === 0) return '0g 0s 0c';
	
		const buyouts = auctions.map(auction => parseInt(auction.buyout, 10)).sort((a, b) => a - b);
		
		const q1 = this.calculatePercentile(buyouts, 0.25);
		const q3 = this.calculatePercentile(buyouts, 0.75);
		const iqr = q3 - q1;
	
		const lowerBound = q1 - 1.5 * iqr;
		const upperBound = q3 + 1.5 * iqr;
	
		const filteredBuyouts = buyouts.filter(buyout => buyout >= lowerBound && buyout <= upperBound);
	
		const totalCopper = filteredBuyouts.reduce((sum, buyout) => sum + buyout, 0);
		const averageCopper = Math.floor(totalCopper / filteredBuyouts.length);
	
		return this.convertCopperToGoldSilverCopper(averageCopper);
	},
	
	calculatePercentile(values, percentile) {
		if (values.length === 0) return 0;
	
		const index = (values.length - 1) * percentile;
		const lower = Math.floor(index);
		const upper = lower + 1;
		const weight = index % 1;
	
		if (upper >= values.length) return values[lower];
		return values[lower] * (1 - weight) + values[upper] * weight;
	},

	async execute(interaction) {
		const itemName = interaction.options.getString('name');
		const auctionHouse = interaction.options.getInteger('house') || 6;
		const realm = interaction.options.getString('realm') || "mankrik";
		const region = interaction.options.getString('region') || 'us';

		try {
			const blizzardAPI = new BlizzardAPI(process.env.WOW_CLIENT_ID, process.env.WOW_CLIENT_SECRET, region);

			await interaction.deferReply()

			const regionParams = [region];
			const dbRegion = await dbRead.readData('regions', 'getRegion', regionParams);
			if (dbRegion.length === 0) {
				await interaction.editReply({ content: `No region named **${region}** exists. I might not have stored it.`, ephemeral: true });
				return;
			}
			
			const realmParams = [realm, dbRegion[0].region_id];
			const dbRealm = await dbRead.readData('realms', 'getRealm', realmParams);
			if (dbRealm.length === 0) {
				await interaction.editReply({ content: `No realm named **${realm}** exists. I might not have stored it.`, ephemeral: true });
				return;
			}
			
			const itemParams = [itemName];
			const dbItem = await dbRead.readData('items', 'getItem', itemParams)
			if (dbItem.length === 0) {
				await interaction.editReply({ content: `No item with name **${itemName}** found. I might not have stored it.`, ephemeral: true });
				return
			}

			const auctionParams = [dbItem[0].id, auctionHouse, dbRealm[0].realm_id];
			const dbAuctions = await dbRead.readData('auctionHouse', 'getAuction', auctionParams);
			if (dbAuctions.length === 0) {
				await interaction.editReply({ content: `There are no auctions for **${itemName}**. I might not have stored them.`, ephemeral: true });
				return;
			}

			const media = await this.fetchItemMedia(blizzardAPI, dbItem[0].id, region)
			const house = auctionHouse === 6 ? "Horde" : auctionHouse === 2 ? "Alliance" : auctionHouse === 7 ? "Blackwater" : "Unknown";
			
			const payload = {
				itemName: dbItem[0].name,
				itemMedia: media,
				totalAuctions: dbAuctions.length,
				auctions: dbAuctions,
				realm: dbRealm[0].name,
				house: house,
			}

			const auctionsEmbed = await this.createEmbed(payload)
	
			await interaction.editReply({
				embeds: [auctionsEmbed] ,
			});
		}
		catch (err) {
			logger.error(`Error in auctions command: ${err.message}`);
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: `There was an error fetching the auction listing for **${itemName}**. Yell at Retei.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `There was an error fetching the auction listing for **${itemName}**. Yell at Retei.`, ephemeral: true });
			}
		}
	},
};