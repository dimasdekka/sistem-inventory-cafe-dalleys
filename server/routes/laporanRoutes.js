const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporanController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  laporanController.getReport,
);

module.exports = router;
