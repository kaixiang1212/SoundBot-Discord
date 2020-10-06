const db = require('../db');

module.exports = {
  name: 'upload',
  description: '',

  /**
   * Specify a filename for a new upload
   * @param {Message} message: Discord Message Instance
   */
  async execute(message) {
    let guild = await db.getOrCreateGuild(message.guild.id);
    let session = require('../model/sessions').getOrCreateSession(message.guild.id);

    session.uploading = message.content
      .replace(`${guild.prefix}${this.name}`, '')
      .trim();

    if (session.uploading) {
      message.reply(`Awaiting upload for '${session.uploading}'`).then();
    } else {
      message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`).then();
    }
  }
}
