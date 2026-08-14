const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/authMiddleware");
const upload = require("../config/cloudinary");
const { createItem, getMyItems, editItem, deleteItem } = require("../Controllers/itemController");

router.post("/", requireAuth, upload.single("image"), createItem);
router.get("/", requireAuth, getMyItems);
router.patch("/:id", requireAuth, upload.single("image"), editItem);
router.delete("/:id", requireAuth, deleteItem);

module.exports = router;