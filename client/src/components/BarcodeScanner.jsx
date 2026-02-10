import React, { useEffect, useRef, useState } from "react";
import { ScanBarcode, X, Camera, Keyboard } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BarcodeScanner = ({ onDetected, onClose }) => {
  const [barcode, setBarcode] = useState("");
  const [scanMode, setScanMode] = useState("manual"); // 'manual' or 'camera'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Cleanup scanner on unmount or mode change
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current
          .clear()
          .catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, []);

  // Initialize camera scanner when mode changes to camera
  useEffect(() => {
    if (scanMode === "camera" && scannerRef.current && !isScanning) {
      initializeCameraScanner();
    }
  }, [scanMode]);

  const initializeCameraScanner = () => {
    if (html5QrcodeScannerRef.current) {
      return; // Already initialized
    }

    try {
      setIsScanning(true);
      setCameraError(null);

      const html5QrcodeScanner = new Html5QrcodeScanner(
        "barcode-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
          formatsToSupport: [
            0, // QR_CODE
            1, // AZTEC
            2, // CODABAR
            3, // CODE_39
            4, // CODE_93
            5, // CODE_128
            6, // DATA_MATRIX
            7, // MAXICODE
            8, // ITF
            9, // EAN_13
            10, // EAN_8
            11, // PDF_417
            12, // RSS_14
            13, // RSS_EXPANDED
            14, // UPC_A
            15, // UPC_E
            16, // UPC_EAN_EXTENSION
          ],
        },
        false, // verbose
      );

      html5QrcodeScannerRef.current = html5QrcodeScanner;

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          // Success callback
          console.log("Barcode detected:", decodedText);
          onDetected(decodedText);

          // Stop scanning after successful detection
          html5QrcodeScanner
            .clear()
            .then(() => {
              html5QrcodeScannerRef.current = null;
              setIsScanning(false);
              onClose();
            })
            .catch((err) => console.error("Error clearing scanner:", err));
        },
        (errorMessage) => {
          // Error callback (called frequently, so we don't log it)
          // This is normal when no barcode is in view
        },
      );
    } catch (error) {
      console.error("Error initializing scanner:", error);
      setCameraError(
        "Failed to initialize camera. Please check permissions and try again.",
      );
      setIsScanning(false);
    }
  };

  // Manual input handlers
  useEffect(() => {
    if (scanMode === "manual" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  const handleChange = (e) => {
    setBarcode(e.target.value);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      onDetected(barcode);
      setBarcode("");
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && barcode.trim()) {
      onDetected(barcode);
      setBarcode("");
      onClose();
    }
  };

  const switchToManual = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current
        .clear()
        .then(() => {
          html5QrcodeScannerRef.current = null;
          setIsScanning(false);
          setScanMode("manual");
        })
        .catch((err) => {
          console.error("Error clearing scanner:", err);
          setScanMode("manual");
        });
    } else {
      setScanMode("manual");
    }
  };

  const switchToCamera = () => {
    setScanMode("camera");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <ScanBarcode className="text-primary" /> Scan Barcode
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={switchToManual}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
              scanMode === "manual"
                ? "bg-primary text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Keyboard size={18} />
            Manual Input
          </button>
          <button
            onClick={switchToCamera}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
              scanMode === "camera"
                ? "bg-primary text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Camera size={18} />
            Camera Scan
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {scanMode === "manual" ? (
            // Manual Input Mode
            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Use your physical barcode scanner or type manually.
              </p>

              <form onSubmit={handleManualSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="input-field text-center text-xl font-mono tracking-wider py-4"
                  placeholder="Scanning..."
                  autoFocus
                  onBlur={() => inputRef.current?.focus()}
                />
                <button type="submit" className="mt-4 w-full btn btn-primary">
                  Submit Manually
                </button>
              </form>
            </div>
          ) : (
            // Camera Scan Mode
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Position the barcode within the camera frame.
              </p>

              {cameraError ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <p className="text-red-400 text-sm">{cameraError}</p>
                  <button
                    onClick={() => {
                      setCameraError(null);
                      initializeCameraScanner();
                    }}
                    className="mt-3 btn btn-primary text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div
                  id="barcode-scanner-container"
                  className="rounded-lg overflow-hidden"
                  style={{ minHeight: "300px" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
