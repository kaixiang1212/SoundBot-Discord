'use strict'

require('dotenv').config();
const { readdirSync } = require('fs')
const Discord = require('discord.js')
const path = require('path')
const db = require('./db')
const sessions = require('./model/sessions')
const {handleUpload} = require("./utils/handleUpload");
const {play} = require("./utils/playAudio");

let commands = {};
const cmd_path = path.join(__dirname, 'cmd')
const client = new Discord.Client();

// Loads commands
readdirSync(cmd_path).forEach((file)=>{
  let cmd = require(path.join(cmd_path, file))
  commands[cmd.name] = cmd;
  if (cmd.alias) cmd.alias.forEach((alias) => commands[alias] = cmd);
});

// Handle Discord Events
client.on('ready', () => {
  console.log(`${client.user.tag} has logged in`);
});

client.on('message', async message => {
  if (message.author.bot === true) return;    // Ignore message sent by bots

  let guild = await db.getOrCreateGuild(message.guild.id);

  // Ignore other channel if dedicated channel is set
  if (guild.channel_id && message.channel.id !== guild.channel_id) return;

  if (message.content.startsWith(guild.prefix)) {
    message.content = message.content.substring(guild.prefix.length);
    const CMD_NAME = message.content.toLowerCase().trim().replace(/\s+.*/, '')
    const arg = message.content.toLowerCase().replace(`${CMD_NAME}`, '').trim()

    let command;
    if ((command = commands[CMD_NAME])) command.execute(message, arg);
    else {
      play(message, message.content, {urlPlayback: false}).then((result) => {
        if (result === false) message.reply("Unknown command: " + message.content);
      });
    }
  } else if (/[\[\]]/.exec(message.content)) {
    const pattern = /\[(.*?)]/g;
    let match;
    while ((match = pattern.exec(message.content))) {
      let keyword = match[1];
      play(message, keyword, {urlPlayback: false, idPlayback: false}).then();
    }
  } else {
    play(message, message.content, {urlPlayback: false, idPlayback: false}).then();
  }

  if (sessions.getOrCreateSession(message.guild.id).uploading && message.attachments[0]){
    handleUpload(message).then();
  }

});

client.login(process.env.DISCORDJS_BOT_TOKEN).then();