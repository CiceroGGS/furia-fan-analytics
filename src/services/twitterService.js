const { TwitterApi } = require("twitter-api-v2");
const Fan = require("../models/Fan");
require("dotenv").config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const processTweet = async (tweet, includes) => {
  const author = includes?.users?.find((u) => u.id === tweet.author_id);

  if (!author?.username) {
    console.error(`Autor do tweet ${tweet.id} não possui username válido`);
    throw new Error("Autor do tweet não possui username válido");
  }

  const twitterUsername = author.username.toLowerCase().trim();
  const tweetData = {
    tweetId: tweet.id,
    text: tweet.text,
    likes: tweet.public_metrics?.like_count || 0,
    retweets: tweet.public_metrics?.retweet_count || 0,
    date: tweet.created_at,
  };

  await Fan.findOneAndUpdate(
    { twitterUsername },
    {
      $setOnInsert: {
        name: author.name,
        twitterUsername,
        socialMedia: {
          twitter: `@${twitterUsername}`,
          instagram: `@${twitterUsername}`,
        },
        followerCount: author.public_metrics?.followers_count || 0,
      },
      $set: {
        lastInteraction: tweet.created_at,
      },
      $addToSet: {
        tweets: tweetData,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );
};

const searchAndStoreFuriaTweets = async () => {
  try {
    // Delay para evitar rate limit
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const response = await twitterClient.v2.search(
      "FURIA esports -is:retweet",
      {
        "tweet.fields": ["created_at", "public_metrics"],
        "user.fields": ["username", "name", "public_metrics"],
        expansions: ["author_id"],
        max_results: 10,
      }
    );

    if (!response?.data) {
      throw new Error("Resposta inválida da API do Twitter");
    }

    const tweets = Array.isArray(response.data)
      ? response.data
      : [response.data];
    let savedCount = 0;

    for (const tweet of tweets) {
      try {
        await processTweet(tweet, response.includes);
        savedCount++;
      } catch (processError) {
        console.error(
          `Erro ao processar tweet ${tweet.id}:`,
          processError.message
        );
      }
    }

    const rateLimit = response._headers
      ? {
          limit: parseInt(response._headers["x-rate-limit-limit"]) || 0,
          remaining: parseInt(response._headers["x-rate-limit-remaining"]) || 0,
          reset: parseInt(response._headers["x-rate-limit-reset"]) || 0,
        }
      : {};

    return {
      success: true,
      savedTweets: savedCount,
      rateLimit,
    };
  } catch (err) {
    console.error("Erro na API do Twitter:", err);

    let resetTime = Math.floor(Date.now() / 1000) + 900;
    if (err.rateLimit?.reset) {
      resetTime = err.rateLimit.reset;
    }

    return {
      error: err.rateLimit
        ? `Limite de requisições excedido. Tente novamente após ${new Date(
            resetTime * 1000
          ).toLocaleString()}`
        : `Erro na API do Twitter: ${err.message}`,
      rateLimit: err.rateLimit || { limit: 0, remaining: 0, reset: resetTime },
    };
  }
};

module.exports = { searchAndStoreFuriaTweets };
