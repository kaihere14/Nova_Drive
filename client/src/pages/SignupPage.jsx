import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HardDrive,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  Shield,
  User,
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import usePageMeta from "../utils/usePageMeta";
import axios from "axios";
import BASE_URL from "../config";

const SignupPage = () => {
  usePageMeta(
    "Sign Up — NovaDrive",
    "Create your NovaDrive account to start storing and auto-tagging files securely."
  );
  const navigate = useNavigate();
  const { register, isAuthenticated } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Redirect if already authenticated (checked by UserContext)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/upload");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Request OTP
      const otpResponse = await axios.post(`${BASE_URL}/api/otp/create-otp`, {
        email: formData.email,
      });

      if (otpResponse.status === 201) {
        // Show OTP modal
        setShowOtpModal(true);
        setLoading(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      setOtpLoading(false);
      return;
    }

    try {
      // Step 2: Verify OTP
      const verifyResponse = await axios.post(
        `${BASE_URL}/api/otp/verify-otp`,
        {
          email: formData.email,
          otp: otp,
        }
      );

      if (verifyResponse.status === 200) {
        // Step 3: Register user
        const result = await register(
          formData.name,
          formData.email,
          formData.password
        );

        if (result.success) {
          // Redirect to upload page on successful registration
          navigate("/upload");
        } else {
          setOtpError(
            result.message || "Registration failed. Please try again."
          );
        }
      }
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center mb-4">
              <img
                src="https://res.cloudinary.com/dw87upoot/image/upload/v1765959245/Logo_Feedback_Dec_17_2025_1_bha0nd.png"
                alt="NovaDrive logo"
                className="w-20 h-20 object-contain"
              />
              <span className="text-3xl font-bold text-white">NovaDrive</span>
            </div>
            <p className="text-zinc-400 font-mono text-sm">
              SECURE_CLOUD_STORAGE
            </p>
          </div>

          {/* Signup Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2 font-mono">
                CREATE_ACCOUNT
              </h2>
              <p className="text-zinc-400 text-sm">
                Start your secure storage journey
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-mono text-zinc-400 mb-2"
                >
                  FULL_NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-mono text-zinc-400 mb-2"
                >
                  EMAIL_ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-mono text-zinc-400 mb-2"
                >
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full pl-11 pr-11 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-mono text-zinc-400 mb-2"
                >
                  CONFIRM_PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-11 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 mt-0.5 bg-zinc-800 border-zinc-700 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-zinc-400">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    CREATING_ACCOUNT...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    CREATE_ACCOUNT
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-zinc-900/50 text-zinc-500 font-mono">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={() =>
                (window.location.href = `${BASE_URL}/api/auth/google`)
              }
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all border border-zinc-300 flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-zinc-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-zinc-500 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-mono">256-BIT_ENCRYPTION</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtp("");
                setOtpError("");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-zinc-100 mb-2 font-mono">
                VERIFY_EMAIL
              </h3>
              <p className="text-zinc-400 text-sm">
                Enter the 6-digit code sent to{" "}
                <span className="text-blue-400">{formData.email}</span>
              </p>
            </div>

            {/* OTP Error */}
            {otpError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {otpError}
                </p>
              </div>
            )}

            {/* OTP Input */}
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-sm font-mono text-zinc-400 mb-2"
              >
                ENTER_OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setOtp(value);
                    setOtpError("");
                  }
                }}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-center text-2xl tracking-widest font-mono placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
            >
              {otpLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  VERIFYING...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  VERIFY_OTP
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  try {
                    await axios.post(`${BASE_URL}/api/otp/create-otp`, {
                      email: formData.email,
                    });
                    setOtpError("");
                    setOtp("");
                  } catch (err) {
                    setOtpError("Failed to resend OTP. Please try again.");
                  }
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-mono"
              >
                RESEND_OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
