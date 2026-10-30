"use client";

import React from "react";
import { MintoLogo } from "./MintoLogo";
import { AuthFormCard } from "./AuthFormCard";

interface AuthPageLayoutProps {
  mode: "login" | "register";
}

const highlights = [
  "Ask your organisation's knowledge in plain language",
  "Keep people, departments and projects in one place",
  "Delegate routine work to permissioned AI agents",
];

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ mode }) => {
  return (
    <div className="min-h-screen w-full bg-white text-[#262626] flex flex-col selection:bg-[#9DFF9B]">
      <header className="w-full max-w-6xl mx-auto px-6 sm:px-10 pt-8">
        <MintoLogo />
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Your business, remembered.
          </h1>
          <p className="text-base text-[#666666] leading-relaxed">
            BizContext brings your knowledge, teams and automation into one workspace.
          </p>
          <ul className="space-y-2.5 text-sm text-[#262626]">
            {highlights.map((h) => (
              <li key={h} className="flex items-start space-x-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#56BE51] shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-md lg:justify-self-end">
          <AuthFormCard initialMode={mode} />
        </div>
      </main>
    </div>
  );
};
