import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKdF2_8haL0O3DxoDKoinYrRc9IBse-IQ",
  authDomain: "cinego-b3935.firebaseapp.com",
  projectId: "cinego-b3935",
  storageBucket: "cinego-b3935.firebasestorage.app",
  messagingSenderId: "970261975073",
  appId: "1:970261975073:web:4b84e32a0f93ffc784d360",
  measurementId: "G-D4EP2Z1S0K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);