import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// User provided Firebase configuration
const defaultEnvConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCJACjXQ6bgiZ-uWajW6xtp8iRKpyRPDyk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "blogtesting-7753a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "blogtesting-7753a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "blogtesting-7753a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "793017256533",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:793017256533:web:5b37bbf1ef5a46b93ee2dc",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Z7E8VPRN18"
};

// Check stored config from LocalStorage if browser
export const getActiveFirebaseConfig = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("dandiya_firebase_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read stored Firebase config", e);
    }
  }
  return defaultEnvConfig;
};

export const saveFirebaseConfigToStorage = (config) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dandiya_firebase_config", JSON.stringify(config));
  }
};

let app = null;
let db = null;
let auth = null;
let isFirebaseConnected = false;

export const initFirebase = () => {
  const config = getActiveFirebaseConfig();
  if (config && config.projectId && config.apiKey && config.projectId !== "YOUR_PROJECT_ID") {
    try {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      db = getFirestore(app);
      auth = getAuth(app);
      isFirebaseConnected = true;
      return { app, db, auth, isConnected: true };
    } catch (err) {
      console.error("Firebase init failed, switching to local store:", err);
      isFirebaseConnected = false;
      return { app: null, db: null, auth: null, isConnected: false, error: err.message };
    }
  }
  isFirebaseConnected = false;
  return { app: null, db: null, auth: null, isConnected: false };
};

export const getFirebaseInstance = () => {
  if (!db && typeof window !== "undefined") {
    initFirebase();
  }
  return { app, db, auth, isConnected: isFirebaseConnected };
};
