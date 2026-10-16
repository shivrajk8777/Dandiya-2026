import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJACjXQ6bgiZ-uWajW6xtp8iRKpyRPDyk",
  authDomain: "blogtesting-7753a.firebaseapp.com",
  projectId: "blogtesting-7753a",
  storageBucket: "blogtesting-7753a.firebasestorage.app",
  messagingSenderId: "793017256533",
  appId: "1:793017256533:web:5b37bbf1ef5a46b93ee2dc",
  measurementId: "G-Z7E8VPRN18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EXACT_20_AV = new Set([
  "AV-QFRC",
  "AV-PQRB",
  "AV-67MD",
  "AV-MTVG",
  "AV-7Y44",
  "AV-45YF",
  "AV-5LV8",
  "AV-UUKJ",
  "AV-RC56",
  "AV-HMKX",
  "AV-GMEQ",
  "AV-2XUH",
  "AV-Y7TG",
  "AV-XBCG",
  "AV-FP7M",
  "AV-SSK5",
  "AV-VZVA",
  "AV-H5ZR",
  "AV-F5NJ",
  "AV-U8G4"
]);

async function cleanupExtraAv() {
  const snapshot = await getDocs(collection(db, "dandiya_coupons"));
  const toDelete = [];

  snapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("AV-") && !EXACT_20_AV.has(code)) {
      console.log("Deleting extra AV code:", code);
      toDelete.push(deleteDoc(d.ref));
    }
  });

  if (toDelete.length > 0) {
    await Promise.all(toDelete);
    console.log(`Deleted ${toDelete.length} extra AV codes.`);
  }

  const afterSnapshot = await getDocs(collection(db, "dandiya_coupons"));
  let mahaveer = 0, shreeji = 0, skj = 0, av = 0;
  afterSnapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEER-") || code.startsWith("MAHAVEERAGRO-")) mahaveer++;
    else if (code.startsWith("SHREEJI-")) shreeji++;
    else if (code.startsWith("SKJ-")) skj++;
    else if (code.startsWith("AV-")) av++;
  });

  console.log("\nVerified Firestore Collection:");
  console.log(`🌾 Mahaveer: ${mahaveer}`);
  console.log(`🪔 Shreeji: ${shreeji}`);
  console.log(`⭐ SKJ: ${skj}`);
  console.log(`💎 AV: ${av}`);
  console.log(`Total: ${afterSnapshot.size}`);
  process.exit(0);
}

cleanupExtraAv().catch(console.error);
