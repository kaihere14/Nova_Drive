import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolder } from "../context/FolderContext";
import { useUser } from "../hooks/useUser";
import { useChunkUpload } from "../hooks/useChunkUpload";
import FilesList from "../components/FilesList";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";
import CreateFolderModal from "../components/CreateFolderModal";
import DeleteFolderModal from "../components/DeleteFolderModal";
import PageHeader from "../components/PageHeader";
import usePageMeta from "../utils/usePageMeta";
import {
  FolderOpen,
  ChevronLeft,
  Upload,
  Trash2,
  Folder,
  MoreVertical,
} from "lucide-react";

const FolderPage = () => {
  usePageMeta("NovaDrive — Folder", "View and manage files in your folder.");

  const { folderId } = useParams();
  const navigate = useNavigate();
  const {
    user,
    checkAuth,
    loading,
    logout,
    fetchTotalCounts,
    storageInfo,
    setStorageInfo,
  } = useUser();
  const {
    fetchFolders,
    currentFolderId,
    folders,
    loading: folderLoading,
    error: folderError,
    navigateToFolder,
    setCurrentFolderId,
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

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Fetch folders and files when folder ID changes
  useEffect(() => {
    if (user?._id && folderId) {
      fetchFolders(folderId);
      fetchTotalCounts();
    }
  }, [user, folderId]);

  // Update storage quota when user data loads
  useEffect(() => {
    if (user?.storageQuota) {
      setStorageInfo((prev) => ({
        ...prev,
        totalBytes: user.storageQuota,
      }));
    }
  }, [user]);

  // Watch for successful upload completion
  useEffect(() => {
    if (uploadStatus === "Upload complete!") {
      if (filesListRef.current?.refresh) {
        filesListRef.current.refresh();
      }

      if (filesListRef.current?.startPolling) {
        filesListRef.current.startPolling();
      }

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
    } else {
      setDeleteError(result.message);
    }

    setDeleteLoading(false);
  };

  const handleGoBack = () => {
    setCurrentFolderId(null); // Reset to root folder
    navigate("/upload");
  };

  // Show loading until authentication is verified AND folder data is loaded
  if (loading || (folderId && folderLoading)) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono">LOADING_FOLDER...</p>
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
        activeView="files"
        setActiveView={() => {}}
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
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="mb-6 flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/50 rounded transition-colors text-zinc-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>

          {/* Page Header */}
          <PageHeader
            title="Folder Contents"
            description="View all files in this folder"
            showUploadButton={true}
            showCreateFolderButton={true}
            onUploadClick={() => setShowUploadModal(true)}
            onCreateFolderClick={() => setShowCreateFolderModal(true)}
          />

          {/* Subfolders Grid */}
          {folders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Subfolders
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 hover:from-zinc-800/60 hover:to-zinc-900/60 border border-zinc-700/30 hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/5 transition-all duration-300 pointer-events-none" />

                    {/* Delete Button - Always visible on mobile, hover on desktop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder);
                        setShowDeleteFolderModal(true);
                      }}
                      className="absolute top-3 right-3 p-2 bg-zinc-900/80 backdrop-blur-sm hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 hover:scale-110"
                      title="Delete folder"
                    >
                      {/* Show three dots on mobile, trash icon on desktop */}
                      <MoreVertical className="w-4 h-4 md:hidden" />
                      <Trash2 className="w-4 h-4 hidden md:block" />
                    </button>

                    {/* Folder Content */}
                    <div
                      onClick={() => navigate(`/folder/${folder._id}`)}
                      className="cursor-pointer p-5 relative"
                    >
                      {/* Folder Icon Container */}
                      <div className="relative mb-4 h-20 flex items-center justify-center">
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent rounded-xl blur-xl group-hover:from-blue-500/30 group-hover:via-blue-600/20 transition-all duration-300" />

                        {/* Icon container */}
                        <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl border border-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-300">
                          <FolderOpen
                            className="w-9 h-9 text-blue-400 group-hover:text-blue-300 transition-colors duration-300"
                            strokeWidth={1.5}
                          />

                          {/* Subtle shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </div>
                      </div>

                      {/* Folder Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors duration-200">
                          {folder.name}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="group-hover:text-zinc-400 transition-colors">
                            {new Date(folder.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files List */}
          <FilesList
            ref={filesListRef}
            userId={user?._id || ""}
            username={user?.username || "User"}
            activeView="files"
            searchQuery={searchQuery}
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
        onClose={() => setShowCreateFolderModal(false)}
        currentFolderId={folderId}
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

export default FolderPage;
