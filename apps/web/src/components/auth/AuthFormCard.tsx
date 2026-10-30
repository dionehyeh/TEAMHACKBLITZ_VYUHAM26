"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

interface AuthFormCardProps {
  initialMode?: "login" | "register";
  className?: string;
  onClose?: () => void;
}

export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  initialMode = "login",
  className = "",
  onClose,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form State - only email and password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    // Mock authentication with storage persistence
    setTimeout(() => {
      setIsLoading(false);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "bizcontext_user",
          JSON.stringify({
            email: formData.email,
            role: "Admin",
            authType: "credentials",
          })
        );
      }

      if (mode === "login") {
        setStatusMessage({
          type: "success",
          text: "Authenticated successfully! Loading your workspace...",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "Account created! Preparing your workspace...",
        });
      }

      setTimeout(() => {
        if (onClose) onClose();
        router.push("/");
      }, 1000);
    }, 1000);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setStatusMessage({
        type: "error",
        text: "Please enter your email address above to receive a password reset link.",
      });
      return;
    }
    setForgotPasswordSent(true);
    setStatusMessage({
      type: "success",
      text: `Password reset link sent to ${formData.email}! Check your inbox.`,
    });
  };

  return (
    <div
      className={`relative w-full rounded-[36px] bg-[#EDEDED] border border-[#DEDEDE] p-6 sm:p-8 md:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.1)] flex flex-col justify-between ${className}`}
    >
      {/* Top Bar: Mode Switcher Pill & Optional Header Close */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D6D6D6]">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-[#666666]">
            {mode === "login" ? "PORTAL_AUTHENTICATION" : "ONBOARDING_REGISTER"}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#262626] tracking-tight mt-0.5">
            {mode === "login" ? "Sign in to Minto" : "Create your account"}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Switcher */}
          <div className="bg-[#DFDFDF] p-1 rounded-full flex items-center border border-[#D2D2D2]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setStatusMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-[#262626] shadow-sm"
                  : "text-[#666666] hover:text-[#262626]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setStatusMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-[#262626] shadow-sm"
                  : "text-[#666666] hover:text-[#262626]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Optional Direct Header Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#666666] hover:text-[#262626] hover:bg-[#E2E2E2] transition sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Feedback Message */}
      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-2xl text-xs font-medium border flex items-center space-x-2.5 ${
            statusMessage.type === "success"
              ? "bg-[#74D96F]/20 border-[#56BE51]/40 text-[#1F541D]"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-blue-50 border-blue-200 text-[#2F5885]"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-[#56BE51] shrink-0" />
          )}
          {statusMessage.type === "info" && (
            <Sparkles className="w-4 h-4 text-[#75A0C9] shrink-0 animate-spin" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-[#262626] uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="alex@enterprise.xyz"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#BEBEBE] focus:border-[#75A0C9] focus:ring-2 focus:ring-[#75A0C9]/20 rounded-2xl text-sm text-[#262626] placeholder-[#9E9E9E] outline-none transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-[#262626] uppercase tracking-wider">
              Password
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-[#666666] hover:text-[#262626] transition underline decoration-dotted cursor-pointer"
              >
                {forgotPasswordSent ? "Reset link sent!" : "Forgot password?"}
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#BEBEBE] focus:border-[#75A0C9] focus:ring-2 focus:ring-[#75A0C9]/20 rounded-2xl text-sm text-[#262626] placeholder-[#9E9E9E] outline-none transition font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#262626] p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center justify-between text-xs text-[#666666] pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded border-[#BEBEBE] text-[#74D96F] focus:ring-[#74D96F]"
            />
            <span>
              {mode === "login"
                ? "Keep me signed in for 30 days"
                : "I agree to Terms & Security SLA"}
            </span>
          </label>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#262626] hover:bg-[#1a1a1a] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-sm active:translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer mt-3"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span className="text-sm font-extrabold tracking-tight">
                {mode === "login" ? "Sign In to Minto" : "Create Account"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
