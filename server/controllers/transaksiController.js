const {
  Transaksi,
  Barang,
  User,
  Supplier,
  Notifikasi,
  ActivityLog,
  sequelize,
} = require("../models");

exports.getAll = async (req, res) => {
  try {
    const transactions = await Transaksi.findAll({
      include: [
        { model: Barang, attributes: ["nama_barang"] },
        { model: User, attributes: ["username", "nama_lengkap"] },
        {
          model: User,
          as: "Editor",
          attributes: ["username", "nama_lengkap"],
        },
        { model: Supplier, attributes: ["nama_supplier"] },
      ],
      order: [["tanggal_transaksi", "DESC"]],
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_barang, id_supplier, jenis_transaksi, jumlah, keterangan } =
      req.body;
    const id_user = req.user.id_user;

    const barang = await Barang.findByPk(id_barang, { transaction: t });
    if (!barang) {
      await t.rollback();
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    // Generate Kode Transaksi (TRX-TIMESTAMP)
    const kode_transaksi = `TRX-${Date.now()}`;

    if (jenis_transaksi === "keluar") {
      if (barang.stok_current < jumlah) {
        await t.rollback();
        return res.status(400).json({ message: "Stok tidak mencukupi" });
      }
      barang.stok_current -= jumlah;
    } else if (jenis_transaksi === "masuk") {
      barang.stok_current += parseInt(jumlah);
    }

    await barang.save({ transaction: t });

    // Buat Transaksi
    const transaksi = await Transaksi.create(
      {
        kode_transaksi,
        id_barang,
        id_user,
        id_supplier: jenis_transaksi === "masuk" ? id_supplier : null,
        jenis_transaksi,
        jumlah,
        keterangan,
      },
      { transaction: t },
    );

    // Cek Stok Minimum untuk Notifikasi
    if (
      barang.stok_current <= barang.stok_minimum &&
      jenis_transaksi === "keluar"
    ) {
      // Cari Owner untuk dikirim notif
      const owners = await User.findAll({
        where: { role: "owner" },
        transaction: t,
      });

      const notifPromises = owners.map((owner) => {
        return Notifikasi.create(
          {
            id_barang,
            id_user_tujuan: owner.id_user,
            jenis_notifikasi: "low_stock",
            pesan: `Stok ${barang.nama_barang} rendah! Sisa: ${barang.stok_current}`,
          },
          { transaction: t },
        );
      });

      await Promise.all(notifPromises);
    }

    // Create Activity Log
    await ActivityLog.create(
      {
        type: jenis_transaksi === "masuk" ? "barang_masuk" : "barang_keluar",
        message: `${jenis_transaksi === "masuk" ? "Added" : "Sold"} ${jumlah} unit of ${barang.nama_barang}`,
        id_user,
        id_barang,
        metadata: {
          kode_transaksi,
          jumlah,
          stok_after: barang.stok_current,
        },
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({ message: "Transaksi berhasil dibuat", transaksi });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByPk(req.params.id, {
      include: [
        { model: Barang, attributes: ["nama_barang"] },
        { model: User, attributes: ["username", "nama_lengkap"] },
        { model: Supplier, attributes: ["nama_supplier"] },
      ],
    });
    if (!transaksi)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Transaction
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      id_barang,
      id_supplier,
      jenis_transaksi,
      jumlah,
      keterangan,
      edit_reason,
    } = req.body;
    const id_user = req.user.id_user;

    // Find existing transaction
    const existingTransaksi = await Transaksi.findByPk(id, { transaction: t });
    if (!existingTransaksi) {
      await t.rollback();
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Get barang
    const barang = await Barang.findByPk(id_barang, { transaction: t });
    if (!barang) {
      await t.rollback();
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    // Reverse old transaction stock impact
    if (existingTransaksi.jenis_transaksi === "masuk") {
      barang.stok_current -= existingTransaksi.jumlah;
    } else {
      barang.stok_current += existingTransaksi.jumlah;
    }

    // Apply new transaction stock impact
    if (jenis_transaksi === "keluar") {
      if (barang.stok_current < jumlah) {
        await t.rollback();
        return res.status(400).json({ message: "Stok tidak mencukupi" });
      }
      barang.stok_current -= jumlah;
    } else if (jenis_transaksi === "masuk") {
      barang.stok_current += parseInt(jumlah);
    }

    await barang.save({ transaction: t });

    // Update transaction with edit tracking
    await existingTransaksi.update(
      {
        id_barang,
        id_supplier: jenis_transaksi === "masuk" ? id_supplier : null,
        jenis_transaksi,
        jumlah,
        keterangan,
        edited_by: id_user,
        edited_at: new Date(),
        edit_reason: edit_reason || "No reason provided",
      },
      { transaction: t },
    );

    // Create Activity Log for Edit
    await ActivityLog.create(
      {
        type: "user_updated",
        message: `Edited transaction ${existingTransaksi.kode_transaksi}: ${barang.nama_barang} (${jenis_transaksi}) - Reason: ${edit_reason}`,
        id_user,
        id_barang,
        metadata: {
          kode_transaksi: existingTransaksi.kode_transaksi,
          old_jumlah: existingTransaksi.jumlah,
          new_jumlah: jumlah,
          edit_reason,
        },
      },
      { transaction: t },
    );

    await t.commit();

    // Fetch updated transaction with associations
    const updatedTransaksi = await Transaksi.findByPk(id, {
      include: [
        { model: Barang, attributes: ["nama_barang"] },
        { model: User, attributes: ["username", "nama_lengkap"] },
        { model: Supplier, attributes: ["nama_supplier"] },
      ],
    });

    res.json({
      message: "Transaksi berhasil diupdate",
      data: updatedTransaksi,
    });
  } catch (error) {
    await t.rollback();
    console.error("Update transaction error:", error);
    res.status(500).json({ message: error.message });
  }
};
