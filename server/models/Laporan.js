const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Laporan = sequelize.define(
  "Laporan",
  {
    id_laporan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jenis_laporan: {
      type: DataTypes.STRING, // e.g., 'barang_masuk', 'barang_keluar', 'stok'
      allowNull: false,
    },
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_akhir: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_user_pembuat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Laporan;
