import { Client } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config();

const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES']
})

client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`)

    const guildId = "912220966581596160";
    const guild = client.guilds.cache.get(guildId);

    let commands;

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands.create({
        name: 'mel',
        description: 'Mel command',
    })
})

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction;
    if (commandName === 'mel') {
        interaction.reply({
            content: "Should this be mail instead of mel?"
        })
    }
})

client.login(process.env.BOT_TOKEN)