"use client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { getFirebaseInstance } from "./firebase";
import * as XLSX from "xlsx";

const LOCAL_STORAGE_KEY = "dandiya_vip_coupons_v3";
const COLLECTION_NAME = "dandiya_coupons";
const CONFIG_DOC_PATH = "dandiya_config";
const CONFIG_DOC_ID = "vip_coupons_state";

// Helper to identify sponsor category from coupon code prefix
export const getCouponSponsor = (code) => {
  if (!code) return "VIP";
  const upper = code.toUpperCase();
  if (upper.startsWith("MAHAVEER-") || upper.startsWith("MAHAVEER")) return "Mahaveer";
  if (upper.startsWith("SHREEJI-") || upper.startsWith("SHREEJI")) return "Shreeji";
  if (upper.startsWith("SKJ-") || upper.startsWith("SKJ")) return "SKJ";
  if (upper.startsWith("AV-") || upper.startsWith("AV")) return "AV";
  return "VIP Guest";
};

// 245 Unique VIP Complimentary Codes Seed
// Mahaveer: 100 | Shreeji: 100 | SKJ: 25 | AV: 20
export const RAW_VIP_CODES = [
  // Mahaveer (100 Coupons)
  "MAHAVEER-JAV2", "MAHAVEER-VWXK", "MAHAVEER-LV5K", "MAHAVEER-UZBN", "MAHAVEER-KCWW",
  "MAHAVEER-YL43", "MAHAVEER-WGPJ", "MAHAVEER-8UKD", "MAHAVEER-WRLY", "MAHAVEER-KP2B",
  "MAHAVEER-D5FF", "MAHAVEER-VGUF", "MAHAVEER-NBXV", "MAHAVEER-FAWT", "MAHAVEER-SXUS",
  "MAHAVEER-2WFS", "MAHAVEER-YE3Q", "MAHAVEER-VV6Y", "MAHAVEER-CQKS", "MAHAVEER-RJG7",
  "MAHAVEER-Q6PQ", "MAHAVEER-84YA", "MAHAVEER-QLSC", "MAHAVEER-97AX", "MAHAVEER-ZGGW",
  "MAHAVEER-FBV9", "MAHAVEER-MEW3", "MAHAVEER-6955", "MAHAVEER-3L3L", "MAHAVEER-AMFQ",
  "MAHAVEER-E7EN", "MAHAVEER-GDSH", "MAHAVEER-9PCQ", "MAHAVEER-MCJ8", "MAHAVEER-ZD9B",
  "MAHAVEER-4HKH", "MAHAVEER-6JWQ", "MAHAVEER-JV5G", "MAHAVEER-S3VX", "MAHAVEER-A2VN",
  "MAHAVEER-P7WD", "MAHAVEER-EMVE", "MAHAVEER-SDG7", "MAHAVEER-2V57", "MAHAVEER-2QAQ",
  "MAHAVEER-VVAH", "MAHAVEER-VMXB", "MAHAVEER-5GBW", "MAHAVEER-S8EK", "MAHAVEER-BPXJ",
  "MAHAVEER-K6CX", "MAHAVEER-L38A", "MAHAVEER-ARZE", "MAHAVEER-999S", "MAHAVEER-YUHT",
  "MAHAVEER-8Q3N", "MAHAVEER-YNS7", "MAHAVEER-ABHF", "MAHAVEER-K3EH", "MAHAVEER-3JFK",
  "MAHAVEER-ZGGV", "MAHAVEER-J3DW", "MAHAVEER-MTDZ", "MAHAVEER-W3SQ", "MAHAVEER-PMUB",
  "MAHAVEER-74X5", "MAHAVEER-9TCD", "MAHAVEER-D3Z4", "MAHAVEER-C33C", "MAHAVEER-G9D4",
  "MAHAVEER-KWDV", "MAHAVEER-LMWV", "MAHAVEER-N8XK", "MAHAVEER-EK8E", "MAHAVEER-NUZK",
  "MAHAVEER-Q7NQ", "MAHAVEER-PP2H", "MAHAVEER-UX8L", "MAHAVEER-W7FC", "MAHAVEER-BFHC",
  "MAHAVEER-995N", "MAHAVEER-4GY9", "MAHAVEER-L22G", "MAHAVEER-JZMD", "MAHAVEER-6MBP",
  "MAHAVEER-FNR2", "MAHAVEER-6QKJ", "MAHAVEER-JMPW", "MAHAVEER-YTD3", "MAHAVEER-FP98",
  "MAHAVEER-SRKD", "MAHAVEER-MD7A", "MAHAVEER-QEJR", "MAHAVEER-SZ3T", "MAHAVEER-7877",
  "MAHAVEER-7HFW", "MAHAVEER-D6HE", "MAHAVEER-Z329", "MAHAVEER-2TJR", "MAHAVEER-C78V",

  // Shreeji (100 Coupons)
  "SHREEJI-QEDA", "SHREEJI-4L8S", "SHREEJI-7TX9", "SHREEJI-K9M5", "SHREEJI-8G7W",
  "SHREEJI-WNGB", "SHREEJI-X9N9", "SHREEJI-53N5", "SHREEJI-K8DX", "SHREEJI-485Z",
  "SHREEJI-ZYC4", "SHREEJI-C436", "SHREEJI-QCTW", "SHREEJI-TCEP", "SHREEJI-87AH",
  "SHREEJI-KRMV", "SHREEJI-YJ69", "SHREEJI-LB8R", "SHREEJI-X4SG", "SHREEJI-PHLJ",
  "SHREEJI-UH96", "SHREEJI-LRGY", "SHREEJI-JZ6L", "SHREEJI-GLB3", "SHREEJI-K7JP",
  "SHREEJI-TAGB", "SHREEJI-X2P3", "SHREEJI-KQT9", "SHREEJI-RP36", "SHREEJI-X3Z3",
  "SHREEJI-THWZ", "SHREEJI-3HC6", "SHREEJI-Z5XW", "SHREEJI-SZJ8", "SHREEJI-5Z5C",
  "SHREEJI-YWYG", "SHREEJI-4JSN", "SHREEJI-UHRB", "SHREEJI-SFW9", "SHREEJI-AC4H",
  "SHREEJI-BS2E", "SHREEJI-Q75B", "SHREEJI-E8DV", "SHREEJI-926E", "SHREEJI-LJF5",
  "SHREEJI-A8M6", "SHREEJI-DWP2", "SHREEJI-KEX5", "SHREEJI-ZQ6L", "SHREEJI-7ME8",
  "SHREEJI-6GRD", "SHREEJI-8CAC", "SHREEJI-8P4C", "SHREEJI-N3R7", "SHREEJI-4ZJZ",
  "SHREEJI-GUGP", "SHREEJI-C6GH", "SHREEJI-P3JC", "SHREEJI-7ZJZ", "SHREEJI-52C7",
  "SHREEJI-DWRY", "SHREEJI-4R3D", "SHREEJI-7YA5", "SHREEJI-3S4V", "SHREEJI-2LGZ",
  "SHREEJI-S5BF", "SHREEJI-ZND3", "SHREEJI-A9H7", "SHREEJI-244Y", "SHREEJI-F95P",
  "SHREEJI-NZ88", "SHREEJI-57XS", "SHREEJI-2NPB", "SHREEJI-V2UN", "SHREEJI-SFHP",
  "SHREEJI-73CU", "SHREEJI-HKDW", "SHREEJI-44K8", "SHREEJI-6CGB", "SHREEJI-3NUV",
  "SHREEJI-C4T2", "SHREEJI-5W9W", "SHREEJI-R96X", "SHREEJI-XC7P", "SHREEJI-22MS",
  "SHREEJI-MGBG", "SHREEJI-YGDU", "SHREEJI-QQSN", "SHREEJI-J5VR", "SHREEJI-HV9X",
  "SHREEJI-ANQ8", "SHREEJI-VQF6", "SHREEJI-SHJS", "SHREEJI-JGL5", "SHREEJI-PUYD",
  "SHREEJI-VNQQ", "SHREEJI-KXW3", "SHREEJI-C4AJ", "SHREEJI-PBWD", "SHREEJI-85GV",

  // SKJ (25 Coupons)
  "SKJ-Z4D2", "SKJ-EZJP", "SKJ-5MMQ", "SKJ-BU4T", "SKJ-C2NU",
  "SKJ-Y5UT", "SKJ-HDLT", "SKJ-AE9G", "SKJ-D2ES", "SKJ-GBXR",
  "SKJ-DGJA", "SKJ-HJC6", "SKJ-NJ5U", "SKJ-FB9L", "SKJ-MEFR",
  "SKJ-QKB8", "SKJ-MKNR", "SKJ-RL5M", "SKJ-PEWJ", "SKJ-EK2P",
  "SKJ-BA37", "SKJ-G7MK", "SKJ-STS4", "SKJ-VRYA", "SKJ-Y6NV",

  // AV (20 Coupons)
  "AV-QFRC", "AV-PQRB", "AV-67MD", "AV-MTVG", "AV-7Y44",
  "AV-45YF", "AV-5LV8", "AV-UUKJ", "AV-RC56", "AV-HMKX",
  "AV-GMEQ", "AV-2XUH", "AV-Y7TG", "AV-XBCG", "AV-FP7M",
  "AV-SSK5", "AV-VZVA", "AV-H5ZR", "AV-F5NJ", "AV-U8G4"
];

export const INITIAL_COUPONS = RAW_VIP_CODES.map((code) => ({
  id: code,
  code: code,
  sponsor: getCouponSponsor(code),
  discountPercent: 100,
  isUsed: false,
  usedBy: null,
  usedPhone: null,
  passId: null,
  usedAt: null,
  createdAt: new Date().toISOString()
}));

// Retrieve current cached list of coupons
export const getCoupons = () => {
  if (typeof window === "undefined") return INITIAL_COUPONS;
  try {
    // Purge old local storage key if still present in browser
    localStorage.removeItem("dandiya_vip_coupons_v1");

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    // Filter out any stale VIP26 or VIP codes completely
    const sanitized = parsed.filter(
      (c) => c && c.code && !c.code.toUpperCase().startsWith("VIP26") && !c.code.toUpperCase().startsWith("VIP-")
    );
    if (sanitized.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized.length > 0 ? sanitized : INITIAL_COUPONS;
  } catch (e) {
    console.error("Coupon storage read error:", e);
    return INITIAL_COUPONS;
  }
};

// Save coupons locally and dispatch update event
export const saveCouponsLocal = (coupons) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coupons));
      window.dispatchEvent(new Event("dandiya_coupons_update"));
    } catch (e) {
      console.error("Coupon storage save error:", e);
    }
  }
};

// Subscribe to real-time coupons from Firestore Database Collection 'dandiya_coupons'
export const subscribeToCoupons = (callback) => {
  const { db, isConnected } = getFirebaseInstance();

  const notify = (list) => {
    callback(list || getCoupons());
  };

  // Initial local state delivery
  notify();

  // Real-time Firestore Collection Listener
  if (isConnected && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              const cCode = (d.code || docSnap.id).toUpperCase();

              // Strictly exclude any old VIP26 codes
              if (cCode.startsWith("VIP26") || cCode.startsWith("VIP-")) return;

              list.push({
                id: docSnap.id,
                code: cCode,
                sponsor: d.sponsor || getCouponSponsor(cCode),
                discountPercent: d.discountPercent || 100,
                isUsed: !!d.isUsed,
                usedBy: d.usedBy || null,
                usedPhone: d.usedPhone || null,
                passId: d.passId || null,
                usedAt: d.usedAt || null,
                createdAt: d.createdAt || null
              });
            });

            // Sort codes cleanly
            list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));

            saveCouponsLocal(list);
            callback(list);
          } else {
            // If collection empty in firestore, seed initial 175 documents
            seedFirestoreCoupons(db).then(() => {
              notify();
            });
          }
        },
        (err) => {
          console.warn("Firestore coupon collection listener warning:", err);
          notify();
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Error subscribing to Firestore coupon collection:", e);
    }
  }

  // Local window event listener fallback
  if (typeof window !== "undefined") {
    const handleUpdate = () => notify();
    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) notify();
    };

    window.addEventListener("dandiya_coupons_update", handleUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dandiya_coupons_update", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }

  return () => {};
};

// Helper: Seed Firestore collection with initial 175 codes if ever empty
export const seedFirestoreCoupons = async (dbInstance) => {
  const { db } = dbInstance ? { db: dbInstance } : getFirebaseInstance();
  if (!db) return;
  try {
    const batch = writeBatch(db);
    for (let i = 0; i < RAW_VIP_CODES.length; i++) {
      const code = RAW_VIP_CODES[i];
      const ref = doc(db, COLLECTION_NAME, code);
      batch.set(ref, {
        code: code,
        sponsor: getCouponSponsor(code),
        discountPercent: 100,
        isUsed: false,
        usedBy: null,
        usedPhone: null,
        passId: null,
        usedAt: null,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn("Coupon batch seed warning:", err);
  }
};

// DIRECT DATABASE VALIDATION: Checks code directly from Firestore Database in real time
export const validateCoupon = async (inputCode) => {
  if (!inputCode || typeof inputCode !== "string") {
    return { valid: false, message: "Please enter a VIP coupon code." };
  }

  const clean = inputCode.trim().toUpperCase();

  // Explicitly reject old VIP26 codes
  if (clean.startsWith("VIP26") || clean.startsWith("VIP-")) {
    return {
      valid: false,
      message: `Old VIP26 codes are no longer active. Please use your valid Mahaveer, Shreeji, SKJ, or AV coupon code.`
    };
  }

  const { db, isConnected } = getFirebaseInstance();

  // 1. Direct Firestore Database Lookup (Live Cloud Database)
  if (isConnected && db) {
    try {
      // Direct lookup by document ID (Document ID is the Code e.g. 'MAHAVEERAGRO-JAV2')
      const docRef = doc(db, COLLECTION_NAME, clean);
      const snap = await getDoc(docRef);

      let couponData = null;
      if (snap.exists()) {
        couponData = { id: snap.id, ...snap.data() };
      } else {
        // Fallback: search by 'code' field in case doc id is autogenerated
        const q = query(collection(db, COLLECTION_NAME), where("code", "==", clean));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const firstDoc = qSnap.docs[0];
          couponData = { id: firstDoc.id, ...firstDoc.data() };
        }
      }

      if (couponData) {
        if (couponData.isUsed) {
          const formattedDate = couponData.usedAt
            ? new Date(couponData.usedAt).toLocaleDateString("en-IN")
            : "earlier";
          return {
            valid: false,
            isUsed: true,
            coupon: couponData,
            message: `This VIP Code (${clean}) has already been redeemed on ${formattedDate} by ${couponData.usedBy || "another guest"}! Each code can only be used once.`
          };
        }

        const sponsorName = couponData.sponsor || getCouponSponsor(clean);
        return {
          valid: true,
          coupon: couponData,
          sponsor: sponsorName,
          discountPercent: couponData.discountPercent || 100,
          message: `Valid VIP Code "${clean}" (${sponsorName})! 100% Free VIP Pass applied.`
        };
      } else {
        return {
          valid: false,
          message: `Invalid VIP Code "${clean}". This code was not found in the database!`
        };
      }
    } catch (dbErr) {
      console.warn("Live Firestore check error, checking cached database:", dbErr);
    }
  }

  // 2. Cached Database Fallback (when offline or network latency)
  const cached = getCoupons();
  const found = cached.find((c) => c.code.toUpperCase() === clean);

  if (!found) {
    return {
      valid: false,
      message: `Invalid VIP Code "${clean}". This code was not found in the database!`
    };
  }

  if (found.isUsed) {
    const formattedDate = found.usedAt
      ? new Date(found.usedAt).toLocaleDateString("en-IN")
      : "recently";
    return {
      valid: false,
      isUsed: true,
      coupon: found,
      message: `This VIP Code (${clean}) was already redeemed on ${formattedDate} by ${found.usedBy || "another guest"}!`
    };
  }

  const sponsorName = found.sponsor || getCouponSponsor(clean);
  return {
    valid: true,
    coupon: found,
    sponsor: sponsorName,
    discountPercent: found.discountPercent || 100,
    message: `Valid VIP Code "${clean}" (${sponsorName})! 100% Complimentary VIP Pass applied (Free Entry).`
  };
};

// Redeem coupon code: Directly updates Firestore Database collection 'dandiya_coupons'
export const redeemCoupon = async (inputCode, { fullName, phone, passId }) => {
  const clean = (inputCode || "").trim().toUpperCase();
  const { db, isConnected } = getFirebaseInstance();
  const now = new Date().toISOString();

  const updatePayload = {
    code: clean,
    isUsed: true,
    usedBy: fullName || "VIP Guest",
    usedPhone: phone || "",
    passId: passId || "",
    usedAt: now
  };

  // 1. Direct Cloud Firestore Database Update
  if (isConnected && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, clean);
      await setDoc(docRef, updatePayload, { merge: true });
    } catch (e) {
      console.warn("Firestore live redeem update error:", e);
    }
  }

  // 2. Local cache update
  const coupons = getCoupons();
  let redeemedTarget = null;
  const updated = coupons.map((c) => {
    if (c.code.toUpperCase() === clean) {
      redeemedTarget = {
        ...c,
        ...updatePayload
      };
      return redeemedTarget;
    }
    return c;
  });

  if (!redeemedTarget) {
    redeemedTarget = updatePayload;
    updated.push(redeemedTarget);
  }

  saveCouponsLocal(updated);
  return redeemedTarget;
};

// Add a brand new coupon code directly to Firestore Database
export const addCouponToDatabase = async (newCode, discountPercent = 100) => {
  if (!newCode || typeof newCode !== "string") return null;
  const clean = newCode.trim().toUpperCase();
  const { db, isConnected } = getFirebaseInstance();

  const couponDoc = {
    code: clean,
    discountPercent: Number(discountPercent) || 100,
    isUsed: false,
    usedBy: null,
    usedPhone: null,
    passId: null,
    usedAt: null,
    createdAt: new Date().toISOString()
  };

  if (isConnected && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, clean);
      await setDoc(docRef, couponDoc, { merge: true });
    } catch (e) {
      console.warn("Firestore add coupon error:", e);
    }
  }

  const list = getCoupons();
  const filtered = list.filter((c) => c.code.toUpperCase() !== clean);
  filtered.unshift({ id: clean, ...couponDoc });
  saveCouponsLocal(filtered);
  return couponDoc;
};

// Reset all coupons in Firestore Database back to unredeemed
export const resetAllCoupons = async () => {
  const { db, isConnected } = getFirebaseInstance();
  const list = getCoupons();

  if (isConnected && db) {
    try {
      const batch = writeBatch(db);
      list.forEach((c) => {
        const ref = doc(db, COLLECTION_NAME, c.code);
        batch.set(
          ref,
          {
            isUsed: false,
            usedBy: null,
            usedPhone: null,
            passId: null,
            usedAt: null
          },
          { merge: true }
        );
      });
      await batch.commit();
    } catch (e) {
      console.warn("Firestore reset all coupons error:", e);
    }
  }

  const resetList = list.map((c) => ({
    ...c,
    isUsed: false,
    usedBy: null,
    usedPhone: null,
    passId: null,
    usedAt: null
  }));
  saveCouponsLocal(resetList);
  return resetList;
};

// Export all coupon codes to Excel spreadsheet
export const exportCouponsToExcel = (couponsList) => {
  const list = couponsList || getCoupons();
  const data = list.map((c, index) => ({
    "S.No": index + 1,
    "VIP Coupon Code": c.code,
    "Sponsor / Category": c.sponsor || getCouponSponsor(c.code),
    "Status": c.isUsed ? "REDEEMED (Used)" : "AVAILABLE (Unused)",
    "Discount": `${c.discountPercent || 100}% FREE VIP PASS`,
    "Redeemed By (Guest)": c.usedBy || "-",
    "Guest Phone": c.usedPhone || "-",
    "Pass ID": c.passId || "-",
    "Redemption Date": c.usedAt ? new Date(c.usedAt).toLocaleString("en-IN") : "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VIP Passes Database");

  const fileName = `Rang_Tarang_Garba_2026_VIP_Codes_Database.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
