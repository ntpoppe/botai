const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes messages from the channel from up to 14 days ago.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Deletes all messages in the channel. Use with caution.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bulk')
                .setDescription('Bulk deletes up to 100 messages from up to 14 days ago.')
                .addIntegerOption(option => 
                    option
                        .setName('amount')
                        .setDescription('Number of messages to delete (max 100)')
                        .setRequired(true)
                )
        ),
        
		
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'all') {
            await interaction.reply({
                content: 'Purging all messages... this may take a while.',
                ephemeral: true,
            });

            try {
                let deletedMessages;
                do {
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });

                    if (messages.size === 0) break;

                    deletedMessages = await interaction.channel.bulkDelete(messages, true);
                } while (deletedMessages.size >= 2);

                await interaction.followUp({
                    content: 'All messages have been purged from this channel.',
                    ephemeral: true,
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error trying to delete messages in this channel.',
                    ephemeral: true,
                });
            }
		} else if (subcommand === 'bulk') {
            const amount = interaction.options.getInteger('amount');

            if (amount < 1 || amount > 100) {
                return await interaction.reply({
                    content: 'Please provide a number between 1 and 100.',
                    ephemeral: true,
                });
            }
    
            try {
                await interaction.channel.bulkDelete(amount, true);
                await interaction.reply({
                    content: `Successfully deleted ${amount} messages.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error trying to delete messages in this channel.',
                    ephemeral: true,
                });
            }
        }
	},
};
