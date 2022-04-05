require('dotenv').config()
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const cron = require('node-cron');
const pendingReview = require('./util/pending-review')
const logAnalytics = require('./util/log-analytics')

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
	partials: ['MESSAGE']
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
	console.log(`${client.user.tag} is ready!`)
	client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send(`${client.user.tag} is ready!`)
	client.user.setActivity("discord.genicsblog.com")

	cron.schedule('0 16 * * *', () => {
		pendingReview(client, false)
	}, {
		timezone: "America/Los_Angeles"
	});

	cron.schedule('5 0 * * *', () => {
		logAnalytics(client)
	}, {
		timezone: "Asia/Colombo"
	});
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client)
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageDelete', async (message) => {
	if (
		message.author === undefined || 
		message.author === null || 
		message.author.bot === true
	) return;

	const embed = new MessageEmbed()
		.setTitle('Message Deleted')
		.setColor(randomColor())
		.setDescription(`Message by <@${message.author.id}> deleted in <#${message.channel.id}>`)
		.setTimestamp()

	if (message.partial) {
		message.fetch()
			.then(fullMessage => {
				let content = (fullMessage.content == '') ? "No content" : fullMessage.content
				content += "\n\n"
				fullMessage.attachments.forEach(attachment => {
					content += attachment.url + "\n"
				});
				embed.addField('Content', content)
				client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send({ embeds: [embed] })
			})
			.catch(error => {
				client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send(
					`Something went wrong when fetching the message: ${error}`
				)
			});
	} else {
		let content = (message.content == '') ? "No content" : message.content
		content += "\n\n"
		message.attachments.forEach(attachment => {
			content += attachment.url + "\n"
		});
		embed.addField('Content', content)
		client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send({ embeds: [embed] })
	}
});

client.on('guildMemberAdd', member => {
	setTimeout(() => {
		client.channels.cache.get(process.env.WELCOME_CHANNEL_ID).messages.fetch({ limit: 1 }).then(messages => {
			let message = messages.first()
			message.react('🎉')
			client.channels.cache.get(process.env.WELCOME_CHANNEL_ID).send(
				`Welcome to Genics Blog's Community <@${member.id}>! Please go through <#920200530700169276> to get full access to the server and do introduce yourself in <#912221055244963860> :)`
			)
		}).catch(console.error)
	}, 500)
})

client.login(process.env.BOT_TOKEN)
