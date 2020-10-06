const { play } = require("../utils/playAudio");

module.exports = {
  name: 'play',
  description: '',

  /**
   * Play clip with soundtrack name or id
   * @param {module:"discord.js".Message} message: Discord message instance
   * @param {String} arg: Soundtrack name or id in string
   * @returns {Promise<void>}
   */
  async execute(message, arg) {
    if (!arg) return;
    play(message, arg).then((clip) => {
      if (clip === false) message.reply("Unknown soundtrack: " + arg);
    });
  }
}
