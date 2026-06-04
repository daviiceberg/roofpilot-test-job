# RoofPilot — Job Page Redesign

A product design test for [RoofPilot](https://roofpilot.ai), a roofing CRM platform used by sales representatives to manage jobs, customers and workflows.

This project is a complete redesign of the **Job Page** — the daily operational workspace where a rep views job details, tracks stage progress, logs activity, and takes action on the most important next step.

---

## Overview

The original Job page had several usability issues:

- No clear indication of what to do next when opening a job
- Stage pipeline and customer info spread across disconnected sections
- Competing CTAs for the same action appearing in multiple places
- No AI-assisted guidance or engagement intelligence
- Limited system feedback after completing actions

This redesign addresses all of these problems with a focused, hierarchical interface that surfaces the right information at the right time.

---

## Design Decisions

A full breakdown of each design decision — including before/after rationale and intended outcomes — is available at:

**`/presentation`** → [localhost:3099/presentation](http://localhost:3099/presentation)

The presentation covers 10 improvements organized into **Key Decisions** (with outcome rationale) and **Supporting Changes**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Pure CSS — no Tailwind, no CSS-in-JS |
| Font | [Geist](https://fonts.google.com/specimen/Geist) via `next/font/google` |
| Icons | [Lucide React](https://lucide.dev) |
| Rendering | React Server + Client Components |

---

## Running Locally

```bash
npm install
npm run dev -- --port 3099
```

Open [http://localhost:3099](http://localhost:3099) to view the Job page.  
Open [http://localhost:3099/presentation](http://localhost:3099/presentation) to view the design decisions.

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # All styles — design tokens, components, layout
│   ├── layout.tsx           # Root layout with Geist font
│   ├── page.tsx             # Job page entry point
│   └── presentation/
│       └── page.tsx         # Design decisions presentation
├── components/
│   ├── app-shell.tsx        # Nav rail + top bar
│   └── job-workspace.tsx    # Main job page UI
└── lib/
    └── job-data.ts          # Mock data and types
```

---

## Key Features

- **Compact hero card** with embedded stage pipeline, key metrics and primary actions
- **AI Insight panel** with engagement signals, best follow-up window and close probability
- **Persistent right rail** visible across all tabs (Overview, Activity, Documents, Proposals)
- **Collapsible detail cards** (Insurance, Job Details) with inline data preview when closed
- **Slide-over drawers** for Add Contact and Add Task — consistent interaction pattern
- **Property photo lightbox** on click
- **Activity composer** supporting Note, Task, Email and Message modes with success feedback
- Fully responsive — works on desktop and mobile

---

## Scope

This is a design test prototype. The data is intentionally mocked to represent a realistic active roofing job at the **Estimate → Proposal** stage.
