const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("../models");

exports.downloadBackup = async (req, res) => {
  try {
    // Allow owner, admin, and manajer
    if (!["owner", "admin", "manajer"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Only Owner/Admin/Manajer can create backups.",
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    const backupFileName = `backup_${timestamp}.sql`;
    const backupsDir = path.join(__dirname, "..", "backups");
    const backupPath = path.join(backupsDir, backupFileName);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Use Sequelize to export data as JSON (more reliable than mysqldump)
    try {
      const models = sequelize.models;
      const backup = {};

      // Export all tables
      for (const modelName in models) {
        const model = models[modelName];
        const data = await model.findAll({ raw: true });
        backup[modelName] = data;
      }

      // Write to file
      const jsonBackup = JSON.stringify(backup, null, 2);
      const jsonFileName = `backup_${timestamp}.json`;
      const jsonPath = path.join(backupsDir, jsonFileName);

      fs.writeFileSync(jsonPath, jsonBackup);

      // Send file for download
      res.download(jsonPath, jsonFileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          return res.status(500).json({ message: "Failed to download backup" });
        }

        // Delete the backup file after download
        setTimeout(() => {
          if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
          }
        }, 5000);
      });
    } catch (dbError) {
      console.error("Database export error:", dbError);
      return res.status(500).json({
        message: "Failed to export database",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ message: error.message });
  }
};
