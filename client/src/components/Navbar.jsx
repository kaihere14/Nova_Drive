import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dw87upoot/image/upload/v1764738404/Screenshot_2025-12-03_at_10.35.02_AM_b1bbag.png"
            alt="NovaDrive logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-white tracking-tight">
            NovaDrive
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
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
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
