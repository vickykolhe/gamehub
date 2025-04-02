import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBm6aF_Ueen_lJEVJKkAq_2gpGAfW-OJvc",
  authDomain: "snakegame-98df2.firebaseapp.com",
  projectId: "snakegame-98df2",
  storageBucket: "snakegame-98df2.firebasestorage.app",
  messagingSenderId: "201291833422",
  appId: "1:201291833422:web:97862a39e5389991ce231f",
  measurementId: "G-MGZ8DCW3B2"
};

const app = initializeApp(firebaseConfig)

// init services
export const db = getFirestore(app)
export const auth = getAuth(app)
