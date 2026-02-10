const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// Dashboard Routes
router.get("/dashboard/stats", verifyToken, dashboardController.getStats);

// User Management Routes
router.get(
  "/users",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  userController.getAllUsers,
);
router.post(
  "/users",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  userController.createUser,
);
router.delete(
  "/users/:id",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  userController.deleteUser,
);

router.put(
  "/users/:id",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  upload.single("photo"),
  userController.updateUser,
);

router.post(
  "/users/:id/restore",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  userController.restoreUser,
);

router.get(
  "/users/deleted",
  verifyToken,
  verifyRole(["owner", "admin", "manajer"]),
  userController.getDeletedUsers,
);

router.put(
  "/profile",
  verifyToken,
  upload.single("photo"),
  userController.updateProfile,
);

module.exports = router;
