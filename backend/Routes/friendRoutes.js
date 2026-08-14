const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const { sendRequest, respondToRequest, getFriends, getPendingRequests, getFriendsOf } = require("../Controllers/friendController");

router.post("/request", requireAuth, sendRequest);
router.patch("/:id/respond", requireAuth, respondToRequest);
router.get("/pending", requireAuth, getPendingRequests);
router.get("/user/:userId", requireAuth, getFriendsOf);
router.get("/", requireAuth, getFriends);

module.exports = router;