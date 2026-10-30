"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  Building2,
  LogOut,
} from "lucide-react";
import { api, ApiStatus } from "../../services/api";
import type { StoredSession } from "../../services/http";
import { ApiStatusModal } from "./ApiStatusModal";
import { SecondBrainModal } from "./SecondBrainModal";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredSession["user"] | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isLive: false,
    endpoint: api.getBaseUrl(),
    lastChecked: "",
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  const isPublic = isAuthPage || isLandingPage;

  useEffect(() => {
    if (isPublic) return;
    const session = api.getSession();
    setCurrentUser(session?.user ?? null);
    setRole(session?.role ?? null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    api
      .getOrganisations()
      .then((orgs) => {
        const current = orgs.find((o) => o.id === session?.organisationId) ?? orgs[0];
        setOrgName(current?.name ?? null);
      })
      .catch(() => setOrgName(null));
  }, [isPublic]);

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email.split("@")[0]
    : "";
  const initials = (displayName || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        { name: "Home", href: "/dashboard", icon: Brain },
        { name: "Knowledge", href: "/knowledge", icon: BookOpen },
        { name: "Projects", href: "/projects", icon: FolderKanban },
        { name: "Tickets", href: "/tickets", icon: TicketIcon },
        { name: "Meetings", href: "/meetings", icon: Video },
        { name: "Chat", href: "/chat", icon: MessageSquare },
      ],
    },
    {
      label: "PEOPLE & AUTOMATION",
      items: [
        { name: "People", href: "/directory", icon: Users },
        { name: "Agents", href: "/agents", icon: Bot },
        { name: "Browser jobs", href: "/browser-jobs", icon: Globe },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { name: "Files", href: "/storage", icon: HardDrive },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  if (isPublic) {
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
          <Link href="/dashboard" className="flex items-center space-x-3 group">
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
                <h1 className="font-extrabold text-sm tracking-tight text-[#262626]">BizContext</h1>
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
        {isSidebarOpen && orgName && (
          <div className="px-3 pt-3">
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EDEDED] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#56BE51] shrink-0" />
              <span className="truncate font-bold text-[#262626]">{orgName}</span>
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
                <div
                  aria-hidden
                  className="w-8 h-8 rounded-lg bg-[#74D96F]/25 text-[#1F541D] text-xs font-bold flex items-center justify-center border border-[#74D96F]/40"
                >
                  {initials}
                </div>
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <div className="text-xs font-bold text-[#262626] truncate">{displayName}</div>
                  {role && (
                    <div className="text-[10px] text-[#666666] truncate font-medium capitalize">{role}</div>
                  )}
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#666666] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
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
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] border border-[#D8D8D8] hover:border-[#BEBEBE] text-xs text-[#666666] hover:text-[#262626] transition w-full max-w-sm shadow-xs group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#56BE51] group-hover:scale-110 transition-transform" />
            <span className="truncate">Ask your second brain...</span>
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
              title="API connection status"
            >
              {apiStatus.isLive ? (
                <>
                  <Wifi className="w-3 h-3 text-[#56BE51]" />
                  <span className="hidden md:inline">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-[#ED6B2D]" />
                  <span className="hidden md:inline">Offline</span>
                </>
              )}
            </button>
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
