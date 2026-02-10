import React from "react";
import { AlertTriangle, Info } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-gray-800 transform scale-100 transition-all">
        <div className="p-6 text-center space-y-4">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}
          >
            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium border border-gray-700"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                isDanger
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
