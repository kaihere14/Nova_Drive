import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChunkUpload } from "../hooks/useChunkUpload";
import FilesList from "../components/FilesList";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";
import PageHeader from "../components/PageHeader";
import { useUser } from "../hooks/useUser";
import usePageMeta from "../utils/usePageMeta";

const UploadPage = () => {
  usePageMeta(
    "NovaDrive — Upload Files",
    "Upload and manage files with chunked multipart uploads to Cloudflare R2."
  );
  const navigate = useNavigate();
  const { user, checkAuth, loading, logout } = useUser();
  const {
    file,
    totalChunks,
    form,
    uploading,
    progress,
    uploadStatus,
    processing,
    handleFileChange,
    handleUpload,
  } = useChunkUpload();

  const [activeView, setActiveView] = useState("files");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    usedBytes: 0,
    totalBytes: user?.storageQuota || 10 * 1024 * 1024 * 1024, // Default 10 GB
  });
  const filesListRef = useRef();

  // Verify authentication on page load
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await checkAuth();

      // If still no user after auth check, redirect to login
      if (!user) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, []);

  // Update storage quota when user data loads
  useEffect(() => {
    if (user?.storageQuota) {
      setStorageInfo((prev) => ({
        ...prev,
        totalBytes: user.storageQuota,
      }));
    }
  }, [user]);

  // Watch for successful upload completion and refresh file list
  useEffect(() => {
    if (uploadStatus === "Upload complete!") {
      // Manually refresh the file list and start polling
      if (filesListRef.current?.refresh) {
        filesListRef.current.refresh();
      }

      if (filesListRef.current?.startPolling) {
        filesListRef.current.startPolling();
      }

      // Close modal after a brief delay
      setTimeout(() => {
        setShowUploadModal(false);
      }, 1500);
    }
  }, [uploadStatus]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const storagePercentage = Math.round(
    (storageInfo.usedBytes / storageInfo.totalBytes) * 100
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Show loading state while verifying
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono">VERIFYING_ACCESS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-zinc-950 font-sans selection:bg-white/20 selection:text-white">
      {/* Subtle Grid Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: "0.3",
        }}
      ></div>

      {/* Sidebar Component */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        storageInfo={storageInfo}
        formatFileSize={formatFileSize}
        storagePercentage={storagePercentage}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowSidebar={setShowSidebar}
          user={user}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-zinc-950">
          {/* Page Header Component */}
          <PageHeader
            activeView={activeView}
            setShowUploadModal={setShowUploadModal}
          />

          {/* Files List */}
          <FilesList
            ref={filesListRef}
            userId={user?._id || ""}
            username={user?.username || "User"}
            activeView={activeView}
            searchQuery={searchQuery}
            onStorageUpdate={(info) =>
              setStorageInfo((prev) => ({ ...prev, ...info }))
            }
          />
        </div>
      </main>

      {/* Upload Modal Component */}
      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        file={file}
        totalChunks={totalChunks}
        form={form}
        uploading={uploading}
        progress={progress}
        uploadStatus={uploadStatus}
        processing={processing}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />
    </div>
  );
};

export default UploadPage;
