const { SlashCommandBuilder } = require('discord.js');
const { BlizzardAPI } = require('@api/blizzard-api')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snoop-toon')
		.setDescription('Snoops a WoW cata toon, but it\'s dumb'),
	async execute(interaction) {
		await interaction.reply('Pong! but in the dev environment..');
	},
};