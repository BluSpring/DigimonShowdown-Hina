const Discord = require('discord.js');
const { RichEmbed } = Discord;
const pidusage = require('pidusage');
const os = require('os');
const config = require('../config.json');

module.exports.exec = async (bot, message, args) => {
    var days = Math.floor(bot.uptime / 86400000);
	var hours = Math.floor((bot.uptime % 86400000) / 3600000);
	var minutes = Math.floor(((bot.uptime % 86400000) % 3600000) / 60000);
    var seconds = Math.floor((((bot.uptime % 86400000) % 360000) % 60000) / 1000);
    pidusage(process.pid, function (err, stats) {
        message.channel.send(new RichEmbed()
            .setColor("RANDOM")
            .setTitle(`Hina's Bot Info`)
            .setThumbnail(bot.user.avatarURL)
            .addField(`Uptime`, `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`, true)
            .addField('Version', `**•** NodeJS ${process.version}\n**•** Discord.JS v${Discord.version}\n**•** Hina v${require('../package.json').version}`)
            .addField('System Usage', `**•** ${stats.cpu.toFixed(2)}% CPU\n**•** ${formatBytes(stats.memory)}/${formatBytes(os.totalmem())} memory used`, true)
            .addField(`The Boss and the Developers`, config.devs.map(ar => bot.users.get(ar).tag).join(', '))
            .addField(`System Info`, `**•** Bot Latency: ${bot.ping.toFixed(2)}ms\n**•** Processor: ${os.cpus()[0].model}\n**•** Processor Amount: ${os.cpus().length}\n**•** Operating System: ${os.type() == "Windows_NT" ? `Windows ${os.release()}` : `${os.type()} ${os.release()}`}`, true)
        );
    });
},
module.exports.help = {
    name: "info",
    usage: "{prefix}info",
    developerOnly: false
};

function formatBytes(bytes) {
    if(bytes < 1024) return bytes + " Bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
    else return(bytes / 1073741824).toFixed(3) + " GB";
};