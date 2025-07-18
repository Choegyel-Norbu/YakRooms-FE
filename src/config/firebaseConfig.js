// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpztRaIhsRMisykJgEZD_d0HDnIuKxyKw",
  authDomain: "yakrooms.firebaseapp.com",
  projectId: "yakrooms",
  storageBucket: "yakrooms.appspot.com",
  messagingSenderId: "165341953510",
  appId: "1:165341953510:web:e85c4b7fa8d584e8ee2a27",
  measurementId: "G-C7PMXXLLVL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
