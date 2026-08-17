const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");
const requireAuth = require("../Middleware/authMiddleware");
const { authLimiter } = require("../Middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.patch("/password", requireAuth, changePassword);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

module.exports = router;
