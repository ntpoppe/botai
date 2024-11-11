require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Initialize commands
client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Listener for created interactions
client.on(Events.InteractionCreate, async interaction => {
	// Comamands
	if (interaction.isChatInputCommand()) {
		// Get command
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
	
		// Cooldown logic
		const { cooldowns } = interaction.client;
	
		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}
		
		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
		
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1_000);
				return interaction.reply({ content: `You are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
			}
		}
	
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		
		// Execute command
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
			}
		}
	
	// Modals
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId === 'raidModal') {
			const createRaidCommand = interaction.client.commands.get('create-raid');
			if (createRaidCommand && typeof createRaidCommand.handleModalSubmit === 'function') {
                try {
                    await createRaidCommand.handleModalSubmit(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error processing the modal.', ephemeral: true });
                }
            } else {
                console.error("Modal handler for 'create-raid' is missing or not a function.");
            }
		}

	// String selections
	} else if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('classSelect-')) {
			const createRaidCommand = interaction.client.commands.get('create-raid');
			if (createRaidCommand && typeof createRaidCommand.handleModalSubmit === 'function') {
				try {
					await createRaidCommand.handleClassSelect(interaction);
				} catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error processing the string selector..', ephemeral: true });
				}
			} else {
				console.error("String selector handler for 'create-raid' is missing or not a function.")
			}

        }

	// Buttons
	} else if (interaction.isButton()) {
		const customId = interaction.customId;

        // Check if it's a spec selection button (format: class-spec-userId-messageId)
        const customIdParts = customId.split('-');
        if (customIdParts.length === 4) {
            const [selectedClass, selectedSpec, userId, messageId] = customIdParts;
            const createRaidCommand = interaction.client.commands.get('create-raid');

            if (
                createRaidCommand &&
                createRaidCommand.classes[selectedClass]?.specs[selectedSpec] &&
                typeof createRaidCommand.handleSpecButton === 'function'
            ) {
                try {
                    await createRaidCommand.handleSpecButton(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error processing the spec selection.', ephemeral: true });
                }
                return;
            } else {
                console.error("Button handler for spec selection is missing, not a function, or customId format is incorrect.");
            }
        }

        // Check if it's a status button
        const statusButtons = ['bench', 'late', 'tentative', 'absence', 'reset'];
        if (statusButtons.includes(customId)) {
            const createRaidCommand = interaction.client.commands.get('create-raid');
            if (createRaidCommand && typeof createRaidCommand.handleStatusButton === 'function') {
                try {
                    await createRaidCommand.handleStatusButton(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error processing your status selection.', ephemeral: true });
                }
            } else {
                console.error("Button handler for status selection is missing or not a function.");
            }
            return;
        }
    }
});

const statuses = [
    {
        activities: [{ name: 'you...', type: ActivityType.Watching }],
        status: 'online'
    },
    {
        activities: [{ name: 'Hiki bitch', type: ActivityType.Listening }],
        status: 'online'
    },
    {
        activities: [{ name: 'Skullmasterj swim across lava', type: ActivityType.Watching }],
        status: 'online'
    },
    {
        activities: [{ name: 'LFG argue', type: ActivityType.Watching }],
        status: 'online'
    }
];

function setRandomStatus() {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setPresence(randomStatus);
}

// Bring the bot online
client.once(Events.ClientReady, readyClient => {
	console.log(`Success. Logged in as ${readyClient.user.tag}`);

    setRandomStatus();

    setInterval(setRandomStatus, 900000); 
});

client.login(process.env.DISCORD_BOT_TOKEN);