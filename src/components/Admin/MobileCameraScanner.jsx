"use client";
import React, { useEffect, useRef, useState } from "react";
import { Camera, Image, X, RefreshCw, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function MobileCameraScanner({ onScanResult, onCloseScanner }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanningStatus, setScanningStatus] = useState("Initializing...");
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isProcessingRef = useRef(false);
  const elementId = "html5-mobile-qr-reader";

  useEffect(() => {
    let html5Qrcode = null;

    if (cameraActive) {
      setCameraError("");
      setScanningStatus("Starting rear camera...");
      isProcessingRef.current = false;

      try {
        html5Qrcode = new Html5Qrcode(elementId);
        scannerRef.current = html5Qrcode;

        html5Qrcode
          .start(
            { facingMode: "environment" },
            {
              fps: 25, // Ultra-fast 25 FPS frame parsing
              qrbox: (w, h) => {
                const min = Math.min(w, h);
                const size = Math.max(180, Math.floor(min * 0.75));
                return { width: size, height: size };
              },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (isProcessingRef.current) return;
              isProcessingRef.current = true;

              // Fire callback IMMEDIATELY without waiting for camera stop delay
              onScanResult(decodedText);
              setCameraActive(false);

              // Stop camera asynchronously in background
              try {
                if (html5Qrcode && html5Qrcode.isScanning) {
                  html5Qrcode.stop().catch(() => {});
                }
              } catch (e) {}
            },
            () => {
              // Ignore unparsed frames
            }
          )
          .then(() => {
            setScanningStatus("⚡ Ready! Point camera at ticket QR code");
          })
          .catch((err) => {
            console.error("Camera start failed:", err);
            setCameraError(
              "Camera access denied or not supported on this browser. Please allow camera permissions or upload QR photo."
            );
            setCameraActive(false);
          });
      } catch (e) {
        console.error("Scanner init error:", e);
        setCameraError("Failed to initialize camera scanner: " + e.message);
        setCameraActive(false);
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [cameraActive, onScanResult]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError("");
    setScanningStatus("Scanning photo...");

    try {
      const html5Qrcode = new Html5Qrcode("html5-file-qr-temp");
      html5Qrcode
        .scanFile(file, true)
        .then((decodedText) => {
          onScanResult(decodedText);
        })
        .catch((err) => {
          console.warn("File scan error", err);
          setCameraError("No QR Code detected in this photo. Please take a clearer photo or use Live Camera.");
        });
    } catch (err) {
      console.error("File scanner error", err);
      setCameraError("Error reading image file: " + err.message);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setCameraActive(false);
      }).catch(() => setCameraActive(false));
    } else {
      setCameraActive(false);
    }
  };

  return (
    <div className="w-full bg-[#170733] border-2 border-amber-500/40 rounded-2xl p-3 sm:p-4 mb-4 text-center space-y-3">
      <div id="html5-file-qr-temp" className="hidden" />

      {!cameraActive ? (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Live Camera Button */}
            <button
              type="button"
              onClick={() => setCameraActive(true)}
              className="flex-1 py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 text-black fill-black animate-bounce" />
              Open Instant Camera Scanner ⚡
            </button>

            {/* Photo Upload / Camera Capture Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl font-bold text-xs text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Image className="w-4 h-4" />
              Upload QR / Photo
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>

          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
            Fast Scan Enabled (iOS & Android Compatible)
          </p>
        </div>
      ) : (
        /* Active Live Camera Viewfinder */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              {scanningStatus}
            </span>

            <button
              type="button"
              onClick={stopCamera}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold"
            >
              Close Camera
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-black min-h-[260px] flex items-center justify-center shadow-2xl">
            <div id={elementId} className="w-full h-full min-h-[250px]" />
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium text-left">
          ⚠️ {cameraError}
        </div>
      )}
    </div>
  );
}
