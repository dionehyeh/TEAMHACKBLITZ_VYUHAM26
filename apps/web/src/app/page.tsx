"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  FolderKanban,
  Ticket as TicketIcon,
  Globe,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { api } from "../services/api";
import { Project, Ticket, BrowserJob, KnowledgePage, AuditLogItem } from "../types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [browserJobs, setBrowserJobs] = useState<BrowserJob[]>([]);
  const [knowledgePages, setKnowledgePages] = useState<KnowledgePage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const [proj, tick, bjobs, pages, logs] = await Promise.all([
        api.getProjects(),
        api.getTickets(),
        api.getBrowserJobs(),
        api.getKnowledgePages(),
        api.getAuditLogs(),
      ]);
      setProjects(proj);
      setTickets(tick);
      setBrowserJobs(bjobs);
      setKnowledgePages(pages);
      setAuditLogs(logs);
    }
    loadData();
  }, []);

  const pendingApprovals = browserJobs.filter((j) => j.status === "awaiting_approval");
  const urgentTickets = tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome - Minto Tactile Container */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#EDEDED] border border-[#DEDEDE] p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#74D96F]/20 text-[#1F541D] text-xs font-bold border border-[#56BE51]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#56BE51]" />
            <span>ORGANISATIONAL ZERO-FRICTION OS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#262626] tracking-tight leading-tight">
            Welcome to <span className="text-[#1F541D] underline decoration-[#74D96F] decoration-wavy decoration-2">BizContext</span>
          </h1>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-2xl font-normal">
            Your unified Business Second Brain. Seamlessly connecting organizational memory, Kanban workflows, internal tickets, and autonomous browser-capable AI agents with permissioned human control.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/knowledge"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs hover:shadow-md transition active:translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-[#262626]" />
              <span>Explore Knowledge Base</span>
            </Link>
            <Link
              href="/browser-jobs"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#262626] text-xs font-bold border border-[#BEBEBE] shadow-2xs transition active:translate-y-0.5"
            >
              <Globe className="w-4 h-4 text-[#75A0C9]" />
              <span>Browser Automation Hub</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#262626] text-xs font-bold border border-[#BEBEBE] shadow-2xs transition active:translate-y-0.5"
            >
              <FolderKanban className="w-4 h-4 text-[#56BE51]" />
              <span>Kanban Tasks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Human-In-The-Loop Approval Banner Alert */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl border border-[#F09363]/40 bg-[#F09363]/15 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#F09363]/25 text-[#843209] shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-[#843209] text-sm">
                  Human-in-the-Loop Approval Required (B3 Level)
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F09363]/25 text-[#843209] font-bold border border-[#F09363]/40">
                  {pendingApprovals.length} Action Pending
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-1 font-medium">
                Autonomous agent <span className="font-bold text-[#262626]">{pendingApprovals[0].agentName}</span> is paused at a high-risk step: <span className="text-[#843209] font-mono">&ldquo;{pendingApprovals[0].approvalRequest?.actionDescription}&rdquo;</span>.
              </p>
            </div>
          </div>
          <Link
            href="/browser-jobs"
            className="shrink-0 px-5 py-2 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <span>Review & Approve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Grid - Minto Crisp White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-[#EDEDED] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Active Projects</span>
            <div className="p-2 rounded-xl bg-[#EDEDED] text-[#262626]">
              <FolderKanban className="w-4 h-4 text-[#56BE51]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">{projects.length}</span>
            <span className="text-xs font-bold text-[#56BE51]">88% completion</span>
          </div>
          <div className="mt-3 w-full bg-[#EDEDED] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#74D96F] h-full rounded-full" style={{ width: "88%" }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-[#EDEDED] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">SLA Target Health</span>
            <div className="p-2 rounded-xl bg-[#EDEDED] text-[#262626]">
              <Clock className="w-4 h-4 text-[#ED6B2D]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">98.4%</span>
            <span className="text-xs font-bold text-[#56BE51]">0 breaches</span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666] font-medium">
            {urgentTickets.length} urgent ticket actively in-flight
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-[#EDEDED] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Browser Automations</span>
            <div className="p-2 rounded-xl bg-[#EDEDED] text-[#262626]">
              <Globe className="w-4 h-4 text-[#75A0C9]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">{browserJobs.length}</span>
            <span className="text-xs font-bold text-[#75A0C9]">B0 - B4 Sandbox</span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666] font-medium">
            1 pending human verification
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-[#EDEDED] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">Corpus Memory</span>
            <div className="p-2 rounded-xl bg-[#EDEDED] text-[#262626]">
              <Brain className="w-4 h-4 text-[#56BE51]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">{knowledgePages.length}</span>
            <span className="text-xs font-bold text-[#56BE51]">Indexed Docs</span>
          </div>
          <div className="mt-3 text-[11px] text-[#666666] font-medium">
            pgvector HNSW + BM25 Hybrid
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Urgent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects & Sprint Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[#EDEDED] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EDEDED]">
              <div>
                <h2 className="text-base font-extrabold text-[#262626]">Active Operational Projects</h2>
                <p className="text-xs text-[#666666]">Tracked organizational initiatives and milestone delivery</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#1F541D] hover:text-[#56BE51] flex items-center space-x-1"
              >
                <span>View Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-4 hover:border-[#BEBEBE] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-[#262626]">{proj.name}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] font-semibold">
                          {proj.departmentName}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666] mt-1 line-clamp-1">{proj.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-extrabold text-[#262626]">{proj.progressPercent}%</span>
                      <div className="text-[10px] text-[#9E9E9E] font-medium">Due {proj.dueDate}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#666666]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-medium">Owner:</span>
                      <span className="font-bold text-[#262626]">{proj.ownerName}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#56BE51]" />
                      <span className="font-medium">{proj.tasksCount.done} / {proj.tasksCount.total} tasks done</span>
                    </div>
                  </div>

                  <div className="mt-2 w-full bg-[#EDEDED] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#74D96F] h-full rounded-full transition-all"
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Quick Access */}
          <div className="rounded-3xl border border-[#EDEDED] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EDEDED]">
              <div>
                <h2 className="text-base font-extrabold text-[#262626]">Featured Knowledge & Architecture</h2>
                <p className="text-xs text-[#666666]">Key documents synced to the organizational memory layer</p>
              </div>
              <Link
                href="/knowledge"
                className="text-xs font-bold text-[#1F541D] hover:text-[#56BE51] flex items-center space-x-1"
              >
                <span>All Documents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {knowledgePages.slice(0, 2).map((page) => (
                <Link
                  key={page.id}
                  href={`/knowledge?page=${page.id}`}
                  className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-4 hover:border-[#74D96F] hover:bg-white transition group shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-[#56BE51] text-xs mb-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#666666]">
                      {page.visibility}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#262626] group-hover:text-[#1F541D] transition line-clamp-1">
                    {page.title}
                  </h3>
                  <p className="text-[11px] text-[#666666] mt-1 line-clamp-2">{page.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Activity Log & Urgent Tickets */}
        <div className="space-y-6">
          {/* Urgent Tickets Card */}
          <div className="rounded-3xl border border-[#EDEDED] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EDEDED]">
              <div className="flex items-center space-x-2">
                <TicketIcon className="w-4 h-4 text-[#ED6B2D]" />
                <h2 className="text-base font-extrabold text-[#262626]">Tickets & SLA Watch</h2>
              </div>
              <Link href="/tickets" className="text-xs font-bold text-[#1F541D] hover:text-[#56BE51]">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {tickets.slice(0, 3).map((tick) => (
                <div
                  key={tick.id}
                  className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-3.5 space-y-2 hover:border-[#BEBEBE] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#262626]">
                      {tick.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        tick.priority === "urgent"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : tick.priority === "high"
                          ? "bg-[#F09363]/20 text-[#843209] border border-[#F09363]/40"
                          : "bg-[#EDEDED] text-[#262626]"
                      }`}
                    >
                      {tick.priority}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#262626] line-clamp-2">
                    {tick.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#666666] pt-1.5 border-t border-[#EDEDED]">
                    <span>Assignee: <strong className="text-[#262626]">{tick.assigneeName}</strong></span>
                    <span className="text-[#ED6B2D] font-bold">{tick.slaTarget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail & Live Activity */}
          <div className="rounded-3xl border border-[#EDEDED] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EDEDED]">
              <h2 className="text-base font-extrabold text-[#262626]">Operational Audit Trail</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] font-mono font-bold">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-start space-x-2.5 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      log.actorType === "agent" ? "bg-[#75A0C9] animate-pulse" : "bg-[#74D96F]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#262626] font-bold line-clamp-1">{log.action}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#666666] mt-0.5 font-medium">
                      <span className="truncate">{log.actorName}</span>
                      <span className="shrink-0 font-mono">{log.timestamp.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
