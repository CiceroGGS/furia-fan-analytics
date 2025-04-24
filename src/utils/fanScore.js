// src/utils/fanScore.js

const calculateFanScore = (fan) => {
  const tweetScore = (fan.tweets?.length || 0) * 2;

  const interactionScore = (fan.tweets || []).reduce(
    (sum, tweet) => sum + (tweet.likes || 0) + (tweet.retweets || 0),
    0
  );

  const followerScore = (fan.followerCount || 0) / 100;

  const recencyScore = fan.lastInteraction
    ? Math.max(
        0,
        30 -
          Math.floor(
            (Date.now() - new Date(fan.lastInteraction).getTime()) /
              (1000 * 60 * 60 * 24)
          )
      )
    : 0;

  return Math.round(
    tweetScore + interactionScore + followerScore + recencyScore
  );
};

module.exports = { calculateFanScore };
