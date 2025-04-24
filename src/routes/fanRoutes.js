const express = require("express");
const router = express.Router();
const fanController = require("../controllers/fanController");

// Cria um novo fã
router.post("/", fanController.createFan);

// Lista todos os fãs
router.get("/", fanController.getFans);

// Busca e armazena tweets sobre a FURIA
router.get("/tweets", fanController.getTweets);

// Retorna os fãs com maior fanScore
router.get("/top", fanController.getTopFans);

module.exports = router;
