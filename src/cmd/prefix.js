const PREFIX_BLACKLIST = [':', '/', '\\'];

module.exports = {

  name: 'prefix',
  description: '',

  /**
   * Change guild's prefix to given new prefix
   * @param {Message} message: Discord Message instance
   * @param {string} arg: New prefix
   */
  async execute(message, arg) {
    let guild = await require('../db').getOrCreateGuild(message.guild.id);

    if (PREFIX_BLACKLIST.indexOf(arg) !== -1) {
      message.reply(`Prefix ${arg} is reserved for other purpose`).then();
    } else if (arg) {
      guild.prefix = arg;
      guild.save().then(() => {
        message.reply(`Prefix has been set to ${guild.prefix}`).then()
      });
    } else {
      message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`).then();
    }
  }
}