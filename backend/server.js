const express = require("express");
const cors = require("cors");
const pool = require("./db/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Closet API is running" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Closet API running on port ${PORT}`);
});
