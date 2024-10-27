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
		const spacer = '\u00A0'.repeat(2);

		const summaryString = `Level ${profileData.level || 'Unknown'} ${profileData.gender?.name || 'Unknown'} ${profileData.race?.name || 'Unknown'}`;
		const specs = await this.getSpecs(profileData);

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Toon Profile: ${profileData.name}`)
			.setDescription(this.getTitleString(profileData))
			.setThumbnail(await this.getAvatar(profileData) || 'https://i.imgur.com/AfFp7pu.png')
			.addFields(
				{ name: `${spacer}`, value: `${'-'.repeat(40)}`, inline: false },
				{ name: `${spacer}`, value: summaryString || 'Unknown', inline: false },
				//{ name: '\u200b', value: '\u200b' },
				{ name: 'Class:', value: `${profileData.character_class.name}`, inline: true},
				{ name: 'Specialization (active/off):', value: `${specs['main']}, ${specs['off'] || 'None'}`, inline: true},
			)
			.setTimestamp()
			//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

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
			return null;
		}
	},

	async getSpecs(profileData) {
		try {
			const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret);
			const processEndpoints = new ProcessEndpoints(blizzardAPI);
			const specializationsKey = profileData.specializations;

			if (specializationsKey && specializationsKey.href){
				console.log(`Fetching specialization data from: ${specializationsKey.href}`);
				const specializationData = await processEndpoints.fetchUrl(specializationsKey.href, 'testspec', true);
				const data = specializationData['data'];

				let specNames = {'main': null, 'off': null};

				if (data) {
					const groups = data.specialization_groups;
					if (groups && Array.isArray(groups)) {
						groups.forEach(group => {
							const specializations = group.specializations;
							if (specializations) {
								const sortedSpecializations = specializations.sort((a, b) => b.spent_points - a.spent_points);
								const topSpecName = sortedSpecializations[0]?.specialization_name?.en_US;
	
								if (group.is_active) {
									specNames['main'] = topSpecName;
								} else {
									specNames['off'] = topSpecName;
								}
							}
						})
					}
				}
				
				if (specNames['main'] == null){
					console.warn('Unable to find specs.');
					return null;
				}

				return specNames;
			}

			console.warn('specializationsKey returned null.')
			return null;
		} catch (error) {
			console.error(`Failed to fetch specs: ${error.message}`);
			return null;
		}
	},

	getTitleString(profileData) {
		let returnString = ''
		const characterName = profileData.name;
		const guildName = profileData.guild?.name || '';
		let titleString = profileData.active_title?.name;
		if (titleString) {
			titleString = titleString.replace('%s', characterName);
		} else {
			titleString = characterName;
		}

		let guildString = `<${guildName}>`
		returnString = `_${guildString}\n${titleString}_`;

		return returnString;
	}
};