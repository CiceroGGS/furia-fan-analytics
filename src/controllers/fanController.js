const Fan = require("../models/Fan");
const { searchAndStoreFuriaTweets } = require("../services/twitterService");

// Helper para normalizar usernames
const normalizeUsername = (username) => {
  if (!username) return null;
  return username.replace(/^@/, "").trim().toLowerCase();
};

exports.createFan = async (req, res) => {
  try {
    const { socialMedia } = req.body;

    if (!socialMedia?.twitter) {
      return res.status(400).json({
        success: false,
        error: "Twitter username é obrigatório no campo socialMedia.twitter",
      });
    }

    const twitterUsername = normalizeUsername(socialMedia.twitter);

    const fanData = {
      ...req.body,
      twitterUsername,
      socialMedia: {
        twitter: `@${twitterUsername}`,
        instagram: socialMedia.instagram
          ? `@${normalizeUsername(socialMedia.instagram)}`
          : undefined,
      },
    };

    const fan = new Fan(fanData);
    await fan.save();

    res.status(201).json({
      success: true,
      data: fan,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Já existe um fã com este Twitter username",
        field: "socialMedia.twitter",
      });
    }
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getFans = async (req, res) => {
  try {
    const fans = await Fan.find().sort({ lastInteraction: -1 });
    res.json({
      success: true,
      count: fans.length,
      data: fans,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Erro ao buscar fãs",
    });
  }
};

exports.getTweets = async (req, res) => {
  try {
    const result = await searchAndStoreFuriaTweets();

    if (result.error) {
      const statusCode = result.error.includes("Limite excedido") ? 429 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        ...(result.rateLimit && { rateLimit: result.rateLimit }),
      });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Erro interno no servidor",
    });
  }

  // Adicione no final do arquivo:
  exports.getTopFans = async (req, res) => {
    try {
      const fans = await Fan.find().sort({ fanScore: -1 }).limit(10);
      res.json({
        success: true,
        data: fans,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Erro ao buscar top fãs",
      });
    }
  };
};
