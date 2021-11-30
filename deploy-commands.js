const fsLibrary = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
//const { clientId, guildId } = require('./config.json');

let guildId = '915295538373599304';
let clientId = '915077946648182804'
try{
    
    DiscordToken = fsLibrary.readFileSync('DiscordToken.txt', 'utf8');

}catch(error){

    console.log("No file exists for 'DiscordToken.txt'");
}

const commands = [];
const commandFiles = fsLibrary.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(DiscordToken);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);