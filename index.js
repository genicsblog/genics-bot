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
        name: 'send',
        description: 'Send command',
        options: [{
            type: 'STRING',
            name: 'id',
            description: 'id of the person to send to',
            required: true
        }],
    })
})

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction;
    if (commandName === 'send') {
        interaction.reply({
            content: "Sending..."
        })
    }
})

client.login(process.env.BOT_TOKEN)