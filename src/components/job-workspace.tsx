"use client";

import { AppShell } from "@/components/app-shell";
import {
  actionConfig,
  aiRecommendations,
  defaultSecondaryContact,
  emailTemplates,
  initialMaterialOrders,
  initialTimeline,
  initialWorkOrders,
  matchesTimelineFilter,
  messageTemplates,
  nowLabel,
  primaryContact,
  timelineMeta,
  workflowStages,
  type ComposerMode,
  type Contact,
  type MaterialOrder,
  type MaterialOrderStatus,
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
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCircle,
  UserPlus,
  X,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";

type ContentTab = "overview" | "activity" | "measurements" | "proposals" | "documents" | "invoices" | "production";

export function JobWorkspace() {
  const [selectedMode, setSelectedMode] = useState<ComposerMode>("note");
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("all");
  const [toast, setToast] = useState("");
  const [errorBanner, setErrorBanner] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([defaultSecondaryContact]);
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>(initialMaterialOrders);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [jobLabels] = useState<string[]>(["Garage"]);
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [jobIndex, setJobIndex] = useState(1);
  const jobTotal = 11;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft")  setJobIndex((i) => Math.max(1, i - 1));
      if (e.key === "ArrowRight") setJobIndex((i) => Math.min(jobTotal, i + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, title: "Review estimate with Hannah", priority: "high", dueDate: "Jun 5, 2026", tags: ["Estimate", "Homeowner"] },
    { id: 2, title: "Confirm material selections", priority: "medium", dueDate: "Jun 6, 2026", tags: ["Materials"] },
    { id: 3, title: "Send proposal once approved", priority: "medium", tags: ["Proposal"] }
  ]);

  const selected = actionConfig[selectedMode] as {
    label: string;
    cta: string;
    success: string;
    timelineTitle: string;
  };

  const filteredTimeline = useMemo(
    () => timeline.filter((item) => matchesTimelineFilter(item, timelineFilter)),
    [timeline, timelineFilter]
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function submitComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setInlineSuccess("");
    setErrorBanner("");

    window.setTimeout(() => {
      const title =
        String(formData.get("title") || formData.get("subject") || selected.timelineTitle) ||
        selected.timelineTitle;
      const detail =
        String(formData.get("description") || formData.get("message") || "Added from workspace.") ||
        "Added from workspace.";

      setTimeline((items) => [
        {
          id: Date.now(),
          type: selectedMode,
          title: selected.timelineTitle,
          detail: title === selected.timelineTitle ? detail : `${title}: ${detail}`,
          time: nowLabel()
        },
        ...items
      ]);
      const toastMap: Record<ComposerMode, string> = {
        note: "✓ Note Saved",
        task: "✓ Task Created",
        email: "✓ Email Sent",
        message: "✓ Message Sent"
      };
      setInlineSuccess(selected.success);
      showToast(toastMap[selectedMode]);
      setIsSubmitting(false);
      form.reset();
    }, 700);
  }

  function completeTask(taskId: number, taskTitle: string) {
    setTasks((items) => items.filter((task) => task.id !== taskId));
    setTimeline((items) => [
      {
        id: Date.now(),
        type: "task",
        title: "Task Completed",
        detail: taskTitle,
        time: nowLabel()
      },
      ...items
    ]);
    showToast("Task completed");
  }

  function addContact(contact: Contact) {
    const exists = contacts.some(
      (c) => c.email === contact.email && c.firstName === contact.firstName && c.lastName === contact.lastName
    );
    if (!exists) {
      setContacts((items) => [...items, contact]);
    }
    setIsDrawerOpen(false);
    showToast("✓ Contact Added");
    setTimeline((items) => [
      {
        id: Date.now(),
        type: "contact",
        title: "Contact Added",
        detail: `${contact.firstName} ${contact.lastName}, ${contact.relationship}`,
        time: nowLabel()
      },
      ...items
    ]);
  }

  return (
    <AppShell
      jobIndex={jobIndex}
      jobTotal={jobTotal}
      onPrev={() => setJobIndex((i) => Math.max(1, i - 1))}
      onNext={() => setJobIndex((i) => Math.min(jobTotal, i + 1))}
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

        <JobHero onCreateProposal={() => showToast("✓ Proposal draft started")} labels={jobLabels} />

        <ContentTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activityCount={timeline.length}
          documentCount={5}
          proposalCount={2}
          productionCount={materialOrders.length + workOrders.length}
        />

        <section className="layout-shell">
          {/* Left rail — content switches per tab */}
          <div className="left-rail">
            {activeTab === "overview" && (
              <>
                <JobInfoCard />
                <FinancialSummary />
                <ActivityComposer
                  selectedMode={selectedMode}
                  setSelectedMode={setSelectedMode}
                  submitComposer={submitComposer}
                  isSubmitting={isSubmitting}
                  inlineSuccess={inlineSuccess}
                />
              </>
            )}
            {activeTab === "activity" && (
              <ActivityTimeline
                timeline={filteredTimeline}
                filter={timelineFilter}
                onFilterChange={setTimelineFilter}
              />
            )}
            {activeTab === "measurements" && <MeasurementsView />}
            {activeTab === "documents" && <DocumentsView />}
            {activeTab === "proposals" && (
              <ProposalsView onCreateProposal={() => showToast("✓ Proposal draft started")} />
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

          {/* Right rail — always visible regardless of active tab */}
          <aside className="right-rail">
            <AiRecommendations
              onAction={(action) => {
                if (action === "proposal") showToast("✓ Proposal draft started");
                if (action === "message") setSelectedMode("message");
                if (action === "notes") setSelectedMode("note");
                if (action === "message" || action === "notes") {
                  setActiveTab("overview");
                  window.setTimeout(() => {
                    document.querySelector(".composer-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }
              }}
            />
            <TasksCard tasks={tasks} completeTask={completeTask} openTaskDrawer={() => setIsTaskDrawerOpen(true)} />
            <ContactsCard contacts={contacts} openDrawer={() => setIsDrawerOpen(true)} />
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

        <MobileChrome selectedMode={selectedMode} setSelectedMode={setSelectedMode} />

        {toast ? (
          <div className="toast toast-top" role="status">
            <Check size={16} aria-hidden="true" />
            {toast}
          </div>
        ) : null}

        {isDrawerOpen ? (
          <ContactDrawer onClose={() => setIsDrawerOpen(false)} onSave={addContact} />
        ) : null}
        {isTaskDrawerOpen ? (
          <AddTaskDrawer
            onClose={() => setIsTaskDrawerOpen(false)}
            onSave={(task) => {
              setTasks((prev) => [...prev, { id: Date.now(), ...task }]);
              setIsTaskDrawerOpen(false);
              showToast("✓ Task added");
            }}
          />
        ) : null}
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

/* ── Job Hero (compact unified card with embedded pipeline) ──────── */
function JobHero({ onCreateProposal, labels = [] }: { onCreateProposal: () => void; labels?: string[] }) {
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
          <img
            src={photoSrc}
            alt="Weiss property exterior"
            className="lightbox-img"
          />
        </div>
      )}

      {/* Top row: identity | metrics | actions */}
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
            <h1 className="page-title">Hannah Weiss</h1>
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

      {/* Pipeline strip — bottom of hero card */}
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
                  {stage.statusLabel && <span className="step-badge">{stage.statusLabel}</span>}
                  {stage.status === "current" && (
                    <span className="step-days-in">12 days</span>
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
  productionCount
}: {
  activeTab: ContentTab;
  setActiveTab: (tab: ContentTab) => void;
  activityCount: number;
  documentCount: number;
  proposalCount: number;
  productionCount: number;
}) {
  const tabs: { id: ContentTab; label: string; count?: number }[] = [
    { id: "overview",     label: "Overview" },
    { id: "activity",     label: "Activity",     count: activityCount },
    { id: "measurements", label: "Measurements" },
    { id: "proposals",    label: "Proposals",    count: proposalCount },
    { id: "documents",    label: "Documents",    count: documentCount },
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
  { id: 1, label: "North face — hail damage",  date: "Jun 2, 2026", color: "#e2e8f0" },
  { id: 2, label: "South ridge — cracked shingle", date: "Jun 2, 2026", color: "#cbd5e1" },
  { id: 3, label: "Gutter damage — east side",   date: "Jun 2, 2026", color: "#94a3b8" },
  { id: 4, label: "Skylight flashing",           date: "Jun 2, 2026", color: "#64748b" },
  { id: 5, label: "Overall roof — aerial",       date: "Jun 2, 2026", color: "#475569" },
  { id: 6, label: "Interior water damage",       date: "Jun 3, 2026", color: "#334155" },
];

function DocumentsView() {
  return (
    <div className="tab-content-inner">
      {/* Damage photos */}
      <div className="tab-section-head">
        <h2 className="section-title">
          <Image size={15} aria-hidden="true" />
          Damage Photos
        </h2>
        <span className="count-pill">{mockPhotos.length}</span>
        <button type="button" className="button ghost compact" style={{ marginLeft: "auto" }}>
          <Plus size={14} />
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

      {/* Documents */}
      <div className="tab-section-head" style={{ marginTop: 24 }}>
        <h2 className="section-title">Documents</h2>
        <button type="button" className="button ghost compact" style={{ marginLeft: "auto" }}>
          <Plus size={14} />
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
    </div>
  );
}

/* ── Proposals View ────────────────────────────────────────────── */
function ProposalsView({ onCreateProposal }: { onCreateProposal: () => void }) {
  return (
    <div className="tab-content-inner">
      <div className="tab-section-head">
        <h2 className="section-title">Proposals</h2>
        <button type="button" className="button primary compact" onClick={onCreateProposal}>
          <FileCheck2 size={14} />
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
              <div className="line-item-row">
                <span className="item-label">Architectural shingle — full replace</span>
                <span className="item-value">$11,200</span>
              </div>
              <div className="line-item-row">
                <span className="item-label">Labor & installation</span>
                <span className="item-value">$4,800</span>
              </div>
              <div className="line-item-row">
                <span className="item-label">Gutters & fascia repair</span>
                <span className="item-value">$1,650</span>
              </div>
              <div className="line-item-row">
                <span className="item-label">Permit & disposal</span>
                <span className="item-value">$800</span>
              </div>
            </div>
          </div>
          <div>
            <span className="proposal-status-badge sent">Sent · Under Review</span>
          </div>
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
          <div>
            <span className="proposal-status-badge draft">Draft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Recommended Next Step (guidance only — no CTA) ────────────── */
function RecommendedNextStep() {
  return (
    <div className="next-step-strip surface">
      <span className="next-step-label">
        <Zap size={13} aria-hidden="true" />
        Recommended next step
      </span>
      <p className="next-step-message">
        Inspection completed Jun 2 · Proposal package is ready to send · 84% close probability.
      </p>
    </div>
  );
}

/* ── Activity Composer ─────────────────────────────────────────── */
function ActivityComposer({
  selectedMode,
  setSelectedMode,
  submitComposer,
  isSubmitting,
  inlineSuccess
}: {
  selectedMode: ComposerMode;
  setSelectedMode: (mode: ComposerMode) => void;
  submitComposer: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  inlineSuccess: string;
}) {
  const selected = actionConfig[selectedMode] as { label: string; cta: string };
  const [emailTemplate, setEmailTemplate] = useState("Proposal Follow-up");
  const [messageTemplate, setMessageTemplate] = useState("Proposal Sent");
  const [composerKey, setComposerKey] = useState(0);

  const emailDefaults = emailTemplates[emailTemplate];
  const messageDefault = messageTemplates[messageTemplate];

  function applyTemplate(name: string) {
    if (selectedMode === "email") {
      setEmailTemplate(name);
      setComposerKey((k) => k + 1);
    } else if (selectedMode === "message") {
      setMessageTemplate(name);
      setComposerKey((k) => k + 1);
    }
  }

  return (
    <section className="surface composer-panel flow-order-4">
      <div className="panel-head">
        <h2 className="section-title">Log Activity</h2>
      </div>
      <div className="segmented" role="tablist" aria-label="Activity type">
        {(Object.keys(actionConfig) as ComposerMode[]).map((mode) => {
          const item = actionConfig[mode] as { label: string; icon: typeof FileCheck2 };
          const Icon = item.icon;
          return (
            <button
              key={mode}
              className={mode === selectedMode ? "segment active" : "segment"}
              onClick={() => setSelectedMode(mode)}
              type="button"
              role="tab"
              aria-selected={mode === selectedMode}
            >
              <Icon size={16} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="composer-body composer-fade" key={`${selectedMode}-${composerKey}`}>
        {(selectedMode === "email" || selectedMode === "message") && (
          <div className="template-chips" role="group" aria-label="Smart templates">
            {selectedMode === "email"
              ? Object.keys(emailTemplates).map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={emailTemplate === name ? "chip active" : "chip"}
                    onClick={() => applyTemplate(name)}
                  >
                    {name}
                  </button>
                ))
              : Object.keys(messageTemplates).map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={messageTemplate === name ? "chip active" : "chip"}
                    onClick={() => applyTemplate(name)}
                  >
                    {name}
                  </button>
                ))}
          </div>
        )}

        <form className="composer-form" onSubmit={submitComposer}>
          {selectedMode === "email" ? (
            <>
              <label>
                <span className="text-label">To</span>
                <input name="to" defaultValue="hannah.weiss@example.com" />
              </label>
              <label>
                <span className="text-label">Subject</span>
                <input name="subject" defaultValue={emailDefaults.subject} />
              </label>
              <label>
                <span className="text-label">Message</span>
                <span className="suggested-draft-label">
                  <Sparkles size={11} aria-hidden="true" />
                  Suggested draft
                </span>
                <textarea name="message" className="composer-textarea" defaultValue={emailDefaults.message} />
              </label>
            </>
          ) : selectedMode === "message" ? (
            <>
              <label>
                <span className="text-label">To</span>
                <input name="to" defaultValue="+1 (512) 555-0148" />
              </label>
              <label>
                <span className="text-label">Message</span>
                <span className="suggested-draft-label">
                  <Sparkles size={11} aria-hidden="true" />
                  Suggested draft
                </span>
                <textarea name="message" className="composer-textarea" defaultValue={messageDefault} />
              </label>
            </>
          ) : (
            <>
              <label>
                <span className="text-label">{selectedMode === "task" ? "Task" : "Note"}</span>
                <input
                  name="title"
                  placeholder={selectedMode === "task" ? "What needs to happen?" : "Quick headline"}
                  defaultValue={selectedMode === "task" ? "Follow up proposal" : "Homeowner update"}
                />
              </label>
              <label>
                <span className="text-label">Details</span>
                <textarea
                  name="description"
                  className="composer-textarea"
                  placeholder="Add context your team should see…"
                  defaultValue={
                    selectedMode === "task"
                      ? "Call homeowner after proposal is sent."
                      : "Homeowner asked about deductible timing and production schedule."
                  }
                />
              </label>
            </>
          )}

          <div className="composer-actions">
            <button className="button ghost" type="button">
              <Paperclip size={16} aria-hidden="true" />
              Attach
            </button>
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="spin" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
              {isSubmitting ? "Sending…" : selected.cta}
            </button>
          </div>
        </form>
      </div>

      {inlineSuccess ? (
        <div className="inline-success" role="status">
          <Check size={16} aria-hidden="true" />
          {inlineSuccess}
        </div>
      ) : null}
    </section>
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
  onFilterChange
}: {
  timeline: TimelineItem[];
  filter: TimelineFilter;
  onFilterChange: (f: TimelineFilter) => void;
}) {
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
            return (
              <article className={`timeline-card ${meta.colorClass}`} key={item.id}>
                <div className={`timeline-icon ${meta.colorClass}`}>
                  <Icon size={15} aria-hidden="true" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <h3>{item.title}</h3>
                    <time className="text-meta">{item.time}</time>
                  </div>
                  <p className="text-secondary">{item.detail}</p>
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

/* ── Progress Card ─────────────────────────────────────────────── */
function ProgressCard() {
  return (
    <section className="surface side-card progress-card flow-order-10">
      <h2 className="section-title">Job progress</h2>
      <ol className="workflow-list">
        {workflowStages.map((stage) => (
          <li key={stage.id} className={`workflow-row ${stage.status}`}>
            <span className="workflow-marker" aria-hidden="true">
              {stage.status === "done" ? <Check size={12} /> : stage.status === "current" ? "◉" : "○"}
            </span>
            <div className="workflow-copy">
              <div className="workflow-title-row">
                <strong>{stage.label}</strong>
                {stage.dateLabel ? <span className="text-meta">{stage.dateLabel}</span> : null}
                {stage.statusLabel ? <span className="status-tag">{stage.statusLabel}</span> : null}
              </div>
              {stage.owner ? <span className="text-meta">Owner · {stage.owner}</span> : null}
              {stage.notes ? <span className="text-secondary workflow-summary">{stage.notes}</span> : null}
            </div>
            {stage.notes || stage.owner ? (
              <div className="workflow-tooltip" role="tooltip">
                <span className="text-label">Completion details</span>
                <span className="text-meta">{stage.dateLabel ?? stage.statusLabel ?? "Pending"}</span>
                <span>{stage.owner ?? "Unassigned"}</span>
                <p>{stage.notes ?? "No additional notes."}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
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
function ContactBlock({ contact }: { contact: Contact }) {
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
          <button type="button" className="icon-button small" aria-label={`Call ${contact.firstName}`} title="Call">
            <Phone size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`Email ${contact.firstName}`} title="Email">
            <Mail size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`Message ${contact.firstName}`} title="Message">
            <MessageSquare size={14} />
          </button>
          <button type="button" className="icon-button small" aria-label={`View history for ${contact.firstName}`} title="View history">
            <FileText size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Contacts Card ─────────────────────────────────────────────── */
function ContactsCard({
  contacts,
  openDrawer
}: {
  contacts: Contact[];
  openDrawer: () => void;
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
            <ContactBlock contact={primaryContact} />
            {contacts.map((contact) => (
              <ContactBlock key={`${contact.email}-${contact.phone}`} contact={contact} />
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
  openTaskDrawer
}: {
  tasks: TaskItem[];
  completeTask: (taskId: number, taskTitle: string) => void;
  openTaskDrawer: () => void;
}) {
  return (
    <section className="surface side-card tasks-card flow-order-8">
      <div className="panel-head">
        <div className="panel-title-group">
          <h2 className="section-title">Today&apos;s tasks</h2>
          <span className="count-pill">{tasks.length}</span>
        </div>
        <div className="tasks-header-actions">
          <button className="text-link" type="button" onClick={openTaskDrawer}>
            <Plus size={14} aria-hidden="true" />
            Add task
          </button>
          <span className="tasks-header-sep">·</span>
          <button className="text-link" type="button" onClick={() => {}}>
            View all
          </button>
        </div>
      </div>
      <div className="task-list">
        {tasks.length ? (
          tasks.map((task) => (
            <label className="task-row" key={task.id}>
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
                    {task.dueDate && <span className="task-due">{task.dueDate}</span>}
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
  { id: "filed",     label: "Filed" },
  { id: "adjuster",  label: "Adjuster" },
  { id: "acv",       label: "ACV" },
  { id: "supplement",label: "Supplement" },
  { id: "rcv",       label: "RCV" },
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
      {/* Claim progress pipeline */}
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

      {/* Supplement */}
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

      {/* Fields */}
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

/* ── Job Info Card (Overview left rail) ────────────────────────── */
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

  function startEdit() {
    setDraft(data);
    setEditing(true);
  }

  function handleSave() {
    setData(draft);
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <section className={`surface job-info-card${editing ? " job-info-editing" : ""}`}>
      <div className="panel-head">
        <h2 className="section-title">Job Details</h2>
        <span className="job-info-timestamps">
          Created May 27, 2026 · Updated today
        </span>
        {!editing && (
          <button type="button" className="text-link" onClick={startEdit}>
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
              <input
                type="text"
                className="job-info-input"
                value={draft.closeDate}
                onChange={(e) => setDraft((d) => ({ ...d, closeDate: e.target.value }))}
                placeholder="e.g. Jun 20, 2026"
              />
            </label>
            <label className="job-info-field">
              <span className="text-label">Job value</span>
              <input
                type="text"
                className="job-info-input"
                value={draft.jobValue}
                onChange={(e) => setDraft((d) => ({ ...d, jobValue: e.target.value }))}
                placeholder="$0.00"
              />
            </label>
            <label className="job-info-field">
              <span className="text-label">Assignee</span>
              <select className="job-info-input" value={draft.assignee} onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}>
                <option>Dana Kim</option>
                <option>Marcus Lee</option>
                <option>Sarah Chen</option>
              </select>
            </label>
            <label className="job-info-field">
              <span className="text-label">Source</span>
              <select className="job-info-input" value={draft.source} onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}>
                <option>Referral</option>
                <option>Website form</option>
                <option>Door-to-door</option>
                <option>Google Ads</option>
                <option>Insurance claim</option>
              </select>
            </label>
          </div>
          <label className="job-info-field" style={{ marginBottom: 14 }}>
            <span className="text-label">Description</span>
            <textarea
              className="description-textarea"
              style={{ marginTop: 5 }}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Add key details: material preferences, best time to contact, next steps…"
              rows={3}
              autoFocus
            />
          </label>
          <div className="job-info-edit-actions">
            <button type="button" className="button ghost compact" onClick={handleCancel}>Cancel</button>
            <button type="button" className="button primary compact" onClick={handleSave}>Save changes</button>
          </div>
        </>
      ) : (
        <>
          <div className="job-info-tiles">
            <div className="job-info-tile">
              <div className="job-info-tile-head">
                <CircleDollarSign size={13} aria-hidden="true" />
                <span className="job-info-tile-label">Job value</span>
              </div>
              <span className="job-info-tile-data">{data.jobValue}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head">
                <CalendarDays size={13} aria-hidden="true" />
                <span className="job-info-tile-label">Close date</span>
              </div>
              <span className="job-info-tile-data">{data.closeDate}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head">
                <UserCircle size={13} aria-hidden="true" />
                <span className="job-info-tile-label">Assignee</span>
              </div>
              <span className="job-info-tile-data">{data.assignee}</span>
            </div>
            <div className="job-info-tile">
              <div className="job-info-tile-head">
                <Flame size={13} aria-hidden="true" />
                <span className="job-info-tile-label">Source</span>
              </div>
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

function JobDetailsFields() {
  return (
    <dl className="field-list metadata-fields">
      <div>
        <dt className="text-label">Close date</dt>
        <dd>Jun 20, 2026</dd>
      </div>
      <div>
        <dt className="text-label">Stage</dt>
        <dd>Estimate — In Review</dd>
      </div>
      <div>
        <dt className="text-label">Type</dt>
        <dd>Residential</dd>
      </div>
      <div>
        <dt className="text-label">Lead source</dt>
        <dd>Referral</dd>
      </div>
      <div>
        <dt className="text-label">Location</dt>
        <dd>Dripping Springs Branch</dd>
      </div>
      <div>
        <dt className="text-label">Roof type</dt>
        <dd>Architectural Shingle</dd>
      </div>
      <div>
        <dt className="text-label">Roof age</dt>
        <dd>14 years</dd>
      </div>
      <div>
        <dt className="text-label">Damage type</dt>
        <dd>Hail damage</dd>
      </div>
      <div>
        <dt className="text-label">Sq footage</dt>
        <dd>2,400 sq ft</dd>
      </div>
      <div>
        <dt className="text-label">Stories</dt>
        <dd>2</dd>
      </div>
      <div>
        <dt className="text-label">Gated community</dt>
        <dd>No</dd>
      </div>
      <div>
        <dt className="text-label">Gate code</dt>
        <dd className="text-secondary">—</dd>
      </div>
      <div>
        <dt className="text-label">Job value</dt>
        <dd>$18,450</dd>
      </div>
      <div>
        <dt className="text-label">Assigned rep</dt>
        <dd>Dana Kim</dd>
      </div>
      <div>
        <dt className="text-label">Subcontractors</dt>
        <dd className="text-secondary">None assigned</dd>
      </div>
    </dl>
  );
}

/* ── Description Card ─────────────────────────────────────────── */
function DescriptionCard() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [draft, setDraft] = useState("");

  function startEditing() {
    setDraft(value);
    setEditing(true);
    if (!open) setOpen(true);
  }

  function handleSave() {
    setValue(draft.trim());
    setEditing(false);
  }

  function handleCancel() {
    setDraft("");
    setEditing(false);
  }

  return (
    <section className={`surface side-card description-card collapsible flow-order-12${open ? " open" : ""}`}>
      <button type="button" className="collapse-trigger" onClick={() => { if (!editing) setOpen((v) => !v); }} aria-expanded={open}>
        <div className="collapse-heading-group">
          <h2 className="section-title">Description</h2>
          {!open && value && (
            <p className="collapse-subtitle">
              {value.slice(0, 52) + (value.length > 52 ? "…" : "")}
            </p>
          )}
        </div>
        <ChevronDown size={18} className="collapse-chevron" aria-hidden="true" />
      </button>
      <div className="collapse-body">
        {open && (
          editing ? (
            <div className="description-editor">
              <textarea
                className="description-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                placeholder="Add key details: material preferences, best time to contact, next steps…"
                rows={4}
              />
              <div className="description-actions">
                <button type="button" className="button ghost compact" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="button primary compact" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          ) : value ? (
            <div className="description-saved">
              <p className="description-text">{value}</p>
              <button type="button" className="text-link description-edit-btn" onClick={startEditing}>
                <Pencil size={12} aria-hidden="true" />
                Edit
              </button>
            </div>
          ) : (
            <button type="button" className="description-empty-trigger" onClick={startEditing}>
              <Plus size={14} aria-hidden="true" />
              Add a description
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

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <section className={`surface side-card tags-card collapsible flow-order-13${open ? " open" : ""}`}>
      <button type="button" className="collapse-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="collapse-heading-group">
          <h2 className="section-title">
            Tags
            {tags.length > 0 && <span className="count-pill">{tags.length}</span>}
          </h2>
          {!open && tags.length > 0 && (
            <p className="collapse-subtitle">
              {tags.slice(0, 3).join(" · ")}
            </p>
          )}
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
                  <button type="button" className="tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
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
                <Plus size={14} aria-hidden="true" />
                Add tag
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
  title,
  subtitle,
  children,
  className = "",
  defaultOpen = true,
  icon
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`surface side-card collapsible ${className} ${open ? "open" : ""}`}>
      <button
        type="button"
        className="collapse-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="collapse-heading-group">
          <h2 className="section-title">
            {icon}
            {title}
          </h2>
          {!open && subtitle && (
            <p className="collapse-subtitle">{subtitle}</p>
          )}
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

  function startEdit() { setDraft(dims); setEditing(true); }
  function handleSave() { setDims(draft); setEditing(false); }
  function handleCancel() { setEditing(false); }

  const dimFields: { key: keyof RoofDims; label: string }[] = [
    { key: "totalSquares", label: "Total squares" },
    { key: "pitch",        label: "Pitch" },
    { key: "layers",       label: "Layers" },
    { key: "eaveLength",   label: "Eave length" },
    { key: "ridgeLength",  label: "Ridge length" },
    { key: "hipValley",    label: "Hip / Valley" },
    { key: "dripEdge",     label: "Drip edge" },
    { key: "wasteFactor",  label: "Waste factor" },
  ];

  const materialTiles = [
    { label: "Shingles needed", value: "31.4 SQ", note: "incl. waste" },
    { label: "Underlayment",    value: "10 rolls" },
    { label: "Ice & water",     value: "2 rolls" },
    { label: "Ridge cap",       value: "4 bundles" },
    { label: "Drip edge",       value: "8 sticks" },
  ];

  return (
    <div className="measurements-view">
      <section className={`surface measurements-card${editing ? " job-info-editing" : ""}`}>
        <div className="panel-head">
          <h2 className="section-title">
            <Ruler size={15} aria-hidden="true" />
            Roof Dimensions
          </h2>
          {!editing && (
            <button type="button" className="text-link" onClick={startEdit}>
              <Pencil size={13} aria-hidden="true" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <>
            <div className="meas-edit-grid">
              {dimFields.map(({ key, label }) => (
                <label key={key} className="job-info-field">
                  <span className="text-label">{label}</span>
                  <input
                    type="text"
                    className="job-info-input"
                    value={draft[key]}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
            <div className="job-info-edit-actions">
              <button type="button" className="button ghost compact" onClick={handleCancel}>Cancel</button>
              <button type="button" className="button primary compact" onClick={handleSave}>Save changes</button>
            </div>
          </>
        ) : (
          <div className="meas-tiles">
            {dimFields.map(({ key, label }) => (
              <div key={key} className="job-info-tile">
                <div className="job-info-tile-head">
                  <span className="job-info-tile-label">{label}</span>
                </div>
                <span className="job-info-tile-data">{dims[key]}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface measurements-card">
        <div className="panel-head">
          <h2 className="section-title">Material Estimates</h2>
        </div>
        <div className="meas-tiles">
          {materialTiles.map(({ label, value, note }) => (
            <div key={label} className="job-info-tile">
              <div className="job-info-tile-head">
                <span className="job-info-tile-label">{label}</span>
              </div>
              <span className="job-info-tile-data">
                {value}
                {note && <span className="meas-tile-note"> ({note})</span>}
              </span>
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

  function startEdit(note: MeasNote) {
    setEditingId(note.id);
    setEditDraft(note.text);
  }

  function saveEdit() {
    if (!editDraft.trim()) return;
    setNotes((ns) => ns.map((n) => n.id === editingId ? { ...n, text: editDraft.trim() } : n));
    setEditingId(null);
  }

  function cancelEdit() { setEditingId(null); }

  function deleteNote(id: number) {
    setNotes((ns) => ns.filter((n) => n.id !== id));
  }

  function saveNew() {
    if (!newDraft.trim()) return;
    setNotes((ns) => [...ns, { id: Date.now(), text: newDraft.trim(), date: "Jun 5, 2026" }]);
    setNewDraft("");
    setAdding(false);
  }

  function cancelNew() { setNewDraft(""); setAdding(false); }

  return (
    <section className="surface measurements-card">
      <div className="panel-head">
        <h2 className="section-title">Notes</h2>
        {!adding && (
          <button type="button" className="text-link" onClick={() => setAdding(true)}>
            <Plus size={13} aria-hidden="true" />
            Add note
          </button>
        )}
      </div>

      <div className="meas-notes-list">
        {notes.map((note) => (
          <div key={note.id} className="meas-note-item">
            {editingId === note.id ? (
              <div className="meas-note-edit">
                <textarea
                  className="description-textarea"
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  autoFocus
                  rows={2}
                />
                <div className="description-actions">
                  <button type="button" className="button ghost compact" onClick={cancelEdit}>Cancel</button>
                  <button type="button" className="button primary compact" onClick={saveEdit}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="meas-note-text">{note.text}</p>
                <div className="meas-note-meta">
                  <span className="text-meta">{note.date}</span>
                  <div className="meas-note-actions">
                    <button type="button" className="icon-button small" onClick={() => startEdit(note)} aria-label="Edit note" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button type="button" className="icon-button small meas-note-delete" onClick={() => deleteNote(note.id)} aria-label="Delete note" title="Delete">
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
            <textarea
              className="description-textarea"
              value={newDraft}
              onChange={(e) => setNewDraft(e.target.value)}
              autoFocus
              rows={2}
              placeholder="Add a note…"
            />
            <div className="description-actions">
              <button type="button" className="button ghost compact" onClick={cancelNew}>Cancel</button>
              <button type="button" className="button primary compact" onClick={saveNew}>Save</button>
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
          <button className="button ghost compact" type="button">
            <Plus size={14} aria-hidden="true" />
            Create Invoice
          </button>
        </div>

        <div className="invoices-summary">
          <div className="inv-summary-row">
            <span className="text-secondary">Job value</span>
            <strong>$18,450</strong>
          </div>
          <div className="inv-summary-row">
            <span className="text-secondary">Total invoiced</span>
            <strong>$0</strong>
          </div>
          <div className="inv-summary-row">
            <span className="text-secondary">Balance due</span>
            <strong className="inv-balance-due">$18,450</strong>
          </div>
        </div>

        <div className="invoices-empty">
          <p className="text-secondary">No invoices yet. Invoices are typically created after the proposal is signed and work is scheduled.</p>
          <button className="button primary compact" type="button">
            <Plus size={14} aria-hidden="true" />
            Create first invoice
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Production View ───────────────────────────────────────────── */
const materialStatusMeta: Record<MaterialOrderStatus, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "prod-status prod-status-pending" },
  ordered:    { label: "Ordered",    className: "prod-status prod-status-ordered" },
  "in-transit": { label: "In transit", className: "prod-status prod-status-transit" },
  delivered:  { label: "Delivered",  className: "prod-status prod-status-delivered" },
  cancelled:  { label: "Cancelled",  className: "prod-status prod-status-cancelled" },
};

const workStatusMeta: Record<WorkOrderStatus, { label: string; className: string }> = {
  "not-scheduled": { label: "Not scheduled", className: "prod-status prod-status-pending" },
  scheduled:       { label: "Scheduled",      className: "prod-status prod-status-ordered" },
  "in-progress":   { label: "In progress",    className: "prod-status prod-status-transit" },
  complete:        { label: "Complete",        className: "prod-status prod-status-delivered" },
};

function ProductionView({
  materialOrders,
  setMaterialOrders,
  workOrders,
  setWorkOrders
}: {
  materialOrders: MaterialOrder[];
  setMaterialOrders: (orders: MaterialOrder[]) => void;
  workOrders: WorkOrder[];
  setWorkOrders: (orders: WorkOrder[]) => void;
}) {
  const [isMaterialDrawerOpen, setIsMaterialDrawerOpen] = useState(false);
  const [isWorkDrawerOpen, setIsWorkDrawerOpen] = useState(false);
  const materialTotal = materialOrders.reduce((sum, o) => sum + o.qty * o.unitCost, 0);

  return (
    <div className="production-view">
      {isMaterialDrawerOpen && (
        <AddMaterialOrderDrawer
          onClose={() => setIsMaterialDrawerOpen(false)}
          onSave={(order) => {
            setMaterialOrders([...materialOrders, { ...order, id: Date.now() }]);
            setIsMaterialDrawerOpen(false);
          }}
        />
      )}
      {isWorkDrawerOpen && (
        <AddWorkOrderDrawer
          onClose={() => setIsWorkDrawerOpen(false)}
          onSave={(order) => {
            setWorkOrders([...workOrders, { ...order, id: Date.now() }]);
            setIsWorkDrawerOpen(false);
          }}
        />
      )}

      {/* Material Orders */}
      <section className="surface production-card">
        <div className="panel-head">
          <div className="panel-title-group">
            <h2 className="section-title">Material Orders</h2>
            <span className="count-pill">{materialOrders.length}</span>
          </div>
          <button className="text-link" type="button" onClick={() => setIsMaterialDrawerOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            Add order
          </button>
        </div>

        {materialOrders.length === 0 ? (
          <div className="prod-empty">
            <p className="text-secondary">No material orders yet.</p>
            <button className="button ghost compact" type="button" onClick={() => setIsMaterialDrawerOpen(true)}>
              <Plus size={14} /> Add first order
            </button>
          </div>
        ) : (
          <>
            <div className="prod-table-wrap">
              <table className="prod-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="prod-th-num">Qty</th>
                    <th>Unit</th>
                    <th>Supplier</th>
                    <th className="prod-th-num">Unit cost</th>
                    <th className="prod-th-num">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {materialOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="prod-td-item">{order.item}</td>
                      <td className="prod-td-num">{order.qty}</td>
                      <td className="prod-td-muted">{order.unit}</td>
                      <td className="prod-td-muted">{order.supplier || "—"}</td>
                      <td className="prod-td-num">{order.unitCost > 0 ? `$${order.unitCost.toLocaleString()}` : "—"}</td>
                      <td className="prod-td-num prod-td-total">${(order.qty * order.unitCost).toLocaleString()}</td>
                      <td>
                        <span className={materialStatusMeta[order.status].className}>
                          {materialStatusMeta[order.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="prod-total-row">
                    <td colSpan={5}>Est. materials total</td>
                    <td className="prod-td-num">${materialTotal.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="prod-note text-secondary">
              Orders pending — awaiting proposal approval before purchasing.
            </p>
          </>
        )}
      </section>

      {/* Work Orders */}
      <section className="surface production-card">
        <div className="panel-head">
          <div className="panel-title-group">
            <h2 className="section-title">Work Orders</h2>
            <span className="count-pill">{workOrders.length}</span>
          </div>
          <button className="text-link" type="button" onClick={() => setIsWorkDrawerOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            Add work order
          </button>
        </div>

        {workOrders.length === 0 ? (
          <div className="prod-empty">
            <p className="text-secondary">No work orders yet.</p>
            <button className="button ghost compact" type="button" onClick={() => setIsWorkDrawerOpen(true)}>
              <Plus size={14} /> Add first work order
            </button>
          </div>
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
                  <span className={workStatusMeta[wo.status].className}>
                    {workStatusMeta[wo.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Add Material Order Drawer ─────────────────────────────────── */
function AddMaterialOrderDrawer({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (order: Omit<MaterialOrder, "id">) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsSaving(true);
    window.setTimeout(() => {
      onSave({
        item: String(data.get("item") || ""),
        qty: Number(data.get("qty") || 1),
        unit: String(data.get("unit") || "unit"),
        supplier: String(data.get("supplier") || ""),
        status: String(data.get("status") || "pending") as MaterialOrderStatus,
        unitCost: Number(data.get("unitCost") || 0)
      });
      setIsSaving(false);
    }, 700);
  }

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add material order">
        <div className="drawer-header">
          <h2 className="section-title">Add Material Order</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>
        {isSaving ? (
          <div className="drawer-loading" role="status" aria-live="polite">
            <Loader2 className="spin" size={22} aria-hidden="true" />
            <strong>Saving…</strong>
          </div>
        ) : null}
        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submit}>
          <label>
            <span className="text-label">Item</span>
            <input name="item" placeholder="e.g. Architectural Shingles — IKO Dynasty" required autoFocus />
          </label>
          <div className="two-col">
            <label>
              <span className="text-label">Qty</span>
              <input name="qty" type="number" min="0" step="0.1" defaultValue="1" />
            </label>
            <label>
              <span className="text-label">Unit</span>
              <select name="unit" defaultValue="SQ">
                <option>SQ</option>
                <option>bundle</option>
                <option>roll</option>
                <option>box</option>
                <option>stick</option>
                <option>sheet</option>
                <option>unit</option>
              </select>
            </label>
          </div>
          <label>
            <span className="text-label">Supplier</span>
            <input name="supplier" placeholder="e.g. ABC Supply" />
          </label>
          <label>
            <span className="text-label">Unit cost ($)</span>
            <input name="unitCost" type="number" min="0" step="0.01" defaultValue="0" placeholder="0.00" />
          </label>
          <label>
            <span className="text-label">Status</span>
            <select name="status" defaultValue="pending">
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="in-transit">In transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}
              {isSaving ? "Saving…" : "Add Order"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ── Add Work Order Drawer ──────────────────────────────────────── */
function AddWorkOrderDrawer({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (order: Omit<WorkOrder, "id">) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawDate = String(data.get("scheduledDate") || "");
    const scheduledDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "TBD";
    setIsSaving(true);
    window.setTimeout(() => {
      onSave({
        type: String(data.get("type") || ""),
        crew: String(data.get("crew") || "Dana Kim"),
        scheduledDate,
        status: String(data.get("status") || "not-scheduled") as WorkOrderStatus,
        notes: String(data.get("notes") || "") || undefined
      });
      setIsSaving(false);
    }, 700);
  }

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add work order">
        <div className="drawer-header">
          <h2 className="section-title">Add Work Order</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>
        {isSaving ? (
          <div className="drawer-loading" role="status" aria-live="polite">
            <Loader2 className="spin" size={22} aria-hidden="true" />
            <strong>Saving…</strong>
          </div>
        ) : null}
        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submit}>
          <label>
            <span className="text-label">Work order type</span>
            <input name="type" placeholder="e.g. Full Roof Replacement" required autoFocus />
          </label>
          <label>
            <span className="text-label">Assigned crew</span>
            <input name="crew" placeholder="e.g. Dana Kim" defaultValue="Dana Kim" />
          </label>
          <label>
            <span className="text-label">Scheduled date</span>
            <input name="scheduledDate" type="date" />
          </label>
          <label>
            <span className="text-label">Status</span>
            <select name="status" defaultValue="not-scheduled">
              <option value="not-scheduled">Not scheduled</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In progress</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label>
            <span className="text-label">Notes</span>
            <textarea name="notes" placeholder="Optional notes…" />
          </label>
          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}
              {isSaving ? "Saving…" : "Add Work Order"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ── Add Task Drawer ───────────────────────────────────────────── */
function AddTaskDrawer({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (task: Omit<TaskItem, "id">) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    if (!title) return;
    const rawDate = String(data.get("dueDate") || "");
    const dueDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;
    const rawTags = String(data.get("tags") || "").trim();
    const tags = rawTags ? rawTags.split(",").map((t) => t.trim()).filter(Boolean) : undefined;
    setIsSaving(true);
    window.setTimeout(() => {
      onSave({
        title,
        priority: String(data.get("priority") || "") as TaskPriority || undefined,
        dueDate,
        tags
      });
      setIsSaving(false);
    }, 700);
  }

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close task panel" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add task">
        <div className="drawer-header">
          <h2 className="section-title">Add Task</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        {isSaving ? (
          <div className="drawer-loading" role="status" aria-live="polite">
            <Loader2 className="spin" size={22} aria-hidden="true" />
            <strong>Saving…</strong>
          </div>
        ) : null}

        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submitTask}>
          <label>
            <span className="text-label">Task</span>
            <input name="title" placeholder="e.g. Call adjuster for scope approval" required autoFocus />
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
            <span className="text-label">Tags <span className="text-secondary" style={{fontWeight:400}}>(comma separated)</span></span>
            <input name="tags" placeholder="e.g. estimate, homeowner" />
          </label>
          <label>
            <span className="text-label">Notes</span>
            <textarea name="notes" placeholder="Optional details…" />
          </label>

          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}
              {isSaving ? "Saving…" : "Save Task"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ── Why This Design Works ─────────────────────────────────────── */
function WhyThisDesignWorks() {
  const pillars = [
    {
      title: "Clear Next Actions",
      body: "Sales representatives instantly understand what should happen next."
    },
    {
      title: "Faster Workflow",
      body: "High-frequency actions remain visible and accessible."
    },
    {
      title: "AI-Assisted Selling",
      body: "The platform proactively guides users toward closing opportunities."
    },
    {
      title: "Better Feedback",
      body: "Every action confirms success, reducing uncertainty and increasing confidence."
    },
    {
      title: "Modern SaaS Experience",
      body: "A lighter, cleaner and more premium interface aligned with contemporary software."
    }
  ];

  return (
    <section className="presentation-slide surface" aria-labelledby="why-design-title">
      <p className="text-label accent-label" id="why-design-eyebrow">
        Presentation
      </p>
      <h2 className="page-title" id="why-design-title">
        Why This Design Works
      </h2>
      <div className="pillar-grid">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="pillar-card">
            <h3 className="section-title">{pillar.title}</h3>
            <p className="text-secondary">{pillar.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Mobile Chrome ─────────────────────────────────────────────── */
function MobileChrome({
  selectedMode,
  setSelectedMode
}: {
  selectedMode: ComposerMode;
  setSelectedMode: (mode: ComposerMode) => void;
}) {
  return (
    <>
      <nav className="mobile-action-bar" aria-label="Quick actions">
        {(Object.keys(actionConfig) as ComposerMode[]).map((mode) => {
          const item = actionConfig[mode] as { label: string; icon: typeof FileCheck2 };
          const Icon = item.icon;
          return (
            <button
              key={mode}
              type="button"
              className={mode === selectedMode ? "mobile-action active" : "mobile-action"}
              onClick={() => {
                setSelectedMode(mode);
                document.querySelector(".composer-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ── Contact Drawer ────────────────────────────────────────────── */
function ContactDrawer({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (contact: Contact) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const data = new FormData(event.currentTarget);

    window.setTimeout(() => {
      onSave({
        firstName: String(data.get("firstName") || ""),
        lastName: String(data.get("lastName") || ""),
        relationship: String(data.get("relationship") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
        preferred: String(data.get("preferred") || "Phone"),
        lastInteraction: "Just now",
        responseRate: "—"
      });
      setIsSaving(false);
    }, 900);
  }

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Close contact panel" onClick={onClose} disabled={isSaving} />
      <aside className="drawer" aria-label="Add contact">
        <p className="flow-step text-meta">Step 2 of 4 — Add contact</p>
        <div className="drawer-header">
          <h2 className="section-title">Add Contact</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        {isSaving ? (
          <div className="drawer-loading" role="status" aria-live="polite">
            <Loader2 className="spin" size={22} aria-hidden="true" />
            <strong>Saving…</strong>
            <span className="text-secondary">Step 3 of 4 — Adding contact to this job</span>
          </div>
        ) : null}

        <form className={`drawer-form ${isSaving ? "is-saving" : ""}`} onSubmit={submitContact}>
          <div className="two-col">
            <label>
              <span className="text-label">First Name</span>
              <input name="firstName" placeholder="Michael" required />
            </label>
            <label>
              <span className="text-label">Last Name</span>
              <input name="lastName" placeholder="Weiss" required />
            </label>
          </div>
          <label>
            <span className="text-label">Relationship</span>
            <input name="relationship" placeholder="Spouse" required />
          </label>
          <label>
            <span className="text-label">Phone</span>
            <input name="phone" placeholder="+1 (512) 555-0173" required />
          </label>
          <label>
            <span className="text-label">Email</span>
            <input name="email" placeholder="name@example.com" type="email" required />
          </label>
          <label>
            <span className="text-label">Preferred Contact Method</span>
            <select name="preferred" defaultValue="SMS">
              <option>Phone</option>
              <option>Email</option>
              <option>SMS</option>
            </select>
          </label>

          <div className="drawer-actions">
            <button className="button ghost" type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}
              {isSaving ? "Saving…" : "Save Contact"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
