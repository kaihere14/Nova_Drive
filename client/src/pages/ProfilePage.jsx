import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import axios from "axios";
import usePageMeta from "../utils/usePageMeta";
import BASE_URL from "../config";
import {
  User,
  Mail,
  Calendar,
  Shield,
  HardDrive,
  ArrowLeft,
  Edit2,
  LogOut,
} from "lucide-react";

const ProfilePage = () => {
  usePageMeta(
    "Profile — NovaDrive",
    "Your NovaDrive profile, storage usage and account details."
  );
  const navigate = useNavigate();
  const { user, loading, logout, deleteAccount } = useUser();
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: "0 GB",
    accountAge: "0 days",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        // Calculate account age
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        try {
          // Fetch user's files to calculate actual storage
          const response = await axios.get(
            `${BASE_URL}/api/files/list-files`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          const files = response.data.files || [];
          const totalFiles = files.length;
          const totalBytes = files.reduce(
            (acc, file) => acc + (file.size || 0),
            0
          );

          // Format storage size
          const formatSize = (bytes) => {
            if (bytes === 0) return "0 GB";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
              Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
            );
          };

          setStats({
            totalFiles,
            storageUsed: formatSize(totalBytes),
            accountAge: `${diffDays} days`,
          });
        } catch (error) {
          console.error("Error fetching user stats:", error);
          // Fallback to default values
          setStats({
            totalFiles: 0,
            storageUsed: "0 GB",
            accountAge: `${diffDays} days`,
          });
        }
      }
    };

    fetchUserStats();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "delete") {
      setDeleteError("Please type 'delete' to confirm");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const result = await deleteAccount();
      if (result.success) {
        navigate("/");
      } else {
        setDeleteError(result.message || "Failed to delete account");
      }
    } catch (error) {
      setDeleteError("An error occurred while deleting your account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono">LOADING_PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 font-sans selection:bg-white/20 selection:text-white">
      {/* Grid Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: "0.3",
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[100dvh] px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono">BACK_TO_FILES</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-mono text-sm">LOGOUT</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]">
                {user?.username
                  ? user.username.substring(0, 2).toUpperCase()
                  : "U"}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {user?.username || "User"}
                    </h1>
                    <p className="text-zinc-400 font-mono text-sm">
                      ACCOUNT_PROFILE
                    </p>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">{user?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">
                      Joined {formatDate(user?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-mono">
                      ID: {user?._id?.slice(-8) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-transparent group-hover:from-cyan-500/3 transition-all duration-300 pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-lg flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:scale-110 transition-all duration-300">
                  <HardDrive className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">TOTAL_FILES</h3>
              </div>
              <p className="relative text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {stats.totalFiles}
              </p>
            </div>

            <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border border-blue-500/20 hover:border-blue-500/40 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/3 transition-all duration-300 pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-300">
                  <HardDrive className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">
                  STORAGE_USED
                </h3>
              </div>
              <p className="relative text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                {stats.storageUsed}
              </p>
            </div>

            <div className="group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-transparent group-hover:from-purple-500/3 transition-all duration-300 pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 group-hover:scale-110 transition-all duration-300">
                  <Calendar className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">ACCOUNT_AGE</h3>
              </div>
              <p className="relative text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {stats.accountAge}
              </p>
            </div>
          </div>

          {/* Account Settings */}
          <div className="relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 border border-zinc-700/50 rounded-xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent pointer-events-none" />
            <h2 className="relative text-xl font-bold text-white mb-4 font-mono bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              ACCOUNT_SETTINGS
            </h2>
            <div className="relative space-y-3">
              <button className="group w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:from-zinc-800 hover:to-zinc-900 border border-blue-500/10 hover:border-blue-500/30 rounded-lg transition-all duration-200 text-left hover:shadow-lg hover:shadow-blue-500/5">
                <span className="text-zinc-200 font-medium group-hover:text-blue-300 transition-colors">
                  Change Password
                </span>
                <Edit2 className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
              </button>
              <button className="group w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:from-zinc-800 hover:to-zinc-900 border border-cyan-500/10 hover:border-cyan-500/30 rounded-lg transition-all duration-200 text-left hover:shadow-lg hover:shadow-cyan-500/5">
                <span className="text-zinc-200 font-medium group-hover:text-cyan-300 transition-colors">Update Email</span>
                <Edit2 className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="group w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-red-900/20 to-red-950/20 hover:from-red-900/30 hover:to-red-950/30 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-200 text-left hover:shadow-lg hover:shadow-red-500/5"
              >
                <span className="text-red-300 font-medium group-hover:text-red-200 transition-colors">Delete Account</span>
                <Shield className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="group relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 hover:border-red-500/30 rounded-2xl p-8 max-w-md w-full transition-all duration-300 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-transparent group-hover:from-red-500/3 transition-all duration-300 pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteInput("");
                setDeleteError("");
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-400 hover:text-red-300 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="relative mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg flex items-center justify-center mb-4 border border-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent mb-2 font-mono">
                DELETE_ACCOUNT
              </h3>
              <p className="text-zinc-400 text-sm">
                This action cannot be undone. All your files and data will be permanently deleted.
              </p>
            </div>

            {/* Delete Error */}
            {deleteError && (
              <div className="relative mb-4 p-4 bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2 font-mono">
                  <Shield className="w-4 h-4" />
                  {deleteError}
                </p>
              </div>
            )}

            {/* Confirmation Input */}
            <div className="relative mb-6">
              <label
                htmlFor="deleteConfirm"
                className="block text-sm font-mono text-zinc-400 mb-2"
              >
                TYPE "delete" TO CONFIRM
              </label>
              <input
                type="text"
                id="deleteConfirm"
                value={deleteInput}
                onChange={(e) => {
                  setDeleteInput(e.target.value);
                  setDeleteError("");
                }}
                placeholder="delete"
                className="w-full px-4 py-3 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-red-500/20 hover:border-red-500/40 focus:border-red-500/60 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
              />
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteInput !== "delete"}
              className="relative w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 font-mono overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              {deleteLoading ? (
                <>
                  <div className="relative w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="relative">DELETING...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 relative" />
                  <span className="relative">DELETE_ACCOUNT</span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteInput("");
                setDeleteError("");
              }}
              disabled={deleteLoading}
              className="relative w-full mt-3 py-3 bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 hover:from-zinc-700 hover:to-zinc-800 text-zinc-300 hover:text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono border border-zinc-600/30"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
