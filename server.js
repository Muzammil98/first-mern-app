const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Routes
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const profiles = require("./routes/api/profiles");

// Port Setup
const port = process.env.PORT || 5000;

//MongoDB Connection
const uri = require("./config/Keys").mongoURI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch(err => console.log(err));

// Body-parser middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use routes middleware
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profiles", profiles);

app.get("/", (req, res) => {
  res.send("HELLo");
});

app.listen(port, () => console.log(`Server Running on ${port}...`));
