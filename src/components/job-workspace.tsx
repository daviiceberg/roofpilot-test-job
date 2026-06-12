"use client";

import { AppShell } from "@/components/app-shell";
import {
  defaultSecondaryContact,
  emailTemplates,
  getCommAlerts,
  initialMaterialOrders,
  initialSmsThread,
  initialTimeline,
  initialWorkOrders,
  matchesTimelineFilter,
  mockEmailThread,
  messageTemplates,
  nowLabel,
  primaryContact,
  timelineMeta,
  workflowStages,
  type CommAlerts,
  type ComposerMode,
  type Contact,
  type EmailRecord,
  type MaterialOrder,
  type MaterialOrderStatus,
  type SmsMessage,
  type TaskItem,
  type TaskPriority,
  type AiAction,
  type TimelineFilter,
  type TimelineItem,
  type WorkOrder,
  type WorkOrderStatus
} from "@/lib/job-data";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  Ruler,
  FileText,
  FilePlus2,
  Flame,
  Image,
  Loader2,
  Mail,
  MessageSquare,
  PackageCheck,
  Paperclip,
  Pencil,
  Phone,
  PhoneMissed,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  StickyNote,
  UserCircle,
  X,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ContentTab = "overview" | "activity" | "measurements" | "proposals" | "documents" | "photos" | "invoices" | "production";

export function JobWorkspace() {
  const [hubMode, setHubMode] = useState<ComposerMode>("call");
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("all");
  const [toast, setToast] = useState("");
  const [errorBanner, setErrorBanner] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([defaultSecondaryContact]);
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>(initialMaterialOrders);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [jobLabels] = useState<string[]>(["Garage"]);
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [jobIndex, setJobIndex] = useState(1);
  const jobTotal = 11;

  const [missedCallCount, setMissedCallCount] = useState(1);
  const [unansweredSmsCount, setUnansweredSmsCount] = useState(1);
  const [heroModal, setHeroModal] = useState<
    | { type: "call" | "email" | "sms"; contact: Contact }
    | { type: "task" }
    | { type: "task-create" }
    | null
  >(null);
  const [smsThread, setSmsThread] = useState<SmsMessage[]>(initialSmsThread);
  const [dismissedAlertTypes, setDismissedAlertTypes] = useState<Set<string>>(new Set());
  const [highlightTaskId, setHighlightTaskId] = useState<number | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 4, title: "Send updated estimate to adjuster", priority: "high", dueDate: "Jun 9, 2026", tags: ["Estimate", "Adjuster"], isOverdue: true },
    { id: 1, title: "Review estimate with Hannah", priority: "high", dueDate: "Jun 12, 2026", tags: ["Estimate", "Homeowner"] },
    { id: 2, title: "Confirm material selections", priority: "medium", dueDate: "Jun 15, 2026", tags: ["Materials"] },
    { id: 3, title: "Send proposal once approved", priority: "medium", dueDate: "Jun 18, 2026", tags: ["Proposal"] },
  ]);

  const displayedMissedCalls = dismissedAlertTypes.has("missed_call") ? 0 : missedCallCount;
  const displayedUnansweredSms = dismissedAlertTypes.has("sms") ? 0 : unansweredSmsCount;
  const displayedOverdueTasks = dismissedAlertTypes.has("task_overdue") ? 0 : tasks.filter(t => t.isOverdue).length;
  const commAlerts = getCommAlerts({
    missedCalls: displayedMissedCalls,
    unansweredSms: displayedUnansweredSms,
    overdueTasks: displayedOverdueTasks
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") setJobIndex((i) => Math.max(1, i - 1));
      if (e.key === "ArrowRight") setJobIndex((i) => Math.min(jobTotal, i + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filteredTimeline = useMemo(
    () => timeline.filter((item) => matchesTimelineFilter(item, timelineFilter)),
    [timeline, timelineFilter]
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function routeToHub(mode: ComposerMode) {
    if (activeTab !== "overview" && activeTab !== "activity") {
      setActiveTab("overview");
    }
    setHubMode(mode);
    window.setTimeout(() => {
      const hub = document.querySelector(".comm-hub");
      if (hub) {
        hub.scrollIntoView({ behavior: "smooth", block: "start" });
        const firstInput = hub.querySelector<HTMLElement>("input, textarea, .hub-mode-btn.active");
        firstInput?.focus();
      }
    }, 80);
  }

  function completeTask(taskId: number, taskTitle: string) {
    const wasOverdue = tasks.find(t => t.id === taskId)?.isOverdue;
    setTasks((items) => items.filter((task) => task.id !== taskId));
    setTimeline((items) => [
      {
        id: Date.now(),
        type: wasOverdue ? "task_completed" : "task",
        title: "Task completed",
        detail: taskTitle,
        time: nowLabel(),
        rep: "Dana Kim",
        status: "completed"
      },
      ...items
    ]);
    showToast("Task completed");
  }

  function addContact(contact: Contact) {
    const exists = contacts.some(
      (c) => c.email === contact.email && c.firstName === contact.firstName && c.lastName === contact.lastName
    );
    if (!exists) setContacts((items) => [...items, contact]);
    setIsDrawerOpen(false);
    showToast("Contact added");
    setTimeline((items) => [
      {
        id: Date.now(),
        type: "contact",
        title: "Contact added",
        detail: `${contact.firstName} ${contact.lastName}, ${contact.relationship}`,
        time: nowLabel()
      },
      ...items
    ]);
  }

  function dismissAlert(type: string) {
    setDismissedAlertTypes(prev => new Set([...prev, type]));
  }

  function handleHubSendNote(noteTitle: string, detail: string) {
    setTimeline(prev => [{
      id: Date.now(),
      type: "note",
      title: "Note added",
      detail: noteTitle ? `${noteTitle}: ${detail}` : detail,
      time: nowLabel(),
      rep: "Dana Kim"
    }, ...prev]);
    showToast("Note saved");
  }

  function handleHubSendEmail(subject: string, message: string) {
    setTimeline(prev => [{
      id: Date.now(),
      type: "email",
      title: "Email sent",
      detail: subject || message.slice(0, 80),
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim"
    }, ...prev]);
    showToast("Email sent to Hannah Weiss");
  }

  function handleHubSendSms(text: string) {
    const newMsg: SmsMessage = { id: Date.now(), direction: "out", text, time: nowLabel(), rep: "Dana Kim" };
    setSmsThread(prev => [...prev, newMsg]);
    setUnansweredSmsCount(0);
    setTimeline(prev => [{
      id: Date.now(),
      type: "sms_out",
      title: "SMS sent",
      detail: text.slice(0, 100) + (text.length > 100 ? "…" : ""),
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim",
      threadId: "main-thread"
    }, ...prev]);
    showToast("Message sent");
  }

  function handleHubCallEnd(durationLabel: string, wasCallback: boolean) {
    setTimeline(prev => [{
      id: Date.now(),
      type: "call",
      title: "Call made — Hannah Weiss",
      detail: `Outbound · ${durationLabel} · Dana Kim`,
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim",
      durationLabel,
      status: "answered"
    }, ...prev]);
    if (wasCallback) setMissedCallCount(0);
    showToast("Call logged to activity");
  }

  function handleHubCreateTask(task: Omit<TaskItem, "id">) {
    const newTask: TaskItem = { id: Date.now(), ...task };
    setTasks(prev => [...prev, newTask]);
    setTimeline(prev => [{
      id: Date.now(),
      type: "task",
      title: "Task created",
      detail: task.title,
      time: nowLabel(),
      rep: "Dana Kim"
    }, ...prev]);
    showToast("Task created");
  }

  function handleHeroCallAction(contact: Contact) {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    setHeroModal(null);
    setMissedCallCount(0);
    setTimeline(prev => [{
      id: Date.now(),
      type: "call",
      title: `Outbound call — ${fullName}`,
      detail: `Call initiated via Communication Quick Actions · Dana Kim`,
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim",
      durationLabel: "—",
      status: "answered"
    }, ...prev]);
    showToast("Call logged successfully");
  }

  function handleHeroEmailAction(contact: Contact, subject: string, message: string) {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    setHeroModal(null);
    setTimeline(prev => [{
      id: Date.now(),
      type: "email",
      title: `Email sent — ${fullName}`,
      detail: subject || message.slice(0, 80),
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim"
    }, ...prev]);
    showToast("Email sent successfully");
  }

  function handleHeroSmsAction(contact: Contact, message: string) {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    setHeroModal(null);
    setUnansweredSmsCount(0);
    setTimeline(prev => [{
      id: Date.now(),
      type: "sms_out",
      title: `SMS sent — ${fullName}`,
      detail: message.slice(0, 100) + (message.length > 100 ? "…" : ""),
      time: nowLabel(),
      direction: "out",
      rep: "Dana Kim",
      threadId: "main-thread"
    }, ...prev]);
    showToast("SMS sent successfully");
  }

  function handleHeroTaskComplete(taskId: number, taskTitle: string) {
    completeTask(taskId, taskTitle);
    const remaining = tasks.filter(t => t.isOverdue && t.id !== taskId);
    if (remaining.length === 0) setHeroModal(null);
  }

  function handleAlertAction(type: string) {
    if (type === "call") setHeroModal({ type: "call", contact: primaryContact });
    else if (type === "sms") setHeroModal({ type: "sms", contact: primaryContact });
    else if (type === "task") setHeroModal({ type: "task" });
  }

  return (
    <AppShell
      jobIndex={jobIndex}
      jobTotal={jobTotal}
      onPrev={() => setJobIndex((i) => Math.max(1, i - 1))}
      onNext={() => setJobIndex((i) => Math.min(jobTotal, i + 1))}
      alertCount={commAlerts.total}
      alerts={commAlerts}
      onAlertAction={handleAlertAction}
      onDismissAlert={dismissAlert}
    >
      <main className="workspace">
        {errorBanner ? (
          <div className="error-banner" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{errorBanner}</span>
            <button type="button" className="button ghost compact" onClick={() => setErrorBanner("")}>
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        ) : null}

        <JobHero
          onCreateProposal={() => showToast("Proposal draft started")}
          labels={jobLabels}
          onCall={() => setHeroModal({ type: "call", contact: primaryContact })}
          onEmail={() => setHeroModal({ type: "email", contact: primaryContact })}
          onSms={() => setHeroModal({ type: "sms", contact: primaryContact })}
          onTask={() => setHeroModal({ type: "task-create" })}
        />

        <ContentTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activityCount={timeline.length}
          documentCount={5}
          proposalCount={2}
          productionCount={materialOrders.length + workOrders.length}
          alertsTotal={commAlerts.total}
        />

        <section className="layout-shell">
          <div className="left-rail">
            {activeTab === "overview" && (
              <>
                <JobInfoCard />
                <FinancialSummary />
                <CommunicationHub
                  mode={hubMode}
                  setMode={setHubMode}
                  alerts={commAlerts}
                  smsThread={smsThread}
                  onSendNote={handleHubSendNote}
                  onSendEmail={handleHubSendEmail}
                  onSendSms={handleHubSendSms}
                  onCallEnd={handleHubCallEnd}
                  onCreateTask={handleHubCreateTask}
                />
              </>
            )}
            {activeTab === "activity" && (
              <>
                <CommunicationHub
                  mode={hubMode}
                  setMode={setHubMode}
                  alerts={commAlerts}
                  smsThread={smsThread}
                  onSendNote={handleHubSendNote}
                  onSendEmail={handleHubSendEmail}
                  onSendSms={handleHubSendSms}
                  onCallEnd={handleHubCallEnd}
                  onCreateTask={handleHubCreateTask}
                />
                <ActivityTimeline
                  timeline={filteredTimeline}
                  filter={timelineFilter}
                  onFilterChange={setTimelineFilter}
                  onRouteToHub={routeToHub}
                />
              </>
            )}
            {activeTab === "measurements" && <MeasurementsView />}
            {activeTab === "documents" && <DocumentsView />}
            {activeTab === "photos" && <PhotosView />}
            {activeTab === "proposals" && (
              <ProposalsView onCreateProposal={() => showToast("Proposal draft started")} />
            )}
            {activeTab === "invoices" && <InvoicesView />}
            {activeTab === "production" && (
              <ProductionView
                materialOrders={materialOrders}
                setMaterialOrders={setMaterialOrders}
                workOrders={workOrders}
                setWorkOrders={setWorkOrders}
              />
            )}
          </div>

          <aside className="right-rail">
            <AiRecommendations
              onAction={(action) => {
                if (action === "proposal") showToast("Proposal draft started");
                if (action === "message") routeToHub("message");
                if (action === "notes") routeToHub("note");
              }}
            />
            <TasksCard
              tasks={tasks}
              completeTask={completeTask}
              onAddTask={() => routeToHub("task")}
              highlightTaskId={highlightTaskId}
            />
            <ContactsCard
              contacts={contacts}
              openDrawer={() => setIsDrawerOpen(true)}
              onCall={c => setHeroModal({ type: "call", contact: c })}
              onEmail={c => setHeroModal({ type: "email", contact: c })}
              onSms={c => setHeroModal({ type: "sms", contact: c })}
              onViewHistory={() => setActiveTab("activity")}
            />
            <CollapsibleCard
              title="Insurance"
              subtitle="State Farm · $1,500 ded. · CLM-582741"
              className="insurance-card flow-order-10"
              defaultOpen={false}
            >
              <InsuranceFields />
            </CollapsibleCard>
            <TagsCard />
          </aside>
        </section>

        <MobileChrome hubMode={hubMode} onRouteToHub={routeToHub} />

        {toast ? (
          <div className="toast toast-top" role="status">
            <Check size={16} aria-hidden="true" />
            {toast}
          </div>
        ) : null}

        {isDrawerOpen && (
          <ContactDrawer onClose={() => setIsDrawerOpen(false)} onSave={addContact} />
        )}

        {heroModal?.type === "task" && (
          <HeroTaskModal
            tasks={tasks.filter(t => t.isOverdue)}
            onClose={() => setHeroModal(null)}
            onComplete={handleHeroTaskComplete}
          />
        )}
        {heroModal?.type === "task-create" && (
          <HeroTaskCreateModal
            onClose={() => setHeroModal(null)}
            onCreate={handleHubCreateTask}
          />
        )}
        {heroModal?.type === "call" && (
          <HeroCallModal contact={heroModal.contact} onClose={() => setHeroModal(null)} onCall={() => handleHeroCallAction(heroModal.contact)} />
        )}
        {heroModal?.type === "email" && (
          <HeroEmailModal contact={heroModal.contact} onClose={() => setHeroModal(null)} onSend={(s, b) => handleHeroEmailAction(heroModal.contact, s, b)} />
        )}
        {heroModal?.type === "sms" && (
          <HeroSmsModal contact={heroModal.contact} onClose={() => setHeroModal(null)} onSend={(m) => handleHeroSmsAction(heroModal.contact, m)} />
        )}
      </main>
    </AppShell>
  );
}

/* ── Financial Summary ─────────────────────────────────────────── */
function FinancialSummary() {
  const items: { label: string; value: string; status: string; statusClass: string }[] = [
    { label: "Estimate", value: "$18,450", status: "In Review",   statusClass: "fin-status-review" },
    { label: "Proposal", value: "—",       status: "Not issued",  statusClass: "fin-status-pending" },
    { label: "Invoice",  value: "—",       status: "Not created", statusClass: "fin-status-pending" },
  ];

  return (
    <section className="surface fin-summary">
      <div className="panel-head">
        <h2 className="section-title">Financial Summary</h2>
      </div>
      <div className="fin-rows">
        {items.map((item) => (
          <div key={item.label} className="fin-row">
            <span className="fin-label text-secondary">{item.label}</span>
            <div className="fin-right">
              {item.value !== "—" && <strong className="fin-value">{item.value}</strong>}
              <span className={`fin-status ${item.statusClass}`}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Communication Hub ─────────────────────────────────────────── */
function CommunicationHub({
  mode,
  setMode,
  alerts,
  smsThread,
  onSendNote,
  onSendEmail,
  onSendSms,
  onCallEnd,
  onCreateTask
}: {
  mode: ComposerMode;
  setMode: (m: ComposerMode) => void;
  alerts: CommAlerts;
  smsThread: SmsMessage[];
  onSendNote: (title: string, detail: string) => void;
  onSendEmail: (subject: string, message: string) => void;
  onSendSms: (text: string) => void;
  onCallEnd: (duration: string, wasCallback: boolean) => void;
  onCreateTask: (task: Omit<TaskItem, "id">) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hubSuccess, setHubSuccess] = useState("");

  // Email state
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>("email-deductible-reply");
  const [sentEmails, setSentEmails] = useState<EmailRecord[]>([]);
  const [emailReplied, setEmailReplied] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("Proposal Follow-up");
  const [emailSubject, setEmailSubject] = useState("Re: Your roof estimate is ready — $18,450");
  const [emailBody, setEmailBody] = useState("");

  // SMS state
  const [smsText, setSmsText] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const smsBottomRef = useRef<HTMLDivElement>(null);

  // Call state
  const [callState, setCallState] = useState<"idle" | "calling">("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHubSuccess("");
  }, [mode]);

  useEffect(() => {
    if (callState === "calling") {
      callTimerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState]);

  useEffect(() => {
    if (mode === "message") {
      window.setTimeout(() => {
        smsBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [mode, smsThread.length]);

  function formatCallTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleStartCall() {
    setCallSeconds(0);
    setCallState("calling");
  }

  function handleEndCall() {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const label = callSeconds < 60
      ? `0:${String(callSeconds).padStart(2, "0")}`
      : `${Math.floor(callSeconds / 60)} min`;
    const wasCallback = alerts.missedCalls > 0;
    setCallState("idle");
    setCallSeconds(0);
    onCallEnd(label, wasCallback);
    setHubSuccess("Call logged to activity");
  }

  function applyEmailTemplate(name: string) {
    setEmailTemplate(name);
    const tpl = emailTemplates[name];
    if (tpl) {
      setEmailSubject(tpl.subject);
      setEmailBody(tpl.message);
    }
  }

  function handleSendEmail(e: FormEvent) {
    e.preventDefault();
    if (!emailSubject.trim() && !emailBody.trim()) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      const newEmail: EmailRecord = {
        id: `sent-${Date.now()}`,
        from: "Dana Kim <dana.kim@roofpilot.com>",
        to: "Hannah Weiss <hannah.weiss@example.com>",
        subject: emailSubject,
        sentAt: nowLabel(),
        body: emailBody,
        opens: 0,
        lastOpenedAt: "—",
        direction: "out"
      };
      setSentEmails(prev => [...prev, newEmail]);
      setEmailReplied(true);
      onSendEmail(emailSubject, emailBody);
      setEmailBody("");
      setIsSubmitting(false);
      setHubSuccess("Email sent to Hannah Weiss");
    }, 700);
  }

  function handleSendSms() {
    if (!smsText.trim()) return;
    setSmsSending(true);
    const text = smsText.trim();
    setSmsText("");
    window.setTimeout(() => {
      onSendSms(text);
      setSmsSending(false);
    }, 500);
  }

  function handleSendNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("noteTitle") || "").trim();
    const detail = String(data.get("noteDetail") || "").trim();
    if (!title && !detail) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      onSendNote(title, detail || title);
      e.currentTarget?.reset();
      setIsSubmitting(false);
      setHubSuccess("Note saved");
    }, 500);
  }

  function handleCreateTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("taskTitle") || "").trim();
    if (!title) return;
    const rawDate = String(data.get("dueDate") || "");
    const dueDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;
    const rawTags = String(data.get("tags") || "").trim();
    const tags = rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : undefined;
    const priority = String(data.get("priority") || "") as TaskPriority | "";
    setIsSubmitting(true);
    window.setTimeout(() => {
      onCreateTask({ title, priority: priority || undefined, dueDate, tags });
      e.currentTarget?.reset();
      setIsSubmitting(false);
      setHubSuccess("Task created");
    }, 500);
  }

  const allEmails = [...mockEmailThread, ...sentEmails];
  const emailThread = allEmails;

  const hubModes: { mode: ComposerMode; label: string; dot?: "red" | "amber" }[] = [
    { mode: "call",    label: "Call",    dot: alerts.missedCalls > 0 ? "red" : undefined },
    { mode: "email",   label: "Email",   dot: !emailReplied && emailThread.some(e => e.direction === "in") ? "amber" : undefined },
    { mode: "message", label: "SMS",     dot: alerts.unansweredSms > 0 ? "amber" : undefined },
    { mode: "task",    label: "Task" },
    { mode: "note",    label: "Note" },
  ];

  return (
    <section className="surface comm-hub flow-order-4">
      <div className="panel-head">
        <h2 className="section-title">Communication</h2>
      </div>

      <div className="segmented hub-mode-bar" role="tablist" aria-label="Communication type">
        {hubModes.map(({ mode: m, label, dot }) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={m === mode}
            className={m === mode ? "segment active" : "segment"}
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => setMode(m)}
          >
            {label}
            {dot && (
              <span
                className={`segment-dot segment-dot-${dot}`}
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      <div className="hub-body composer-fade" key={mode}>
        {/* ── Note mode ── */}
        {mode === "note" && (
          <form className="composer-form" onSubmit={handleSendNote}>
            <label>
              <span className="text-label">Title</span>
              <input name="noteTitle" placeholder="Quick headline" defaultValue="Homeowner update" />
            </label>
            <label>
              <span className="text-label">Details</span>
              <textarea
                name="noteDetail"
                className="composer-textarea"
                placeholder="Add context your team should see…"
                defaultValue="Homeowner asked about deductible timing and production schedule."
              />
            </label>
            <div className="composer-actions">
              <button className="button ghost" type="button">
                <Paperclip size={16} aria-hidden="true" />
                Attach
              </button>
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spin" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                {isSubmitting ? "Saving…" : "Save Note"}
              </button>
            </div>
          </form>
        )}

        {/* ── Task mode ── */}
        {mode === "task" && (
          <form className="composer-form" onSubmit={handleCreateTask}>
            <label>
              <span className="text-label">Task</span>
              <input name="taskTitle" placeholder="What needs to happen?" required autoFocus />
            </label>
            <div className="two-col">
              <label>
                <span className="text-label">Priority</span>
                <select name="priority" defaultValue="medium">
                  <option value="">No priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label>
                <span className="text-label">Due date</span>
                <input name="dueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </label>
            </div>
            <label>
              <span className="text-label">Assigned to</span>
              <select name="assignee" defaultValue="Dana Kim">
                <option>Dana Kim</option>
                <option>Unassigned</option>
              </select>
            </label>
            <label>
              <span className="text-label">
                Tags <span className="text-secondary" style={{ fontWeight: 400 }}>(comma separated)</span>
              </span>
              <input name="tags" placeholder="e.g. estimate, homeowner" />
            </label>
            <div className="composer-actions">
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spin" size={16} aria-hidden="true" /> : <ClipboardList size={16} aria-hidden="true" />}
                {isSubmitting ? "Saving…" : "Create Task"}
              </button>
            </div>
          </form>
        )}

        {/* ── Email mode ── */}
        {mode === "email" && (
          <>
            <div className="hub-email-thread">
              {emailThread.map((email) => {
                const isExpanded = expandedEmailId === email.id;
                const isIn = email.direction === "in";
                return (
                  <div key={email.id} className="email-thread-item">
                    <button
                      type="button"
                      className="email-thread-item-header"
                      onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                      aria-expanded={isExpanded}
                    >
                      <span className={`email-thread-dir-icon ${isIn ? "email-thread-dir-in" : "email-thread-dir-out"}`}>
                        {isIn ? <Mail size={11} /> : <Send size={11} />}
                      </span>
                      <span className="email-thread-header-text">
                        <span className="email-thread-from">{isIn ? email.from.split(" <")[0] : "You"}</span>
                        <span className="email-thread-time text-secondary">· {email.sentAt}</span>
                      </span>
                      {!isExpanded && (
                        <span className="email-thread-snippet text-secondary">{email.body.slice(0, 60)}…</span>
                      )}
                      {email.direction === "out" && email.opens > 0 && (
                        <span className="email-opens-badge">Opened {email.opens}×</span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="email-thread-item-body">
                        <div className="email-thread-meta">
                          <span className="text-label">Subject:</span>
                          <span className="text-secondary"> {email.subject}</span>
                        </div>
                        <div className="email-thread-body-text">
                          {email.body.split("\n\n").map((para, i) => (
                            <p key={i} style={{ marginBottom: 10 }}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="template-chips" role="group" aria-label="Smart templates">
              {Object.keys(emailTemplates).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={emailTemplate === name ? "chip active" : "chip"}
                  onClick={() => applyEmailTemplate(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <form className="composer-form" onSubmit={handleSendEmail}>
              <label>
                <span className="text-label">To</span>
                <input name="to" defaultValue="hannah.weiss@example.com" readOnly />
              </label>
              <label>
                <span className="text-label">Subject</span>
                <input
                  name="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </label>
              <label>
                <span className="text-label">Message</span>
                <span className="suggested-draft-label">
                  <Sparkles size={11} aria-hidden="true" />
                  Suggested draft
                </span>
                <textarea
                  name="message"
                  className="composer-textarea"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your reply…"
                />
              </label>
              <div className="composer-actions">
                <button className="button ghost" type="button">
                  <Paperclip size={16} aria-hidden="true" />
                  Attach
                </button>
                <button className="button primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="spin" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                  {isSubmitting ? "Sending…" : "Send Email"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── SMS mode ── */}
        {mode === "message" && (
          <>
            <div className="hub-sms-thread">
              {smsThread.map((msg) => {
                const isOut = msg.direction === "out";
                const isLastIn = msg === smsThread[smsThread.length - 1] && msg.direction === "in";
                const unanswered = isLastIn && alerts.unansweredSms > 0;
                return (
                  <div key={msg.id} className={`hub-sms-bubble-row${isOut ? " sms-out" : " sms-in"}`}>
                    <div className={isOut ? "hub-sms-bubble hub-sms-bubble-out" : "hub-sms-bubble hub-sms-bubble-in"}>
                      <p className="hub-sms-bubble-text">{msg.text}</p>
                      <span className={isOut ? "hub-sms-time" : "hub-sms-time-in"}>
                        {msg.time}{msg.rep ? ` · ${msg.rep}` : ""}
                      </span>
                      {unanswered && (
                        <span className="hub-sms-awaiting">Awaiting reply</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={smsBottomRef} />
            </div>

            <div className="hub-sms-input-bar">
              <textarea
                className="hub-sms-textarea"
                placeholder="Type a reply…"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                rows={1}
                disabled={smsSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendSms(); }
                }}
              />
              <button
                type="button"
                className="button primary"
                onClick={handleSendSms}
                disabled={smsSending || !smsText.trim()}
                aria-label="Send reply"
              >
                {smsSending ? <Loader2 className="spin" size={15} /> : <Send size={15} />}
              </button>
            </div>
          </>
        )}

        {/* ── Call mode ── */}
        {mode === "call" && (
          <div className="hub-call-panel">
            {/* Contact row */}
            <div className="hub-call-row">
              <div className={`hub-call-avatar${callState === "calling" ? " is-calling" : ""}`}>HW</div>
              <div className="hub-call-info">
                <p className="hub-call-name">Hannah Weiss</p>
                <span className="hub-call-number-chip">
                  <Phone size={11} aria-hidden="true" />
                  +1 (512) 555-0148
                </span>
                {alerts.missedCalls > 0 && callState === "idle" && (
                  <p className="hub-call-callback-note">
                    <PhoneMissed size={12} aria-hidden="true" />
                    Missed call · Jun 11 · 11:38 AM
                  </p>
                )}
              </div>
              <div className="hub-call-cta">
                {callState === "idle" ? (
                  <button type="button" className="button primary hub-call-start-btn" onClick={handleStartCall}>
                    <Phone size={14} aria-hidden="true" />
                    Start Call
                  </button>
                ) : (
                  <div className="hub-call-live">
                    <div className="hub-call-timer">
                      <span className="hub-call-pulse" aria-hidden="true" />
                      {formatCallTime(callSeconds)}
                    </div>
                    <button type="button" className="hub-call-end-btn" onClick={handleEndCall}>
                      <Phone size={14} aria-hidden="true" />
                      End Call
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Call history */}
            <div className="hub-call-history">
              <p className="hub-call-history-label">Recent calls</p>
              <ul className="hub-call-history-list">
                <li className="hub-call-history-item">
                  <PhoneMissed size={13} className="hch-icon hch-missed" aria-hidden="true" />
                  <span className="hch-contact">Hannah Weiss</span>
                  <span className="hch-time">Today · 11:38 AM</span>
                  <span className="hch-badge hch-missed">Missed</span>
                </li>
                <li className="hub-call-history-item">
                  <Phone size={13} className="hch-icon hch-out" aria-hidden="true" />
                  <span className="hch-contact">Hannah Weiss</span>
                  <span className="hch-time">Jun 4 · 4:30 PM</span>
                  <span className="hch-badge hch-out">4 min</span>
                </li>
                <li className="hub-call-history-item">
                  <Phone size={13} className="hch-icon hch-out" aria-hidden="true" />
                  <span className="hch-contact">Michael Weiss</span>
                  <span className="hch-time">Jun 3 · 10:15 AM</span>
                  <span className="hch-badge hch-out">2 min</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {hubSuccess && (
          <div className="inline-success" role="status">
            <Check size={16} aria-hidden="true" />
            {hubSuccess}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Hero Communication Modals ───────────────────────────────────── */
function useModalDismiss(onClose: () => void) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
}

function HeroTaskModal({ tasks, onClose, onComplete }: {
  tasks: TaskItem[];
  onClose: () => void;
  onComplete: (taskId: number, taskTitle: string) => void;
}) {
  useModalDismiss(onClose);
  return (
    <div className="hero-modal-overlay" onMouseDown={onClose}>
      <div className="hero-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Overdue tasks">
        <div className="hero-modal-head">
          <h3>Overdue Tasks{tasks.length > 1 ? ` (${tasks.length})` : ""}</h3>
          <button type="button" className="hero-modal-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hero-modal-body">
          {tasks.map(task => (
            <div key={task.id} className="hero-modal-task-row">
              <AlertTriangle size={15} className="hero-modal-task-icon" aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <p className="hero-modal-task-title">{task.title}</p>
                {task.dueDate && <p className="hero-modal-muted">Due {task.dueDate} · Overdue</p>}
                <div className="hero-modal-task-meta">
                  {task.tags?.map(tag => <span key={tag} className="hero-modal-task-tag">{tag}</span>)}
                  {task.priority && (
                    <span className="hero-modal-task-priority">
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                    </span>
                  )}
                </div>
              </div>
              <button type="button" className="button primary compact" onClick={() => onComplete(task.id, task.title)}>
                <Check size={13} aria-hidden="true" />
                Done
              </button>
            </div>
          ))}
        </div>
        <div className="hero-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function HeroCallModal({ contact, onClose, onCall }: { contact: Contact; onClose: () => void; onCall: () => void }) {
  useModalDismiss(onClose);
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;
  const fullName = `${contact.firstName} ${contact.lastName}`;
  return (
    <div className="hero-modal-overlay" onMouseDown={onClose}>
      <div className="hero-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Call customer">
        <div className="hero-modal-head">
          <h3>Call Customer</h3>
          <button type="button" className="hero-modal-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hero-modal-body">
          <div className="hero-modal-contact">
            <div className="hero-modal-avatar">{initials}</div>
            <div>
              <p className="hero-modal-name">{fullName}</p>
              <p className="hero-modal-detail">{contact.phone}</p>
              {contact.isPrimary && <span className="hero-modal-badge">Primary Contact</span>}
            </div>
          </div>
          <div className="hero-modal-section">
            <p className="hero-modal-label">Recent Call</p>
            <div className="hero-modal-recent-call">
              <PhoneMissed size={14} color="var(--red)" aria-hidden="true" />
              <div>
                <p className="hero-modal-rc-time">Jun 11, 2026 · 11:38 AM</p>
                <p className="hero-modal-muted">Missed Call</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="button primary" onClick={onCall}>
            <Phone size={14} aria-hidden="true" />
            Start Call
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroEmailModal({ contact, onClose, onSend }: { contact: Contact; onClose: () => void; onSend: (subject: string, body: string) => void }) {
  useModalDismiss(onClose);
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const [subject, setSubject] = useState("Insurance Claim Follow-Up");
  const [body, setBody] = useState(
    `Hi ${contact.firstName},\n\nI wanted to follow up regarding your insurance claim and proposal review.\n\nPlease let me know if you have any questions.\n\nBest,\nDana Kim`
  );
  return (
    <div className="hero-modal-overlay" onMouseDown={onClose}>
      <div className="hero-modal hero-modal-wide" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Send email">
        <div className="hero-modal-head">
          <h3>Send Email</h3>
          <button type="button" className="hero-modal-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hero-modal-body">
          <div className="hero-modal-field">
            <label>To</label>
            <div className="hero-modal-to-row">
              <span className="hero-modal-to-name">{fullName}</span>
              <span className="hero-modal-to-email">{contact.email}</span>
            </div>
          </div>
          <div className="hero-modal-field">
            <label htmlFor="hm-subject">Subject</label>
            <input id="hm-subject" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="hero-modal-field">
            <label htmlFor="hm-body">Message</label>
            <textarea id="hm-body" value={body} onChange={e => setBody(e.target.value)} rows={7} />
          </div>
        </div>
        <div className="hero-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="button primary" onClick={() => onSend(subject, body)}>
            <Mail size={14} aria-hidden="true" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroSmsModal({ contact, onClose, onSend }: { contact: Contact; onClose: () => void; onSend: (message: string) => void }) {
  useModalDismiss(onClose);
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const [message, setMessage] = useState(
    `Hi ${contact.firstName},\n\nJust checking in regarding your proposal review.\n\nLet me know if you have any questions.`
  );
  return (
    <div className="hero-modal-overlay" onMouseDown={onClose}>
      <div className="hero-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Send SMS">
        <div className="hero-modal-head">
          <h3>Send SMS</h3>
          <button type="button" className="hero-modal-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hero-modal-body">
          <div className="hero-modal-field">
            <label>To</label>
            <div className="hero-modal-to-row">
              <span className="hero-modal-to-name">{fullName}</span>
              <span className="hero-modal-to-email">{contact.phone}</span>
            </div>
          </div>
          <div className="hero-modal-field">
            <label htmlFor="hm-sms">Message</label>
            <textarea id="hm-sms" value={message} onChange={e => setMessage(e.target.value)} rows={5} />
          </div>
        </div>
        <div className="hero-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="button primary" onClick={() => onSend(message)}>
            <MessageSquare size={14} aria-hidden="true" />
            Send SMS
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroTaskCreateModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (task: Omit<TaskItem, "id">) => void;
}) {
  useModalDismiss(onClose);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignee, setAssignee] = useState("Dana Kim");
  const [tags, setTags] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;
    const parsedTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined;
    onCreate({ title: title.trim(), priority: priority || undefined, dueDate: parsedDate, tags: parsedTags });
    onClose();
  }

  return (
    <div className="hero-modal-overlay" onMouseDown={onClose}>
      <div className="hero-modal hero-modal-wide" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create task">
        <div className="hero-modal-head">
          <h3>Create Task</h3>
          <button type="button" className="hero-modal-close" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="hero-modal-body">
            <div className="hero-modal-field">
              <label htmlFor="htc-title">Task</label>
              <input
                id="htc-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to happen?"
                autoFocus
                required
              />
            </div>
            <div className="hero-modal-two-col">
              <div className="hero-modal-field">
                <label htmlFor="htc-priority">Priority</label>
                <select id="htc-priority" value={priority} onChange={e => setPriority(e.target.value as TaskPriority | "")}>
                  <option value="">No priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="hero-modal-field">
                <label htmlFor="htc-date">Due date</label>
                <input id="htc-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="hero-modal-field">
              <label htmlFor="htc-assignee">Assigned to</label>
              <select id="htc-assignee" value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option>Dana Kim</option>
                <option>Unassigned</option>
              </select>
            </div>
            <div className="hero-modal-field">
              <label htmlFor="htc-tags">Tags <span className="hero-modal-field-hint">(comma separated)</span></label>
              <input id="htc-tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. estimate, homeowner" />
            </div>
          </div>
          <div className="hero-modal-actions">
            <button type="button" className="button ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={!title.trim()}>
              <ClipboardList size={14} aria-hidden="true" />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Job Hero (slim — inline contact icons) ─────────────────────── */
function JobHero({
  onCreateProposal,
  labels = [],
  onCall,
  onEmail,
  onSms,
  onTask
}: {
  onCreateProposal: () => void;
  labels?: string[];
  onCall: () => void;
  onEmail: () => void;
  onSms: () => void;
  onTask: () => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photoSrc = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=90";

  return (
    <header className="job-hero surface">
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Property photo"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={photoSrc} alt="Weiss property exterior" className="lightbox-img" />
        </div>
      )}

      <div className="job-hero-row">
        <div className="job-hero-main">
          <button
            type="button"
            className="property-photo-btn"
            onClick={() => setLightboxOpen(true)}
            aria-label="View property photo"
          >
            <img
              className="property-photo"
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=320&q=80"
              alt="Weiss property exterior"
            />
          </button>
          <div className="job-hero-copy">
            <div className="hero-name-row">
              <h1 className="page-title">Hannah Weiss</h1>
              <div className="hero-contact-icons">
                <button
                  type="button"
                  className="hero-icon-btn"
                  title="Call"
                  aria-label="Call"
                  onClick={onCall}
                >
                  <Phone size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hero-icon-btn"
                  title="Email"
                  aria-label="Email"
                  onClick={onEmail}
                >
                  <Mail size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hero-icon-btn"
                  title="SMS"
                  aria-label="SMS"
                  onClick={onSms}
                >
                  <MessageSquare size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hero-icon-btn"
                  title="Create task"
                  aria-label="Create task"
                  onClick={onTask}
                >
                  <ClipboardList size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="text-secondary hero-address">
              450 Merci Blvd · Dripping Springs, TX 78620
            </p>
            <div className="hero-badges">
              <span className="stage-chip">Appointment Scheduled · Jun 10</span>
              <span className="engagement-badge warm">
                <span className="engagement-dot" />
                Warm lead
              </span>
              {labels.length > 0 && <span className="badge-separator" aria-hidden="true">|</span>}
              {labels.map((label) => (
                <span key={label} className="job-label-chip">{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="job-hero-metrics">
          <div className="hero-metric">
            <span className="text-label">Close probability</span>
            <strong className="hero-stat">84%</strong>
          </div>
          <div className="hero-metric highlight">
            <span className="text-label">Estimate value</span>
            <strong className="hero-stat">$18,450</strong>
          </div>
          <div className="hero-metric">
            <span className="text-label">Assigned rep</span>
            <strong className="hero-rep">Dana Kim</strong>
          </div>
        </div>

        <div className="header-actions" aria-label="Primary job actions">
          <button type="button" className="button primary" onClick={onCreateProposal}>
            <FileCheck2 size={16} aria-hidden="true" />
            Create Proposal
          </button>
          <button type="button" className="button secondary">
            <FilePlus2 size={15} aria-hidden="true" />
            Estimate
          </button>
          <button type="button" className="button secondary">
            <CircleDollarSign size={15} aria-hidden="true" />
            Invoice
          </button>
          <button type="button" className="button secondary">
            <PackageCheck size={15} aria-hidden="true" />
            Material order
          </button>
        </div>
      </div>

      <div className="hero-pipeline" role="region" aria-label="Job stage progress">
        <ol className="stage-list">
          {workflowStages.map((stage, i) => {
            const next = workflowStages[i + 1];
            let lineStatus = "upcoming";
            if (stage.status === "done") {
              lineStatus = next?.status === "done" ? "done" : "partial";
            }
            return (
              <li
                key={stage.id}
                className={`stage-step stage-${stage.status}`}
                data-line={lineStatus}
                aria-current={stage.status === "current" ? "step" : undefined}
              >
                <div className="step-dot" aria-hidden="true">
                  {stage.status === "done" && <Check size={9} strokeWidth={3} />}
                </div>
                <div className="step-label">
                  <span className="step-name">{stage.label}</span>
                  {stage.dateLabel && <time className="step-date">{stage.dateLabel}</time>}
                  {(stage.statusLabel || stage.status === "current") && (
                    <div className="step-badge-row">
                      {stage.statusLabel && <span className="step-badge">{stage.statusLabel}</span>}
                      {stage.status === "current" && <span className="step-days-in">12d</span>}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}

/* ── Content Tab Bar ───────────────────────────────────────────── */
function ContentTabBar({
  activeTab,
  setActiveTab,
  activityCount,
  documentCount,
  proposalCount,
  productionCount,
  alertsTotal = 0
}: {
  activeTab: ContentTab;
  setActiveTab: (tab: ContentTab) => void;
  activityCount: number;
  documentCount: number;
  proposalCount: number;
  productionCount: number;
  alertsTotal?: number;
}) {
  const tabs: { id: ContentTab; label: string; count?: number }[] = [
    { id: "overview",     label: "Overview" },
    { id: "activity",     label: "Activity",     count: activityCount },
    { id: "measurements", label: "Measurements" },
    { id: "proposals",    label: "Proposals",    count: proposalCount },
    { id: "documents",    label: "Documents",    count: documentCount },
    { id: "photos",       label: "Photos",       count: 6 },
    { id: "invoices",     label: "Invoices",     count: 0 },
    { id: "production",   label: "Production",   count: productionCount }
  ];

  return (
    <div className="content-tabbar" role="tablist" aria-label="Job sections">
      <div className="content-tabbar-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "ctab ctab-active" : "ctab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ctab-count">{tab.count}</span>
            )}
            {tab.id === "activity" && alertsTotal > 0 && (
              <span className="ctab-alert-dot" aria-label="Has alerts" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Documents View ────────────────────────────────────────────── */
type DocItem = {
  id: number;
  icon: "pdf" | "img" | "xls" | "misc";
  name: string;
  size: string;
  date: string;
  status: "signed" | "pending" | "draft";
  statusLabel: string;
};

const mockDocuments: DocItem[] = [
  { id: 1, icon: "pdf", name: "Inspection Report.pdf", size: "1.2 MB", date: "Jun 2, 2026", status: "signed", statusLabel: "Completed" },
  { id: 2, icon: "pdf", name: "Insurance Claim Form.pdf", size: "840 KB", date: "May 28, 2026", status: "pending", statusLabel: "Awaiting signature" },
  { id: 3, icon: "img", name: "Site Photos — Hail Damage.zip", size: "22 MB", date: "Jun 2, 2026", status: "signed", statusLabel: "Uploaded" },
  { id: 4, icon: "pdf", name: "Material Estimate Draft.pdf", size: "490 KB", date: "Jun 3, 2026", status: "draft", statusLabel: "Draft" },
  { id: 5, icon: "xls", name: "Adjuster Scope of Work.xlsx", size: "310 KB", date: "Jun 1, 2026", status: "pending", statusLabel: "In review" }
];

const mockPhotos = [
  { id: 1, label: "North face — hail damage",       date: "Jun 2, 2026", color: "#e2e8f0" },
  { id: 2, label: "South ridge — cracked shingle",  date: "Jun 2, 2026", color: "#cbd5e1" },
  { id: 3, label: "Gutter damage — east side",      date: "Jun 2, 2026", color: "#94a3b8" },
  { id: 4, label: "Skylight flashing",              date: "Jun 2, 2026", color: "#64748b" },
  { id: 5, label: "Overall roof — aerial",          date: "Jun 2, 2026", color: "#475569" },
  { id: 6, label: "Interior water damage",          date: "Jun 3, 2026", color: "#334155" },
];

function PhotosView() {
  return (
    <div className="tab-content-inner">
      <section className="surface tab-card">
        <div className="panel-head">
          <h2 className="section-title">Damage Photos</h2>
          <span className="count-pill">{mockPhotos.length}</span>
          <button type="button" className="text-link" style={{ marginLeft: "auto" }}>
            <Plus size={13} aria-hidden="true" />
            Add photos
          </button>
        </div>
        <div className="photo-grid">
          {mockPhotos.map((photo) => (
            <button key={photo.id} type="button" className="photo-thumb" aria-label={photo.label}>
              <div className="photo-placeholder" style={{ background: photo.color }} aria-hidden="true">
                <Image size={20} />
              </div>
              <span className="photo-label">{photo.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentsView() {
  return (
    <div className="tab-content-inner">
      <section className="surface tab-card">
        <div className="panel-head">
          <h2 className="section-title">Documents</h2>
          <button type="button" className="text-link" style={{ marginLeft: "auto" }}>
            <Plus size={13} aria-hidden="true" />
            Upload
          </button>
        </div>
        <div className="doc-grid">
          {mockDocuments.map((doc) => (
            <button key={doc.id} type="button" className="doc-card" aria-label={`Open ${doc.name}`}>
              <div className={`doc-icon ${doc.icon}`}>
                {doc.icon === "pdf" && <FileText size={20} />}
                {doc.icon === "img" && <Image size={20} />}
                {doc.icon === "xls" && <FileText size={20} />}
                {doc.icon === "misc" && <FileText size={20} />}
              </div>
              <div className="doc-meta">
                <span className="doc-name">{doc.name}</span>
                <span className="doc-info">{doc.size} · {doc.date}</span>
              </div>
              <div className={`doc-status ${doc.status}`}>
                {doc.status === "signed" && <Check size={12} />}
                {doc.statusLabel}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Proposals View ────────────────────────────────────────────── */
function ProposalsView({ onCreateProposal }: { onCreateProposal: () => void }) {
  return (
    <div className="tab-content-inner">
      <section className="surface tab-card">
        <div className="panel-head">
          <h2 className="section-title">Proposals</h2>
          <button type="button" className="text-link" onClick={onCreateProposal}>
            <Plus size={13} aria-hidden="true" />
            New Proposal
          </button>
        </div>
        <div className="proposals-list">
          <div className="proposal-card proposal-primary">
            <div>
              <p className="proposal-title">Full Roof Replacement Package</p>
              <p className="proposal-amount">$18,450</p>
              <div className="proposal-meta-row">
                <div className="proposal-meta-item">
                  <span className="text-label">Sent</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Jun 3, 2026</span>
                </div>
                <div className="proposal-meta-item">
                  <span className="text-label">Valid until</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Jul 3, 2026</span>
                </div>
                <div className="proposal-meta-item">
                  <span className="text-label">Prepared by</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Dana Kim</span>
                </div>
              </div>
              <div className="proposal-line-items">
                <div className="line-item-row"><span className="item-label">Architectural shingle — full replace</span><span className="item-value">$11,200</span></div>
                <div className="line-item-row"><span className="item-label">Labor & installation</span><span className="item-value">$4,800</span></div>
                <div className="line-item-row"><span className="item-label">Gutters & fascia repair</span><span className="item-value">$1,650</span></div>
                <div className="line-item-row"><span className="item-label">Permit & disposal</span><span className="item-value">$800</span></div>
              </div>
            </div>
            <div><span className="proposal-status-badge sent">Sent · Under Review</span></div>
          </div>
          <div className="proposal-card">
            <div>
              <p className="proposal-title">Partial Repair Estimate</p>
              <p className="proposal-amount">$4,250</p>
              <div className="proposal-meta-row">
                <div className="proposal-meta-item">
                  <span className="text-label">Created</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Jun 1, 2026</span>
                </div>
                <div className="proposal-meta-item">
                  <span className="text-label">Scope</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Northwest section only</span>
                </div>
              </div>
            </div>
            <div><span className="proposal-status-badge draft">Draft</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Activity Timeline ─────────────────────────────────────────── */
const timelineFilters: { id: TimelineFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "notes", label: "Notes" },
  { id: "tasks", label: "Tasks" },
  { id: "communication", label: "Communication" },
  { id: "system", label: "System" }
];

function ActivityTimeline({
  timeline,
  filter,
  onFilterChange,
  onRouteToHub
}: {
  timeline: TimelineItem[];
  filter: TimelineFilter;
  onFilterChange: (f: TimelineFilter) => void;
  onRouteToHub: (mode: ComposerMode) => void;
}) {
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);

  return (
    <section className="surface timeline-panel flow-order-5">
      <div className="panel-head">
        <h2 className="section-title">Activity timeline</h2>
      </div>

      <div className="filter-row" role="tablist" aria-label="Filter timeline">
        {timelineFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            className={filter === f.id ? "filter-chip active" : "filter-chip"}
            aria-selected={filter === f.id}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="timeline-list">
        {timeline.length ? (
          timeline.map((item) => {
            const meta = timelineMeta[item.type] ?? timelineMeta.system;
            const Icon = meta.icon;
            const isCall = item.type === "call" || item.type === "missed_call";
            const isExpanded = expandedCallId === item.id;
            const hasEmailLink = !!item.emailId;
            const hasSmsLink = !!item.threadId;
            const isMissed = item.type === "missed_call" || item.status === "unanswered";
            const isUnansweredSms = item.type === "sms_in" && item.status === "unanswered";

            return (
              <article
                className={`timeline-card ${meta.colorClass}${isCall ? " timeline-card-clickable" : ""}${isExpanded ? " timeline-card-expanded" : ""}`}
                key={item.id}
                onClick={isCall ? () => setExpandedCallId(isExpanded ? null : item.id) : undefined}
                style={isCall ? { cursor: "pointer" } : undefined}
              >
                <div className={`timeline-icon ${meta.colorClass}`}>
                  <Icon size={15} aria-hidden="true" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <h3>{item.title}</h3>
                    <div className="timeline-top-right">
                      {isMissed && item.type === "missed_call" && (
                        <span className="tl-status-pill tl-pill-missed">Missed</span>
                      )}
                      {isUnansweredSms && (
                        <span className="tl-status-pill tl-pill-unanswered">Unanswered</span>
                      )}
                      <time className="text-meta">{item.time}</time>
                    </div>
                  </div>
                  <p className="text-secondary">{item.detail}</p>
                  {item.rep && <p className="tl-rep">{item.rep}</p>}

                  {isCall && isExpanded && (
                    <div className="call-expand-row">
                      <span className="text-meta">
                        {item.direction === "in" ? "Inbound" : "Outbound"}
                        {item.durationLabel ? ` · ${item.durationLabel}` : " · No answer"}
                        {item.rep ? ` · ${item.rep}` : ""}
                      </span>
                      {item.status === "unanswered" && (
                        <button
                          type="button"
                          className="button primary compact"
                          onClick={(e) => { e.stopPropagation(); onRouteToHub("call"); }}
                        >
                          <Phone size={13} aria-hidden="true" />
                          Call back
                        </button>
                      )}
                    </div>
                  )}

                  {hasEmailLink && (
                    <button
                      type="button"
                      className="text-link tl-action-link"
                      onClick={(e) => { e.stopPropagation(); onRouteToHub("email"); }}
                    >
                      View email →
                    </button>
                  )}

                  {hasSmsLink && (
                    <button
                      type="button"
                      className="text-link tl-action-link"
                      onClick={(e) => { e.stopPropagation(); onRouteToHub("message"); }}
                    >
                      View thread →
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="empty-text text-secondary">No activities match this filter.</p>
        )}
      </div>
    </section>
  );
}

/* ── AI Insight ─────────────────────────────────────────────────── */
function AiRecommendations({ onAction }: { onAction: (action: AiAction) => void }) {
  return (
    <section className="surface side-card ai-card flow-order-7">
      <h2 className="section-title ai-card-title">
        <Sparkles size={15} aria-hidden="true" />
        AI Insight
      </h2>
      <p className="ai-narrative">
        Engagement is <strong>warm</strong> with clear buying signals. Hannah opened the
        estimate 3× and replied within the hour — momentum is strong.
      </p>
      <div className="ai-next-step">
        <div className="ai-next-step-header">
          <span className="ai-eyebrow">
            <Zap size={11} aria-hidden="true" />
            Recommended next step
          </span>
          <button type="button" className="ai-cta-link" onClick={() => onAction("proposal")}>
            → Create Proposal
          </button>
        </div>
        <p className="ai-step-title">Proposal is ready to send.</p>
        <p className="ai-step-body">Email opened 3× · high intent · <strong>Best window 2–5 PM</strong></p>
      </div>
    </section>
  );
}

/* ── Contact Block ─────────────────────────────────────────────── */
function ContactBlock({ contact, onCall, onEmail, onSms, onViewHistory }: {
  contact: Contact;
  onCall: (c: Contact) => void;
  onEmail: (c: Contact) => void;
  onSms: (c: Contact) => void;
  onViewHistory: (c: Contact) => void;
}) {
  return (
    <article className="contact-block">
      <div className="contact-block-head">
        <div className="contact-block-info">
          <div className="contact-block-name-row">
            <span className="contact-name">{contact.firstName} {contact.lastName}</span>
            {contact.isPrimary && <span className="contact-primary-badge">Primary</span>}
          </div>
          <p className="contact-meta-line">
            <span className="text-secondary">{contact.relationship}</span>
            {contact.lastInteraction && (
              <span className="text-secondary"> · {contact.lastInteraction}</span>
            )}
          </p>
        </div>
        <div className="contact-actions">
          <button type="button" className="icon-button small" aria-label={`Call ${contact.firstName}`} title="Call" onClick={() => onCall(contact)}>
            <Phone size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`Email ${contact.firstName}`} title="Email" onClick={() => onEmail(contact)}>
            <Mail size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`Message ${contact.firstName}`} title="Message" onClick={() => onSms(contact)}>
            <MessageSquare size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`View history for ${contact.firstName}`} title="View history" onClick={() => onViewHistory(contact)}>
            <FileText size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Contacts Card ─────────────────────────────────────────────── */
function ContactsCard({ contacts, openDrawer, onCall, onEmail, onSms, onViewHistory }: {
  contacts: Contact[];
  openDrawer: () => void;
  onCall: (c: Contact) => void;
  onEmail: (c: Contact) => void;
  onSms: (c: Contact) => void;
  onViewHistory: (c: Contact) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = contacts.length + 1;

  return (
    <section className={`surface side-card contacts-card collapsible flow-order-9${open ? " open" : ""}`}>
      <button type="button" className="collapse-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="collapse-heading-group">
          <h2 className="section-title">
            Contacts
            <span className="count-pill">{total}</span>
          </h2>
          {!open && (
            <p className="collapse-subtitle">
              {primaryContact.firstName} {primaryContact.lastName}
              {contacts.length > 0 && ` · ${contacts[0].firstName} ${contacts[0].lastName}`}
            </p>
          )}
        </div>
        <ChevronDown size={18} className="collapse-chevron" aria-hidden="true" />
      </button>
      <div className="collapse-body">
        {open && (
          <>
            <div className="card-action-right">
              <button className="text-link" type="button" onClick={openDrawer}>
                <Plus size={14} aria-hidden="true" />
                Add another contact
              </button>
            </div>
            <ContactBlock contact={primaryContact} onCall={onCall} onEmail={onEmail} onSms={onSms} onViewHistory={onViewHistory} />
            {contacts.map((contact) => (
              <ContactBlock key={`${contact.email}-${contact.phone}`} contact={contact} onCall={onCall} onEmail={onEmail} onSms={onSms} onViewHistory={onViewHistory} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

/* ── Tasks Card ────────────────────────────────────────────────── */
function TasksCard({
  tasks,
  completeTask,
  onAddTask,
  highlightTaskId
}: {
  tasks: TaskItem[];
  completeTask: (taskId: number, taskTitle: string) => void;
  onAddTask: () => void;
  highlightTaskId?: number | null;
}) {
  return (
    <section className="surface side-card tasks-card flow-order-8">
      <div className="panel-head">
        <div className="panel-title-group">
          <h2 className="section-title">Today&apos;s tasks</h2>
          <span className="count-pill">{tasks.length}</span>
        </div>
        <div className="tasks-header-actions">
          <button className="text-link" type="button" onClick={onAddTask}>
            <Plus size={14} aria-hidden="true" />
            Add task
          </button>
          <span className="tasks-header-sep">·</span>
          <button className="text-link" type="button">View all</button>
        </div>
      </div>
      <div className="task-list">
        {tasks.length ? (
          tasks.map((task) => (
            <label
              className={`task-row${task.isOverdue ? " task-row-overdue" : ""}${highlightTaskId === task.id ? " task-row-pulse" : ""}`}
              key={task.id}
            >
              <div className="task-body">
                <div className="task-title-row">
                  <input
                    type="checkbox"
                    onChange={() => completeTask(task.id, task.title)}
                    aria-label={`Complete ${task.title}`}
                  />
                  <span className="task-title">{task.title}</span>
                  {task.priority && (
                    <span className={`task-priority task-priority-${task.priority}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>
                {(task.dueDate || task.tags?.length) ? (
                  <div className="task-meta-row">
                    {task.dueDate && (
                      <span className={`task-due${task.isOverdue ? " task-due-overdue" : ""}`}>
                        {task.dueDate}
                      </span>
                    )}
                    {task.isOverdue && <span className="task-overdue-pill">Overdue</span>}
                    {task.tags?.map((tag) => (
                      <span key={tag} className="task-tag">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
          ))
        ) : (
          <p className="empty-text text-secondary">All open tasks are complete.</p>
        )}
      </div>
    </section>
  );
}

/* ── Insurance Fields ──────────────────────────────────────────── */
const claimSteps = [
  { id: "filed",      label: "Filed" },
  { id: "adjuster",   label: "Adjuster" },
  { id: "acv",        label: "ACV" },
  { id: "supplement", label: "Supplement" },
  { id: "rcv",        label: "RCV" },
] as const;
type ClaimStep = typeof claimSteps[number]["id"];
const supplementStatuses = ["Identified", "Filed", "Approved", "Denied"] as const;
type SupplementStatus = typeof supplementStatuses[number];

function InsuranceFields() {
  const [claimStatus, setClaimStatus] = useState<ClaimStep>("adjuster");
  const [supplementStatus, setSupplementStatus] = useState<SupplementStatus>("Filed");
  const currentIdx = claimSteps.findIndex((s) => s.id === claimStatus);

  return (
    <div className="insurance-fields">
      <div className="claim-pipeline">
        <span className="text-label" style={{ marginBottom: 8, display: "block" }}>Claim status</span>
        <ol className="claim-steps">
          {claimSteps.map((step, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            return (
              <li key={step.id} className={`claim-step${done ? " done" : current ? " current" : ""}`}>
                <button
                  type="button"
                  className="claim-step-dot"
                  onClick={() => setClaimStatus(step.id)}
                  title={`Mark as ${step.label}`}
                  aria-label={`Set claim to ${step.label}`}
                >
                  {done && <Check size={8} strokeWidth={3} />}
                </button>
                <span className="claim-step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="insurance-supplement-row">
        <span className="text-label">Supplement</span>
        <div className="supplement-status-group">
          {supplementStatuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`supplement-btn${supplementStatus === s ? " active" : ""}`}
              onClick={() => setSupplementStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <dl className="field-list metadata-fields insurance-meta">
        <div><dt className="text-label">Carrier</dt><dd>State Farm</dd></div>
        <div><dt className="text-label">Claim number</dt><dd className="text-meta-value">CLM-582741</dd></div>
        <div><dt className="text-label">Policy number</dt><dd className="text-meta-value">SF-4471-2026</dd></div>
        <div><dt className="text-label">Deductible</dt><dd>$1,500</dd></div>
        <div><dt className="text-label">Date of loss</dt><dd>May 22, 2026</dd></div>
        <div><dt className="text-label">Adjuster</dt><dd>John Carter</dd></div>
        <div><dt className="text-label">Inspection date</dt><dd>Jun 2, 2026</dd></div>
      </dl>
    </div>
  );
}

/* ── Job Info Card ─────────────────────────────────────────────── */
type JobInfoData = {
  closeDate: string;
  jobValue: string;
  assignee: string;
  source: string;
  description: string;
};

const jobInfoDefaults: JobInfoData = {
  closeDate: "Jun 20, 2026",
  jobValue: "$18,450",
  assignee: "Dana Kim",
  source: "Referral",
  description: "Homeowner prefers morning contact. Roof is architectural shingle with hail damage from the May storm. HOA approval required before work begins — Hannah is handling that side.",
};

function JobInfoCard() {
  const [data, setData] = useState<JobInfoData>(jobInfoDefaults);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<JobInfoData>(jobInfoDefaults);

  return (
    <section className={`surface job-info-card${editing ? " job-info-editing" : ""}`}>
      <div className="panel-head">
        <h2 className="section-title">Job Details</h2>
        <span className="job-info-timestamps">Created May 27, 2026 · Updated today</span>
        {!editing && (
          <button type="button" className="text-link" onClick={() => { setDraft(data); setEditing(true); }}>
            <Pencil size={13} aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="job-info-grid">
            <label className="job-info-field">
              <span className="text-label">Close date</span>
              <input type="text" className="job-info-input" value={draft.closeDate} onChange={(e) => setDraft((d) => ({ ...d, closeDate: e.target.value }))} />
            </label>
            <label className="job-info-field">
              <span className="text-label">Job value</span>
              <input type="text" className="job-info-input" value={draft.jobValue} onChange={(e) => setDraft((d) => ({ ...d, jobValue: e.target.value }))} />
            </label>
            <label className="job-info-field">
              <span className="text-label">Assignee</span>
              <select className="job-info-input" value={draft.assignee} onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}>
                <option>Dana Kim</option><option>Marcus Lee</option><option>Sarah Chen</option>
              </select>
            </label>
            <label className="job-info-field">
              <span className="text-label">Source</span>
              <select className="job-info-input" value={draft.source} onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}>
                <option>Referral</option><option>Website form</option><option>Door-to-door</option><option>Google Ads</option><option>Insurance claim</option>
              </select>
            </label>
          </div>
          <label className="job-info-field" style={{ marginBottom: 14 }}>
            <span className="text-label">Description</span>
            <textarea className="description-textarea" style={{ marginTop: 5 }} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3} autoFocus />
          </label>
          <div className="job-info-edit-actions">
            <button type="button" className="button ghost compact" onClick={() => setEditing(false)}>Cancel</button>
            <button type="button" className="button primary compact" onClick={() => { setData(draft); setEditing(false); }}>Save changes</button>
          </div>
        </>
      ) : (
        <>
          <div className="job-info-tiles">
            <div className="job-info-tile">
              <div className="job-info-tile-head"><CircleDollarSign size={13} aria-hidden="true" /><span className="job-info-tile-label">Job value</span></div>
              <span className="job-info-tile-data">{data.jobValue}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head"><CalendarDays size={13} aria-hidden="true" /><span className="job-info-tile-label">Close date</span></div>
              <span className="job-info-tile-data">{data.closeDate}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head"><UserCircle size={13} aria-hidden="true" /><span className="job-info-tile-label">Assignee</span></div>
              <span className="job-info-tile-data">{data.assignee}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head"><Flame size={13} aria-hidden="true" /><span className="job-info-tile-label">Source</span></div>
              <span className="job-info-tile-data">{data.source}</span>
            </div>
          </div>
          {data.description && (
            <div className="job-info-desc-view">
              <span className="text-label">Description</span>
              <p className="description-text">{data.description}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ── Description Card ─────────────────────────────────────────── */
function DescriptionCard() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [draft, setDraft] = useState("");

  return (
    <section className={`surface side-card description-card collapsible flow-order-12${open ? " open" : ""}`}>
      <button type="button" className="collapse-trigger" onClick={() => { if (!editing) setOpen((v) => !v); }} aria-expanded={open}>
        <div className="collapse-heading-group">
          <h2 className="section-title">Description</h2>
          {!open && value && <p className="collapse-subtitle">{value.slice(0, 52) + (value.length > 52 ? "…" : "")}</p>}
        </div>
        <ChevronDown size={18} className="collapse-chevron" aria-hidden="true" />
      </button>
      <div className="collapse-body">
        {open && (
          editing ? (
            <div className="description-editor">
              <textarea className="description-textarea" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus placeholder="Add key details…" rows={4} />
              <div className="description-actions">
                <button type="button" className="button ghost compact" onClick={() => setEditing(false)}>Cancel</button>
                <button type="button" className="button primary compact" onClick={() => { setValue(draft.trim()); setEditing(false); }}>Save</button>
              </div>
            </div>
          ) : value ? (
            <div className="description-saved">
              <p className="description-text">{value}</p>
              <button type="button" className="text-link description-edit-btn" onClick={() => { setDraft(value); setEditing(true); }}>
                <Pencil size={12} aria-hidden="true" />Edit
              </button>
            </div>
          ) : (
            <button type="button" className="description-empty-trigger" onClick={() => { setDraft(""); setEditing(true); }}>
              <Plus size={14} aria-hidden="true" />Add a description
            </button>
          )
        )}
      </div>
    </section>
  );
}

/* ── Tags Card ─────────────────────────────────────────────────── */
function TagsCard() {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  function commitTag() {
    const t = newTag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag("");
    setAdding(false);
  }

  return (
    <section className={`surface side-card tags-card collapsible flow-order-13${open ? " open" : ""}`}>
      <button type="button" className="collapse-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="collapse-heading-group">
          <h2 className="section-title">Tags{tags.length > 0 && <span className="count-pill">{tags.length}</span>}</h2>
          {!open && tags.length > 0 && <p className="collapse-subtitle">{tags.slice(0, 3).join(" · ")}</p>}
        </div>
        <ChevronDown size={18} className="collapse-chevron" aria-hidden="true" />
      </button>
      <div className="collapse-body">
        {open && (
          <>
            <div className="tags-list">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                  <button type="button" className="tag-remove" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              {adding && (
                <input
                  className="tag-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitTag(); }
                    if (e.key === "Escape") { setAdding(false); setNewTag(""); }
                  }}
                  onBlur={commitTag}
                  autoFocus
                  placeholder="Tag name…"
                />
              )}
            </div>
            <div className="card-action-right">
              <button className="text-link" type="button" onClick={() => setAdding(true)}>
                <Plus size={14} aria-hidden="true" />Add tag
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ── Collapsible Card ──────────────────────────────────────────── */
function CollapsibleCard({
  title, subtitle, children, className = "", defaultOpen = true, icon
}: {
  title: string; subtitle?: string; children: ReactNode; className?: string; defaultOpen?: boolean; icon?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`surface side-card collapsible ${className} ${open ? "open" : ""}`}>
      <button type="button" className="collapse-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <div className="collapse-heading-group">
          <h2 className="section-title">{icon}{title}</h2>
          {!open && subtitle && <p className="collapse-subtitle">{subtitle}</p>}
        </div>
        <ChevronDown size={18} className="collapse-chevron" aria-hidden="true" />
      </button>
      <div className="collapse-body">{open ? children : null}</div>
    </section>
  );
}

/* ── Measurements View ─────────────────────────────────────────── */
type RoofDims = {
  totalSquares: string; pitch: string; layers: string; eaveLength: string;
  ridgeLength: string; hipValley: string; dripEdge: string; wasteFactor: string;
};
const roofDimsDefault: RoofDims = {
  totalSquares: "28 SQ", pitch: "6/12", layers: "1", eaveLength: "180 lf",
  ridgeLength: "42 lf", hipValley: "68 lf", dripEdge: "220 lf", wasteFactor: "12%",
};

function MeasurementsView() {
  const [dims, setDims] = useState<RoofDims>(roofDimsDefault);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RoofDims>(roofDimsDefault);
  const dimFields: { key: keyof RoofDims; label: string }[] = [
    { key: "totalSquares", label: "Total squares" }, { key: "pitch", label: "Pitch" },
    { key: "layers", label: "Layers" }, { key: "eaveLength", label: "Eave length" },
    { key: "ridgeLength", label: "Ridge length" }, { key: "hipValley", label: "Hip / Valley" },
    { key: "dripEdge", label: "Drip edge" }, { key: "wasteFactor", label: "Waste factor" },
  ];
  const materialTiles = [
    { label: "Shingles needed", value: "31.4 SQ", note: "incl. waste" },
    { label: "Underlayment", value: "10 rolls" }, { label: "Ice & water", value: "2 rolls" },
    { label: "Ridge cap", value: "4 bundles" }, { label: "Drip edge", value: "8 sticks" },
  ];

  return (
    <div className="measurements-view">
      <section className={`surface measurements-card${editing ? " job-info-editing" : ""}`}>
        <div className="panel-head">
          <h2 className="section-title"><Ruler size={15} aria-hidden="true" />Roof Dimensions</h2>
          {!editing && (
            <button type="button" className="text-link" onClick={() => { setDraft(dims); setEditing(true); }}>
              <Pencil size={13} aria-hidden="true" />Edit
            </button>
          )}
        </div>
        {editing ? (
          <>
            <div className="meas-edit-grid">
              {dimFields.map(({ key, label }) => (
                <label key={key} className="job-info-field">
                  <span className="text-label">{label}</span>
                  <input type="text" className="job-info-input" value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />
                </label>
              ))}
            </div>
            <div className="job-info-edit-actions">
              <button type="button" className="button ghost compact" onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className="button primary compact" onClick={() => { setDims(draft); setEditing(false); }}>Save changes</button>
            </div>
          </>
        ) : (
          <div className="meas-tiles">
            {dimFields.map(({ key, label }) => (
              <div key={key} className="job-info-tile">
                <div className="job-info-tile-head"><span className="job-info-tile-label">{label}</span></div>
                <span className="job-info-tile-data">{dims[key]}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface measurements-card">
        <div className="panel-head"><h2 className="section-title">Material Estimates</h2></div>
        <div className="meas-tiles">
          {materialTiles.map(({ label, value, note }) => (
            <div key={label} className="job-info-tile">
              <div className="job-info-tile-head"><span className="job-info-tile-label">{label}</span></div>
              <span className="job-info-tile-data">{value}{note && <span className="meas-tile-note"> ({note})</span>}</span>
            </div>
          ))}
        </div>
      </section>

      <MeasurementNotes />
    </div>
  );
}

type MeasNote = { id: number; text: string; date: string };

function MeasurementNotes() {
  const [notes, setNotes] = useState<MeasNote[]>([
    { id: 1, text: "Slope confirmed during inspection — no structural damage found.", date: "Jun 2, 2026" },
    { id: 2, text: "Two skylights on north face require additional flashing.", date: "Jun 2, 2026" },
    { id: 3, text: "Gutters to be re-hung after installation.", date: "Jun 3, 2026" },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState("");

  return (
    <section className="surface measurements-card">
      <div className="panel-head">
        <h2 className="section-title">Notes</h2>
        {!adding && (
          <button type="button" className="text-link" onClick={() => setAdding(true)}>
            <Plus size={13} aria-hidden="true" />Add note
          </button>
        )}
      </div>
      <div className="meas-notes-list">
        {notes.map((note) => (
          <div key={note.id} className="meas-note-item">
            {editingId === note.id ? (
              <div className="meas-note-edit">
                <textarea className="description-textarea" value={editDraft} onChange={(e) => setEditDraft(e.target.value)} autoFocus rows={2} />
                <div className="description-actions">
                  <button type="button" className="button ghost compact" onClick={() => setEditingId(null)}>Cancel</button>
                  <button type="button" className="button primary compact" onClick={() => { if (!editDraft.trim()) return; setNotes((ns) => ns.map((n) => n.id === editingId ? { ...n, text: editDraft.trim() } : n)); setEditingId(null); }}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="meas-note-text">{note.text}</p>
                <div className="meas-note-meta">
                  <span className="text-meta">{note.date}</span>
                  <div className="meas-note-actions">
                    <button type="button" className="icon-button small" onClick={() => { setEditingId(note.id); setEditDraft(note.text); }} aria-label="Edit note">
                      <Pencil size={13} />
                    </button>
                    <button type="button" className="icon-button small meas-note-delete" onClick={() => setNotes((ns) => ns.filter((n) => n.id !== note.id))} aria-label="Delete note">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {adding && (
          <div className="meas-note-item meas-note-new">
            <textarea className="description-textarea" value={newDraft} onChange={(e) => setNewDraft(e.target.value)} autoFocus rows={2} placeholder="Add a note…" />
            <div className="description-actions">
              <button type="button" className="button ghost compact" onClick={() => { setNewDraft(""); setAdding(false); }}>Cancel</button>
              <button type="button" className="button primary compact" onClick={() => { if (!newDraft.trim()) return; setNotes((ns) => [...ns, { id: Date.now(), text: newDraft.trim(), date: "Jun 5, 2026" }]); setNewDraft(""); setAdding(false); }}>Save</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Invoices View ──────────────────────────────────────────────── */
function InvoicesView() {
  return (
    <div className="invoices-view">
      <section className="surface invoices-card">
        <div className="panel-head">
          <h2 className="section-title">Invoices</h2>
          <button className="text-link" type="button">
            <Plus size={13} aria-hidden="true" />Create Invoice
          </button>
        </div>
        <div className="invoices-summary">
          <div className="inv-summary-row"><span className="text-secondary">Job value</span><strong>$18,450</strong></div>
          <div className="inv-summary-row"><span className="text-secondary">Total invoiced</span><strong>$0</strong></div>
          <div className="inv-summary-row"><span className="text-secondary">Balance due</span><strong className="inv-balance-due">$18,450</strong></div>
        </div>
        <div className="invoices-empty">
          <p className="text-secondary">No invoices yet. Invoices are typically created after the proposal is signed and work is scheduled.</p>
          <button className="button primary compact" type="button">
            <Plus size={14} aria-hidden="true" />Create first invoice
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Production View ───────────────────────────────────────────── */
const materialStatusMeta: Record<MaterialOrderStatus, { label: string; className: string }> = {
  pending:      { label: "Pending",    className: "prod-status prod-status-pending" },
  ordered:      { label: "Ordered",    className: "prod-status prod-status-ordered" },
  "in-transit": { label: "In transit", className: "prod-status prod-status-transit" },
  delivered:    { label: "Delivered",  className: "prod-status prod-status-delivered" },
  cancelled:    { label: "Cancelled",  className: "prod-status prod-status-cancelled" },
};
const workStatusMeta: Record<WorkOrderStatus, { label: string; className: string }> = {
  "not-scheduled": { label: "Not scheduled", className: "prod-status prod-status-pending" },
  scheduled:       { label: "Scheduled",      className: "prod-status prod-status-ordered" },
  "in-progress":   { label: "In progress",    className: "prod-status prod-status-transit" },
  complete:        { label: "Complete",        className: "prod-status prod-status-delivered" },
};

function ProductionView({ materialOrders, setMaterialOrders, workOrders, setWorkOrders }: {
  materialOrders: MaterialOrder[]; setMaterialOrders: (orders: MaterialOrder[]) => void;
  workOrders: WorkOrder[]; setWorkOrders: (orders: WorkOrder[]) => void;
}) {
  const [isMaterialDrawerOpen, setIsMaterialDrawerOpen] = useState(false);
  const [isWorkDrawerOpen, setIsWorkDrawerOpen] = useState(false);
  const materialTotal = materialOrders.reduce((sum, o) => sum + o.qty * o.unitCost, 0);

  return (
    <div className="production-view">
      {isMaterialDrawerOpen && (
        <AddMaterialOrderDrawer
          onClose={() => setIsMaterialDrawerOpen(false)}
          onSave={(order) => { setMaterialOrders([...materialOrders, { ...order, id: Date.now() }]); setIsMaterialDrawerOpen(false); }}
        />
      )}
      {isWorkDrawerOpen && (
        <AddWorkOrderDrawer
          onClose={() => setIsWorkDrawerOpen(false)}
          onSave={(order) => { setWorkOrders([...workOrders, { ...order, id: Date.now() }]); setIsWorkDrawerOpen(false); }}
        />
      )}
      <section className="surface production-card">
        <div className="panel-head">
          <div className="panel-title-group">
            <h2 className="section-title">Material Orders</h2>
            <span className="count-pill">{materialOrders.length}</span>
          </div>
          <button className="text-link" type="button" onClick={() => setIsMaterialDrawerOpen(true)}>
            <Plus size={14} aria-hidden="true" />Add order
          </button>
        </div>
        {materialOrders.length === 0 ? (
          <div className="prod-empty">
            <p className="text-secondary">No material orders yet.</p>
            <button className="button ghost compact" type="button" onClick={() => setIsMaterialDrawerOpen(true)}><Plus size={14} /> Add first order</button>
          </div>
        ) : (
          <>
            <div className="prod-table-wrap">
              <table className="prod-table">
                <thead><tr><th>Item</th><th className="prod-th-num">Qty</th><th>Unit</th><th>Supplier</th><th className="prod-th-num">Unit cost</th><th className="prod-th-num">Total</th><th>Status</th></tr></thead>
                <tbody>
                  {materialOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="prod-td-item">{order.item}</td>
                      <td className="prod-td-num">{order.qty}</td>
                      <td className="prod-td-muted">{order.unit}</td>
                      <td className="prod-td-muted">{order.supplier || "—"}</td>
                      <td className="prod-td-num">{order.unitCost > 0 ? `$${order.unitCost.toLocaleString()}` : "—"}</td>
                      <td className="prod-td-num prod-td-total">${(order.qty * order.unitCost).toLocaleString()}</td>
                      <td><span className={materialStatusMeta[order.status].className}>{materialStatusMeta[order.status].label}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="prod-total-row"><td colSpan={5}>Est. materials total</td><td className="prod-td-num">${materialTotal.toLocaleString()}</td><td /></tr></tfoot>
              </table>
            </div>
            <p className="prod-note text-secondary">Orders pending — awaiting proposal approval before purchasing.</p>
          </>
        )}
      </section>
      <section className="surface production-card">
        <div className="panel-head">
          <div className="panel-title-group">
            <h2 className="section-title">Work Orders</h2>
            <span className="count-pill">{workOrders.length}</span>
          </div>
          <button className="text-link" type="button" onClick={() => setIsWorkDrawerOpen(true)}>
            <Plus size={14} aria-hidden="true" />Add work order
          </button>
        </div>
        {workOrders.length === 0 ? (
          <div className="prod-empty"><p className="text-secondary">No work orders yet.</p><button className="button ghost compact" type="button" onClick={() => setIsWorkDrawerOpen(true)}><Plus size={14} /> Add first work order</button></div>
        ) : (
          <div className="work-order-list">
            {workOrders.map((wo) => (
              <div key={wo.id} className="work-order-row">
                <div className="work-order-main">
                  <span className="work-order-type">{wo.type}</span>
                  {wo.notes && <p className="text-secondary work-order-notes">{wo.notes}</p>}
                </div>
                <div className="work-order-meta">
                  <span className="text-secondary">{wo.crew}</span>
                  <span className="text-secondary">{wo.scheduledDate}</span>
                  <span className={workStatusMeta[wo.status].className}>{workStatusMeta[wo.status].label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Drawers ───────────────────────────────────────────────────── */
function AddMaterialOrderDrawer({ onClose, onSave }: { onClose: () => void; onSave: (order: Omit<MaterialOrder, "id">) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsSaving(true);
    window.setTimeout(() => {
      onSave({ item: String(data.get("item") || ""), qty: Number(data.get("qty") || 1), unit: String(data.get("unit") || "unit"), supplier: String(data.get("supplier") || ""), status: String(data.get("status") || "pending") as MaterialOrderStatus, unitCost: Number(data.get("unitCost") || 0) });
      setIsSaving(false);
    }, 700);
  }
  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add material order">
        <div className="drawer-header"><h2 className="section-title">Add Material Order</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}><X size={18} /></button></div>
        {isSaving && <div className="drawer-loading" role="status" aria-live="polite"><Loader2 className="spin" size={22} aria-hidden="true" /><strong>Saving…</strong></div>}
        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submit}>
          <label><span className="text-label">Item</span><input name="item" placeholder="e.g. Architectural Shingles — IKO Dynasty" required autoFocus /></label>
          <div className="two-col">
            <label><span className="text-label">Qty</span><input name="qty" type="number" min="0" step="0.1" defaultValue="1" /></label>
            <label><span className="text-label">Unit</span><select name="unit" defaultValue="SQ"><option>SQ</option><option>bundle</option><option>roll</option><option>box</option><option>stick</option><option>sheet</option><option>unit</option></select></label>
          </div>
          <label><span className="text-label">Supplier</span><input name="supplier" placeholder="e.g. ABC Supply" /></label>
          <label><span className="text-label">Unit cost ($)</span><input name="unitCost" type="number" min="0" step="0.01" defaultValue="0" placeholder="0.00" /></label>
          <label><span className="text-label">Status</span><select name="status" defaultValue="pending"><option value="pending">Pending</option><option value="ordered">Ordered</option><option value="in-transit">In transit</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}{isSaving ? "Saving…" : "Add Order"}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function AddWorkOrderDrawer({ onClose, onSave }: { onClose: () => void; onSave: (order: Omit<WorkOrder, "id">) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawDate = String(data.get("scheduledDate") || "");
    const scheduledDate = rawDate ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
    setIsSaving(true);
    window.setTimeout(() => {
      onSave({ type: String(data.get("type") || ""), crew: String(data.get("crew") || "Dana Kim"), scheduledDate, status: String(data.get("status") || "not-scheduled") as WorkOrderStatus, notes: String(data.get("notes") || "") || undefined });
      setIsSaving(false);
    }, 700);
  }
  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add work order">
        <div className="drawer-header"><h2 className="section-title">Add Work Order</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}><X size={18} /></button></div>
        {isSaving && <div className="drawer-loading" role="status" aria-live="polite"><Loader2 className="spin" size={22} aria-hidden="true" /><strong>Saving…</strong></div>}
        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submit}>
          <label><span className="text-label">Work order type</span><input name="type" placeholder="e.g. Full Roof Replacement" required autoFocus /></label>
          <label><span className="text-label">Assigned crew</span><input name="crew" placeholder="e.g. Dana Kim" defaultValue="Dana Kim" /></label>
          <label><span className="text-label">Scheduled date</span><input name="scheduledDate" type="date" /></label>
          <label><span className="text-label">Status</span><select name="status" defaultValue="not-scheduled"><option value="not-scheduled">Not scheduled</option><option value="scheduled">Scheduled</option><option value="in-progress">In progress</option><option value="complete">Complete</option></select></label>
          <label><span className="text-label">Notes</span><textarea name="notes" placeholder="Optional notes…" /></label>
          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}{isSaving ? "Saving…" : "Add Work Order"}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ── Mobile Chrome ─────────────────────────────────────────────── */
function MobileChrome({
  hubMode,
  onRouteToHub
}: {
  hubMode: ComposerMode;
  onRouteToHub: (mode: ComposerMode) => void;
}) {
  const modes: { mode: ComposerMode; label: string; Icon: typeof Phone }[] = [
    { mode: "call",    label: "Call",  Icon: Phone },
    { mode: "email",   label: "Email", Icon: Mail },
    { mode: "message", label: "SMS",   Icon: MessageSquare },
    { mode: "task",    label: "Task",  Icon: ClipboardList },
    { mode: "note",    label: "Note",  Icon: StickyNote },
  ];

  return (
    <nav className="mobile-action-bar" aria-label="Quick actions">
      {modes.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          className={mode === hubMode ? "mobile-action active" : "mobile-action"}
          onClick={() => onRouteToHub(mode)}
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ── Contact Drawer ────────────────────────────────────────────── */
function ContactDrawer({ onClose, onSave }: { onClose: () => void; onSave: (contact: Contact) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const data = new FormData(event.currentTarget);
    window.setTimeout(() => {
      onSave({ firstName: String(data.get("firstName") || ""), lastName: String(data.get("lastName") || ""), relationship: String(data.get("relationship") || ""), phone: String(data.get("phone") || ""), email: String(data.get("email") || ""), preferred: String(data.get("preferred") || "Phone"), lastInteraction: "Just now", responseRate: "—" });
      setIsSaving(false);
    }, 900);
  }
  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close contact panel" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add contact">
        <p className="flow-step text-meta">Step 2 of 4 — Add contact</p>
        <div className="drawer-header"><h2 className="section-title">Add Contact</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}><X size={18} /></button></div>
        {isSaving && <div className="drawer-loading" role="status" aria-live="polite"><Loader2 className="spin" size={22} aria-hidden="true" /><strong>Saving…</strong><span className="text-secondary">Step 3 of 4 — Adding contact to this job</span></div>}
        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submitContact}>
          <div className="two-col">
            <label><span className="text-label">First Name</span><input name="firstName" placeholder="Michael" required /></label>
            <label><span className="text-label">Last Name</span><input name="lastName" placeholder="Weiss" required /></label>
          </div>
          <label><span className="text-label">Relationship</span><input name="relationship" placeholder="Spouse" required /></label>
          <label><span className="text-label">Phone</span><input name="phone" placeholder="+1 (512) 555-0173" required /></label>
          <label><span className="text-label">Email</span><input name="email" placeholder="name@example.com" type="email" required /></label>
          <label><span className="text-label">Preferred Contact Method</span><select name="preferred" defaultValue="SMS"><option>Phone</option><option>Email</option><option>SMS</option></select></label>
          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}{isSaving ? "Saving…" : "Save Contact"}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}
