// Single Firebase Initialization File
// Location: SAMPLE/firebaseInit.js (ROOT FOLDER)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxz_112SiNH7WWgVfioaqdErUn5dtrCe4",
  authDomain: "sample-login-d3ee5.firebaseapp.com",
  databaseURL: "https://sample-59832046-85e87-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sample-login-d3ee5",
  storageBucket: "sample-login-d3ee5.firebasestorage.app",
  messagingSenderId: "442116827264",
  appId: "1:442116827264:web:37ce79b76f75a12ea6de65",
  measurementId: "G-8F28KN2V4M"
};

// Initialize Firebase ONCE
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// Set language
auth.languageCode = 'en';

console.log('Firebase initialized successfully!');
console.log('Auth:', auth);
console.log('Database:', database);

// Export everything
export { app, auth, database, analytics };