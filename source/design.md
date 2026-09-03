# MediGuide — Design & Build Spec (v2.0, Antigravity-optimized)

A premium, calm, AI-assisted health companion for finding clarity, tracking care, and taking the next right step.

This file is written to be handed directly to **Google Antigravity** as the build brief. It is decisive on purpose: every open choice from v1.0 has been resolved so the agent does not need to guess. Colors are locked and must not be substituted, tinted, or "improved."

---

## 0. Master Prompt (paste this first)

```
Build MediGuide, a premium healthcare web app prototype.

Visual direction: editorial, spacious, restrained — closer to a
well-made independent product site than a hospital portal or a
generic SaaS dashboard. Warm white canvas, deep teal ink, one
gold accent used sparingly. Confident whitespace over dense
UI. One deliberate visual gesture per screen; everything else
quiet.

Use the exact design tokens in Section 2. Do not introduce new
colors, gradients-as-decoration, or a different accent hue.

Do not produce a generic AI-generated-looking interface. Concretely,
avoid: identical rounded cards with the same soft drop-shadow on
every surface; a tracked-out ALL-CAPS eyebrow label above every
heading; middle-dot separated meta strings; a monospace font for
data labels; a "→" appended to buttons/links; numbered 01/02/03
markers on content that isn't a sequence; fade-and-slide-up entrance
animation on every card. See Section 3 for the full list.

Build the 8 screens in Section 7 as a single responsive app shell
(Section 6): Home, Symptoms, MediGuide AI, Medicines, Care, Records,
Profile, Emergency. Use the component library in Section 8 and the
motion spec in Section 9. Ship with the realistic mock data and copy
already provided — no lorem ipsum, no "Welcome to our platform."

Never present a diagnosis as certain. Guidance-oriented language only.
```

---

## 1. Product North Star

MediGuide should feel **reassuring, intelligent, and premium** — never clinical, sterile, or gimmicky. Every screen should help the user answer three questions fast: **What is happening? What should I do? What do I need to remember?**

| Principle | What it means in the UI |
|---|---|
| Reduce uncertainty | Progressive disclosure, plain language, one visible next action. No dense tables, no buried jargon. |
| Make health data human | Editorial spacing, large numerals, personal greetings, plain-language microcopy — not dashboard clutter. |
| Every state explains itself | Loading, empty, error, confirmation, and risk states are designed, not defaulted. |
| One bold gesture per screen | Spend visual boldness once per screen; keep the rest quiet and disciplined. |

---

## 2. Design Tokens (locked — do not change)

### Color

```css
:root {
  --ink:    #061017; /* primary text, shell, high-contrast surfaces */
  --teal:   #0B3441; /* primary brand, navigation, key headings */
  --blue:   #39679B; /* links, charts, secondary actions */
  --sky:    #9EBAD1; /* soft chart accents, selected states */
  --white:  #FAFBFB; /* canvas and primary surfaces */
  --gold:   #C9A24D; /* premium highlight — use sparingly, never as a base color */
  --success:#2A7A5B; /* healthy / completed / taken states */
  --alert:  #B83A3A; /* urgent states only */
}
```

Rule: `--gold` appears in at most one element per screen. `--alert` never doubles as a decorative color. No new hues, tints of black (`#0B0B0B`, `#111`), or gradient washes used purely as decoration — the one gradient permitted is the teal hero surface in Section 7.1.

### Typography

- **UI & body:** Inter (400/500/600/700).
- **Editorial accent:** Source Serif 4 (500/600) — reserved for hero greetings and section titles only. Never for buttons, labels, or body copy.
- Scale: H1 44–64px desktop / 36–44px mobile, 600 weight, tight tracking · H2 22–28px · Body 14–17px, 1.45–1.6 line height · Micro labels 11–12px, 600 weight, uppercase — used only for true status/category labels, never as decorative eyebrows above headings.
- Line length: keep body copy under 65 characters per line.

### Shape, elevation, motion

- Corner radius: 16–20px for primary panels, 999px for pills/chips/status.
- Elevation: prefer a 1px hairline border (`rgba(6,16,23,.10)`) over drop shadows. Use shadow only on the records drawer (`-8px 0 32px rgba(6,16,23,.12)`) since it floats above content.
- Motion: 150–320ms for UI feedback, 400ms max for larger reveals. `ease-out` for entry, `ease-in-out` for toggles. One orchestrated entrance on first load; everything after that responds to a user action. Respect `prefers-reduced-motion`.

---

## 3. Anti-generic-AI-design checklist

Before shipping any screen, verify none of the following are present:

- [ ] No warm-cream + high-contrast-serif + terracotta combination (off-brief anyway — this uses the locked palette above).
- [ ] No identical rounded card + identical soft grey shadow repeated on every surface. Vary treatment: hairline-bordered panels, undecorated timeline rows, and exactly one elevated teal panel per screen (Sections 7.1, 7.3).
- [ ] No ALL-CAPS tracked-out eyebrow label sitting above every heading purely as decoration. Uppercase micro-labels are reserved for functional status chips and category tags only (Section 8).
- [ ] No meta strings joined with middle dots (`A · B · C`).
- [ ] No monospace typeface used for data labels or numerals.
- [ ] No "→" appended to button or link text.
- [ ] No 01/02/03 numbered markers unless the content is a genuine sequence (the Symptom Checker steps and the Emergency quick-guidance list qualify; nothing else does).
- [ ] No fade-and-slide-up entrance animation stacked on every card. One entrance moment on Home only (Section 9).
- [ ] No hover-triggered shimmer/glow/scale on every interactive element — motion answers a user's action, not passive hovering.

---

## 4. Reference Translation

Inspiration: *Luxury Real Estate Website Design* by Nurun Nabi for Peno Lab (Dribbble). Borrow the compositional confidence — not the real-estate content, not a literal copy of its layout.

| Reference quality | MediGuide translation |
|---|---|
| Premium editorial composition | Large hero message, calm whitespace, fewer/stronger sections instead of dense grids |
| Immersive imagery | One focal illustration/photo per major section — never a stock-photo wall |
| Dark teal / light neutral palette | Deep teal shell + warm white surfaces + restrained sky-blue accents (tokens in Section 2) |
| Discovery filters | Symptom, specialty, medicine, and appointment filter chips that feel tactile |
| Conversion-focused CTAs | One primary CTA per section, never competing buttons |

---

## 5. Information Architecture

1. **Home** — personalized summary, quick actions, upcoming care, AI insight
2. **Symptoms** — guided checker, history, follow-up guidance
3. **MediGuide AI** — conversational assistant over records, medicines, navigation
4. **Medicines** — schedule, adherence, reminders, education
5. **Care** — providers, appointments, specialties, visit prep
6. **Records** — labs, imaging, prescriptions, notes, timeline, share/export
7. **Profile** — preferences, connected services, privacy/consent, notifications
8. **Emergency** — high-visibility urgent-help entry, simplified interaction model

---

## 6. App Shell & Navigation

| Desktop | Mobile |
|---|---|
| Persistent left sidebar, 240–260px, deep teal fill, compact wordmark, Emergency pinned near the bottom | Bottom tab bar, 5 items: Home, Symptoms, Care, Medicines, Profile |
| Top bar: search, notifications, avatar, current section title | Minimal top bar; contextual back button on nested flows |
| 12-column grid, 24–32px gutters | 16px horizontal padding, cards stack vertically |
| MediGuide AI reachable via nav item + quick action, not a floating bubble | AI opens as a dedicated full-height route |

Breakpoint: collapse sidebar → bottom tab bar under **880px**.

---

## 7. Key Screens

### 7.1 Home
- Hero: eyebrow date, serif greeting ("Good evening, {name}."), one-line contextual summary, two CTAs (primary: start a check, secondary: ask AI).
- One teal gradient hero panel opposite the greeting, surfacing the single most relevant number (e.g. adherence %) — this is the screen's one bold gesture.
- Metric strip: 3–4 cards, large numeral + unit + trend chip + inline sparkline. Trend conveyed with icon/text, never color alone.
- Quick actions: 4 equal-weight entries to Symptoms, AI, Medicines, Care.
- Two-column row: Upcoming care panel (hairline border) + AI insight panel (elevated teal), with a "Why am I seeing this?" disclosure — collapsed by default.
- Recent activity as an undecorated timeline list, not boxed cards.

### 7.2 Symptom Checker
- 4 steps with a progress stepper (numbered — this is a real sequence): Symptoms → Details → Severity → Guidance.
- Step 1: symptom chips + free-text field.
- Step 2: context questions that adapt to the Step 1 selection.
- Step 3: severity as a 3-way segmented control (mild/moderate/severe), color-coded by success/gold/alert.
- Emergency escalation banner appears inline the moment a red-flag combination is selected (e.g. severe + chest pain) — never buried at the end.
- Step 4: a guidance tier, explicitly not a diagnostic claim, with next actions (ask AI, book care anyway).

### 7.3 MediGuide AI
- Welcoming prompt + 3 suggested questions.
- Chat body: user messages as solid teal bubbles; assistant messages unbubbled, marked by a small icon, to avoid the "identical chat bubble kit" look.
- Structured assistant responses: **What it may mean / What you can do now / When to seek care**, each a plain-language section label, not a card.
- Source attribution as a quiet inline chip, not a footnote.
- Persistent "Need urgent help?" affordance in the header, styled with the alert token — always visible, never buried in a menu.
- Side panel: attached context (a record, a medicine, a visit) the assistant can see, disclosed plainly.

### 7.4 Medicines
- Today's schedule grouped Morning / Afternoon / Evening as plain rows (icon, name, dose, time) — not individual cards.
- "Mark taken" morphs into a checked confirmation state in place; no page transition.
- Weekly adherence ring (SVG progress) + 7-day bar history in a single side panel.
- Reminder settings live in a secondary panel, never crowding the primary schedule.

### 7.5 Care
- Filter chips: specialty, reason, distance, availability.
- Provider rows (not cards): avatar/initials, name, specialty, rating, distance, next availability, single CTA.
- Booking expands inline as a compact 3-step flow (time → details → confirmation) directly under the selected provider — no modal, no separate page.

### 7.6 Records
- Timeline-first list grouped by recency, not a file browser grid.
- Categories: labs, imaging, prescriptions, visit notes, documents — conveyed by icon + label.
- Clicking a record opens a right-side detail drawer: summary, metadata, share/export action. Support empty, loading, and "processing" states explicitly.

### 7.7 Profile
- Grouped settings: Preferences, Connected services, Privacy & consent, Notifications.
- Every row: plain-language name + one-line description + a single control (toggle or "Change" link). No nested settings trees.

### 7.8 Emergency
- Dark (`--ink`) full-bleed screen — the one screen allowed to invert the palette, signaling severity through restraint, not decoration.
- No animation. Single serif headline, one supporting paragraph, two high-contrast actions (call emergency services, find nearest ER) plus a calm way back.
- A genuine 3-item numbered sequence of what to do while help arrives — the numbering here is earned, unlike a decorative eyebrow elsewhere.

---

## 8. Component Library

| Component | Required states / behavior |
|---|---|
| AppShell | Responsive sidebar/topbar/tab-bar; theme-aware; visible focus rings |
| MetricCard | value, label, trend, sparkline, loading, expandable detail |
| HealthStatusChip | normal / monitor / attention / urgent — icon + text, never color-only |
| PrimaryButton / SecondaryButton | default, hover, pressed, loading, disabled |
| QuickAction | icon + label, keyboard accessible |
| AIMessage | assistant / user / system / source / warning variants |
| SymptomChip | unselected / selected / disabled / searchable |
| ProgressStepper | current / completed / upcoming, compact mobile variant |
| ProviderRow | avatar, specialty, metadata, availability, primary action |
| MedicationRow | dose, time, taken-state morph, reminder control |
| TimelineItem | icon, date, title, summary, expand affordance |
| RecordDrawer | preview, metadata, share/export, close, loading |
| Toast | success / informational / action-required, non-blocking |
| EmergencyBanner | high-contrast, minimal copy, always actionable |

---

## 9. Interaction & Motion

| Interaction | Behavior |
|---|---|
| Page entry | One fade + 8px rise on Home only, staggered 40–60ms across its first row. No other screen replays this. |
| Card/row expand | Height-auto + opacity/transform; preserve scroll position |
| Chip selection | Immediate state change, subtle scale — never hide the selected state |
| AI streaming | Progressive text reveal, stable layout, typing indicator only before content starts |
| Mark-taken | Button morphs to a checked state + small toast; offer undo |
| Urgent state | No decorative animation at all — raise contrast, simplify choices |
| Loading | Skeletons for content blocks, not spinners everywhere |

---

## 10. Product Copy

| Surface | Copy |
|---|---|
| Hero | Your health, clearly guided. |
| Hero subcopy | Understand what you're experiencing, keep your care organized, and know what to do next. |
| Primary CTA | Start a health check |
| AI CTA | Ask MediGuide |
| Appointment CTA | Find care |
| Records section | Your care, in context. |
| Medicine section | Stay on track, one dose at a time. |
| Empty state | Nothing here yet. MediGuide will organize it as your care journey grows. |
| Urgent support | Need urgent help? Get immediate guidance. |

Write copy from the user's perspective, active voice, no filler. Errors state what happened and how to fix it — never "Oops!" or an apology.

---

## 11. Acceptance Criteria

- Responsive at desktop, tablet, and mobile with no horizontal overflow.
- Fully keyboard usable: visible focus, logical tab order.
- Screen-reader labels on icons, charts, status chips, and nav.
- No state conveyed by color alone — pair with icon/text/label.
- Animations respect `prefers-reduced-motion`.
- Design tokens (color, spacing, radius, type, motion) implemented as reusable variables, not hard-coded values.
- Every component's states (default, hover, focus, pressed, disabled, loading, success, error, urgent) defined before page assembly.
- Realistic mock data throughout — no lorem ipsum, no generic placeholder copy.
- Calm visual hierarchy maintained even when several data sources appear on one screen.
- Diagnosis is never presented as certain — guidance-oriented language throughout.
- Passes the Section 3 anti-generic-AI-design checklist on every screen before considering it done.

---

## 12. Final Design Decision

Build MediGuide as a **premium health companion**, not a hospital admin portal and not a generic SaaS dashboard. The Dribbble reference proves a healthcare-adjacent product can use cinematic composition, refined typography, and a premium palette without going cold — MediGuide applies that visual confidence to health guidance, personal data, and AI-assisted care navigation. It should read as calm at first glance and capable once the user starts interacting — and it should look like it was designed once, on purpose, for this product, not assembled from a template.
