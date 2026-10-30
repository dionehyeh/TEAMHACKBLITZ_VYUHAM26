"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Activity, Zap } from "lucide-react";

interface MintoHardwareIllustrationProps {
  className?: string;
  activeFeature?: string;
  onKeyClick?: (keyName: string) => void;
}

export const MintoHardwareIllustration: React.FC<MintoHardwareIllustrationProps> = ({
  className = "",
  onKeyClick,
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [vuLevel, setVuLevel] = useState(72);

  // Pulse telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVuLevel((prev) => {
        const delta = (Math.random() - 0.48) * 12;
        return Math.min(96, Math.max(45, Math.round(prev + delta)));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleKeyTap = (key: string) => {
    setPressedKey(key);
    if (onKeyClick) onKeyClick(key);
    setTimeout(() => setPressedKey(null), 300);
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center ${className}`}>
      {/* Container Card */}
      <div className="relative w-full max-w-[520px] rounded-[36px] bg-[#EDEDED] border border-[#E2E2E2] p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Subtle background tech grid */}
        <div 
          className="absolute inset-0 opacity-[0.35] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(#BEBEBE 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} 
        />

        {/* Floating Token / Node with Selection Box */}
        <div className="relative w-full flex justify-end pr-4 mb-2 z-10">
          <div className="relative group cursor-pointer animate-bounce-subtle">
            {/* Selection Bounding Box with blue handles */}
            <div className="relative p-2 border-1.5 border-[#75A0C9] bg-white/70 backdrop-blur-xs rounded-xl shadow-sm">
              {/* Corner Handles */}
              <span className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#75A0C9]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#75A0C9]" />
              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#75A0C9]" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#75A0C9]" />

              {/* 3D Isometric Tile: White top, Orange side */}
              <div className="relative w-16 h-12 flex flex-col items-center">
                {/* Top Face */}
                <div className="w-14 h-9 bg-white rounded-lg border border-[#BEBEBE] flex items-center justify-center shadow-xs z-10 transition-transform group-hover:scale-105">
                  <Zap className="w-4 h-4 text-[#74D96F] fill-[#74D96F]" />
                </div>
                {/* 3D Depth Extrusion */}
                <div className="w-14 h-4 bg-[#F09363] rounded-b-lg border-x border-b border-[#D47849] -mt-2.5 z-0" />
              </div>
            </div>

            {/* Mouse cursor pointer indicator */}
            <div className="absolute -bottom-3 -right-3 w-5 h-5 pointer-events-none drop-shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white stroke-[#262626] stroke-[1.5]">
                <path d="M4 3l7.5 17 2.5-6.5 6.5-2.5L4 3z" />
              </svg>
            </div>

            {/* Dashed connector line downward */}
            <div className="absolute left-1/2 top-full w-px h-8 border-l border-dashed border-[#BEBEBE]" />
          </div>
        </div>

        {/* Keyboard Illustration Showcase */}
        <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center my-2">
          <div className="relative w-full h-full">
            <Image
              src="/images/keyboard-card.png"
              alt="Minto Tactile Mechanical Interface"
              fill
              className="object-contain drop-shadow-md select-none transition-transform duration-300 hover:scale-[1.02]"
              priority
            />
          </div>
        </div>

        {/* Live Interactive Telemetry Strip */}
        <div className="w-full mt-2 pt-3 border-t border-[#DCDCDC] flex items-center justify-between text-xs z-10">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#74D96F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#74D96F]" />
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#262626]">
              STATUS: ZERO_FRICTION
            </span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px] text-[#666666]">
            <span className="flex items-center">
              <Activity className="w-3 h-3 text-[#ED6B2D] mr-1" />
              {vuLevel}% LOAD
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-[#D0D0D0] text-[#262626] font-bold">
              0.12s
            </span>
          </div>
        </div>

        {/* Tactile Key Switch Simulator Badges */}
        <div className="w-full mt-3 flex items-center justify-center gap-1.5 flex-wrap">
          {["S", "T", "A", "R", "T"].map((letter) => (
            <button
              key={letter}
              onClick={() => handleKeyTap(letter)}
              className={`w-7 h-7 rounded-lg border text-xs font-mono font-bold transition-all shadow-[0_2px_0_#BEBEBE] active:shadow-none active:translate-y-0.5 ${
                pressedKey === letter
                  ? "bg-[#74D96F] text-[#262626] border-[#56BE51]"
                  : "bg-white text-[#262626] border-[#BEBEBE] hover:bg-slate-50"
              }`}
            >
              {letter}
            </button>
          ))}
          <button
            onClick={() => handleKeyTap("Connect")}
            className={`px-3 h-7 rounded-lg border text-[11px] font-mono font-bold transition-all shadow-[0_2px_0_#BEBEBE] active:shadow-none active:translate-y-0.5 ${
              pressedKey === "Connect"
                ? "bg-[#74D96F] text-[#262626] border-[#56BE51]"
                : "bg-white text-[#262626] border-[#BEBEBE] hover:bg-slate-50"
            }`}
          >
            Connect ↵
          </button>
          <button
            onClick={() => handleKeyTap("Learn More")}
            className="px-3 h-7 rounded-lg bg-[#9DFF9B] border border-[#56BE51] text-[#262626] text-[11px] font-mono font-extrabold shadow-[0_2px_0_#56BE51] active:shadow-none active:translate-y-0.5 hover:bg-[#85f783] transition-all"
          >
            Learn More
          </button>
        </div>

      </div>
    </div>
  );
};
