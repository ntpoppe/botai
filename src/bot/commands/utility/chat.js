const { SlashCommandBuilder } = require('discord.js');
const Ollama = require('@api/ollama.js')
const TemplateManagement = require(`@api/template-management.js`)
const OpenAI = require("openai")

const activeUsers = new Set();
const userConversations = new Map();
const openai = new OpenAI();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Chat with Botai about WoW stuff.'),

	async execute(interaction) {
		const userId = interaction.user.id
		const user = interaction.member?.displayName || interaction.user.username;
	
		if (activeUsers.has(userId)) {
            await interaction.reply({ 
                content: `You're already in a chat session. Finish that before starting a new one.`,
                ephemeral: true 
            });
            return;
        }

		activeUsers.add(userId);
		userConversations.set(userId, []);

		await interaction.reply({ content: `Hey, ${user}. What can I do for you?` });
	
		if (!interaction.channel) {
			console.log('interaction.channel is null or undefined.');
			await interaction.followUp({ content: 'Error: Cannot access the channel.', ephemeral: true });
			activeUsers.delete(userId);
			userConversations.delete(userId);
			return;
		}
	
		const filter = (response) => {
			console.log('Received message from:', response.author.username);
			return response.author.id === interaction.user.id;
		};
	
        const collector = interaction.channel.createMessageCollector({
            filter,
            idle: 60000 * 2, 
        });
	
		collector.on('collect', async (message) => {
			console.log('Message collected:', message.content);
			const question = message.content;

			const sent = await message.reply('Thinking...');
	
			try {
				//const ollama = new Ollama();
				let conversation = userConversations.get(userId) || [];

                let systemPrompt = '';
                if (conversation.length === 0) {
                    const templateManagement = new TemplateManagement();
                    systemPrompt = templateManagement.populateTemplate(templateManagement.templates.chat, {});
                }

				conversation.push({ role: 'user', content: question });

				const messages = [];
                if (systemPrompt) {
                    messages.push({ role: 'system', content: systemPrompt });
                }
                messages.push(...conversation);

				//const response = await ollama.query(prompt)
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: messages,
					max_tokens: 1800,
                });

				const assistantReply = completion.choices[0].message.content;

                // Update conversation history with assistant's reply
                conversation.push({ role: 'assistant', content: assistantReply });

                // Update the conversation in the Map
                userConversations.set(userId, conversation);

				console.log('Received response from API:', completion.choices[0].message.content);
	
				if (assistantReply.length > 2000) {
					await this.sendMessageInChunks(message, assistantReply);
					await sent.delete();
				} else {
					await sent.edit(assistantReply);
				}	
			} catch (error) {
				console.error('Error fetching data:', error);
				await interaction.followUp({ content: 'There was an error processing your request. I\'m probably out of credit.', ephemeral: true });
			} finally {
				activeUsers.delete(userId);
			}
		});
	
		collector.on('end', (collected, reason) => {
			console.log('Collector ended. Reason:', reason);
			let endMessage;

			if (reason === 'time') {
				endMessage = "I've been idle for a while. Closing the conversation.";
			} else if (reason === 'idle') {
				endMessage = "You haven't responded in a while. Closing the conversation.";
			}

			if (endMessage) interaction.followUp({ content: endMessage, ephemeral: true });

			activeUsers.delete(userId);
            userConversations.delete(userId);
		});
	},

	async sendMessageInChunks(message, content) {
		const chunkSize = 2000;
		for (let i = 0; i < content.length; i += chunkSize) {
			const chunk = content.slice(i, i + chunkSize);
			await message.reply(chunk);
		}
	}
};