const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "posts helloworld" });
});

module.exports = router;
