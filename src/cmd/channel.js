module.exports = {

  name: 'channel',
  description: '',

  /**
   * Assign or unassign dedicated channel to receive commands
   * @param {Message} message: Discord message instance
   * @param {String} arg: Command argument
   * @returns {Promise<void>}
   */
  async execute(message, arg) {
    let guild = await require('../db').getOrCreateGuild(message.guild.id);
    let channel;

    if (arg.toLowerCase() === 'remove') {
      guild.channel_id = '';
      guild.save()
      message.channel.send("Dedicated channel setting has been removed, users are now able to play from any channel")
    } else if (arg && (channel = message.guild.channels.cache.get(arg))) {
      guild.channel_id = arg;
      guild.save()
      message.reply(`Dedicated server has been set to #${channel.name}`).then();
    } else if (arg && !message.guild.channels.cache.has(arg)) {
      message.reply('Unknown channel').then();
    } else {
      message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`).then();
    }
  }
}
