const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require("axios")
const randomColor = require('randomcolor');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Sends a random motivational quote.'),

	async execute(interaction, client) {
		const { data } = await axios.get('https://zenquotes.io/api/random')
		const { q: quote, a: author } = data[0]
		const embed = {
			color: randomColor(),
			title: author,
			description: quote,
			footer: {
				text: 'From zenquotes.io'
			},
			timestamp: new Date()
		}

		await interaction.reply({ embeds: [embed] });
	},
}