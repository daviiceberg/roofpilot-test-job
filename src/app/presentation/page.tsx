import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RoofPilot -- UX Redesign Presentation",
};

interface Improvement {
  tag: string;
  color: string;
  title: string;
  before: string;
  after: string;
  outcome?: string;
}

const primaryDecisions: Improvement[] = [
  {
    tag: "Next Step",
    color: "orange",
    title: "Clearer Next Step Guidance",
    before:
      "Sales reps needed to inspect multiple areas of the page before understanding what action should happen next. No single element communicated the priority.",
    after:
      "Pipeline status, job health, AI context and primary actions are surfaced immediately, helping users understand the situation and next recommended step within seconds.",
    outcome: "Reduced cognitive load and faster decision making.",
  },
  {
    tag: "Feedback",
    color: "blue",
    title: "Clear System Feedback",
    before:
      "Actions such as notes, tasks, emails and messages provided limited confirmation after completion. Users were left uncertain whether an action had succeeded.",
    after:
      "Primary actions provide visible feedback through loading states, confirmations and success messaging. Add Task and Add Contact drawers follow a consistent interaction pattern.",
    outcome: "Higher confidence and reduced uncertainty during daily workflows.",
  },
  {
    tag: "Actions",
    color: "green",
    title: "Single Primary CTA -- Clear Hierarchy",
    before:
      "The same Create Proposal action appeared in 3 separate sections (hero, recommended step, AI recommendations), creating visual redundancy and weakening hierarchy.",
    after:
      "One primary CTA in the hero. Recommended next step provides guidance. AI provides intelligence. Each section has a distinct, non-overlapping responsibility.",
    outcome:
      "Reducing competing actions makes the most important workflow easier to discover and execute.",
  },
  {
    tag: "AI",
    color: "purple",
    title: "AI Insight -- Context, Not Repetition",
    before:
      "No AI assistance. The rep had to manually assess timing, priority and engagement levels before deciding on the next step.",
    after:
      "AI Insight panel shows engagement signals, best follow-up window, potential value and close probability -- informing the decision without repeating the primary CTA.",
    outcome:
      "The AI layer provides context and decision support without competing with primary actions. More useful guidance and less interface noise.",
  },
];

const supportingDecisions: Improvement[] = [
  {
    tag: "Hero",
    color: "orange",
    title: "Unified Hero + Embedded Pipeline",
    before:
      "Contact info, stage pipeline and action buttons were spread across separate sections, forcing the rep to scan the full page to understand the job status.",
    after:
      "Single compact card consolidates customer identity, key metrics, primary actions and stage pipeline. Property photo opens in a lightbox. Everything visible in under 3 seconds.",
  },
  {
    tag: "Layout",
    color: "blue",
    title: "Persistent Right Rail Across Tabs",
    before:
      "Switching to Activity, Documents or Proposals tabs hid the sidebar entirely, removing AI insights, tasks and contacts from view while working.",
    after:
      "AI Insight, Tasks, Contacts and detail cards remain visible on all tabs. The sidebar provides continuous context regardless of the active tab.",
  },
  {
    tag: "Cards",
    color: "teal",
    title: "Collapsible Cards with Data Preview",
    before:
      "Insurance and Job Details were always fully expanded, occupying permanent vertical space in the sidebar even when the rep did not need those details.",
    after:
      "Both cards collapse with a visible data preview (e.g. State Farm / $1,500 ded.) so the rep can scan without opening, and expand on demand.",
  },
  {
    tag: "Tasks",
    color: "orange",
    title: "Add Task via Slide-Over Drawer",
    before:
      "No inline way to create a new task from the job page. The rep had to navigate elsewhere to add tasks related to the current job.",
    after:
      "Plus Add task link in the Tasks card opens a contextual slide-over drawer with Title, Due date, Assigned to and Notes -- same pattern as Add Contact.",
  },
  {
    tag: "Spacing",
    color: "gray",
    title: "Consistent 24px Spacing System",
    before:
      "Section gaps varied between 8px, 16px, 24px and 32px with no clear rule, creating a visually uneven rhythm across the page.",
    after:
      "All inter-section gaps standardized to 24px. A single padding value on the workspace container controls all lateral margins consistently.",
  },
  {
    tag: "Data",
    color: "red",
    title: "Coherent Mock Data",
    before:
      "Timeline showed Proposal sent while AI recommended sending a proposal. Tasks included Follow Up Proposal despite the job being at Estimate stage.",
    after:
      "All data tells a consistent story: Estimate In Review -- AI recommends sending proposal -- timeline shows estimate completion -- tasks align with current stage.",
  },
];

const tagColors: Record<string, { bg: string; text: string }> = {
  orange: { bg: "rgba(249,115,22,0.1)",   text: "#c2410c" },
  purple: { bg: "rgba(124,58,237,0.08)",  text: "#6d28d9" },
  green:  { bg: "rgba(22,163,74,0.08)",   text: "#15803d" },
  blue:   { bg: "rgba(37,99,235,0.08)",   text: "#1d4ed8" },
  teal:   { bg: "rgba(13,148,136,0.08)",  text: "#0f766e" },
  red:    { bg: "rgba(220,38,38,0.08)",   text: "#b91c1c" },
  gray:   { bg: "rgba(107,114,128,0.08)", text: "#4b5563" },
};

function Card({ item }: { item: Improvement }) {
  const colors = tagColors[item.color] ?? tagColors.gray;
  return (
    <article className="surface pres-card">
      <div className="pres-card-tag" style={{ background: colors.bg, color: colors.text }}>
        {item.tag}
      </div>
      <h2 className="pres-card-title">{item.title}</h2>
      <div className="pres-diff">
        <div className="pres-diff-block pres-diff-before">
          <span className="pres-diff-label">Before</span>
          <p className="text-secondary">{item.before}</p>
        </div>
        <div className="pres-diff-block pres-diff-after">
          <span className="pres-diff-label">After</span>
          <p className="text-secondary">{item.after}</p>
        </div>
      </div>
      {item.outcome && (
        <div className="pres-outcome">
          <span className="pres-outcome-label">Outcome</span>
          <p>{item.outcome}</p>
        </div>
      )}
    </article>
  );
}

export default function PresentationPage() {
  return (
    <div className="pres-root">
      <div className="pres-page-header">
        <div className="pres-inner">
          <div className="pres-page-header-inner">
            <div>
              <p className="pres-eyebrow">Product Design Test</p>
              <h1 className="pres-title">Job Page &mdash; UX Redesign</h1>
              <p className="pres-subtitle">
                A complete refinement of the roofing CRM&apos;s daily workspace,
                focused on reducing noise, improving hierarchy and integrating
                AI-assisted guidance for sales representatives.
              </p>
              <div className="pres-meta-row">
                <span className="pres-meta-pill">4 key decisions + 6 supporting changes</span>
                <span className="pres-meta-pill">Next.js 15 + TypeScript</span>
                <span className="pres-meta-pill">Pure CSS &mdash; no Tailwind</span>
                <span className="pres-meta-pill">Fully responsive</span>
              </div>
            </div>
            <Link href="/" className="button primary">
              View workspace &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="pres-main">
        <p className="pres-group-label">Key decisions</p>
        <div className="pres-grid">
          {primaryDecisions.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </div>

        <p className="pres-group-label">Supporting changes</p>
        <div className="pres-grid">
          {supportingDecisions.map((item, i) => (
            <Card key={i} item={item} />
          ))}
        </div>

        {/* Conclusion */}
        <div className="surface pres-conclusion">
          <h2 className="pres-conclusion-title">Design Outcome</h2>
          <p className="pres-conclusion-body">
            The redesign focuses on helping roofing sales representatives understand job status faster,
            identify the next action immediately, and complete critical workflows with greater confidence.
          </p>
          <p className="pres-conclusion-body">
            The result is a cleaner, more actionable experience that aligns with the operational reality
            of roofing sales teams.
          </p>
        </div>
      </div>

      <footer className="pres-footer">
        <p className="text-secondary">
          Built for RoofPilot &middot; Product Design Test &middot; 2026
        </p>
      </footer>
    </div>
  );
}
