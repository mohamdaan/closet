const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const {
  createItem,
  getMyItems,
  deleteItem,
  editItem,
} = require("../Controllers/itemController");

router.post("/", requireAuth, createItem);
router.get("/", requireAuth, getMyItems);
router.patch("/:id", requireAuth, editItem);
router.delete("/:id", requireAuth, deleteItem);

module.exports = router;
