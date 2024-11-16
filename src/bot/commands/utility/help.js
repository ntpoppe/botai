const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Provides information about the bot.'),
	async execute(interaction) {
		const message = `
Hello! This is a bot designed to provide tools to make (mostly my) life easier for looking up WoW-related things.

Here is a list of relevant commands, how to use them, and what they do:

---

**/snoop**  
Provides a brief summary of a player in any realm or region, along with two buttons to their Armory and Warcraft Logs profile.  
Defaults to **US-Mankrik**, but other realms and regions are supported.  
*Note: KR and TW realms may not work well due to character encoding issues.*

---

**/auctions**  
Enter the exact name of an item (*case-insensitive*) and get a list of the cheapest auctions for that item.  
Prices are **not live** and require manual updates due to the sheer number of listings (**134,415!**).  
Currently, this only has data for our Horde house.

---

**/create-raid**  
You've seen Raid-Helper. This is a simpler version of it, only focusing on Cataclysm.  
The only differences are: Wack/no emojis, and creating a raid roste is much easier.

---

**/chat-start**  
Starts a conversation with **Botai** (an LLM focused on Cataclysm information).
After using this command, Botai will only respond to your messages in the channel.  
The conversation ends after 1 minute of inactivity or by using the next command.  
*This costs me money. Once my balance is out, I'm probably not recharging it.*

---

**/chat-stop**  
Stops the conversation with Botai immediately, so you can talk in the channel without triggering responses.

---

There are other commands, but these are the most relevant. If you have ideas for this bot, let me know. I enjoy doing this.
`;


		await interaction.reply({ content: message, ephemeral: true});
	},
};