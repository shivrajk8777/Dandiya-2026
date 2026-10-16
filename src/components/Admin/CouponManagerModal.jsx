"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Ticket,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Users,
  Plus,
  Database
} from "lucide-react";
import {
  getCoupons,
  subscribeToCoupons,
  exportCouponsToExcel,
  resetAllCoupons,
  addCouponToDatabase
} from "@/lib/couponService";

export default function CouponManagerModal({ isOpen, onClose }) {
  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("ALL"); // "ALL", "AVAILABLE", "REDEEMED"
  const [selectedSponsor, setSelectedSponsor] = useState("ALL"); // "ALL", "MAHAVEER", "SHREEJI", "SKJ", "AV"
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedAllMsg, setCopiedAllMsg] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState("");
  const [addingCode, setAddingCode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToCoupons((list) => {
      setCoupons(list || []);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCount = coupons.length;
  const redeemedCount = coupons.filter((c) => c.isUsed).length;
  const availableCount = totalCount - redeemedCount;

  const mahaveerCount = coupons.filter((c) => (c.sponsor === "Mahaveer" || c.code.startsWith("MAHAVEER"))).length;
  const shreejiCount = coupons.filter((c) => (c.sponsor === "Shreeji" || c.code.startsWith("SHREEJI"))).length;
  const skjCount = coupons.filter((c) => (c.sponsor === "SKJ" || c.code.startsWith("SKJ"))).length;
  const avCount = coupons.filter((c) => (c.sponsor === "AV" || c.code.startsWith("AV"))).length;

  // Filtered list
  const filteredCoupons = coupons.filter((c) => {
    if (selectedSponsor === "MAHAVEER" && !(c.sponsor === "Mahaveer" || c.code.startsWith("MAHAVEER"))) return false;
    if (selectedSponsor === "SHREEJI" && !(c.sponsor === "Shreeji" || c.code.startsWith("SHREEJI"))) return false;
    if (selectedSponsor === "SKJ" && !(c.sponsor === "SKJ" || c.code.startsWith("SKJ"))) return false;
    if (selectedSponsor === "AV" && !(c.sponsor === "AV" || c.code.startsWith("AV"))) return false;

    if (filterTab === "AVAILABLE" && c.isUsed) return false;
    if (filterTab === "REDEEMED" && !c.isUsed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = c.code.toLowerCase().includes(q);
      const nameMatch = c.usedBy && c.usedBy.toLowerCase().includes(q);
      const phoneMatch = c.usedPhone && c.usedPhone.includes(q);
      const passMatch = c.passId && c.passId.toLowerCase().includes(q);
      const sponsorMatch = c.sponsor && c.sponsor.toLowerCase().includes(q);
      return codeMatch || nameMatch || phoneMatch || passMatch || sponsorMatch;
    }
    return true;
  });

  const handleCopySingle = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllAvailable = () => {
    const availableCodes = filteredCoupons
      .filter((c) => !c.isUsed)
      .map((c) => c.code)
      .join("\n");

    navigator.clipboard.writeText(availableCodes);
    setCopiedAllMsg(true);
    setTimeout(() => setCopiedAllMsg(false), 3000);
  };

  const handleReset = async () => {
    setLoading(true);
    await resetAllCoupons();
    setResetConfirm(false);
    setLoading(false);
  };

  const handleAddNewCode = async (e) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;
    setAddingCode(true);
    await addCouponToDatabase(newCodeInput.trim());
    setNewCodeInput("");
    setShowAddForm(false);
    setAddingCode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl my-4 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left mb-3 pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              VIP Ticket System
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
              <Database className="w-3 h-3 text-emerald-400" />
              Live Database: 'dandiya_coupons'
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            Manage VIP Promo & Coupon Codes
          </h2>
          <p className="text-xs text-slate-400">
            All codes are stored directly in the Firestore database collection <strong className="text-amber-300 font-mono">dandiya_coupons</strong>. Live real-time sync with website booking.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-0.5">
              Total In Database
            </span>
            <span className="text-lg sm:text-2xl font-black text-white font-mono">
              {totalCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] sm:text-xs text-emerald-300 font-bold uppercase block mb-0.5">
              Available / Unused
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
              {availableCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
            <span className="text-[10px] sm:text-xs text-rose-300 font-bold uppercase block mb-0.5">
              Redeemed / Used
            </span>
            <span className="text-lg sm:text-2xl font-black text-rose-400 font-mono">
              {redeemedCount}
            </span>
          </div>
        </div>

        {/* Sponsor Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <button
            onClick={() => setSelectedSponsor("ALL")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSponsor === "ALL"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            All Sponsors ({totalCount})
          </button>
          <button
            onClick={() => setSelectedSponsor("MAHAVEER")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSponsor === "MAHAVEER"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            🌾 Mahaveer ({mahaveerCount})
          </button>
          <button
            onClick={() => setSelectedSponsor("SHREEJI")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSponsor === "SHREEJI"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            🪔 Shreeji ({shreejiCount})
          </button>
          <button
            onClick={() => setSelectedSponsor("SKJ")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSponsor === "SKJ"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            ⭐ SKJ ({skjCount})
          </button>
          <button
            onClick={() => setSelectedSponsor("AV")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSponsor === "AV"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            💎 AV ({avCount})
          </button>
        </div>

        {/* Action Bar (Export, Add Code, Copy All, Filter Tabs) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          {/* Filter Tabs */}
          <div className="inline-flex items-center rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterTab === "ALL"
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab("AVAILABLE")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterTab === "AVAILABLE"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setFilterTab("REDEEMED")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterTab === "REDEEMED"
                  ? "bg-rose-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Redeemed ({redeemedCount})
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancel Add" : "Add Code to DB"}</span>
            </button>

            <button
              onClick={handleCopyAllAvailable}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Copy all available codes to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedAllMsg ? "Copied!" : "Copy Unused"}</span>
            </button>

            <button
              onClick={() => exportCouponsToExcel(coupons)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Add New Code to Firestore Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddNewCode}
            className="p-3 mb-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-amber-500/10 border border-amber-500/40 flex flex-wrap items-center gap-2 animate-in fade-in"
          >
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                autoFocus
                required
                value={newCodeInput}
                onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter new code (e.g. MAHAVEER-..., SHREEJI-..., SKJ-..., AV-...)"
                className="w-full bg-[#0a0214] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={addingCode}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              {addingCode ? "Saving to Database..." : "Save to Database"}
            </button>
          </form>
        )}

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search code (e.g. MAHAVEER-..., SHREEJI-..., SKJ-..., AV-...) or guest name / phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0214] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        {/* Codes Grid / Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl bg-black/30 p-2 sm:p-3">
          {filteredCoupons.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No coupon codes found matching your criteria in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredCoupons.map((item, index) => {
                const isCopied = copiedCode === item.code;
                return (
                  <div
                    key={item.code}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      item.isUsed
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                        : "bg-white/[0.03] border-white/10 hover:border-amber-500/40 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-amber-300">
                          {item.code}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-500/25 font-semibold w-fit">
                          {item.sponsor || "VIP"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopySingle(item.code)}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                          title="Copy code"
                        >
                          {isCopied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {item.isUsed ? (
                      <div className="text-[10px] pt-1.5 border-t border-rose-500/20 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-300">REDEEMED</span>
                          <span className="font-mono text-slate-400">
                            {item.usedAt ? new Date(item.usedAt).toLocaleDateString("en-IN") : ""}
                          </span>
                        </div>
                        <div className="font-semibold text-white truncate">
                          Guest: {item.usedBy || "Anonymous"}
                        </div>
                        {item.usedPhone && (
                          <div className="font-mono text-slate-400">
                            Ph: {item.usedPhone}
                          </div>
                        )}
                        {item.passId && (
                          <div className="font-mono text-amber-300 truncate">
                            Pass: {item.passId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] pt-1 border-t border-white/10 flex items-center justify-between text-emerald-400">
                        <span className="font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Available in DB
                        </span>
                        <span className="text-slate-400">100% Free Pass</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Reset */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-400">
            Database holds <strong className="text-white">{filteredCoupons.length}</strong> of {totalCount} codes
          </div>

          <div className="flex items-center gap-2">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Reset Database Codes to Unused
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] text-rose-300 font-bold">Reset all in Firestore?</span>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]"
                >
                  {loading ? "Resetting..." : "Yes, Reset All"}
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
