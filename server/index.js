const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Routes Import
const authRoutes = require("./routes/authRoutes");
const masterRoutes = require("./routes/masterRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const notifikasiRoutes = require("./routes/notifikasiRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const backupRoutes = require("./routes/backupRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "http://localhost:5000",
          "http://localhost:5173",
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply rate limiting
app.use("/api/", apiLimiter);

// Routes Registration
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api", adminRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API Caffe Dalley is running...");
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Sync models
    await sequelize.sync();
    console.log("Database synced.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();
