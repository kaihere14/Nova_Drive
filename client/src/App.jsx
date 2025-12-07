import React from "react";
import UploadPage from "./pages/UploadPage";
import FolderPage from "./pages/FolderPage";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { UserProvider } from "./context/UserContext";
import { FolderProvider } from "./context/FolderContext";
import SignupPage from "./pages/SignupPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <UserProvider>
      <FolderProvider>
        <div className="App">
          <Routes>
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/folder/:folderId" element={<FolderPage />} />
          </Routes>
        </div>
      </FolderProvider>
    </UserProvider>
  );
}

export default App;
