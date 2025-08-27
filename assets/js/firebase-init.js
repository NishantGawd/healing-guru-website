// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyDhD3Z9hNcjBAXeeVS2FqIT2OFQSPoMovI",
  authDomain: "healing-guru.firebaseapp.com",
  projectId: "healing-guru",
  storageBucket: "healing-guru.firebasestorage.app",
  messagingSenderId: "129332483907",
  appId: "1:129332483907:web:ac00580bce3f4bfd7181f6",
  measurementId: "G-YBN2LPP3N6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();