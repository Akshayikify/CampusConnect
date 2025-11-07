import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDWGkilipWJNUI60fhhcM5kCGwK82xf7cI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "campus-connect-84337.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "campus-connect-84337",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "campus-connect-84337.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "938094113901",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:938094113901:web:f23abdc94cdec87533fb64"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

