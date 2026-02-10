const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("owner", "admin", "manajer", "staff"),
      allowNull: false,
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto_profil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    createdAt: "created_at",
    updatedAt: false,
    paranoid: true, // Enable soft deletes
  },
);

module.exports = User;
