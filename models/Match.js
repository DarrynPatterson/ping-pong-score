const mongoose = require("mongoose");

const game = {
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
};

const MatchSchema = new mongoose.Schema({
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  games: [game],
  isComplete: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;
