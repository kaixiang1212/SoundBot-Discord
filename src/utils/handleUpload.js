const fs = require('fs')
const https = require('https')
const request = require('request')
const db = require("../db");
const {getOrCreateSession} = require("../model/sessions");
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;

/**
 * Extract attachment from message, download and create an entry in the database
 * @param {Message} message: Discord message instance
 * @returns {Promise<void>}
 */
exports.handleUpload = async (message) => {
  const session= getOrCreateSession(message.guild.id)
  const attachments = message.attachments.array();
  if (attachments[0] && attachments[0].url) {

    let counter = await db.getClipCounter();
    let index = counter.seq + 1;

    processUpload(attachments[0].url, (error, fileSize) => {
      if (error) {
        message.reply("Error occurred: " + error.message)
        return;
      }

      // 1MB Threshold
      if (1000000 < fileSize) {
        message.reply(`File exceeds maximum size (1MB). File not saved.`);
        return;
      }
      message.reply(`Received ${attachments[0].url} for ${session.uploading}`).then();
      // Download and save file named after its index
      download_file(attachments[0].url, index);
      // Create Database entry
      db.createClip(index, session.uploading, message.author.id, true);
      session.uploading = '';
    });
  }
}

/**
 * @callback headRequestCallback
 * @param {Error} error: Request Error
 * @param {Number} length: Content Length
 */

/**
 * Determine audio file's size by sending a HEAD method to the url and
 * check for its content length
 * @param url Audio File's URL
 * @param callback {headRequestCallback}
 */
function processUpload(url, callback){
  let options = {
    url: url,
    method: 'HEAD',
    followAllRedirects: true,
    followOriginalHttpMethod: true
  };

  request(options, (a, res)=>{
    if (res.statusCode !== 200){
      return callback(new Error('Received unknown status code:' + res.statusCode), 0);
    }
    let len = res.headers['content-length'];
    if (len < 0) return callback(new Error('Invalid Content-Length received'), 0);
    else if (len === 0) return callback(new Error('Could not determine file size'), 0);
    else if (res.headers['content-type'] !== 'audio/mpeg') return callback(new Error('Invalid file type'), '');

    callback(null, res.headers['content-length']);
  })
}

/**
 * Downloads file from given url to local disk with given filename
 * @param {string} url: URL of the file
 * @param {string} filename: filename
 */
function download_file(url, filename) {
  const dest = `${UPLOAD_FOLDER}/${filename}.mp3`;
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', file.close);
  }).on('error', (err) => { // Handle errors
    file.unlink(dest); // Delete the file async. (But we don't check the result)
    console.error(err);
  });
}

