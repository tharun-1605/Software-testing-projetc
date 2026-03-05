// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvyePSPzwlx_P3gYDgBEP0croFamJNqtU",
  authDomain: "smartgrievancetracking-system.firebaseapp.com",
  projectId: "smartgrievancetracking-system",
  storageBucket: "smartgrievancetracking-system.firebasestorage.app",
  messagingSenderId: "295247422701",
  appId: "1:295247422701:web:57ee3beeb1e97f8f13d8e4",
  measurementId: "G-Q1NDKW70SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
