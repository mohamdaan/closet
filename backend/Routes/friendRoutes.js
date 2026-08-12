const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const { sendRequest, respondToRequest, getFriends, getPendingRequests } = require("../Controllers/friendController");

router.post("/request", requireAuth, sendRequest);
router.patch("/:id/respond", requireAuth, respondToRequest);
router.get("/", requireAuth, getFriends);
router.get("/pending", requireAuth, getPendingRequests);

module.exports = router