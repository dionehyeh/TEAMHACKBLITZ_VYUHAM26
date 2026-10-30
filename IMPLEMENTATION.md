# BizContext AI --- Implementation Specification

**Product:** BizContext AI\
**Positioning:** An AI-powered Business Second Brain and organisational
operating workspace\
**Document type:** Product and technical implementation plan\
**Status:** Proposed implementation baseline

------------------------------------------------------------------------

## 1. Product vision

BizContext AI is a unified workspace that helps an organisation
**remember what it knows, understand what is happening, coordinate its
people, and act on work**.

It combines:

-   A Notion-like knowledge workspace.
-   Centralised asset and document storage.
-   Slack-inspired communication and collaboration.
-   Projects, tasks, tickets, meetings, and approvals.
-   Employee profiles, skills, CVs, and organisational structure.
-   A persistent organisational knowledge and memory layer.
-   AI assistants and specialised agents.
-   **Browser-capable agents that can navigate websites and carry out
    permitted workflows on behalf of users.**
-   Analytics, notifications, integrations, and automations.

The product must not be implemented as a collection of disconnected
clones. Every module shares a common identity, organisation, permission,
search, activity, and knowledge foundation.

### 1.1 Product principles

1.  **One connected workspace:** information created in one module can
    be linked to relevant information elsewhere.
2.  **Context before generation:** AI responses should use relevant,
    permission-filtered company context and show sources.
3.  **Human control:** agents may prepare and propose actions;
    consequential external or irreversible actions require approval.
4.  **Least privilege:** users and agents receive only the access
    required for their task.
5.  **Traceability:** important changes, tool calls, approvals, and
    agent actions are auditable.
6.  **Modular delivery:** build a modular monolith first; extract
    services only when scale or operational needs justify it.
7.  **Privacy by design:** employee and company information must not
    become globally visible merely because it is indexed.

------------------------------------------------------------------------

## 2. Product modules

### 2.1 Organisation and workspace management

Support a hierarchy of parent organisations, subsidiaries, companies,
departments, teams, projects, and members.

Capabilities:

-   Create and manage organisations and subsidiaries.
-   Configure departments, teams, reporting relationships, and
    workspaces.
-   Invite members and manage membership status.
-   Configure organisation-specific settings and integrations.
-   Share selected knowledge across organisations through explicit
    permissions.
-   Provide consolidated parent-level reporting only where authorised.

**Isolation rule:** a parent-child relationship does not automatically
grant unrestricted access to subsidiary data. Cross-organisation access
must be explicit, scoped, and audited.

### 2.2 Employee directory and people intelligence

Employee records provide professional context for collaboration and AI
personalisation.

Employee profile fields may include:

-   Name, work email, profile photo, and contact details.
-   Organisation, department, designation, manager, and employment
    status.
-   Skills, proficiency, specialisation, and professional interests.
-   Education, qualifications, and certifications.
-   Previous experience and professional projects.
-   Current projects, responsibilities, and assigned work.
-   CV, portfolio, certificates, and other approved documents.
-   Explicitly saved work preferences.

Employee onboarding:

1.  Admin creates an employee record or sends an invitation.
2.  Employee accepts the invitation and completes their profile.
3.  Employee uploads a CV or supporting documents.
4.  Document processing extracts candidate fields.
5.  Employee or authorised HR reviewer verifies extracted information.
6.  Approved professional context is made available according to
    permissions.
7.  Workspace access, department membership, and onboarding tasks are
    assigned.

CV extraction must not invent information. Extracted information remains
unverified until confirmed. Sensitive personal attributes must not be
inferred or used for personalisation.

People Intelligence capabilities:

-   Search employees by verified skills and experience.
-   Find relevant project contributors.
-   Identify potential mentors based on professional expertise.
-   Summarise team capability and skill gaps.
-   Recommend possible task assignees using skills, role, availability,
    workload, and project access.

Recommendations are advisory. Managers retain control of assignments. Do
not use protected or sensitive characteristics to rank employees.

### 2.3 Knowledge workspace

A Notion-inspired workspace for organisational knowledge.

Capabilities:

-   Rich-text/block editor.
-   Pages, nested pages, folders, and databases.
-   Markdown import/export.
-   Tables, tags, backlinks, templates, and comments.
-   Collaborative editing where feasible.
-   Page-level permissions.
-   Version history and restore.
-   Search and links to projects, meetings, tasks, people, and
    decisions.

Every page should be eligible for indexing, subject to its access policy
and indexing configuration.

### 2.4 Asset storage

A central document and media library.

Capabilities:

-   Upload, download, preview, and organise files.
-   Folder and project-level organisation.
-   Metadata, tags, ownership, and version history.
-   PDF, DOCX, XLSX, CSV, PPTX, TXT, and common image formats.
-   OCR for scanned documents and images.
-   Document summarisation and content search.
-   Sharing controls and expiring links where appropriate.

Use object storage for file bytes. Store metadata and permissions in
PostgreSQL. Never make private buckets or employee documents public by
default.

### 2.5 Communication

A lightweight Slack-inspired internal communication module.

Capabilities:

-   Organisation, department, and project channels.
-   Direct messages.
-   Threads, reactions, mentions, and attachments.
-   Searchable message history.
-   Notification preferences.
-   Link messages to projects, tasks, tickets, meetings, and knowledge
    pages.

Prioritise a reliable core messaging experience and external Slack
integration over attempting to reproduce every Slack feature in the
first release.

### 2.6 Projects and tasks

Projects provide the operational container for work.

Project capabilities:

-   Project owner, members, department, status, milestones, and dates.
-   Project overview, files, meetings, tasks, tickets, and discussions.
-   Progress summaries and activity timeline.
-   Project-level access controls.

Task fields:

-   Title, description, reporter, primary assignee, collaborators.
-   Organisation, department, project, and parent task.
-   Priority, status, labels, due date, and estimate.
-   Attachments, comments, dependencies, and activity history.
-   Review and approval state.

Suggested statuses: `open`, `in_progress`, `blocked`, `in_review`,
`done`, `cancelled`.

Views:

-   My Tasks.
-   Assigned by Me.
-   Team Tasks.
-   Project Tasks.
-   Overdue.
-   Awaiting Review.
-   Completed.

Support recurring tasks, subtasks, dependencies, reassignment,
submission for review, approval, rejection, and reopening.

Use one primary assignee for clear accountability while allowing
multiple collaborators.

### 2.7 Ticketing and internal requests

A Slack/Helpdesk-inspired internal ticket system.

Ticket categories may include IT, access, infrastructure, HR, design,
development, finance, and general requests.

Ticket fields:

-   Ticket ID, title, description, requester, category, priority.
-   Assigned team and assignee.
-   Organisation, department, project, and related assets.
-   Status, SLA target, attachments, comments, and activity.
-   Internal notes with restricted visibility.

Suggested lifecycle: `open`, `assigned`, `acknowledged`, `in_progress`,
`waiting`, `resolved`, `closed`, `reopened`.

Capabilities:

-   Manual and rule-based assignment.
-   Assignment history.
-   SLA reminders and escalation.
-   Requester updates.
-   Internal notes.
-   Reopen and resolution confirmation.
-   AI categorisation and routing suggestions.

### 2.8 Meetings and minutes

A Meeting Hub for meeting scheduling, records, and follow-up.

Capabilities:

-   Create meetings with agenda, date, participants, department, and
    project.
-   Upload PDF, DOCX, TXT, Markdown, transcripts, and supported audio.
-   Create minutes manually.
-   OCR scanned minutes.
-   Generate summaries, topics, decisions, risks, and action items.
-   Link minutes to projects, people, tasks, tickets, and documents.
-   Search meeting history and track unresolved decisions.

AI-extracted action items must be shown for review before tasks are
created or assigned, unless an organisation has explicitly enabled a
narrowly scoped automatic workflow.

### 2.9 Notifications and calendar

Central notifications should cover task assignments, mentions, ticket
updates, meeting uploads, extracted action items, approvals, deadlines,
and project updates.

Capabilities:

-   In-app notification centre.
-   Real-time delivery.
-   Read/unread state and mark-all-read.
-   Grouping and deduplication.
-   Deep links to the relevant resource.
-   User preferences by category and channel.
-   Email and push notifications as later extensions.
-   Calendar events for meetings, deadlines, and milestones.

Avoid notification overload. Allow users and organisations to control
notification frequency and channels.

### 2.10 Analytics and reporting

Provide dashboards for:

-   Project health and milestone progress.
-   Task completion, overdue work, and workload.
-   Ticket volume, resolution time, and SLA performance.
-   Meeting action-item completion.
-   Knowledge usage and search quality.
-   Agent usage, outcomes, errors, and approval rates.

People analytics must be designed for operational support, not covert
surveillance. Do not infer productivity or performance from message
volume, keystrokes, or other unreliable proxies.

------------------------------------------------------------------------

## 3. Business Second Brain: unified knowledge layer

This is the central differentiator. The system should connect approved
information across pages, files, messages, meetings, projects, tasks,
tickets, and employee professional profiles.

### 3.1 Ingestion pipeline

1.  A source record or file is created, uploaded, or synchronised.
2.  Validate file type, size, malware scan result, and access policy.
3.  Extract text and structured metadata.
4.  Apply OCR where necessary.
5.  Normalise content and identify entities.
6.  Split content into searchable chunks while preserving source
    references.
7.  Generate embeddings.
8.  Index metadata and content in the search system.
9.  Link relevant entities such as people, projects, decisions, and
    tasks.
10. Re-index or remove content when source permissions or content
    change.

Use background jobs for parsing, OCR, embedding, and external
synchronisation. Ingestion must be idempotent and retryable.

### 3.2 Retrieval and memory

Use a hybrid retrieval approach:

-   PostgreSQL full-text search for keyword retrieval.
-   `pgvector` for semantic retrieval.
-   Metadata filters for organisation, resource type, project, date, and
    permission scope.
-   Relational links for people, projects, meetings, and tasks.
-   Optional knowledge graph capabilities as the product matures.

Distinguish:

-   **Source content:** original documents, messages, and records.
-   **Derived knowledge:** summaries, extracted entities, and
    embeddings.
-   **Decision memory:** decisions, rationale, owners, dates, and
    outcomes.
-   **Conversation memory:** user-specific chat history and explicitly
    retained context.

Do not treat an AI-generated summary as more authoritative than its
source. Preserve source IDs and timestamps.

### 3.3 Permission-aware retrieval

Every retrieval request must apply access control before content is
passed to an LLM. Do not rely on prompting the model to ignore
inaccessible data.

The retrieval service must enforce:

-   Organisation and workspace boundaries.
-   Resource-level permissions.
-   Department, project, and channel membership.
-   Employee-document restrictions.
-   Guest and external-sharing rules.
-   Explicit cross-company sharing grants.

The same policy must apply to browser agents, tools, exports, and
generated reports.

------------------------------------------------------------------------

## 4. AI assistant and agent platform

### 4.1 Central AI assistant

A persistent assistant should be available throughout the application.

Example requests:

-   "Summarise the latest decisions from the product meetings."
-   "Find the latest approved sponsorship proposal."
-   "Which projects have overdue tasks?"
-   "Create a task from this meeting action item."
-   "Find employees with verified experience in FastAPI."
-   "Prepare a weekly project report using the latest updates."
-   "Open the vendor portal and check the status of our submitted
    request."

The assistant should support:

-   Natural-language chat.
-   Context-aware retrieval.
-   Source citations and links.
-   Follow-up questions.
-   File and data analysis.
-   Tool and agent routing.
-   Drafting and structured outputs.
-   User-approved actions.
-   Conversation history and feedback.

### 4.2 Agent registry

Agents are registered, configured, permissioned, approved, versioned,
and monitored through a central registry.

Agent configuration:

-   Agent ID and name.
-   Description and intended use.
-   Instructions and model configuration.
-   Available tools.
-   Allowed data sources.
-   Organisation and resource scope.
-   Browser access policy.
-   Execution limits and timeout.
-   Approval requirements.
-   Version, owner, status, and audit history.

Agent lifecycle:

`draft → submitted → reviewed → approved → active → suspended/retired`

Only authorised administrators can approve agents for deployment.
Changes to tools, permissions, browser domains, or action capabilities
should trigger re-review.

### 4.3 Initial specialised agents

-   **Meeting Agent:** summarises minutes and proposes action items.
-   **Project Agent:** tracks milestones, blockers, and updates.
-   **Business Analyst:** analyses operational data and prepares
    reports.
-   **People Intelligence Agent:** searches approved employee
    professional profiles.
-   **Knowledge Agent:** retrieves and connects organisational
    knowledge.
-   **Research Agent:** researches permitted external sources using
    browser access.
-   **Workflow Agent:** executes approved multi-step workflows.

Agents should use a shared orchestration layer rather than calling each
other without controls.

------------------------------------------------------------------------

## 5. Browser-capable AI agents

**Browser access is a core capability, not merely an integration.** An
authorised agent should be able to open websites, navigate pages,
search, read information, fill forms, download files, and complete
permitted browser workflows on behalf of a user.

### 5.1 Browser agent capabilities

Depending on the agent's permissions, it may:

-   Open an approved website.
-   Navigate between pages and follow links.
-   Search a website or portal.
-   Read and summarise web content.
-   Interact with supported page controls.
-   Fill forms using user-provided or authorised business data.
-   Upload and download files.
-   Collect structured information from pages.
-   Perform multi-step workflows.
-   Capture a workflow summary and evidence.
-   Report blockers, errors, or requests for human input.

Example workflows:

-   Research competitor websites and prepare a sourced comparison.
-   Open a vendor portal and retrieve order status.
-   Fill in a draft supplier enquiry.
-   Download an invoice and attach it to the relevant ticket.
-   Open a project management portal and collect milestone updates.
-   Search a public website for market information and prepare a report.

The agent must not bypass authentication, CAPTCHAs, access controls,
paywalls, or website restrictions. It must not perform actions
prohibited by the website or applicable law.

### 5.2 Browser execution architecture

Implement browser execution as a dedicated, isolated service. Do not run
arbitrary browser automation inside the main API process.

Suggested architecture:

``` text
User / AI Assistant
        |
        v
Agent Orchestrator
        |
        v
Policy & Permission Check
        |
        v
Browser Job Queue
        |
        v
Isolated Browser Worker
        |
        +--> Browser Session
        |       |
        |       +--> Navigate
        |       +--> Read page
        |       +--> Click / type
        |       +--> Upload / download
        |       +--> Capture evidence
        |
        v
Action / Evidence Log
        |
        v
Approval Gate (when required)
        |
        v
Result returned to user
```

Possible implementation:

-   Playwright for browser automation.
-   Isolated containers or equivalent ephemeral execution environments.
-   Dedicated browser worker queue.
-   Short-lived sessions and controlled downloads.
-   Encrypted credential/token vault.
-   Domain allowlists and URL validation.
-   Central policy enforcement.
-   Browser screenshots and structured action logs.

### 5.3 Browser permission levels

Define browser permissions explicitly for each agent and organisation.

  -----------------------------------------------------------------------
  Level                   Permission              Example
  ----------------------- ----------------------- -----------------------
  B0                      No browser              Internal knowledge-only
                                                  agent

  B1                      Read-only browsing      Research public pages

  B2                      Interactive browsing    Search, navigate, and
                                                  fill non-submitted
                                                  forms

  B3                      Approved execution      Submit forms or perform
                                                  authorised changes
                                                  after approval

  B4                      Restricted automation   Pre-approved recurring
                                                  workflows within a
                                                  narrow scope
  -----------------------------------------------------------------------

Default to B1. Grant higher levels only when necessary.

### 5.4 Human approval rules

The agent may autonomously read approved public information and prepare
drafts within its permitted scope.

Require explicit approval before:

-   Sending an email or message externally.
-   Submitting a form that creates a commitment or changes an external
    record.
-   Making purchases or payments.
-   Creating, modifying, or deleting important external records.
-   Uploading confidential company information to an external service.
-   Changing account, security, or access settings.
-   Performing irreversible or high-impact actions.

Approval must be bound to the exact action, target, and relevant data.
If the action changes after approval, request approval again.

### 5.5 Browser security requirements

-   Treat website content as untrusted data, never as system
    instructions.
-   Defend against prompt injection in page content, downloaded files,
    and documents.
-   Keep system instructions and secrets separate from browser-visible
    content.
-   Use domain allowlists and block local/private network destinations
    unless explicitly authorised.
-   Prevent SSRF and unsafe URL redirects.
-   Do not expose cookies, session tokens, passwords, or API keys to the
    LLM.
-   Use per-user or per-organisation credential scopes.
-   Encrypt secrets at rest and redact them from logs.
-   Isolate browser sessions between users and jobs.
-   Limit runtime, navigation count, file size, and network access.
-   Scan downloads and restrict executable file handling.
-   Maintain an audit trail of navigation and actions.
-   Provide a stop/cancel control for active browser jobs.

The browser worker should return structured observations and results to
the orchestrator. It should not decide its own permission scope.

### 5.6 Browser job states

Suggested lifecycle:

`queued → policy_check → running → awaiting_approval → running → completed`

Alternative terminal states: `failed`, `cancelled`, `expired`,
`blocked`.

Persist:

-   Requesting user and organisation.
-   Agent and agent version.
-   Job goal and permitted domains.
-   Browser permission level.
-   Start and finish timestamps.
-   Actions and results.
-   Approval requests and decisions.
-   Evidence references.
-   Errors and termination reason.

Do not persist full page contents or screenshots indefinitely by
default. Apply retention policies and redact sensitive information.

------------------------------------------------------------------------

## 6. Integrations and connectivity

Create a connector framework for external services.

Initial integration candidates:

  Integration       Use
  ----------------- ---------------------------------------
  Google Drive      Import and search business documents
  Slack             Import approved channels and messages
  Notion            Import knowledge pages
  Google Calendar   Meetings and schedules
  Gmail             Approved email context and workflows
  GitHub            Repository and issue context
  Microsoft Teams   Communication and meetings

Connector responsibilities:

-   OAuth and secure token storage.
-   Initial and incremental sync.
-   Webhooks where available.
-   Cursor/checkpoint management.
-   Retry and deduplication.
-   Permission mapping.
-   Sync status and audit logs.
-   Disconnect and data deletion handling.

Start with read-only imports. Add write-back capabilities only after the
connector has scoped permissions, approval handling, and audit support.

Browser automation is not a replacement for an official API when a
supported, permitted API is available. Prefer APIs for reliable
structured operations; use browser access for workflows that genuinely
require a browser.

------------------------------------------------------------------------

## 7. Technical architecture

### 7.1 Recommended stack

  -----------------------------------------------------------------------
  Layer                               Recommended technology
  ----------------------------------- -----------------------------------
  Frontend                            Next.js, React, TypeScript

  UI                                  Shared component system; Bootstrap
                                      if consistent with the existing
                                      product

  Main API                            Node.js with Hono

  AI services                         Python with FastAPI

  Database                            PostgreSQL / Supabase

  Authentication                      Supabase Auth

  Authorisation                       PostgreSQL RLS plus application
                                      policy service

  File storage                        Supabase Storage or S3-compatible
                                      object storage

  Vector search                       pgvector

  Background jobs                     Redis and BullMQ

  Browser automation                  Playwright in isolated workers

  Realtime                            Supabase Realtime or WebSockets

  Document processing                 PyMuPDF, python-docx, openpyxl, OCR
                                      tooling

  Deployment                          Docker; deployable on managed cloud
                                      or VPS
  -----------------------------------------------------------------------

Keep the first version as a modular monolith plus dedicated asynchronous
workers. Avoid premature microservices.

### 7.2 Monorepo structure

``` text
bizcontext-ai/
├── apps/
│   ├── web/                    # Next.js application
│   ├── api/                    # Hono API
│   ├── ai-engine/              # FastAPI: RAG, extraction, orchestration
│   └── browser-worker/         # Isolated Playwright execution
│
├── packages/
│   ├── ui/
│   ├── database/
│   ├── auth/
│   ├── permissions/
│   ├── types/
│   ├── agent-sdk/
│   ├── integrations/
│   └── validation/
│
├── modules/
│   ├── organisations/
│   ├── employees/
│   ├── knowledge/
│   ├── storage/
│   ├── communication/
│   ├── projects/
│   ├── tasks/
│   ├── tickets/
│   ├── meetings/
│   ├── notifications/
│   ├── agents/
│   ├── browser-jobs/
│   ├── analytics/
│   └── administration/
│
├── workers/
│   ├── ingestion/
│   ├── embeddings/
│   ├── integrations-sync/
│   ├── notifications/
│   └── scheduled-jobs/
│
├── infrastructure/
│   ├── docker/
│   ├── database/
│   ├── deployment/
│   └── monitoring/
│
└── docs/
    ├── architecture/
    ├── api/
    ├── security/
    └── implementation/
```

Each module should own its routes, service layer, validation, data
access, and tests. Shared permission checks must be reusable and
centrally maintained.

------------------------------------------------------------------------

## 8. Database design

Use PostgreSQL with organisation-scoped records and explicit
relationships.

### 8.1 Core organisation and people tables

-   `organisations`
-   `organisation_members`
-   `departments`
-   `teams`
-   `profiles`
-   `employee_profiles`
-   `employee_documents`
-   `employee_education`
-   `employee_experience`
-   `employee_skills`
-   `employee_certifications`
-   `employee_projects`
-   `employee_preferences`
-   `employee_invitations`
-   `role_definitions`
-   `permissions`
-   `role_permissions`
-   `member_roles`

### 8.2 Knowledge and asset tables

-   `pages`
-   `page_blocks`
-   `page_permissions`
-   `page_versions`
-   `files`
-   `file_versions`
-   `file_permissions`
-   `knowledge_sources`
-   `knowledge_chunks`
-   `embeddings`
-   `entities`
-   `entity_relationships`
-   `decisions`

### 8.3 Work and collaboration tables

-   `projects`
-   `project_members`
-   `project_milestones`
-   `tasks`
-   `task_assignees`
-   `task_comments`
-   `task_attachments`
-   `task_dependencies`
-   `task_activity`
-   `tickets`
-   `ticket_assignments`
-   `ticket_comments`
-   `ticket_activity`
-   `meetings`
-   `meeting_participants`
-   `meeting_minutes`
-   `meeting_transcripts`
-   `meeting_decisions`
-   `channels`
-   `channel_members`
-   `messages`
-   `message_reactions`
-   `announcements`
-   `calendar_events`
-   `notifications`
-   `notification_preferences`
-   `approval_requests`
-   `approval_history`

### 8.4 AI, agent, and browser tables

-   `agents`
-   `agent_versions`
-   `agent_tools`
-   `agent_permissions`
-   `agent_approvals`
-   `agent_executions`
-   `agent_execution_events`
-   `conversations`
-   `conversation_messages`
-   `memory_records`
-   `integrations`
-   `integration_credentials`
-   `integration_sync_runs`
-   `browser_jobs`
-   `browser_job_events`
-   `browser_approvals`
-   `browser_artifacts`
-   `audit_logs`

Use foreign keys, indexes, unique constraints, and explicit deletion
policies. Avoid storing duplicate employee identity fields when a
profile relationship is sufficient.

### 8.5 Common metadata

Where relevant, records should include:

-   `id`
-   `organisation_id`
-   `created_by`
-   `created_at`
-   `updated_at`
-   `visibility`
-   `status`
-   `deleted_at` for soft deletion where appropriate

Do not add generic fields blindly to every table. Define ownership and
permission semantics for each resource type.

------------------------------------------------------------------------

## 9. API and service boundaries

Example API groups:

``` text
/api/v1/auth
/api/v1/organisations
/api/v1/departments
/api/v1/employees
/api/v1/employee-documents
/api/v1/knowledge/pages
/api/v1/files
/api/v1/projects
/api/v1/tasks
/api/v1/tickets
/api/v1/meetings
/api/v1/notifications
/api/v1/agents
/api/v1/agent-executions
/api/v1/browser-jobs
/api/v1/integrations
/api/v1/search
/api/v1/analytics
```

Use consistent pagination, filtering, validation, error formats, and
idempotency keys for retryable actions.

The frontend must never be trusted to enforce permissions. Every API
operation must authorise the requesting user and resource on the server.

------------------------------------------------------------------------

## 10. Key end-to-end workflows

### 10.1 Meeting minutes to task workflow

1.  User uploads minutes.
2.  File is stored privately.
3.  Ingestion extracts text and metadata.
4.  Meeting Agent creates a summary and proposed decisions/action items.
5.  User reviews extracted items.
6.  Approved action items become tasks.
7.  Task assignees and due dates are confirmed.
8.  Notifications are sent.
9.  Tasks link back to the meeting and source passage.
10. Task completion updates the meeting follow-up view.

### 10.2 Employee onboarding workflow

1.  Admin creates an invitation with organisation and role.
2.  Employee accepts and authenticates.
3.  Employee completes their profile and uploads a CV.
4.  CV is parsed into proposed professional fields.
5.  Employee or HR verifies the extracted data.
6.  Profile and skills are saved with provenance.
7.  Access is granted to approved department and project resources.
8.  Onboarding tasks and relevant knowledge are assigned.

### 10.3 Ticket workflow

1.  Employee creates a ticket.
2.  Routing rules suggest a department or team.
3.  Authorised lead assigns an owner.
4.  Assignee is notified.
5.  Updates and discussion are recorded.
6.  SLA monitoring checks deadlines.
7.  Assignee resolves the ticket.
8.  Requester confirms or reopens it.
9.  Ticket history becomes searchable according to permissions.

### 10.4 Browser-agent workflow

1.  User describes a goal.
2.  Orchestrator identifies the agent and required tools.
3.  Policy service checks user, organisation, agent, domain, and action
    permissions.
4.  Browser job is created with a bounded scope.
5.  Isolated worker executes permitted navigation and interactions.
6.  Worker records structured results and evidence.
7.  If a consequential action is required, execution pauses for
    approval.
8.  Approval is checked against the exact action and target.
9.  Worker completes the approved action.
10. Result and audit trail are returned to the user.

------------------------------------------------------------------------

## 11. Security, privacy, and governance

Security is a foundational requirement, not a later enhancement.

### Identity and access

-   Use secure authentication and session management.
-   Enforce organisation isolation with PostgreSQL RLS.
-   Implement role-based access control and resource-level permissions.
-   Support project, department, channel, page, file, and
    employee-document scopes.
-   Review cross-company sharing explicitly.
-   Revalidate permissions during AI retrieval and tool execution.

### AI safety

-   Treat retrieved documents, messages, and web pages as untrusted
    input.
-   Defend against prompt injection.
-   Keep tool permissions outside model control.
-   Validate tool arguments against strict schemas.
-   Apply output validation before executing actions.
-   Limit agent loops, tool calls, tokens, and execution time.
-   Require approval for high-impact actions.
-   Record agent decisions and tool invocations.

### Browser safety

-   Run browsers in isolated, disposable environments.
-   Use domain allowlists and safe URL resolution.
-   Block private-network and local-address access unless explicitly
    authorised.
-   Prevent SSRF, unsafe redirects, and credential leakage.
-   Keep secrets out of prompts, page content, and logs.
-   Separate browser sessions between users and jobs.
-   Scan and restrict downloaded files.
-   Apply quotas, timeouts, and cancellation.
-   Never bypass authentication or website security controls.

### Employee data privacy

-   Restrict CVs and employment records to authorised roles.
-   Let employees review and correct their profile information.
-   Keep AI-extracted data marked as unverified until confirmed.
-   Do not infer sensitive personal attributes.
-   Do not use message volume or activity counts as a proxy for employee
    worth or performance.
-   Define retention, export, correction, and deletion processes.
-   Audit access to sensitive employee documents.

### Auditability

Record:

-   Actor and organisation.
-   Resource and operation.
-   Timestamp and outcome.
-   Agent and version, if applicable.
-   Tool and action details.
-   Approval identity and decision.
-   Relevant evidence references.

Redact credentials and sensitive payloads from logs.

------------------------------------------------------------------------

## 12. Implementation roadmap

Build in phases. Each phase should result in a working, testable
increment.

### Phase 0 --- Foundation

-   Repository and development environments.
-   Authentication and session handling.
-   Organisation hierarchy.
-   Departments and membership.
-   RBAC, RLS, and audit logs.
-   Shared UI shell and navigation.
-   Database migration and test setup.

**Exit criteria:** users can securely access only their authorised
organisation and workspace.

### Phase 1 --- People and core workspace

-   Employee directory and profiles.
-   Invitation and onboarding.
-   CV upload and parsing.
-   Verification of extracted profile information.
-   Knowledge pages and editor.
-   Asset storage and previews.
-   Basic dashboard.

**Exit criteria:** employees and authorised company documents can be
managed securely.

### Phase 2 --- Organisational knowledge and chatbot

-   Document extraction and OCR.
-   Chunking and embeddings.
-   Hybrid search.
-   Permission-aware retrieval.
-   Source citations.
-   Chat history.
-   Employee and project context retrieval.

**Exit criteria:** the assistant answers questions from approved company
sources with verifiable citations and no permission leakage.

### Phase 3 --- Operational collaboration

-   Projects and milestones.
-   Tasks, collaborators, comments, and review.
-   Ticketing and assignment.
-   Meeting records and minutes upload.
-   AI meeting summaries and proposed action items.
-   Notifications and calendar.

**Exit criteria:** a meeting can generate reviewed tasks, assigned
members receive notifications, and work can be tracked to completion.

### Phase 4 --- Agent platform

-   Agent registry and versioning.
-   Tool definitions and validation.
-   Agent permissions and approval.
-   Execution queue and monitoring.
-   Meeting, Project, Business Analyst, and Knowledge agents.
-   Agent evaluation and feedback.

**Exit criteria:** authorised agents can complete bounded internal
workflows with traceable tool use.

### Phase 5 --- Browser agents

-   Isolated Playwright workers.
-   Browser job queue and lifecycle.
-   Domain and action policies.
-   Read-only research workflows.
-   Interactive browsing and form preparation.
-   Human approval for consequential actions.
-   Evidence capture and audit logs.
-   Session isolation, secrets management, and security testing.

**Exit criteria:** an authorised agent can complete a safe, bounded
browser workflow and provide evidence, while blocked actions and
approval requirements are enforced.

### Phase 6 --- Integrations

-   Connector framework.
-   Google Drive, Slack, and Notion read-only sync.
-   Calendar and email integrations as approved.
-   Incremental sync, webhooks, retries, and permission mapping.
-   Connector health dashboard.

**Exit criteria:** external information syncs reliably and retains
source permissions.

### Phase 7 --- Advanced intelligence

-   Knowledge graph and entity resolution.
-   Decision history and outcome tracking.
-   People Intelligence and skill matching.
-   Workload insights.
-   Cross-project analytics.
-   Workflow automation.
-   Multi-agent collaboration.
-   Controlled cross-company reporting.

**Exit criteria:** the platform can connect knowledge, people, and work
across approved scopes and provide useful operational insights.

------------------------------------------------------------------------

## 13. MVP scope

Do not attempt to build every module before demonstrating the core
value.

### Must-have for first release

-   One parent organisation and one company workspace.
-   Authentication and secure roles.
-   Employee directory and profile.
-   CV upload and reviewed extraction.
-   Knowledge pages.
-   File upload and private storage.
-   Document indexing and hybrid search.
-   Permission-aware AI chatbot with citations.
-   Projects and tasks.
-   Meeting minutes upload and AI action-item extraction.
-   Task assignment and notifications.
-   Basic ticketing.
-   Two or three specialised agents.
-   Browser agent with read-only research and bounded navigation.
-   Admin approval for consequential browser actions.
-   Agent and browser execution logs.

### Defer until later

-   Full Slack replacement.
-   Advanced collaborative editing.
-   Complex workflow builder.
-   Large-scale multi-agent autonomy.
-   Broad cross-company analytics.
-   Fully autonomous external write operations.
-   Sophisticated performance scoring.
-   Extensive third-party connector catalogue.

------------------------------------------------------------------------

## 14. Testing and evaluation

### Functional tests

-   Organisation creation and membership.
-   Employee invitation and CV extraction.
-   Page and file permissions.
-   Task and ticket assignment.
-   Meeting extraction and task creation.
-   Notification delivery.
-   Agent registration and approval.
-   Browser navigation and job cancellation.

### Security tests

-   Cross-organisation data isolation.
-   RLS policy coverage.
-   Employee-document access restrictions.
-   Permission-filtered RAG.
-   Prompt injection in uploaded files and web pages.
-   Browser SSRF and redirect protection.
-   Credential and secret redaction.
-   Approval bypass attempts.
-   Session isolation between browser jobs.

### AI quality tests

-   Retrieval relevance and citation correctness.
-   Accuracy of meeting summaries.
-   Action-item extraction precision and recall.
-   Employee skill extraction accuracy.
-   Correct tool selection.
-   Appropriate refusal when permissions are insufficient.
-   Browser task completion and evidence quality.

### Product success metrics

-   Time to find relevant company information.
-   Percentage of AI answers supported by valid sources.
-   Meeting action items correctly extracted and confirmed.
-   Task and ticket resolution time.
-   Successful onboarding completion.
-   Browser workflow completion rate.
-   Human approval and rejection rates.
-   User-reported usefulness and trust.

Do not evaluate the product only by the number of AI interactions.
Measure whether it improves real workflows.

------------------------------------------------------------------------

## 15. Engineering conventions

-   TypeScript for frontend and main API.
-   Python for AI and document-processing services.
-   Shared schemas and validation at service boundaries.
-   Database migrations committed to version control.
-   Automated tests for permissions and critical workflows.
-   Structured logs, metrics, and error tracking.
-   Background processing for expensive or long-running jobs.
-   Idempotent job handlers and retry policies.
-   API versioning.
-   Environment-based secrets; never commit credentials.
-   Feature flags for incomplete modules.
-   Documented setup, architecture, and deployment procedures.

Every feature should include: 1. User story and acceptance criteria. 2.
Data model and permission design. 3. API contract. 4. UI states,
including loading and failure. 5. Audit and notification behaviour. 6.
Unit and integration tests. 7. Documentation.

------------------------------------------------------------------------

## 16. Final product definition

BizContext AI is a connected organisational intelligence platform with
four central responsibilities:

1.  **Remember the business:** retain and connect approved documents,
    knowledge, conversations, decisions, and history.
2.  **Understand the people:** maintain professional context, skills,
    roles, and responsibilities with appropriate privacy controls.
3.  **Coordinate the work:** manage meetings, tasks, tickets, projects,
    approvals, and notifications.
4.  **Act with permission:** use AI agents and browser automation to
    research, navigate, prepare, and execute authorised workflows under
    clear policy and human oversight.

**Product promise:** One intelligent workspace that knows the business,
understands its people, remembers its work, and helps the organisation
move forward.

The defining principle is that BizContext AI is not simply a chatbot
attached to a dashboard. It is a permission-aware organisational memory
and execution platform in which people, knowledge, work, tools, and
browser-capable agents operate together.
