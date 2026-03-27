import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pr-6 md:pr-0 h-16 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center ">
          <img
            src="https://res.cloudinary.com/dw87upoot/image/upload/v1765959245/Logo_Feedback_Dec_17_2025_1_bha0nd.png"
            alt="NovaDrive logo"
            className="w-12 h-12 object-contain"
          />
          <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-base sm:text-lg">
            NovaDrive
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/architecture"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Architecture
          </Link>
          <Link
            to="/pricing"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/architecture"
              className="block py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Architecture
            </Link>
            <Link
              to="/pricing"
              className="block py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <Link
                to="/login"
                className="block py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="block text-center bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
