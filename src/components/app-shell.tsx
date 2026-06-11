"use client";

import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Home,
  MessageSquare,
  PhoneMissed,
  Search,
  Settings,
  Users,
  X
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CommAlerts } from "@/lib/job-data";

const navItems = [
  { id: "home", label: "Home", icon: Home, active: false },
  { id: "jobs", label: "Jobs", icon: Briefcase, active: true },
  { id: "calendar", label: "Calendar", icon: Calendar, active: false },
  { id: "contacts", label: "Contacts", icon: Users, active: false },
  { id: "documents", label: "Documents", icon: FileText, active: false },
  { id: "reports", label: "Reports", icon: BarChart3, active: false }
] as const;

export function AppShell({
  children,
  jobIndex = 1,
  jobTotal = 11,
  onPrev,
  onNext,
  alertCount = 0,
  alerts,
  onAlertAction,
  onDismissAlert
}: {
  children: ReactNode;
  jobIndex?: number;
  jobTotal?: number;
  onPrev?: () => void;
  onNext?: () => void;
  alertCount?: number;
  alerts?: CommAlerts;
  onAlertAction?: (type: string) => void;
  onDismissAlert?: (type: string) => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const bellWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bellOpen) return;
    function handleClick(e: MouseEvent) {
      if (!bellWrapRef.current?.contains(e.target as Node)) setBellOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setBellOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [bellOpen]);

  return (
    <div className="app-root">
      <nav className="icon-rail" aria-label="Main navigation">
        <div className="rail-brand" aria-hidden="true">
          <span className="rail-logo">RP</span>
        </div>
        <div className="rail-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={item.active ? "rail-link active" : "rail-link"}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                title={item.label}
              >
                <Icon size={20} strokeWidth={item.active ? 2.25 : 1.75} />
              </button>
            );
          })}
        </div>
        <button type="button" className="rail-link rail-settings" aria-label="Settings" title="Settings">
          <Settings size={20} strokeWidth={1.75} />
        </button>
      </nav>

      <div className="app-main">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="product-logo">RoofPilot</span>
            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <input type="search" placeholder="Search jobs, contacts, claims…" aria-label="Search" />
              <kbd>Ctrl K</kbd>
            </label>
          </div>
          <div className="top-bar-right">
            <div className="bell-btn-wrap" ref={bellWrapRef}>
              <button
                type="button"
                className="top-icon-btn"
                aria-label={alertCount > 0 ? `Notifications — ${alertCount} alert${alertCount > 1 ? "s" : ""}` : "Notifications"}
                aria-expanded={bellOpen}
                title="Notifications"
                onClick={() => setBellOpen((v) => !v)}
              >
                <Bell size={18} />
                {alertCount > 0 && (
                  <span className="bell-badge" aria-hidden="true">{alertCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="bell-dropdown" role="dialog" aria-label="Notifications">
                  <div className="bell-dropdown-head">
                    <span>Notifications</span>
                    <button
                      type="button"
                      className="bell-dropdown-close"
                      aria-label="Close notifications"
                      onClick={() => setBellOpen(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {(alerts?.total ?? 0) === 0 ? (
                    <div className="bell-empty">
                      <CheckCircle2 size={22} color="var(--green)" aria-hidden="true" />
                      You&rsquo;re all caught up
                    </div>
                  ) : (
                    <>
                      {(alerts?.missedCalls ?? 0) > 0 && (
                        <div className="bell-alert-row">
                          <PhoneMissed size={15} className="bell-alert-icon" color="var(--red)" aria-hidden="true" />
                          <div className="bell-alert-text">
                            <strong>1 missed call</strong> from Hannah Weiss
                            <span className="bell-alert-time">· 11:38 AM</span>
                          </div>
                          <button
                            type="button"
                            className="bell-alert-action"
                            onClick={() => { onAlertAction?.("call"); setBellOpen(false); }}
                          >
                            Call back
                          </button>
                          <button
                            type="button"
                            className="bell-alert-dismiss"
                            aria-label="Dismiss missed call alert"
                            onClick={() => { onDismissAlert?.("missed_call"); }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      {(alerts?.unansweredSms ?? 0) > 0 && (
                        <div className="bell-alert-row">
                          <MessageSquare size={15} className="bell-alert-icon" color="var(--amber)" aria-hidden="true" />
                          <div className="bell-alert-text">
                            <strong>1 unanswered SMS</strong> from Hannah Weiss
                            <span className="bell-alert-time">· 2h ago</span>
                          </div>
                          <button
                            type="button"
                            className="bell-alert-action"
                            onClick={() => { onAlertAction?.("sms"); setBellOpen(false); }}
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            className="bell-alert-dismiss"
                            aria-label="Dismiss SMS alert"
                            onClick={() => { onDismissAlert?.("sms"); }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      {(alerts?.overdueTasks ?? 0) > 0 && (
                        <div className="bell-alert-row">
                          <AlertTriangle size={15} className="bell-alert-icon" color="var(--red)" aria-hidden="true" />
                          <div className="bell-alert-text">
                            <strong>1 overdue task:</strong> Send updated estimate to adjuster
                            <span className="bell-alert-time">· due Jun 9</span>
                          </div>
                          <button
                            type="button"
                            className="bell-alert-action"
                            onClick={() => { onAlertAction?.("task"); setBellOpen(false); }}
                          >
                            View task
                          </button>
                          <button
                            type="button"
                            className="bell-alert-dismiss"
                            aria-label="Dismiss task alert"
                            onClick={() => { onDismissAlert?.("task_overdue"); }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button type="button" className="top-icon-btn" aria-label="Help" title="Help">
              <HelpCircle size={18} />
            </button>
            <button type="button" className="top-icon-btn" aria-label="Settings" title="Settings">
              <Settings size={18} />
            </button>
            <button type="button" className="user-avatar" aria-label="Account menu" title="Account">
              AR
            </button>
          </div>
        </header>

        <div className="breadcrumb-bar">
          <div className="breadcrumb-trail">
            <span>Jobs</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>Job Details</strong>
          </div>
          <div className="job-pager" aria-label="Navigate jobs">
            <span className="pager-kbd-hint" aria-hidden="true">
              <kbd>←</kbd><kbd>→</kbd> to navigate
            </span>
            <button type="button" className="pager-btn" aria-label="Previous job" onClick={onPrev} disabled={jobIndex <= 1}>
              <ChevronLeft size={18} />
            </button>
            <span>{jobIndex} / {jobTotal}</span>
            <button type="button" className="pager-btn" aria-label="Next job" onClick={onNext} disabled={jobIndex >= jobTotal}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
