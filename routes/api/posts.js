const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
// Profile model
const Profile = require("../../models/Profile");

// Post validator
const validatePostInput = require("../../validation/post");

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({ error: "No posts found" }));
});

// @route   GET api/posts/:id
// @desc    Get post by id (single)
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err =>
      res.status(404).json({ error: "No post found with that ID" })
    );
});

// @route   POST api/posts
// @desc    Create posts
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => {
        res.json(post);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete post with id
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile =>
      Post.findById(req.params.id).then(post => {
        // Check for post owner for deletion
        if (post.user.toString() !== req.user.id) {
          // 401 = unautohrized
          return res.status(401).json({ notauthorized: "User not authorized" });
        }
        // Delete
        post
          .remove()
          .then(() => {
            res.json({ success: true });
          })
          .catch(err => {
            res.status(404).json({ error: "No post found" });
          });
      })
    );
  }
);

// @route   POST api/posts/like/:id
// @desc    Like post with id
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            // user has liked it already
            return res
              .status(400)
              .json({ alreadyLiked: "User has already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => {
            res.json(post);
          });
        })
        .catch(err => res.status(404).json({ error: "No post found" }))
    );
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Dislike post with id
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            // user is not there
            return res
              .status(400)
              .json({ notLiked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice it out
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => {
            res.json(post);
          });
        })
        .catch(err => res.status(404).json({ error: "No post found" }))
    );
  }
);

module.exports = router;
