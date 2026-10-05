"use client";
import React, { useState } from "react";
import { X, Search, Ticket, ArrowRight, AlertCircle, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { lookupPass, updateRegistrationData } from "@/lib/registrationService";
import { initiateRazorpayCheckout } from "@/lib/razorpayService";
import confetti from "canvas-confetti";

export default function PassLookupModal({ isOpen, onClose, onSelectPass }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [payingPassId, setPayingPassId] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter your Phone Number or Pass ID");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const records = await lookupPass(searchQuery.trim());
      setResults(records);
      if (records.length === 0) {
        setErrorMsg("No passes found for the given Phone / Pass ID. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Search error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (pass) => {
    const pId = pass.id || pass.passId;
    setPayingPassId(pId);
    setErrorMsg("");

    const qty = Number(pass.quantity) || 1;
    const unitPrice = Number(pass.unitPrice) || 1599;
    const subtotal = Number(pass.subtotal) || unitPrice * qty;
    const taxAmount = Number(pass.taxAmount) || 0;
    const totalAmount = Number(pass.totalAmount) || subtotal;

    try {
      await initiateRazorpayCheckout({
        amount: totalAmount,
        currency: "INR",
        passName: pass.passType || "Royal VIP Couple Pass",
        quantity: qty,
        fullName: pass.fullName,
        phone: pass.phone,
        email: pass.email,
        name: "Rang Tarang Garba Mahotsav 2026",
        description: `Complete Payment for ${pass.passId} (Total: ₹${totalAmount})`,
        prefill: {
          name: pass.fullName,
          contact: pass.phone,
          email: pass.email
        },
        themeColor: "#e5b869",
        onSuccess: async (response) => {
          const paymentId = response.razorpay_payment_id || `PAY_${Date.now()}`;
          const updatedPass = {
            ...pass,
            status: "Approved",
            paymentStatus: "Approved",
            paymentMethod: "Razorpay Online (UPI/Cards)",
            transactionRef: paymentId,
            paidAt: new Date().toISOString(),
            subtotal,
            taxPercent: 0,
            taxAmount: 0,
            totalAmount
          };

          if (pass.id) {
            await updateRegistrationData(pass.id, {
              status: "Approved",
              paymentStatus: "Approved",
              paymentMethod: "Razorpay Online (UPI/Cards)",
              transactionRef: paymentId,
              paidAt: new Date().toISOString(),
              subtotal,
              taxPercent: 0,
              taxAmount: 0,
              totalAmount
            });
          }

          try {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch (e) {
            console.warn(e);
          }

          onClose();
          if (onSelectPass) {
            onSelectPass(updatedPass);
          }
        },
        onError: (err) => {
          setErrorMsg(typeof err === "string" ? err : "Payment could not be processed. Please try again.");
          setPayingPassId(null);
        },
        onDismiss: () => {
          setErrorMsg("Payment was cancelled or closed. You can click Pay Now anytime to complete your booking.");
          setPayingPassId(null);
        }
      });
    } catch (err) {
      console.error("Pay Now launch error:", err);
      setErrorMsg("Failed to open Razorpay gateway: " + err.message);
      setPayingPassId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-lg w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Ticket className="w-3.5 h-3.5" />
            Pass Retrieval & Instant Payment
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">Find My Pass</h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Enter your registered WhatsApp Mobile Number or Pass ID to view pass or complete pending payment
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-3.5 mb-5">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. 9876543210 or DND-RAAS-8942"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b0938] border border-amber-500/30 rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Search className="w-4 h-4 text-black" />
            {loading ? "Searching Passes..." : "Search My Pass"}
          </button>
        </form>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Results List */}
        {results && results.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span>Matching Passes ({results.length}):</span>
              <span className="text-[10px] text-slate-400 font-normal">Paid passes generate ticket instantly</span>
            </div>

            {results.map((pass) => {
              const isPaid = pass.status === "Approved";
              const qty = Number(pass.quantity) || 1;
              const unitPrice = Number(pass.unitPrice) || 1599;
              const subtotal = Number(pass.subtotal) || unitPrice * qty;
              const taxAmount = Number(pass.taxAmount) || 0;
              const totalAmount = Number(pass.totalAmount) || subtotal;
              const isThisPaying = payingPassId === (pass.id || pass.passId);

              return (
                <div
                  key={pass.id || pass.passId}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left space-y-2.5 ${isPaid
                      ? "bg-gradient-to-r from-[#1c0836] to-[#120424] border-amber-500/40 shadow-lg hover:border-amber-400"
                      : "bg-[#180528] border-amber-500/25 shadow-md"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base font-serif-royal">
                          {pass.fullName}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${isPaid
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/35"
                            }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Paid & Confirmed</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Payment Pending</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {pass.passType} • {qty} {qty > 1 ? "Couple Passes (4 Pax)" : "Couple Pass (2 Pax)"}
                        {pass.childrenCount > 0 && <span className="text-emerald-400 font-semibold"> + {pass.childrenCount} Child Free</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono mt-1">
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {pass.passId}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendees names & Aadhaar list snippet */}
                  {Array.isArray(pass.attendees) && pass.attendees.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-white/5 space-y-0.5">
                      {pass.attendees.map((att, i) => (
                        <div key={i} className="truncate">
                          👤 {att.name || "Partner"} {att.aadhaar ? `(Aadhaar: ${att.aadhaar})` : ""}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {isPaid ? "Official VIP E-Pass ready" : "Complete payment to unlock your VIP pass"}
                    </span>

                    <div>
                      {isPaid ? (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPass(pass);
                          }}
                          className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <span>View Ticket</span>
                          <ArrowRight className="w-3.5 h-3.5 text-black" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePayNow(pass)}
                          disabled={isThisPaying}
                          className="px-4 py-2 text-xs font-black text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:opacity-95 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all animate-pulse"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-black" />
                          <span>{isThisPaying ? "Opening Gateway..." : `Pay Now (₹${totalAmount.toLocaleString("en-IN")})`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
