import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import BASE_URL from "../config";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [oAuthUser, setOAuthUser] = useState(null);
  const [directory, setDirectory] = useState(null); // New state for folder location
  const [totalCounts, setTotalCounts] = useState({
    totalFiles: 0,
    totalFolders: 0,
    totalFavoriteFiles: 0,
  });
  const [storageInfo, setStorageInfo] = useState({
    usedBytes: 0,
    totalBytes: user?.storageQuota || 10 * 1024 * 1024 * 1024, // Default 10 GB
  });

  // Setup axios interceptor for 401 errors with auto-retry
  useEffect(() => {
    let isCurrentlyRefreshing = false;
    let refreshPromise = null;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            setRefreshMessage("Session expired. Please log in again.");
            setTimeout(() => {
              setRefreshMessage("");
            }, 3000);
            setTimeout(() => {
              logout();
            }, 2000);
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          // If already refreshing, wait for that promise
          if (isCurrentlyRefreshing && refreshPromise) {
            try {
              await refreshPromise;
              const newToken = localStorage.getItem("accessToken");
              if (newToken) {
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch {
              return Promise.reject(error);
            }
          }

          // Start refresh with delayed indicator
          isCurrentlyRefreshing = true;
          const startTime = Date.now();

          // Show indicator only if refresh takes > 400ms
          const indicatorTimeout = setTimeout(() => {
            setShowRefreshIndicator(true);
          }, 400);

          try {
            refreshPromise = refreshAccessToken();
            const refreshed = await refreshPromise;

            clearTimeout(indicatorTimeout);
            setShowRefreshIndicator(false);

            const duration = Date.now() - startTime;

            if (refreshed) {
              // Retry the original request with new token
              const newToken = localStorage.getItem("accessToken");
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              setRefreshMessage("Session expired. Please log in again.");
              setTimeout(() => {
                setRefreshMessage("");
              }, 3000);
              setTimeout(() => {
                logout();
              }, 2000);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            clearTimeout(indicatorTimeout);
            setShowRefreshIndicator(false);
            setRefreshMessage("Session expired. Please log in again.");
            setTimeout(() => {
              setRefreshMessage("");
            }, 3000);
            setTimeout(() => {
              logout();
            }, 2000);
            return Promise.reject(refreshError);
          } finally {
            isCurrentlyRefreshing = false;
            refreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token && !refreshToken) {
        setLoading(false);
        logout();
        return;
      }

      if (!token && refreshToken) {
        setIsRefreshing(true);
        const refreshed = await refreshAccessToken();
        setIsRefreshing(false);
        if (refreshed) {
          return checkAuth();
        } else {
          logout();
          return;
        }
      }

      // Verify token and get user data
      const response = await axios.get(`${BASE_URL}/api/user/verify-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        // Store full user object from response
        setUser(response.data);
        // Persist OAuth flag so UI can reliably hide password/email actions
        setOAuthUser(
          response.data.authProvider && response.data.authProvider !== "local"
        );
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // If token is invalid, try to refresh
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsRefreshing(true);
        const refreshed = await refreshAccessToken();
        setIsRefreshing(false);
        if (refreshed) {
          // Retry auth check after refreshing token
          return checkAuth();
        } else {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, {
        email,
        password,
      });

      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Update state with full user object
        setUser(user);
        setOAuthUser(user.authProvider && user.authProvider !== "local");
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const googleRegisterOrLogin = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/google`);
      return { success: true };
    } catch (error) {
      console.error("Google Registration failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/register`, {
        username: name,
        email,
        password,
      });
      if (response.data) {
        const { accessToken, refreshToken, newUser } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Update state with full user object
        setUser(newUser);
        setOAuthUser(newUser.authProvider && newUser.authProvider !== "local");
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };
  const logout = async () => {
    try {
      // Clear tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setOAuthUser(false);

      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return {
        success: false,
        message: "Logout failed. Please try again.",
      };
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(`${BASE_URL}/api/user/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: refreshToken2 } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken2);
      return true;

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${BASE_URL}/api/user/profile`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed.",
      };
    }
  };

  const updateUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${BASE_URL}/api/user/verify-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return { success: false, error };
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(
        `${BASE_URL}/api/user/delete/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Backend returns { message: "User deleted successfully" } with status 200
      if (
        response.status === 200 ||
        response.data.message === "User deleted successfully"
      ) {
        logout();
        return { success: true };
      }

      return { success: false, message: "Account deletion failed." };
    } catch (error) {
      console.error("Account deletion failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Account deletion failed.",
      };
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isAuthenticated(false);
      }
      const response = await axios.post(`${BASE_URL}/api/user/refresh-token`, {
        refreshToken,
      });
      if (response.data.statusCode === 200) {
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  const forgotPasswordOtp = async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/otp/forgot-otp`, {
        email,
      });
      console.log(response);
      if (response.status === 201) {
        return { success: true, message: "OTP sent to email." };
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP.",
      };
    }
  };

  const forgotPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/forgot-password`,
        { email, otp, newPassword }
      );
      if (response.status === 200) {
        return { success: true, message: "Password reset successful." };
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      return { success: false, message: "Password reset failed." };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      if (!oldPassword || !newPassword) {
        return {
          success: false,
          message: "Old password and new password are required.",
        };
      }
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${BASE_URL}/api/user/change-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        return { success: true, message: "Password changed successfully." };
      }
      return { success: false, message: "Password change failed." };
    } catch (error) {
      console.error("Password change failed:", error);
      return { success: false, message: "Password change failed." };
    }
  };

  const fetchTotalCounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${BASE_URL}/api/user/total`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setTotalCounts({
          totalFiles: response.data.totalFiles || 0,
          totalFolders: response.data.totalFolders || 0,
          totalFavoriteFiles: response.data.totalFavoriteFiles || 0,
        });
        setStorageInfo((prev) => ({
          ...prev,
          usedBytes: response.data.totalStorageUsed || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching total counts:", error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    directory,
    totalCounts,
    oAuthUser,
    setOAuthUser,
    fetchTotalCounts,
    googleRegisterOrLogin,
    storageInfo,
    setStorageInfo,
    setDirectory,
    login,
    register,
    forgotPasswordOtp,
    forgotPassword,
    changePassword,
    logout,
    refreshAccessToken,
    updateProfile,
    updateUser,
    deleteAccount,
    getAuthHeader,
    checkAuth,
  };

  return (
    <UserContext.Provider value={value}>
      {(loading || isRefreshing) && (
        <LoadingScreen
          message={
            isRefreshing
              ? "Refreshing your session..."
              : "Verifying your session..."
          }
        />
      )}

      {/* Non-blocking refresh indicator - appears at top during token refresh */}
      {showRefreshIndicator && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700 px-4 py-3 flex items-center justify-center gap-3 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-white text-sm font-medium font-mono">
            REFRESHING_SESSION...
          </span>
        </div>
      )}

      {/* Session expired message banner */}
      {refreshMessage && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500/95 backdrop-blur-sm border-b border-red-600 px-4 py-3 flex items-center justify-center gap-3 shadow-lg animate-in slide-in-from-top duration-300">
          <span className="text-white text-sm font-medium">
            {refreshMessage}
          </span>
        </div>
      )}

      {!loading && !isRefreshing && children}
    </UserContext.Provider>
  );
};
