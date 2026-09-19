"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Search,
  Download,
  QrCode,
  Database,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  LogOut,
  Users,
  IndianRupee,
  Ticket,
  UserCheck,
  Filter,
  Sparkles,
  Building2,
  User,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck
} from "lucide-react";
import {
  subscribeToRegistrations,
  updateStatus,
  checkInAttendee,
  deleteRegistration,
  exportRegistrationsToExcel
} from "@/lib/registrationService";
import FirebaseConfigModal from "./FirebaseConfigModal";
import GateScannerModal from "./GateScannerModal";
import SponsorManagerModal from "./SponsorManagerModal";
import GateStaffManagerModal, { getGateStaffUsers } from "./GateStaffManagerModal";
import MobileCameraScanner from "./MobileCameraScanner";

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

export default function AdminDashboard({ isOpen, onClose, onViewPass }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState(null); // "SUPER_ADMIN" or "GATE_STAFF"
  const [activeStaffUser, setActiveStaffUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Registrations state
  const [registrations, setRegistrations] = useState([]);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showGateStaffModal, setShowGateStaffModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Gate staff scanner state
  const [inputPassCode, setInputPassCode] = useState("");
  const [gateScanLoading, setGateScanLoading] = useState(false);
  const [gateScanResult, setGateScanResult] = useState(null);
  const [recentGateScans, setRecentGateScans] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const logged = sessionStorage.getItem("dandiya_admin_auth");
      const role = sessionStorage.getItem("dandiya_admin_role") || "SUPER_ADMIN";
      const staffRaw = sessionStorage.getItem("dandiya_gate_staff_active");

      if (logged === "true") {
        setIsAuthenticated(true);
        setAuthRole(role);
        if (role === "GATE_STAFF" && staffRaw) {
          try {
            setActiveStaffUser(JSON.parse(staffRaw));
          } catch (e) {}
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const unsubscribe = subscribeToRegistrations((data, isFb) => {
      setRegistrations(data);
      setIsFirebaseLive(isFb);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isAuthenticated, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Check Super Admin Login
    if (
      (u === "admin" && (p === "rangtarang2026" || p === "RangTarang@2026" || p === "admin2026" || p === "dandiya2026")) ||
      (u === "rangtarang" && (p === "rangtarang2026" || p === "RangTarang@2026"))
    ) {
      setIsAuthenticated(true);
      setAuthRole("SUPER_ADMIN");
      sessionStorage.setItem("dandiya_admin_auth", "true");
      sessionStorage.setItem("dandiya_admin_role", "SUPER_ADMIN");
      setAuthError("");
      return;
    }

    // 2. Check Gatekeeper Staff Login
    const staffList = getGateStaffUsers();
    const matchedStaff = staffList.find(
      (item) => item.username.toLowerCase() === u && item.password === p
    );

    if (matchedStaff) {
      setIsAuthenticated(true);
      setAuthRole("GATE_STAFF");
      setActiveStaffUser(matchedStaff);
      sessionStorage.setItem("dandiya_admin_auth", "true");
      sessionStorage.setItem("dandiya_admin_role", "GATE_STAFF");
      sessionStorage.setItem("dandiya_gate_staff_active", JSON.stringify(matchedStaff));
      setAuthError("");
      return;
    }

    setAuthError("Invalid Login ID or Password. Please check and try again.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthRole(null);
    setActiveStaffUser(null);
    sessionStorage.removeItem("dandiya_admin_auth");
    sessionStorage.removeItem("dandiya_admin_role");
    sessionStorage.removeItem("dandiya_gate_staff_active");
    setUsername("");
    setPassword("");
  };

  // Metrics calculation
  const totalRegistrations = registrations.length;
  const totalPasses = registrations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);
  const totalRevenue = registrations.reduce(
    (acc, r) => acc + (Number(r.totalAmount) || Number(r.unitPrice) || 0),
    0
  );
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const checkInPercent = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

  // Filtered registrations for Super Admin
  const filteredList = registrations.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.fullName?.toLowerCase().includes(q) ||
      item.phone?.includes(q) ||
      item.passId?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.transactionRef?.toLowerCase().includes(q) ||
      item.checkedByStaff?.toLowerCase().includes(q) ||
      item.checkedByGate?.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "ALL" || item.passType?.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CHECKED_IN" && item.checkedIn) ||
      (statusFilter === "NOT_CHECKED_IN" && !item.checkedIn) ||
      item.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    await updateStatus(id, newStatus);
    setActionLoading(false);
  };

  const handleCheckInToggle = async (passId) => {
    setActionLoading(true);
    await checkInAttendee(passId, { name: "Super Admin", gate: "Admin Console", username: "admin" });
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this registration record?")) {
      setActionLoading(true);
      await deleteRegistration(id);
      setActionLoading(false);
    }
  };

  // Gatekeeper Staff Check-in Handler
  const handleGateStaffCheckIn = async (e) => {
    if (e) e.preventDefault();
    const clean = inputPassCode.trim();
    if (!clean) return;

    let passId = clean;
    if (clean.startsWith("{") && clean.includes("id")) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.id) passId = parsed.id;
      } catch {}
    }

    setGateScanLoading(true);
    setGateScanResult(null);

    try {
      const res = await checkInAttendee(passId, activeStaffUser);

      if (res.success) {
        playTone("success");
        setGateScanResult({
          type: "success",
          title: "ENTRY APPROVED ✅",
          message: res.message,
          data: res.data
        });
        setRecentGateScans((prev) => [
          {
            id: passId,
            name: res.data?.fullName || "Guest",
            time: new Date().toLocaleTimeString(),
            status: "Approved",
            type: res.data?.passType,
            gate: activeStaffUser?.gate || "Gate 1"
          },
          ...prev.slice(0, 9)
        ]);
      } else if (res.alreadyCheckedIn) {
        playTone("warning");
        setGateScanResult({
          type: "warning",
          title: "ALREADY CHECKED IN ⚠️",
          message: res.message,
          data: res.data
        });
      } else {
        playTone("error");
        setGateScanResult({
          type: "error",
          title: "INVALID PASS ❌",
          message: res.message || "Pass not found in system.",
          data: null
        });
      }
    } catch (err) {
      playTone("error");
      setGateScanResult({
        type: "error",
        title: "SYSTEM ERROR",
        message: err.message,
        data: null
      });
    } finally {
      setGateScanLoading(false);
      setInputPassCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-7xl w-full bg-[#0d041c] border border-amber-500/40 rounded-3xl p-3.5 sm:p-7 shadow-2xl my-2 sm:my-4 max-h-[95vh] flex flex-col overflow-hidden">
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. LOGIN GATE VIEW (UNAUTHENTICATED) */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 text-center p-5 sm:p-8 bg-[#160628] border border-amber-500/30 rounded-3xl shadow-2xl w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-3.5">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 font-serif-royal">Portal Login</h2>
            <p className="text-xs text-slate-400 mb-5">
              Enter Admin ID or Gate Staff ID to log in
            </p>

            <form onSubmit={handleLogin} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  User / Login ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Enter Admin ID or Gate Staff ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    required
                    className="w-full bg-[#0d0316] border border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0d0316] border border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
                  ⚠️ {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-1"
              >
                Sign In to Portal
              </button>
            </form>
          </div>
        ) : authRole === "GATE_STAFF" ? (
          /* 2. GATE STAFF CHECK-IN PORTAL */
          <div className="flex flex-col h-full overflow-y-auto max-w-3xl mx-auto w-full p-2">
            {/* Staff Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-serif-royal">
                    Gate Check-in Staff Portal
                  </h2>
                  <p className="text-xs text-amber-300 font-medium">
                    Staff: <strong className="text-white">{activeStaffUser?.name || "Gate Staff"}</strong> • 📍 {activeStaffUser?.gate || "Main Gate"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

            {/* Quick Check-in Counter Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c0836] to-[#0f0320] border border-amber-500/30 mb-5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Tonight's Gate Attendance</span>
                <div className="text-2xl font-black text-emerald-400 font-serif-royal">
                  {checkedInCount} <span className="text-xs font-normal text-slate-400">/ {totalRegistrations} Passes</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  🟢 Gate Scanner Active
                </span>
              </div>
            </div>

            {/* Live Mobile Camera Scanner for Gate Staff */}
            <MobileCameraScanner
              onScanResult={(scannedCode) => {
                setInputPassCode(scannedCode);
                let passId = scannedCode;
                if (scannedCode.startsWith("{") && scannedCode.includes("id")) {
                  try {
                    const parsed = JSON.parse(scannedCode);
                    if (parsed.id) passId = parsed.id;
                  } catch {}
                }
                setGateScanLoading(true);
                setGateScanResult(null);
                checkInAttendee(passId, activeStaffUser).then((res) => {
                  if (res.success) {
                    playTone("success");
                    setGateScanResult({ type: "success", title: "ENTRY APPROVED ✅", message: res.message, data: res.data });
                    setRecentGateScans((prev) => [{ id: passId, name: res.data?.fullName || "Guest", time: new Date().toLocaleTimeString(), status: "Approved", type: res.data?.passType, gate: activeStaffUser?.gate || "Gate 1" }, ...prev.slice(0, 9)]);
                  } else if (res.alreadyCheckedIn) {
                    playTone("warning");
                    setGateScanResult({ type: "warning", title: "ALREADY CHECKED IN ⚠️", message: res.message, data: res.data });
                  } else {
                    playTone("error");
                    setGateScanResult({ type: "error", title: "INVALID PASS ❌", message: res.message || "Pass not found in system.", data: null });
                  }
                }).finally(() => {
                  setGateScanLoading(false);
                  setInputPassCode("");
                });
              }}
            />

            {/* Main Pass Scanner Input */}
            <form onSubmit={handleGateStaffCheckIn} className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Scan QR Code or Type Pass ID / Phone Number *
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-amber-400 absolute left-4 top-4" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Scan QR or Enter Pass ID (e.g. DND-RAAS-8942)"
                  value={inputPassCode}
                  onChange={(e) => setInputPassCode(e.target.value)}
                  className="w-full bg-[#180733] border-2 border-amber-500/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={gateScanLoading || !inputPassCode.trim()}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5 text-black" />
                {gateScanLoading ? "Verifying Gate Entry..." : "Verify & Approve Entry"}
              </button>
            </form>

            {/* Live Scan Result Banner */}
            {gateScanResult && (
              <div
                className={`p-5 rounded-2xl border-2 mb-6 transition-all ${gateScanResult.type === "success"
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-xl shadow-emerald-500/20 animate-fade-in"
                    : gateScanResult.type === "warning"
                      ? "bg-amber-950/70 border-amber-500 text-amber-100 shadow-xl shadow-amber-500/20 animate-fade-in"
                      : "bg-rose-950/70 border-rose-500 text-rose-100 shadow-xl shadow-rose-500/20 animate-fade-in"
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {gateScanResult.type === "success" && (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 animate-bounce" />
                  )}
                  {gateScanResult.type === "warning" && (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  )}
                  {gateScanResult.type === "error" && (
                    <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xl font-black tracking-wide font-serif-royal">{gateScanResult.title}</h3>
                    <p className="text-xs opacity-90">{gateScanResult.message}</p>
                  </div>
                </div>

                {gateScanResult.data && (
                  <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="opacity-70">Guest Name:</span>
                      <div className="font-bold text-white text-base font-serif-royal">{gateScanResult.data.fullName}</div>
                    </div>
                    <div>
                      <span className="opacity-70">Pass Category:</span>
                      <div className="font-bold text-amber-300 text-sm">{gateScanResult.data.passType}</div>
                    </div>
                    <div>
                      <span className="opacity-70">Quantity:</span>
                      <div className="font-bold text-white text-sm">
                        {gateScanResult.data.quantity} {gateScanResult.data.quantity > 1 ? "Persons" : "Person"}
                      </div>
                    </div>
                    <div>
                      <span className="opacity-70">Pass ID:</span>
                      <div className="font-mono font-bold text-amber-400 text-sm">{gateScanResult.data.passId}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gate Scanner History */}
            {recentGateScans.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Check-ins at Gate:
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {recentGateScans.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-slate-400 ml-2">({item.type})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-amber-400">{item.id}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 3. SUPER ADMIN DASHBOARD */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3 pr-8">
              <div className="flex items-center gap-3">
                <img
                  src="/rang-tarang-logo.png"
                  alt="Rang Tarang Garba"
                  className="w-10 h-10 object-contain bg-black/40 rounded-xl p-1 border border-amber-400/30 shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black text-white font-serif-royal">
                      RANG TARANG <span className="gold-foil-text font-sans-modern font-black">GARBA Admin</span>
                    </h2>
                    <span
                      className={`text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${isFirebaseLive
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      {isFirebaseLive ? "Firebase Live" : "Local Mode"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time attendee database, gate staff manager & revenue control
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Gate Staff Users Manager */}
                <button
                  onClick={() => setShowGateStaffModal(true)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Gate Staff Logins
                </button>

                <button
                  onClick={() => setShowSponsorModal(true)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Manage Sponsors
                </button>

                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black uppercase text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Gate Scanner
                </button>

                <button
                  onClick={() => exportRegistrationsToExcel(registrations)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Excel
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 bg-white/5 rounded-xl border border-white/10"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 mb-3">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Bookings
                  </div>
                  <div className="text-base sm:text-xl font-black text-white">
                    {totalRegistrations}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Passes Sold
                  </div>
                  <div className="text-base sm:text-xl font-black text-white">{totalPasses}</div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Collection
                  </div>
                  <div className="text-base sm:text-xl font-black text-emerald-400">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Checked In
                  </div>
                  <div className="text-base sm:text-xl font-black text-white">
                    {checkedInCount} ({checkInPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-3 bg-[#140626] p-2 sm:p-2.5 rounded-2xl border border-white/5">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search attendee, phone, pass ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0314] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#0b0314] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Silver">Silver General</option>
                  <option value="Gold">Gold Couple</option>
                  <option value="Platinum">Platinum VIP</option>
                  <option value="Diamond">Diamond Emperor</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0b0314] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="NOT_CHECKED_IN">Not Checked In</option>
                </select>
              </div>
            </div>

            {/* Registrations Data Table */}
            <div className="flex-1 overflow-auto border border-white/10 rounded-2xl bg-[#0c0316] w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead className="bg-[#18062e] text-slate-300 font-bold sticky top-0 z-10 border-b border-white/10">
                  <tr>
                    <th className="p-3">Pass ID & Attendee</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Tier & Qty</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Gate Check-In</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No registrations matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Pass ID & Attendee */}
                        <td className="p-3">
                          <div className="font-bold text-white text-sm font-serif-royal">{item.fullName}</div>
                          <div className="font-mono text-[11px] text-amber-400 font-semibold">
                            {item.passId}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.city || "N/A"}</div>
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <div className="font-medium text-white">{item.phone}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {item.email || "—"}
                          </div>
                        </td>

                        {/* Tier & Qty */}
                        <td className="p-3">
                          <span className="font-semibold text-amber-300">{item.passType}</span>
                          <div className="text-[10px] text-slate-400">
                            {item.quantity} {item.quantity > 1 ? "Persons" : "Person"}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-3 font-bold text-emerald-400">
                          ₹{item.totalAmount || item.unitPrice}
                        </td>

                        {/* Payment */}
                        <td className="p-3">
                          <div className="text-slate-300">{item.paymentMethod || "UPI"}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[90px]">
                            {item.transactionRef || "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <select
                            value={item.status || "Approved"}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={actionLoading}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold border focus:outline-none ${item.status === "Approved"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : item.status === "Pending"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                              }`}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Gate Check-In */}
                        <td className="p-3">
                          {item.checkedIn ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Checked In
                              </span>
                              <div className="text-[10px] text-amber-300 font-bold mt-1">
                                By: {item.checkedByStaff || "Super Admin"}
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium">
                                📍 {item.checkedByGate || "Main Gate"} • {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : ""}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCheckInToggle(item.passId)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                            >
                              Check-In Gate
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (onViewPass) onViewPass(item);
                            }}
                            className="p-1.5 text-slate-300 hover:text-amber-400 bg-white/5 rounded-lg border border-white/10"
                            title="View / Print Digital Pass"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg border border-white/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer info */}
            <div className="flex flex-wrap items-center justify-between pt-2 text-[10px] sm:text-[11px] text-slate-400">
              <div>
                Showing <strong className="text-white">{filteredList.length}</strong> of {registrations.length} registrations
              </div>
              <div className="text-slate-500">
                RANG TARANG GARBA Control v2.6
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub Modals */}
      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        onConfigSaved={(live) => setIsFirebaseLive(live)}
      />

      <GateScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onCheckInDone={() => { }}
      />

      <SponsorManagerModal
        isOpen={showSponsorModal}
        onClose={() => setShowSponsorModal(false)}
      />

      <GateStaffManagerModal
        isOpen={showGateStaffModal}
        onClose={() => setShowGateStaffModal(false)}
      />
    </div>
  );
}
