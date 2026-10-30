import {
  Organisation,
  Department,
  EmployeeProfile,
  KnowledgePage,
  Project,
  Task,
  Ticket,
  Meeting,
  ChatMessage,
  ChatChannel,
  AgentRecord,
  BrowserJob,
  StoredFile,
  AuditLogItem,
} from "../types";

import {
  initialOrganisations,
  initialDepartments,
  initialEmployees,
  initialKnowledgePages,
  initialProjects,
  initialTasks,
  initialTickets,
  initialMeetings,
  initialChannels,
  initialMessages,
  initialAgents,
  initialBrowserJobs,
  initialFiles,
  initialAuditLogs,
} from "./mockData";

export interface ApiStatus {
  isLive: boolean;
  endpoint: string;
  lastChecked: string;
}

class ApiService {
  private baseUrl: string;
  private isLiveApi: boolean = false;
  private listeners: Array<(status: ApiStatus) => void> = [];

  // Local state cache
  private organisations: Organisation[] = [];
  private departments: Department[] = [];
  private employees: EmployeeProfile[] = [];
  private knowledgePages: KnowledgePage[] = [];
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private tickets: Ticket[] = [];
  private meetings: Meeting[] = [];
  private channels: ChatChannel[] = [];
  private messages: Record<string, ChatMessage[]> = {};
  private agents: AgentRecord[] = [];
  private browserJobs: BrowserJob[] = [];
  private files: StoredFile[] = [];
  private auditLogs: AuditLogItem[] = [];

  constructor() {
    this.baseUrl =
      typeof window !== "undefined" && localStorage.getItem("bizcontext_api_url")
        ? localStorage.getItem("bizcontext_api_url")!
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

    this.initStore();
  }

  private initStore() {
    if (typeof window === "undefined") {
      this.organisations = [...initialOrganisations];
      this.departments = [...initialDepartments];
      this.employees = [...initialEmployees];
      this.knowledgePages = [...initialKnowledgePages];
      this.projects = [...initialProjects];
      this.tasks = [...initialTasks];
      this.tickets = [...initialTickets];
      this.meetings = [...initialMeetings];
      this.channels = [...initialChannels];
      this.messages = { ...initialMessages };
      this.agents = [...initialAgents];
      this.browserJobs = [...initialBrowserJobs];
      this.files = [...initialFiles];
      this.auditLogs = [...initialAuditLogs];
      return;
    }

    try {
      const load = <T>(key: string, initial: T): T => {
        const saved = localStorage.getItem(`bizcontext_${key}`);
        return saved ? JSON.parse(saved) : initial;
      };

      this.organisations = load("organisations", initialOrganisations);
      this.departments = load("departments", initialDepartments);
      this.employees = load("employees", initialEmployees);
      this.knowledgePages = load("knowledgePages", initialKnowledgePages);
      this.projects = load("projects", initialProjects);
      this.tasks = load("tasks", initialTasks);
      this.tickets = load("tickets", initialTickets);
      this.meetings = load("meetings", initialMeetings);
      this.channels = load("channels", initialChannels);
      this.messages = load("messages", initialMessages);
      this.agents = load("agents", initialAgents);
      this.browserJobs = load("browserJobs", initialBrowserJobs);
      this.files = load("files", initialFiles);
      this.auditLogs = load("auditLogs", initialAuditLogs);
    } catch {
      this.organisations = [...initialOrganisations];
      this.departments = [...initialDepartments];
      this.employees = [...initialEmployees];
      this.knowledgePages = [...initialKnowledgePages];
      this.projects = [...initialProjects];
      this.tasks = [...initialTasks];
      this.tickets = [...initialTickets];
      this.meetings = [...initialMeetings];
      this.channels = [...initialChannels];
      this.messages = { ...initialMessages };
      this.agents = [...initialAgents];
      this.browserJobs = [...initialBrowserJobs];
      this.files = [...initialFiles];
      this.auditLogs = [...initialAuditLogs];
    }
  }

  private saveStore(key: string, data: unknown) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`bizcontext_${key}`, JSON.stringify(data));
      } catch {
        // storage quota exceeded or disabled
      }
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
    if (typeof window !== "undefined") {
      localStorage.setItem("bizcontext_api_url", url);
    }
    this.checkApiHealth();
  }

  public subscribeStatus(listener: (status: ApiStatus) => void): () => void {
    this.listeners.push(listener);
    listener({
      isLive: this.isLiveApi,
      endpoint: this.baseUrl,
      lastChecked: new Date().toLocaleTimeString(),
    });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus() {
    const status: ApiStatus = {
      isLive: this.isLiveApi,
      endpoint: this.baseUrl,
      lastChecked: new Date().toLocaleTimeString(),
    };
    for (const listener of this.listeners) {
      listener(status);
    }
  }

  public async checkApiHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.isLiveApi = res.ok;
    } catch {
      this.isLiveApi = false;
    }
    this.notifyStatus();
    return this.isLiveApi;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isLiveApi = true;
        this.notifyStatus();
        return (await res.json()) as T;
      }
    } catch {
      // Backend not running yet or endpoint 404/500
      this.isLiveApi = false;
      this.notifyStatus();
    }
    return null;
  }

  // --- Organisations & Departments ---
  public async getOrganisations(): Promise<Organisation[]> {
    const live = await this.request<Organisation[]>("/organisations");
    return live || this.organisations;
  }

  public async getDepartments(): Promise<Department[]> {
    const live = await this.request<Department[]>("/departments");
    return live || this.departments;
  }

  // --- Employees & People Intelligence ---
  public async getEmployees(): Promise<EmployeeProfile[]> {
    const live = await this.request<EmployeeProfile[]>("/employees");
    return live || this.employees;
  }

  public async getEmployee(id: string): Promise<EmployeeProfile | undefined> {
    const live = await this.request<EmployeeProfile>(`/employees/${id}`);
    if (live) return live;
    return this.employees.find((e) => e.id === id);
  }

  public async parseCV(fileName: string, rawText?: string): Promise<{
    name: string;
    email: string;
    skills: string[];
    experienceYears: number;
    education: string;
    summary: string;
  }> {
    const live = await this.request<{
      name: string;
      email: string;
      skills: string[];
      experienceYears: number;
      education: string;
      summary: string;
    }>("/employees/parse-cv", {
      method: "POST",
      body: JSON.stringify({ fileName, rawText }),
    });
    if (live) return live;

    // Simulated high-fidelity CV extraction
    return {
      name: "Rohit Krishnan",
      email: "rohit.k@example.com",
      skills: ["Rust", "Distributed Systems", "Playwright Automation", "PostgreSQL", "Docker", "Python FastAPI"],
      experienceYears: 5,
      education: "B.Tech Computer Science & Engineering",
      summary: "Senior Systems Engineer with 5+ years building containerized web automation pipelines, microservices, and RAG knowledge graphs.",
    };
  }

  public async addEmployee(data: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    const newEmp: EmployeeProfile = {
      id: `emp-${Date.now()}`,
      organisationId: "org-1",
      userId: `usr-${Date.now()}`,
      createdBy: "usr-admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: data.firstName || "New",
      lastName: data.lastName || "Member",
      workEmail: data.workEmail || "member@vyuham.ai",
      designation: data.designation || "Engineer",
      departmentId: data.departmentId || "dept-1",
      departmentName: data.departmentName || "AI Engineering & Research",
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      bio: data.bio || "Extracted from CV onboarding process.",
      employmentStatus: "active",
      skills: data.skills || [
        { name: "Rust", proficiency: "expert", verified: true },
        { name: "Playwright", proficiency: "intermediate", verified: true },
      ],
      currentProjects: ["BizContext Web Core V1"],
      extractedFromCv: true,
    };

    const live = await this.request<EmployeeProfile>("/employees", {
      method: "POST",
      body: JSON.stringify(newEmp),
    });

    const res = live || newEmp;
    this.employees = [res, ...this.employees];
    this.saveStore("employees", this.employees);
    this.addAuditLog("Adhwaithas S.", "user", `Onboarded employee ${res.firstName} ${res.lastName} from verified CV`);
    return res;
  }

  // --- Knowledge Workspace ---
  public async getKnowledgePages(): Promise<KnowledgePage[]> {
    const live = await this.request<KnowledgePage[]>("/knowledge/pages");
    return live || this.knowledgePages;
  }

  public async getKnowledgePage(id: string): Promise<KnowledgePage | undefined> {
    const live = await this.request<KnowledgePage>(`/knowledge/pages/${id}`);
    if (live) return live;
    return this.knowledgePages.find((p) => p.id === id);
  }

  public async createKnowledgePage(data: Partial<KnowledgePage>): Promise<KnowledgePage> {
    const newPage: KnowledgePage = {
      id: `page-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: data.title || "Untitled Document",
      slug: (data.title || "untitled-document").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      content: data.content || "# New Document\n\nEnter organizational knowledge here...",
      summary: data.summary || "Newly created organizational knowledge document.",
      visibility: data.visibility || "internal",
      tags: data.tags || ["documentation"],
      authorName: "Adhwaithas S.",
      viewsCount: 1,
    };

    const live = await this.request<KnowledgePage>("/knowledge/pages", {
      method: "POST",
      body: JSON.stringify(newPage),
    });

    const res = live || newPage;
    this.knowledgePages = [res, ...this.knowledgePages];
    this.saveStore("knowledgePages", this.knowledgePages);
    this.addAuditLog("Adhwaithas S.", "user", `Created knowledge page "${res.title}"`);
    return res;
  }

  public async updateKnowledgePage(id: string, updates: Partial<KnowledgePage>): Promise<KnowledgePage> {
    const idx = this.knowledgePages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.knowledgePages[idx] = {
        ...this.knowledgePages[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveStore("knowledgePages", this.knowledgePages);
      return this.knowledgePages[idx];
    }
    throw new Error("Page not found");
  }

  // --- Projects & Tasks ---
  public async getProjects(): Promise<Project[]> {
    const live = await this.request<Project[]>("/projects");
    return live || this.projects;
  }

  public async createProject(data: Partial<Project>): Promise<Project> {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: data.name || "Untitled Project",
      description: data.description || "Project created in BizContext workspace.",
      status: data.status || "active",
      ownerId: "emp-1",
      ownerName: "Adhwaithas S.",
      progressPercent: 0,
      departmentName: data.departmentName || "AI Engineering & Research",
      tasksCount: { total: 0, done: 0 },
      dueDate: data.dueDate || "2026-11-30",
    };

    const live = await this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(newProject),
    });

    const res = live || newProject;
    this.projects = [res, ...this.projects];
    this.saveStore("projects", this.projects);
    return res;
  }

  public async getTasks(projectId?: string): Promise<Task[]> {
    const live = await this.request<Task[]>(projectId ? `/tasks?projectId=${projectId}` : "/tasks");
    const tasks = live || this.tasks;
    if (projectId) {
      return tasks.filter((t) => t.projectId === projectId);
    }
    return tasks;
  }

  public async createTask(data: Partial<Task>): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: data.title || "Untitled Task",
      description: data.description || "",
      projectId: data.projectId || "proj-1",
      projectName: data.projectName || "BizContext Web Core V1",
      primaryAssigneeId: data.primaryAssigneeId || "emp-1",
      assigneeName: data.assigneeName || "Adhwaithas S.",
      assigneeAvatar: data.assigneeAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      collaboratorIds: data.collaboratorIds || [],
      priority: data.priority || "medium",
      status: data.status || "open",
      dueDate: data.dueDate || "2026-11-10",
      subtasks: data.subtasks || [],
    };

    const live = await this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(newTask),
    });

    const res = live || newTask;
    this.tasks = [res, ...this.tasks];
    this.saveStore("tasks", this.tasks);
    this.addAuditLog("Adhwaithas S.", "user", `Created task "${res.title}" assigned to ${res.assigneeName}`);
    return res;
  }

  public async updateTaskStatus(taskId: string, status: Task["status"]): Promise<Task> {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      this.tasks[idx] = {
        ...this.tasks[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      this.saveStore("tasks", this.tasks);

      // Async live sync attempt
      this.request(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      return this.tasks[idx];
    }
    throw new Error("Task not found");
  }

  // --- Tickets & SLA ---
  public async getTickets(): Promise<Ticket[]> {
    const live = await this.request<Ticket[]>("/tickets");
    return live || this.tickets;
  }

  public async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    const count = this.tickets.length + 1045;
    const newTicket: Ticket = {
      id: `tick-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ticketNumber: `TICK-${count}`,
      title: data.title || "Untitled Issue",
      description: data.description || "",
      category: data.category || "dev",
      priority: data.priority || "medium",
      status: "open",
      requesterId: "emp-1",
      requesterName: "Adhwaithas S.",
      assigneeId: data.assigneeId || "emp-3",
      assigneeName: data.assigneeName || "Marcus Vance",
      slaTarget: "In 24 hours",
      slaBreached: false,
      comments: [],
    };

    const live = await this.request<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(newTicket),
    });

    const res = live || newTicket;
    this.tickets = [res, ...this.tickets];
    this.saveStore("tickets", this.tickets);
    this.addAuditLog("Adhwaithas S.", "user", `Logged ticket ${res.ticketNumber}: "${res.title}"`);
    return res;
  }

  public async updateTicketStatus(ticketId: string, status: Ticket["status"]): Promise<Ticket> {
    const idx = this.tickets.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      this.tickets[idx] = {
        ...this.tickets[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      this.saveStore("tickets", this.tickets);
      return this.tickets[idx];
    }
    throw new Error("Ticket not found");
  }

  public async addTicketComment(ticketId: string, text: string): Promise<Ticket> {
    const idx = this.tickets.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const comments = this.tickets[idx].comments || [];
      comments.push({
        id: `c-${Date.now()}`,
        author: "Adhwaithas S.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        text,
        createdAt: new Date().toISOString(),
      });
      this.tickets[idx] = { ...this.tickets[idx], comments, updatedAt: new Date().toISOString() };
      this.saveStore("tickets", this.tickets);
      return this.tickets[idx];
    }
    throw new Error("Ticket not found");
  }

  // --- Meetings & Minutes (AI Action Items - Section 10.1) ---
  public async getMeetings(): Promise<Meeting[]> {
    const live = await this.request<Meeting[]>("/meetings");
    return live || this.meetings;
  }

  public async extractActionItems(meetingId: string): Promise<Meeting> {
    const live = await this.request<Meeting>(`/meetings/${meetingId}/extract-action-items`, {
      method: "POST",
    });
    if (live) return live;

    const idx = this.meetings.findIndex((m) => m.id === meetingId);
    if (idx !== -1) {
      // Simulate intelligent AI action item extraction if empty or new
      const meeting = this.meetings[idx];
      if (meeting.extractedActionItems.length === 0) {
        meeting.extractedActionItems = [
          {
            id: `act-${Date.now()}-1`,
            title: "Coordinate with DevOps on gVisor sandbox egress firewall rules",
            assignee: "Marcus Vance",
            dueDate: "2026-11-03",
            priority: "high",
            convertedToTask: false,
          },
          {
            id: `act-${Date.now()}-2`,
            title: "Validate HyDE query expansion prompt with pgvector top-k results",
            assignee: "Priya Sharma",
            dueDate: "2026-11-04",
            priority: "medium",
            convertedToTask: false,
          },
        ];
      }
      this.saveStore("meetings", this.meetings);
      this.addAuditLog("Meeting Secretary (AI)", "agent", `Extracted action items for meeting "${meeting.title}"`);
      return meeting;
    }
    throw new Error("Meeting not found");
  }

  public async convertActionItemToTask(meetingId: string, actionId: string): Promise<Task> {
    const meeting = this.meetings.find((m) => m.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");

    const action = meeting.extractedActionItems.find((a) => a.id === actionId);
    if (!action) throw new Error("Action item not found");

    action.convertedToTask = true;
    this.saveStore("meetings", this.meetings);

    const createdTask = await this.createTask({
      title: action.title,
      description: `Auto-generated from meeting: "${meeting.title}". Assigned during transcript action item extraction.`,
      projectId: meeting.projectId || "proj-1",
      projectName: meeting.projectName || "BizContext Web Core V1",
      assigneeName: action.assignee,
      priority: action.priority,
      status: "open",
      dueDate: action.dueDate,
    });

    return createdTask;
  }

  // --- Communication & Channels ---
  public async getChannels(): Promise<ChatChannel[]> {
    const live = await this.request<ChatChannel[]>("/channels");
    return live || this.channels;
  }

  public async getMessages(channelId: string): Promise<ChatMessage[]> {
    const live = await this.request<ChatMessage[]>(`/channels/${channelId}/messages`);
    return live || this.messages[channelId] || [];
  }

  public async sendMessage(channelId: string, content: string): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: "emp-1",
      senderName: "Adhwaithas S.",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    if (!this.messages[channelId]) {
      this.messages[channelId] = [];
    }
    this.messages[channelId].push(newMsg);
    this.saveStore("messages", this.messages);

    // If message mentions @BizContext or asks a question, generate an instant AI response!
    if (content.toLowerCase().includes("@bizcontext") || content.toLowerCase().includes("?") || content.toLowerCase().includes("status")) {
      setTimeout(() => {
        const aiReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          channelId,
          senderId: "ai-bot",
          senderName: "BizContext Copilot",
          isAi: true,
          content: `🤖 **BizContext AI**: I indexed your query against company memory. All 3 active projects are currently within SLA thresholds, and the B3 Browser Worker is awaiting approval on invoice export.`,
          createdAt: new Date().toISOString(),
          reactions: [{ emoji: "⚡", count: 2, users: ["Adhwaithas"] }],
        };
        this.messages[channelId].push(aiReply);
        this.saveStore("messages", this.messages);
      }, 700);
    }

    return newMsg;
  }

  // --- Agents & Browser Jobs (Section 4 & 5) ---
  public async getAgents(): Promise<AgentRecord[]> {
    const live = await this.request<AgentRecord[]>("/agents");
    return live || this.agents;
  }

  public async createAgent(data: Partial<AgentRecord>): Promise<AgentRecord> {
    const newAgent: AgentRecord = {
      id: `ag-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: data.name || "Custom Assistant",
      role: data.role || "Specialized Task Agent",
      description: data.description || "Created to execute organizational automations.",
      instructions: data.instructions || "Follow least-privilege security guidelines.",
      model: data.model || "claude-3-5-sonnet",
      browserPermission: data.browserPermission || "B1",
      status: "active",
      allowedDomains: data.allowedDomains || ["internal.docs"],
      totalExecutions: 0,
      successRate: 100,
    };

    this.agents = [newAgent, ...this.agents];
    this.saveStore("agents", this.agents);
    this.addAuditLog("Adhwaithas S.", "user", `Registered new agent "${newAgent.name}" with level ${newAgent.browserPermission}`);
    return newAgent;
  }

  public async getBrowserJobs(): Promise<BrowserJob[]> {
    const live = await this.request<BrowserJob[]>("/browser-jobs");
    return live || this.browserJobs;
  }

  public async createBrowserJob(data: Partial<BrowserJob>): Promise<BrowserJob> {
    const newJob: BrowserJob = {
      id: `bjob-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agentId: data.agentId || "ag-2",
      agentName: data.agentName || "Autonomous Browser Worker",
      goal: data.goal || "Extract web metrics",
      targetUrl: data.targetUrl || "https://example.com",
      permissionLevel: data.permissionLevel || "B2",
      status: "running",
      steps: [
        {
          stepNumber: 1,
          action: "navigate",
          target: data.targetUrl || "https://example.com",
          status: "completed",
          timestamp: new Date().toLocaleTimeString(),
          details: `Connected to sandbox network namespace and resolved ${data.targetUrl}`,
        },
        {
          stepNumber: 2,
          action: "extract",
          target: "body",
          status: "running",
          timestamp: new Date().toLocaleTimeString(),
          details: "Parsing DOM nodes...",
        },
      ],
      evidenceUrls: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"],
      outputSummary: "Job initiated in sandboxed container.",
    };

    const live = await this.request<BrowserJob>("/browser-jobs", {
      method: "POST",
      body: JSON.stringify(newJob),
    });

    const res = live || newJob;
    this.browserJobs = [res, ...this.browserJobs];
    this.saveStore("browserJobs", this.browserJobs);
    this.addAuditLog("Autonomous Browser Worker", "agent", `Launched browser job: "${res.goal}"`);
    return res;
  }

  public async approveBrowserJob(jobId: string, decision: "approved" | "rejected"): Promise<BrowserJob> {
    const idx = this.browserJobs.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      if (decision === "approved") {
        this.browserJobs[idx].status = "completed";
        this.browserJobs[idx].steps.push({
          stepNumber: this.browserJobs[idx].steps.length + 1,
          action: "click",
          status: "completed",
          timestamp: new Date().toLocaleTimeString(),
          details: "Supervisor approval granted. Downloaded PDF invoice securely to storage/org-1.",
        });
        this.browserJobs[idx].outputSummary = "Approved by supervisor. Action completed successfully with full cryptographic audit trail.";
        this.addAuditLog("Adhwaithas S.", "user", `APPROVED high-risk browser action for job #${jobId}`);
      } else {
        this.browserJobs[idx].status = "cancelled";
        this.browserJobs[idx].outputSummary = "Job rejected by supervisor.";
        this.addAuditLog("Adhwaithas S.", "user", `REJECTED browser action for job #${jobId}`);
      }
      this.saveStore("browserJobs", this.browserJobs);
      return this.browserJobs[idx];
    }
    throw new Error("Job not found");
  }

  // --- Asset Storage ---
  public async getFiles(): Promise<StoredFile[]> {
    const live = await this.request<StoredFile[]>("/files");
    return live || this.files;
  }

  public async uploadFile(filename: string, mimeType: string, byteSize: number): Promise<StoredFile> {
    const newFile: StoredFile = {
      id: `file-${Date.now()}`,
      organisationId: "org-1",
      createdBy: "emp-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filename,
      mimeType,
      byteSize,
      storagePath: `org-1/uploads/${filename}`,
      visibility: "internal",
      uploadedByName: "Adhwaithas S.",
      downloadUrl: "#",
    };

    this.files = [newFile, ...this.files];
    this.saveStore("files", this.files);
    this.addAuditLog("Adhwaithas S.", "user", `Uploaded document "${filename}"`);
    return newFile;
  }

  // --- Audit Logs ---
  public async getAuditLogs(): Promise<AuditLogItem[]> {
    return this.auditLogs;
  }

  private addAuditLog(actorName: string, actorType: "user" | "agent" | "system", action: string, targetResource = "BizContext Workspace") {
    const item: AuditLogItem = {
      id: `aud-${Date.now()}`,
      actorName,
      actorType,
      action,
      targetResource,
      timestamp: new Date().toLocaleTimeString() + " " + new Date().toISOString().slice(0, 10),
      status: "success",
    };
    this.auditLogs = [item, ...this.auditLogs.slice(0, 49)];
    this.saveStore("auditLogs", this.auditLogs);
  }

  // --- Second Brain Hybrid AI Search & Answer ---
  public async askSecondBrain(query: string): Promise<{
    answer: string;
    sources: Array<{ title: string; category: string; matchConfidence: number; link: string }>;
    suggestedActions: Array<{ label: string; actionType: string; payload?: unknown }>;
  }> {
    const q = query.toLowerCase();

    // Contextual matching simulation against knowledge base, tickets, and projects
    const sources = [
      {
        title: "Browser Agent Security Guidelines (B0-B4 Permission Matrix)",
        category: "Security Policy",
        matchConfidence: 96.4,
        link: "/knowledge?page=page-2",
      },
      {
        title: "Sprint 26 Architecture & AI Governance Sync Minutes",
        category: "Meeting Minutes",
        matchConfidence: 91.8,
        link: "/meetings?id=meet-1",
      },
      {
        title: "BizContext System Architecture & Unified Memory Model",
        category: "Architecture Blueprint",
        matchConfidence: 88.5,
        link: "/knowledge?page=page-1",
      },
    ];

    let answer = `According to organizational documents and recent architectural decisions:\n\n1. **Security & Browser Execution**: Autonomous Playwright agents operate under 5 distinct permission levels (B0 to B4). Form changes and financial/data downloads at level B3 and B4 strictly enforce human-in-the-loop approval before proceeding.\n2. **Retrieval Layer**: BizContext AI utilizes hybrid retrieval (pgvector semantic embeddings with HNSW indexing + BM25 keyword matching) to deliver low-latency (<600ms) answers with source citations.\n3. **Current Operations**: All 3 active sprint projects are currently tracked on schedule, and meeting minutes have been automatically parsed into actionable Kanban tasks.`;

    if (q.includes("sla") || q.includes("ticket")) {
      answer = `### SLA & Ticket Status Report\n- **Active Urgent Tickets**: TICK-1042 (*Production MinIO presigned URL CORS error*) is currently in progress under Marcus Vance, due within 1h 45m.\n- **SLA Target Compliance**: 98.4% of high and urgent requests are acknowledged within 15 minutes and resolved within the 4-hour SLA window.`;
    } else if (q.includes("browser") || q.includes("approval") || q.includes("agent")) {
      answer = `### Browser Agent Policy & Pending Actions\n- **Approval Drawer Alert**: Job \`#bjob-1\` (*AWS monthly invoice PDF export*) is currently paused at step 3, awaiting supervisor sign-off.\n- **Domain Restrictions**: Autonomous Playwright containers only permit egress to whitelisted domains (\`portal.aws.amazon.com\`, \`github.com\`, etc.) isolated in gVisor sandboxes.`;
    }

    return {
      answer,
      sources,
      suggestedActions: [
        { label: "View Browser Approval Queue", actionType: "navigate", payload: "/browser-jobs" },
        { label: "Inspect Architecture Doc", actionType: "navigate", payload: "/knowledge" },
        { label: "Review Sprint Tasks", actionType: "navigate", payload: "/projects" },
      ],
    };
  }
}

export const api = new ApiService();
