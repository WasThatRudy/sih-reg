"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Password reset email sent! Check your inbox and follow the instructions to reset your password."
      );
      setEmail("");
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const errorCode = (error as { code?: string })?.code;
      setError(getErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please check your email address.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/configuration-not-found":
        return "Firebase configuration error. Please contact support.";
      default:
        return `Failed to send password reset email. Error: ${
          errorCode || "Unknown error"
        }. Please try again.`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-heading tracking-tight">
              Forgot Password
            </h1>
            <p className="text-gray-400 text-lg font-body">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </motion.div>

          {/* Forgot Password Form */}
          <motion.div
            className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm font-body">
                  {error}
                </motion.div>
              )}

              {/* Success Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm font-body">
                  {message}
                </motion.div>
              )}

              {/* Email Field */}
              <ValidatedInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(value) => setEmail(value)}
                placeholder="Enter your email address"
                required
                validationType="email"
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-lg text-white font-medium tracking-wide font-body transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-heading hover:bg-heading/90 hover:shadow-lg hover:shadow-heading/20"
                }`}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-subheading hover:text-subheading/80 transition-colors duration-300 font-medium text-sm">
                  Back to Login
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}>
            <p className="text-gray-500 text-sm font-body">
              Password reset powered by Firebase Authentication
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
