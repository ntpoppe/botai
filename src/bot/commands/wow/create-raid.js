const { SlashCommandBuilder, 
		EmbedBuilder, 
		ModalBuilder, 
		TextInputBuilder, 
		TextInputStyle, 
		ActionRowBuilder,
		ButtonBuilder,
		ButtonStyle,
		StringSelectMenuBuilder,
		StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-raid')
		.setDescription('x'),

	// Initialize data structures
	roleCounts: {}, // { messageId: { Melee: number, Ranged: number, Tank: number, Healer: number } }
	playerSelections: {}, // { messageId: { userId: { class, spec, role, status, signupNumber } } }
	signupCounters: {}, // { messageId: number }
	leaders: {}, // { messageId: user }

	classes: {
		'Warrior': {
			specs: {
				'Arms': 'Melee',
				'Fury': 'Melee',
				'Protection': 'Tank'
			}
		},
		'Druid': {
			specs: {
				'Feral': 'Melee',
				'Restoration': 'Healer',
				'Balance': 'Ranged'
			}
		},
		'Paladin': {
			specs: {
				'Holy': 'Healer',
				'Protection': 'Tank',
				'Retribution': 'Melee'
			}
		},
		'Rogue': {
			specs: {
				'Assassination': 'Melee',
				'Combat': 'Melee',
				'Subtlety': 'Melee'
			}
		},
		'Hunter': {
			specs: {
				'Beast Mastery': 'Ranged',
				'Marksmanship': 'Ranged',
				'Survival': 'Ranged'
			}
		},
		'Mage': {
			specs: {
				'Fire': 'Ranged',
				'Frost': 'Ranged',
				'Arcane': 'Ranged'
			}
		},
		'Warlock': {
			specs: {
				'Affliction': 'Ranged',
				'Demonology': 'Ranged',
				'Destruction': 'Ranged'
			}
		},
		'Priest': {
			specs: {
				'Discipline': 'Healer',
				'Holy': 'Healer',
				'Shadow': 'Ranged'
			}
		},
		'Shaman': {
			specs: {
				'Elemental': 'Ranged',
				'Enhancement': 'Melee',
				'Restoration': 'Healer'
			}
		},
		'Death Knight': {
			specs: {
				'Blood': 'Tank',
				'Frost': 'Melee',
				'Unholy': 'Melee'
			}
		}
	},

	miscEmojis: {
		'Leader': '<:leader:1303948961819791380>',
		'Signups': '<:signups:1303950684328165386>',
		'Calendar': '<:calendar:1303953383626903582>',
		'Clock': '<:clock:1303957159368720455>',
		'Hourglass': '<:hourglass:1303957605630349363>',
		'Dps': '<:dps:1303962587851128845>',
		'Tanks': '<:tanks:1303961322324627497>',
		'Healers': '<:healers:1303963060003930182>',
		'Ranged': '<:ranged:1303963073324912640>',
	},

	classEmojis : {
		'Warrior': '<:classicon_warrior:1303917158446923796>',
		'Druid': '<:classicon_druid:1303917016448503839>',
		'Paladin': '<:classicon_paladin:1303917067203776564>',
		'Rogue': '<:classicon_rogue:1303917093585948744>',
		'Hunter': '<:classicon_hunter:1303917026624016424>',
		'Mage': '<:classicon_mage:1303917043636244573>',
		'Warlock': '<:classicon_warlock:1303917143607214121>',
		'Priest': '<:classicon_priest:1303917077798846485>',
		'Shaman': '<:classicon_shaman:1303917110552039454>',
		'Death Knight': '<:classicon_deathknight:1303916994445316096>',
	},

	specEmojis: {
		'Arms (Warrior)': '<:specicon_arms:1303922920703397938>',
		'Fury (Warrior)': '<:specicon_fury:1303922907671695360>',
		'Protection (Warrior)': '<:specicon_protection_warrior:1303922872393269363>',

		'Affliction (Warlock)': '<:specicon_affliction:1303922849546899496>',
		'Demonology (Warlock)': '<:specicon_demonology:1303922835319685160>',
		'Destruction (Warlock)': '<:specicon_destruction:1303922817619853343>',

		'Elemental (Shaman)': '<:specicon_elemental:1303922792827195432>',
		'Enhancement (Shaman)': '<:specicon_enhancement:1303922777824432179>',
		'Restoration (Shaman)': '<:specicon_restoration_shaman:1303922687034396682>',

		'Assassination (Rogue)': '<:specicon_assassination:1303922628767121418>',
		'Combat (Rogue)': '<:specicon_combat:1303922612212207698>',
		'Subtlety (Rogue)': '<:specicon_subtlety:1303922598232461382>',

		'Discipline (Priest)': '<:specicon_discipline:1303922507048288286>',
		'Holy (Priest)': '<:specicon_holy_priest:1303922478153990175>',
		'Shadow (Priest)': '<:specicon_shadow:1303922463775920188>',

		'Holy (Paladin)': '<:specicon_holy_paladin:1303922408914292736>',
		'Protection (Paladin)': '<:specicon_protection_paladin:1303922392451645540>',
		'Retribution (Paladin)': '<:specicon_retribution:1303922374516936714>',

		'Arcane (Mage)': '<:specicon_arcane:1303922302756327434>',
		'Fire (Mage)': '<:specicon_fire:1303922288336572457>',
		'Frost (Mage)': '<:specicon_frost_mage:1303922260666617898>',

		'Beast Mastery (Hunter)': '<:specicon_beastmastery:1303922007628316672>',
		'Marksmanship (Hunter)': '<:specicon_marksman:1303921982269558835>',
		'Survival (Hunter)': '<:specicon_survival:1303921964049764352>',

		'Balance (Druid)': '<:specicon_balance:1303921938758107136>',
		'Feral (Druid)': '<:specicon_feral:1303921927102136450>',
		'Guardian (Druid)': '<:specicon_guardian:1303921914095337482>',
		'Restoration (Druid)': '<:specicon_restoration_druid:1303921886677307514>',

		'Unholy (Death Knight)': '<:specicon_unholy:1303921827839606846>',
		'Frost (Death Knight)': '<:specicon_frost_dk:1303921748651151491>',
		'Blood (Death Knight)': '<:specicon_blood:1303921735376179271>',
	},

	buttonRow: [
		new ButtonBuilder()
			.setCustomId('bench')
			.setLabel('Bench')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('late')
			.setLabel('Late')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('tentative')
			.setLabel('Tentative')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('absence')
			.setLabel('Absence')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('reset')
			.setLabel('Reset')
			.setStyle(ButtonStyle.Secondary)
	],
	

	async execute(interaction) {
		const modal = new ModalBuilder()
		.setCustomId('raidModal')
		.setTitle('Create a raid');

		const titleInput = new TextInputBuilder()
			.setCustomId('raidTitle')
			.setLabel('Raid Title')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the title for the raid')
			.setRequired(true);

		const descriptionInput = new TextInputBuilder()
			.setCustomId('raidDescription')
			.setLabel('Description')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Enter the description for the raid')
			.setRequired(true);

		const dateInput = new TextInputBuilder()
			.setCustomId('raidDate')
			.setLabel("Date")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the date of the raid. (MM-DD-YYYY)')
			.setRequired(true)

		const timeInput = new TextInputBuilder()
			.setCustomId('raidTime')
			.setLabel('Time')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Enter the time of the raid. (XX:XX AM/PM)')
			.setRequired(true)

		modal.addComponents(
			new ActionRowBuilder().addComponents(titleInput),
			new ActionRowBuilder().addComponents(descriptionInput),
			new ActionRowBuilder().addComponents(dateInput),
			new ActionRowBuilder().addComponents(timeInput)
		);

		await interaction.showModal(modal);
	},

	async handleModalSubmit(interaction) {
		if (interaction.customId === 'raidModal') {
			const user = interaction.member?.displayName || interaction.user.username;
			const titleInput = interaction.fields.getTextInputValue('raidTitle');
			const descriptionInput = interaction.fields.getTextInputValue('raidDescription')
			const dateInput = interaction.fields.getTextInputValue('raidDate');
			const timeInput = interaction.fields.getTextInputValue('raidTime');

			const datePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(\d{4})$/;
			const timePattern12hr = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;
			const timePattern24hr = /^([01]?\d|2[0-3]):[0-5]\d$/; 
			
			if (!datePattern.test(dateInput)) {
				return interaction.reply({ content: "Invalid date format. Please use MM-DD-YYYY.", ephemeral: true });
			}
			
			if (!timePattern12hr.test(timeInput) && !timePattern24hr.test(timeInput)) {
				return interaction.reply({ content: "Invalid time format. Please use either HH:MM AM/PM or HH:MM in 24-hour format.", ephemeral: true });
			}

			const [month, day, year] = dateInput.split('-').map(Number);
			const parsedDate = new Date(year, month - 1, day); // months are 0-indexed

			let hours, minutes;

			if (timeInput.toUpperCase().includes('AM') || timeInput.toUpperCase().includes('PM')) {
				const [time, modifier] = timeInput.split(' '); 
				[hours, minutes] = time.split(':').map(Number);

				if (modifier.toUpperCase() === 'PM' && hours !== 12) {
					hours += 12;
				} else if (modifier.toUpperCase() === 'AM' && hours === 12) {
					hours = 0;
				}
			} else {
				[hours, minutes] = timeInput.split(':').map(Number);
			}

			parsedDate.setHours(hours, minutes, 0); // Set hours and minutes on the date

			const discordDate = `<t:${Math.floor(parsedDate.getTime() / 1000)}:D>`; 
			const discordTime = `<t:${Math.floor(parsedDate.getTime() / 1000)}:t>`;
			const discordRelativeTime = `<t:${Math.floor(parsedDate.getTime() / 1000)}:R>`;

			const spacer = '\u00A0'.repeat(2);
			const raidEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(titleInput)
				.setDescription(descriptionInput)
				.addFields(
					{ name: spacer, value: spacer },
					{ name: `${this.miscEmojis['Leader']} ${user}`, value: `${this.miscEmojis['Calendar']} ${discordDate}`, inline: true},
					{ name: `${this.miscEmojis['Signups']} **0**`, value: `${this.miscEmojis['Clock']} ${discordTime}`, inline: true},
					{ name: '\u200B', value: `${this.miscEmojis['Hourglass']} ${discordRelativeTime}`, inline: true },
					{ name: '\u200B', value: `${this.miscEmojis['Tanks']} **0** Melee **0** ${this.miscEmojis['Dps']}`, inline: true },
					{ name: '\u200B', value: `${this.miscEmojis['Ranged']} Ranged **0** ${this.miscEmojis['Ranged']}`, inline: true },
					{ name: '\u200B', value: `${this.miscEmojis['Healers']} Healers **0** ${this.miscEmojis['Healers']}`, inline: true },
					{ name: spacer, value: spacer, inline: false }
				)
				.setTimestamp()
				.setFooter({ text: 'Yell at Retei if this fucks up' });
			
			const message = await interaction.reply({
				embeds: [raidEmbed],
				components: [], // add the classSelect after getting the messageId
				ephemeral: false,
				fetchReply: true,
			});
	
			// Initialize data structures for this messageId
			const messageIdFetched = message.id;
			this.leaders[messageIdFetched] = user;
			this.playerSelections[messageIdFetched] = {};
			this.roleCounts[messageIdFetched] = { Melee: 0, Ranged: 0, Tank: 0, Healer: 0 };
			this.signupCounters[messageIdFetched] = { 'active': 0, 'inactive': 0}

			const classSelect = new ActionRowBuilder().addComponents(this.createClassStringSelect(messageIdFetched));
			const buttons = new ActionRowBuilder().addComponents(this.buttonRow);
			
            await message.edit({ components: [classSelect, buttons] });
		}
	},
	
	// Creates list of classes for StringSelectMenu
	createClassStringSelect(messageId) {
		const selectMenuOptions = Object.keys(this.classes).map(className => {
			const emoji = this.parseEmoji(this.classEmojis[className]);
			return new StringSelectMenuOptionBuilder()
				.setLabel(className)
				.setValue(className)
				.setEmoji(emoji);
		});

		const select = new StringSelectMenuBuilder()
			.setCustomId(`classSelect-${messageId}`)
			.setPlaceholder('Select your class')
			.addOptions(selectMenuOptions);
		
		return select;
	},

	// Creates a ephemeral message with class' respective specs
	async handleClassSelect(interaction) {
		const [_, messageId] = interaction.customId.split('-');
		const selectedClass = interaction.values[0];
		const specs = this.classes[selectedClass].specs;

        const specRow = new ActionRowBuilder().addComponents(
			Object.keys(specs).map(spec => {
				const emoji = this.parseEmoji(this.specEmojis[`${spec} (${selectedClass})`]);
				return new ButtonBuilder()
					.setCustomId(`${selectedClass}-${spec}-${interaction.user.id}-${messageId}`)
					.setLabel(spec)
					.setStyle(ButtonStyle.Secondary)
					.setEmoji(emoji);
			})
        );

		await interaction.reply({
            content: `You selected ${selectedClass}. Choose a spec:`,
            components: [specRow],
            ephemeral: true
        });
	},

	// Listens to spec buttons, adjusts role structures, and calls an embed update.
	async handleSpecButton(interaction) {
		const [selectedClass, selectedSpec, userId, messageId] = interaction.customId.split('-');
		const role = this.classes[selectedClass].specs[selectedSpec];

		if (!this.roleCounts[messageId]) {
			this.roleCounts[messageId] = { Melee: 0, Ranged: 0, Tank: 0, Healer: 0};
		}
		
		if (!this.playerSelections[messageId]) {
			this.playerSelections[messageId] = {};
		}

		const previousSelection = this.playerSelections[messageId][userId];
		if (previousSelection) {
			// If previously had a role and no status, decrement roleCounts
            if (previousSelection.role && !['bench', 'late', 'tentative', 'absence'].includes(previousSelection.status)) {
                this.roleCounts[messageId][previousSelection.role] = Math.max(0, this.roleCounts[messageId][previousSelection.role] - 1);
            }

			// If the previous selection had a status (inactive), adjust the counters
			if (['bench', 'late', 'tentative', 'absence'].includes(previousSelection.status)) {
				this.signupCounters[messageId].inactive = Math.max(0, this.signupCounters[messageId].inactive - 1);
				this.signupCounters[messageId].active++;
			}
		} else {
			if (typeof this.signupCounters[messageId] !== 'object' || this.signupCounters[messageId] === null) {
				this.signupCounters[messageId] = { 'active': 0, 'inactive': 0 };
			}
		}

		if (!previousSelection) {
			this.signupCounters[messageId].active++;
		}

		// Total signups
		const signupNumber = previousSelection?.signupNumber != null  
			? previousSelection.signupNumber  
			: this.signupCounters[messageId].active || 0 + this.signupCounters[messageId].inactive || 0;

		// Update player's selection
		this.playerSelections[messageId][userId] = { class: selectedClass, spec: selectedSpec, role: role, signupNumber: signupNumber };
	
		// Remove any existing status
		if (this.playerSelections[messageId][userId].status) {
			delete this.playerSelections[messageId][userId].status;
		}

		// Increment the count for the new role
		this.roleCounts[messageId][role] = (this.roleCounts[messageId][role] || 0) + 1;

		try {
           this.updateRaidEmbed(interaction, messageId)
		} catch (error) {
			console.error("Error fetching or editing the original message:", error);
			await interaction.update({ content: "An error occurred while updating the raid roster. Please try again later.", ephemeral: true });
		}
	},

	async handleStatusButton(interaction) {
        const userId = interaction.user.id;
        const messageId = interaction.message.id;
        const status = interaction.customId; // 'bench', 'late', 'tentative', 'absence', 'reset'

        if (!this.playerSelections[messageId]) {
            this.playerSelections[messageId] = {};
        }

        const previousSelection = this.playerSelections[messageId][userId];

		// Require spec if not absent
		if (!previousSelection?.class && status != 'absence' && status != 'reset') {
			interaction.reply({ content: `You must select a spec first. `, ephemeral: true })
			return;
		}

		// Do nothing if no status change
		if (previousSelection && previousSelection.status == status) {
			await interaction.deferUpdate();
			return;
		}

        if (['bench', 'late', 'tentative', 'absence'].includes(status)) {
            // Assign new status

			if (status != 'absence') {
				this.playerSelections[messageId][userId] = {
					...previousSelection,
					status: status,
					signupNumber: previousSelection?.signupNumber || (++this.signupCounters[messageId].inactive || 1)
				};
			} else {
				this.playerSelections[messageId][userId] = {
					status: status,
					signupNumber: null
				};
			}

            // If the user was previously active (no status), decrement roleCounts and active count
            if (previousSelection?.role && !previousSelection?.status) {
                this.roleCounts[messageId][previousSelection.role] = Math.max(0, this.roleCounts[messageId][previousSelection.role] - 1);
				--this.signupCounters[messageId].active || 1;

				// Don't count absence toward inactive count.
				if (status != 'absence') {
					++this.signupCounters[messageId].inactive || 1;
				}
            }
        } else if (status === 'reset') {
			previousSelection.status 
				? this.signupCounters[messageId].inactive = Math.max(0, --this.signupCounters[messageId].inactive)
				: this.signupCounters[messageId].active = Math.max(0, --this.signupCounters[messageId].active);
            
			delete this.playerSelections[messageId][userId];
        }

        // Update the embed
        await this.updateRaidEmbed(interaction, messageId);
    },

	// Updates the raid embed after a button interaction.
	async updateRaidEmbed(interaction, messageId) {
		if (!messageId) {
			console.error("Message ID is not provided to updateRaidEmbed.");
			return;
		}
	
		// Fetch the original message
		let originalMessage;
		try {
			originalMessage = await interaction.channel.messages.fetch(messageId);
		} catch (error) {
			console.error(`Cannot fetch message with ID ${messageId}:`, error);
			return;
		}

		// Check if the message has embeds
		if (!originalMessage.embeds || originalMessage.embeds.length === 0) {
			console.error(`No embeds found in message ${messageId}.`);
			return;
		}

		const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0]);

		// Reset for accurate calcuation
		this.roleCounts[messageId] = { Melee: 0, Ranged: 0, Tank: 0, Healer: 0 };

		const classSpecPlayers = {}; // { className: [playerId, ...] }
    	const statusPlayers = { bench: [], late: [], tentative: [], absence: [] };

		 // Categorize each player
		 for (const [userId, selection] of Object.entries(this.playerSelections[messageId])) {
            if (selection.status && selection.status !== 'reset') {
                // Player has a status; add to corresponding status group
                if (statusPlayers[selection.status]) {
                    statusPlayers[selection.status].push(userId);
                }
            } else if (selection.class && selection.spec) {
                // Player is active; add to their class/spec group
                if (!classSpecPlayers[selection.class]) {
                    classSpecPlayers[selection.class] = [];
                }
                classSpecPlayers[selection.class].push(userId);

                // Increment roleCounts based on the player's role
                const role = selection.role;
                if (role && this.roleCounts[messageId][role] !== undefined) {
                    this.roleCounts[messageId][role]++;
                }
            }
        }

		const useInactive = this.signupCounters[messageId].inactive === 0;

		// Update role counts in the fields without relying on indices
		updatedEmbed.data.fields = updatedEmbed.data.fields.map(field => {
			if (field.name.includes(`${this.miscEmojis['Leader']}`)) {
				field.name = `${this.miscEmojis['Leader']} **${this.leaders[messageId]}**`;
			} else if (field.name.includes(`${this.miscEmojis['Signups']}`)) {
				field.name = `${this.miscEmojis['Signups']}**${this.signupCounters[messageId].active}**` +
    			(this.signupCounters[messageId].inactive > 0 ? ` (+${this.signupCounters[messageId].inactive})` : '');
			} else if (field.value.includes('Melee')) {
				field.value = `${this.miscEmojis['Tanks']} ${this.roleCounts[messageId]['Tank']} Melee **${this.roleCounts[messageId]['Melee']}** ${this.miscEmojis['Dps']}`;
			} else if (field.value.includes('Ranged')) {
				field.value = `${this.miscEmojis['Ranged']} Ranged **${this.roleCounts[messageId]['Ranged']}** ${this.miscEmojis['Ranged']}`;
			} else if (field.value.includes(`Healers`)) {
				field.value = `${this.miscEmojis['Healers']} Healers **${this.roleCounts[messageId]['Healer']}** ${this.miscEmojis['Healers']}`;
			}
		
			return field;
		});

		// Remove existing fields
		updatedEmbed.data.fields = updatedEmbed.data.fields.filter(field => {
			if (!field.name) return true; // Keep the field if field.name is undefined
			return !field.name.startsWith('\u200D');
		});

		for (const [className, playerIds] of Object.entries(classSpecPlayers)) {
			// Sort players by signupNumber
			const sortedPlayers = playerIds
				.map(id => ({
					id,
					selection: this.playerSelections[messageId][id]
				}))
				.sort((a, b) => a.selection.signupNumber - b.selection.signupNumber);
		
			// Create player list string
			const playerList = sortedPlayers
				.map(({ id, selection }) => {
					const member = interaction.guild.members.cache.get(id);
					const displayName = member ? member.displayName : id;
					const specEmoji = this.specEmojis[`${selection.spec} (${className})`] || '';
					return `${specEmoji} \`\`${selection.signupNumber}\`\` ${displayName}`;
				})
				.join('\n');
		
			const playerCount = playerIds.length;
		
			// Add the class field to the embed
			const classEmoji = this.classEmojis[className] || '';
			const fieldName = `\u200D${classEmoji} __${className}__ (${playerCount})`;
			updatedEmbed.addFields({ name: fieldName, value: playerList, inline: true });
		}

		const statusOrder = ['bench', 'late', 'tentative', 'absence']; // Define the order of status fields
		for (const status of statusOrder) {
			const playersInStatus = statusPlayers[status];
			if (playersInStatus.length === 0) continue; // Skip if no players in this status

			// Sort players by signupNumber
			const sortedStatusPlayers = playersInStatus
				.map(id => ({
					id,
					signupNumber: this.playerSelections[messageId][id].signupNumber
				}))
				.sort((a, b) => a.signupNumber - b.signupNumber);

			// Create player list string
			const playerList = sortedStatusPlayers.map(({ id, signupNumber }) => {
				const member = interaction.guild.members.cache.get(id);
				const displayName = member ? member.displayName : id;
				const signupDisplay = status === 'absence' ? '' : `\`\`${signupNumber}\`\` `;

				return `${signupDisplay} ${displayName}`;
			}).join('\n');

			const playerCount = playersInStatus.length;

			// Construct field name with status capitalized and count
			const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
			const fieldName = `**\u200D${statusCapitalized} (${playerCount}):**`;

			updatedEmbed.addFields({ name: fieldName, value: playerList, inline: true });
		}

		// Update the original message with the new embed
		await originalMessage.edit({ embeds: [updatedEmbed] });

		// Determine and set the appropriate acknowledgment message
		const userSelection = this.playerSelections[messageId][interaction.user.id];
		let showMessage = true;
		let statusMessage = '';

	  if (userSelection && userSelection.status && userSelection.status !== 'reset') {
			showMessage = false;
		} else if (userSelection && userSelection.class && userSelection.spec) {
			statusMessage = `You selected **${userSelection.spec}** for the raid.`;
		} else {
			showMessage = false;
		}

		await interaction.deferUpdate();

		if (showMessage) {
			await interaction.followUp({ content: statusMessage, ephemeral: true });
		}
	},

	extractClassName(fieldName) {
		// Remove the 'ClassField: ' prefix
		let nameWithoutPrefix = fieldName.replace(/^\u200D\s*/, '');
	
		// Remove emoji and leading spaces
		nameWithoutPrefix = nameWithoutPrefix.replace(/^[^\w]*\s*/, '');
	
		// Remove count at the end (e.g., " (3)")
		nameWithoutPrefix = nameWithoutPrefix.replace(/\(\d+\)$/, '').trim();
	
		// Remove markdown formatting (underscores, asterisks, tildes, backticks)
		const className = nameWithoutPrefix.replace(/[_*~`]/g, '').trim();
	
		return className;
	},

	// Parses emoji string to use in discord
	parseEmoji(emojiString) {
		const match = emojiString.match(/^<a?:(\w+):(\d+)>$/);
		if (match) {
			return { id: match[2], name: match[1] };
		} else {
			// If it's a Unicode emoji, just return the string
			return emojiString;
		}
	},

	buttonRow: [
		new ButtonBuilder()
			.setCustomId('bench')
			.setLabel('Bench')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('late')
			.setLabel('Late')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('tentative')
			.setLabel('Tentative')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('absence')
			.setLabel('Absence')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('reset')
			.setLabel('Reset')
			.setStyle(ButtonStyle.Secondary)
	],
};