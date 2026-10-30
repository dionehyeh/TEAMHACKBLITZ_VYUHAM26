"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  User,
  CheckSquare,
} from "lucide-react";
import { api } from "../../services/api";
import { Project, Task, EmployeeProfile } from "../../types";

const COLUMNS: Array<{ id: Task["status"]; title: string; color: string; badge: string }> = [
  { id: "open", title: "Open / Backlog", color: "border-[#EDEDED] bg-[#EDEDED]/50", badge: "bg-white text-[#262626] border border-[#BEBEBE]" },
  { id: "in_progress", title: "In Progress", color: "border-[#75A0C9]/40 bg-[#75A0C9]/10", badge: "bg-[#75A0C9]/25 text-[#1F456E] border border-[#75A0C9]/40" },
  { id: "in_review", title: "In Review", color: "border-[#F09363]/40 bg-[#F09363]/10", badge: "bg-[#F09363]/25 text-[#843209] border border-[#F09363]/40" },
  { id: "blocked", title: "Blocked", color: "border-rose-200 bg-rose-50", badge: "bg-rose-100 text-rose-800 border border-rose-200" },
  { id: "done", title: "Completed", color: "border-[#74D96F]/40 bg-[#74D96F]/10", badge: "bg-[#74D96F]/25 text-[#1F541D] border border-[#74D96F]/40" },
];

export default function ProjectsKanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Form states for new task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("proj-1");
  const [taskAssignee, setTaskAssignee] = useState("Adhwaithas S.");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("medium");
  const [taskDueDate, setTaskDueDate] = useState("2026-11-10");

  // Form states for new project
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDept, setProjectDept] = useState("AI Engineering & Research");

  useEffect(() => {
    async function load() {
      const [p, t, e] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getEmployees(),
      ]);
      setProjects(p);
      setTasks(t);
      setEmployees(e);
    }
    load();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    const updated = await api.updateTaskStatus(taskId, newStatus);
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const proj = projects.find((p) => p.id === taskProjectId);
    const emp = employees.find((em) => `${em.firstName} ${em.lastName}` === taskAssignee);

    const created = await api.createTask({
      title: taskTitle,
      description: taskDescription,
      projectId: taskProjectId,
      projectName: proj?.name || "BizContext Web Core V1",
      assigneeName: taskAssignee,
      primaryAssigneeId: emp?.id || "emp-1",
      assigneeAvatar: emp?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      priority: taskPriority,
      status: "open",
      dueDate: taskDueDate,
    });

    setTasks([created, ...tasks]);
    setIsTaskModalOpen(false);
    setTaskTitle("");
    setTaskDescription("");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const created = await api.createProject({
      name: projectName,
      description: projectDescription,
      departmentName: projectDept,
      dueDate: "2026-12-15",
    });

    setProjects([...projects, created]);
    setIsProjectModalOpen(false);
    setProjectName("");
    setProjectDescription("");
  };

  const filteredTasks =
    selectedProjectId === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EDEDED]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#262626] flex items-center space-x-2">
            <FolderKanban className="w-6 h-6 text-[#74D96F]" />
            <span>Projects & Kanban Operations</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Cross-functional initiative tracking, task assignment, and milestone delivery.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#262626] text-xs font-semibold border border-[#BEBEBE]/40 shadow-xs transition"
          >
            + New Project
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Selector Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedProjectId("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
            selectedProjectId === "all"
              ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
              : "bg-white border border-[#EDEDED] text-[#666666] hover:text-[#262626] hover:border-[#BEBEBE]"
          }`}
        >
          All Projects ({tasks.length})
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProjectId(p.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 flex items-center space-x-2 ${
              selectedProjectId === p.id
                ? "bg-[#74D96F] text-[#262626] font-bold shadow-xs border border-[#62CE5C]"
                : "bg-white border border-[#EDEDED] text-[#666666] hover:text-[#262626] hover:border-[#BEBEBE]"
            }`}
          >
            <span>{p.name}</span>
            <span className="text-[10px] opacity-75 font-mono">{p.progressPercent}%</span>
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-3.5 flex flex-col min-h-[500px] shadow-xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDEDED]">
                <span className="text-xs font-bold text-[#262626]">{col.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-[#EDEDED] bg-white p-3.5 shadow-xs hover:border-[#74D96F] hover:shadow-md transition space-y-2.5 group"
                  >
                    {/* Priority & Project Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === "urgent"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : task.priority === "high"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-[#EDEDED] text-[#262626] border border-[#BEBEBE]/60"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-[#666666] font-medium truncate max-w-[110px]">
                        {task.projectName}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-xs font-bold text-[#262626] group-hover:text-black transition">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-[#666666] mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Subtasks Count if any */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center space-x-1 text-[10px] text-[#666666] font-mono">
                        <CheckSquare className="w-3 h-3 text-[#74D96F]" />
                        <span>
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      </div>
                    )}

                    {/* Card Footer: Assignee, Due Date & Quick Status Shift */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED] text-[11px] text-[#666666]">
                      <div className="flex items-center space-x-1.5 truncate">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                        )}
                        <span className="truncate text-[#262626] font-medium text-[10px]">
                          {task.assigneeName}
                        </span>
                      </div>

                      {/* Status Selector Dropdown */}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
                        className="text-[9px] bg-[#EDEDED] border border-[#BEBEBE]/50 rounded-lg px-2 py-0.5 text-[#262626] font-medium focus:outline-none focus:border-[#74D96F] cursor-pointer"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="blocked">Blocked</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="py-12 text-center text-[11px] text-[#999999]">
                    No tasks in this lane
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-lg rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-2xl text-[#262626] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
              <h3 className="font-bold text-sm text-[#262626]">Create Kanban Task</h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-[#666666] hover:text-[#262626]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Integrate pgvector HNSW index tuning"
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Description</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Technical details, acceptance criteria, or context..."
                rows={3}
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Project</label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Task["priority"])}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EDEDED]">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-xs text-[#262626] font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs text-[#262626] font-bold shadow-sm transition"
              >
                Add to Kanban
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Project */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-lg rounded-3xl border border-[#BEBEBE]/40 bg-white p-6 shadow-2xl text-[#262626] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEDED]">
              <h3 className="font-bold text-sm text-[#262626]">Create New Project</h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-[#666666] hover:text-[#262626]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Enterprise Vector Ingestion Pipeline"
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Goal and key deliverables..."
                rows={3}
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] placeholder-[#999999] focus:outline-none focus:border-[#74D96F] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">Department</label>
              <select
                value={projectDept}
                onChange={(e) => setProjectDept(e.target.value)}
                className="w-full rounded-xl border border-[#BEBEBE]/60 bg-[#F8F9FA] px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#74D96F] focus:bg-white"
              >
                <option value="AI Engineering & Research">AI Engineering & Research</option>
                <option value="Infrastructure & Security">Infrastructure & Security</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Enterprise Solutions">Enterprise Solutions</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#EDEDED]">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-xs text-[#262626] font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-xs text-[#262626] font-bold shadow-sm transition"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
