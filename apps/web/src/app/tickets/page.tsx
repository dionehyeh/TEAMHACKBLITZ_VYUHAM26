"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket as TicketIcon,
  Plus,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";
import { api } from "../../services/api";
import { Ticket } from "../../types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [commentText, setCommentText] = useState("");
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<Ticket["category"]>("infrastructure");
  const [newPriority, setNewPriority] = useState<Ticket["priority"]>("high");

  useEffect(() => {
    async function fetchTickets() {
      const data = await api.getTickets();
      setTickets(data);
      if (data.length > 0) {
        setSelectedTicket(data[0]);
      }
    }
    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCommentText("");
  };

  const handleStatusChange = async (ticketId: string, status: Ticket["status"]) => {
    const updated = await api.updateTicketStatus(ticketId, status);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;

    const updated = await api.addTicketComment(selectedTicket.id, commentText);
    setSelectedTicket(updated);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    setCommentText("");
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await api.createTicket({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
    });

    setTickets([created, ...tickets]);
    setSelectedTicket(created);
    setIsNewTicketModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col md:flex-row gap-6">
      {/* Left Column: Tickets Queue */}
      <div className="w-full md:w-96 flex flex-col shrink-0 rounded-3xl border border-[#BEBEBE]/40 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
          <div className="flex items-center space-x-2">
            <TicketIcon className="w-4 h-4 text-[#74D96F]" />
            <span className="font-bold text-sm text-[#262626]">Tickets & SLA Dispatch</span>
          </div>
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold transition shadow-xs flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              filterCategory === "all"
                ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
                : "bg-[#EDEDED] text-[#666666] hover:text-[#262626]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory("infrastructure")}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              filterCategory === "infrastructure"
                ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
                : "bg-[#EDEDED] text-[#666666] hover:text-[#262626]"
            }`}
          >
            Infra
          </button>
          <button
            onClick={() => setFilterCategory("access")}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              filterCategory === "access"
                ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
                : "bg-[#EDEDED] text-[#666666] hover:text-[#262626]"
            }`}
          >
            Access
          </button>
          <button
            onClick={() => setFilterCategory("design")}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              filterCategory === "design"
                ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
                : "bg-[#EDEDED] text-[#666666] hover:text-[#262626]"
            }`}
          >
            Design
          </button>
        </div>

        {/* Ticket List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredTickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTicket(t)}
                className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col space-y-2 border ${
                  isSelected
                    ? "bg-[#EDEDED]/90 border-[#74D96F] text-[#262626] shadow-sm"
                    : "bg-white border-[#EDEDED] hover:bg-[#EDEDED]/40 hover:border-[#BEBEBE] text-[#262626]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#262626]">{t.ticketNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-medium bg-[#EDEDED] text-[#666666] border border-[#BEBEBE]/40">
                      {t.category}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      t.priority === "urgent"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : t.priority === "high"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-[#EDEDED] text-[#666666] border border-[#BEBEBE]/50"
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="text-xs font-bold line-clamp-2 text-[#262626]">
                  {t.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#666666] pt-1.5 border-t border-[#EDEDED]">
                  <span className="capitalize font-medium">{t.status.replace("_", " ")}</span>
                  <span className="text-rose-600 font-semibold flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{t.slaTarget}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Ticket Inspection & Comment Trail */}
      <div className="flex-1 flex flex-col rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-sm overflow-hidden">
        {selectedTicket ? (
          <div className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-5">
            {/* Ticket Header & Status Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EDEDED]">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-base font-extrabold text-[#262626]">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      selectedTicket.priority === "urgent"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : selectedTicket.priority === "high"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/40"
                    }`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="text-xs text-[#666666]">Category: {selectedTicket.category}</span>
                </div>
                <h2 className="text-lg font-bold text-[#262626] mt-1">{selectedTicket.title}</h2>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2">
                {selectedTicket.status !== "resolved" ? (
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, "resolved")}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold transition shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, "in_progress")}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#262626] text-xs font-semibold border border-[#BEBEBE]/40 transition"
                  >
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            </div>

            {/* SLA Alert Box */}
            <div className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#666666] block mb-0.5">SLA Target</span>
                <span className="font-semibold text-rose-600 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedTicket.slaTarget}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#666666] block mb-0.5">Requester</span>
                <span className="font-medium text-[#262626]">{selectedTicket.requesterName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#666666] block mb-0.5">Current Assignee</span>
                <span className="font-medium text-[#262626]">{selectedTicket.assigneeName}</span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] p-4">
              <h4 className="text-xs font-bold text-[#262626] uppercase tracking-wider mb-2">
                Problem Description
              </h4>
              <p className="text-xs text-[#262626] leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Discussion & Resolution Trail */}
            <div className="flex-1 space-y-3">
              <h4 className="text-xs font-bold text-[#262626] uppercase tracking-wider">
                Resolution Notes & Discussion ({selectedTicket.comments?.length || 0})
              </h4>

              <div className="space-y-3">
                {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                  selectedTicket.comments.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border border-[#EDEDED] bg-[#F8F9FA] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <img
                            src={c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                            alt={c.author}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-bold text-[#262626]">{c.author}</span>
                        </div>
                        <span className="text-[10px] text-[#666666] font-medium">{c.createdAt.slice(11, 16)}</span>
                      </div>
                      <p className="text-xs text-[#262626] leading-relaxed pl-7">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#666666] border border-dashed border-[#BEBEBE] rounded-2xl">
                    No resolution comments logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post progress update or resolution note..."
                  className="flex-1 rounded-full border border-[#BEBEBE]/60 bg-[#F8F9FA] px-4 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold transition disabled:opacity-40 flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#666666]">
            <TicketIcon className="w-10 h-10 mb-2 opacity-40 text-[#74D96F]" />
            <p className="text-xs">Select a ticket to review SLA and comments.</p>
          </div>
        )}
      </div>

      {/* Modal: New Ticket */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-lg rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-2xl text-[#262626] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
              <h3 className="font-bold text-sm text-[#262626]">Submit Internal Request / Ticket</h3>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-[#666666] hover:text-[#262626]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Issue Summary</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. MinIO presigned URL download fails on staging"
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Details & Context</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Steps to reproduce, environment, error messages..."
                rows={3}
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Ticket["category"])}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="access">Access & Permissions</option>
                  <option value="it">IT Support</option>
                  <option value="dev">Software Engineering</option>
                  <option value="design">Design & UI</option>
                  <option value="hr">HR & Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Priority (SLA Tier)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Ticket["priority"])}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                >
                  <option value="urgent">Urgent (&lt; 2 hour SLA)</option>
                  <option value="high">High (&lt; 4 hour SLA)</option>
                  <option value="medium">Medium (24 hour SLA)</option>
                  <option value="low">Low (Standard)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EDEDED]">
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-xs text-[#262626] font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs text-[#262626] font-bold shadow-sm transition"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
