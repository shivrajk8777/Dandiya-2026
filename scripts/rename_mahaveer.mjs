import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

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
const COLLECTION_NAME = "dandiya_coupons";

async function renameMahaveerCoupons() {
  console.log("Renaming MAHAVEERAGRO- to MAHAVEER- in Firestore...");
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  console.log(`Total current documents: ${snapshot.size}`);

  const deletePromises = [];
  const newCoupons = [];

  snapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEERAGRO-")) {
      const newCode = code.replace("MAHAVEERAGRO-", "MAHAVEER-");
      console.log(`Renaming: ${code} -> ${newCode}`);
      deletePromises.push(deleteDoc(d.ref));
      newCoupons.push({
        code: newCode,
        sponsor: "Mahaveer",
        discountPercent: 100,
        isUsed: false,
        usedBy: null,
        usedPhone: null,
        passId: null,
        usedAt: null,
        createdAt: new Date().toISOString()
      });
    }
  });

  if (deletePromises.length > 0) {
    console.log(`Deleting ${deletePromises.length} MAHAVEERAGRO documents...`);
    await Promise.all(deletePromises);
    console.log("Deleted MAHAVEERAGRO documents.");
  }

  if (newCoupons.length > 0) {
    console.log(`Adding ${newCoupons.length} MAHAVEER documents...`);
    const setPromises = newCoupons.map((item) =>
      setDoc(doc(db, COLLECTION_NAME, item.code), item)
    );
    await Promise.all(setPromises);
    console.log("Added all new MAHAVEER documents successfully!");
  }

  // Verify final count
  const afterSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  let mahaveerCount = 0;
  let shreejiCount = 0;
  let skjCount = 0;
  let othersCount = 0;

  afterSnapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEER-")) mahaveerCount++;
    else if (code.startsWith("SHREEJI-")) shreejiCount++;
    else if (code.startsWith("SKJ-")) skjCount++;
    else {
      othersCount++;
      console.log("Other document:", code);
    }
  });

  console.log("\nFinal Firestore Verification:");
  console.log(`- Mahaveer: ${mahaveerCount}`);
  console.log(`- Shreeji: ${shreejiCount}`);
  console.log(`- SKJ: ${skjCount}`);
  console.log(`- Others: ${othersCount}`);
  console.log(`- Total: ${afterSnapshot.size}`);

  process.exit(0);
}

renameMahaveerCoupons().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
