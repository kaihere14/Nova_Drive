import { useFolder } from "../context/FolderContext";

export const useFolderData = () => {
  const context = useFolder();
  
  return {
    ...context,
    // Helper to get folder by ID
    getFolderById: (folderId) => {
      return context.folders.find(folder => folder._id === folderId);
    },
    // Helper to check if at root
    isAtRoot: context.currentFolderId === null,
    // Helper to get current folder name
    getCurrentFolderName: () => {
      if (context.currentFolderId === null) return "Home";
      const folder = context.folders.find(f => f._id === context.currentFolderId);
      return folder?.name || "Unknown";
    },
  };
};
