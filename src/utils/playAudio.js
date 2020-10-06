const { getOrCreateSession } = require('../model/sessions');
const ytdl = require('ytdl-core-discord')
const db = require("../db");
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;

function getURLByClip(clip) {
  return `${UPLOAD_FOLDER}/${clip.id}.mp3`;
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

/**
 * Identify sound track's url and enqueue it to the session queue
 * @param {module:"discord.js".Message} message: Discord Message Instance
 * @param {String} string: URL || clip name || clip id
 * @param {{urlPlayback: Boolean, namePlayback: Boolean, idPlayback: Boolean}|{}} [options={urlPlayback: true, namePlayback: true, idPlayback: true}]
 * @returns {Promise<boolean|void>}: Return void if error occur, return true if clip is found, false otherwise.
 */
exports.play = async function play(message, string, options) {

  // Check if user are in a voice channel
  if (!message.member.voice.channel) {
    message.reply('You must be in a channel to play the bot!').then();
    return;
  }
  options = options || {};
  let urlPlayback = options.urlPlayback === undefined || options.urlPlayback;
  let namePlayback = options.namePlayback === undefined || options.namePlayback;
  let idPlayback = options.idPlayback === undefined || options.idPlayback;

  let url;
  if ((urlPlayback === true) && validURL(string)) url = string;
  else {
    let clip = await db.getClipByName(string)
      .then((result) => {
        if (result && namePlayback) return result;
        else if (Number(string) && idPlayback) return db.getClipByID(string);
        return null;
      });
    url = clip ? getURLByClip(clip) : '';
  }
  if (!url) return false;

  const session = getOrCreateSession(message.guild.id);

  // Pushes url into the queue
  session.queue.push(url);

  // Connect to voice channel and play songs if no songs are playing
  if (!message.member.voice.connection && !session.dispatcher && !session.playing) {
    session.playing = true;
    message.member.voice.channel.join()
      .then((connection) => {
        _play(connection, message).then();
      })
      .catch(console.error)
      .finally(() => {
        session.playing = false
      });
  }
  return true;
}

/**
 * Play a song on the voice connection
 * @param {VoiceConnection} connection: Discord voice connection instance to play to
 * @param {Message} message: Discord message instance
 * @returns {Promise<void>}
 * @private
 */
async function _play(connection, message) {
  const session = getOrCreateSession(message.guild.id);
  const music = session.queue.shift();

  // Play music on the voice connection
  if (ytdl.validateURL(music)) {
    session.dispatcher = connection.play(await ytdl(music, {
      format: "audioonly",
      highWaterMark: 1 << 25
    }), {type: "opus"});
  } else {
    session.dispatcher = connection.play(music);
  }

  // Handle event when music finishes
  session.dispatcher.on('finish', () => {
    session.dispatcher.destroy();
    session.dispatcher = null;
    if (session.queue[0]) {
      _play(connection, message);
    } else {
      // connection.disconnect();
    }
  });
}
