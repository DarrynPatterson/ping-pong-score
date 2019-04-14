const express = require("express");
const router = express.Router();

// GET: Leaderboard
router.get("/leaderboard", (req, res) => {
  if (!req.isAuthenticated()) {
  }

  let data = { person: "darryn" };
  res.send(data);
});

module.exports = router;
