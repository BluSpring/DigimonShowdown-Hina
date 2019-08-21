const Discord = require('discord.js');

module.exports = {
    exec: async (bot, message, args) => {
        message.author.send(`Welcome to the Digimon Showdown server, ${message.author}!
I'm your friendly guide Hina, I help with Matchmaking on this server.
        
We have plenty of options for Matchmaking, It's easy and I'll always be here to help you out!
        
First, when you're ready you need to head to the <#586573059905945631> channel on the server. Once in the channel you need to pick a status, "Looking for Battle", "Lurking" or "Do Not Disturb" using the reactions given.
        
"Looking for a Battle" tells everyone you're ready to fight! When someone wants to fight they will then click the battle icon below your name and I will notify you!
        
"Lurking" is like Looking for a Battle but only the Matchmaking channel instead of challenges being sent to you, so do check in from time to time.
        
"Do Not Disturb" means you're not looking for any matches right now and will not recieve any notifications from the Matchmaking channel.
        
After that you both have to agree on one of the <#575026413296680970> and battle on there.
        
Enjoy your stay on the Digimon Showdown Server, I look forward to many battles!`);
    },
    help: {
        name: 'hi',
        description: "Hi",
        category: "Hi"
    }
}