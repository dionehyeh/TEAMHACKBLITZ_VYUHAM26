"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, UserPlus, Loader2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";
import { EmployeeProfile, Department } from "../../types";

const fieldClass =
  "w-full rounded-2xl border border-[#BEBEBE] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#74D96F] focus:ring-2 focus:ring-[#74D96F]/20 transition";

function Avatar({ emp, size = "w-11 h-11" }: { emp: EmployeeProfile; size?: string }) {
  const initials = `${emp.firstName[0] ?? ""}${emp.lastName[0] ?? ""}`.toUpperCase() || "?";
  return (
    <div
      aria-hidden
      className={`${size} rounded-2xl bg-[#74D96F]/20 text-[#1F541D] font-bold text-sm flex items-center justify-center border border-[#74D96F]/30 shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    designation: "",
    departmentId: "",
  });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [emps, depts] = await Promise.all([api.getEmployees(), api.getDepartments()]);
      setEmployees(emps);
      setDepartments(depts);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load people");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = () => {
    const user = api.getSession()?.user;
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      workEmail: user?.email ?? "",
      designation: "",
      departmentId: "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const created = await api.addEmployee({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        workEmail: form.workEmail.trim(),
      });
      setEmployees((prev) => [created, ...prev]);
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesSearch =
        !q ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.workEmail.toLowerCase().includes(q) ||
        emp.skills.some((s) => s.name.toLowerCase().includes(q));
      const matchesDept = selectedDept === "all" || emp.departmentId === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#262626] flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#56BE51]" />
            <span>People</span>
          </h1>
          <p className="text-sm text-[#666666] mt-0.5">Everyone in your organisation, with their role and skills.</p>
        </div>
        <button
          onClick={openForm}
          className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add profile</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Search people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email or skill"
            className="w-full rounded-full border border-[#BEBEBE]/60 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-[#999999] focus:outline-none focus:border-[#74D96F]"
          />
        </div>
        <select
          aria-label="Filter by department"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-full border border-[#BEBEBE]/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#74D96F]"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-white border border-[#EDEDED] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 && !loadError ? (
        <div className="rounded-3xl border border-dashed border-[#BEBEBE] bg-white p-10 text-center space-y-2">
          <p className="text-sm font-bold text-[#262626]">
            {employees.length === 0 ? "No profiles yet" : "No one matches your search"}
          </p>
          <p className="text-xs text-[#666666]">
            {employees.length === 0
              ? "Add your profile to get your organisation's directory started."
              : "Try a different name, skill, or department."}
          </p>
          {employees.length === 0 && (
            <button onClick={openForm} className="mt-2 px-4 py-2 rounded-full bg-[#74D96F] text-xs font-bold cursor-pointer">
              Add profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="text-left rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 hover:border-[#74D96F] hover:shadow-md transition space-y-3 cursor-pointer"
            >
              <div className="flex items-start space-x-3.5">
                <Avatar emp={emp} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-[#262626] truncate">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="text-xs text-[#666666] truncate">{emp.designation || "No title set"}</p>
                  <p className="text-[11px] text-[#9E9E9E] truncate">{emp.departmentName || "No department"}</p>
                </div>
              </div>
              {emp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#EDEDED]">
                  {emp.skills.slice(0, 3).map((s) => (
                    <span key={s.name} className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] font-medium">
                      {s.name}
                    </span>
                  ))}
                  {emp.skills.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 text-[#666666]">+{emp.skills.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setSelectedEmployee(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-[#262626] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar emp={selectedEmployee} size="w-14 h-14" />
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs text-[#666666]">{selectedEmployee.designation || "No title set"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                aria-label="Close"
                className="p-1.5 rounded-full text-[#666666] hover:bg-[#EDEDED] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-[#9E9E9E]">Email</dt>
                <dd className="font-medium break-all">{selectedEmployee.workEmail}</dd>
              </div>
              <div>
                <dt className="text-[#9E9E9E]">Department</dt>
                <dd className="font-medium">{selectedEmployee.departmentName || "–"}</dd>
              </div>
              <div>
                <dt className="text-[#9E9E9E]">Status</dt>
                <dd className="font-medium capitalize">{selectedEmployee.employmentStatus}</dd>
              </div>
            </dl>

            <div>
              <div className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2">Skills</div>
              {selectedEmployee.skills.length === 0 ? (
                <p className="text-xs text-[#666666]">No skills recorded yet.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-2">
                  {selectedEmployee.skills.map((sk) => (
                    <li key={sk.name} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED] text-xs">
                      <span className="flex items-center space-x-1.5 font-semibold">
                        {sk.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#56BE51]" />}
                        <span>{sk.name}</span>
                      </span>
                      <span className="text-[10px] text-[#666666] capitalize">{sk.proficiency}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onMouseDown={(e) => e.target === e.currentTarget && !isSaving && setIsFormOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add profile"
        >
          <form onSubmit={handleSave} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Add your profile</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full text-[#666666] hover:bg-[#EDEDED] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div role="alert" className="flex items-start space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold space-y-1">
                <span>First name</span>
                <input required className={fieldClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </label>
              <label className="text-xs font-semibold space-y-1">
                <span>Last name</span>
                <input className={fieldClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </label>
            </div>
            <label className="block text-xs font-semibold space-y-1">
              <span>Work email</span>
              <input required type="email" className={fieldClass} value={form.workEmail} onChange={(e) => setForm({ ...form, workEmail: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold space-y-1">
              <span>Job title</span>
              <input className={fieldClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold space-y-1">
              <span>Department</span>
              <select className={fieldClass} value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs font-bold disabled:opacity-60 flex items-center space-x-1.5 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? "Saving..." : "Save profile"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
