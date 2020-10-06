module.exports = {
  name: 'clear',
  description: '',


  /**
   * Clear messages
   * @param {Message} message: Discord message instance
   * @param {String} arg: Command argument in message
   * @returns {Promise<void>}
   */
  async execute(message, arg) {
    let guild = await require('../db').getOrCreateGuild(message.guild.id);

    if (Number(arg) && parseInt(arg) > 0 && parseInt(arg) <= 100)
      message.channel.bulkDelete(parseInt(arg)).then((messages) => {
        message.reply(`Deleted ${messages.size} messages`)
          .then(msg => msg.delete({timeout: 15000}))
          .catch(console.error);
      });
    else {
      message.reply(`Incorrect Usage: Type ${guild.prefix}help for the correct usage`).then();
    }
  }
}