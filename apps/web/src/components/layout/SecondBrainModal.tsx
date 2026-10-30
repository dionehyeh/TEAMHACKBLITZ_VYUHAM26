"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Sparkles, BookOpen, CornerDownLeft, Loader2, X, AlertCircle } from "lucide-react";

interface SecondBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Answer {
  answer: string;
  sources: Array<{ title: string; category: string; snippet?: string; url?: string }>;
}

export const SecondBrainModal: React.FC<SecondBrainModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      setResult(await api.askSecondBrain(query.trim()));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "The AI engine did not respond.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Ask Second Brain"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-[#DEDEDE] bg-white p-5 shadow-2xl text-[#262626] flex flex-col max-h-[80vh]">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Sparkles className="w-4 h-4 text-[#56BE51] absolute left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your organisation..."
            aria-label="Question"
            className="w-full rounded-full border border-[#BEBEBE] bg-[#F8F9FA] pl-11 pr-28 py-3 text-sm placeholder-[#9E9E9E] focus:border-[#74D96F] focus:bg-white focus:outline-none transition"
            autoFocus
          />
          <div className="absolute right-1.5 flex items-center space-x-1">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Ask <CornerDownLeft className="w-3 h-3 ml-1" /></>}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full text-[#666666] hover:bg-[#EDEDED] flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {isLoading && (
          <p className="mt-5 text-xs text-[#666666] flex items-center space-x-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#56BE51]" />
            <span>Thinking...</span>
          </p>
        )}

        {error && !isLoading && (
          <div role="alert" className="mt-4 flex items-start space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-4 overflow-y-auto space-y-4 pr-1">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</div>
            {result.sources.length > 0 && (
              <div className="pt-3 border-t border-[#EDEDED]">
                <div className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2">Sources</div>
                <ul className="space-y-1.5">
                  {result.sources.map((s, i) => (
                    <li key={i} className="flex items-center space-x-2 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-[#56BE51] shrink-0" />
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-[#9E9E9E]">{s.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
