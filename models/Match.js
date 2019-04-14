const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  players: {
    type: [ObjectId],
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
