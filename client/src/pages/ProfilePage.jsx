import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
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
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: "0 GB",
    accountAge: "0 days",
  });

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Calculate account age
      const createdDate = new Date(user.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setStats({
        totalFiles: user.totalFiles || 0,
        storageUsed: user.storageUsed || "0 GB",
        accountAge: `${diffDays} days`,
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono">LOADING_PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-white/20 selection:text-white">
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
      <div className="relative z-10 min-h-screen px-6 py-8">
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">TOTAL_FILES</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalFiles}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">
                  STORAGE_USED
                </h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.storageUsed}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono text-zinc-400">ACCOUNT_AGE</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.accountAge}
              </p>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 font-mono">
              ACCOUNT_SETTINGS
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-left border border-zinc-700">
                <span className="text-zinc-200 font-medium">
                  Change Password
                </span>
                <Edit2 className="w-4 h-4 text-zinc-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-left border border-zinc-700">
                <span className="text-zinc-200 font-medium">Update Email</span>
                <Edit2 className="w-4 h-4 text-zinc-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-left border border-red-500/30">
                <span className="text-red-400 font-medium">Delete Account</span>
                <Shield className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
