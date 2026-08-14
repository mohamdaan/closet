const express = require("express");
const router = express.Router();
const { register, login, changePassword } = require("../Controllers/authController");
const requireAuth = require("../Middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.patch("/password", requireAuth, changePassword);

module.exports = router;