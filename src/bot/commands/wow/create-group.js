const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-group')
		.setDescription('x'),
	async execute(interaction) {
		await interaction.reply('not yet bud');
	},
};