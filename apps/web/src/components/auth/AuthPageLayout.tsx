"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MintoLogo } from "./MintoLogo";
import { AuthModal } from "./AuthModal";

interface AuthPageLayoutProps {
  mode: "login" | "register";
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ mode: initialMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [modalMode, setModalMode] = useState<"login" | "register">(initialMode);

  React.useEffect(() => {
    setModalMode(initialMode);
    setIsModalOpen(true);
  }, [initialMode]);

  const openAuth = (mode: "login" | "register") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const isLogin = initialMode === "login";

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#262626] flex flex-col justify-between selection:bg-[#9DFF9B] selection:text-[#262626] overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 pt-8 pb-4 flex items-center justify-between z-20">
        <MintoLogo />

        {/* Minimal header links */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-[#666666]">
            <span className="w-2 h-2 rounded-full bg-[#74D96F] animate-pulse" />
            <span>OPERATIONAL (99.99%)</span>
          </div>

          <button
            type="button"
            onClick={() => openAuth(isLogin ? "register" : "login")}
            className="text-xs sm:text-sm font-semibold text-[#666666] hover:text-[#262626] transition underline decoration-dotted"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </header>

      {/* Main Hero Container - Exactly matching image composition */}
      <main className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 my-auto py-6 lg:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Clean white background, bold text, and capsule buttons */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 z-10">
            
            {/* Bold Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#262626] leading-[1.04]">
                {isLogin ? (
                  <>
                    Welcome back.<br />
                    Zero friction.
                  </>
                ) : (
                  <>
                    Start building.<br />
                    Zero friction.
                  </>
                )}
              </h1>

              {/* Subtitle description */}
              <p className="text-lg sm:text-xl text-[#666666] max-w-md font-normal leading-relaxed">
                {isLogin
                  ? "Instant workspace access, real-time status, and autonomous intelligence built for scale."
                  : "Create your autonomous workspace. Connect in seconds with zero friction."}
              </p>
            </div>

            {/* Dual Capsule Buttons matching the image */}
            <div className="flex items-center space-x-4 pt-2">
              <button
                type="button"
                onClick={() => openAuth(isLogin ? "login" : "register")}
                className="bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] font-bold text-base sm:text-lg px-8 py-4 rounded-full transition-all shadow-[0_4px_16px_rgba(116,217,111,0.35)] active:translate-y-0.5 cursor-pointer"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => openAuth(isLogin ? "register" : "login")}
                className="bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#262626] font-semibold text-base sm:text-lg px-8 py-4 rounded-full transition-all active:translate-y-0.5 cursor-pointer"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>

          </div>

          {/* Right Column: Exact 1:1 Mechanical Keyboard Hero Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div 
              onClick={() => openAuth("login")}
              className="relative w-full max-w-[560px] aspect-[466/498] cursor-pointer group transition-transform duration-300 hover:scale-[1.01]"
              title="Click to sign in"
            >
              <Image
                src="/images/minto-keyboard-hero.png"
                alt="Minto Zero Friction Mechanical Keyboard Illustration"
                fill
                priority
                className="object-contain select-none drop-shadow-xs"
              />
            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 py-6 border-t border-[#EDEDED] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] gap-4 z-20">
        <div>
          <span>© 2026 Minto Zero-Friction Auth</span>
          <span className="mx-2">·</span>
          <span>BizContext AI Workspace</span>
        </div>

        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="hover:text-[#262626] transition font-medium"
          >
            Sign In
          </button>
          <a href="#security" className="hover:text-[#262626] transition">Security SLA</a>
          <a href="#privacy" className="hover:text-[#262626] transition">Privacy</a>
        </div>
      </footer>

      {/* Interactive Modal when clicking Sign In / Create Account */}
      {isModalOpen && (
        <AuthModal
          initialMode={modalMode}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
