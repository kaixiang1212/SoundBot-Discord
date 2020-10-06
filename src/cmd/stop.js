module.exports = {

  name: 'stop',
  description: '',

  /**
   * Stops current playing song on the user's voice channel
   * and forces bot to disconnect from voice channel
   * @param {Message} message: Discord Message Instance
   */
  execute(message) {
    let session = require('../model/sessions').getOrCreateSession(message.guild.id);

    if (!message.member.voice.channel) {
      message.reply('You must be in a channel to stop the bot!').then();
      return;
    }
    if (message.guild.voice.connection) {
      require('../utils/stopAudio').stop(session)
      message.member.voice.channel.leave();
    }
  }
}