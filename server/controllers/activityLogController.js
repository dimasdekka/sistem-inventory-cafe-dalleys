const { ActivityLog, User, Barang } = require("../models");
const { Op } = require("sequelize");

// Get activity logs with filters
exports.getActivityLogs = async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    let whereClause = {};
    if (type && type !== "all") {
      whereClause.type = type;
    }

    const activities = await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["nama_lengkap", "username"],
          paranoid: false,
        },
        {
          model: Barang,
          attributes: ["nama_barang"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create activity log (helper function)
exports.createActivityLog = async (
  type,
  message,
  userId,
  barangId = null,
  metadata = null,
) => {
  try {
    await ActivityLog.create({
      type,
      message,
      id_user: userId,
      id_barang: barangId,
      metadata,
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
};
