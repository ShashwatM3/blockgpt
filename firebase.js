// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAguNWpuC7Y97nfY0IzOiHhvaCLdzgrUjs",
  authDomain: "blockgpt-6093c.firebaseapp.com",
  projectId: "blockgpt-6093c",
  storageBucket: "blockgpt-6093c.firebasestorage.app",
  messagingSenderId: "393340785977",
  appId: "1:393340785977:web:b57853805d2ef2eac9c4e8",
  measurementId: "G-D3021GPJ1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);