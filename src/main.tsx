// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADeNZ-j6P43uNOpe2H7_2zEFUl3nBjaDQ",
  authDomain: "minor-project-64ad1.firebaseapp.com",
  projectId: "minor-project-64ad1",
  storageBucket: "minor-project-64ad1.firebasestorage.app",
  messagingSenderId: "499345594003",
  appId: "1:499345594003:web:07a3b44bea02e5c2be9f66",
  measurementId: "G-D2G5EYR4F1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

createRoot(document.getElementById("root")!).render(<App />);
