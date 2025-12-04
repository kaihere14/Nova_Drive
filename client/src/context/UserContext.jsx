import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshPopup, setShowRefreshPopup] = useState(false);

  // Setup axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          const refreshToken = localStorage.getItem("refreshToken");
          
          if (!refreshToken) {
            logout();
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          
          try {
            const refreshed = await refreshAccessToken();
            
            if (refreshed) {
              setShowRefreshPopup(true);
              return Promise.reject(error);
            } else {
              logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
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
      
      {/* Refresh Popup */}
      {showRefreshPopup && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Session Refreshed</h3>
            <p className="text-zinc-600 mb-4">Your session has been refreshed. Please reload the page to continue.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {!loading && !isRefreshing && children}
    </UserContext.Provider>
  );
};
