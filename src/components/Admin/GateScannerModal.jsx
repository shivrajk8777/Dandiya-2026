"use client";
import React, { useState } from "react";
import { X, QrCode, CheckCircle2, AlertTriangle, XCircle, Search, UserCheck, Sparkles, Volume2 } from "lucide-react";
import { checkInAttendee } from "@/lib/registrationService";

// Audio sound feedback helper using Web Audio API
const playTone = (type) => {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "success") {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === "warning") {
      osc.frequency.setValueAtTime(350, audioCtx.currentTime);
      osc.frequency.setValueAtTime(300, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.4);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Audio synthesis not available", e);
  }
};

import MobileCameraScanner from "./MobileCameraScanner";

export default function GateScannerModal({ isOpen, onClose, onCheckInDone }) {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  if (!isOpen) return null;

  const handleScanCode = async (rawCode) => {
    const clean = rawCode.trim();
    if (!clean) return;

    let passId = clean;
    if (clean.startsWith("{") && clean.includes("id")) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.id) passId = parsed.id;
      } catch {}
    }

    setLoading(true);
    setScanResult(null);

    try {
      const res = await checkInAttendee(passId, { name: "Super Admin", gate: "Admin Console", username: "admin" });

      if (res.success) {
        playTone("success");
        setScanResult({
          type: "success",
          title: "ENTRY APPROVED ✅",
          message: res.message,
          data: res.data
        });
        setRecentScans((prev) => [
          {
            id: passId,
            name: res.data?.fullName || "Guest",
            time: new Date().toLocaleTimeString(),
            status: "Approved",
            type: res.data?.passType
          },
          ...prev.slice(0, 9)
        ]);
        if (onCheckInDone) onCheckInDone();
      } else if (res.alreadyCheckedIn) {
        playTone("warning");
        setScanResult({
          type: "warning",
          title: "ALREADY CHECKED IN ⚠️",
          message: res.message,
          data: res.data
        });
      } else {
        playTone("error");
        setScanResult({
          type: "error",
          title: "INVALID PASS ❌",
          message: res.message || "Pass not found in system.",
          data: null
        });
      }
    } catch (err) {
      playTone("error");
      setScanResult({
        type: "error",
        title: "SYSTEM ERROR",
        message: err.message,
        data: null
      });
    } finally {
      setLoading(false);
      setInputCode("");
    }
  };

  const handleCheckIn = async (e) => {
    if (e) e.preventDefault();
    await handleScanCode(inputCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#120524] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            Gate Entry Verification
          </div>
          <h2 className="text-2xl font-black text-white">Attendee Check-In Scanner</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Scan QR code with phone camera, photo upload or type Pass ID / Phone.
          </p>
        </div>

        {/* Live Mobile Camera Scanner */}
        <MobileCameraScanner
          onScanResult={(scannedCode) => {
            setInputCode(scannedCode);
            handleScanCode(scannedCode);
          }}
        />

        {/* Input Form */}
        <form onSubmit={handleCheckIn} className="space-y-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Scan QR or Enter Pass ID (e.g. DND-RAAS-8942)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-[#1b0838] border-2 border-amber-500/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              {loading ? "Verifying..." : "Verify & Check-In"}
            </button>
          </div>
        </form>

        {/* Live Scan Result Alert Popup Modal */}
        {scanResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border-4 shadow-2xl space-y-5 text-center ${
                scanResult.type === "success"
                  ? "bg-[#0b1d12] border-emerald-500 text-emerald-100 shadow-emerald-500/30"
                  : scanResult.type === "warning"
                  ? "bg-[#231704] border-amber-500 text-amber-100 shadow-amber-500/30"
                  : "bg-[#24080e] border-rose-500 text-rose-100 shadow-rose-500/30"
              }`}
            >
              {/* Status Header Badge */}
              <div className="flex flex-col items-center justify-center gap-2">
                {scanResult.type === "success" && (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                )}
                {scanResult.type === "warning" && (
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                  </div>
                )}
                {scanResult.type === "error" && (
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-rose-400" />
                  </div>
                )}
                <h3 className="text-2xl font-black tracking-wide font-serif-royal mt-1">
                  {scanResult.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold opacity-90">{scanResult.message}</p>
              </div>

              {/* Guest Ticket Details Card */}
              {scanResult.data && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-3 text-left text-xs">
                  <div className="col-span-2 pb-2 border-b border-white/10">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Guest Name</span>
                    <div className="font-black text-white text-lg font-serif-royal">{scanResult.data.fullName}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pass Category</span>
                    <div className="font-bold text-amber-300 text-xs">{scanResult.data.passType}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Entry Allowed</span>
                    <div className="font-black text-emerald-400 text-sm">
                      {scanResult.data.quantity} {scanResult.data.quantity > 1 ? "Persons Entry" : "Person Entry"}
                    </div>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Pass Code</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{scanResult.data.passId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                      <span className="font-bold text-emerald-300 text-xs">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Giant OK Dismiss Button */}
              <button
                type="button"
                autoFocus
                onClick={() => setScanResult(null)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>OK - Next Scan ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent Scan History */}
        {recentScans.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Recent Gate Check-ins:
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {recentScans.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.type})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">{item.id}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
