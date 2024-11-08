require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const keepAlive = require("./server") 
const info = '>>> - Howdy, I am **Hiro** the AI chatbot. \n- I am powered by **OpenAI** and **Discord.js** \n- **OpenAI Model** : ||*gpt-3.5-turbo*|| \n- **Discord.js** : ||*14.12.1*|| \n- I was created by **@akai4322**  \n- I am currently in beta so please be patient with me. \n- If you have any questions or concerns please send your https://discord.com/channels/1142447181597528154/1142448377502642216 here. \n- Thank you for using me!';

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});


client.on('interactionCreate', (interaction) => {
  if ( interaction.isChatInputCommand() ) {
    if ( interaction.commandName === 'ping' ) {
      interaction.reply('Pong!');
    };

    if ( interaction.commandName === 'info' ) {
      interaction.reply(info);
    };
  }
});

client.on('ready', () => {
  console.log('The bot is online!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'clear') {
    await interaction.reply('Deleting messages....');
  }
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith('!')) return;

  const developerContext = [
    { role: 'system', content: 'You are a helpful AI chatbot named Hiro. Your developer is Akai, who built you using OpenAI and Discord.js. You can provide information about yourself, your development, your capabilities, and more.' },
    { role: 'system', content: 'Here are some details about you:\n- Developer Name: Akai\n- Main Language: JavaScript (Node.js)\n- Description: You are powered by the OpenAI API and are in beta testing.\n- Functionality: Engage in conversations, respond to commands, and interact in Discord servers.' },
  ];

  let conversationLog = [...developerContext];

  try {
    await message.channel.sendTyping();
    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      if (msg.content.startsWith('/')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id == client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }

      if (msg.author.id == message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });
    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
keepAlive()
