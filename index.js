require('dotenv').config()
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const cron = require('node-cron');
const pendingReview = require('./util/pending-review')

const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS] 
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`)
    
    cron.schedule('0 16 * * *', () => {
      pendingReview(client, false)
    }, {
      timezone: "America/Los_Angeles"
    });
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
    if (interaction.commandName == "server") await command.execute(interaction, client);
		else await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.BOT_TOKEN)