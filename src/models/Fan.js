const mongoose = require("mongoose");

const FanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 13,
      max: 120,
    },
    twitterUsername: {
      type: String,
      unique: true,
      required: [true, "Twitter username é obrigatório"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_]{1,15}$/.test(v);
        },
        message: (props) => `${props.value} não é um Twitter username válido!`,
      },
      index: true,
      trim: true,
      lowercase: true,
    },
    socialMedia: {
      twitter: {
        type: String,
        set: (v) => (v.startsWith("@") ? v : `@${v}`),
        trim: true,
      },
      instagram: {
        type: String,
        set: (v) => (v.startsWith("@") ? v : `@${v}`),
        trim: true,
      },
    },
    followerCount: { type: Number, default: 0 },
    lastInteraction: Date,
    tweets: [
      {
        tweetId: { type: String, index: true },
        text: String,
        likes: { type: Number, default: 0 },
        retweets: { type: Number, default: 0 },
        date: Date,
      },
    ],
    fanScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collation: { locale: "en", strength: 2 }, // Case insensitive sorting
  }
);

// Índice composto para melhor performance
FanSchema.index({ twitterUsername: 1, lastInteraction: -1 });

module.exports = mongoose.model("Fan", FanSchema);
