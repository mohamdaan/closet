const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
} = require("../Controllers/authController");
const requireAuth = require("../Middleware/authMiddleware");
const { authLimiter } = require("../Middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.patch("/password", requireAuth, changePassword);

module.exports = router;
