import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function testVal() {
  const code = "AV-QFRC";
  const ref = doc(db, "dandiya_coupons", code);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    console.log("Validation test PASSED for", code, ":", snap.data());
  } else {
    console.error("FAIL: Not found");
  }
  process.exit(0);
}

testVal().catch(console.error);
