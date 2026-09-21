"use client";
import React, { useEffect, useRef, useState } from "react";
import { Camera, Image, X, RefreshCw, Sparkles, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function MobileCameraScanner({ onScanResult, onCloseScanner }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [autoKeepAlive, setAutoKeepAlive] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [scanningStatus, setScanningStatus] = useState("Initializing...");
  const [scanFlash, setScanFlash] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const directCamInputRef = useRef(null);
  const isProcessingRef = useRef(false);
  const elementId = "html5-mobile-qr-reader";

  const startCameraStream = async () => {
    setCameraError("");
    setScanningStatus("Requesting camera permission...");
    isProcessingRef.current = false;

    // Ensure DOM element is present before creating Html5Qrcode instance
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      setTimeout(startCameraStream, 100);
      return;
    }

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch (e) {}
      }

      const html5Qrcode = new Html5Qrcode(elementId, {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      });
      scannerRef.current = html5Qrcode;

      const qrConfig = {
        fps: 25,
        qrbox: (w, h) => {
          const min = Math.min(w, h);
          const size = Math.max(160, Math.floor(min * 0.75));
          return { width: size, height: size };
        },
        aspectRatio: 1.0
      };

      const handleSuccess = (decodedText) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        setScanFlash(true);
        setTimeout(() => setScanFlash(false), 800);

        onScanResult(decodedText);

        if (autoKeepAlive) {
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 1200);
        } else {
          setCameraActive(false);
          try {
            if (html5Qrcode && html5Qrcode.isScanning) {
              html5Qrcode.stop().catch(() => {});
            }
          } catch (e) {}
        }
      };

      // Try Environment (Rear) facing mode first
      try {
        await html5Qrcode.start({ facingMode: "environment" }, qrConfig, handleSuccess, () => {});
        setScanningStatus("⚡ Camera Active! Point at visitor's QR code");
        return;
      } catch (err1) {
        console.warn("FacingMode environment failed, checking camera list:", err1);
      }

      // Fallback: Query available video devices
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        // Find back camera if available, else use first camera
        const rearCam = cameras.find((c) => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("rear")) || cameras[0];
        await html5Qrcode.start(rearCam.id, qrConfig, handleSuccess, () => {});
        setScanningStatus("⚡ Camera Active! Point at visitor's QR code");
      } else {
        throw new Error("No camera devices detected on this phone.");
      }
    } catch (err) {
      console.error("Camera start exception:", err);
      let msg = "Could not access mobile camera. ";
      if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        msg += "Mobile browsers block camera on unsecure HTTP links. Please use HTTPS or use the 'Take Snap / Photo' button below!";
      } else {
        msg += "Please allow camera permission in your browser or use the 'Take Snap / Photo' button!";
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (cameraActive) {
      startCameraStream();
    } else {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
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
  }, [cameraActive]);

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
          setCameraError("No QR Code detected in this photo. Please take a clearer photo or try again.");
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

      {/* Control Action Buttons */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Live Camera Button */}
          {!cameraActive ? (
            <button
              type="button"
              onClick={() => setCameraActive(true)}
              className="flex-1 py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 text-black fill-black animate-bounce shrink-0" />
              Open Phone Camera Scanner ⚡
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-rose-300 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Close Live Camera
            </button>
          )}

          {/* Native Phone Camera Snap / Photo Upload Button (Guaranteed Fallback) */}
          <button
            type="button"
            onClick={() => directCamInputRef.current?.click()}
            className="py-3.5 px-4 rounded-xl font-bold text-xs text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            Take Quick Snap / Upload
          </button>

          {/* Hidden File / Camera Inputs */}
          <input
            type="file"
            ref={directCamInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 pt-1 border-t border-white/10">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            Instant 0ms Gate Verification
          </span>

          <button
            type="button"
            onClick={() => setAutoKeepAlive(!autoKeepAlive)}
            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all ${
              autoKeepAlive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                : "bg-white/10 text-slate-400 border-white/10"
            }`}
          >
            {autoKeepAlive ? "⚡ Non-Stop Mode ON" : "Single Scan Mode"}
          </button>
        </div>
      </div>

      {/* Permanent Live Camera Container in DOM (Avoids unmounted element bug) */}
      <div className={`space-y-3 ${cameraActive ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {scanningStatus}
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-black min-h-[260px] flex items-center justify-center shadow-2xl">
          {scanFlash && (
            <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-sm z-20 flex items-center justify-center animate-out fade-out duration-500">
              <CheckCircle2 className="w-16 h-16 text-emerald-300 animate-bounce" />
            </div>
          )}
          <div id={elementId} className="w-full h-full min-h-[250px]" />
        </div>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            Camera Access Notice
          </div>
          <p>{cameraError}</p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => directCamInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Use Quick Snap Camera Instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
