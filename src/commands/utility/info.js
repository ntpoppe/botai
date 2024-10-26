const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information about the user.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'user') {
			const user = interaction.options.getUser('target') || interaction.user;
			await interaction.reply(`User: ${user.username}, ID: ${user.id}`);
		} else if (subcommand === 'server') {
			await interaction.reply(`Server: ${interaction.guild.name}, ID: ${interaction.guild.id}`);
		}
}
};