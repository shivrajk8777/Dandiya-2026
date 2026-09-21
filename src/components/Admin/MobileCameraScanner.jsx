"use client";
import React, { useEffect, useRef, useState } from "react";
import { Camera, Image, X, RefreshCw, Sparkles, CheckCircle2, Zap, AlertCircle, QrCode, Search, UserCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function MobileCameraScanner({ onScanResult, onCloseScanner }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [autoKeepAlive, setAutoKeepAlive] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [scanningStatus, setScanningStatus] = useState("Initializing...");
  const [scanFlash, setScanFlash] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState("");
  const scannerRef = useRef(null);
  const directCamInputRef = useRef(null);
  const isProcessingRef = useRef(false);
  const elementId = "html5-mobile-qr-reader";

  const startCameraStream = async () => {
    setCameraError("");
    setScanningStatus("Requesting camera permission...");
    isProcessingRef.current = false;

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
          const size = Math.max(180, Math.floor(min * 0.75));
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

      try {
        await html5Qrcode.start({ facingMode: "environment" }, qrConfig, handleSuccess, () => {});
        setScanningStatus("⚡ Camera Active! Point camera at ticket QR code");
        return;
      } catch (err1) {
        console.warn("FacingMode environment failed, checking camera list:", err1);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const rearCam = cameras.find((c) => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("rear")) || cameras[0];
        await html5Qrcode.start(rearCam.id, qrConfig, handleSuccess, () => {});
        setScanningStatus("⚡ Camera Active! Point camera at ticket QR code");
      } else {
        throw new Error("No camera devices detected on this phone.");
      }
    } catch (err) {
      console.error("Camera start exception:", err);
      let msg = "Could not access mobile camera. ";
      if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        msg += "Mobile browsers block camera on unsecure HTTP links. Please use HTTPS or type Pass ID / Phone below!";
      } else {
        msg += "Please allow camera permission in your browser or type Pass ID / Phone below!";
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
          setCameraError("No QR Code detected in this photo. Please take a clearer photo or enter Pass ID manually.");
        });
    } catch (err) {
      console.error("File scanner error", err);
      setCameraError("Error reading image file: " + err.message);
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualCodeInput.trim()) return;
    onScanResult(manualCodeInput.trim());
    setManualCodeInput("");
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
    <div className="w-full bg-[#170733] border-2 border-amber-500/40 rounded-2xl p-3 sm:p-5 mb-4 text-center space-y-4">
      <div id="html5-file-qr-temp" className="hidden" />

      {/* Primary Camera & Snap Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Main Live Camera Button */}
          {!cameraActive ? (
            <button
              type="button"
              onClick={() => setCameraActive(true)}
              className="flex-1 py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 text-black fill-black animate-bounce shrink-0" />
              Open Live Camera Scanner ⚡
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

          {/* Quick Photo Upload Button */}
          <button
            type="button"
            onClick={() => directCamInputRef.current?.click()}
            className="py-3.5 px-4 rounded-xl font-bold text-xs text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            Upload QR / Photo
          </button>

          <input
            type="file"
            ref={directCamInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 pt-1 border-t border-white/10">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            Instant 0ms Gate Check-In Active
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

      {/* Permanent Live Camera Container with Laser Finder */}
      <div className={`space-y-3 ${cameraActive ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {scanningStatus}
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-black min-h-[260px] flex items-center justify-center shadow-2xl">
          {/* Corner Crosshairs */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 z-10" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 z-10" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 z-10" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 z-10" />

          {/* Red Laser Scanning Beam */}
          <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] z-10 animate-scan-laser pointer-events-none" />

          {scanFlash && (
            <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-sm z-20 flex items-center justify-center animate-out fade-out duration-500">
              <CheckCircle2 className="w-16 h-16 text-emerald-300 animate-bounce" />
            </div>
          )}
          <div id={elementId} className="w-full h-full min-h-[250px]" />
        </div>
      </div>

      {/* Manual Pass ID Input (Integrated inside scanner view so it's always accessible) */}
      <form onSubmit={handleManualSubmit} className="pt-2 border-t border-white/10 space-y-2">
        <label className="block text-left text-[11px] font-bold text-amber-300 uppercase tracking-wider">
          🔍 Pass ID / Phone Se Check-In Karein:
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pass ID Enter Karein (e.g. DND-RAAS-8942)"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
              className="w-full bg-[#110426] border border-amber-500/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCodeInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            Verify
          </button>
        </div>

        {/* 1-Tap Demo Test Pass Button for quick verification testing */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>Quick Demo Test Pass:</span>
          <button
            type="button"
            onClick={() => onScanResult("DND-RAAS-8942")}
            className="px-2 py-0.5 rounded bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-mono font-bold"
          >
            DND-RAAS-8942 (Click to Test)
          </button>
        </div>
      </form>

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            Camera Access Info
          </div>
          <p>{cameraError}</p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => directCamInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Use Camera Photo Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
