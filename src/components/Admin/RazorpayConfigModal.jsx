"use client";
import React, { useState, useEffect } from "react";
import { X, CreditCard, Lock, CheckCircle2, AlertCircle, Save, ShieldCheck } from "lucide-react";
import { getRazorpayKeyId, saveRazorpayKeyId } from "@/lib/razorpayService";

export default function RazorpayConfigModal({ isOpen, onClose }) {
  const [keyId, setKeyId] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setKeyId(getRazorpayKeyId());
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanKey = keyId.trim();
    if (!cleanKey) {
      setStatusMsg({ type: "error", text: "Please enter your Razorpay Key ID (e.g. rzp_live_... or rzp_test_...)" });
      return;
    }

    saveRazorpayKeyId(cleanKey);
    setStatusMsg({ type: "success", text: "Razorpay Key ID saved successfully! Razorpay Checkout is live." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-md w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-left mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            Payment Gateway Config
          </div>
          <h2 className="text-xl font-black text-white font-serif-royal">Razorpay Setup</h2>
          <p className="text-xs text-slate-400">
            Configure your official Razorpay Key ID for 1-click automated payments
          </p>
        </div>

        {statusMsg && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Razorpay Key ID *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxxxxxx"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                required
                className="w-full bg-[#1b0a38] border border-amber-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Find this key in your Razorpay Dashboard → Settings → API Keys.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Supported Features
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Accepts Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, Netbanking (SBI, HDFC, ICICI, Axis, etc.), Wallets & CRED.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4 text-black" />
            Save & Publish Key ID
          </button>
        </form>
      </div>
    </div>
  );
}
