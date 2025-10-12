// Import the initializeApp function from Firebase's app module
// This function connects our project to Firebase
// The URL is where Firebase hosts their JavaScript library
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

// Import the getAnalytics function for tracking app usage (optional)
// We load this but don't really use it much in our app
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Import the getFirestore function to access our database
// This is what lets us read and write data to Firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Create a configuration object with our Firebase project details
// These are the "keys" that tell Firebase which project is ours (chopelah)
// Everyone on the team uses the same config to connect to the same database
const firebaseConfig = {
    apiKey: "AIzaSyC4hya0q4p1kaleBJCmIDfIDKRWz9QL3Wo",           // API key for authentication
    authDomain: "chopelah.firebaseapp.com",                      // Domain for user sign-in
    projectId: "chopelah",                                       // Unique ID for our Firebase project
    storageBucket: "chopelah.firebasestorage.app",               // Storage location for files
    messagingSenderId: "1066452408437",                          // ID for push notifications
    appId: "1:1066452408437:web:7e903260b64e909dd9003c",        // Unique app ID
    measurementId: "G-P1FP7JHMLX"                                // ID for analytics tracking
};

// Initialize Firebase by passing our config
// This sets up the connection to Google's Firebase servers
// Without this line, nothing would work
const app = initializeApp(firebaseConfig);

// Set up analytics tracking (optional feature)
// This tracks how people use our app
const analytics = getAnalytics(app);

// Get the database instance and export it
// getFirestore(app) gives us access to our Firestore database
// "export" lets other files (like test.html) import and use this "db" object
// This is the most important line - other files will use "db" to read/write data
export const db = getFirestore(app);