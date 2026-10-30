"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Building2,
  Network,
  ArrowRight,
  BookOpen,
  Loader2,
  AlertCircle,
  CornerDownLeft,
} from "lucide-react";
import { api } from "../../services/api";
import { Organisation } from "../../types";

interface Overview {
  organisations: Organisation[];
  employeeCount: number;
  departmentCount: number;
}

interface Answer {
  answer: string;
  sources: Array<{ title: string; category: string; snippet?: string; url?: string }>;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  useEffect(() => {
    const user = api.getSession()?.user;
    setFirstName(user?.firstName || user?.email.split("@")[0] || "");

    Promise.all([api.getOrganisations(), api.getEmployees(), api.getDepartments()])
      .then(([organisations, employees, departments]) =>
        setOverview({
          organisations,
          employeeCount: employees.length,
          departmentCount: departments.length,
        })
      )
      .catch((err) => setOverviewError(err instanceof Error ? err.message : "Failed to load overview"));
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = query.trim();
    if (!prompt || isAsking) return;
    setIsAsking(true);
    setAskError(null);
    try {
      setAnswer(await api.askSecondBrain(prompt));
    } catch (err) {
      setAnswer(null);
      setAskError(err instanceof Error ? err.message : "The AI engine did not respond.");
    } finally {
      setIsAsking(false);
    }
  };

  const stats = [
    {
      label: "Organisation",
      value: overview ? overview.organisations[0]?.name ?? "None yet" : "–",
      icon: Building2,
      href: "/settings",
    },
    { label: "People", value: overview?.employeeCount ?? "–", icon: Users, href: "/directory" },
    { label: "Departments", value: overview?.departmentCount ?? "–", icon: Network, href: "/settings" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#262626]">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-[#666666] mt-1">Ask your organisation's second brain, or jump back into your work.</p>
      </div>

      <section className="rounded-3xl bg-white border border-[#EDEDED] shadow-xs p-5 sm:p-6 space-y-4">
        <form onSubmit={handleAsk} className="relative">
          <Sparkles className="w-4 h-4 text-[#56BE51] absolute left-4 top-1/2 -translate-y-1/2" />
          <label htmlFor="ask" className="sr-only">
            Ask the second brain
          </label>
          <input
            id="ask"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your organisation..."
            className="w-full rounded-full border border-[#BEBEBE] bg-[#F8F9FA] pl-11 pr-24 py-3 text-sm focus:outline-none focus:border-[#74D96F] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={isAsking || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold text-[#262626] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAsking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                Ask <CornerDownLeft className="w-3 h-3 ml-1" />
              </>
            )}
          </button>
        </form>

        {askError && (
          <div role="alert" className="flex items-start space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{askError}</span>
          </div>
        )}

        {answer && (
          <div className="space-y-3">
            <div className="text-sm leading-relaxed text-[#262626] whitespace-pre-wrap">{answer.answer}</div>
            {answer.sources.length > 0 && (
              <div className="pt-3 border-t border-[#EDEDED]">
                <div className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2">Sources</div>
                <ul className="space-y-1.5">
                  {answer.sources.map((s, i) => (
                    <li key={i} className="flex items-center space-x-2 text-xs text-[#262626]">
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
      </section>

      {overviewError && (
        <div role="alert" className="flex items-start space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Couldn't load your overview: {overviewError}</span>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-3xl bg-white border border-[#EDEDED] p-5 hover:border-[#74D96F] transition shadow-xs"
          >
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-xs font-semibold">{label}</span>
              <Icon className="w-4 h-4 text-[#56BE51]" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-2xl font-extrabold text-[#262626] truncate">{value}</span>
              <ArrowRight className="w-4 h-4 text-[#BEBEBE] group-hover:text-[#56BE51] group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
