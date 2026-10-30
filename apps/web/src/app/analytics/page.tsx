"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  ShieldCheck,
  Bot,
  Activity,
} from "lucide-react";
import { api } from "../../services/api";
import { AuditLogItem } from "../../types";

export default function AnalyticsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    async function load() {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#EDEDED]">
        <h1 className="text-xl md:text-2xl font-bold text-[#262626] flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-[#74D96F]" />
          <span>Operational Intelligence & SLA Analytics</span>
        </h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Real-time metrics, SLA target compliance, agent reliability, and audit logging.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">SLA Compliance</span>
            <div className="p-2 rounded-xl bg-[#74D96F]/15 text-[#1F541D]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">98.4%</span>
            <span className="text-xs font-bold text-[#1F541D]">+1.2% this sprint</span>
          </div>
          <p className="text-[11px] text-[#666666] mt-2">Zero unacknowledged high-severity breaches</p>
        </div>

        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">Avg Time to Resolve</span>
            <div className="p-2 rounded-xl bg-[#74D96F]/15 text-[#1F541D]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">1.4 hrs</span>
            <span className="text-xs font-bold text-[#262626]">Target &lt; 4.0 hrs</span>
          </div>
          <p className="text-[11px] text-[#666666] mt-2">Measured across IT and Infrastructure tickets</p>
        </div>

        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">Agent Success Rate</span>
            <div className="p-2 rounded-xl bg-[#74D96F]/15 text-[#1F541D]">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">97.6%</span>
            <span className="text-xs font-bold text-[#1F541D]">636 total runs</span>
          </div>
          <p className="text-[11px] text-[#666666] mt-2">Autonomous Playwright execution reliability</p>
        </div>

        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">Retrieval Latency</span>
            <div className="p-2 rounded-xl bg-[#74D96F]/15 text-[#1F541D]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#262626]">114 ms</span>
            <span className="text-xs font-bold text-[#262626]">HNSW Index</span>
          </div>
          <p className="text-[11px] text-[#666666] mt-2">Hybrid dense vector + BM25 ranking</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#262626]">Cryptographic Audit Trail</h2>
            <p className="text-xs text-[#666666]">Immutable ledger of employee actions, agent executions, and approvals</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EDEDED] border border-[#BEBEBE]/40 text-[#262626] font-medium">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#262626]">
            <thead>
              <tr className="border-b border-[#EDEDED] text-[#666666] font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Resource</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDED] font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#EDEDED]/40 transition">
                  <td className="py-3 px-3 text-[#666666]">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-[#262626]">{log.actorName}</td>
                  <td className="py-3 px-3">
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/40"
                    >
                      {log.actorType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#262626] font-sans font-medium">{log.action}</td>
                  <td className="py-3 px-3 text-[#666666] font-sans">{log.targetResource}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        log.status === "warning"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-[#74D96F]/20 text-[#1F541D] border border-[#74D96F]/40"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
