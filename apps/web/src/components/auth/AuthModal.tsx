"use client";

import React, { useEffect } from "react";
import { AuthFormCard } from "./AuthFormCard";
import { X } from "lucide-react";

interface AuthModalProps {
  initialMode: "login" | "register";
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent background body scroll while modal is active
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-sm transition-opacity duration-200"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div 
          className="relative w-full max-w-[540px] my-auto transition-all transform scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-Right Floating Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:-top-3 sm:-right-3 w-9 h-9 rounded-full bg-white border border-[#BEBEBE] text-[#262626] hover:bg-slate-100 flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-30 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Auth Form Card */}
          <AuthFormCard initialMode={initialMode} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
