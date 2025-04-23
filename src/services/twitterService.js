const { TwitterApi } = require("twitter-api-v2");
const Fan = require("../models/Fan");
require("dotenv").config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const searchAndStoreFuriaTweets = async () => {
  try {
    const tweets = await twitterClient.v2.search("FURIA esports -is:retweet", {
      "tweet.fields": ["created_at", "public_metrics"],
      "user.fields": ["username", "public_metrics"],
      expansions: ["author_id"],
      max_results: 10,
    });

    let savedCount = 0;

    for (const tweet of tweets.data) {
      const author = tweets.includes.users.find(
        (u) => u.id === tweet.author_id
      );

      await Fan.findOneAndUpdate(
        { twitterUsername: author.username },
        {
          name: author.name,
          twitterUsername: author.username,
          followerCount: author.public_metrics.followers_count,
          lastInteraction: tweet.created_at,
          $push: {
            tweets: {
              tweetId: tweet.id,
              text: tweet.text,
              likes: tweet.public_metrics.like_count,
              retweets: tweet.public_metrics.retweet_count,
              date: tweet.created_at,
            },
          },
        },
        { upsert: true, new: true }
      );
      savedCount++;
    }

    const rateLimit = {
      limit: parseInt(tweets._headers.get("x-rate-limit-limit")) || 0,
      remaining: parseInt(tweets._headers.get("x-rate-limit-remaining")) || 0,
      reset: parseInt(tweets._headers.get("x-rate-limit-reset")) || 0,
    };

    return {
      success: true,
      savedTweets: savedCount,
      rateLimit,
    };
  } catch (err) {
    const rateLimit = err.rateLimit || {
      limit: 0,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 900,
    };

    return {
      error: err.message,
      rateLimit,
    };
  }
};

module.exports = { searchAndStoreFuriaTweets };
