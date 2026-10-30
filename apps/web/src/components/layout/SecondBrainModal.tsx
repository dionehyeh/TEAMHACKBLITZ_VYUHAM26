"use client";

import React, { useState } from "react";
import { api } from "../../services/api";
import { Search, Sparkles, BookOpen, ExternalLink, ArrowRight, CornerDownLeft, Loader2, X } from "lucide-react";
import Link from "next/link";

interface SecondBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecondBrainModal: React.FC<SecondBrainModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    sources: Array<{ title: string; category: string; matchConfidence: number; link: string }>;
    suggestedActions: Array<{ label: string; actionType: string; payload?: unknown }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.askSecondBrain(query);
      setResult(res);
    } catch {
      // Error handled
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "What are the security rules for B3 browser agents?",
    "Summarize urgent tickets and SLA status",
    "What action items were extracted from the last meeting?",
    "Explain the hybrid vector retrieval architecture",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/55 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-[#DEDEDE] bg-[#EDEDED] p-6 shadow-2xl text-[#262626] flex flex-col max-h-[85vh]">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="absolute left-3.5 text-[#56BE51]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask BizContext Second Brain (e.g. 'What are B3 approval rules?')"
            className="w-full rounded-2xl border border-[#BEBEBE] bg-white pl-11 pr-28 py-3 text-sm text-[#262626] placeholder-[#9E9E9E] focus:border-[#75A0C9] focus:outline-none focus:ring-2 focus:ring-[#75A0C9]/20 shadow-xs"
            autoFocus
          />
          <div className="absolute right-3 flex items-center space-x-1.5">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold text-[#262626] transition shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  Ask <CornerDownLeft className="w-3 h-3 ml-1" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-[#BEBEBE] text-[#666666] hover:text-[#262626] flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Prompt Suggestions */}
        {!result && !isLoading && (
          <div className="mt-5 pt-4 border-t border-[#D6D6D6]">
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-2.5">
              Recommended Inquiries
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(p);
                  }}
                  className="text-xs px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-[#262626] border border-[#BEBEBE] hover:border-[#74D96F] transition text-left flex items-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#56BE51]" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#74D96F]" />
            <p className="text-xs text-[#666666] font-medium animate-pulse">
              Synthesizing response across pgvector memory, documents, and meetings...
            </p>
          </div>
        )}

        {/* Results Container */}
        {result && !isLoading && (
          <div className="mt-4 overflow-y-auto space-y-4 pr-1">
            <div className="rounded-2xl border border-[#DEDEDE] bg-white p-5 shadow-xs">
              <div className="flex items-center space-x-2 mb-2.5 text-[#1F541D] text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#56BE51]" />
                <span>Second Brain Verified Answer</span>
              </div>
              <div className="text-xs leading-relaxed text-[#262626] whitespace-pre-wrap font-medium">
                {result.answer}
              </div>
            </div>

            {/* Sources & Citations */}
            <div>
              <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-2">
                Referenced Grounding Sources
              </span>
              <div className="space-y-1.5">
                {result.sources.map((src, i) => (
                  <Link
                    key={i}
                    href={src.link}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EDEDED] bg-white hover:border-[#74D96F] hover:bg-[#F6FAF6] transition text-xs group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#56BE51]" />
                      <span className="font-bold text-[#262626] group-hover:text-[#1F541D]">{src.title}</span>
                      <span className="text-[10px] text-[#9E9E9E]">({src.category})</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#56BE51]">
                        {Math.round(src.matchConfidence * 100)}% match
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#BEBEBE] group-hover:text-[#74D96F]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Suggested Autonomous Actions */}
            {result.suggestedActions.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-2">
                  Suggested Context Actions
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F6FAF6] border border-[#BEBEBE] text-xs font-bold text-[#262626] transition shadow-2xs"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-[#56BE51]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
