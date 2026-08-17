const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const { getSuggestions } = require("../Controllers/stylistController");
const { generalLimiter } = require("../Middleware/rateLimiter");

router.post("/suggest", requireAuth, generalLimiter, getSuggestions);

module.exports = router;