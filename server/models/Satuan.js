const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Satuan = sequelize.define(
  "Satuan",
  {
    id_satuan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_satuan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    simbol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Satuan;
