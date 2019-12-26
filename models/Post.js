const mongoosse = require("mongoose");

const Schema = mongoosse.Schema;

// Create Schema
const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" }
    }
  ],
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoosse.model("post", postSchema);
