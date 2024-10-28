const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const BlizzardAPI = require('@api/blizzard-api')
const ProcessEndpoints = require('@api/process-endpoints')
const config = require('@src/config.json')
const generateEndpoint = require('@utils/generate-endpoint')
const logger = require('@utils/logger')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snoop')
		.setDescription('Get a little information about a Cataclysm character. Gives link to armory and logs.')
		.addStringOption(option => 
			option.setName('name')
				.setDescription('Name of the character')
				.setRequired(true)
		)
		.addStringOption(option => 
			option.setName('realm')
				.setDescription('Realm of the character.')
				.setRequired(true)
		)
		.addStringOption(option => 
			option.setName('region')
				.setDescription('Region of the character')
				.setRequired(false)
				.addChoices(
					{ name: 'us', value: 'us' },
					{ name: 'eu', value: 'eu' },
					{ name: 'kr', value: 'kr' },
					{ name: 'tw', value: 'tw' },
				)
		),

	async execute(interaction) {
		const characterName = interaction.options.getString('name')?.toLowerCase();
		const realm = interaction.options.getString('realm')?.toLowerCase();
		const region = interaction.options.getString('region')?.toLowerCase() || 'us';

		try {
			const endpointName = 'playerProfile';
			const namespace = `profile-classic-${region}`;

			if (!characterName || !realm) {
				return interaction.reply({ content: 'Name and realm are required!', ephemeral: true });
			}

			await interaction.deferReply();

			const pathData = { 'realm': realm, 'characterName': characterName , 'namespace': namespace};
			const endpoint = generateEndpoint(endpointName, pathData, 'en_US','../../data');

			const blizzardAPI = new BlizzardAPI(config.wowClientId, config.wowClientSecret, region);
			const processEndpoints = new ProcessEndpoints(blizzardAPI);

			const data = await processEndpoints.fetchEndpoint(endpoint);
			const profileData = data[endpointName];

			const apiPayload = {
				blizzardAPI,
				processEndpoints,
				profileData,
				region,
			};

			if (!profileData) {
                return interaction.editReply({ content: `No profile data found for **${characterName}** on **${realm}**.`, ephemeral: true });
            }

			const profileEmbed = await this.createEmbed(apiPayload);
			const buttons = await this.createButtons(apiPayload);

			await interaction.editReply({
				embeds: [profileEmbed],
				components: [buttons],
			});
		} catch (error) {
			logger.error(`Error in snoop-toon command: ${error.message}`);
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({ content: `There was an error fetching the profile for **${characterName}** on **${realm}**. You probably typed in the name/realm/region wrong.`, ephemeral: true });
			} else {
				await interaction.reply({ content: `There was an error fetching the profile for **${characterName}** on **${realm}**. You probably typed in the name/realm/region wrong.`, ephemeral: true });
			}
		}
	},

	async createEmbed(payload) {
		const profileData = payload.profileData;
		const spacer = '\u00A0'.repeat(2);

		const summaryString = `Level ${profileData.level || 'Unknown'} ${profileData.gender?.name || 'Unknown'} ${profileData.race?.name || 'Unknown'}`;
		const specs = await this.getSpecs(payload);

		const embed = new EmbedBuilder()
			.setColor(0xB0B0B0)
			.setTitle(`Toon Profile: ${profileData.name}`)
			.setDescription(this.getTitleString(payload))
			.setThumbnail(await this.getAvatar(payload) || 'https://i.imgur.com/AfFp7pu.png')
			.addFields(
				{ name: `${spacer}`, value: `${'-'.repeat(45)}`, inline: false },
				{ name: `${spacer}`, value: summaryString || 'Unknown', inline: false },
				{ name: 'Class:', value: `${profileData.character_class.name}`, inline: true} ,
				{ name: 'Specializations:', value: `${specs['main']}, ${specs['off'] || 'None'}`, inline: true },
				{ name: `${spacer}`, value: `**Item level:** ${this.getEquipmentLevel(payload)}` },
				{ name: `${spacer}`, value: `${spacer}`, inline: false },
				{ name: `${spacer}`, value: `_Last login: ${this.getlastLogin(payload)}_` }
			)
			.setTimestamp()

		return embed
	},

	async createButtons(payload) {
		const armoryUrl = `https://atlasforge.gg/wow-cataclysm/armory/${payload.region}/${payload.profileData.realm.slug}/${payload.profileData.name}`;
		const armory = new ButtonBuilder()
			.setLabel('Armory')
			.setURL(armoryUrl)
			.setStyle(ButtonStyle.Link);
		
		const logs = new ButtonBuilder()
			.setLabel('Logs')
			.setURL(`https://classic.warcraftlogs.com/character/${payload.region}/${payload.profileData.realm.slug}/${payload.profileData.name}`)
			.setStyle(ButtonStyle.Link);

		const row = new ActionRowBuilder()
			.addComponents(armory, logs);

		return row;
	},

	async getAvatar(payload) {
		try{
			const media = payload.profileData?.media;

			if (media && media.href) {
				console.log(`Fetching appearance data from: ${media.href}`);
				const mediaData = await payload.processEndpoints.fetchUrl(media.href);
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

	async getSpecs(payload) {
		try {
			const specializationsKey = payload.profileData?.specializations;

			if (specializationsKey && specializationsKey.href){
				console.log(`Fetching specialization data from: ${specializationsKey.href}`);
				const specializationData = await payload.processEndpoints.fetchUrl(specializationsKey.href, 'testspec', true);
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

	getEquipmentLevel(payload) {
		try {
			const equippedItemLevelKey = payload.profileData?.equipped_item_level;
			
			if (!equippedItemLevelKey) throw new Error(`lastLogin not found for ${payload.profileData.name}`);	
			
			return equippedItemLevelKey;
		} catch (error) {
			console.error(`Failed to fetch equipmentLevel: ${error.message}`);
			return null;
		}
	},

	getlastLogin(payload) {
		try {
			const lastLoginKey = payload.profileData?.last_login_timestamp;
			if (!lastLoginKey) throw new Error(`lastLogin not found for ${payload.profileData.name}`);			

			const unixTimestamp = Math.floor(lastLoginKey / 1000);
			return `<t:${unixTimestamp}:F>`; // Example: "October 25, 2024 3:45 PM"
		} catch (error) {
			console.error(`Failed to fetch lastLogin: ${error.message}`);
			return null;
		}
	},

	getTitleString(payload) {
		const profileData = payload.profileData;
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