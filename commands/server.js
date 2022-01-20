const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('info about server'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('icon')
        .setDescription('icon of server')),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'info') {
      await interaction.reply(
        `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
      );
    }
    else if (interaction.options.getSubcommand() === 'icon') {
      await interaction.reply(
        interaction.guild.iconURL({ size: 1024, dynamic: true })
      );
    }


  },
};