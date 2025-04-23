const express = require("express");
const router = express.Router();
const fanController = require("../controllers/fanController");
const twitterService = require("../services/twitterService");

router.post("/", fanController.createFan);
router.get("/", fanController.getFans);

router.get("/tweets", fanController.getTweets);

module.exports = router;
