const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
    /**
     * This is just to help me see what code is there.
     * @param {Discord.Client} bot
     * @param {Discord.Message} message
     * @param {String[]} args
     */
    exec: (bot, message, args) => {
        if(message.channel.id !== config.matchmakingID) return message.channel.send(`I think you should read what I said in !hi`);
        const basicData = {
            id: message.author.id,
            tag: message.author.tag,
            username: message.author.username,
            discriminator: message.author.discriminator
        }
        message.delete();
        if(args[0].toLowerCase() == 'looking') {
            if(bot.statuses.looking[message.author.id])
                return message.channel.send(`Your status type is already "looking" (looking for battle)!`)
                .then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });

            bot.statuses.looking[message.author.id] = basicData;
            message.guild.members.get(message.author.id).addRole(config.statusRoles.looking);
            message.channel.send(`Successfully set your status to "Looking for Battle".`).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 10000);
            });

            bot.channels.get(config.matchmakingID).send(`${message.author} is looking to battle!`)
            .then(msg => {
                bot.statuses.looking[message.author.id].messageID = msg.id;
            });
            bot.doLookCheck();

            if(bot.statuses.lurking[message.author.id]) {
                delete bot.statuses.lurking[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.lurking);
            } else if(bot.statuses.dnd[message.author.id]) {
                delete bot.statuses.dnd[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.dnd);
            }
        } else if(args[0].toLowerCase() == 'lurking') {
            if(bot.statuses.lurking[message.author.id])
                return message.channel.send(`Your status type is already "lurking"!`).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });

            bot.statuses.lurking[message.author.id] = basicData;
            message.guild.members.get(message.author.id).addRole(config.statusRoles.lurking);
            message.channel.send(`Successfully set your status to "Lurking".`).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 10000);
            });

            if(bot.statuses.looking[message.author.id]) {
                delete bot.statuses.looking[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.looking);
            } else if(bot.statuses.dnd[message.author.id]) {
                delete bot.statuses.dnd[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.dnd);
            }
        } else if(args[0].toLowerCase() == 'dnd') {
            if(bot.statuses.dnd[message.author.id])
                return message.channel.send(`Your status type is already "dnd" (do not disturb)!`).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });

            bot.statuses.dnd[message.author.id] = basicData;
            message.guild.members.get(message.author.id).addRole(config.statusRoles.dnd);
            message.channel.send(`Successfully set your status to "Do not Disturb".`).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 10000);
            });

            if(bot.statuses.looking[message.author.id]) {
                delete bot.statuses.looking[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.looking);
            } else if(bot.statuses.lurking[message.author.id]) {
                delete bot.statuses.lurking[message.author.id];
                message.guild.members.get(message.author.id).removeRole(config.statusRoles.lurking);
            }
        } else {
            message.channel.send(`Invalid status type. Valid statuses: \n\`\`\`asciidoc\nName :: Type\nLooking for Battle :: looking\nLurking :: lurking\nDo not Disturb :: dnd\n\`\`\``);
        }
    },
    help: {
        name: "status",
        description: `Change your battle status (looking for battle, lurking, do not disturb)`,
        category: "Matchmaking",
        disabled: true
    }
}