import React from "react";
import Link from "next/link";

interface MintoLogoProps {
  className?: string;
  showTagline?: boolean;
}

export const MintoLogo: React.FC<MintoLogoProps> = ({ className = "", showTagline = false }) => {
  return (
    <Link href="/" className={`inline-flex items-center space-x-2.5 group cursor-pointer ${className}`}>
      {/* Icon Badge */}
      <div className="relative w-8 h-8 rounded-xl bg-[#74D96F] flex items-center justify-center shadow-[0_2px_10px_rgba(116,217,111,0.35)] transition-transform duration-200 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized 'e' / swirl spiral token */}
          <circle cx="12" cy="12" r="8" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M7.5 12h8.5a4 4 0 0 0-4-4c-3.5 0-4.5 3-4.5 4s1 4 4.5 4c2.5 0 3.8-1.5 4-2.5" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight text-[#262626] leading-none">
          Minto
        </span>
        {showTagline && (
          <span className="text-[10px] text-[#666666] tracking-wide font-medium mt-0.5">
            Zero-Friction Web3 Infra
          </span>
        )}
      </div>
    </Link>
  );
};
