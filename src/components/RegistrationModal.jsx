"use client";
import React, { useState, useEffect } from "react";
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
import { validateAadhaar, checkDuplicateAadhaarInDb, formatAadhaar } from "@/lib/aadhaarValidator";
import { PASS_OPTIONS } from "./PassTiers";
import { subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";
import { initiateRazorpayCheckout } from "@/lib/razorpayService";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";

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

  useEffect(() => {
    const unsubDisc = subscribeToDiscountConfig((cfg) => setDiscountConfig(cfg));
    const unsubInv = subscribeToInventoryConfig((inv) => setInventoryConfig(inv));
    const unsubReg = subscribeToRegistrations((list) => setRegistrations(list));

    return () => {
      if (typeof unsubDisc === "function") unsubDisc();
      if (typeof unsubInv === "function") unsubInv();
      if (typeof unsubReg === "function") unsubReg();
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
  const quantity = Number(formData.quantity) || 1;
  const subtotal = unitPrice * quantity;
  const TAX_PERCENT = 18; // 18% GST / Govt Tax
  const taxAmount = Math.round((subtotal * TAX_PERCENT) / 100);
  const totalAmount = subtotal + taxAmount; // Final payable amount including 18% tax

  const originalSubtotal = pricing.basePrice * quantity;
  const originalTax = Math.round((originalSubtotal * TAX_PERCENT) / 100);
  const originalTotal = originalSubtotal + originalTax;
  const totalSavings = originalTotal - totalAmount;

  // Extract all non-empty Aadhaar numbers in the entire booking form (Adults + Children)
  const cleanAadhaar1 = (attendees[0]?.aadhaar || "").replace(/\D/g, "");
  const cleanAadhaar2 = (attendees[1]?.aadhaar || "").replace(/\D/g, "");
  const isSameAadhaarBetweenPersons =
    cleanAadhaar1.length >= 4 &&
    cleanAadhaar2.length >= 4 &&
    cleanAadhaar1 === cleanAadhaar2;

  const allFilledAadhaars = [
    ...attendees.map((a) => (a.aadhaar || "").replace(/\D/g, "")),
    ...(formData.childrenCount > 0 ? childrenList.map((c) => (c.aadhaar || "").replace(/\D/g, "")) : [])
  ].filter((digits) => digits.length >= 4);

  const hasDuplicateAadhaarInEntireForm =
    allFilledAadhaars.length > 1 &&
    new Set(allFilledAadhaars).size !== allFilledAadhaars.length;

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

    // MANDATORY NAME & UNIQUE 12-DIGIT AADHAAR FOR ALL ATTENDEES (UIDAI VERHOEFF + NO DUPLICATE)
    const seenAadhaars = new Set();
    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i] || {};
      const pNum = i + 1;
      const passIndex = Math.floor(i / 2) + 1;
      const personLetter = i % 2 === 0 ? "Person 1" : "Person 2";
      const attName = (att.name || "").trim();
      const rawAadhaar = (att.aadhaar || "").trim();
      const cleanAadhaar = rawAadhaar.replace(/\D/g, "");

      if (!attName) {
        setErrorMsg(`Please enter Full Name for Person #${pNum} (Pass ${passIndex} - ${personLetter})`);
        return false;
      }
      if (attName.length < 3) {
        setErrorMsg(`Full Name for Person #${pNum} must be at least 3 characters`);
        return false;
      }
      if (!cleanAadhaar) {
        setErrorMsg(`Please enter 12-digit Aadhaar Card Number for Person #${pNum} (${personLetter})`);
        return false;
      }
      if (cleanAadhaar.length !== 12) {
        setErrorMsg(`Aadhaar Card Number for Person #${pNum} (${personLetter}) must be exactly 12 numeric digits (${cleanAadhaar.length}/12 entered)`);
        return false;
      }

      // 1. UIDAI Verhoeff Checksum & Algorithm Validation
      const aadhaarCheck = validateAadhaar(cleanAadhaar);
      if (!aadhaarCheck.isValid) {
        setErrorMsg(`Person #${pNum} (${personLetter}) Aadhaar Error: ${aadhaarCheck.message}`);
        return false;
      }

      // 2. Duplicate Aadhaar Check inside Current Booking Form
      if (seenAadhaars.has(cleanAadhaar)) {
        setErrorMsg(`Duplicate Aadhaar Error: Person 1 and Person 2 cannot have the same Aadhaar Card Number! Please enter a unique 12-digit Aadhaar for each attendee.`);
        return false;
      }
      seenAadhaars.add(cleanAadhaar);

      // 3. Duplicate Aadhaar Check across Entire Database Registrations
      const dbCheck = checkDuplicateAadhaarInDb(cleanAadhaar, registrations);
      if (dbCheck.isDuplicate) {
        const existing = dbCheck.existingPass;
        setErrorMsg(
          `Aadhaar Number (${formatAadhaar(cleanAadhaar)}) is ALREADY REGISTERED for Pass ID "${existing?.passId || "CONFIRMED"}" (Booked by: ${existing?.fullName || "Guest"}). Only 1 VIP pass per Aadhaar card is permitted!`
        );
        return false;
      }
    }

    // 4. Accompanying Children Validation (≤ 5 Years FREE, > 5 Years strictly blocked + Mandatory Name & 12-Digit Aadhaar)
    if (formData.childrenCount > 0) {
      for (let c = 0; c < childrenList.length; c++) {
        const child = childrenList[c] || {};
        const cNum = c + 1;
        const cName = (child.name || "").trim();
        const cAge = Number(child.age);
        const rawChildAadhaar = (child.aadhaar || "").trim();
        const cleanChildAadhaar = rawChildAadhaar.replace(/\D/g, "");

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

        // Child 12-Digit Aadhaar Validation
        if (!cleanChildAadhaar) {
          setErrorMsg(`Please enter 12-digit Aadhaar Card Number for Child #${cNum} (${cName})`);
          return false;
        }
        if (cleanChildAadhaar.length !== 12) {
          setErrorMsg(`Aadhaar Card Number for Child #${cNum} (${cName}) must be exactly 12 numeric digits (${cleanChildAadhaar.length}/12 entered)`);
          return false;
        }

        // 1. UIDAI Verhoeff Checksum
        const childAadhaarCheck = validateAadhaar(cleanChildAadhaar);
        if (!childAadhaarCheck.isValid) {
          setErrorMsg(`Child #${cNum} (${cName}) Aadhaar Error: ${childAadhaarCheck.message}`);
          return false;
        }

        // 2. Duplicate inside Form (Adults + Children)
        if (seenAadhaars.has(cleanChildAadhaar)) {
          setErrorMsg(`Duplicate Aadhaar Error: Child #${cNum} (${cName}) has the same Aadhaar Card Number as another attendee or child in this booking! Every person must have a unique Aadhaar.`);
          return false;
        }
        seenAadhaars.add(cleanChildAadhaar);

        // 3. Duplicate in Database
        const childDbCheck = checkDuplicateAadhaarInDb(cleanChildAadhaar, registrations);
        if (childDbCheck.isDuplicate) {
          const existing = childDbCheck.existingPass;
          setErrorMsg(
            `Child Aadhaar Number (${formatAadhaar(cleanChildAadhaar)}) is ALREADY REGISTERED for Pass ID "${existing?.passId || "CONFIRMED"}" (Booked by: ${existing?.fullName || "Guest"}). Only 1 pass per Aadhaar card is permitted!`
          );
          return false;
        }
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

  // Razorpay Automated Payment Handler with Instant Pending Lead Recording
  const handleRazorpayPayment = async () => {
    setErrorMsg("");
    setLoading(true);

    // 1. Immediately record an "Incomplete / Pending Payment" registration lead in database
    let pendingRecord = null;
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
      pendingRecord = await registerAttendee(initialPayload);
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
        description: `${quantity}x ${selectedPass.name} (₹${subtotal} + 18% GST ₹${taxAmount} = ₹${totalAmount})`,
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

          {/* Real-time Form Duplicate Aadhaar Error Banner */}
          {hasDuplicateAadhaarInEntireForm && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 text-xs font-bold flex items-start gap-2.5 shadow-lg shadow-rose-500/25 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-rose-300 block text-xs sm:text-sm">
                  ⚠️ DUPLICATE AADHAAR CARD DETECTED (ERROR)
                </span>
                <span>
                  All attendees (Person 1, Person 2, and accompanying children) must have unique 12-digit Aadhaar Card Numbers! The same Aadhaar number cannot be used twice.
                </span>
              </div>
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
                  const rawAadhaar = (att.aadhaar || "").replace(/\D/g, "");
                  const isAadhaarFull = rawAadhaar.length === 12;

                  // 1. Format & Verhoeff validation
                  const aadhaarValidation = validateAadhaar(rawAadhaar);
                  const isFormatValid = aadhaarValidation.isValid;

                  // 2. In-form duplicate check with other attendees and children
                  const isThisPersonDuplicate =
                    (rawAadhaar.length >= 4 &&
                      allFilledAadhaars.filter((d) => d === rawAadhaar).length > 1);

                  // 3. Database duplicate check
                  const dbDuplicateCheck = isAadhaarFull ? checkDuplicateAadhaarInDb(rawAadhaar, registrations) : { isDuplicate: false };
                  const isDbDuplicate = dbDuplicateCheck.isDuplicate;

                  const hasError = isThisPersonDuplicate || (isAadhaarFull && (!isFormatValid || isDbDuplicate));
                  const isAadhaarSuccess = isAadhaarFull && isFormatValid && !isThisPersonDuplicate && !isDbDuplicate;

                  let badgeText = `${rawAadhaar.length}/12 Digits`;
                  let badgeClass = "bg-white/5 border-white/10 text-slate-400";

                  if (isThisPersonDuplicate) {
                    badgeText = "⚠️ SAME AADHAAR ERROR";
                    badgeClass = "bg-rose-500/25 border-rose-500/50 text-rose-300 font-bold animate-pulse";
                  } else if (isDbDuplicate) {
                    badgeText = `⚠️ Already Registered (${dbDuplicateCheck.existingPass?.passId || "VIP"})`;
                    badgeClass = "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold";
                  } else if (isAadhaarFull && !isFormatValid) {
                    badgeText = "⚠️ Invalid Checksum";
                    badgeClass = "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold";
                  } else if (isAadhaarSuccess) {
                    badgeText = "✓ Unique & Verified";
                    badgeClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold";
                  } else if (rawAadhaar.length > 0) {
                    badgeText = `${rawAadhaar.length}/12 Digits`;
                    badgeClass = "bg-amber-500/15 border-amber-500/30 text-amber-300";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#180733] border space-y-2 shadow-md transition-all ${isThisPersonDuplicate
                        ? "border-rose-500 bg-rose-950/25 ring-2 ring-rose-500/30"
                        : isAadhaarSuccess
                          ? "border-emerald-500/40 bg-emerald-950/10"
                          : hasError
                            ? "border-rose-500/40 bg-rose-950/10"
                            : "border-amber-500/30"
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5 text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                          <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                          {personLabel}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                        {/* Attendee Aadhaar */}
                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between">
                            <span>12-Digit Aadhaar Card *</span>
                            <span className="font-mono text-[8px] sm:text-[9px] text-slate-400">
                              {rawAadhaar.length > 0 && formatAadhaar(rawAadhaar)}
                            </span>
                          </label>
                          <div className="relative">
                            <ShieldCheck
                              className={`w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 ${isThisPersonDuplicate || hasError
                                ? "text-rose-400"
                                : isAadhaarSuccess
                                  ? "text-emerald-400"
                                  : "text-slate-400"
                                }`}
                            />
                            <input
                              type="text"
                              placeholder="12-digit Aadhaar No."
                              value={att.aadhaar}
                              onChange={(e) => handleAttendeeChange(idx, "aadhaar", e.target.value)}
                              maxLength={12}
                              required
                              className={`w-full bg-[#0e0320] border rounded-xl pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-mono tracking-wider text-white placeholder-slate-500 focus:outline-none transition-colors ${isThisPersonDuplicate
                                ? "border-rose-500 text-rose-200 bg-rose-950/40 ring-1 ring-rose-500"
                                : isAadhaarSuccess
                                  ? "border-emerald-500/60 text-emerald-300 bg-emerald-950/20"
                                  : hasError
                                    ? "border-rose-500/60 text-rose-300 bg-rose-950/20"
                                    : "border-white/15 focus:border-amber-400"
                                }`}
                            />
                          </div>

                          {/* Realtime Inline Errors */}
                          {isThisPersonDuplicate && (
                            <p className="text-[9px] text-rose-400 mt-1 pl-1 font-bold flex items-center gap-1">
                              <span>❌ Aadhaar Number cannot be duplicated across attendees or children!</span>
                            </p>
                          )}
                          {isDbDuplicate && !isThisPersonDuplicate && (
                            <p className="text-[9px] text-rose-400 mt-1 pl-1 font-semibold">
                              🚫 Already registered for Pass ID: {dbDuplicateCheck.existingPass?.passId} ({dbDuplicateCheck.existingPass?.fullName})
                            </p>
                          )}
                          {isAadhaarFull && !isFormatValid && !isDbDuplicate && !isThisPersonDuplicate && (
                            <p className="text-[9px] text-rose-400 mt-1 pl-1 font-semibold">
                              ⚠️ {aadhaarValidation.message}
                            </p>
                          )}
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
                  Only <span className="text-emerald-400 font-bold">1 child up to 5 years</span> is allowed per Couple Pass with 100% FREE ENTRY. Mandatory Child Full Name & 12-Digit Aadhaar Card required.
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
                      const rawChildAadhaar = (child.aadhaar || "").replace(/\D/g, "");
                      const isChildAadhaarFull = rawChildAadhaar.length === 12;

                      // 1. Format & Verhoeff validation
                      const childAadhaarValidation = validateAadhaar(rawChildAadhaar);
                      const isChildFormatValid = childAadhaarValidation.isValid;

                      // 2. In-form duplicate check with other attendees and other children
                      const isThisChildDuplicate =
                        (rawChildAadhaar.length >= 4 &&
                          allFilledAadhaars.filter((d) => d === rawChildAadhaar).length > 1);

                      // 3. Database duplicate check
                      const childDbDuplicateCheck = isChildAadhaarFull
                        ? checkDuplicateAadhaarInDb(rawChildAadhaar, registrations)
                        : { isDuplicate: false };
                      const isChildDbDuplicate = childDbDuplicateCheck.isDuplicate;

                      const hasChildError =
                        isThisChildDuplicate || (isChildAadhaarFull && (!isChildFormatValid || isChildDbDuplicate));
                      const isChildAadhaarSuccess =
                        isChildAadhaarFull && isChildFormatValid && !isThisChildDuplicate && !isChildDbDuplicate;

                      let childBadgeText = `${rawChildAadhaar.length}/12 Digits`;
                      let childBadgeClass = "bg-white/5 border-white/10 text-slate-400";

                      if (isThisChildDuplicate) {
                        childBadgeText = "⚠️ SAME AADHAAR ERROR";
                        childBadgeClass = "bg-rose-500/25 border-rose-500/50 text-rose-300 font-bold animate-pulse";
                      } else if (isChildDbDuplicate) {
                        childBadgeText = `⚠️ Already Registered (${childDbDuplicateCheck.existingPass?.passId || "VIP"})`;
                        childBadgeClass = "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold";
                      } else if (isChildAadhaarFull && !isChildFormatValid) {
                        childBadgeText = "⚠️ Invalid Checksum";
                        childBadgeClass = "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold";
                      } else if (isChildAadhaarSuccess) {
                        childBadgeText = "✓ Unique & Verified";
                        childBadgeClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold";
                      } else if (rawChildAadhaar.length > 0) {
                        childBadgeText = `${rawChildAadhaar.length}/12 Digits`;
                        childBadgeClass = "bg-amber-500/15 border-amber-500/30 text-amber-300";
                      }

                      return (
                        <div
                          key={cIdx}
                          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#180733] border space-y-2 shadow-md transition-all ${isThisChildDuplicate
                            ? "border-rose-500 bg-rose-950/25 ring-2 ring-rose-500/30"
                            : isChildAadhaarSuccess
                              ? "border-emerald-500/40 bg-emerald-950/10"
                              : hasChildError || isAgeInvalid
                                ? "border-rose-500/40 bg-rose-950/10"
                                : "border-amber-500/30"
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                            <span className="flex items-center gap-1 text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                              <Baby className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              Child #{cIdx + 1} (Free Entry ≤ 5 Yrs)
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border ${childBadgeClass}`}>
                              {childBadgeText}
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

                            {/* Child Aadhaar Card Number */}
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between">
                                <span>Child 12-Digit Aadhaar Card *</span>
                                <span className="font-mono text-[8px] sm:text-[9px] text-slate-400">
                                  {rawChildAadhaar.length > 0 && formatAadhaar(rawChildAadhaar)}
                                </span>
                              </label>
                              <div className="relative">
                                <ShieldCheck
                                  className={`w-3.5 h-3.5 absolute left-2.5 top-2 sm:top-2.5 ${isThisChildDuplicate || hasChildError
                                    ? "text-rose-400"
                                    : isChildAadhaarSuccess
                                      ? "text-emerald-400"
                                      : "text-slate-400"
                                    }`}
                                />
                                <input
                                  type="text"
                                  placeholder="Child 12-digit Aadhaar No."
                                  value={child.aadhaar || ""}
                                  onChange={(e) => handleChildFieldChange(cIdx, "aadhaar", e.target.value)}
                                  maxLength={12}
                                  required
                                  className={`w-full bg-[#0e0320] border rounded-xl pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-mono tracking-wider text-white placeholder-slate-500 focus:outline-none transition-colors ${isThisChildDuplicate
                                    ? "border-rose-500 text-rose-200 bg-rose-950/40 ring-1 ring-rose-500"
                                    : isChildAadhaarSuccess
                                      ? "border-emerald-500/60 text-emerald-300 bg-emerald-950/20"
                                      : hasChildError
                                        ? "border-rose-500/60 text-rose-300 bg-rose-950/20"
                                        : "border-white/15 focus:border-amber-400"
                                    }`}
                                />
                              </div>

                              {/* Realtime Inline Errors for Child */}
                              {isThisChildDuplicate && (
                                <p className="text-[9px] text-rose-400 mt-1 pl-1 font-bold flex items-center gap-1">
                                  <span>❌ Child Aadhaar cannot be the same as any attendee or other child!</span>
                                </p>
                              )}
                              {isChildDbDuplicate && !isThisChildDuplicate && (
                                <p className="text-[9px] text-rose-400 mt-1 pl-1 font-semibold">
                                  🚫 Already registered for Pass ID: {childDbDuplicateCheck.existingPass?.passId} ({childDbDuplicateCheck.existingPass?.fullName})
                                </p>
                              )}
                              {isChildAadhaarFull && !isChildFormatValid && !isChildDbDuplicate && !isThisChildDuplicate && (
                                <p className="text-[9px] text-rose-400 mt-1 pl-1 font-semibold">
                                  ⚠️ {childAadhaarValidation.message}
                                </p>
                              )}
                              {isAgeInvalid && (
                                <p className="text-[9px] sm:text-[10px] text-rose-400 mt-1 pl-1 font-bold flex items-center gap-1">
                                  ❌ Children above 5 years of age are strictly NOT ALLOWED into the venue arena!
                                </p>
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

            {/* Transparent Order Summary & 18% Tax Breakdown Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1e0a3b] via-[#140628] to-[#0c0318] border border-amber-500/35 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 font-serif-royal text-[11px] sm:text-xs">
                  <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{selectedPass.name} ({quantity} {quantity === 1 ? "Couple Pass" : "Couple Passes"})</span>
                </div>
                <span className="text-white font-bold font-mono text-xs">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="space-y-1.5 text-[10px] sm:text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pass Subtotal ({quantity} x ₹{unitPrice.toLocaleString("en-IN")})</span>
                  <span className="text-slate-200 font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>Tax</span>

                  </span>
                  <span className="text-amber-300 font-mono font-bold">+₹{taxAmount.toLocaleString("en-IN")}</span>
                </div>

                {formData.childrenCount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 text-[10px]">
                    <span>👶 Accompanying Child (≤ 5 Yrs Free Entry)</span>
                    <span className="font-bold">FREE (₹0)</span>
                  </div>
                )}

                {pricing.isDiscounted && totalSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 text-[10px]">
                    <span>🎉 Special Offer Savings</span>
                    <span className="font-bold">-₹{totalSavings.toLocaleString("en-IN")}</span>
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
                  <span className="text-base sm:text-xl font-black text-gold-gradient font-mono">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Proceed to Pay Submit Button */}
            <div className="pt-2 sticky bottom-0 bg-[#110524]/95 backdrop-blur-md pb-1 z-20 space-y-1.5">
              {isSoldOut && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                  🚫 OUT OF STOCK: All {maxTickets} VIP Passes for Rang Tarang Garba 2026 have been booked!
                </div>
              )}
              <button
                type="submit"
                disabled={loading || isSoldOut || hasDuplicateAadhaarInEntireForm || hasInvalidChildAge}
                className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation ${isSoldOut || hasDuplicateAadhaarInEntireForm || hasInvalidChildAge
                  ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                  : "text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-xl shadow-amber-500/25"
                  }`}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                {isSoldOut
                  ? `OUT OF STOCK (${soldPasses}/${maxTickets} SOLD)`
                  : hasDuplicateAadhaarInEntireForm
                    ? "⚠️ FIX DUPLICATE AADHAAR TO PROCEED"
                    : hasInvalidChildAge
                      ? "⚠️ CHILD AGE ABOVE 5 NOT ALLOWED"
                      : loading
                        ? "Launching Razorpay Gateway..."
                        : `PROCEED TO PAY (₹${totalAmount.toLocaleString("en-IN")})`}
              </button>
              {!isSoldOut && (
                <div className="text-center text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Secured by Razorpay • Total ₹{totalAmount.toLocaleString("en-IN")} (Includes 18% GST)</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
