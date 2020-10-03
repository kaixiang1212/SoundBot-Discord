require('dotenv').config();
const fs = require('fs');
const https = require('https');
const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;
const PREFIX_BLACKLIST = [':', '/', '\\'];

// ===================== Disclaimer =======================
console.log(`SoundBot Copyright (C) 2020  Kai Xiang Yong
This program comes with ABSOLUTELY NO WARRANTY
This is free software, and you are welcome to redistribute it
under certain conditions
`)

// ===================== Database =========================
const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/soundfx', {useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('Connected to Database!');
});

const ClipsSchema = new mongoose.Schema({
  name: String,
  // index: {type: Number, unique: true},
  playback: {type: Number, default: 0},
  owner: String,
  public: {type: Boolean, default: true},
});
ClipsSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Clip = mongoose.model('Clip', ClipsSchema);

function getClipByName(name) {
  return Clip.findOne({'name': name});
}

function getClipByID(id) {
  return Clip.findOne({'id': id});
}

function createClip(index, name, owner, isPublic) {
  var newClip = new Clip({'index': index, 'name': name, 'owner': owner, 'public': isPublic});
  newClip.save();
  return newClip;
}

function getClipCount() {
  return Clip.countDocuments();
}

function getAllClips() {
  return Clip.find({});
}

const GuildSchema = new mongoose.Schema({
  guild_id: String,
  channel_id: {type: String, required: false},
  prefix: {type: String, required: true, default: '`'}
});

const Guild = mongoose.model('Guild', GuildSchema);

function getGuild(id) {
  return Guild.findOne({'guild_id': id});
}

function createGuild(guild_id) {
  var guild = new Guild({'guild_id': guild_id});
  guild.save();
  return guild;
}

// ============================== End of Database ==============================

function getURLByClip(clip) {
  return `${UPLOAD_FOLDER}/${clip.id}.mp3`;
}

function download_file(url, filename) {
  const dest = `${UPLOAD_FOLDER}/${filename}.mp3`;
  const file = fs.createWriteStream(dest);
  const request = https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', file.close);
  }).on('error', (err) => { // Handle errors
    file.unlink(dest); // Delete the file async. (But we don't check the result)
    console.error(err);
  });
}

function validURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}

const client = new Discord.Client();
const SERVERS = {};

function play(message, url) {
  // Check if user are in a voice channel
  if (!message.member.voice.channel) {
    message.reply('You must be in a channel to play the bot!');
    return;
  }

  const server = SERVERS[message.guild.id];
  // Creates a server queue if it does not exist
  if (server.queue === undefined) server.queue = [];
  if (server.playing === undefined) server.playing = false;

  // Pushes url into the queue
  server.queue.push(url);

  // Connect to voice channel and play songs if no songs are playing
  if (!message.member.voice.connection && !server.dispatcher && !server.playing) {
    server.playing = true;
    message.member.voice.channel.join()
      .then((connection) => {
        _play(connection, message);
      })
      .catch(console.error)
      .finally(() => {
        server.playing = false
      });
  }
}

async function _play(connection, message) {
  const server = SERVERS[message.guild.id];
  const music = server.queue.shift();

  // Play music on the voice connection
  if (ytdl.validateURL(music)) {
    server.dispatcher = connection.play(await ytdl(music, {
      format: "audioonly",
      highWaterMark: 1 << 25
    }), {type: "opus"});
  } else {
    server.dispatcher = connection.play(music);
  }

  // Handle event when music finishes
  server.dispatcher.on('finish', () => {
    server.dispatcher.destroy();
    server.dispatcher = null;
    if (server.queue[0]) {
      _play(connection, message);
    } else {
      // connection.disconnect();
    }
  });

}

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
  let index;
  let clips;
  let list;

  // Get Guild config from Database
  guild = await getGuild(message.guild.id);
  if (!guild) guild = createGuild(message.guild.id);

  // Create server session if one does not exist
  if (!SERVERS[message.guild.id]) SERVERS[message.guild.id] = {};
  server = SERVERS[message.guild.id];
  if (guild.channel_id && message.channel.id !== guild.channel_id) return;


  // ===========================================================================
  // ============================== Prefix CMD =================================
  // ===========================================================================
  if (message.content.startsWith(guild.prefix)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(guild.prefix.length)
      .split(/\s+/);


    switch (CMD_NAME) {
      case 'list':
      case 'ls':
        clips = await getAllClips();
        list = '';
        clips.forEach((val) => {
          list += `${val.id}. ${val.name}\n`
        });

        message.channel.send('Available Soundtrack:');
        message.channel.send(list);
        break;
      case 'play':
        // No arguments
        if (!args.length) {
          message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`);
          return;
        }
        arg = message.content.replace(`${guild.prefix}play `, '');

        if (validURL(arg) || validURL(args[0])) {
          play(message, args[0]);
        } else if ((clip = await getClipByName(arg)) || ((clip = await getClipByID(args[0])))) {
          play(message, getURLByClip(clip));
          clip.playback++;
          clip.save();
        } else {
          message.reply(`Unknown soundtrack ${arg}`);
        }
        break;
      case 'stop':
        if (!message.member.voice.channel) {
          message.reply('You must be in a channel to stop the bot!');
          return;
        }
        if (message.guild.voice.connection) {
          for (var i = server.queue.length - 1; i >= 0; i--) {
            server.queue.splice(i, 1);
          }
          if (server.dispatcher) server.dispatcher.end();
          message.member.voice.channel.leave();
        }
        break;
      case 'skip':
        if (server.dispatcher) server.dispatcher.end();
        break;
      case 'upload':
        server.uploading = message.content.replace(`${guild.prefix}upload`, '').trim();
        if (server.uploading) {
          message.reply(`Awaiting upload for '${server.uploading}'`);
        } else {
          message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`);
        }
        break;
      case 'cancel':
        if (server.uploading) {
          message.reply(`Cancelled upload for '${server.uploading}'`);
          server.uploading = '';
        } else {
          message.reply('Not expecting upload');
        }
        break;
      case 'channel':
        if (args[0].toLowerCase() === 'remove') {
          guild.channel_id = '';
          guild.save()
          message.channel.send("Dedicated channel setting has been removed, users are now able to play from any channel")
        } else if (args[0] && message.guild.channels.cache.has(args[0])) {
          guild.channel_id = args[0];
          guild.save()
          message.reply('Dedicated server has been set to ' + args[0]);
        } else if (args[0] && !message.guild.channels.cache.has(args[0])) {
          message.reply('Unknown channel');
        } else {
          message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`);
        }
        break;
      case 'clear':
        if (args[0] && parseInt(args[0]) > 0 && parseInt(args[0] <= 100))
          message.channel.bulkDelete(args[0]).then((messages) => {
            message.reply(`Deleted ${messages.size} messages`)
              .then(msg => msg.delete({timeout: 15000}))
              .catch(console.error);
          });
        else {
          message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`);
        }
        break;
      case 'prefix':
        if (PREFIX_BLACKLIST.indexOf(args[0]) !== -1) {
          message.reply(`Prefix ${args[0]} is reserved for other purpose`);
        } else if (args[0]) {
          guild.prefix = args[0];
          await guild.save();
          message.reply(`Prefix has been set to ${guild.prefix}`);
        } else {
          message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`);
        }
        break;
      case 'help':
        const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('SoundFX Bot Usage:')
          // .setURL('https://discord.js.org/')
          .setAuthor('SoundFX Bot v0.9b', 'https://discord.js.org')
          .setDescription(`Server's Command Prefix: ${guild.prefix}`)
          .setThumbnail('https://i.imgur.com/wSTFkRM.png')
          .addFields(
            {name: `${guild.prefix}ls`, value: 'Lists all SoundFX contents'},
            {
              name: `${guild.prefix}play [soundtrack name]`,
              value: `Manually specify a soundtrack to play.\nAlternatively,\n \
              1. Type in the exact soundtrack name in the message to play.\n \
              2. Specify the soundtrack name in square bracket to play: [damaged coda]\n \
              3. Specify the clip id after the prefix: ${guild.prefix}6`
            },
            {name: `${guild.prefix}stop`, value: 'Stop playing'},
            {name: `${guild.prefix}skip`, value: 'Skip the current soundtrack'},
            {name: `${guild.prefix}upload [soundtrack name]`, value: 'Specify a soundtrack name to upload'},
            {name: `${guild.prefix}cancel`, value: 'Cancel upload'},
            // { name: `${guild.prefix}alias [shortcut_key_with_no_space] [soundtrack name]`, value: 'Specify a shortcut for any existing soundtrack' },
            // { name: `${guild.prefix}unalias [shortcut_key]`, value: 'Unmap a shortcut key' },
            {
              name: `${guild.prefix}prefix [new prefix]`,
              value: 'Specify a new prefix to use for the server'
            },
            {name: `${guild.prefix}clear [amount < 100]`, value: 'Delete the amount of messages specified'},
            {name: `${guild.prefix}channel [channel id]`, value: 'Specify a dedicated channel for the bot to receive commands.\n \
                                                                  Note:\n \
                                                                  Developer mode must be enable under appearance tab in settings to get the channel id'},
            {name: `${guild.prefix}channel remove`, value: 'Unspecify any dedicated channel'}
          )
          .addField('::WARNING::', 'This Bot is in development phase, any clip you uploaded might or might not be deleted', true)
          // .setImage('https://i.imgur.com/wSTFkRM.png')
          .setTimestamp()
          .setFooter('Made possible with Discord.js', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(exampleEmbed);
        break;
      default:
        arg = message.content
          .trim()
          .substring(guild.prefix.length);

        try {
          if ((clip = await getClipByName(arg)) || (clip = await getClipByID(arg))) {
            play(message, getURLByClip(clip));
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
    // ===========================================================================
    // =========================== Alias playback ===========================
    // ===========================================================================
    if ((clip = await getClipByName(message.content)) != null) {
      play(message, getURLByClip(clip));
      clip.playback++;
      clip.save();
    }

    const pattern = /\[(.*?)\]/g;
    // ===========================================================================
    // =========================== Bracket Playback ==============================
    // ===========================================================================
    while ((match = pattern.exec(message.content)) != null) {
      const keyword = match[1];
      try {
        if ((clip = await getClipByName(keyword)) || (clip = await getClipByID(keyword))) {
          clip.playback++;
          clip.save();
          play(message, getURLByClip(clip));
          continue;
        }
      } catch (err) {
        message.reply(`keyword '${keyword}' not found`);
      }
    }

    // ===========================================================================
    // ================================ Uploads ==================================
    // ===========================================================================
    if (server.uploading) {
      const attachments = message.attachments.array();
      if (attachments[0] && attachments[0].url) {
        // Attachment Upload
        message.reply(`Received ${attachments[0].url} for ${server.uploading}`);
        index = await getClipCount();
        index++;
        // Download and save file named after its index
        download_file(attachments[0].url, index);
        // Create a database entry
        createClip(index, server.uploading, message.author.id, true);
        server.uploading = '';
      }
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);