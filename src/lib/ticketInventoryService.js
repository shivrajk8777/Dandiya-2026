// Ticket Inventory Service for Rang Tarang Garba 2026
import { getFirebaseInstance } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const INVENTORY_LOCAL_KEY = "dandiya_ticket_inventory_config";
const INVENTORY_DOC_ID = "ticket_inventory_limit";
const COLLECTION_NAME = "dandiya_settings";

const DEFAULT_INVENTORY = {
  maxTickets: 300,
  updatedAt: new Date().toISOString()
};

export const getLocalInventoryConfig = () => {
  if (typeof window === "undefined") return DEFAULT_INVENTORY;
  try {
    const raw = localStorage.getItem(INVENTORY_LOCAL_KEY);
    if (!raw) return DEFAULT_INVENTORY;
    const parsed = JSON.parse(raw);
    return {
      maxTickets: Number(parsed.maxTickets) || 300,
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch (e) {
    return DEFAULT_INVENTORY;
  }
};

export const saveLocalInventoryConfig = (config) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INVENTORY_LOCAL_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("dandiya_inventory_update"));
  } catch (e) {
    console.error("Local inventory save error", e);
  }
};

export const subscribeToInventoryConfig = (callback) => {
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, INVENTORY_DOC_ID);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const config = {
              maxTickets: Number(data.maxTickets) || 300,
              updatedAt: data.updatedAt || new Date().toISOString()
            };
            saveLocalInventoryConfig(config);
            callback(config);
          } else {
            saveLocalInventoryConfig(DEFAULT_INVENTORY);
            callback(DEFAULT_INVENTORY);
          }
        },
        (err) => {
          console.warn("Firestore inventory snapshot error:", err);
          callback(getLocalInventoryConfig());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Error setting up inventory listener:", e);
    }
  }

  // Local fallback
  const sendLocal = () => callback(getLocalInventoryConfig());
  sendLocal();

  if (typeof window === "undefined") return () => {};
  window.addEventListener("dandiya_inventory_update", sendLocal);
  return () => window.removeEventListener("dandiya_inventory_update", sendLocal);
};

export const updateInventoryLimit = async (newMaxTickets) => {
  const { db, isConnected } = getFirebaseInstance();
  const max = Math.max(1, Number(newMaxTickets) || 300);
  const payload = {
    maxTickets: max,
    updatedAt: new Date().toISOString()
  };

  if (isConnected && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, INVENTORY_DOC_ID);
      await setDoc(docRef, payload, { merge: true });
    } catch (e) {
      console.warn("Firebase inventory update error:", e);
    }
  }

  saveLocalInventoryConfig(payload);
  return payload;
};

export const addMoreTickets = async (countToAdd) => {
  const current = getLocalInventoryConfig();
  const currentMax = Number(current.maxTickets) || 300;
  const newMax = currentMax + (Number(countToAdd) || 0);
  return await updateInventoryLimit(newMax);
};

export const computeTicketStats = (inventoryConfig, registrations = []) => {
  const maxTickets = Number(inventoryConfig?.maxTickets) || 300;
  const soldPasses = (registrations || [])
    .filter((r) => r.status === "Approved")
    .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
  const remainingTickets = Math.max(0, maxTickets - soldPasses);
  const isSoldOut = soldPasses >= maxTickets;
  const soldPercentage = maxTickets > 0 ? Math.min(100, Math.round((soldPasses / maxTickets) * 100)) : 0;

  return {
    maxTickets,
    soldPasses,
    remainingTickets,
    isSoldOut,
    soldPercentage
  };
};

