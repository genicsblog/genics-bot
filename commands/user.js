const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('info about user'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('avatar')
        .setDescription('avatar of user')),

  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === 'info') {
      await interaction.reply(
        `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
      )
    }
    else if (interaction.options.getSubcommand() === 'avatar') {
      await interaction.reply(
        interaction.user.displayAvatarURL({ size: 1024, dynamic: true })
      )
    }
  },

}