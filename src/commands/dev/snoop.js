const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas')
const BlizzardAPI = require('@api/blizzard-api')
const ProcessEndpoints = require('@api/process-endpoints')
const config = require('@src/config.json')
const generateEndpoint = require('@utils/generate-endpoint')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snoop')
		.setDescription('Snoops a WoW cata toon, but it\'s dumb, and assumes US based.')
		.addStringOption(option => 
			option.setName('name')
				.setDescription('Name of the character')
				.setRequired(true)
		)
		.addStringOption(option => 
			option.setName('realm')
				.setDescription('Realm of the character.')
				.setRequired(true)
		),
	async execute(interaction) {
		try {
			const endpointName = 'playerProfile';
			const characterName = interaction.options.getString('name')?.toLowerCase();
			const realm = interaction.options.getString('realm')?.toLowerCase();
			const namespace = 'profile-classic-us';


			if (!characterName || !realm) {
				return interaction.reply({ content: 'Name and realm are required!', ephemeral: true });
			}

			await interaction.deferReply();

			const pathData = { "realm": realm, "characterName": characterName , "namespace": namespace};
			const endpoint = generateEndpoint(endpointName, pathData, 'en_US','../../data');

			const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
			const processEndpoints = new ProcessEndpoints(blizzardAPI);

			const data = await processEndpoints.fetchEndpoint(endpoint);
			const profileData = data[endpointName];

			if (!profileData) {
                return interaction.editReply({ content: `No profile data found for **${characterName}** on **${realm}**.`, ephemeral: true });
            }

			const profileEmbed = await this.createEmbed(profileData);

			await interaction.editReply({ embeds: [profileEmbed] });
		} catch (error) {
			logger.error(`Error in snoop-toon command: ${error.message}`);
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: 'There was an error fetching the character profile. Please try again later.', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error fetching the character profile. Please try again later.', ephemeral: true });
			}
	}
	},
	async createEmbed(profileData) {
		const spacer = '\u00A0'.repeat(4);
		const avatar = await this.getAvatar(profileData);
		const summaryString = `${spacer}**Race:** ${profileData.race?.name || 'Unknown'} ${spacer}\\|\\|${spacer} **Level:**  ${profileData.level || 'Unknown'} ${spacer}\\|\\|${spacer} **Guild:** ${profileData.guild?.name}${spacer}`;
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Toon Profile: ${profileData.name}`)
			.setDescription(`wtf do i put here`)
			.setThumbnail(avatar || 'https://i.imgur.com/AfFp7pu.png')
			.addFields(
				// { name: '\u200B', value: '\u200B', inline: true },
				// { name: '\u200B', value: '\u200B', inline: true },
				// { name: '\u200B', value: '\u200B', inline: true },
				{ name: 'Summary', value: summaryString || 'Unknown', inline: false },
			)
			.setTimestamp()
			.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

		return embed
	},
	async getAvatar(profileData) {
		try{
			const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
			const processEndpoints = new ProcessEndpoints(blizzardAPI);
			const media = profileData.media;

			if (media && media.href) {
				console.log(`Fetching appearance data from: ${media.href}`);
				const mediaData = await processEndpoints.fetchUrl(media.href);
				const data = mediaData['data']

				if (data && Array.isArray(data.assets)) {
					const avatarAsset = data.assets.find(asset => asset.key === 'avatar')
					if (avatarAsset && avatarAsset.value) {
						console.log(`Avatar URL found: ${avatarAsset.value}`);
						return avatarAsset.value;
					} else {
						console.warn('Avatar asset not found in media data.');
						return null;
					}
				}

				console.warn('Media wasn\'t an array.')
				return null;
			}

			console.warn('Media doesn\'nt exist.')
			return null;
		} catch (error) {
			console.error(`Failed to fetch avatar: ${error.message}`);
			return null; // Return null on failure
		}
	},
};