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
      title: "Record Games and View Leader Boards",
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

  // Get user names from db
  const query = User.find({
    _id: {
      $in: [
        mongoose.Types.ObjectId(player1Id),
        mongoose.Types.ObjectId(player2Id)
      ]
    }
  }).select({ name: 1 });

  query.exec((err, data) => {
    // If there's an error retrieving user ids then redirect to start-match
    if (err) {
      res.redirect("/start-match");
    }

    // Store match in db
    const newMatch = new Match({
      user1Id: player1Id,
      user2Id: player2Id
    });

    newMatch
      .save()
      .then(() => {
        req.flash("success_msg", "Match Started, GO!");
        res.redirect("/record-match");
      })
      .catch(err => console.log(err));
  });
});

// GET: Record Match
router.get("/record-match", ensureAuthenticated, (req, res) => {
  // Get last incomplete match from db
  Match.find({ isComplete: false })
    .select({ _id: 1, user1Id: 1, user2Id: 1 })
    .then(match => {
      if (match) {
        if (match.length > 0) {
          const matchId = match[0]._id;
          const player1Id = match[0].user1Id;
          const player2Id = match[0].user2Id;

          // Display record-match with previous match data
          res.render("record-match", {
            title: "Record Games",
            matchId,
            player1Id,
            player2Id
          });
        } else {
          // If no match found, then redirect to start-match
          res.redirect("/start-match");
        }
      }
    });
});

// POST: Record Match
router.post("/record-match", ensureAuthenticated, (req, res) => {
  const { matchId } = req.body;

  // Get match
  Match.findOne({ _id: matchId })
    .select({})
    .then(match => {
      if (match) {
        match.isComplete = true;

        // Save match
        match.save().then(match => {
          res.redirect("/leaderboard");
        });
      }
    });

  console.log(req.body);
});

router.get("/leaderboard", (req, res) => {
  res.render("leaderboard", {
    title: "Leaderboard"
  });
});

module.exports = router;
