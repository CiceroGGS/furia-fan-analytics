const express = require("express");
const connectDB = require("./config/db");
const fanRoutes = require("./routes/fanRoutes");

const app = express();
connectDB();

app.use(express.json());
app.use("/api/fans", fanRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
