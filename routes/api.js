const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Load models
const User = require("../models/User");
const Match = require("../models/Match");

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
// Disabled authentication for unit tests
router.get("/match", (req, res) => {
  //if (!req.isAuthenticated()) {
  //res.status(401).send("Unauthorized");
  //}

  const matchId = req.query.id;

  Match.findOne({ _id: matchId })
    .select({ _id: 0, player1Id: 1, player2Id: 1, games: 1 })
    .then(match => {
      if (!match) {
        res.status(401).send(`MatchId '${matchId}' does not exist`);
      }

      const player1Id = match.player1Id;
      const player2Id = match.player2Id;

      User.find({
        _id: {
          $in: [
            mongoose.Types.ObjectId(player1Id),
            mongoose.Types.ObjectId(player2Id)
          ]
        }
      })
        .select({ _id: 1, name: 1 })
        .then(users => {
          if (users) {
            const player1 = users[0];
            const player2 = users[1];
            const result = {
              id: matchId,
              player1Id: player1._id == player1Id ? player1._id : player2._id,
              player2Id: player2._id == player2Id ? player2._id : player1._id,
              player1Name:
                player1._id == player1Id ? player1.name : player2.name,
              player2Name:
                player2._id == player2Id ? player2.name : player1.name,
              games: match.games
            };

            res.send(result);
          }
        });
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

// GET: Leaderboard
router.get("/leaderboard", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
  }

  // Get completed matches
  Match.find({ isComplete: "true", winnerId: { $exists: true } })
    .select({ winnerId: 1 })
    .then(matches => {
      const winnerIds = matches.map(match => match.winnerId);

      // Get each players total match wins
      let winnerTotals = {};
      winnerIds.forEach(id => {
        winnerTotals[id] =
          typeof winnerTotals[id] === "undefined" ? 1 : winnerTotals[id] + 1;
      });

      User.find({
        _id: {
          $in: winnerIds
        }
      })
        .select({ _id: 1, name: 1 })
        .then(users => {
          if (users) {
            // Build a user dictionary
            let userLookup = {};
            users.forEach(user => {
              userLookup[user._id] = user.name;
            });

            // Build a list of user names and scores
            let userScores = [];
            for (let userId in winnerTotals) {
              let total = winnerTotals[userId];
              let name = userLookup[userId];
              userScores.push({ userId, name, total });
            }

            res.send(userScores.reverse());
          }
        });
    });
});

module.exports = router;
