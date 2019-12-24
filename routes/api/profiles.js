const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// Load profile model
const Profile = require("../../models/Profile");

// Load user model
const User = require("../../models/User");

// @route   GET api/profiles
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json({ errors });
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

// @route   GET api/profiles/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("users", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There is no profile for this user";

        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profiles: "There are no profiles" }));
});

// @route   GET api/profiles/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("users", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profiles/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   POST api/profiles
// @desc    Create or Edit users profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 code
      return res.status(400).json(errors);
    }
    //  Get fields
    const porfileFields = {};
    porfileFields.user = req.user.id;
    if (req.body.handle) porfileFields.handle = req.body.handle;
    if (req.body.company) porfileFields.company = req.body.company;
    if (req.body.website) porfileFields.website = req.body.website;
    if (req.body.location) porfileFields.location = req.body.location;
    if (req.body.status) porfileFields.status = req.body.status;

    // Skills - split into array
    if (typeof req.body.skills !== "undefined")
      porfileFields.skills = req.body.skills.split(",");

    if (req.body.bio) porfileFields.bio = req.body.bio;
    if (req.body.githubusername)
      porfileFields.githubusername = req.body.githubusername;

    // Social
    porfileFields.social = {};
    if (req.body.youtube) porfileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) porfileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) porfileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) porfileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) porfileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: porfileFields },
          { new: true }
        )
          .then(profile => {
            res.json(profile);
          })
          .catch(err => res.json(err));
      } else {
        // Create
        // Check if handle exists
        Profile.findOne({ handle: porfileFields.handle })
          .then(profile => {
            if (profile) {
              errors.handle = "That handle already exists";
              res.status(400).json(errors);
            }

            // Save profile
            new Profile(porfileFields)
              .save()
              .then(profile => res.json(profile))
              .catch(err => res.json(err));
          })
          .catch(err => res.json(err));
      }
    });
  }
);

// @route   POST api/profiles/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 code
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEXP = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience array in profile
      profile.experience.unshift(newEXP);

      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.json(err));
    });
  }
);

// @route   POST api/profiles/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check validation
    if (!isValid) {
      // Return any errors with 400 code
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEDU = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to education array in profile
      profile.education.unshift(newEDU);

      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.json(err));
    });
  }
);
module.exports = router;
