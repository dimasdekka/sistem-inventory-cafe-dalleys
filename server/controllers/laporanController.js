const { Transaksi, Barang, User, Kategori, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getReport = async (req, res) => {
  try {
    const { type, startDate, endDate, kategori } = req.query;
    // type: 'masuk', 'keluar', 'all'
    // kategori: id_kategori or 'all'

    let whereClause = {};
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59.999`);

      whereClause.tanggal_transaksi = {
        [Op.between]: [start, end],
      };
    }
    if (type && type !== "all") {
      whereClause.jenis_transaksi = type;
    }

    // Build include with kategori filter if needed
    let barangInclude = {
      model: Barang,
      attributes: ["nama_barang", "kode_barcode", "id_kategori"],
      include: [
        {
          model: Kategori,
          attributes: ["id_kategori", "nama_kategori"],
        },
      ],
    };

    // Add kategori filter to Barang if specified
    if (kategori && kategori !== "all") {
      barangInclude.where = { id_kategori: parseInt(kategori) };
    }

    const reportData = await Transaksi.findAll({
      where: whereClause,
      include: [
        barangInclude,
        { model: User, attributes: ["nama_lengkap"], paranoid: false },
      ],
      order: [["tanggal_transaksi", "ASC"]],
    });

    console.log("Report data count:", reportData.length);
    if (reportData.length > 0) {
      console.log("Sample data:", JSON.stringify(reportData[0], null, 2));
    }

    res.json(reportData);
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ message: error.message });
  }
};
