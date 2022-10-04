const { SlashCommandBuilder } = require('@discordjs/builders')
const pendingReview = require('../util/pending-review')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Replies with the server info')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('info about server'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('icon')
				.setDescription('icon of server'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('get-review-articles')
				.setDescription(
					'Gets a list of articles that need review from @Reviewer'
				)
		),

	async execute(interaction, client) {
		if (interaction.options.getSubcommand() === 'info') {
			await interaction.reply(
				`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
			)
		}
		else if (interaction.options.getSubcommand() === 'icon') {
			await interaction.reply(
				interaction.guild.iconURL({ size: 1024, dynamic: true })
			)
		}
		else if (interaction.options.getSubcommand() === 'get-review-articles') {
			pendingReview(client, true)
		}
	}
}