import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import BASE_URL from "../config";
import { useUser } from "../hooks/useUser";

export const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const { user } = useUser();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch folders for current location
  const fetchFolders = async (folderId = null) => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const parentFolderParam = folderId ? `&parentFolderId=${folderId}` : "";
      const response = await axios.get(
        `${BASE_URL}/api/folders?userId=${user._id}${parentFolderParam}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setFolders(response.data || []);
      setCurrentFolderId(folderId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderId) => {
    fetchFolders(folderId);
  };

  // Go back to parent folder
  const goBack = () => {
    fetchFolders(null);
  };

  // Create a new folder
  const createFolder = async (folderName) => {
    if (!user?._id) return { success: false, message: "User not authenticated" };

    try {
      const response = await axios.post(
        `${BASE_URL}/api/folders/create`,
        {
          userId: user._id,
          folderName: folderName,
          parentFolderId: currentFolderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      await fetchFolders(currentFolderId);
      return { success: true, folder: response.data.folder };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create folder",
      };
    }
  };

  // Delete a folder
  const deleteFolder = async (folderId) => {
    if (!user?._id) return { success: false, message: "User not authenticated" };

    try {
      await axios.delete(`${BASE_URL}/api/folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      await fetchFolders(currentFolderId);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete folder",
      };
    }
  };

  // Refresh current folder view
  const refresh = () => {
    fetchFolders(currentFolderId);
  };

  const value = {
    currentFolderId,
    folders,
    loading,
    error,
    fetchFolders,
    navigateToFolder,
    goBack,
    createFolder,
    deleteFolder,
    refresh,
    setCurrentFolderId,
  };

  return (
    <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
  );
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
};
