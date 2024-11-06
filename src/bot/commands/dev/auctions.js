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

	async execute(interaction) {
		const itemName = interaction.options.getString('name')?.toLowerCase();
		const auction = interaction.options.getInteger('house') || 6;
		const realm = interaction.options.getString('realm') || "mankrik";
		const region = interaction.options.getString('region') || 'us';

		try {
			await interaction.deferReply()

			const regionParams = [region]
			const dbRegion = await dbRead.getData('regions', 'getRegion', regionParams)
			if (dbRegion.length === 0) {
				await interaction.editReply({ content: `No region named **${region}** exists.`, ephemeral: true });
				return;
			}
			
			const realmParams = [realm, region]
			const dbRealm = await dbRead.getData('realms', 'getRealm', realmParams)
			if (dbRealm.length === 0) {
				await interaction.editReply({ content: `No realm named **${realm}** exists.`, ephemeral: true });
				return;
			}

			const itemParams = [itemName, auction, realm, region]
			const dbAuctions= await dbRead.getData('auctionHouse', 'getAuction', itemParams);
			if (dbAuctions.length === 0) {
				await interaction.editReply({ content: `There are no auctions for **${itemName}**`, ephemeral: true });
			}
	
			await interaction.reply('Pong! but in t:whe dev environment..');
		}
		catch (err) {
			logger.error(`Error in auctions command: ${error.message}`);
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: `There was an error fetching the auction listing for **${itemName}**. Yell at Retei.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `There was an error fetching the auction listing for **${itemName}**. Yell at Retei.`, ephemeral: true });
			}
		}
	},
};