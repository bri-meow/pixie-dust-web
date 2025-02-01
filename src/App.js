import "./App.css";
import Alert from "./components/Alert";

import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import { AuthProvider } from "./AuthContext";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="App">
      <AuthProvider>{user ? <Alert /> : <Login />}</AuthProvider>
    </div>
  );
}

export default App;
