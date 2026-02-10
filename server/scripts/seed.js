const { sequelize, User, Kategori, Satuan } = require("../models");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    await sequelize.sync({ alter: true });

    // Seed Users
    const passwordHash = await bcrypt.hash("123456", 10);

    await User.bulkCreate(
      [
        {
          username: "owner",
          password: passwordHash,
          role: "owner",
          nama_lengkap: "Owner Coffee",
        },
        {
          username: "admin",
          password: passwordHash,
          role: "admin",
          nama_lengkap: "Admin Gudang",
        },
        {
          username: "barista",
          password: passwordHash,
          role: "staff",
          nama_lengkap: "Staff Barista",
        },
      ],
      { updateOnDuplicate: ["username"] },
    );

    console.log("Users seeded");

    // Seed Kategori
    await Kategori.bulkCreate(
      [
        { nama_kategori: "Biji Kopi", deskripsi: "Berbagai jenis biji kopi" },
        { nama_kategori: "Susu", deskripsi: "Susu segar dan kental manis" },
        { nama_kategori: "Syrup", deskripsi: "Perasa tambahan" },
        { nama_kategori: "Powder", deskripsi: "Bubuk minuman" },
        { nama_kategori: "Cup", deskripsi: "Gelas plastik dan kertas" },
      ],
      { updateOnDuplicate: ["nama_kategori"] },
    );

    console.log("Kategori seeded");

    // Seed Satuan
    await Satuan.bulkCreate(
      [
        { nama_satuan: "Kilogram", simbol: "kg" },
        { nama_satuan: "Gram", simbol: "gr" },
        { nama_satuan: "Liter", simbol: "L" },
        { nama_satuan: "Mililiter", simbol: "ml" },
        { nama_satuan: "Pieces", simbol: "pcs" },
        { nama_satuan: "Pack", simbol: "pck" },
      ],
      { updateOnDuplicate: ["nama_satuan"] },
    );

    console.log("Satuan seeded");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
