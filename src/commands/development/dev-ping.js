const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dev-ping')
		.setDescription('Replies with Pong! but in the dev enviroment..'),
	async execute(interaction) {
		await interaction.reply('Pong! but in the dev environment..');
	},
};