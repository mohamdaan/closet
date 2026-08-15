const express = require("express");
const cors = require("cors");

const authRoutes = require("./Routes/authRoutes");
const itemRoutes = require("./Routes/itemRoutes");
const postRoutes = require("./Routes/postRoutes");
const friendRoutes = require("./Routes/friendRoutes");
const messageRoutes = require("./Routes/messageRouter");
const userRoutes = require("./Routes/userRoutes");
const { generalLimiter } = require("./Middleware/rateLimiter");

const pool = require("./db/db");
const requireAuth = require("./Middleware/authMiddleware");
const app = express();

app.use(cors());
app.use(express.json());
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Closet API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", requireAuth, itemRoutes);
app.use("/api/posts", requireAuth, postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Closet API running on port ${PORT}`);
});
