"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { api } from "../../services/api";
import { Meeting } from "../../types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      const data = await api.getMeetings();
      setMeetings(data);
      if (data.length > 0) {
        setSelectedMeeting(data[0]);
      }
    }
    loadMeetings();
  }, []);

  const handleSelectMeeting = (m: Meeting) => {
    setSelectedMeeting(m);
  };

  const handleExtractActionItems = async () => {
    if (!selectedMeeting) return;
    setIsExtracting(true);
    try {
      const updated = await api.extractActionItems(selectedMeeting.id);
      setSelectedMeeting(updated);
      setMeetings(meetings.map((m) => (m.id === updated.id ? updated : m)));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConvertToTask = async (actionId: string) => {
    if (!selectedMeeting) return;
    setConvertingId(actionId);
    try {
      await api.convertActionItemToTask(selectedMeeting.id, actionId);
      // Reload meetings to reflect converted status
      const data = await api.getMeetings();
      setMeetings(data);
      const curr = data.find((m) => m.id === selectedMeeting.id);
      if (curr) setSelectedMeeting(curr);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col md:flex-row gap-6">
      {/* Left List of Meetings */}
      <div className="w-full md:w-80 flex flex-col shrink-0 rounded-3xl border border-[#BEBEBE]/40 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-[#74D96F]" />
            <span className="font-bold text-sm text-[#262626]">Meeting Hub & OCR</span>
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {meetings.map((m) => {
            const isSelected = selectedMeeting?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMeeting(m)}
                className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col space-y-1.5 border ${
                  isSelected
                    ? "bg-[#EDEDED]/90 border-[#74D96F] text-[#262626] shadow-xs"
                    : "bg-white border-[#EDEDED] hover:bg-[#EDEDED]/40 text-[#666666] hover:text-[#262626]"
                }`}
              >
                <div className="text-xs font-bold text-[#262626] line-clamp-1">{m.title}</div>
                <div className="flex items-center justify-between text-[10px] text-[#666666]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#74D96F]" />
                    <span>{m.meetingDate.slice(0, 10)}</span>
                  </span>
                  <span>{m.durationMinutes} mins</span>
                </div>
                <div className="text-[10px] text-[#262626] font-bold">
                  {m.extractedActionItems.length} action items
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Minutes & AI Action Items Extractor */}
      <div className="flex-1 flex flex-col rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-sm overflow-hidden">
        {selectedMeeting ? (
          <div className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EDEDED]">
              <div>
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block">
                  Project: {selectedMeeting.projectName || "General"}
                </span>
                <h1 className="text-xl font-extrabold text-[#262626] mt-0.5">{selectedMeeting.title}</h1>
                <div className="flex items-center space-x-3 text-xs text-[#666666] mt-1">
                  <span>{selectedMeeting.meetingDate}</span>
                  <span>•</span>
                  <span>{selectedMeeting.durationMinutes} minutes</span>
                </div>
              </div>

              {/* Extract AI Button */}
              <button
                onClick={handleExtractActionItems}
                disabled={isExtracting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing Transcript...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Action Item Extractor</span>
                  </>
                )}
              </button>
            </div>

            {/* Participants */}
            <div className="flex items-center space-x-2 text-xs text-[#666666]">
              <Users className="w-4 h-4 text-[#74D96F] shrink-0" />
              <span className="font-bold text-[#262626]">Attendees:</span>
              <span className="text-[#262626]">{selectedMeeting.participantNames.join(", ")}</span>
            </div>

            {/* AI Executive Summary Card */}
            {selectedMeeting.aiSummary && (
              <div className="rounded-2xl border border-[#74D96F]/40 bg-[#74D96F]/10 p-4 space-y-1.5 shadow-xs">
                <div className="flex items-center space-x-2 text-[#1F541D] text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-[#1F541D]" />
                  <span>AI Executive Summary</span>
                </div>
                <p className="text-xs text-[#262626] leading-relaxed">
                  {selectedMeeting.aiSummary}
                </p>
              </div>
            )}

            {/* Extracted Action Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
                    Extracted Action Items ({selectedMeeting.extractedActionItems.length})
                  </h3>
                  <p className="text-[11px] text-[#666666]">
                    Automatically identified from discussion; convert to Kanban tasks with one click.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {selectedMeeting.extractedActionItems.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#BEBEBE] transition shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            act.priority === "urgent"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : act.priority === "high"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-[#EDEDED] text-[#262626]"
                          }`}
                        >
                          {act.priority}
                        </span>
                        <h4 className="text-xs font-bold text-[#262626]">{act.title}</h4>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-[#666666]">
                        <span>Assignee: <strong className="text-[#262626] font-semibold">{act.assignee}</strong></span>
                        <span>Due: <strong className="text-[#262626] font-semibold">{act.dueDate}</strong></span>
                      </div>
                    </div>

                    {/* Convert Button */}
                    <div className="shrink-0">
                      {act.convertedToTask ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-[#1F541D] font-bold px-3 py-1.5 rounded-full bg-[#74D96F]/20 border border-[#74D96F]/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Synced to Kanban</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvertToTask(act.id)}
                          disabled={convertingId === act.id}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold transition shadow-xs disabled:opacity-50"
                        >
                          {convertingId === act.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>Convert to Task</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Minutes Transcript */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
                Full Notes / OCR Transcript
              </h3>
              <div className="p-4 rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] text-xs text-[#262626] leading-relaxed font-mono whitespace-pre-wrap">
                {selectedMeeting.minutesContent}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#666666]">
            <Video className="w-10 h-10 mb-2 opacity-40 text-[#74D96F]" />
            <p className="text-xs">Select a meeting to view minutes and action items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
