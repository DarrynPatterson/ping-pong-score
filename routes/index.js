const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { ensureAuthenticated } = require("../config/auth");

// Load models
const User = require("../models/User");
const Match = require("../models/Match");

// GET: /
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/record-match");
  } else {
    res.render("home", {
      title: "Record Games and Track Match Winners",
      page: "home"
    });
  }
});

// GET: Start Match
router.get("/start-match", ensureAuthenticated, (req, res) => {
  res.render("start-match", {
    title: "Select Players",
    name: req.user.name
  });
});

// POST: Start Match
router.post("/start-match", ensureAuthenticated, (req, res) => {
  const { player1Id, player2Id } = req.body;

  // Get users by id
  User.find({
    _id: {
      $in: [mongoose.Types.ObjectId(player1Id), mongoose.Types.ObjectId(player2Id)]
    }
  })
    .select({ name: 1 })
    .then(data => {
      if (data && data.length == 2) {
        // Create new match
        const newMatch = new Match({ player1Id, player2Id });
        newMatch
          .save()
          .then(() => {
            res.redirect("/record-match");
          })
          .catch(err => console.log(err));
      } else {
        // Both users not found
        res.redirect("/start-match");
      }
    });
});

// GET: Record Match
router.get("/record-match", ensureAuthenticated, (req, res) => {
  // Get last incomplete match
  Match.find({ isComplete: false })
    .select({ _id: 1 })
    .then(match => {
      if (match) {
        // Previous match exists?
        if (match.length > 0) {
          const matchId = match[0]._id;

          res.render("record-match", {
            title: "Record Games",
            matchId
          });
        } else {
          // No match exists
          res.redirect("/start-match");
        }
      }
    });
});

// POST: Record Match
router.post("/record-match", ensureAuthenticated, (req, res) => {
  const { matchId } = req.body;

  Match.findOne({ _id: matchId })
    .select({})
    .then(match => {
      if (match) {
        const player1Id = match.player1Id;
        const player2Id = match.player2Id;

        // Update match isComplete flag and winnerId
        match.isComplete = true;
        match.winnerId = null;

        if (match.games.length > 0) {
          const player1Wins = match.games.filter(game => game.winnerId.toString() === player1Id.toString()).length;
          const player2Wins = match.games.filter(game => game.winnerId.toString() === player2Id.toString()).length;
          match.winnerId = player1Wins > player2Wins ? player1Id : player2Id;
        }

        // Save match
        match.save().then(() => {
          res.redirect("/leaderboard");
        });
      }
    });
});

// GET: Leaderboard
router.get("/leaderboard", ensureAuthenticated, (req, res) => {
  res.render("leaderboard", {
    title: "Leaderboard"
  });
});

module.exports = router;
