const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { verifyToken } = require("../middleware/authMiddleware");

// @route   GET /api/activity-logs
// @desc    Get activity logs with optional filter
// @access  Private
router.get("/", verifyToken, activityLogController.getActivityLogs);

module.exports = router;
