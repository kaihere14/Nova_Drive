import React from "react";
import UploadPage from "./pages/UploadPage";
import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { UserProvider } from "./context/UserContext";
import SignupPage from "./pages/SignupPage";


function App() {
  return (
    <UserProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
