const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("VIORA AI Backend funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`VIORA AI funcionando en el puerto ${PORT}`);
});
