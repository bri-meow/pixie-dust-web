// src/Login.js
import React from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      // const user = result.user;
      // Do something with the user object, e.g., store user data in your app
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}

export default Login;
