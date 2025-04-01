// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCV81UQEwRRDLRh3YqGUZ-ZY8P0h55KV0A",
    authDomain: "financetracker-2afd4.firebaseapp.com",
    projectId: "financetracker-2afd4",
    storageBucket: "financetracker-2afd4.firebasestorage.app",
    messagingSenderId: "322627598602",
    appId: "1:322627598602:web:6452c493fd9f9dabfba2f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { app, db };