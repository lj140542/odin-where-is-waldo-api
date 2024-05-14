const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  username: { type: String, required: true, maxLength: 50 },
  score: { type: String, required: true, maxLength: 8 },
  starttime: { type: Date, required: true },
  endtime: { type: Date, required: true },
});

module.exports = mongoose.model('Score', ScoreSchema);