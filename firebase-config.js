// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.19.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB75G_fL-nQPrZBd8MW0Lya3Q2j-PcDL3M",
    authDomain: "sunlab-database.firebaseapp.com",
    projectId: "sunlab-database",
    storageBucket: "sunlab-database.appspot.com",
    messagingSenderId: "127818763339",
    appId: "1:127818763339:web:19eae8151d05d4c09811ce",
    measurementId: "G-STL9KH4Q51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };