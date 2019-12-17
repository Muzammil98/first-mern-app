const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("profiles helloworld");
});

module.exports = router;
