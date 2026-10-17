"use client";
import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import {
  X,
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Ticket,
  Users,
  Tag,
  Clock,
  QrCode,
  Lock,
  AlertCircle,
  AlertTriangle,
  Baby
} from "lucide-react";
import { registerAttendee, updateRegistrationData, subscribeToRegistrations } from "@/lib/registrationService";
import { PASS_OPTIONS } from "./PassTiers";
import { subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";
import { initiateRazorpayCheckout } from "@/lib/razorpayService";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";
import { validateCoupon, redeemCoupon, subscribeToCoupons } from "@/lib/couponService";

export default function RegistrationModal({ initialPass, isOpen, onClose, onSuccess }) {
  const [selectedPass, setSelectedPass] = useState(initialPass || PASS_OPTIONS[0]);
  const [discountConfig, setDiscountConfig] = useState(null);
  const [inventoryConfig, setInventoryConfig] = useState({ maxTickets: 300 });
  const [registrations, setRegistrations] = useState([]);
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
  const [activePendingRecord, setActivePendingRecord] = useState(null);

  // VIP Coupon / Promo Code State
  const [bookingMode, setBookingMode] = useState("payment"); // "payment" or "coupon"
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponValidationMsg, setCouponValidationMsg] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const unsubDisc = subscribeToDiscountConfig((cfg) => setDiscountConfig(cfg));
    const unsubInv = subscribeToInventoryConfig((inv) => setInventoryConfig(inv));
    const unsubReg = subscribeToRegistrations((list) => setRegistrations(list));
    const unsubCpn = subscribeToCoupons(() => { });

    return () => {
      if (typeof unsubDisc === "function") unsubDisc();
      if (typeof unsubInv === "function") unsubInv();
      if (typeof unsubReg === "function") unsubReg();
      if (typeof unsubCpn === "function") unsubCpn();
    };
  }, []);

  const stats = computeTicketStats(inventoryConfig, registrations);
  const maxTickets = stats.maxTickets;
  const soldPasses = stats.soldPasses;
  const remainingTickets = stats.remainingTickets;
  const isSoldOut = stats.isSoldOut;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPaymentMethodTab("razorpay");
      setErrorMsg("");
      setLoading(false);
      setActivePendingRecord(null);
      setBookingMode("payment");
      setCouponCodeInput("");
      setAppliedCoupon(null);
      setCouponValidationMsg(null);
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
  const isCouponApplied = !!appliedCoupon;
  const unitPrice = isCouponApplied ? 0 : pricing.finalPrice;
  const quantity = Number(formData.quantity) || 1;
  const subtotal = isCouponApplied ? 0 : unitPrice * quantity;
  const TAX_PERCENT = 0; // Tax removed as per requirement
  const taxAmount = 0;
  const totalAmount = isCouponApplied ? 0 : subtotal; // Final payable amount equals ticket price

  const originalSubtotal = pricing.basePrice * quantity;
  const originalTax = 0;
  const originalTotal = originalSubtotal;
  const totalSavings = isCouponApplied ? originalTotal : originalTotal - totalAmount;

  const hasDuplicateAadhaarInEntireForm = false;

  // Real-time invalid child age check (> 5 years)
  const hasInvalidChildAge =
    formData.childrenCount > 0 &&
    childrenList.some((c) => Number(c.age) > 5);

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

  const handleChildrenCountChange = (count) => {
    const num = Math.max(0, Math.min(1, Number(count) || 0));
    setFormData((prev) => ({ ...prev, childrenCount: num }));
    setChildrenList((prev) => {
      const next = [...prev];
      if (next.length < num) {
        while (next.length < num) {
          next.push({ name: "", age: "3", aadhaar: "" });
        }
      } else if (next.length > num) {
        next.splice(num);
      }
      return next;
    });
  };

  const handleChildFieldChange = (index, field, value) => {
    setChildrenList((prev) => {
      const updated = [...prev];
      if (field === "aadhaar") {
        const cleanDigits = value.replace(/\D/g, "").slice(0, 12);
        updated[index] = { ...updated[index], aadhaar: cleanDigits };
      } else {
        updated[index] = { ...updated[index], [field]: value };
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

    // Mandatory Name for all Attendees
    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i] || {};
      const pNum = i + 1;
      const passIndex = Math.floor(i / 2) + 1;
      const personLetter = i % 2 === 0 ? "Person 1" : "Person 2";
      const attName = (att.name || "").trim();

      if (!attName) {
        setErrorMsg(`Please enter Full Name for Person #${pNum} (Pass ${passIndex} - ${personLetter})`);
        return false;
      }
      if (attName.length < 3) {
        setErrorMsg(`Full Name for Person #${pNum} must be at least 3 characters`);
        return false;
      }
    }

    // Accompanying Children Validation (≤ 5 Years FREE, > 5 Years strictly blocked + Mandatory Name)
    if (formData.childrenCount > 0) {
      for (let c = 0; c < childrenList.length; c++) {
        const child = childrenList[c] || {};
        const cNum = c + 1;
        const cName = (child.name || "").trim();
        const cAge = Number(child.age);

        if (!cName) {
          setErrorMsg(`Please enter Full Name for Accompanying Child #${cNum}`);
          return false;
        }
        if (cName.length < 2) {
          setErrorMsg(`Child #${cNum} name must be at least 2 characters`);
          return false;
        }
        if (!cAge || cAge < 1) {
          setErrorMsg(`Please select/enter valid age for Child #${cNum}`);
          return false;
        }
        if (cAge > 5) {
          setErrorMsg(
            `Child Policy Violation: Child #${cNum} (${cName}) age is ${cAge} years. Children above 5 years are strictly NOT ALLOWED into the venue!`
          );
          return false;
        }
      }
    }

    setErrorMsg("");
    return true;
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      setCouponValidationMsg({ type: "error", text: "Please enter a VIP coupon code." });
      return;
    }
    setCouponValidating(true);
    setCouponValidationMsg({ type: "loading", text: "Connecting to database..." });
    setErrorMsg("");

    try {
      const res = await validateCoupon(couponCodeInput);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setBookingMode("coupon");
        setCouponValidationMsg({ type: "success", text: res.message });
        setErrorMsg("");
      } else {
        setAppliedCoupon(null);
        setCouponValidationMsg({ type: "error", text: res.message });
      }
    } catch (err) {
      setCouponValidationMsg({ type: "error", text: "Database connection error: " + err.message });
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponValidationMsg(null);
  };

  const handleCouponPassConfirmation = async (coupon) => {
    setErrorMsg("");
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const code = (coupon.code || "").trim().toUpperCase();

      // 1. Live state check against all currently loaded registrations
      const alreadyBooked = registrations.some(
        (r) =>
          (r.couponCode && r.couponCode.toUpperCase() === code) ||
          (r.transactionRef && r.transactionRef.toUpperCase() === `VIP_${code}`)
      );
      if (alreadyBooked) {
        const msg = `🚫 Duplicate Booking Blocked: VIP Code "${code}" is already used for another ticket! Each coupon code can only be used once.`;
        setErrorMsg(msg);
        setCouponValidationMsg({ type: "error", text: msg });
        setAppliedCoupon(null);
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // 2. Real-time direct Firestore verification before creating the pass
      const liveCheck = await validateCoupon(code);
      if (!liveCheck.valid) {
        setErrorMsg(liveCheck.message);
        setCouponValidationMsg({ type: "error", text: liveCheck.message });
        setAppliedCoupon(null);
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // 3. Register attendee with strict 1 coupon = 1 couple pass (quantity 1)
      const finalPass = await registerAttendee({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        passType: selectedPass.name,
        quantity: 1, // Enforce 1 pass per coupon code
        unitPrice: 0,
        subtotal: 0,
        taxPercent: TAX_PERCENT,
        taxAmount: 0,
        totalAmount: 0,
        paymentMethod: `VIP Coupon (${code})`,
        paymentStatus: "Approved",
        status: "Approved",
        transactionRef: `VIP_${code}`,
        couponCode: code,
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          aadhaar: a.aadhaar.trim()
        })),
        childrenCount: Number(formData.childrenCount) || 0,
        children: childrenList.map((c) => ({
          name: c.name.trim(),
          age: Number(c.age) || 0,
          aadhaar: (c.aadhaar || "").replace(/\D/g, "")
        }))
      });

      // 4. Mark coupon as redeemed in local & Firebase
      await redeemCoupon(code, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        passId: finalPass.passId || finalPass.id
      });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setLoading(false);
      isSubmittingRef.current = false;
      if (onSuccess) {
        onSuccess(finalPass);
      }
    } catch (err) {
      console.error("Coupon redemption error:", err);
      setLoading(false);
      isSubmittingRef.current = false;
      setErrorMsg(err.message || "Failed to confirm pass with VIP code");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;
    if (!validateStep1()) return;

    if (appliedCoupon || (bookingMode === "coupon" && couponCodeInput.trim())) {
      let couponToRedeem = appliedCoupon;
      if (!couponToRedeem && couponCodeInput.trim()) {
        setCouponValidating(true);
        const valRes = await validateCoupon(couponCodeInput);
        setCouponValidating(false);
        if (!valRes.valid) {
          setErrorMsg(valRes.message);
          setCouponValidationMsg({ type: "error", text: valRes.message });
          return;
        }
        couponToRedeem = valRes.coupon;
        setAppliedCoupon(couponToRedeem);
      }
      await handleCouponPassConfirmation(couponToRedeem);
    } else {
      handleRazorpayPayment();
    }
  };

  // Razorpay Automated Payment Handler with Instant Pending Lead Recording
  const handleRazorpayPayment = async () => {
    setErrorMsg("");
    setLoading(true);

    // 1. Immediately record or update an "Incomplete / Pending Payment" registration lead in database
    let pendingRecord = activePendingRecord;
    try {
      const initialPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        passType: selectedPass.name,
        quantity,
        unitPrice,
        subtotal,
        taxPercent: TAX_PERCENT,
        taxAmount,
        totalAmount,
        paymentMethod: "Razorpay Checkout (Initiated)",
        paymentStatus: "Pending",
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          aadhaar: a.aadhaar.trim()
        })),
        childrenCount: Number(formData.childrenCount) || 0,
        children: childrenList.map((c) => ({
          name: c.name.trim(),
          age: Number(c.age) || 0,
          aadhaar: (c.aadhaar || "").replace(/\D/g, "")
        }))
      };
      if (pendingRecord && pendingRecord.id) {
        await updateRegistrationData(pendingRecord.id, initialPayload);
      } else {
        pendingRecord = await registerAttendee(initialPayload);
        setActivePendingRecord(pendingRecord);
      }
    } catch (e) {
      console.warn("Could not create preliminary pending lead", e);
    }

    // 2. Launch Razorpay Hosted Checkout Interface
    try {
      await initiateRazorpayCheckout({
        amount: totalAmount,
        currency: "INR",
        passName: selectedPass.name,
        quantity,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        name: "Rang Tarang Garba Mahotsav 2026",
        description: `${quantity}x ${selectedPass.name} (Total: ₹${totalAmount})`,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: formData.email.trim()
        },
        themeColor: "#e5b869",
        onSuccess: async (response) => {
          setLoading(true);
          const paymentId = response.razorpay_payment_id || `PAY_${Date.now()}`;

          let finalPass = null;
          if (pendingRecord && pendingRecord.id) {
            await updateRegistrationData(pendingRecord.id, {
              status: "Approved",
              paymentMethod: "Razorpay Online (UPI/Cards)",
              transactionRef: paymentId,
              unitPrice,
              subtotal,
              taxPercent: TAX_PERCENT,
              taxAmount,
              totalAmount,
              paidAt: new Date().toISOString(),
              childrenCount: Number(formData.childrenCount) || 0,
              children: childrenList.map((c) => ({
                name: c.name.trim(),
                age: Number(c.age) || 0,
                aadhaar: (c.aadhaar || "").replace(/\D/g, "")
              }))
            });
            finalPass = {
              ...pendingRecord,
              status: "Approved",
              paymentMethod: "Razorpay Online (UPI/Cards)",
              transactionRef: paymentId,
              unitPrice,
              subtotal,
              taxPercent: TAX_PERCENT,
              taxAmount,
              totalAmount,
              childrenCount: Number(formData.childrenCount) || 0,
              children: childrenList.map((c) => ({
                name: c.name.trim(),
                age: Number(c.age) || 0,
                aadhaar: (c.aadhaar || "").replace(/\D/g, "")
              }))
            };
          } else {
            finalPass = await registerAttendee({
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              city: formData.city.trim(),
              passType: selectedPass.name,
              quantity,
              unitPrice,
              subtotal,
              taxPercent: TAX_PERCENT,
              taxAmount,
              totalAmount,
              paymentMethod: "Razorpay Online (UPI/Cards)",
              paymentStatus: "Approved",
              transactionRef: paymentId,
              attendees: attendees.map((a) => ({
                name: a.name.trim(),
                aadhaar: a.aadhaar.trim()
              })),
              childrenCount: Number(formData.childrenCount) || 0,
              children: childrenList.map((c) => ({
                name: c.name.trim(),
                age: Number(c.age) || 0,
                aadhaar: (c.aadhaar || "").replace(/\D/g, "")
              }))
            });
          }

          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });

          setLoading(false);
          if (onSuccess) {
            onSuccess(finalPass);
          }
        },
        onDismiss: () => {
          setLoading(false);
          setStep(2);
          setPaymentMethodTab("upi_qr");
          setErrorMsg(
            "Razorpay payment was cancelled or closed. You can scan the instant UPI QR code below to complete your pass booking!"
          );
        }
      });
    } catch (err) {
      console.error("Razorpay initiation failed, falling back to UPI QR Tab:", err);
      setLoading(false);
      setStep(2);
      setPaymentMethodTab("upi_qr");
      setErrorMsg(
        "Online gateway is currently busy. Please scan the Instant VIP QR Code below or enter your UPI Ref ID to confirm!"
      );
    }
  };

  // Fallback Manual / UPI QR Confirmation Handler
  const handleUpiQrConfirm = async (e) => {
    e.preventDefault();
    const cleanRef = formData.transactionRef.trim();
    if (!cleanRef || cleanRef.length < 6) {
      setErrorMsg("Please enter valid 12-digit UPI Reference / UTR / Transaction ID");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const finalPass = await registerAttendee({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        passType: selectedPass.name,
        quantity,
        unitPrice,
        subtotal,
        taxPercent: TAX_PERCENT,
        taxAmount,
        totalAmount,
        paymentMethod: "UPI QR Scan & Pay",
        paymentStatus: "Approved",
        transactionRef: cleanRef,
        attendees: attendees.map((a) => ({
          name: a.name.trim(),
          aadhaar: a.aadhaar.trim()
        })),
        childrenCount: Number(formData.childrenCount) || 0,
        children: childrenList.map((c) => ({
          name: c.name.trim(),
          age: Number(c.age) || 0,
          aadhaar: (c.aadhaar || "").replace(/\D/g, "")
        }))
      });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setLoading(false);
      if (onSuccess) {
        onSuccess(finalPass);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to confirm pass: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl my-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-3 pr-8 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 font-serif-royal">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            VIP Ticket Booking & Instant E-Pass
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">Book Your VIP Pass</h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Fill attendee info & click Proceed to Pay to open Razorpay Gateway directly
          </p>
        </div>

        {/* Modal Body Container with Scroll */}
        <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar space-y-3 sm:space-y-4">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}


          {/* Real-time Child Policy Age Violation Banner */}
          {hasInvalidChildAge && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 text-xs font-bold flex items-start gap-2.5 shadow-lg shadow-rose-500/25 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-rose-300 block text-xs sm:text-sm">
                  ⚠️ CHILD AGE POLICY VIOLATION (ENTRY NOT PERMITTED)
                </span>
                <span>
                  Children above 5 years of age are strictly NOT ALLOWED into the venue arena! Only children up to 5 years (≤ 5 Yrs) are permitted with FREE entry.
                </span>
              </div>
            </div>
          )}

          {/* Booking Option Selector: Online Payment vs VIP Coupon Code */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setBookingMode("payment");
                handleRemoveCoupon();
              }}
              className={`py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${bookingMode === "payment" && !appliedCoupon
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md"
                : "text-slate-300 hover:text-white"
                }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Pay Online (₹{pricing.finalPrice})</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingMode("coupon")}
              className={`py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${bookingMode === "coupon" || appliedCoupon
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md"
                : "text-slate-300 hover:text-white"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Apply VIP Code (Free)</span>
            </button>
          </div>

          {/* VIP Promo / Coupon Code Section - ONLY SHOWN WHEN 'Apply VIP Code (Free)' IS CLICKED OR CODE IS APPLIED */}
          {(bookingMode === "coupon" || appliedCoupon) && (
            <div
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all space-y-2 animate-in fade-in duration-200 ${appliedCoupon
                ? "bg-emerald-950/30 border-emerald-500/50"
                : "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-serif-royal">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Enter VIP Access / Coupon Code
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">
                  100% Free VIP Pass
                </span>
              </div>

              {!appliedCoupon ? (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={couponCodeInput}
                        onChange={(e) => {
                          setCouponCodeInput(e.target.value.toUpperCase());
                          setCouponValidationMsg(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter Coupon Code"
                        className="w-full bg-[#090214] border border-amber-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={couponValidating}
                      onClick={handleApplyCoupon}
                      className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50"
                    >
                      {couponValidating ? "Checking DB..." : "Apply Code"}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-mono font-black text-white text-xs sm:text-sm tracking-wider">
                        {appliedCoupon.code}
                      </div>
                      <span className="text-[10px] text-emerald-300 block font-semibold">
                        ✓ 100% Complimentary VIP Pass Applied (Payable: ₹0)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-rose-300 hover:text-rose-200 underline font-semibold px-2 py-1"
                  >
                    Remove Code
                  </button>
                </div>
              )}

              {couponValidationMsg && (
                <div
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${couponValidationMsg.type === "success"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                >
                  {couponValidationMsg.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span>{couponValidationMsg.text}</span>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3 text-left">
            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Phone */}
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  WhatsApp Mobile No. *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    required
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Your Email Id"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* City */}
              <div className="sm:col-span-2">
                <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Chomu / Jaipur"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b0a38] border border-white/15 rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Attendees & Aadhaar Card Numbers Section */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-serif-royal">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span>Pass Holder Info (2 Persons Entry)</span>
                </label>
                <span className="text-[8px] sm:text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold uppercase tracking-wider">
                  * Mandatory for Entry
                </span>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                {attendees.map((att, idx) => {
                  const personLabel = idx === 0 ? "Person 1 (Primary Pass Holder)" : "Person 2 (Accompanying Partner)";

                  return (
                    <div
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#180733] border border-amber-500/30 space-y-2 shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5 text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                          <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                          {personLabel}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-slate-400">
                          Pass Holder #{idx + 1}
                        </span>
                      </div>

                      {/* Attendee Name */}
                      <div>
                        <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          Full Name ({idx === 0 ? "Person 1" : "Person 2"}) *
                        </label>

                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 sm:top-2.5" />
                          <input
                            type="text"
                            placeholder="Enter Full Name"
                            value={att.name}
                            onChange={(e) => handleAttendeeChange(idx, "name", e.target.value)}
                            required
                            className="w-full bg-[#0e0320] border border-white/15 rounded-xl pl-8 pr-2.5 py-1.5 sm:py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accompanying Child Section (Max 1 Child ≤ 5 Yrs FREE Entry + Child Name & Aadhaar) */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-serif-royal">
                  <Baby className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span>Accompanying Child (Max 1 Child ≤ 5 Yrs Allowed)</span>
                </label>
                <span className="text-[8px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                  👶 1 Child Free Entry (₹0)
                </span>
              </div>

              {/* Child Policy Information Note */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] sm:text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Child Policy (Max 1 Child): </strong>
                  Only <span className="text-emerald-400 font-bold">1 child up to 5 years</span> is allowed per Couple Pass with 100% FREE ENTRY. Mandatory Child Full Name & Age required.
                  <span className="text-rose-300 font-bold ml-1">⚠️ Children above 5 years or more than 1 child strictly NOT ALLOWED.</span>
                </div>
              </div>

              {/* Child Count Selector (0, 1 only) */}
              <div className="p-2.5 rounded-xl bg-[#180733] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">
                    Bringing a child with you (Age ≤ 5 yrs)?
                  </span>
                  <div className="inline-flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
                    {[0, 1].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleChildrenCountChange(cnt)}
                        className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${formData.childrenCount === cnt
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md"
                          : "text-slate-300 hover:text-white"
                          }`}
                      >
                        {cnt === 0 ? "No Child (0)" : "Yes, 1 Child (Free Entry)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Child Inputs if childrenCount > 0 */}
                {formData.childrenCount > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    {childrenList.map((child, cIdx) => {
                      const isAgeInvalid = Number(child.age) > 5;

                      return (
                        <div
                          key={cIdx}
                          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#180733] border space-y-2 shadow-md transition-all ${isAgeInvalid
                            ? "border-rose-500/40 bg-rose-950/10"
                            : "border-amber-500/30"
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                            <span className="flex items-center gap-1 text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                              <Baby className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              Child #{cIdx + 1} (Free Entry ≤ 5 Yrs)
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
                              Free Entry
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Child Name */}
                            <div>
                              <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Child Full Name *
                              </label>
                              <div className="relative">
                                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 sm:top-2.5" />
                                <input
                                  type="text"
                                  placeholder="Enter Child Full Name"
                                  value={child.name || ""}
                                  onChange={(e) => handleChildFieldChange(cIdx, "name", e.target.value)}
                                  required
                                  className="w-full bg-[#0e0320] border border-white/15 rounded-xl pl-8 pr-2.5 py-1.5 sm:py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Child Age */}
                            <div>
                              <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Child Age (≤ 5 Yrs Free) *
                              </label>
                              <select
                                value={child.age || "3"}
                                onChange={(e) => handleChildFieldChange(cIdx, "age", e.target.value)}
                                required
                                className={`w-full bg-[#0e0320] border rounded-xl px-2.5 py-1.5 sm:py-2 text-xs focus:outline-none transition-colors cursor-pointer ${isAgeInvalid
                                  ? "border-rose-500 text-rose-300 bg-rose-950/30"
                                  : "border-white/15 text-white focus:border-amber-400"
                                  }`}
                              >
                                <option value="1">1 Year Old (Free Entry)</option>
                                <option value="2">2 Years Old (Free Entry)</option>
                                <option value="3">3 Years Old (Free Entry)</option>
                                <option value="4">4 Years Old (Free Entry)</option>
                                <option value="5">5 Years Old (Free Entry)</option>
                                <option value="6">6+ Years (Not Allowed)</option>
                              </select>
                            </div>
                          </div>

                          {isAgeInvalid && (
                            <p className="text-[9px] sm:text-[10px] text-rose-400 mt-1 pl-1 font-bold flex items-center gap-1">
                              ❌ Children above 5 years of age are strictly NOT ALLOWED into the venue arena!
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>



            {/* Transparent Order Summary Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1e0a3b] via-[#140628] to-[#0c0318] border border-amber-500/35 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                  <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedPass.name} ({quantity} {quantity === 1 ? "Couple Pass" : "Couple Passes"})</span>
                </div>
                <span className="text-white font-bold font-mono text-xs">
                  {appliedCoupon ? "₹0 (FREE)" : `₹${subtotal.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="space-y-1.5 text-[10px] sm:text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pass Subtotal ({quantity} x ₹{unitPrice.toLocaleString("en-IN")})</span>
                  <span className="text-slate-200 font-mono">
                    {appliedCoupon ? "₹0 (FREE)" : `₹${subtotal.toLocaleString("en-IN")}`}
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-emerald-400 text-[10px] sm:text-[11px] font-bold">
                    <span>🎟️ VIP Complimentary Pass ({appliedCoupon.code})</span>
                    <span>100% OFF (FREE VIP ENTRY)</span>
                  </div>
                ) : (
                  pricing.isDiscounted && totalSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 text-[10px]">
                      <span>🎉 Special Offer Savings</span>
                      <span className="font-bold">-₹{totalSavings.toLocaleString("en-IN")}</span>
                    </div>
                  )
                )}

                {formData.childrenCount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 text-[10px]">
                    <span>👶 Accompanying Child (≤ 5 Yrs Free Entry)</span>
                    <span className="font-bold">FREE (₹0)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider block font-serif-royal">
                    Total Payable Amount
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-base sm:text-xl font-black font-mono ${appliedCoupon ? "text-emerald-400" : "text-gold-gradient"
                      }`}
                  >
                    {appliedCoupon ? "₹0 (FREE PASS)" : `₹${totalAmount.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Proceed / Confirm Submit Button */}
            <div className="pt-2 sticky bottom-0 bg-[#110524]/95 backdrop-blur-md pb-1 z-20 space-y-1.5">
              <button
                type="submit"
                disabled={loading || couponValidating || hasInvalidChildAge}
                className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation ${hasInvalidChildAge
                  ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                  : appliedCoupon
                    ? "text-black bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-400 hover:opacity-95 shadow-xl shadow-amber-500/25"
                    : "text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/25"
                  }`}
              >
                {appliedCoupon || bookingMode === "coupon" ? (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                ) : (
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                )}
                {hasInvalidChildAge
                  ? "⚠️ CHILD AGE ABOVE 5 NOT ALLOWED"
                  : loading
                    ? appliedCoupon
                      ? "Confirming VIP Free Pass..."
                      : "Launching Razorpay Gateway..."
                    : appliedCoupon
                      ? "CONFIRM FREE VIP PASS (₹0)"
                      : bookingMode === "coupon"
                        ? "CONFIRM WITH VIP CODE (₹0)"
                        : `PROCEED TO PAY (₹${totalAmount.toLocaleString("en-IN")})`}
              </button>
              <div className="text-center text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                {appliedCoupon ? (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>100% Complimentary VIP Access • Pass Confirmed with Code {appliedCoupon.code}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Secured by Razorpay • Total Payable ₹{totalAmount.toLocaleString("en-IN")}</span>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
