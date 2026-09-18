import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDPiHlwOqgLo7Qb42kSuQom_wna4Vhd94I",
  authDomain: "logiq-579f7.firebaseapp.com",
  projectId: "logiq-579f7",
  storageBucket: "logiq-579f7.firebasestorage.app",
  messagingSenderId: "987317739118",
  appId: "1:987317739118:web:d71f5925eb8560150b507f",
  measurementId: "G-L3C4YK6X52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { 
  app, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  analytics 
};
