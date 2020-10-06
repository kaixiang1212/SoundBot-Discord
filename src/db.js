const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const db = mongoose.connection;
exports.db = db;

mongoose.connect('mongodb://localhost:27017/soundfx', {useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log('Connected to Database!');
});


const ClipsSchema = new mongoose.Schema({
  name: String,
  // index: {type: Number, unique: true},
  playback: {type: Number, default: 0},
  owner: String,
  public: {type: Boolean, default: true},
});
ClipsSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Clip = mongoose.model('Clip', ClipsSchema);

exports.getClipByName = (name) => {
  return Clip.findOne({'name': {$regex: name , $options: 'i'}});
}

exports.getClipByID = (id) => {
  return Clip.findOne({'id': id});
}

exports.searchClip = (query) => {
  return Clip.find({'name': {$regex: query, $options: 'i'}})
}

exports.createClip = (index, name, owner, isPublic) => {
  const newClip = new Clip({'index': index, 'name': name, 'owner': owner, 'public': isPublic});
  newClip.save();
  return newClip;
}

exports.getAllClips = () => {
  return Clip.find({}).sort("id");
}

const CounterSchema = new mongoose.Schema({
  id: String,
  seq: Number
});

const Counter = mongoose.model('counter', CounterSchema);

exports.getClipCounter = () => {
  return Counter.findOne({'id': "id"});
}

const GuildSchema = new mongoose.Schema({
  guild_id: String,
  channel_id: {type: String, required: false},
  prefix: {type: String, required: true, default: '`'}
});

const Guild = mongoose.model('Guild', GuildSchema);

function getGuild (id) {
  return Guild.findOne({'guild_id': id});
}

function createGuild(guild_id) {
  const guild = new Guild({'guild_id': guild_id});
  guild.save();
  return guild;
}

exports.getGuild = getGuild;
exports.createGuild = createGuild;

exports.getOrCreateGuild = (guild_id) => {
  let guild = getGuild(guild_id);
  if (guild) return guild;
  else return createGuild(guild_id);
}