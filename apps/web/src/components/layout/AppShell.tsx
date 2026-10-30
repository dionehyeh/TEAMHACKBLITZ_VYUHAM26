"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  BookOpen,
  FolderKanban,
  Ticket as TicketIcon,
  Video,
  MessageSquare,
  Users,
  Bot,
  Globe,
  HardDrive,
  BarChart3,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  Bell,
  Menu,
  ChevronDown,
  Building2,
  LogIn,
} from "lucide-react";
import { api, ApiStatus } from "../../services/api";
import { ApiStatusModal } from "./ApiStatusModal";
import { SecondBrainModal } from "./SecondBrainModal";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isLive: false,
    endpoint: api.getBaseUrl(),
    lastChecked: "",
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    // Check initial API health
    api.checkApiHealth();
    const unsubscribe = api.subscribeStatus((newStatus) => {
      setApiStatus(newStatus);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsAiModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navGroups = [
    {
      label: "WORKSPACE",
      items: [
        { name: "Second Brain Hub", href: "/", icon: Brain },
        { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
        { name: "Projects & Kanban", href: "/projects", icon: FolderKanban },
        { name: "Tickets & SLA", href: "/tickets", icon: TicketIcon },
        { name: "Meetings & AI Minutes", href: "/meetings", icon: Video },
        { name: "Channels & Chat", href: "/chat", icon: MessageSquare },
      ],
    },
    {
      label: "INTELLIGENCE & AUTOMATION",
      items: [
        { name: "People & CV Intelligence", href: "/directory", icon: Users },
        { name: "Agent Registry", href: "/agents", icon: Bot },
        { name: "Browser Automation", href: "/browser-jobs", icon: Globe, badge: "B0-B4" },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { name: "Asset Storage", href: "/storage", icon: HardDrive },
        { name: "Analytics & SLA", href: "/analytics", icon: BarChart3 },
        { name: "Org & API Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-white text-[#262626]">{children}</main>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] text-[#262626]">
      {/* Sidebar - Minto Architectural White & Soft Gray */}
      <aside
        className={`flex flex-col border-r border-[#EDEDED] bg-white transition-all duration-300 z-30 ${
          isSidebarOpen ? "w-64" : "w-18"
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#EDEDED]">
          <Link href="/" className="flex items-center space-x-3 group">
            {/* Minto Green Icon Badge */}
            <div className="w-8 h-8 rounded-xl bg-[#74D96F] flex items-center justify-center shadow-[0_2px_10px_rgba(116,217,111,0.35)] shrink-0 transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="8" strokeOpacity="0.4" strokeWidth="2" />
                <path d="M7.5 12h8.5a4 4 0 0 0-4-4c-3.5 0-4.5 3-4.5 4s1 4 4.5 4c2.5 0 3.8-1.5 4-2.5" />
              </svg>
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <h1 className="font-extrabold text-sm tracking-tight text-[#262626] flex items-center">
                  BizContext{" "}
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#74D96F]/20 text-[#1F541D] font-bold border border-[#74D96F]/30">
                    MINTO
                  </span>
                </h1>
                <p className="text-[10px] text-[#666666] font-medium">Autonomous Workspace</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#666666] hover:text-[#262626] p-1.5 rounded-lg hover:bg-[#EDEDED] transition cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Organisation Selector */}
        {isSidebarOpen && (
          <div className="px-3 pt-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EDEDED] border border-[#DEDEDE] text-xs">
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-[#56BE51] shrink-0" />
                <span className="truncate font-bold text-[#262626]">Vyuham Enterprises</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#666666] shrink-0" />
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {isSidebarOpen && (
                <div className="text-[10px] font-bold tracking-wider text-[#9E9E9E] uppercase px-2 mb-1.5">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all group ${
                        isActive
                          ? "bg-[#74D96F]/15 text-[#1F541D] border border-[#74D96F]/30 font-bold shadow-xs"
                          : "text-[#666666] hover:text-[#262626] hover:bg-[#EDEDED] font-medium"
                      }`}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#56BE51]"
                              : "text-[#666666] group-hover:text-[#262626]"
                          }`}
                        />
                        {isSidebarOpen && <span>{item.name}</span>}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EDEDED] text-[#262626] font-bold border border-[#D0D0D0]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Current User Profile Footer */}
        <div className="p-3 border-t border-[#EDEDED] bg-[#F8F9FA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Adhwaithas S."
                  className="w-8 h-8 rounded-lg object-cover border border-[#BEBEBE]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#74D96F] ring-2 ring-white" />
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <div className="text-xs font-bold text-[#262626] truncate">Adhwaithas S.</div>
                  <div className="text-[10px] text-[#666666] truncate font-medium">Chief Technology Officer</div>
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <Link
                href="/login"
                className="p-1.5 rounded-lg text-[#666666] hover:text-[#262626] hover:bg-[#EDEDED] transition cursor-pointer"
                title="Switch account or sign in"
              >
                <LogIn className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#EDEDED] bg-white/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          {/* Ask Second Brain Search Bar Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] border border-[#D8D8D8] hover:border-[#BEBEBE] text-xs text-[#666666] hover:text-[#262626] transition w-72 md:w-96 shadow-xs group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#56BE51] group-hover:scale-110 transition-transform" />
            <span className="truncate">Ask Second Brain or search (Cmd+K)...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white text-[#262626] border border-[#BEBEBE]">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center space-x-3">
            {/* API Connection Indicator Pill */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                apiStatus.isLive
                  ? "bg-[#74D96F]/15 border-[#56BE51]/35 text-[#1F541D] hover:bg-[#74D96F]/25"
                  : "bg-[#F09363]/15 border-[#F09363]/35 text-[#843209] hover:bg-[#F09363]/25"
              }`}
              title="Click to view API Backend connection settings"
            >
              {apiStatus.isLive ? (
                <>
                  <Wifi className="w-3 h-3 text-[#56BE51] animate-pulse" />
                  <span className="hidden md:inline font-mono">API: Connected (Live)</span>
                  <span className="md:hidden font-mono">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-[#ED6B2D]" />
                  <span className="hidden md:inline font-mono">API: Demo Mode</span>
                  <span className="md:hidden font-mono">Demo</span>
                </>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 rounded-full text-[#666666] hover:text-[#262626] hover:bg-[#EDEDED] transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#74D96F] animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#74D96F]" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-[#EDEDED] bg-white p-3.5 shadow-xl text-xs z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDEDED]">
                    <span className="font-extrabold text-[#262626]">Alerts & Actions</span>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[10px] text-[#56BE51] font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/browser-jobs"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-2.5 rounded-2xl bg-[#F09363]/10 border border-[#F09363]/25 hover:bg-[#F09363]/15 transition"
                    >
                      <div className="font-bold text-[#843209]">Approval Required (B3 Agent)</div>
                      <div className="text-[11px] text-[#666666] mt-0.5">
                        Browser Worker #bjob-1 paused waiting for invoice export confirmation.
                      </div>
                    </Link>
                    <Link
                      href="/tickets"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-2.5 rounded-2xl bg-[#EDEDED] border border-[#DEDEDE] hover:bg-[#E2E2E2] transition"
                    >
                      <div className="font-bold text-[#262626]">Ticket Assigned: TICK-1042</div>
                      <div className="text-[11px] text-[#666666] mt-0.5">
                        Urgent CORS issue in MinIO storage. SLA target in 1h 45m.
                      </div>
                    </Link>
                    <Link
                      href="/meetings"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-2.5 rounded-2xl bg-[#EDEDED] border border-[#DEDEDE] hover:bg-[#E2E2E2] transition"
                    >
                      <div className="font-bold text-[#262626]">Meeting Summary Ready</div>
                      <div className="text-[11px] text-[#666666] mt-0.5">
                        AI extracted 3 new action items from Sprint 26 Governance sync.
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Link in Header */}
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] font-bold text-xs transition shadow-xs"
            >
              Auth
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F9FA]">
          {children}
        </main>
      </div>

      {/* Modals */}
      <ApiStatusModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
      <SecondBrainModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
