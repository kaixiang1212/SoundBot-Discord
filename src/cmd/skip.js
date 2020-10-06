module.exports = {

  name: 'skip',
  description: '',

  /**
   * Skip current song playing on the user's voice channel to the next song on queue
   * If queue is empty, do nothing
   * @param {Message} message: Discord Message instance
   */
  execute(message) {
    let session = require('../model/sessions').getOrCreateSession(message.guild.id);
    require('../utils/skipAudio').skip(session);
  }
}