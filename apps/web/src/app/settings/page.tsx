"use client";

import React, { useState, useEffect } from "react";
import { Settings, Building2, Server, RefreshCw, CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react";
import { api, ApiStatus } from "../../services/api";
import { Organisation, Department } from "../../types";

const fieldClass =
  "flex-1 min-w-0 rounded-full border border-[#BEBEBE]/60 bg-[#F8F9FA] px-4 py-2 text-xs focus:outline-none focus:border-[#74D96F] focus:bg-white";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function SettingsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [apiStatus, setApiStatus] = useState<ApiStatus>({ isLive: false, endpoint: api.getBaseUrl(), lastChecked: "" });
  const [urlInput, setUrlInput] = useState(api.getBaseUrl());
  const [isChecking, setIsChecking] = useState(false);
  const [pingOk, setPingOk] = useState<boolean | null>(null);

  const [orgName, setOrgName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [saving, setSaving] = useState<"org" | "dept" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const orgs = await api.getOrganisations();
      setOrganisations(orgs);
      setDepartments(await api.getDepartments().catch(() => []));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    return api.subscribeStatus((st) => {
      setApiStatus(st);
      setUrlInput(st.endpoint);
    });
  }, []);

  const handleTestConnection = async () => {
    setIsChecking(true);
    setPingOk(null);
    api.setBaseUrl(urlInput.trim());
    setPingOk(await api.checkApiHealth());
    setIsChecking(false);
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("org");
    setActionError(null);
    try {
      const org = await api.createOrganisation(orgName.trim(), slugify(orgName));
      setOrganisations((prev) => [org, ...prev]);
      setOrgName("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not create organisation");
    } finally {
      setSaving(null);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("dept");
    setActionError(null);
    try {
      const dept = await api.createDepartment(deptName.trim());
      setDepartments((prev) => [...prev, dept].sort((a, b) => a.name.localeCompare(b.name)));
      setDeptName("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not create department");
    } finally {
      setSaving(null);
    }
  };

  const hasOrg = organisations.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#262626] flex items-center space-x-2">
          <Settings className="w-6 h-6 text-[#56BE51]" />
          <span>Settings</span>
        </h1>
        <p className="text-sm text-[#666666] mt-0.5">Your organisation, departments and server connection.</p>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <span className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </span>
          <button onClick={load} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}
      {actionError && (
        <div role="alert" className="flex items-center space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#56BE51]" />
            <h2 className="text-sm font-bold">Organisation</h2>
          </div>

          {isLoading ? (
            <div className="h-16 rounded-2xl bg-[#F8F9FA] animate-pulse" aria-busy="true" />
          ) : hasOrg ? (
            <ul className="space-y-2">
              {organisations.map((org) => (
                <li key={org.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-[#EDEDED] bg-[#F8F9FA]">
                  <span className="font-bold text-sm">{org.name}</span>
                  <span className="text-xs text-[#666666] font-mono">{org.slug}</span>
                </li>
              ))}
            </ul>
          ) : (
            <form onSubmit={handleCreateOrg} className="space-y-2">
              <p className="text-xs text-[#666666]">You don't belong to an organisation yet. Create one to get started.</p>
              <div className="flex space-x-2">
                <input
                  required
                  minLength={2}
                  aria-label="Organisation name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Organisation name"
                  className={fieldClass}
                />
                <button
                  disabled={saving === "org" || slugify(orgName).length < 2}
                  className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  {saving === "org" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-[#EDEDED] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">Departments</h3>
            {!isLoading && departments.length === 0 && (
              <p className="text-xs text-[#666666]">
                {hasOrg ? "No departments yet." : "Create an organisation before adding departments."}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {departments.map((d) => (
                <span key={d.id} className="text-xs px-3 py-1.5 rounded-full bg-[#EDEDED] font-semibold">
                  {d.name}
                </span>
              ))}
            </div>
            {hasOrg && (
              <form onSubmit={handleCreateDept} className="flex space-x-2">
                <input
                  required
                  aria-label="New department name"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="New department"
                  className={fieldClass}
                />
                <button
                  disabled={saving === "dept" || !deptName.trim()}
                  className="px-4 py-2 rounded-full bg-[#262626] hover:bg-black text-white text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  {saving === "dept" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add</span>
                </button>
              </form>
            )}
            {hasOrg && <p className="text-[11px] text-[#9E9E9E]">Only organisation admins and owners can add departments.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 space-y-4 self-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#56BE51]" />
              <h2 className="text-sm font-bold">API connection</h2>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                apiStatus.isLive ? "bg-[#74D96F]/20 text-[#1F541D]" : "bg-amber-100 text-amber-900"
              }`}
            >
              {apiStatus.isLive ? "Connected" : "Offline"}
            </span>
          </div>

          <label className="block text-xs font-semibold space-y-1.5">
            <span>API base URL</span>
            <div className="flex space-x-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:3001/api/v1"
                className={`${fieldClass} font-mono`}
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isChecking}
                className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                <span>Test</span>
              </button>
            </div>
          </label>

          {pingOk !== null && (
            <div
              role="status"
              className={`p-3 rounded-2xl text-xs flex items-center space-x-2 ${
                pingOk ? "bg-[#74D96F]/15 text-[#1F541D]" : "bg-rose-50 text-rose-700"
              }`}
            >
              {pingOk ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{pingOk ? "Connected to the API." : "Couldn't reach the API at that address."}</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
