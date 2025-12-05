import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

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
                logout();
              }, 2000);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            clearTimeout(indicatorTimeout);
            setShowRefreshIndicator(false);
            setRefreshMessage("Session expired. Please log in again.");
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
        console.log(refreshed)
        if (refreshed) {
          // Retry auth check after refreshing token
          console.log("Token refreshed successfully");
          return checkAuth();
        } else {
          console.log("Token refresh failed");
          logout();
          return;
        }
      }

      // Verify token and get user data
      const response = await axios.get(
        "https://nova-drive-backend.vercel.app/api/user/verify-auth",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        // Store full user object from response
        setUser(response.data);
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
      const response = await axios.post(
        "https://nova-drive-backend.vercel.app/api/user/login",
        {
          email,
          password,
        }
      );

      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Update state with full user object
        setUser(user);
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

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        "https://nova-drive-backend.vercel.app/api/user/register",
        {
          username: name,
          email,
          password,
        }
      );
      if (response.data) {
        const { accessToken, refreshToken, newUser } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Update state with full user object
        setUser(newUser);
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

      const response = await axios.post(
        "https://nova-drive-backend.vercel.app/api/user/refresh-token",
        {
          refreshToken,
        }
      );

      
        const { accessToken,refreshToken:refreshToken2 } = response.data;
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
        "https://nova-drive-backend.vercel.app/api/user/profile",
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

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(
        "https://nova-drive-backend.vercel.app/api/user/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        logout();
        return { success: true };
      }
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
      const response = await axios.post(
        "https://nova-drive-backend.vercel.app/api/user/refresh-token",
        {
          refreshToken,
        }
      );
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

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    updateProfile,
    deleteAccount,
    getAuthHeader,
    checkAuth,
  };

  return (
    <UserContext.Provider value={value}>
      {(loading || isRefreshing) && <LoadingScreen message={isRefreshing ? "Refreshing your session..." : "Verifying your session..."} />}
      
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
