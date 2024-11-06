require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const developmentCommands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
            if (folder == "dev"){
                // Deploy command to development guild
                developmentCommands.push(command.data.toJSON());
            } else {
                // Deploy globally
			    commands.push(command.data.toJSON());
            }
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

// Deploy
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
        console.log(`Started refreshing ${developmentCommands.length} development application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{ body: commands },
		);

        const developmentData = await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DEVELOPMENT_GUILD_ID),
			{ body: developmentCommands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        console.log(`Successfully reloaded ${developmentData.length} development application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();