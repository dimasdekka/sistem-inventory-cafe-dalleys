const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const addDeletedAt = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // Check table name, Sequelize with freezeTableName: true usually means 'User'
    // But sometimes it might be lowercase depending on DB config.
    // We will try 'User' first.

    // Using raw query to be safe or queryInterface if we had migrations setup properly
    // but here we use a script.

    const queryInterface = sequelize.getQueryInterface();

    // Check if column exists first to avoid error? Or just try adding
    try {
      await queryInterface.addColumn("User", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
      console.log("Added deletedAt column to User table.");
    } catch (err) {
      if (err.message.includes("Duplicate column name")) {
        console.log("Column deletedAt already exists.");
      } else {
        console.error(
          "Error adding column (trying 'User' table):",
          err.message,
        );
        // Fallback to 'Users' if 'User' failed?
        try {
          await queryInterface.addColumn("Users", "deletedAt", {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
          });
          console.log("Added deletedAt column to Users table.");
        } catch (err2) {
          console.error(
            "Error adding column (trying 'Users' table):",
            err2.message,
          );
        }
      }
    }
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    process.exit();
  }
};

addDeletedAt();
