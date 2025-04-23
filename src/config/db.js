const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/furia-fans"
    );
    console.log("✅ MongoDB conectado com sucesso!");
  } catch (err) {
    console.error("❌ Erro na conexão com MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
