const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasiController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, notifikasiController.getMyNotifications);
router.put("/:id/read", verifyToken, notifikasiController.markAsRead);

module.exports = router;
