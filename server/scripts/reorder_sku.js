const { sequelize } = require("../models");

async function reorderSku() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // SQL to move 'sku' after 'id_barang'
    // Note: 'AFTER id_barang' is valid MySQL syntax
    const query =
      "ALTER TABLE Barang MODIFY COLUMN sku VARCHAR(255) AFTER id_barang;";

    await sequelize.query(query);
    console.log("Successfully reordered 'sku' column after 'id_barang'.");
  } catch (error) {
    console.error("Error reordering column:", error);
  } finally {
    await sequelize.close();
  }
}

reorderSku();
