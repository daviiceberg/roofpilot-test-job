"use client";

import {
  BarChart3,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Home,
  Search,
  Settings,
  Users,
  Bell
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { id: "home", label: "Home", icon: Home, active: false },
  { id: "jobs", label: "Jobs", icon: Briefcase, active: true },
  { id: "calendar", label: "Calendar", icon: Calendar, active: false },
  { id: "contacts", label: "Contacts", icon: Users, active: false },
  { id: "documents", label: "Documents", icon: FileText, active: false },
  { id: "reports", label: "Reports", icon: BarChart3, active: false }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
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
            <button type="button" className="top-icon-btn" aria-label="Notifications" title="Notifications">
              <Bell size={18} />
            </button>
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
            <button type="button" className="pager-btn" aria-label="Previous job">
              <ChevronLeft size={18} />
            </button>
            <span>1 / 11</span>
            <button type="button" className="pager-btn" aria-label="Next job">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
