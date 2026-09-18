"use client";
import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { X, Sparkles, User, Phone, Mail, MapPin, CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { registerAttendee } from "@/lib/registrationService";
import { PASS_OPTIONS } from "./PassTiers";

export default function RegistrationModal({ initialPass, isOpen, onClose, onSuccess }) {
  const [selectedPass, setSelectedPass] = useState(
    initialPass || PASS_OPTIONS[0]
  );
  const [step, setStep] = useState(1); // 1: Attendee details, 2: Payment
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Ahmedabad",
    quantity: 1,
    transactionRef: "",
    paymentMethod: "UPI (Google Pay / PhonePe / Paytm)"
  });
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialPass) {
      setSelectedPass(initialPass);
    }
  }, [initialPass]);

  const totalAmount = selectedPass.price * formData.quantity;

  // Generate real UPI payment string and QR Code
  useEffect(() => {
    if (step === 2) {
      const upiString = `upi://pay?pa=utsavraas2026@okhdfcbank&pn=UtsavRaasMahotsav&am=${totalAmount}&cu=INR&tn=UtsavPass_${formData.phone}`;
      QRCode.toDataURL(upiString, {
        width: 280,
        margin: 1,
        color: {
          dark: "#0a0316",
          light: "#ffffff"
        }
      })
        .then((url) => setUpiQrUrl(url))
        .catch((e) => console.error(e));
    }
  }, [step, totalAmount, formData.phone]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp/Phone number");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitRegistration = async (isInstantMock = false) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        passType: selectedPass.name,
        quantity: Number(formData.quantity),
        unitPrice: selectedPass.price,
        totalAmount: totalAmount,
        paymentMethod: isInstantMock ? "Demo Fast Checkout" : formData.paymentMethod,
        transactionRef: isInstantMock
          ? "INSTANT-" + Math.floor(100000 + Math.random() * 900000)
          : formData.transactionRef || "UPI-REF-" + Math.floor(100000 + Math.random() * 900000),
        paymentStatus: "Approved"
      };

      const result = await registerAttendee(payload);

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f43f5e", "#a855f7", "#34d399"]
        });

        onSuccess(result);
      } else {
        setErrorMsg("Failed to register. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Sparkles className="w-3 h-3" />
            Step {step} of 2: {step === 1 ? "Attendee Info" : "UPI Payment Verification"}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            {step === 1 ? "Book Your VIP Pass" : "Complete UPI Payment"}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            {step === 1
              ? "Select tier & contact details to generate official E-Ticket"
              : "Scan UPI QR code or use instant demo checkout"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* STEP 1: Attendee Info & Pass selection */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-3.5 sm:space-y-4">
            {/* Pass Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Pass Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PASS_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSelectedPass(opt)}
                    className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all ${
                      selectedPass.id === opt.id
                        ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10"
                        : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-bold text-white truncate font-serif-royal">
                      {opt.name}
                    </div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">
                      ₹{opt.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pass Quantity & Price Row */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Quantity
                </label>
                <select
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full bg-[#1b0a38] border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Pass" : "Passes"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Total Payable
                </label>
                <div className="w-full bg-[#1b0a38] border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-black text-amber-400 flex items-center justify-between">
                  <span>₹{totalAmount}</span>
                  <span className="text-[9px] text-slate-400 font-normal">All taxes incl.</span>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                WhatsApp / Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={12}
                  required
                  className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Email & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Submit Button */}
            <div className="pt-2 sm:pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:opacity-95 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Proceed to Payment (₹{totalAmount})
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: UPI Payment & Verification */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <div className="text-white font-bold">{formData.fullName}</div>
                <div className="text-slate-400 text-xs">
                  {selectedPass.name} × {formData.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-amber-400">₹{totalAmount}</div>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Pay via UPI
                </span>
              </div>
            </div>

            {/* UPI QR Display */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#1d0938] to-[#100320] border border-amber-500/30">
              <div className="p-2 rounded-xl bg-white text-black shrink-0 shadow-lg mx-auto sm:mx-0">
                {upiQrUrl ? (
                  <img src={upiQrUrl} alt="UPI QR Code" className="w-32 h-32 sm:w-36 sm:h-36 object-contain" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs">Loading QR...</div>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left text-xs">
                <div className="font-bold text-white text-sm">Scan with Any UPI App</div>
                <div className="text-slate-300 text-[11px]">
                  Google Pay • PhonePe • Paytm • BHIM • CRED
                </div>
                <div className="p-2 rounded-lg bg-black/50 border border-white/10 font-mono text-[10px] text-amber-300 select-all break-all">
                  UPI ID: utsavraas2026@okhdfcbank
                </div>
                <div className="text-[10px] text-slate-400">
                  Recipient: <strong className="text-white">Utsav Raas Cultural Fest</strong>
                </div>
              </div>
            </div>

            {/* Reference Number Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                UPI Reference / UTR Number (Optional for Demo)
              </label>
              <input
                type="text"
                name="transactionRef"
                placeholder="e.g. 329182049182"
                value={formData.transactionRef}
                onChange={handleInputChange}
                className="w-full bg-[#1b0a38] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSubmitRegistration(false)}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                {loading ? "Confirming Pass..." : "I Have Paid & Generate E-Pass"}
              </button>

              {/* Fast Instant Demo Checkout */}
              <button
                type="button"
                onClick={() => handleSubmitRegistration(true)}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Instant Demo / 1-Click Fast Approval Checkout
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                ← Back to Edit Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
