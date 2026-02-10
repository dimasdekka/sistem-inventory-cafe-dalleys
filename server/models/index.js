const sequelize = require("../config/database");
const User = require("./User");
const Kategori = require("./Kategori");
const Satuan = require("./Satuan");
const Supplier = require("./Supplier");
const Barang = require("./Barang");
const Transaksi = require("./Transaksi");
const Notifikasi = require("./Notifikasi");
const Laporan = require("./Laporan");
const ActivityLog = require("./ActivityLog");

// Relasi Barang
Barang.belongsTo(Kategori, { foreignKey: "id_kategori", onDelete: "RESTRICT" });
Kategori.hasMany(Barang, { foreignKey: "id_kategori" });

Barang.belongsTo(Satuan, { foreignKey: "id_satuan", onDelete: "RESTRICT" });
Satuan.hasMany(Barang, { foreignKey: "id_satuan" });

// Relasi Transaksi
Transaksi.belongsTo(Barang, { foreignKey: "id_barang", onDelete: "CASCADE" });
Barang.hasMany(Transaksi, { foreignKey: "id_barang" });

Transaksi.belongsTo(User, { foreignKey: "id_user", onDelete: "RESTRICT" });
User.hasMany(Transaksi, { foreignKey: "id_user" });

Transaksi.belongsTo(Supplier, {
  foreignKey: "id_supplier",
  onDelete: "SET NULL",
});
Supplier.hasMany(Transaksi, { foreignKey: "id_supplier" });

// Relasi Editor Transaksi
Transaksi.belongsTo(User, {
  foreignKey: "edited_by",
  as: "Editor",
  onDelete: "SET NULL",
});

// Relasi Notifikasi
Notifikasi.belongsTo(Barang, { foreignKey: "id_barang", onDelete: "CASCADE" });
Barang.hasMany(Notifikasi, { foreignKey: "id_barang" });

Notifikasi.belongsTo(User, {
  foreignKey: "id_user_tujuan",
  onDelete: "CASCADE",
});
User.hasMany(Notifikasi, { foreignKey: "id_user_tujuan" });

// Relasi Laporan
Laporan.belongsTo(User, {
  foreignKey: "id_user_pembuat",
  onDelete: "RESTRICT",
});
User.hasMany(Laporan, { foreignKey: "id_user_pembuat" });

// Relasi ActivityLog
ActivityLog.belongsTo(User, { foreignKey: "id_user", onDelete: "SET NULL" });
User.hasMany(ActivityLog, { foreignKey: "id_user" });

ActivityLog.belongsTo(Barang, {
  foreignKey: "id_barang",
  onDelete: "SET NULL",
});
Barang.hasMany(ActivityLog, { foreignKey: "id_barang" });

module.exports = {
  sequelize,
  User,
  Kategori,
  Satuan,
  Supplier,
  Barang,
  Transaksi,
  Notifikasi,
  Laporan,
  ActivityLog,
};
