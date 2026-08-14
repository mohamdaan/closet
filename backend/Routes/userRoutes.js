const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const { searchUsers, getProfile, updateProfile } = require("../Controllers/userController");

router.get("/search", requireAuth, searchUsers);
router.patch("/me", requireAuth, updateProfile);
router.get("/:id", requireAuth, getProfile);

module.exports = router;