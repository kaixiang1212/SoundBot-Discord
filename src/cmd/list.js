const db = require('../db')

module.exports = {
  name: 'list',
  alias: ['ls'],
  description: '',

  /**
   * List every available clip to play
   * @param {Message} message: Discord message instance
   */
  execute(message) {
    db.getAllClips()
      .then((clips) => {
        let messageBody = '';
        clips.forEach((clip) => {
          messageBody += `${clip.id}. ${clip.name}\n`;
        })
        message.channel.send('Available Soundtrack:\n' + messageBody).then();
      });
  }
}