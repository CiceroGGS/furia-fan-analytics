const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fanRoutes = require("./routes/fanRoutes"); // Caminho corrigido

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB conectado com sucesso!"))
  .catch((err) => console.log("Erro ao conectar ao MongoDB:", err));

// Usando as rotas
app.use("/api/fans", fanRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
