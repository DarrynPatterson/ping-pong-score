const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  loserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  winnerScore: {
    type: Number,
    required: true
  },
  loserScore: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;
