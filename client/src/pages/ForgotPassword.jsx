import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import usePageMeta from "../utils/usePageMeta";

const ForgotPassword = () => {
  usePageMeta(
    "Forgot Password — NovaDrive",
    "Reset your NovaDrive password securely."
  );

  const navigate = useNavigate();
  const { forgotPasswordOtp, forgotPassword } = useUser();
  const [step, setStep] = useState(1); // 1: email, 2: otp & password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await forgotPasswordOtp(email);
    setLoading(false);
    console.log(result);

    if (result.success) {
      setSuccess("OTP sent to your email!");
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 1200);
    } else {
      setError(result.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }
    if (!newPassword.trim()) {
      setError("New password is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await forgotPassword(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess("Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message || "Failed to reset password");
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

          {/* Password Reset Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2 font-mono">
                RESET_PASSWORD
              </h2>
              <p className="text-zinc-400 text-sm">
                {step === 1
                  ? "Enter your email to receive an OTP"
                  : "Enter the OTP and your new password"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {success}
                </p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form key="step1" onSubmit={handleSendOTP} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    "SEND_OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP & Password */}
            {step === 2 && (
              <form
                key="step2"
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                {/* OTP Input */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-mono text-zinc-400 mb-2"
                  >
                    OTP_CODE
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center tracking-widest font-mono"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-mono text-zinc-400 mb-2"
                  >
                    NEW_PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
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
                </div>

                {/* Confirm Password */}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      RESETTING...
                    </>
                  ) : (
                    "RESET_PASSWORD"
                  )}
                </button>

                {/* Back to Email */}
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  className="w-full py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Use different email?
                </button>
              </form>
            )}

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

            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-zinc-400 text-sm">
                Remember your password?{" "}
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
    </div>
  );
};

export default ForgotPassword;
