const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notifikasi = sequelize.define(
  "Notifikasi",
  {
    id_notifikasi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_barang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user_tujuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_notifikasi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "general",
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status_baca: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Notifikasi;
