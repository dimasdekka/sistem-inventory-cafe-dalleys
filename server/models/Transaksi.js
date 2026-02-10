const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaksi = sequelize.define(
  "Transaksi",
  {
    id_transaksi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_transaksi: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    id_barang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_supplier: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jenis_transaksi: {
      type: DataTypes.ENUM("masuk", "keluar"),
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_transaksi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    edited_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of user who last edited this transaction",
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp of last edit",
    },
    edit_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reason for editing the transaction",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Transaksi;
