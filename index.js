const fsLibrary = require('fs');
const {Client, Intents, Message} = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "ROLES"] });

client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', async Message => {

	if (Message.author.bot) return;

	if (Message.content.startsWith("!connect")) {
		console.log("We have a live one!");
		msg.reply("Looking up your details...")
		const args = msg.content.slice(prefix.length).trim().split(/ +/g);
		const orderNumber = args.shift().toUpperCase();

		fsLibrary.readFile('orderList.txt', 'utf8', function(error, txtString) {

			if (error) throw error;
			console.log(txtString);
		
			if (txtString.includes(orderNumber)){
			
				console.log("Order number already used.");
				msg.reply("This order number has already been used.")
				//Code to send message to user letting them know the registration code has already been used
		
			} else {
		
				fsLibrary.appendFile('orderList.txt', orderNumber+"\n", 'utf8',
					function(err) { 
						if (error) throw err;
					
						console.log(orderNumber+" has been recorded.\n");
						console.log("The current list of orders recorded are as follows:");
						console.log(fsLibrary.readFileSync('orderList.txt', "utf8"));
		
						(function(callback) {
							'use strict';
					
							const httpTransport = require('https');
							const responseEncoding = 'utf8';
							const httpOptions = {
								hostname: 'api.webconnex.com',
								port: '443',
								path: '/v2/public/search/registrants?product=regfox.com&orderNumber='+orderNumber+'&pretty=true',
								method: 'GET',
								headers: {"apiKey":"b3ded12f3f654113a2b0fb3438cd42f2"}
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
		
									if (body.includes("SuperSponsor")){ //Confirm they are a SuperSponsor
										
										console.log("Theyre a SuperSponsor!");
										let member = Message.member;
										let SuperSponsorRole = Message.guild.roles.cache.find(role => role.name === "2022 SuperSponsor");
										member.roles.add(SuperSponsorRole).catch(console.error);
		
									} else{ //confirm they are a Sponsor
		
										console.log("They're a Sponsor!");
										let SponsorRole = Message.guild.roles.cache.find(role => role.name === "2022 Sponsor");                           
										let member = Message.member;
										member.roles.add(SponsorRole).catch(console.error);
		
									};
							} else {
		
									console.log("They're attending!");
									let AttendingRole = Message.guild.roles.cache.find(role => role.name === "2022 Attending");
									let member = Message.member;
									member.roles.add(AttendingRole).catch(console.error);
		
								};
						} else {
		
							console.log("Not a valid orderNumber");
							// Code to return an error  
		
						};
						
						
						});
					});
			};
		});
		
	};
});
client.login(token);