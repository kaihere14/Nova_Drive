import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useChunkUpload } from "../hooks/useChunkUpload";
import FilesList from "../components/FilesList";
import CreateFolderModal from "../components/CreateFolderModal";
import DeleteFolderModal from "../components/DeleteFolderModal";
import RenameFolderModal from "../components/RenameFolderModal";
import FolderCard from "../components/FolderCard";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";
import PageHeader from "../components/PageHeader";
import StatsCard from "../components/StatsCard";
import { useUser } from "../hooks/useUser";
import { useFolder } from "../context/FolderContext";
import usePageMeta from "../utils/usePageMeta";
import BASE_URL from "../config";

const UploadPage = () => {
  usePageMeta(
    "NovaDrive — Upload Files",
    "Upload and manage files with chunked multipart uploads to Cloudflare R2."
  );
  const navigate = useNavigate();
  const {
    user,
    checkAuth,
    loading,
    logout,
    totalCounts,
    fetchTotalCounts,
    storageInfo,
    setStorageInfo,
  } = useUser();
  const {
    fetchFolders,
    currentFolderId,
    folders,
    loading: folderLoading,
    deleteFolder,
  } = useFolder();
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
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [aiSearch, setAiSearch] = useState(false);

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

      if (!user) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchFolders(null);
      fetchTotalCounts();
    }
  }, [user]);

  useEffect(() => {
    if (user?.storageQuota) {
      setStorageInfo((prev) => ({
        ...prev,
        totalBytes: user.storageQuota,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (uploadStatus === "Upload complete!") {
      if (filesListRef.current?.refresh) {
        filesListRef.current.refresh();
      }

      if (filesListRef.current?.startPolling) {
        filesListRef.current.startPolling();
      }

      // Refresh total counts after upload
      fetchTotalCounts();

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

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    const result = await deleteFolder(folderToDelete._id);

    if (result.success) {
      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
      setDeleteError(null);

      // Refresh total counts after folder deletion
      fetchTotalCounts();
    } else {
      setDeleteError(result.message);
    }

    setDeleteLoading(false);
  };

  const handleRenameFolder = async (newName) => {
    if (!folderToRename) return;
    setRenameLoading(true);
    setRenameError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${BASE_URL}/api/folders/rename/${folderToRename._id}`,
        { newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowRenameModal(false);
        setFolderToRename(null);
        // refresh folders
        fetchFolders(currentFolderId);
      } else {
        setRenameError("Failed to rename folder");
      }
    } catch (err) {
      setRenameError(err?.response?.data?.message || "Failed to rename folder");
    } finally {
      setRenameLoading(false);
    }
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
          aiSearch={aiSearch}
          setAiSearch={setAiSearch}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-zinc-950">
          {/* Page Header Component */}
          <PageHeader
            activeView={activeView}
            showUploadButton={true}
            showCreateFolderButton={true}
            setShowUploadModal={setShowUploadModal}
            setShowCreateFolderModal={setShowCreateFolderModal}
          />

          {/* Stats Cards - Above Folders */}
          <StatsCard
            files={totalCounts.totalFiles}
            storage={formatFileSize(storageInfo.usedBytes)}
            folders={totalCounts.totalFolders}
            favorites={totalCounts.totalFavoriteFiles || 0}
            formatFileSize={formatFileSize}
          />

          {/* Folders Grid */}
          {activeView === "files" && folders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Folders
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    onDelete={(folder) => {
                      setFolderToDelete(folder);
                      setShowDeleteFolderModal(true);
                    }}
                    onRename={(folder) => {
                      setFolderToRename(folder);
                      setShowRenameModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files List */}
          <FilesList
            ref={filesListRef}
            userId={user?._id || ""}
            username={user?.username || "User"}
            activeView={activeView}
            searchQuery={searchQuery}
            aiSearch={aiSearch}
            maxFiles={3}
            onStorageUpdate={(info) =>
              setStorageInfo((prev) => ({ ...prev, ...info }))
            }
            onFavouriteToggle={fetchTotalCounts}
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

      {/* Create Folder Modal Component */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => {
          setShowCreateFolderModal(false);
          // Refresh total counts after folder creation
          fetchTotalCounts();
        }}
        currentFolderId={currentFolderId}
      />

      {/* Rename Folder Modal Component */}
      <RenameFolderModal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setFolderToRename(null);
          setRenameError(null);
        }}
        onConfirm={handleRenameFolder}
        folderName={folderToRename?.name || ""}
        loading={renameLoading}
        error={renameError}
      />

      {/* Delete Folder Modal Component */}
      <DeleteFolderModal
        isOpen={showDeleteFolderModal}
        onClose={() => {
          setShowDeleteFolderModal(false);
          setFolderToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteFolder}
        folderName={folderToDelete?.name || ""}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};

export default UploadPage;
