const mongoose = require("mongoose");

const FanSchema = new mongoose.Schema(
  {
    name: { type: String },
    twitterUsername: { type: String, unique: true },
    followerCount: { type: Number },
    engagementScore: { type: Number },
    lastInteraction: { type: Date },
    tweets: [
      {
        tweetId: String,
        text: String,
        likes: Number,
        retweets: Number,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fan", FanSchema);
