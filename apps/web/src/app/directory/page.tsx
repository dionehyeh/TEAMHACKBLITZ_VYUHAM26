"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { api } from "../../services/api";
import { EmployeeProfile } from "../../types";

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

  // CV Parsing Modal state
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const cvFileName = "rohit_krishnan_cv.pdf";
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    name: string;
    email: string;
    skills: string[];
    experienceYears: number;
    education: string;
    summary: string;
  } | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      const data = await api.getEmployees();
      setEmployees(data);
    }
    fetchEmployees();
  }, []);

  const handleSimulateCvUpload = async () => {
    setIsParsing(true);
    try {
      const result = await api.parseCV(cvFileName);
      setParsedData(result);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApproveOnboard = async () => {
    if (!parsedData) return;
    const [firstName, ...rest] = parsedData.name.split(" ");
    const newEmp = await api.addEmployee({
      firstName: firstName || "Rohit",
      lastName: rest.join(" ") || "Krishnan",
      workEmail: parsedData.email,
      designation: "Systems & Automation Engineer",
      departmentName: "AI Engineering & Research",
      bio: parsedData.summary,
      skills: parsedData.skills.map((s) => ({
        name: s,
        proficiency: "expert",
        verified: true,
      })),
      education: [parsedData.education],
    });

    setEmployees([newEmp, ...employees]);
    setIsCvModalOpen(false);
    setParsedData(null);
    setSelectedEmployee(newEmp);
  };

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "all" || emp.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EDEDED]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#262626] flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#74D96F]" />
            <span>People Intelligence & Employee Directory</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Verified skills inventory, organizational reporting context, and AI CV extraction.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCvModalOpen(true);
            setParsedData(null);
          }}
          className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Parse CV (AI)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or verified skill (e.g. 'pgvector', 'Playwright', 'DevOps')..."
            className="w-full rounded-full border border-[#BEBEBE]/60 bg-white pl-10 pr-4 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] shadow-xs"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-full border border-[#BEBEBE]/60 bg-white px-4 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] shadow-xs"
        >
          <option value="all">All Departments</option>
          <option value="AI Engineering & Research">AI Engineering & Research</option>
          <option value="Infrastructure & Security">Infrastructure & Security</option>
          <option value="Product & Design">Product & Design</option>
          <option value="Enterprise Solutions">Enterprise Solutions</option>
        </select>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className="cursor-pointer rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 hover:border-[#74D96F] hover:shadow-md transition space-y-3 group shadow-xs"
          >
            <div className="flex items-start space-x-3.5">
              <img
                src={emp.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={emp.firstName}
                className="w-12 h-12 rounded-2xl object-cover border border-[#BEBEBE]/40 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-[#262626] group-hover:text-black transition truncate">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  {emp.extractedFromCv && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#74D96F]/20 text-[#1F541D] font-bold border border-[#74D96F]/40">
                      CV VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#666666] truncate">{emp.designation}</p>
                <p className="text-[11px] text-[#666666] truncate">{emp.departmentName}</p>
              </div>
            </div>

            {emp.bio && (
              <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                {emp.bio}
              </p>
            )}

            {/* Skills Badges */}
            <div className="pt-2 border-t border-[#EDEDED]">
              <div className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-1.5">
                Verified Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {emp.skills.slice(0, 3).map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] border border-[#BEBEBE]/40 text-[#262626] font-medium"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#74D96F]" />
                    <span>{s.name}</span>
                  </span>
                ))}
                {emp.skills.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDEDED] text-[#666666] font-medium">
                    +{emp.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Detail Drawer / Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-2xl text-[#262626] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#EDEDED]">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedEmployee.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={selectedEmployee.firstName}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#BEBEBE]/40 shadow-xs"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#262626]">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs text-[#262626] font-bold">{selectedEmployee.designation}</p>
                  <p className="text-xs text-[#666666]">{selectedEmployee.departmentName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-[#666666] hover:text-[#262626] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#666666] uppercase tracking-wider block mb-1">
                  Professional Bio
                </span>
                <p className="text-[#262626] leading-relaxed bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#EDEDED]">
                  {selectedEmployee.bio || "No biography provided."}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#666666] uppercase tracking-wider block mb-1.5">
                  Verified Skills Matrix
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedEmployee.skills.map((sk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#EDEDED]"
                    >
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#74D96F]" />
                        <span className="text-[#262626] font-semibold">{sk.name}</span>
                      </div>
                      <span className="text-[10px] text-[#666666] capitalize font-medium">{sk.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEmployee.currentProjects && (
                <div>
                  <span className="font-bold text-[#666666] uppercase tracking-wider block mb-1">
                    Current Assigned Projects
                  </span>
                  <div className="space-y-1">
                    {selectedEmployee.currentProjects.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EDEDED] text-[#262626] font-medium">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#262626] text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CV AI Parsing & Onboarding Studio */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-2xl text-[#262626] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#74D96F]" />
                <h3 className="font-bold text-sm text-[#262626]">AI CV Extraction & Onboarding</h3>
              </div>
              <button
                onClick={() => setIsCvModalOpen(false)}
                className="text-[#666666] hover:text-[#262626]"
              >
                ✕
              </button>
            </div>

            {!parsedData ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#BEBEBE] rounded-3xl p-6 text-center space-y-2 bg-[#F8F9FA]">
                  <UploadCloud className="w-10 h-10 text-[#74D96F] mx-auto" />
                  <div className="text-xs font-bold text-[#262626]">
                    Upload Candidate CV Document
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Supports PDF, DOCX, and TXT. Multi-modal AI parser extracts objective verified skills without subjective bias.
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/40 inline-block">
                      {cvFileName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateCvUpload}
                  disabled={isParsing}
                  className="w-full py-2.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing CV and extracting skills...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Parser & Verify Candidate</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="rounded-2xl border border-[#74D96F]/40 bg-[#74D96F]/10 p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-[#1F541D] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Information Extracted</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#262626]">
                    <div>
                      <span className="text-[10px] text-[#666666] block">Candidate Name</span>
                      <strong className="text-[#262626]">{parsedData.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block">Email</span>
                      <span className="text-[#262626]">{parsedData.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block">Experience</span>
                      <span className="text-[#262626]">{parsedData.experienceYears} Years</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block">Education</span>
                      <span className="text-[#262626]">{parsedData.education}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#666666] block mb-1">Extracted Technical Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/40 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-[#EDEDED]">
                  <button
                    onClick={() => setParsedData(null)}
                    className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-xs text-[#262626] font-semibold transition"
                  >
                    Re-upload
                  </button>
                  <button
                    onClick={handleApproveOnboard}
                    className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs text-[#262626] font-bold shadow-sm transition"
                  >
                    Confirm & Onboard to Directory
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
