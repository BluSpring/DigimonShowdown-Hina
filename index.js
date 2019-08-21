
const Discord = require('discord.js');
const bot = new Discord.Client();
const client = bot; // Assign client variable to bot - So you can use both bot and client variables.
const config = require('./config.json');
const chalk = require('chalk');
const axios = require('axios');
const prefix = config.prefix;
bot.commands = new Map();
const fs = require('fs');
const express = require('express');
const app = express();
const WebSocket = require('ws');
bot.musiclinkWS = null;

app.listen(process.env.PORT || 9646);

app.get('/', (req, res) => {
    res.send('Hi!');
});

var stdin = process.openStdin();

function clean(text) { // For Eval
	if (typeof(text) === "string")
	  return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

stdin.addListener("data", function(code) {
	try {
		let evaled = eval(code.toString());
		if (typeof evaled !== "string")
			evaled = require("util").inspect(evaled);
		console.log(`Evaluated to: ${clean(evaled)}`);
	} catch (err) {
		console.error(`Error during evaluation: ${clean(err)}`);
  	}
});

bot.statuses = {
    looking: {},
    lurking: {},
    dnd: {},
    battling: {}
};

function isOdd(number) {
    return (number % 2) == 1;
}

bot.loadCommands = () => {
    fs.readdir('./commands', (err, files) => {
        if(err)
            return console.error(`${chalk.bgRed('CMDLOADERR')} >> ${getFullTime()} - ${err.stack}`);

        if(files.length == 0) return;

        files.forEach(cmd => {
            if(!cmd.endsWith('.js') && !cmd.includes('.')) {
                fs.readdir(`./commands/${cmd}`, (errr, moreFiles) => {
                    if(errr)
                        return console.error(`${chalk.bgRed('CMDLOADERR')} >> ${getFullTime()} - ${errr.stack}`);
                    if(moreFiles.length == 0) return;
                    moreFiles.forEach(cmdd => {
                        if(!cmdd.endsWith('.js')) return; // Yeah we're not going down that rabbit hole again.

                        try {
                            const command = require(`./commands/${cmd}/${cmdd}`);
                            if(command.help.disabled) return;
                            bot.commands.set(command.help.name, command);
                        } catch (error) {
                            console.error(`${chalk.bgRed('CMDLOADERR')} >> ${getFullTime()} - ${error.stack}`);
                        } 
                    });
                });
            } else if(cmd.endsWith('.js')) {
                try {
                    const command = require(`./commands/${cmd}`);
                    if(command.help.disabled) return;
                    bot.commands.set(command.help.name, command);
                } catch (error) {
                    console.error(`${chalk.bgRed('CMDLOADERR')} >> ${getFullTime()} - ${error.stack}`);
                } 
            }
        });
    });
}

bot.loadCommands();

function getFullTime() {
    return chalk.green(`${new Date().toLocaleTimeString('en-US')}`);
}

bot.on('message', async message => {
    if(message.author.bot) return; // Prevent other bots from using commands.
    if(message.channel.type !== 'text' && !config.devs.some(ar => message.author.id == ar)) return;
    if(message.content.startsWith(prefix)) {
        try {
            const command = message.content.split('').slice(prefix.length).join('').split(' ')[0];
            // ^ Yes it's horrible, but hey, I have no idea how RegExp works, so minify that if you want
            const args = message.content.split(' ').slice(1);

            if(bot.commands.get(command)) {
                if(bot.commands.get(command).help.developerOnly) {
                    if(!config.devs.some(ar => message.author.id == ar))
                        return message.channel.send(`You are not authorized to use this command!`);
                    bot.commands.get(command).exec(bot, message, args);
                } else {
                    bot.commands.get(command).exec(bot, message, args);
                }
            }

            // Feel free to change this.
            if(message.content.startsWith('!matchmaking')) {
                if(!config.devs.some(ar => message.author.id == ar)) return;
                message.delete();
                message.channel.send(`
Hi! I'm your friendly guide Hina, and I help with matchmaking on the server! Please type \`!hi\` first before doing your first match! All the info will be given in there!
<:LeomonRoar:${config.reactionIDs.looking}> - Looking for Battle
<:Kuramon:${config.reactionIDs.lurking}> - Lurking
<:DigiNomGatomon:${config.reactionIDs.dnd}> - Do Not Disturb
                `)
                .then(msg => {
                    msg.author.send(`Matchmaking message ID: ${msg.id}`);
                    msg.react(config.reactionIDs.looking)
                    .then(() => {
                        msg.react(config.reactionIDs.lurking)
                        .then(() => {
                            msg.react(config.reactionIDs.dnd);
                        });
                    });
                });
            }

            /*
                Reactions:
                Looking - https://cdn.discordapp.com/emojis/561993764327915561.png (name: LeomonRoar)
                Lurking - https://cdn.discordapp.com/emojis/530189541722816513.png (name: Kuramon)
                DND - https://cdn.discordapp.com/emojis/572217357158711296.png (name: DigiNomGatomon)
            */
            if(message.content.startsWith('!fixreactions')) {
                message.guild.channels.get(config.matchmakingID).fetchMessage(config.msgID)
                .then(msg => {
                msg.clearReactions()
                .then(() => {
                    msg.react(config.reactionIDs.looking)
                        .then(() => {
                            msg.react(config.reactionIDs.lurking)
                                .then(() => {
                                    msg.react(config.reactionIDs.dnd);
                                });
                            });
                        });
                });

            }
        } catch (err) { // Might as well catch the whole thing.
            message.channel.send(`Error in executing the command - \`\`\`xl\n${err.stack}\n\`\`\``);
            console.error(`${chalk.bgRed('CMDERR')} >> ${getFullTime()} - ${err.stack}`);
        }
    }
})
.on('ready', () => {
    console.log(`${chalk.bgGreen('BOTREADY')} >> ${getFullTime()} - Bot is now ready!`);
    bot.user.setActivity(`Digimon Showdown! - Say !hi to me!`);
    bot.channels.get(config.matchmakingID).fetchMessages();
    /*bot.musiclinkWS = new WebSocket('ws://localhost:3506', {
        headers: {
            userID: bot.user.id
        }
    });
    bot.musiclinkWS.on('open',() => {
        console.log(`[WS] WS on.`);
    });*/
    setInterval(() => {
        bot.user.setActivity(`Digimon Showdown! - Say !hi to me!`);
    }, 600000);
    try { // Regain the people with the status roles.
        bot.guilds.get(config.serverID).roles.get(config.statusRoles.looking).members.forEach(ar => {
            bot.statuses.looking[ar.id] = {
                id: ar.user.id,
                tag: ar.user.tag,
                username: ar.user.username,
                discriminator: ar.user.discriminator
            }
        });

        bot.guilds.get(config.serverID).roles.get(config.statusRoles.lurking).members.forEach(ar => {
            bot.statuses.lurking[ar.id] = {
                id: ar.user.id,
                tag: ar.user.tag,
                username: ar.user.username,
                discriminator: ar.user.discriminator
            }
        });

        bot.guilds.get(config.serverID).roles.get(config.statusRoles.dnd).members.forEach(ar => {
            bot.statuses.dnd[ar.id] = {
                id: ar.user.id,
                tag: ar.user.tag,
                username: ar.user.username,
                discriminator: ar.user.discriminator
            }
        });
    } catch (err) {
        console.error(`${chalk.bgRed('BOTREGAINSTATUSERR')} >> ${getFullTime()} - ${err.stack}`);
    }
})
.on('error', (err) => {
    console.error(`${chalk.bgRed('BOTERR')} >> ${getFullTime()} - ${err.stack}`);
})
.on('warn', (warn) => {
    console.error(`${chalk.bgRed('BOTWARN')} >> ${getFullTime()} - ${warn}`);
})
.on('messageReactionAdd', (r, u) => {
    if(u.bot) return;
    const message = r.message;
    const msg = message;
    const user = u;
    const basicData = {
        id: user.id,
        tag: user.tag,
        username: user.username,
        discriminator: user.discriminator
    }
    if(r.message.id == config.msgID) {
        r.remove(u.id);
        if(r.emoji.id == config.reactionIDs.looking) { // Looking for Battle
            if(bot.statuses.looking[user.id]) return;
            bot.channels.get(config.matchmakingID).send(`${user} is looking to battle!`)
            .then(msg => {
                msg.react('⚔');
                bot.statuses.looking[user.id] = basicData;
                bot.statuses.looking[user.id].messageID = msg.id;
            });
            message.guild.members.get(user.id).addRole(config.statusRoles.looking);
                

            if(bot.statuses.lurking[user.id]) {
                delete bot.statuses.lurking[user.id];
                msg.guild.members.get(user.id).removeRole(config.statusRoles.lurking);
            } else if(bot.statuses.dnd[user.id]) {
                delete bot.statuses.dnd[user.id];
                msg.guild.members.get(user.id).removeRole(config.statusRoles.dnd);
            }
        } else if(r.emoji.id == config.reactionIDs.lurking) { // Lurking
            if(bot.statuses.lurking[user.id]) return;
            bot.statuses.lurking[user.id] = basicData;
            message.guild.members.get(user.id).addRole(config.statusRoles.lurking);

            if(bot.statuses.looking[user.id]) {
                if(bot.statuses.looking[user.id].messageID)
                    bot.channels.get(config.matchmakingID).fetchMessage(bot.statuses.looking[user.id].messageID).then(msg => msg.delete());
                delete bot.statuses.looking[user.id];
                message.guild.members.get(user.id).removeRole(config.statusRoles.looking);
            } else if(bot.statuses.dnd[user.id]) {
                delete bot.statuses.dnd[user.id];
                message.guild.members.get(user.id).removeRole(config.statusRoles.dnd);
            }
        } else if(r.emoji.id == config.reactionIDs.dnd) { // Do Not Disturb
            if(bot.statuses.dnd[user.id]) return;
            bot.statuses.dnd[user.id] = basicData;
            message.guild.members.get(user.id).addRole(config.statusRoles.dnd);

            if(bot.statuses.looking[user.id]) {
                if(bot.statuses.looking[user.id].messageID)
                    bot.channels.get(config.matchmakingID).fetchMessage(bot.statuses.looking[user.id].messageID).then(msg => msg.delete());
                delete bot.statuses.looking[user.id];
                message.guild.members.get(user.id).removeRole(config.statusRoles.looking);
            } else if(bot.statuses.lurking[user.id]) {
                delete bot.statuses.lurking[user.id];
                message.guild.members.get(user.id).removeRole(config.statusRoles.lurking);
            }
        }
    } else if(r.message.channel.id == config.matchmakingID) {
        if(r.emoji.name == '⚔') {
            const id = r.message.content.match(/[0-9]/g).join('');
            if(u.id == id) return r.remove(u.id);
            r.message.delete();
            delete bot.statuses.looking[id];
            if(bot.statuses.looking[u.id])
                delete bot.statuses.looking[u.id];

            message.guild.members.get(id).removeRole(config.statusRoles.looking);
            message.guild.members.get(u.id).removeRole(config.statusRoles.looking).catch(err => {});
            message.guild.members.get(u.id).removeRole(config.statusRoles.lurking).catch(err => {});
            message.guild.members.get(u.id).removeRole(config.statusRoles.dnd).catch(err => {});

            bot.statuses.battling[id] = {
                id: bot.users.get(id).id,
                tag: bot.users.get(id).tag,
                username: bot.users.get(id).username,
                discriminator: bot.users.get(id).discriminator,
                isBattling: u.id
            }

            bot.statuses.battling[u.id] = {
                id: u.id,
                tag: u.tag,
                username: u.username,
                discriminator: u.discriminator,
                isBattling: id
            }
            let intle = [id, u.id];
            intle.forEach((i) => {
                bot.users.get(i).send(`<@${id}> and <@${u.id}> have now eben put into battle!\nPlayers, please join the Azure server ( https://azure.psim.us/digimon ) and pick a gamemode to start playing!`)
                .catch(err => {
                    bot.users.get("588312813056032769").send(`Error - ${err.stack}`);
                });
            });
            bot.channels.get(config.matchmakingID).send(`<@${id}> and ${u} have now been put into battle!\nPlayers, please join the Azure server ( https://azure.psim.us/digimon ) and pick a gamemode to start playing!`)
            .then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 10000);
            });
        }
    }
})
.login(config.token);