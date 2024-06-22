const { Client, GatewayIntentBits } = require('discord.js');
const { handleCeroCommand } = require('./cero.js');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    console.log(`Command received: ${message.content}`);
    handleCeroCommand(message);
});


client.login(config.token);
