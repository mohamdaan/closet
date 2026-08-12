const express = require("express");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const pool = require("./db/db");
const requireAuth = require("./Middleware/authMiddleware");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Closet API is running" });
});

app.get("/api/protected-test", requireAuth, (req, res) => {
  res.json({ message: `You are logged in as user ${req.userId}` });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Closet API running on port ${PORT}`);
});
