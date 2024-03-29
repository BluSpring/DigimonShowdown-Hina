const Discord = require('discord.js');
const config = require('../config.json');
const axios = require('axios');
const fs = require('fs');

function clean(text) { // For Eval
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports.exec = async (bot, message, args) => {
    try {
        const code = args.join(' ');
        let evaled = eval(code);
        if(typeof evaled !== 'string')
            evaled = require('util').inspect(evaled);

        const embed = new Discord.RichEmbed()
            .setColor('GREEN')
            .setTitle('Evaluation: Success')
            .setDescription(`\`\`\`xl\n${clean(evaled)}\n\`\`\``)
        message.channel.send(embed);
    } catch (err) {
        const embed = new Discord.RichEmbed()
            .setColor('RED')
            .setTitle('Evaluation: Error')
            .setDescription(`\`\`\`xl\n${clean(err)}\n\`\`\``)
        message.channel.send(embed);
    }
},
module.exports.help = {
    name: "eval",
    description: `Evaluate some JavaScript code!`,
    developerOnly: true,
    category: `Developer`
};