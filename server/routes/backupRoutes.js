const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");
const { verifyToken } = require("../middleware/authMiddleware");

// @route   GET /api/backup/download
// @desc    Download database backup
// @access  Private (Owner/Admin/Manajer only)
router.get("/download", verifyToken, backupController.downloadBackup);

module.exports = router;
