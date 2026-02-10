const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");
const satuanController = require("../controllers/satuanController");
const supplierController = require("../controllers/supplierController");
const barangController = require("../controllers/barangController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// Kategori Routes
router.get("/kategori", verifyToken, kategoriController.getAll);
router.post(
  "/kategori",
  verifyToken,
  verifyRole(["owner", "admin"]),
  kategoriController.create,
);
router.put(
  "/kategori/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  kategoriController.update,
);
router.delete(
  "/kategori/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  kategoriController.delete,
);

// Satuan Routes
router.get("/satuan", verifyToken, satuanController.getAll);
router.post(
  "/satuan",
  verifyToken,
  verifyRole(["owner", "admin"]),
  satuanController.create,
);
router.put(
  "/satuan/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  satuanController.update,
);
router.delete(
  "/satuan/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  satuanController.delete,
);

// Supplier Routes
router.get("/supplier", verifyToken, supplierController.getAll);
router.post(
  "/supplier",
  verifyToken,
  verifyRole(["owner", "admin"]),
  supplierController.create,
);
router.put(
  "/supplier/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  supplierController.update,
);
router.delete(
  "/supplier/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  supplierController.delete,
);

// Barang Routes
router.get("/barang", verifyToken, barangController.getAll);
router.get("/barang/:id", verifyToken, barangController.getOne);
router.get("/barang/barcode/:code", verifyToken, barangController.getByBarcode);
router.post(
  "/barang",
  verifyToken,
  verifyRole(["owner", "admin"]),
  barangController.create,
);
router.put(
  "/barang/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  barangController.update,
);
router.delete(
  "/barang/:id",
  verifyToken,
  verifyRole(["owner", "admin"]),
  barangController.delete,
);

module.exports = router;
