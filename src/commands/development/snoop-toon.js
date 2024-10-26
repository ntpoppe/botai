const { SlashCommandBuilder } = require('discord.js');
const BlizzardAPI = require('@api/blizzard-api')
const ProcessEndpoints = require('@api/process-endpoints')
const config = require('@src/config.json')
const generateEndpoint = require('@utils/generate-endpoint')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snoop-toon')
		.setDescription('Snoops a WoW cata toon, but it\'s dumb, and assumes US based.')
		.addStringOption(option => 
			option.setName('name')
				.setDescription('Name of the character')
				.setRequired(true)
		)
		.addStringOption(option => 
			option.setName('realm')
				.setDescription('Realm of the character.')
				.setRequired(true)
		),
	async execute(interaction) {
		const endpointName = 'playerProfile';
		const name = interaction.options.getString('name')?.toLowerCase();
		const realm = interaction.options.getString('realm')?.toLowerCase();
		const namespace = 'profile-classic-us';

		if (!name || !realm) {
			return interaction.reply({ content: 'Name and realm are required!', ephemeral: true });
		}

		const endpoint = generateEndpoint(endpointName, realm, name, namespace, 'en_US','../../data');
		const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
		const processEndpoints = new ProcessEndpoints(blizzardAPI);

		const data = await processEndpoints.fetchEndpoint(endpoint);
		const profileData = data[endpointName];

		await interaction.reply(`Here's some data about ${profileData.name}: Race: ${profileData.race.name}, Level: ${profileData.level}, Guild: ${profileData.guild.name}`);
	},
};