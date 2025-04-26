// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzXnKKJT9pDOCtNJorxTJN78OvDD9HV-4",
  authDomain: "insight-maker-94b03.firebaseapp.com",
  projectId: "insight-maker-94b03",
  storageBucket: "insight-maker-94b03.firebasestorage.app",
  messagingSenderId: "599830541904",
  appId: "1:599830541904:web:c850a2dbef93133859c355",
  measurementId: "G-KF4VSQD02N"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
export const db = getFirestore(app);