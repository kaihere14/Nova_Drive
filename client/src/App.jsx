import React from "react";
import UploadPage from "./pages/UploadPage";
import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { UserProvider } from "./context/UserContext";
import SignupPage from "./pages/SignupPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import PricingPage from "./pages/PricingPage";


function App() {
  return (
    <UserProvider>
      <div className="App">
        <Routes>
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
