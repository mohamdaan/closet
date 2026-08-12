const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const {
  createPost,
  getFeed,
  deletePost,
  likePost,
  addComment,
  getComments,
} = require("../Controllers/postController");

router.post("/", requireAuth, createPost);
router.get("/feed", requireAuth, getFeed);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/like", requireAuth, likePost);
router.post("/:id/comments", requireAuth, addComment);
router.get("/:id/comments", requireAuth, getComments);

module.exports = router;
