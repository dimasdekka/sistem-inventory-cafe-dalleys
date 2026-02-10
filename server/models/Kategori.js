const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kategori = sequelize.define(
  "Kategori",
  {
    id_kategori: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Kategori;
