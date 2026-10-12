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
const COLLECTION_NAME = "dandiya_coupons";

async function checkAndPurge() {
  console.log("Checking all documents in Firestore collection 'dandiya_coupons'...");
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  console.log(`Total documents currently in Firestore: ${snapshot.size}`);

  let vip26Count = 0;
  const deletePromises = [];

  snapshot.forEach((d) => {
    const id = d.id;
    const data = d.data();
    const code = (data.code || id).toUpperCase();

    if (code.startsWith("VIP26") || id.startsWith("VIP26") || code.startsWith("VIP") || id.startsWith("VIP")) {
      vip26Count++;
      console.log(`Found old VIP code to remove: ${id}`);
      deletePromises.push(deleteDoc(d.ref));
    }
  });

  if (deletePromises.length > 0) {
    console.log(`Deleting ${deletePromises.length} leftover VIP codes from Firestore...`);
    await Promise.all(deletePromises);
    console.log("Deleted all leftover VIP codes!");
  } else {
    console.log("Zero VIP26 codes found in Firestore!");
  }

  // Count by sponsor
  const afterSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  let mahaveer = 0;
  let shreeji = 0;
  let skj = 0;
  let others = 0;

  afterSnapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEERAGRO")) mahaveer++;
    else if (code.startsWith("SHREEJI")) shreeji++;
    else if (code.startsWith("SKJ")) skj++;
    else {
      others++;
      console.log("Other code:", code);
    }
  });

  console.log(`\nFinal Firestore Status:`);
  console.log(`- Mahaveer Agro: ${mahaveer}`);
  console.log(`- Shreeji: ${shreeji}`);
  console.log(`- SKJ: ${skj}`);
  console.log(`- Others / VIP26: ${others}`);
  console.log(`- Total live coupons in Firestore: ${afterSnapshot.size}`);

  process.exit(0);
}

checkAndPurge().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
