const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const { searchUsers } = require("../Controllers/userController");

router.get("/search", requireAuth, searchUsers);

module.exports = router;