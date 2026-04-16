// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDGYxO6nZc5wxaMFly6wUSnw44cQfXGl50",
  authDomain: "event-55ee0.firebaseapp.com",
  projectId: "event-55ee0",
  storageBucket: "event-55ee0.firebasestorage.app",
  messagingSenderId: "22369891630",
  appId: "1:22369891630:web:c569ed8187bf2a5d0bb6bf",
  measurementId: "G-K34J3J4H0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Export auth so you can use it elsewhere
export const auth = getAuth(app);