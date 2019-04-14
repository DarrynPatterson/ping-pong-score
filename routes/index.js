const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// Home
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("home", {
      title: "Record Games and View Leader Boards",
      page: "home"
    });
  }
});

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    title: "Match Dashboard",
    name: req.user.name
  })
);

module.exports = router;
