module.exports = {

  name: 'cancel',
  description: '',

  /**
   * Cancel upload
   * @param {Message} message: Discord message instance
   */
  execute(message){
    let session = require('../model/sessions').getOrCreateSession(message.guild.id);

    if (session.uploading) {
      message.reply(`Cancelled upload for '${session.uploading}'`).then();
      session.uploading = '';
    } else {
      message.reply('Not expecting upload').then();
    }
  }
}
