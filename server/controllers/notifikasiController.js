const { Notifikasi, Barang } = require("../models");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notifikasi.findAll({
      where: { id_user_tujuan: req.user.id_user },
      include: [{ model: Barang, attributes: ["nama_barang"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notifikasi.update(
      { status_baca: true },
      {
        where: {
          id_notifikasi: req.params.id,
          id_user_tujuan: req.user.id_user,
        },
      },
    );
    res.json({ message: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
