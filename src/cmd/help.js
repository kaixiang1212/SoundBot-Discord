const db = require('../db')
const Discord = require('discord.js')

module.exports = {
  name: 'help',
  description: '',

  /**
   * Show usage of every commands
   * @param {Message} message: Discord message instance
   * @returns {Promise<void>}
   */
  async execute(message) {
    let guild = await db.getOrCreateGuild(message.guild.id);

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('SoundFX Bot Usage:')
        // .setURL('https://discord.js.org/')
        .setAuthor('SoundFX Bot v0.9b', 'https://discord.js.org')
        .setDescription(`Server's Command Prefix: ${guild.prefix}`)
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addField(`${guild.prefix}ls`, 'Lists all SoundFX contents', true)
        .addField(`${guild.prefix}play [soundtrack name]`,
          `Manually specify a soundtrack to play.\nAlternatively,\n \
              1. Type in the exact soundtrack name in the message to play.\n \
              2. Specify the soundtrack name in square bracket to play: [damaged coda]\n \
              3. Specify the clip id after the prefix: ${guild.prefix}6`)
        .addField(`${guild.prefix}stop`, 'Stop playing')
        .addField(`${guild.prefix}skip`, 'Skip the current soundtrack')
        .addField(`${guild.prefix}upload [soundtrack name]`, 'Specify a soundtrack name to upload')
        .addField(`${guild.prefix}cancel`, 'Cancel upload')
        .addField(`${guild.prefix}prefix [new prefix]`, 'Specify a new prefix to use for the server')
        .addField(`${guild.prefix}clear [amount < 100]`, 'Delete the amount of messages specified')
        // { name: `${guild.prefix}alias [shortcut_key_with_no_space] [soundtrack name]`, value: 'Specify a shortcut for any existing soundtrack' },
        // { name: `${guild.prefix}unalias [shortcut_key]`, value: 'Unmap a shortcut key' },
        .addField(`${guild.prefix}channel [channel id]`,
          'Specify a dedicated channel for the bot to receive commands.\n \
                Note:\n \
                Developer mode must be enable under appearance tab in settings to get the channel id')
        .addField(`${guild.prefix}channel remove`, 'Unspecify any dedicated channel')
        .addField('::WARNING::', 'This Bot is in development phase, any clip you uploaded might or might not be deleted', true)
        // .setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter('Made possible with Discord.js', 'https://i.imgur.com/wSTFkRM.png')
    ).then();
  }
}