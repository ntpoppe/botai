const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Checks Botai\'s latency'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(`latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
	},
};