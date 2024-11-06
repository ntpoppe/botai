const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deathroll')
		.setDescription('>:)')
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('Starting amount for the deathroll')
				.setRequired(true)
		),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount')

		if (amount <= 1) {
			return await interaction.reply({
				content: 'The starting amount must be greater than 1, brokie',
				ephemeral: true,
			});
		}

		if (amount >= 10000000) {
			return await interaction.reply({
				content: 'We all know you don\'t have that much.',
				ephemeral: true,
			});
		}

		const playerName = interaction.member?.displayName || interaction.user.username;
		const botName = interaction.client.user.username;

		await interaction.channel.send(`Let's begin, **${playerName}**...`);


		let currentRoll = amount * 10;
		let currentPlayer = playerName;

		const rollAndSendMessage = async () => {
			if (currentRoll > 1) {
				const roll = Math.floor(Math.random() * currentRoll) + 1;

				await interaction.channel.send(`**${currentPlayer}** rolled **${roll}** (1-${currentRoll})`);
				currentRoll = roll;

				currentPlayer = currentPlayer === playerName ? botName : playerName;

				if (currentRoll === 1) {
				await interaction.channel.send(`**${currentPlayer}** rolled a **1**. You lose.`);
				} else {
					setTimeout(rollAndSendMessage, 1000);
				}
			}
		};

		rollAndSendMessage();
	},
};