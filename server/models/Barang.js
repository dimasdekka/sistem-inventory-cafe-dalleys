const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Barang = sequelize.define(
  "Barang",
  {
    id_barang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_kategori: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_satuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stok_current: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stok_minimum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stok_maksimum: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Barang;
