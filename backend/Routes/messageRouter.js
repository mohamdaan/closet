const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getConversations,
} = require("../Controllers/messageController");

router.post("/conversations", requireAuth, getOrCreateConversation);
router.get("/conversations", requireAuth, getConversations);
router.post("/conversations/:id/messages", requireAuth, sendMessage);
router.get("/conversations/:id/messages", requireAuth, getMessages);

module.exports = router;
