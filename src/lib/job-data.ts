import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  ClipboardCheck,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  PhoneMissed,
  Settings2,
  StickyNote,
  UserPlus
} from "lucide-react";

export type ComposerMode = "note" | "task" | "email" | "message" | "call";

export type TimelineFilter = "all" | "notes" | "tasks" | "communication" | "system";

export type TimelineItem = {
  id: number;
  type: string;
  title: string;
  detail: string;
  time: string;
  rep?: string;
  direction?: "in" | "out";
  durationLabel?: string;
  status?: "answered" | "unanswered" | "overdue" | "completed";
  threadId?: string;
  emailId?: string;
};

export type Contact = {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string;
  preferred: string;
  lastInteraction?: string;
  responseRate?: string;
  isPrimary?: boolean;
};

export type TaskPriority = "high" | "medium" | "low";

export type TaskItem = {
  id: number;
  title: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  isOverdue?: boolean;
};

export type WorkflowStage = {
  id: string;
  label: string;
  status: "done" | "current" | "upcoming";
  dateLabel?: string;
  statusLabel?: string;
  owner?: string;
  notes?: string;
};

export const actionConfig = {
  note: {
    label: "Note",
    icon: StickyNote,
    cta: "Save Note",
    success: "Note saved successfully",
    timelineTitle: "Note Added"
  },
  task: {
    label: "Task",
    icon: ClipboardList,
    cta: "Create Task",
    success: "Task created successfully",
    timelineTitle: "Task Created"
  },
  email: {
    label: "Email",
    icon: Mail,
    cta: "Send Email",
    success: "Email sent to Hannah Weiss",
    timelineTitle: "Email Sent"
  },
  message: {
    label: "Message",
    icon: MessageSquare,
    cta: "Send Message",
    success: "Message sent to Hannah Weiss",
    timelineTitle: "SMS Sent"
  },
  call: {
    label: "Call",
    icon: Phone,
    cta: "Start Call",
    success: "Call logged to activity",
    timelineTitle: "Call made"
  }
} satisfies Record<ComposerMode, Record<string, unknown>>;

export const emailTemplates: Record<string, { subject: string; message: string }> = {
  "Proposal Follow-up": {
    subject: "Your roof proposal is ready for review",
    message:
      "Hi Hannah, thank you again for meeting with us. Your proposal is ready and I am available to walk through options and next steps."
  },
  "Insurance Update": {
    subject: "Insurance claim update for 450 Merci Blvd",
    message:
      "Hi Hannah, quick update on claim CLM-582741. We are aligned with the adjuster and ready to move into proposal review."
  },
  "Appointment Reminder": {
    subject: "Reminder: proposal review appointment",
    message: "Hi Hannah, confirming our appointment to review the roof proposal and answer any deductible questions."
  }
};

export const messageTemplates: Record<string, string> = {
  "Call Me Back": "Hi Hannah, when you have a moment please call me back about the roof proposal.",
  "Proposal Sent": "Hi Hannah, your roof proposal was just sent. Let me know if you want to review it together today.",
  "Inspection Confirmed": "Hi Hannah, inspection is complete and we are preparing your estimate and proposal package."
};

export const timelineMeta: Record<
  string,
  { icon: LucideIcon; colorClass: string; filter: TimelineFilter }
> = {
  note:           { icon: StickyNote,    colorClass: "tl-note",           filter: "notes" },
  task:           { icon: ClipboardList, colorClass: "tl-task",           filter: "tasks" },
  email:          { icon: Mail,          colorClass: "tl-email",          filter: "communication" },
  message:        { icon: MessageSquare, colorClass: "tl-message",        filter: "communication" },
  proposal:       { icon: FileCheck2,    colorClass: "tl-proposal",       filter: "system" },
  invoice:        { icon: CircleDollarSign, colorClass: "tl-invoice",     filter: "system" },
  system:         { icon: Settings2,     colorClass: "tl-system",         filter: "system" },
  inspection:     { icon: ClipboardCheck,colorClass: "tl-inspection",     filter: "system" },
  contact:        { icon: UserPlus,      colorClass: "tl-contact",        filter: "system" },
  call:           { icon: Phone,         colorClass: "tl-call",           filter: "communication" },
  missed_call:    { icon: PhoneMissed,   colorClass: "tl-missed-call",    filter: "communication" },
  sms_in:         { icon: MessageSquare, colorClass: "tl-sms-in",         filter: "communication" },
  sms_out:        { icon: MessageSquare, colorClass: "tl-sms-out",        filter: "communication" },
  email_received: { icon: MailOpen,      colorClass: "tl-email-received", filter: "communication" },
  task_completed: { icon: CheckCircle2,  colorClass: "tl-task-completed", filter: "tasks" },
  task_overdue:   { icon: AlertTriangle, colorClass: "tl-task-overdue",   filter: "tasks" },
};

export type MaterialOrderStatus = "pending" | "ordered" | "in-transit" | "delivered" | "cancelled";
export type WorkOrderStatus = "not-scheduled" | "scheduled" | "in-progress" | "complete";

export type MaterialOrder = {
  id: number;
  item: string;
  qty: number;
  unit: string;
  supplier: string;
  status: MaterialOrderStatus;
  unitCost: number;
};

export type WorkOrder = {
  id: number;
  type: string;
  crew: string;
  scheduledDate: string;
  status: WorkOrderStatus;
  notes?: string;
};

export const initialMaterialOrders: MaterialOrder[] = [
  { id: 1, item: "Architectural Shingles — IKO Dynasty", qty: 40, unit: "SQ", supplier: "ABC Supply", status: "pending", unitCost: 155 },
  { id: 2, item: "Ridge Cap Shingles", qty: 4, unit: "bundle", supplier: "ABC Supply", status: "pending", unitCost: 70 },
  { id: 3, item: "Ice & Water Shield", qty: 2, unit: "roll", supplier: "ABC Supply", status: "pending", unitCost: 170 },
  { id: 4, item: "Synthetic Underlayment", qty: 10, unit: "roll", supplier: "ABC Supply", status: "pending", unitCost: 45 },
  { id: 5, item: "Drip Edge (Aluminum)", qty: 8, unit: "stick", supplier: "ABC Supply", status: "pending", unitCost: 12 },
];

export const initialWorkOrders: WorkOrder[] = [
  { id: 1, type: "Full Roof Replacement", crew: "Dana Kim", scheduledDate: "Tentative Jun 18–19", status: "not-scheduled", notes: "Pending proposal approval" },
  { id: 2, type: "Gutter Inspection & Clean", crew: "Dana Kim", scheduledDate: "Tentative Jun 20", status: "not-scheduled" },
];

export type AiAction = "proposal" | "message" | "notes";

export type AiRecommendation = {
  id: string;
  icon: "zap" | "phone" | "alert";
  title: string;
  body: string;
  stat?: string;
  statLabel?: string;
  actionLabel: string;
  action: AiAction;
};

export const primaryContact: Contact = {
  firstName: "Hannah",
  lastName: "Weiss",
  relationship: "Homeowner",
  phone: "+1 (512) 555-0148",
  email: "hannah.weiss@example.com",
  preferred: "Email",
  lastInteraction: "Today, 11:04 AM",
  responseRate: "91%",
  isPrimary: true
};

export const defaultSecondaryContact: Contact = {
  firstName: "Michael",
  lastName: "Weiss",
  relationship: "Spouse",
  phone: "+1 (512) 555-0173",
  email: "michael.weiss@example.com",
  preferred: "SMS",
  lastInteraction: "Today, 9:32 AM",
  responseRate: "84%"
};

/* ── Email Mock Records ─────────────────────────────────────────── */

export type EmailRecord = {
  id: string;
  from: string;
  to: string;
  subject: string;
  sentAt: string;
  body: string;
  opens: number;
  lastOpenedAt: string;
  direction: "in" | "out";
};

export const mockEmails: Record<string, EmailRecord> = {
  "email-est-summary": {
    id: "email-est-summary",
    from: "Dana Kim <dana.kim@roofpilot.com>",
    to: "Hannah Weiss <hannah.weiss@example.com>",
    subject: "Your roof estimate is ready — $18,450",
    sentAt: "Jun 5, 2026 · 10:03 AM",
    direction: "out",
    opens: 3,
    lastOpenedAt: "Jun 10, 2026 · 11:02 AM",
    body: `Hi Hannah,

I wanted to follow up and let you know your estimate is ready for review. Based on our inspection on June 2, we've documented the hail damage to the north and south faces of the roof, flashing deterioration around the skylights, and gutter displacement on the east side.

The estimate covers a full architectural shingle replacement, labor and installation, gutter re-hanging, and permit and disposal fees — all in at $18,450. We've aligned the scope closely with what the State Farm adjuster noted during their visit, so there shouldn't be any surprises on the insurance side.

When you're ready, I'd love to walk through the proposal together. Morning calls work best for me, and I know you prefer that too. We can go over material options, timeline, and answer any questions about the deductible.

Looking forward to getting this moving for you — the May storm left a lot of homes in Dripping Springs in the same situation, so scheduling is starting to fill up. Let me know when works best.

Best,
Dana Kim
RoofPilot · +1 (512) 555-0101`
  },
  "email-deductible-reply": {
    id: "email-deductible-reply",
    from: "Hannah Weiss <hannah.weiss@example.com>",
    to: "Dana Kim <dana.kim@roofpilot.com>",
    subject: "Re: Your roof estimate is ready — $18,450",
    sentAt: "Jun 5, 2026 · 11:47 AM",
    direction: "in",
    opens: 0,
    lastOpenedAt: "—",
    body: `Hi Dana,

Thank you for sending this over — I've had a chance to look through it and everything looks thorough. The scope matches what the adjuster said, so that's good to hear.

I do have one question about the deductible. Our policy lists a $1,500 deductible, but I want to make sure I understand how that gets applied. Does that come off the top before State Farm pays out, or is it something we settle directly with you after the work is complete?

Also, the HOA has a review process for exterior changes. I've submitted the color palette to them and I'm waiting on approval. They usually take about 2 weeks, so I'd love to get everything lined up so we can move quickly once we have the green light.

Morning this week works — happy to do a call Thursday or Friday if that suits you.

Thanks again,
Hannah`
  }
};

export const mockEmailThread: EmailRecord[] = [
  mockEmails["email-est-summary"],
  mockEmails["email-deductible-reply"]
];

/* ── SMS Thread Mock ────────────────────────────────────────────── */

export type SmsMessage = {
  id: number;
  direction: "in" | "out";
  text: string;
  time: string;
  rep?: string;
};

export const initialSmsThread: SmsMessage[] = [
  {
    id: 1,
    direction: "out",
    text: "Hi Hannah, this is Dana from RoofPilot. Just checking in — inspection is complete and we're putting together your estimate now. Should have it to you by tomorrow morning.",
    time: "Jun 4 · 2:15 PM",
    rep: "Dana Kim"
  },
  {
    id: 2,
    direction: "in",
    text: "Thanks Dana! That's great. Will it include the skylight area too? The adjuster mentioned it but wasn't specific.",
    time: "Jun 4 · 2:41 PM"
  },
  {
    id: 3,
    direction: "out",
    text: "Yes, the skylights on the north face are included — both flashing replacement and the surrounding shingle work. It's all in the scope.",
    time: "Jun 4 · 2:55 PM",
    rep: "Dana Kim"
  },
  {
    id: 4,
    direction: "in",
    text: "Perfect. And what about color options for the shingles? We want something close to what we have but HOA has to approve.",
    time: "Jun 4 · 3:10 PM"
  },
  {
    id: 5,
    direction: "out",
    text: "We'll put together a few IKO Dynasty options that should work with most HOAs in Dripping Springs. I'll include a color board with the estimate so you can submit it to the HOA at the same time.",
    time: "Jun 5 · 9:12 AM",
    rep: "Dana Kim"
  },
  {
    id: 6,
    direction: "in",
    text: "Hi Dana, quick question — I sent the estimate to HOA but they're asking for a material spec sheet. Can you send that over? Also still trying to understand the deductible — do I pay you or State Farm directly?",
    time: "Jun 10 · 2:18 PM"
  }
];

/* ── Timeline Seed Data (with new types) ────────────────────────── */

export const initialTimeline: TimelineItem[] = [
  {
    id: 10,
    type: "missed_call",
    title: "Missed call — Hannah Weiss",
    detail: "Inbound call from +1 (512) 555-0148 — no answer.",
    time: "11:38 AM",
    direction: "in",
    status: "unanswered",
    rep: "Dana Kim"
  },
  {
    id: 9,
    type: "task_overdue",
    title: "Task overdue",
    detail: "Send updated estimate to adjuster — due Jun 9.",
    time: "Today",
    status: "overdue",
    rep: "Dana Kim"
  },
  {
    id: 1,
    type: "system",
    title: "Estimate completed",
    detail: "Full replacement estimate ready — $18,450. Awaiting homeowner review.",
    time: "10:42 AM"
  },
  {
    id: 2,
    type: "email",
    title: "Email sent",
    detail: "Estimate summary shared with Hannah Weiss for initial review.",
    time: "10:03 AM",
    direction: "out",
    rep: "Dana Kim",
    emailId: "email-est-summary"
  },
  {
    id: 8,
    type: "email_received",
    title: "Email received — Hannah Weiss",
    detail: "Re: Your roof estimate is ready — Hannah asked about the deductible and HOA approval.",
    time: "Yesterday · 11:47 AM",
    direction: "in",
    emailId: "email-deductible-reply"
  },
  {
    id: 7,
    type: "sms_in",
    title: "SMS received — Hannah Weiss",
    detail: "Asking for material spec sheet and clarification on deductible payment.",
    time: "Yesterday · 2:18 PM",
    direction: "in",
    status: "unanswered",
    threadId: "main-thread"
  },
  {
    id: 6,
    type: "sms_out",
    title: "SMS sent",
    detail: "Offered IKO Dynasty color board to include with the estimate for HOA submission.",
    time: "Jun 5 · 9:12 AM",
    direction: "out",
    rep: "Dana Kim",
    threadId: "main-thread"
  },
  {
    id: 5,
    type: "call",
    title: "Outbound call — Dana Kim",
    detail: "Discussed inspection results and next steps with Hannah Weiss.",
    time: "Jun 4 · 4:30 PM",
    direction: "out",
    rep: "Dana Kim",
    durationLabel: "4 min",
    status: "answered"
  },
  {
    id: 3,
    type: "note",
    title: "Note added",
    detail: "Homeowner asked about deductible timing and production schedule.",
    time: "Jun 4 · 9:48 AM",
    rep: "Dana Kim"
  },
  {
    id: 4,
    type: "inspection",
    title: "Inspection completed",
    detail: "Slope, shingle, flashing and gutter damage documented.",
    time: "Jun 2"
  }
];

/* ── Alert derivation helper ────────────────────────────────────── */

export type CommAlerts = {
  missedCalls: number;
  unansweredSms: number;
  overdueTasks: number;
  total: number;
};

export function getCommAlerts(params: {
  missedCalls: number;
  unansweredSms: number;
  overdueTasks: number;
}): CommAlerts {
  return {
    ...params,
    total: params.missedCalls + params.unansweredSms + params.overdueTasks
  };
}

export const workflowStages: WorkflowStage[] = [
  {
    id: "lead",
    label: "Lead",
    status: "done",
    dateLabel: "May 27",
    owner: "Dana Kim",
    notes: "Lead qualified from website form."
  },
  {
    id: "inspection",
    label: "Inspection",
    status: "done",
    dateLabel: "Jun 2",
    owner: "Dana Kim",
    notes: "Full roof inspection completed."
  },
  {
    id: "estimate",
    label: "Estimate",
    status: "current",
    statusLabel: "In Review",
    owner: "Dana Kim",
    notes: "Awaiting final pricing approval."
  },
  { id: "proposal", label: "Proposal", status: "upcoming" },
  { id: "production", label: "Production", status: "upcoming" },
  { id: "invoice", label: "Invoice", status: "upcoming" },
  { id: "complete", label: "Complete", status: "upcoming" }
];

export const aiRecommendations: AiRecommendation[] = [
  {
    id: "proposal",
    icon: "zap",
    title: "Send Proposal Today",
    body: "Email opened 3× · high intent",
    stat: "$18,450",
    statLabel: "Potential value",
    actionLabel: "Send Proposal",
    action: "proposal"
  },
  {
    id: "followup",
    icon: "phone",
    title: "Follow Up Homeowner",
    body: "Last reply · 3 hours ago",
    actionLabel: "Send Message",
    action: "message"
  },
  {
    id: "deductible",
    icon: "alert",
    title: "Deductible Concern Detected",
    body: "Discuss financing options",
    actionLabel: "View Notes",
    action: "notes"
  }
];

export function nowLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

export function matchesTimelineFilter(item: TimelineItem, filter: TimelineFilter) {
  if (filter === "all") return true;
  const meta = timelineMeta[item.type];
  if (!meta) return filter === "system";
  if (filter === "notes") return item.type === "note";
  if (filter === "tasks") return item.type === "task" || item.type === "task_completed" || item.type === "task_overdue";
  if (filter === "communication") return meta.filter === "communication";
  return meta.filter === "system" || item.type === "proposal" || item.type === "invoice";
}
