"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Hash,
  Lock,
  Send,
  Sparkles,
  Bot,
  Users,
} from "lucide-react";
import { api } from "../../services/api";
import { ChatChannel, ChatMessage } from "../../types";

export default function ChatPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChannels() {
      const chs = await api.getChannels();
      setChannels(chs);
      if (chs.length > 0) {
        setActiveChannel(chs[0]);
      }
    }
    loadChannels();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    async function loadMessages() {
      const msgs = await api.getMessages(activeChannel!.id);
      setMessages(msgs);
    }
    loadMessages();
    const interval = setInterval(loadMessages, 1500);
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannel || isSending) return;

    const text = inputText;
    setInputText("");
    setIsSending(true);
    const pending = api.sendMessage(activeChannel.id, text);
    // Show the user's own message immediately; the AI reply lands when the promise resolves.
    setMessages(await api.getMessages(activeChannel.id));
    await pending;
    setMessages(await api.getMessages(activeChannel.id));
    setIsSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] rounded-3xl border border-[#BEBEBE]/40 bg-white shadow-sm overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-[#EDEDED] bg-[#F8F9FA] p-4 flex flex-col shrink-0">
        <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#EDEDED]">
          <MessageSquare className="w-4 h-4 text-[#74D96F]" />
          <span className="font-bold text-sm text-[#262626]">Channels</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {channels.map((ch) => {
            const isActive = activeChannel?.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                  isActive
                    ? "bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/40 shadow-xs"
                    : "text-[#666666] hover:text-[#262626] hover:bg-[#EDEDED]/50"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {ch.isPrivate ? (
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Hash className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                  )}
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.unreadCount ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#74D96F] text-[#262626] font-bold">
                    {ch.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* AI Bot Quick Prompt Tip */}
        <div className="p-3.5 rounded-2xl bg-[#EDEDED] border border-[#BEBEBE]/40 text-[11px] text-[#262626] space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-[#1F541D]">
            <Sparkles className="w-3.5 h-3.5 text-[#74D96F]" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[10px] text-[#666666] leading-tight">
            Tag <strong className="text-[#262626]">@BizContext</strong> or ask a question to query organizational memory.
          </p>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Active Channel Header */}
        {activeChannel && (
          <div className="h-14 px-6 border-b border-[#EDEDED] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center space-x-2">
              {activeChannel.isPrivate ? (
                <Lock className="w-4 h-4 text-amber-500" />
              ) : (
                <Hash className="w-4 h-4 text-[#666666]" />
              )}
              <span className="font-bold text-sm text-[#262626]">{activeChannel.name}</span>
              <span className="text-xs text-[#666666] hidden sm:inline">— {activeChannel.description}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-[#666666]">
              <Users className="w-3.5 h-3.5" />
              <span>{activeChannel.memberCount} members</span>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 text-xs ${
                m.isAi ? "bg-[#74D96F]/10 p-4 rounded-2xl border border-[#74D96F]/30 shadow-xs" : ""
              }`}
            >
              {m.isAi ? (
                <div className="w-8 h-8 rounded-xl bg-[#74D96F] flex items-center justify-center shrink-0 shadow-xs text-[#262626]">
                  <Bot className="w-4 h-4 text-[#262626]" />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="w-8 h-8 rounded-xl bg-[#EDEDED] text-[#262626] text-[11px] font-bold flex items-center justify-center shrink-0 border border-[#BEBEBE]/40"
                >
                  {m.senderName.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${m.isAi ? "text-[#1F541D]" : "text-[#262626]"}`}>
                    {m.senderName}
                  </span>
                  {m.isAi && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#74D96F]/20 text-[#1F541D] font-bold border border-[#74D96F]/40">
                      BOT
                    </span>
                  )}
                  <span className="text-[10px] text-[#666666]">{m.createdAt.slice(11, 16)}</span>
                </div>
                <div className="text-[#262626] leading-relaxed whitespace-pre-wrap">{m.content}</div>

                {/* Reactions */}
                {m.reactions && m.reactions.length > 0 && (
                  <div className="flex items-center space-x-1.5 pt-1">
                    {m.reactions.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-[#EDEDED] border border-[#BEBEBE]/40 text-[#262626] font-medium"
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#EDEDED] bg-white">
          <div className="flex items-center space-x-2 rounded-full border border-[#BEBEBE]/60 bg-[#F8F9FA] px-4 py-2 focus-within:border-[#74D96F] focus-within:bg-white transition">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannel?.name || "channel"} (type @BizContext for AI)...`}
              className="flex-1 bg-transparent text-xs text-[#262626] placeholder-[#999999] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              aria-label="Send message"
              className="p-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
