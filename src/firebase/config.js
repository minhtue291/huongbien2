import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCB2Vf_G4wZC9eM4xaGt--uDWZITmlwXRQ",
  authDomain: "huong-bien.firebaseapp.com",
  projectId: "huong-bien",
  storageBucket: "huong-bien.firebasestorage.app",
  messagingSenderId: "1002987772399",
  appId: "1:1002987772399:web:92f2b506eeab4a67e73e1a"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);