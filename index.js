const { request } = require('http');
const fsLibrary = require('fs');
const {Client, Collection, Intents, Message, Interaction } = require('discord.js');
const hosts = ['google.com', 'discordapp.com']

let DiscordToken;

try{
    
    DiscordToken = fsLibrary.readFileSync('DiscordToken.txt', 'utf8');

}catch(error){

    console.log("No file exists for 'DiscordToken.txt'");
}


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fsLibrary.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(DiscordToken);