// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoYHdmHrtij3BLloxS3xa0icfL83YiS40",
  authDomain: "pixie-dust-645a7.firebaseapp.com",
  projectId: "pixie-dust-645a7",
  storageBucket: "pixie-dust-645a7.firebasestorage.app",

  messagingSenderId: "198742343536",
  appId: "1:198742343536:web:67cde1cc22d6f6779fd9b5",
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);
// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
