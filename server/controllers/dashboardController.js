const {
  Transaksi,
  Barang,
  User,
  Kategori,
  Supplier,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

exports.getStats = async (req, res) => {
  try {
    // Get period from query parameter (default to 7 days)
    const period = parseInt(req.query.period) || 7;
    const daysToShow = period === 30 ? 30 : 7;

    const totalItems = await Barang.count();
    const lowStockItems = await Barang.count({
      where: {
        stok_current: { [Op.lte]: sequelize.col("stok_minimum") },
      },
    });

    // Count today's transactions (local time calculation)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const transactionsToday = await Transaksi.count({
      where: {
        tanggal_transaksi: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const { Kategori, Supplier } = require("../models");

    const totalCategories = await Kategori.count();
    const totalSuppliers = await Supplier.count();
    const totalUsers = await User.count();
    const totalTransactions = await Transaksi.count();

    // Dynamic Date Range based on period
    const todayDate = new Date();
    const periodStartDate = new Date();
    periodStartDate.setDate(todayDate.getDate() - (daysToShow - 1));
    periodStartDate.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const transactionsInPeriod = await Transaksi.count({
      where: {
        jenis_transaksi: "masuk",
        tanggal_transaksi: { [Op.between]: [periodStartDate, endOfToday] },
      },
    });

    const transactionsOutPeriod = await Transaksi.count({
      where: {
        jenis_transaksi: "keluar",
        tanggal_transaksi: { [Op.between]: [periodStartDate, endOfToday] },
      },
    });

    // Chart Data (Dynamic period)
    const chartData = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0,
      );
      const end = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
      );

      const countAll = await Transaksi.count({
        where: { tanggal_transaksi: { [Op.between]: [start, end] } },
      });
      const countIn = await Transaksi.count({
        where: {
          jenis_transaksi: "masuk",
          tanggal_transaksi: { [Op.between]: [start, end] },
        },
      });
      const countOut = await Transaksi.count({
        where: {
          jenis_transaksi: "keluar",
          tanggal_transaksi: { [Op.between]: [start, end] },
        },
      });

      chartData.push({
        date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        all: countAll,
        masuk: countIn,
        keluar: countOut,
      });
    }

    res.json({
      totalBarang: totalItems,
      totalMasuk: transactionsInPeriod,
      totalKeluar: transactionsOutPeriod,
      lowStockCount: lowStockItems,
      transactionsToday,
      totalCategories,
      totalSuppliers,
      totalUsers,
      totalTransactions,
      chartData,
      period: daysToShow,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};
