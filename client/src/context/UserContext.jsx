import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await axios.get(
        "http://localhost:3000/api/user/verify-auth",
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
      if (error.response?.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
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
        "http://localhost:3000/api/user/login",
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
        message: error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/register",
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
        message: error.response?.data?.message || "Registration failed. Please try again.",
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
        "http://localhost:3000/api/user/refresh-token",
        {
          refreshToken,
        }
      );

      if (response.data.success) {
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        return true;
      }
      
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
        "http://localhost:3000/api/user/profile",
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
        "http://localhost:3000/api/user/delete",
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

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
