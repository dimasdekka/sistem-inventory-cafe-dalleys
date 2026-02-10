const { User, ActivityLog } = require("../models");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, role, nama_lengkap } = req.body;

    // Authorization check
    // Owner can create Admin and Staff
    // Admin can create Staff
    if (req.user.role === "admin" && role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin cannot create another Admin" });
    }
    if (req.user.role === "admin" && role === "owner") {
      return res.status(403).json({ message: "Admin cannot create Owner" });
    }
    if (req.user.role === "staff") {
      return res.status(403).json({ message: "Staff cannot create users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      nama_lengkap,
    });

    // Create Activity Log
    await ActivityLog.create({
      type: "user_created",
      message: `New ${role} created: ${nama_lengkap} (@${username})`,
      id_user: req.user.id_user,
      metadata: {
        created_user_id: newUser.id_user,
        created_username: username,
        created_role: role,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { username, role, nama_lengkap },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Username already exists. Please choose a different one.",
      });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findByPk(id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Prevent deleting self
    if (targetUser.id_user === req.user.id_user) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Owner can delete anyone (except self)
    // Admin can only delete Staff
    if (
      req.user.role === "admin" &&
      (targetUser.role === "admin" || targetUser.role === "owner")
    ) {
      return res
        .status(403)
        .json({ message: "Admin can only delete Staff accounts" });
    }

    // Create Activity Log before deletion
    await ActivityLog.create({
      type: "user_deleted",
      message: `Deleted ${targetUser.role}: ${targetUser.nama_lengkap} (@${targetUser.username})`,
      id_user: req.user.id_user,
      metadata: {
        deleted_user_id: targetUser.id_user,
        deleted_username: targetUser.username,
        deleted_role: targetUser.role,
      },
    });

    await targetUser.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        message:
          "Cannot delete user because they have related data (transactions, etc.).",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, nama_lengkap } = req.body;
    const targetUser = await User.findByPk(id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Authorization checks similar to create/delete
    if (
      req.user.role === "admin" &&
      (targetUser.role === "admin" || targetUser.role === "owner")
    ) {
      return res
        .status(403)
        .json({ message: "Admin cannot edit Admin or Owner accounts" });
    }

    // Track changes for activity log
    const changes = [];
    if (username && username !== targetUser.username)
      changes.push(`username to ${username}`);
    if (nama_lengkap && nama_lengkap !== targetUser.nama_lengkap)
      changes.push(`name to ${nama_lengkap}`);
    if (role && role !== targetUser.role)
      changes.push(`role from ${targetUser.role} to ${role}`);
    if (password) changes.push("password");

    // Update fields
    if (username) targetUser.username = username;
    if (nama_lengkap) targetUser.nama_lengkap = nama_lengkap;
    if (role) {
      if (req.user.role === "admin" && (role === "admin" || role === "owner")) {
        return res
          .status(403)
          .json({ message: "Admin cannot promote to Admin or Owner" });
      }
      targetUser.role = role;
    }
    if (password) {
      targetUser.password = await bcrypt.hash(password, 10);
    }

    // Handle Profile Photo
    if (req.file) {
      targetUser.foto_profil = `/uploads/${req.file.filename}`;
      changes.push("profile photo");
    }

    await targetUser.save();

    // Create Activity Log
    if (changes.length > 0) {
      await ActivityLog.create({
        type: "user_updated",
        message: `Updated user ${targetUser.nama_lengkap}: ${changes.join(", ")}`,
        id_user: req.user.id_user,
        metadata: {
          updated_user_id: targetUser.id_user,
          updated_username: targetUser.username,
          changes: changes,
        },
      });
    }

    res.json({ message: "User updated successfully", user: targetUser });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, password } = req.body;
    const user = await User.findByPk(req.user.id_user);

    if (nama_lengkap) user.nama_lengkap = nama_lengkap;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Handle Profile Photo
    if (req.file) {
      user.foto_profil = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        foto_profil: user.foto_profil,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.restore();

    // Create Activity Log
    await ActivityLog.create({
      type: "user_updated",
      message: `Restored user: ${user.nama_lengkap} (@${user.username})`,
      id_user: req.user.id_user,
      metadata: {
        restored_user_id: user.id_user,
        restored_username: user.username,
        restored_role: user.role,
      },
    });

    res.json({ message: "User restored successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { deletedAt: { [require("sequelize").Op.not]: null } },
      paranoid: false,
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
