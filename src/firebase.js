import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKRYdkuC3SG4CmD_BiyP3gLaAhmPLoUhU",
  authDomain: "fitness-b2ac8.firebaseapp.com",
  projectId: "fitness-b2ac8",
  storageBucket: "fitness-b2ac8.firebasestorage.app",
  messagingSenderId: "361568602221",
  appId: "1:361568602221:web:f198db6921083646d85764",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
