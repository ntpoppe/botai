const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows how to use my commands.'),
	async execute(interaction) {
		await interaction.reply('lmao u thought, i dont feel like adding this');
	},
};