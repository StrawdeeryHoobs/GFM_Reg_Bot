const fsLibrary = require('fs'); // Required to read to and from the orderList.txt document. If you are getting an error about an illegal HTTP header value, see https://www.explorelinux.com/vim-removing-new-line-end-file-vim/
const {Client, Intents} = require('discord.js'); // Required to interact with Discord
const { token, apiKey } = require('./config.json'); // reads secrets from .json file. See example_config.json for how the config.json file should be laid out 
const prefix = ("!connect ") //prefix for command

const myIntents = new Intents(); //Builds out Discord intents list
myIntents.add (Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS)

const client = new Client({ intents: myIntents }); //Builds out Discord client

client.once('ready', () => { // This will print "Ready!" to the terminal when the bot is up and functioning
	console.log('Ready!');
});

client.on('messageCreate', message => { // Waits for a new message to be sent 
	
	if (message.author.bot) return; // Ignores all messages sent by the bot

	if (message.content.startsWith("!ping")) {
		console.log("Alive check!");
		message.reply("Pong!");
	};

	if (message.content.startsWith("!connect")) { // If the new message starts with "!connect", enter the following script
		console.log("We have a live one!"); // Indicates the start of the script in the terminal
		message.reply("Looking up your details...") // Responds to the user that we are gathering their order details
		const args = message.content.slice(prefix.length).trim().split(/ +/g); // Trims down the user's input to only the order number
		const orderNumber = args.shift().toUpperCase(); // Shifts the user's input to uppercase to match WebConnex
		fsLibrary.readFile('orderList.txt', 'utf8', function(error, txtString) { // Accesses and reads the orderList.txt file
			if (error) throw error;	
			console.log(orderNumber)	
			if (txtString.includes(orderNumber)){ // Checks to see if the order number has already been used		
				console.log("Order number already used."); // Indicates that the user's order number has already been registered with the bot
				message.reply("This order number has already been used. If you think this is an error, please reach out to the GFM Team"); // Responds to the user that the order number has already been used with the bot		
			} else {		
				(function(callback) { // All of this to the next comment is the HTTPS request to pull data from WebConnex
					'use strict';				
					const httpTransport = require('https');
					const responseEncoding = 'utf8';
					const httpOptions = {
						hostname: 'api.webconnex.com',
						port: '443',
						path: '/v2/public/search/registrants?product=regfox.com&orderNumber='+orderNumber+'&pretty=true',
						method: 'GET',
						headers: {"apiKey":apiKey}
					};
					httpOptions.headers['User-Agent'] = 'node ' + process.version;
					
					const request = httpTransport.request(httpOptions, (res) => {
					let responseBufs = [];
					let responseStr = '';
					
					res.on('data', (chunk) => {
						if (Buffer.isBuffer(chunk)) {
							responseBufs.push(chunk);
						}
						else {
							responseStr = responseStr + chunk;            
						}
					}).on('end', () => {
						responseStr = responseBufs.length > 0 ?
							Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;					
						callback(null, res.statusCode, res.headers, responseStr);
					});
					
					})
					.setTimeout(0)
					.on('error', (error) => {
						callback(error);
						});
					request.write("")
					request.end();					
				})((error, statusCode, headers, body) => { //Response from WebConnex		
				if (body.includes("GFM2022")) { //check for valid registration		
					if (body.includes("Sponsor")) { //check for sponsor level                                  
						console.log("They're a sponsor of some kind...");		
							if (body.includes("SuperSponsor")){ // Confirm they are a SuperSponsor										
								console.log("Theyre a SuperSponsor!"); // Confirm user is SuperSponsor to Console
								let member = message.member; // Get user ID
								let SuperSponsorRole = message.guild.roles.cache.find(role => role.name === "2022 SuperSponsor"); // Get SuperSponsor Role ID
								member.roles.add(SuperSponsorRole).catch(console.error); // Assign SuperSponsor role to user
								message.reply("Thank you for registering as a SuperSponsor!"); // Let user know they have the SuperSponsor role
								fsLibrary.appendFile('orderList.txt', orderNumber+"\n", 'utf8', // Append order number to orderList.txt so it cannot be used again
									function(err) { 
									if (error) throw err;					
										console.log(orderNumber+" has been recorded.\n"); // Write to terminal that the order has been written
									});		
									} else{ //confirm they are a Sponsor		
										console.log("They're a Sponsor!"); // Confirm user is Sponsor to Console
										let SponsorRole = message.guild.roles.cache.find.find(role => role.name === "2022 Sponsor");   // Get Sponsor Role ID                        
										let member = message.member; // Get user ID
										member.roles.add(SponsorRole).catch(console.error); // Assign Sponsor role to user
										message.reply("Thank you for registering as a Sponsor!"); // Let user know they have the Sponsor role
										fsLibrary.appendFile('orderList.txt', orderNumber+"\n", 'utf8', // Append order number to orderList.txt so it cannot be used again
											function(err) { 
											if (error) throw err;					
												console.log(orderNumber+" has been recorded.\n"); // Write to terminal that the order has been written
											});
									};
						} else {		
							console.log("They're attending!"); // Confirm user is Attending to Console
							let AttendingRole = message.guild.roles.cache.find.find(role => role.name === "2022 Attending"); // Get Attending Role ID 
							let member = message.member; // Get user ID
							member.roles.add(AttendingRole).catch(console.error); // Assign Attending role to user
							message.reply("Thank you for registering for GFM!"); // Let user know they have the Attending role
							fsLibrary.appendFile('orderList.txt', orderNumber+"\n", 'utf8', // Append order number to orderList.txt so it cannot be used again
								function(err) { 
									if (error) throw err;					
									console.log(orderNumber+" has been recorded.\n"); // Write to terminal that the order has been written
								});		
							};
					} else {		
						console.log("Not a valid orderNumber"); // Write to terminal that the order number supplied is not valid
						message.reply("Something is not quite right. Please check your confirmation number and try again."); // Replies to the user letting them know that the order number supplied is not valid	
					};
				});
				
			};
		});		
	};
});

client.login(token); 