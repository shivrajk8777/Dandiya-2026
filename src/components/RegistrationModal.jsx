import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { X, Sparkles, User, Phone, Mail, MapPin, CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Ticket, Users, Tag, Clock, QrCode, Lock } from "lucide-react";
import { registerAttendee } from "@/lib/registrationService";
import { PASS_OPTIONS } from "./PassTiers";
import { subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";
import { initiateRazorpayCheckout } from "@/lib/razorpayService";

export default function RegistrationModal({ initialPass, isOpen, onClose, onSuccess }) {
  const [selectedPass, setSelectedPass] = useState(
    initialPass || PASS_OPTIONS[0]
  );
  const [discountConfig, setDiscountConfig] = useState(null);
  const [step, setStep] = useState(1); // 1: Attendee details, 2: Payment
  const [paymentMethodTab, setPaymentMethodTab] = useState("razorpay"); // "razorpay" or "upi_qr"
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Chomu",
    quantity: 1,
    childrenCount: 0,
    transactionRef: "",
    paymentMethod: "Razorpay Automated (UPI / Card / Netbanking)"
  });
  const [attendees, setAttendees] = useState([
    { name: "", aadhaar: "" },
    { name: "", aadhaar: "" }
  ]);
  const [childrenList, setChildrenList] = useState([]);
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToDiscountConfig((cfg) => {
      setDiscountConfig(cfg);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPaymentMethodTab("razorpay");
      setErrorMsg("");
      setLoading(false);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        city: "Chomu",
        quantity: 1,
        childrenCount: 0,
        transactionRef: "",
        paymentMethod: "Razorpay Automated (UPI / Card / Netbanking)"
      });
      setAttendees([
        { name: "", aadhaar: "" },
        { name: "", aadhaar: "" }
      ]);
      setChildrenList([]);
      if (initialPass) {
        setSelectedPass(initialPass);
      }
    }
  }, [isOpen, initialPass]);

  // Keep attendees array length in sync with ticket quantity (1 Couple Pass = 2 Persons)
  useEffect(() => {
    const qtyPasses = Number(formData.quantity) || 1;
    const totalPersons = qtyPasses * 2;
    setAttendees((prev) => {
      const next = [...prev];
      if (next.length < totalPersons) {
        while (next.length < totalPersons) {
          next.push({ name: "", aadhaar: "" });
        }
      } else if (next.length > totalPersons) {
        next.splice(totalPersons);
      }
      if (next.length > 0 && formData.fullName.trim() && (!next[0].name || next[0].name === formData.fullName)) {
        next[0].name = formData.fullName;
      }
      return next;
    });
  }, [formData.quantity, formData.fullName]);

  const pricing = calculateTicketPrice(discountConfig);
  const unitPrice = pricing.finalPrice;
  const totalAmount = unitPrice * formData.quantity;
  const originalTotal = pricing.basePrice * formData.quantity;
  const totalSavings = originalTotal - totalAmount;

  // Generate real UPI payment string and QR Code for fallback QR tab
  useEffect(() => {
    if (step === 2 && paymentMethodTab === "upi_qr") {
      const upiString = `upi://pay?pa=rangtaranggarba2026@okhdfcbank&pn=RangTarangGarbaMahotsav&am=${totalAmount}&cu=INR&tn=RangTarangPass_${formData.phone}`;
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
  }, [step, paymentMethodTab, totalAmount, formData.phone]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: onlyNums }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendeeChange = (index, field, value) => {
    setAttendees((prev) => {
      const updated = [...prev];
      if (field === "aadhaar") {
        const cleanDigits = value.replace(/\D/g, "").slice(0, 12);
        updated[index] = { ...updated[index], aadhaar: cleanDigits };
      } else {
        updated[index] = { ...updated[index], [field]: value };
        if (index === 0 && field === "name") {
          setFormData((f) => ({ ...f, fullName: value }));
        }
      }
      return updated;
    });
  };

  const validateStep1 = () => {
    const cleanName = formData.fullName.trim();
    const cleanPhone = formData.phone.trim();
    const cleanEmail = formData.email.trim();
    const cleanCity = formData.city.trim();

    if (!cleanName) {
      setErrorMsg("Please enter Primary Contact Full Name");
      return false;
    }
    if (cleanName.length < 3) {
      setErrorMsg("Primary Name must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z\s.-]+$/.test(cleanName)) {
      setErrorMsg("Name should only contain letters");
      return false;
    }

    if (!cleanPhone) {
      setErrorMsg("Please enter 10-digit mobile number");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Valid 10-digit mobile starting 6-9");
      return false;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("Please enter valid Email ID");
      return false;
    }

    if (!cleanCity || cleanCity.length < 2) {
      setErrorMsg("Please enter your city");
      return false;
    }

    if (!selectedPass || !selectedPass.price) {
      setErrorMsg("Select Pass Category");
      return false;
    }

    // MANDATORY NAME & 12-DIGIT AADHAAR FOR ALL ATTENDEES
    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i] || {};
      const pNum = i + 1;
      const passIndex = Math.floor(i / 2) + 1;
      const personLetter = i % 2 === 0 ? "Person 1" : "Person 2";
      const attName = (att.name || "").trim();
      const attAadhaar = (att.aadhaar || "").trim();

      if (!attName) {
        setErrorMsg(`Please enter Full Name for Person #${pNum} (Pass ${passIndex} - ${personLetter})`);
        return false;
      }
      if (attName.length < 3) {
        setErrorMsg(`Full Name for Person #${pNum} must be at least 3 characters`);
        return false;
      }
      if (!attAadhaar) {
        setErrorMsg(`Please enter 12-digit Aadhaar Card Number for Person #${pNum} (${personLetter})`);
        return false;
      }
      if (!/^\d{12}$/.test(attAadhaar)) {
        setErrorMsg(`Aadhaar Card Number for Person #${pNum} must be exactly 12 numeric digits`);
        return false;
      }
    }

    setErrorMsg("");
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateStep1()) {
      handleRazorpayPayment();
    }
  };

  // Razorpay Automated Payment Handler
  const handleRazorpayPayment = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      await initiateRazorpayCheckout({
        amount: totalAmount,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        passName: selectedPass.name,
        quantity: Number(formData.quantity),
        onSuccess: async (razorpayData) => {
          setLoading(true);
          try {
            const payload = {
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              city: formData.city.trim(),
              passType: selectedPass.name,
              quantity: Number(formData.quantity),
              unitPrice: unitPrice,
              totalAmount: totalAmount,
              paymentMethod: razorpayData.paymentMethod || "Razorpay Automated (UPI / Card / Netbanking)",
              transactionRef: razorpayData.paymentId,
              paymentStatus: "Approved",
              attendees: attendees.map((a) => ({
                name: a.name.trim(),
                aadhaar: a.aadhaar.trim()
              }))
            };

            const result = await registerAttendee(payload);
            if (result.success) {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#fbbf24", "#f43f5e", "#a855f7", "#34d399"]
              });
              onSuccess(result);
            } else {
              setErrorMsg("Payment completed (" + razorpayData.paymentId + "), but pass registration failed.");
            }
          } catch (e) {
            setErrorMsg("Error completing registration: " + e.message);
          } finally {
            setLoading(false);
          }
        },
        onError: (errText) => {
          setLoading(false);
          setErrorMsg(errText || "Razorpay payment declined or cancelled.");
        },
        onModalDismiss: () => {
          setLoading(false);
        }
      });
    } catch (err) {
      setLoading(false);
      setErrorMsg("Razorpay gateway error: " + err.message);
    }
  };

  // Manual UPI Submission Handler
  const handleSubmitRegistration = async () => {
    setErrorMsg("");

    const cleanRef = formData.transactionRef.trim();
    if (!cleanRef) {
      setErrorMsg("Please enter your UPI Reference / UTR Number after completing payment");
      return;
    }
    if (cleanRef.length < 6) {
      setErrorMsg("Please enter a valid UPI Reference / UTR Number (minimum 6 digits)");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        passType: selectedPass.name,
        quantity: Number(formData.quantity),
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        paymentMethod: "Manual UPI Scan & UTR",
        transactionRef: cleanRef,
        paymentStatus: "Approved",
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          aadhaar: a.aadhaar.trim()
        }))
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#110524] border border-amber-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl my-2 sm:my-4 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-3 sm:mb-5 pr-8 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 font-serif-royal">
            <Sparkles className="w-3 h-3 shrink-0" />
            VIP Ticket Booking & Instant E-Pass
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-serif-royal leading-snug">
            Book Your VIP Pass
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Fill attendee info & click Proceed to Pay to open Razorpay Payment Gateway directly
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium shrink-0">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3.5">
          {/* Attendee Info & Pass selection */}
          <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
              {/* Pass Category Display */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Event Ticket Pass (Couple Entry Only)
                </label>
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2a0e4a] via-[#1c0830] to-[#120522] border-2 border-amber-400 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg shadow-amber-500/10">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-white font-serif-royal flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span>{selectedPass.name}</span>
                        {pricing.isDiscounted && pricing.discountBadge && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full">
                            {pricing.discountBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-300/90 font-medium">
                        {selectedPass.tier || "Couple Exclusive Entry (2 Persons)"}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0 flex sm:block items-baseline justify-between">
                    <div className="text-base sm:text-lg font-black text-amber-400 font-sans flex items-baseline gap-1.5">
                      <span>₹{unitPrice}</span>
                      {pricing.isDiscounted && (
                        <span className="text-xs text-slate-400 line-through">₹{pricing.basePrice}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400">All taxes incl.</div>
                  </div>
                </div>
              </div>

              {/* Pass Quantity & Price Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Quantity (Couple Passes)
                  </label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Couple Pass (2 Pax)" : `Couple Passes (${num * 2} Pax)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Total Payable
                  </label>
                  <div className="w-full bg-[#1b0a38] border border-amber-500/40 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-amber-400 flex items-center justify-between">
                    <span>₹{totalAmount}</span>
                    {totalSavings > 0 && (
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        Save ₹{totalSavings}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Savings Badge if Discounted */}
              {totalSavings > 0 && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] sm:text-[11px] text-emerald-300 font-semibold flex flex-wrap items-center justify-between gap-1">
                  <span>Original: <line className="line-through text-slate-400">₹{originalTotal}</line></span>
                  <span className="font-bold">Discount: -₹{totalSavings}</span>
                  <span className="text-amber-400 font-extrabold">Final: ₹{totalAmount}</span>
                </div>
              )}

              {/* Primary Contact Full Name */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Primary Contact Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-9 sm:pl-10 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  WhatsApp / Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={12}
                    required
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-9 sm:pl-10 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Email & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-9 sm:pl-10 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Chomu / Jaipur"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-9 sm:pl-10 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Attendees & Aadhaar Card Numbers Section */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-serif-royal">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Pass Holder Info ({attendees.length} Persons Entry)</span>
                  </label>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold uppercase tracking-wider">
                    * Mandatory for Entry
                  </span>
                </div>

                <div className="space-y-2.5">
                  {attendees.map((att, idx) => {
                    const passNum = Math.floor(idx / 2) + 1;
                    const personLabel = idx % 2 === 0 ? "Person 1" : "Person 2";
                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-2xl bg-[#180733] border border-amber-500/30 space-y-2 relative shadow-md"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span className="flex items-center gap-1.5 text-amber-300 font-serif-royal">
                            <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            Person #{idx + 1} (Pass #{passNum} • {personLabel})
                          </span>
                          <span className={`text-[10px] font-mono ${att.aadhaar.length === 12 ? "text-emerald-400 font-bold" : "text-amber-400"}`}>
                            {att.aadhaar.length === 12 ? "✓ Aadhaar Verified" : "12 Digits Req."}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Attendee Name */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                              Full Name (Person #{idx + 1}) *
                            </label>
                            <div className="relative">
                              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                placeholder="e.g. Aarav Sharma"
                                value={att.name}
                                onChange={(e) => handleAttendeeChange(idx, "name", e.target.value)}
                                required
                                className="w-full bg-[#0e0320] border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          {/* Attendee Aadhaar */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between">
                              <span>Aadhaar Number *</span>
                              <span className={`font-mono text-[9px] ${att.aadhaar.length === 12 ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                                {att.aadhaar.length}/12
                              </span>
                            </label>
                            <div className="relative">
                              <ShieldCheck className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${att.aadhaar.length === 12 ? "text-emerald-400" : "text-slate-400"}`} />
                              <input
                                type="text"
                                placeholder="12-digit Aadhaar No."
                                value={att.aadhaar}
                                onChange={(e) => handleAttendeeChange(idx, "aadhaar", e.target.value)}
                                maxLength={12}
                                required
                                className={`w-full bg-[#0e0320] border rounded-xl pl-8 pr-3 py-2 text-xs font-mono tracking-wider text-white placeholder-slate-500 focus:outline-none ${
                                  att.aadhaar.length === 12 ? "border-emerald-500/60 text-emerald-300" : "border-white/15 focus:border-amber-400"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Proceed to Pay Submit Button */}
              <div className="pt-2 sticky bottom-0 bg-[#110524]/95 backdrop-blur-md pb-1 z-10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-sm sm:text-base uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all"
                >
                  <CreditCard className="w-5 h-5 text-black shrink-0" />
                  {loading ? "Launching Razorpay Gateway..." : `PROCEED TO PAY (₹${totalAmount})`}
                </button>
                <div className="text-center mt-1.5 text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Secured by Razorpay • Instant Verification & Pass Generation
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

