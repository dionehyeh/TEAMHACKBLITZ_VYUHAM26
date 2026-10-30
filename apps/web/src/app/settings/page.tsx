"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, ApiStatus } from "../../services/api";
import { Organisation, Department } from "../../types";

export default function SettingsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isLive: false,
    endpoint: api.getBaseUrl(),
    lastChecked: "",
  });
  const [urlInput, setUrlInput] = useState(api.getBaseUrl());
  const [isChecking, setIsChecking] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [orgs, depts] = await Promise.all([
        api.getOrganisations(),
        api.getDepartments(),
      ]);
      setOrganisations(orgs);
      setDepartments(depts);
    }
    load();

    const unsub = api.subscribeStatus((st) => {
      setApiStatus(st);
      setUrlInput(st.endpoint);
    });
    return () => unsub();
  }, []);

  const handleTestConnection = async () => {
    setIsChecking(true);
    setPingResult(null);
    api.setBaseUrl(urlInput);
    const isLive = await api.checkApiHealth();
    setIsChecking(false);
    if (isLive) {
      setPingResult("Connected successfully to Hono API backend!");
    } else {
      setPingResult("Backend offline. Fallback seed mode active.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#EDEDED]">
        <h1 className="text-xl md:text-2xl font-bold text-[#262626] flex items-center space-x-2">
          <Settings className="w-6 h-6 text-[#74D96F]" />
          <span>Organisation & API Settings</span>
        </h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Configure multi-tenancy hierarchy, department boundaries, and monorepo backend API endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Backend Gateway Settings */}
        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#EDEDED]">
            <Server className="w-4 h-4 text-[#74D96F]" />
            <h2 className="text-sm font-bold text-[#262626]">Hono API Gateway Connection</h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666666]">Connection State</span>
              <span
                className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-bold ${
                  apiStatus.isLive
                    ? "bg-[#74D96F]/20 text-[#1F541D] border border-[#74D96F]/40"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {apiStatus.isLive ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 mr-1 text-[#1F541D] animate-pulse" />
                    Live API Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Demo / Mock Fallback Active
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              {apiStatus.isLive
                ? "The frontend is receiving live responses from the Hono API server."
                : "The frontend is functioning in standalone evaluation mode with full localStorage mutations while the other developer builds the backend."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#262626]">
              Backend REST API Endpoint URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:3001/api/v1"
                className="flex-1 rounded-full border border-[#BEBEBE]/60 bg-[#F8F9FA] px-4 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white font-mono"
              />
              <button
                onClick={handleTestConnection}
                disabled={isChecking}
                className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isChecking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Test Ping</span>
              </button>
            </div>
            <p className="text-[11px] text-[#666666] font-mono">
              Configured target: {apiStatus.endpoint}
            </p>
          </div>

          {pingResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                pingResult.includes("Connected")
                  ? "bg-[#74D96F]/15 border border-[#74D96F]/40 text-[#1F541D] font-medium"
                  : "bg-amber-50 border border-amber-200 text-amber-900 font-medium"
              }`}
            >
              {pingResult.includes("Connected") ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F541D]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              )}
              <span>{pingResult}</span>
            </div>
          )}
        </div>

        {/* Organisation Hierarchy */}
        <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#EDEDED]">
            <Building2 className="w-4 h-4 text-[#74D96F]" />
            <h2 className="text-sm font-bold text-[#262626]">Organisation Hierarchy & Isolation</h2>
          </div>

          <div className="space-y-3">
            {organisations.map((org) => (
              <div
                key={org.id}
                className="p-4 rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-[#262626]">{org.name}</span>
                    {org.parentId ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] font-semibold border border-[#BEBEBE]/40">
                        Subsidiary
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#74D96F]/20 text-[#1F541D] font-bold border border-[#74D96F]/40">
                        Parent Org
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#666666] font-mono">slug: {org.slug}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#666666] pt-1.5 border-t border-[#EDEDED]">
                  <span>{org.departmentsCount} Departments</span>
                  <span>{org.membersCount} Active Members</span>
                </div>
              </div>
            ))}
          </div>

          {/* Departments List */}
          <div className="pt-2">
            <span className="text-xs font-bold text-[#262626] uppercase tracking-wider block mb-2">
              Configured Departments
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] flex items-center justify-between"
                >
                  <span className="font-bold text-[#262626]">{d.name}</span>
                  <span className="text-[10px] text-[#666666] font-medium">{d.memberCount} members</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
