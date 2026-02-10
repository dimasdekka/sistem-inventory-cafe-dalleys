const { User, ActivityLog } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    const accessToken = jwt.sign(
      { id_user: user.id_user, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create Activity Log for Login
    await ActivityLog.create({
      type: "login",
      message: `${user.nama_lengkap} logged in`,
      id_user: user.id_user,
      metadata: {
        username: user.username,
        role: user.role,
      },
    });

    res.json({
      message: "Login berhasil",
      accessToken,
      user: {
        id_user: user.id_user,
        username: user.username,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, password } = req.body;
    const updateData = { nama_lengkap };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.update(updateData, {
      where: { id_user: req.user.id_user },
    });

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user);

    if (user) {
      // Create Activity Log for Logout
      await ActivityLog.create({
        type: "logout",
        message: `${user.nama_lengkap} logged out`,
        id_user: user.id_user,
        metadata: {
          username: user.username,
          role: user.role,
        },
      });
    }

    res.json({ message: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
