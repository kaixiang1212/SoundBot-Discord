const db = require('../db');

module.exports = {
  name: 'upload',
  description: '',

  /**
   * Specify a filename for a new upload
   * @param {Message} message: Discord Message Instance
   * @param {String} args: Command argument
   */
  async execute(message, args) {
    let guild = await db.getOrCreateGuild(message.guild.id);
    let session = require('../model/sessions').getOrCreateSession(message.guild.id);

    if (Number(args)){
      message.reply('Clip name cannot be a Number').then();
    } else if (args) {
      session.uploading = args;
      message.reply(`Awaiting upload for '${args}'`).then();
    } else {
      message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`).then();
    }
  }
}
