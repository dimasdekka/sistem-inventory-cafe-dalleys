import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LowStockNotification = ({ items, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!items || items.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-6 z-50 w-96 bg-gradient-to-br from-red-900/95 to-red-950/95 backdrop-blur-lg border-2 border-red-500 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500 rounded-lg animate-pulse">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Low Stock Alert
                </h3>
                <p className="text-xs text-red-200">
                  {items.length} item{items.length > 1 ? "s" : ""} need
                  attention
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-red-500/30 rounded transition-colors"
            >
              <X size={18} className="text-red-200" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-2">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item.id_barang}
                  className="bg-red-950/50 border border-red-500/30 rounded-lg p-3 hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">
                        {item.nama_barang}
                      </p>
                      <p className="text-xs text-red-200 mt-0.5">
                        {item.Kategori?.nama_kategori}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">
                        {item.stok_current}
                      </p>
                      <p className="text-xs text-red-300">
                        Min: {item.stok_minimum}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {items.length > 5 && (
                <p className="text-center text-xs text-red-300 pt-2">
                  +{items.length - 5} more items...
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-red-950/50 border-t border-red-500/30 px-4 py-2">
            <p className="text-xs text-red-200 text-center">
              Please restock these items soon
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LowStockNotification;
