// Razorpay Payment Gateway Integration Service for Rang Tarang Garba 2026

export const getRazorpayKeyId = () => {
  if (typeof window !== "undefined") {
    const savedKey = localStorage.getItem("dandiya_razorpay_key") || sessionStorage.getItem("dandiya_razorpay_key");
    if (savedKey && savedKey.trim()) {
      return savedKey.trim();
    }
  }
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RANGTARANG2026";
};

export const saveRazorpayKeyId = (keyId) => {
  const cleanKey = (keyId || "").trim();
  if (typeof window !== "undefined") {
    if (cleanKey) {
      localStorage.setItem("dandiya_razorpay_key", cleanKey);
      sessionStorage.setItem("dandiya_razorpay_key", cleanKey);
    } else {
      localStorage.removeItem("dandiya_razorpay_key");
      sessionStorage.removeItem("dandiya_razorpay_key");
    }
  }
  return cleanKey;
};

export const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existingScript = document.getElementById("razorpay-sdk");
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayCheckout = async ({
  amount,
  fullName,
  phone,
  email,
  passName,
  quantity,
  name,
  description,
  prefill,
  themeColor,
  onSuccess,
  onError,
  onDismiss,
  onModalDismiss
}) => {
  const isLoaded = await loadRazorpaySDK();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError("Could not connect to Razorpay Payment Gateway. Please check internet connection.");
    return;
  }

  const keyId = getRazorpayKeyId();
  const passQty = Number(quantity) || 1;
  const passTitle = passName || "Royal VIP Couple Pass";

  const options = {
    key: keyId,
    amount: Math.round(Number(amount) * 100), // Amount in paise (INR)
    currency: "INR",
    name: name || "RANG TARANG GARBA 2026",
    description: description || `${passTitle} (${passQty} ${passQty === 1 ? "Couple Pass" : "Couple Passes"} - Incl. 18% GST)`,
    image: "/logo.png",
    handler: function (response) {
      if (response && response.razorpay_payment_id) {
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || null,
            signature: response.razorpay_signature || null,
            paymentMethod: "Razorpay Automated (UPI / Card / Netbanking)"
          });
        }
      } else {
        if (onError) onError("Payment completion failed. Missing payment ID.");
      }
    },
    prefill: {
      name: fullName || prefill?.name || "",
      email: email || prefill?.email || "guest@rangtaranggarba.com",
      contact: phone || prefill?.contact || ""
    },
    notes: {
      event: "Rang Tarang Garba 2026",
      venue: "Raj Vilas Garden, Chomu, Rajasthan",
      passName: passTitle,
      quantity: passQty
    },
    theme: {
      color: themeColor || "#e5b869",
      backdrop_color: "rgba(10, 4, 20, 0.85)"
    },
    modal: {
      ondismiss: function () {
        if (onModalDismiss) onModalDismiss();
        if (onDismiss) onDismiss();
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      const msg = response?.error?.description || "Payment process was declined or failed.";
      if (onError) onError(msg);
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay error:", err);
    if (onError) onError("Razorpay initialization error: " + err.message);
  }
};
