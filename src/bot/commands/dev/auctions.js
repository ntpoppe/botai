const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const BlizzardAPI = require('@api/blizzard-api')
const ProcessEndpoints = require('@api/process-endpoints')
const generateEndpoint = require('@api/generate-endpoint')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dev-ping')
		.setDescription('Replies with Pong! but in the dev enviroment..'),
	async execute(interaction) {
		await interaction.reply('Pong! but in t:whe dev environment..');
	},
};