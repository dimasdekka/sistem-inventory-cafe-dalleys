const { Barang, Kategori, Satuan } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const items = await Barang.findAll({
      include: [
        { model: Kategori, attributes: ["nama_kategori"] },
        { model: Satuan, attributes: ["nama_satuan", "simbol"] },
      ],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Barang.findOne({
      where: { id_barang: req.params.id },
      include: [
        { model: Kategori, attributes: ["nama_kategori"] },
        { model: Satuan, attributes: ["nama_satuan", "simbol"] },
      ],
    });
    if (!item)
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama_barang, id_kategori, id_satuan, stok_minimum, stok_maksimum } =
      req.body;

    let { kode_barcode, sku } = req.body;
    if (!kode_barcode) kode_barcode = null;

    if (!sku) {
      return res.status(400).json({ message: "SKU wajib diisi" });
    }

    // Cek barcode/sku unique
    if (kode_barcode) {
      const existing = await Barang.findOne({ where: { kode_barcode } });
      if (existing)
        return res.status(400).json({ message: "Barcode sudah digunakan" });
    }
    if (sku) {
      const existingSku = await Barang.findOne({ where: { sku } });
      if (existingSku)
        return res.status(400).json({ message: "SKU sudah digunakan" });
    }

    const item = await Barang.create({
      kode_barcode,
      sku,
      nama_barang,
      id_kategori,
      id_satuan,
      stok_current: 0, // Awal 0, tambah via Transaksi Masuk
      stok_minimum,
      stok_maksimum,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { kode_barcode, sku } = req.body;
    const updateData = { ...req.body };

    if (kode_barcode === "") updateData.kode_barcode = null;
    if (sku === "") updateData.sku = null;

    await Barang.update(updateData, { where: { id_barang: req.params.id } });
    res.json({ message: "Barang updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Barang.destroy({ where: { id_barang: req.params.id } });
    res.json({ message: "Barang deleted" });
  } catch (error) {
    // Catch RESTRICT errors
    res.status(400).json({
      message:
        "Tidak dapat menghapus barang yang sudah memiliki transaksi used.",
    });
  }
};

exports.getByBarcode = async (req, res) => {
  try {
    const { code } = req.params;
    const { Op } = require("sequelize");

    // Search by Barcode OR SKU
    const item = await Barang.findOne({
      where: {
        [Op.or]: [{ kode_barcode: code }, { sku: code }],
      },
      include: [
        { model: Kategori, attributes: ["nama_kategori"] },
        { model: Satuan, attributes: ["nama_satuan", "simbol"] },
      ],
    });
    if (!item)
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
