"use client";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseInstance } from "./firebase";

const LOCAL_STORAGE_KEY = "dandiya_discount_config";
const FIRESTORE_DOC_PATH = "dandiya_config";
const FIRESTORE_DOC_ID = "discount_settings";

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
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DISCOUNT_CONFIG, ...parsed };
  } catch (e) {
    console.error("Discount config read error:", e);
    return DEFAULT_DISCOUNT_CONFIG;
  }
};

// Save local & Firestore discount config and notify subscribers
export const saveDiscountConfig = async (config) => {
  const updated = { ...DEFAULT_DISCOUNT_CONFIG, ...config, updatedAt: new Date().toISOString() };
  
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("dandiya_discount_update"));
    } catch (e) {
      console.error("Discount config save local error:", e);
    }
  }

  // Firestore sync if connected
  const { db, isConnected } = getFirebaseInstance();
  if (isConnected && db) {
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.warn("Firestore save discount config failed, kept local:", e);
    }
  }
  return updated;
};

// Real-time subscribe to discount updates (Firestore + LocalStorage + Storage Events)
export const subscribeToDiscountConfig = (callback) => {
  const { db, isConnected } = getFirebaseInstance();

  const notify = (cfg) => {
    callback(cfg || getDiscountConfig());
  };

  // Initial call with local state
  notify();

  // Firestore real-time listener if available
  if (isConnected && db) {
    try {
      const docRef = doc(db, FIRESTORE_DOC_PATH, FIRESTORE_DOC_ID);
      const unsubscribeDoc = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const remoteConfig = snapshot.data();
            const merged = { ...DEFAULT_DISCOUNT_CONFIG, ...remoteConfig };
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              } catch (e) {}
            }
            callback(merged);
          }
        },
        (err) => {
          console.warn("Firestore discount listener warning:", err);
        }
      );
      return unsubscribeDoc;
    } catch (err) {
      console.warn("Error setting up Firestore discount listener:", err);
    }
  }

  // Local fallback event listeners
  if (typeof window !== "undefined") {
    const handleUpdate = () => notify();
    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) notify();
    };

    window.addEventListener("dandiya_discount_update", handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dandiya_discount_update", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }

  return () => {};
};

// Calculate pricing details based on current config & time remaining
export const calculateTicketPrice = (config) => {
  const currentConfig = config || DEFAULT_DISCOUNT_CONFIG;
  const basePrice = Number(currentConfig.basePrice) > 0 ? Number(currentConfig.basePrice) : 1599;

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
  const flatOverride = Number(currentConfig.overrideDiscountFlat);
  const percentOverride = Number(currentConfig.overrideDiscountPercent);

  if (!isNaN(flatOverride) && flatOverride > 0) {
    discountAmount = Math.min(flatOverride, basePrice - 1);
    badgeText = `FLAT ₹${discountAmount} OFF`;
    reasonText = "Special Admin Festival Offer";
  } else if (!isNaN(percentOverride) && percentOverride > 0) {
    discountAmount = Math.round((basePrice * percentOverride) / 100);
    badgeText = `${percentOverride}% OFF SPECIAL OFFER`;
    reasonText = "Special Admin Festival Offer";
  } else if (currentConfig.dynamicScheduleActive) {
    // Dynamic time-based discount reduction schedule
    if (daysLeft > 15) {
      discountAmount = Math.round(basePrice * 0.25); // 25% OFF
      badgeText = "25% OFF • Super Early Bird";
      reasonText = `Super Early Bird Offer (${daysLeft} days left - Discount reduces soon!)`;
    } else if (daysLeft > 10) {
      discountAmount = Math.round(basePrice * 0.20); // 20% OFF
      badgeText = "20% OFF • Early Bird Phase 1";
      reasonText = `Early Bird Phase 1 (${daysLeft} days left - Price increases soon!)`;
    } else if (daysLeft > 5) {
      discountAmount = Math.round(basePrice * 0.10); // 10% OFF
      badgeText = "10% OFF • Early Bird Phase 2";
      reasonText = `Early Bird Phase 2 (${daysLeft} days left - Price increases soon!)`;
    } else if (daysLeft > 0) {
      discountAmount = Math.round(basePrice * 0.05); // 5% OFF
      badgeText = "5% OFF • Last Chance";
      reasonText = `Last Chance Discount (${daysLeft} days left)`;
    } else {
      discountAmount = 0;
      badgeText = null;
      reasonText = "Standard Festival Ticket";
    }
  }

  const finalPrice = Math.max(1, basePrice - discountAmount);

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
