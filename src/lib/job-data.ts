import type { LucideIcon } from "lucide-react";
import {
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  ClipboardCheck,
  Mail,
  MessageSquare,
  Settings2,
  StickyNote,
  UserPlus
} from "lucide-react";

export type ComposerMode = "note" | "task" | "email" | "message";

export type TimelineFilter = "all" | "notes" | "tasks" | "communication" | "system";

export type TimelineItem = {
  id: number;
  type: string;
  title: string;
  detail: string;
  time: string;
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

export type TaskItem = {
  id: number;
  title: string;
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
  note: { icon: StickyNote, colorClass: "tl-note", filter: "notes" },
  task: { icon: ClipboardList, colorClass: "tl-task", filter: "tasks" },
  email: { icon: Mail, colorClass: "tl-email", filter: "communication" },
  message: { icon: MessageSquare, colorClass: "tl-message", filter: "communication" },
  proposal: { icon: FileCheck2, colorClass: "tl-proposal", filter: "system" },
  invoice: { icon: CircleDollarSign, colorClass: "tl-invoice", filter: "system" },
  system: { icon: Settings2, colorClass: "tl-system", filter: "system" },
  inspection: { icon: ClipboardCheck, colorClass: "tl-inspection", filter: "system" },
  contact: { icon: UserPlus, colorClass: "tl-contact", filter: "system" }
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

export const initialTimeline: TimelineItem[] = [
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
    time: "10:03 AM"
  },
  {
    id: 3,
    type: "note",
    title: "Note added",
    detail: "Homeowner asked about deductible timing and production schedule.",
    time: "9:48 AM"
  },
  {
    id: 4,
    type: "inspection",
    title: "Inspection completed",
    detail: "Slope, shingle, flashing and gutter damage documented.",
    time: "Yesterday"
  }
];

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
  if (filter === "tasks") return item.type === "task";
  if (filter === "communication") return meta.filter === "communication";
  return meta.filter === "system" || item.type === "proposal" || item.type === "invoice";
}
