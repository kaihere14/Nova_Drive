import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center relative">
        {/* Center Logo */}
        <div className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dw87upoot/image/upload/v1764738404/Screenshot_2025-12-03_at_10.35.02_AM_b1bbag.png"
            alt="NovaDrive logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-white tracking-tight text-base sm:text-lg">
            NovaDrive
          </span>
        </div>

        {/* Desktop Menu - Positioned Left */}
        <div className="hidden md:flex absolute left-6 items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/architecture"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Architecture
          </Link>
          <Link
            to="/pricing"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Auth Buttons - Positioned Right */}
        <div className="hidden md:flex absolute right-6 items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden absolute right-4 p-2 text-zinc-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block py-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/architecture"
              className="block py-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Architecture
            </Link>
            <Link
              to="/pricing"
              className="block py-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <Link
                to="/login"
                className="block py-2 text-zinc-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block text-center bg-white text-black px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
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
