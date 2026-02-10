const { User, sequelize } = require("../models");
const bcrypt = require("bcrypt");

const resetPassword = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const username = "owner"; // Target username
    const newPassword = "123456"; // Default reset password

    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log(`User '${username}' not found.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(
      `Password for '${username}' has been reset to '${newPassword}'`,
    );
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    process.exit();
  }
};

resetPassword();
