const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Load models
const User = require("../models/User");
const Match = require("../models/Match");

// GET: Leaderboard
router.get("/leaderboard", (req, res) => {
  if (!req.isAuthenticated()) {
  }

  let data = { person: "darryn" };
  res.send(data);
});

// GET: Users
router.get("/users", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
  }

  User.find({})
    .select({ name: 1 })
    .then(user => {
      if (user) {
        res.send(user);
      }
    });
});

// GET: Match
router.get("/match", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
  }

  const matchId = req.query.id;

  Match.findOne({ _id: matchId })
    .select({ _id: 1, user1Id: 1, user2Id: 1, games: 1 })
    .then(match => {
      if (match) {
        User.find({
          _id: {
            $in: [
              mongoose.Types.ObjectId(match.user1Id),
              mongoose.Types.ObjectId(match.user2Id)
            ]
          }
        })
          .select({ name: 1 })
          .then(users => {
            if (users) {
              const result = {
                id: match._id,
                player1: { id: users[0]._id, name: users[0].name },
                player2: { id: users[1]._id, name: users[1].name },
                games: match.games
              };

              res.send(result);
            }
          });
      }
    });
});

// POST: Game
router.post("/game", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
  }

  const { matchId, winnerId, loserId, winnerScore, loserScore } = req.body;

  // Get match
  Match.findOne({ _id: matchId })
    .select({})
    .then(match => {
      // Perform validation
      if (!match) {
        res.status(400).send("Invalid MatchId");
      } else {
        // Add game to match
        match.games.push({ winnerId, loserId, winnerScore, loserScore });

        // Save game in db
        match.save().then(match => {
          res.send(match);
        });
      }
    });
});

module.exports = router;
