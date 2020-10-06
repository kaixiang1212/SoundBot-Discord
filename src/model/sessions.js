const {Collection} = require("discord.js");

/**
 * A collection of playback sessions
 * @type {Collection<Snowflake, Session>}
 */
let sessions = new Collection();

class Session {
  constructor() {
    this.queue = [];
    this.uploading = '';
    this.dispatcher = null;
    this.playing = null;
  }
}

/**
 * Create a server session if none exist and return the session instance
 * @param {Snowflake} guild_id: Guild id Snowflake
 * @returns {Session}
 */
module.exports.getOrCreateSession = (guild_id) => {
  if (sessions.get(guild_id)) return sessions.get(guild_id);

  let session = new Session();
  sessions.set(guild_id, session)
  return session;
}
