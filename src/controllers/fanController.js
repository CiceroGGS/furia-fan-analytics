const Fan = require("../models/Fan");
const { searchAndStoreFuriaTweets } = require("../services/twitterService");

exports.createFan = async (req, res) => {
  try {
    const fan = new Fan(req.body);
    await fan.save();
    res.status(201).json(fan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFans = async (req, res) => {
  try {
    const fans = await Fan.find();
    res.json(fans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTweets = async (req, res) => {
  const result = await searchAndStoreFuriaTweets();

  if (result.error) {
    const resetTime = new Date(result.rateLimit.reset * 1000);
    return res.status(429).json({
      success: false,
      error: result.error,
      rateLimit: result.rateLimit,
      resetTime: resetTime.toISOString(),
    });
  }

  res.json(result);
};
