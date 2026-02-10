const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, transaksiController.getAll);
router.get("/:id", verifyToken, transaksiController.getOne);
router.post("/", verifyToken, transaksiController.create);
router.put("/:id", verifyToken, transaksiController.update);

module.exports = router;
