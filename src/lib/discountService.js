"use client";

const LOCAL_STORAGE_KEY = "dandiya_discount_config";

export const DEFAULT_DISCOUNT_CONFIG = {
  enabled: true,
  basePrice: 1599,
  dynamicScheduleActive: true,
  overrideDiscountPercent: null, // e.g., 20 for 20% OFF
  overrideDiscountFlat: null, // e.g., 300 for ₹300 OFF
  eventTargetDate: "2026-10-17T19:00:00.000Z"
};

// Read local discount config
export const getDiscountConfig = () => {
  if (typeof window === "undefined") return DEFAULT_DISCOUNT_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DISCOUNT_CONFIG));
      return DEFAULT_DISCOUNT_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Discount config read error:", e);
    return DEFAULT_DISCOUNT_CONFIG;
  }
};

// Save local discount config and notify subscribers
export const saveDiscountConfig = (config) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("dandiya_discount_update"));
  } catch (e) {
    console.error("Discount config save error:", e);
  }
};

// Subscribe to discount updates
export const subscribeToDiscountConfig = (callback) => {
  const notify = () => {
    callback(getDiscountConfig());
  };
  notify();

  if (typeof window !== "undefined") {
    window.addEventListener("dandiya_discount_update", notify);
    return () => {
      window.removeEventListener("dandiya_discount_update", notify);
    };
  }
  return () => {};
};

// Calculate pricing details based on current config & time remaining
export const calculateTicketPrice = (config) => {
  const currentConfig = config || DEFAULT_DISCOUNT_CONFIG;
  const basePrice = currentConfig.basePrice || 1599;

  if (!currentConfig.enabled) {
    return {
      basePrice,
      finalPrice: basePrice,
      totalDiscountAmount: 0,
      discountBadge: null,
      discountReason: null,
      isDiscounted: false,
      daysLeft: null
    };
  }

  let discountAmount = 0;
  let badgeText = "";
  let reasonText = "";

  // 1. Calculate days remaining to target event date
  const now = new Date();
  const target = new Date(currentConfig.eventTargetDate || "2026-10-17T19:00:00.000Z");
  const diffMs = target.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // 2. Check manual override discount first
  if (currentConfig.overrideDiscountFlat && currentConfig.overrideDiscountFlat > 0) {
    discountAmount = Math.min(currentConfig.overrideDiscountFlat, basePrice - 1);
    badgeText = `FLAT ₹${discountAmount} OFF`;
    reasonText = "Special Admin Offer";
  } else if (currentConfig.overrideDiscountPercent && currentConfig.overrideDiscountPercent > 0) {
    discountAmount = Math.round((basePrice * currentConfig.overrideDiscountPercent) / 100);
    badgeText = `${currentConfig.overrideDiscountPercent}% OFF`;
    reasonText = "Special Admin Offer";
  } else if (currentConfig.dynamicScheduleActive) {
    // Dynamic time-based discount reduction schedule
    if (daysLeft > 15) {
      discountAmount = Math.round(basePrice * 0.25); // 25% OFF (~₹400 off)
      badgeText = "25% OFF • Super Early Bird";
      reasonText = `Super Early Bird Offer (${daysLeft} days left - Discount reduces soon!)`;
    } else if (daysLeft > 10) {
      discountAmount = Math.round(basePrice * 0.20); // 20% OFF (~₹320 off)
      badgeText = "20% OFF • Early Bird Phase 1";
      reasonText = `Early Bird Phase 1 (${daysLeft} days left - Price increases soon!)`;
    } else if (daysLeft > 5) {
      discountAmount = Math.round(basePrice * 0.10); // 10% OFF (~₹160 off)
      badgeText = "10% OFF • Early Bird Phase 2";
      reasonText = `Early Bird Phase 2 (${daysLeft} days left - Price increases soon!)`;
    } else if (daysLeft > 0) {
      discountAmount = Math.round(basePrice * 0.05); // 5% OFF (~₹80 off)
      badgeText = "5% OFF • Last Chance";
      reasonText = `Last Chance Discount (${daysLeft} days left)`;
    } else {
      discountAmount = 0;
      badgeText = null;
      reasonText = "Standard Festival Ticket";
    }
  }

  const finalPrice = Math.max(100, basePrice - discountAmount);

  return {
    basePrice,
    finalPrice,
    totalDiscountAmount: discountAmount,
    discountBadge: badgeText,
    discountReason: reasonText,
    isDiscounted: discountAmount > 0,
    daysLeft
  };
};
