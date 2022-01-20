const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with bot\'s reply latency.'),

	async execute(interaction) {
		await interaction.reply('Pong!');
    await interaction.editReply(
      `:ping_pong: Latency is ${Math.abs(Date.now() - interaction.createdTimestamp)}ms.`
    );
	},
};