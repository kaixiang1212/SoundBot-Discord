'use strict'

require('dotenv').config();
const Discord = require('discord.js');
const db = require('./db');
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;

// ===================== Disclaimer =======================
console.log(`SoundBot Copyright (C) 2020  Kai Xiang Yong
This program comes with ABSOLUTELY NO WARRANTY
This is free software, and you are welcome to redistribute it
under certain conditions
`);

function getURLByClip(clip) {
  return `${UPLOAD_FOLDER}/${clip.id}.mp3`;
}

const client = new Discord.Client();
const SERVERS = require('./model/sessions');


client.on('ready', () => {
  console.log(`${client.user.tag} has logged in`);
});

client.on('message', async message => {
  if (message.author.bot === true) return;    // Ignore message sent by bots

  let clip;
  let arg;
  let match;
  let guild;
  let server;

  // Get Guild config from Database
  guild = await db.getGuild(message.guild.id);
  if (!guild) guild = db.createGuild(message.guild.id);

  // Create server session if one does not exist
  if (!SERVERS[message.guild.id]) SERVERS[message.guild.id] = {uploading: ''};
  server = SERVERS[message.guild.id];


  // ============================== Prefix CMD =================================
  if (message.content.startsWith(guild.prefix)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(guild.prefix.length)
      .split(/\s+/);

    switch (CMD_NAME) {
      case 'list':
      case 'ls':
        require('./cmd/list').execute(message);
        break;
      case 'play':
        require('./cmd/play').execute(message);
        break;
      case 'stop':
        require('./cmd/stop').execute(message);
        break;
      case 'skip':
        require('./cmd/skip').execute(message);
        break;
      case 'upload':
        require('./cmd/upload').execute(message);
        break;
      case 'cancel':
        require('./cmd/cancel').execute(message);
        break;
      case 'channel':
        require('./cmd/channel').execute(message);
        break;
      case 'clear':
        require('./cmd/clear').execute(message);
        break;
      case 'prefix':
        require('./cmd/prefix').execute(message)
        break;
      case 'help':
        require('./cmd/help').execute(message);
        break;
      default:
        arg = message.content
          .trim()
          .substring(guild.prefix.length);

        try {
          if ((clip = await db.getClipByName(arg)) || (clip = await db.getClipByID(arg))) {
            require('./utils/playAudio').play(message, getURLByClip(clip));
            clip.playback++;
            clip.save();
            break;
          }
        } catch {
        }
        message.reply(`Unknown command ${CMD_NAME}`).then(msg => {
          msg.delete({timeout: 15000});
        }).catch(console.error);
        break;
    }
  } else {
    // =========================== Alias playback ================================
    if ((clip = await db.getClipByName(message.content)) != null) {
      require('./utils/playAudio').play(message, getURLByClip(clip));
      clip.playback++;
      clip.save();
    }

    const pattern = /\[(.*?)]/g;
    // =========================== Bracket Playback ==============================
    while ((match = pattern.exec(message.content)) != null) {
      const keyword = match[1];
      try {
        if ((clip = await db.getClipByName(keyword)) || (clip = await db.getClipByID(keyword))) {
          clip.playback++;
          clip.save();
          play(message, getURLByClip(clip));
        }
      } catch (err) {
        message.reply(`keyword '${keyword}' not found`).then();
      }
    }
  }
    // ================================ Uploads ==================================
  if (server.uploading) {
    await require('./cmd/upload').handleUpload(message, guild, server)
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN).then();