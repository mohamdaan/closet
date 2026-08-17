const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const {
  getSuggestions,
  chat,
  getChatHistory,
} = require("../Controllers/stylistController");
const { generalLimiter } = require("../Middleware/rateLimiter");

router.post("/suggest", requireAuth, generalLimiter, getSuggestions);
router.post("/chat", requireAuth, generalLimiter, chat);
router.get("/chat/history", requireAuth, getChatHistory);

module.exports = router;
