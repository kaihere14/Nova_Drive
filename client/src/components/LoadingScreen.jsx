import React from "react";
import { RefreshCw } from "lucide-react";

const LoadingScreen = ({ message = "Verifying your session..." }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <RefreshCw className="w-12 h-12 text-zinc-900 dark:text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          {message}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
