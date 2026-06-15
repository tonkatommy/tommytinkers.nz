'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Globe2, LayoutDashboard, Wrench, Zap, HelpCircle, ShoppingBag,
  Flame, CalendarClock, Calendar, Infinity, CheckCircle2, MapPin, Clock,
  ArrowLeft, ArrowRight, ArrowDown, Check, Plus, Send, Mail, RotateCcw,
  Sparkles, Info, Package, Hammer,
} from "lucide-react";

/* =========================================================================
   DATA
   ========================================================================= */

const PROJECT_TYPES = [
  { id: "marketing", Icon: Globe2, name: "Marketing site", blurb: "A few pages, a story to tell, a sign-up form." },
  { id: "webapp",    Icon: LayoutDashboard, name: "Web app", blurb: "Logins, dashboards, real user data." },
  { id: "shop",      Icon: ShoppingBag, name: "Online shop", blurb: "Products, checkout, NZ Post pickup." },
  { id: "tool",      Icon: Wrench, name: "Internal tool", blurb: "The boring-but-useful thing your team needs." },
  { id: "automate",  Icon: Zap, name: "Automation / script", blurb: "Stop doing that one thing by hand." },
  { id: "unsure",    Icon: HelpCircle, name: "Not sure yet", blurb: "Got an idea but it's still fuzzy. Talk it through." },
];

const FEATURES_BY_TYPE: Record<string, string[]> = {
  marketing: ["Blog / CMS", "Custom design", "Animations", "Contact form", "Analytics", "Multi-language", "SEO setup", "Booking form"],
  webapp:    ["User accounts", "Stripe payments", "Admin panel", "File uploads", "Email notifications", "Real-time updates", "Mobile app shell", "Third-party API"],
  shop:      ["Under 20 products", "20–100 products", "100+ products", "Stripe / POLi NZ", "Shipping & tracking", "Subscriptions", "Wholesale prices", "Click & collect"],
  tool:      ["Dashboard", "CSV import / export", "Scheduled jobs", "Slack / email alerts", "User permissions", "Audit log", "Integrate existing API", "Single sign-on"],
  automate:  ["Scrape a website", "Sync two systems", "Generate reports", "Watch a folder", "Bulk file conversion", "Email parsing", "Run on a schedule", "Connect to AI"],
  unsure:    ["Has users", "Takes payments", "Has admin side", "Runs on a schedule", "Sends emails", "Uses AI", "Replaces a spreadsheet", "Customer-facing"],
};

const TIMELINES = [
  { id: "asap",  Icon: Flame, name: "As soon as possible", blurb: "Next 2–3 weeks ideally." },
  { id: "month", Icon: CalendarClock, name: "Within a month or two", blurb: "Soonish, no fire." },
  { id: "later", Icon: Calendar, name: "Q+1 or later", blurb: "Planning ahead. Take the time to do it right." },
  { id: "flex",  Icon: Infinity, name: "Flexible", blurb: "Whenever you can fit me in." },
];

const BUDGETS = [
  { id: "small",  name: "Under $1.5k", blurb: "Light-touch, focused scope." },
  { id: "mid",    name: "$1.5k – $5k", blurb: "Most marketing sites and small tools." },
  { id: "large",  name: "$5k – $15k",  blurb: "Web apps, custom shops, full builds." },
  { id: "xl",     name: "$15k+",       blurb: "Bigger systems, multiple phases." },
  { id: "unsure", name: "Not sure",    blurb: "Tell me the problem, I'll scope it." },
];

const SERVICES = [
  { Icon: Globe2, title: "Websites", body: "Marketing sites, portfolios, microsites. Fast, accessible, easy for you to edit.", eg: "kaipara-co.nz · 1 week" },
  { Icon: LayoutDashboard, title: "Web apps", body: "Logins, dashboards, real user data. Built so a future dev can read the code.", eg: "Bookkit · 6 weeks" },
  { Icon: Wrench, title: "Internal tools", body: "Replace the spreadsheet, the inbox, the weekly report that takes you a day.", eg: "fleet key tracker · ~80% time saved" },
  { Icon: Zap, title: "Automations", body: "Little scripts and AI workflows that do the boring thing every day so you don't.", eg: "PDF parsing · runs nightly" },
];

const PAST_WORK = [
  { kind: "internal tool", name: "Fleet key tracker", body: "A small web tool that replaced a 200-row spreadsheet for a logistics ops manager. Saved roughly 80% of the time previously spent reconciling key sign-outs.", tags: ["Next.js", "Postgres", "Auth.js"] },
  { kind: "marketing site", name: "kaipara-co.nz", body: "A two-page marketing site for a local trades co-op. Sanity-backed so the owner edits content from her phone. Shipped in a week.", tags: ["Next.js", "Sanity"] },
  { kind: "small saas", name: "Bookkit", body: "An MVP booking system for a multi-room studio. Stripe payments, email confirms, simple admin. Owner runs it from her phone now.", tags: ["Next.js", "Stripe", "Postgres"] },
];

interface Recommendation {
  headline: string; summary: string; stack: string[]; altStack: string[];
  priceLow: number; priceHigh: number; baseWeeks: number;
  phases: Array<{ key: string; name: string; body: string }>;
  deliverables: string[];
  rushNote?: string; budgetNote?: string;
}

function buildRecommendation({ type, features, timeline, budget }: { type: string; features: string[]; timeline: string; budget: string }): Recommendation | null {
  if (!type) return null;
  const BASE: Record<string, Recommendation> = {
    marketing: { headline: "Marketing site build", summary: "A fast, well-designed marketing site you can keep editing yourself.", stack: ["Next.js", "Sanity CMS", "Tailwind", "Vercel"], altStack: ["Astro", "MDX", "Cloudflare Pages"], priceLow: 1500, priceHigh: 4500, baseWeeks: 3, phases: [{ key: "sketch", name: "Sketch", body: "Quick brief, sitemap, content audit. You sign off the shape." }, { key: "design", name: "Design", body: "Hi-fi mocks of every unique page. Two rounds of revisions." }, { key: "build", name: "Build", body: "Hand-coded, accessible, fast. CMS wired up so you can edit text yourself." }, { key: "ship", name: "Ship", body: "DNS, analytics, a 30-minute handover call. You get the keys." }], deliverables: ["Fully responsive site", "Editable in a friendly CMS", "Tracked analytics + SEO setup", "Documentation video for the CMS"] },
    webapp: { headline: "Custom web app", summary: "A real product with logins, data, and a back office. Built to grow with you.", stack: ["Next.js", "Postgres", "TypeScript", "Stripe", "Auth.js"], altStack: ["Remix", "SQLite", "Drizzle"], priceLow: 5000, priceHigh: 18000, baseWeeks: 8, phases: [{ key: "discover", name: "Discover", body: "Map the must-haves, the nice-to-haves, and what we drop. Get to an honest MVP." }, { key: "design", name: "Design", body: "Flows + screens for the core journeys. Test with one real user before code." }, { key: "mvp", name: "MVP build", body: "Smallest useful slice, shipped fast. You can use it end-to-end in a few weeks." }, { key: "iterate", name: "Iterate", body: "Add the next feature only once the previous one is paying for itself." }], deliverables: ["Working app on your domain", "Admin panel for you to manage data", "Code in your GitHub, hosted on your account", "Runbook so you (or your next dev) can keep it alive"] },
    shop: { headline: "Online shop build", summary: "Sell things online without renting a giant platform. Plays nice with NZ Post.", stack: ["Next.js", "Stripe", "Sanity", "NZ Post API"], altStack: ["Shopify Hydrogen", "Snipcart"], priceLow: 2500, priceHigh: 9000, baseWeeks: 5, phases: [{ key: "catalogue", name: "Catalogue", body: "Get your products, prices, and photos shaped up. Shipping rules sorted." }, { key: "design", name: "Design", body: "Storefront mocks. Cart, checkout, and the small things buyers notice." }, { key: "build", name: "Build", body: "Storefront, payments, NZ Post tracking, order emails. End-to-end test." }, { key: "ship", name: "Ship", body: "Soft-launch with a friends-only code, then open the doors." }], deliverables: ["Storefront that loads fast on mobile", "Stripe (or POLi NZ) checkout", "Order admin you can run from your phone", "NZ-shipping rules and tracking integration"] },
    tool: { headline: "Internal tool / dashboard", summary: "Replace the spreadsheet, the inbox-as-database, the worst part of someone's week.", stack: ["Next.js", "Postgres", "Tailwind"], altStack: ["Retool", "Airtable + scripts"], priceLow: 1500, priceHigh: 8000, baseWeeks: 4, phases: [{ key: "audit", name: "Audit", body: "Shadow the people doing the work. Find what actually slows them down." }, { key: "design", name: "Design", body: "Sketch the screens with them in the room. Cut anything they don't use." }, { key: "build", name: "Build", body: "Ship the smallest tool that replaces the worst step. Add from there." }, { key: "train", name: "Train", body: "One short training session, one printed cheat-sheet. Then leave them to it." }], deliverables: ["The tool itself, on your domain or intranet", "Login that fits how your team already works", "Source code + setup notes handed over", "Two weeks of free tweaks after go-live"] },
    automate: { headline: "Automation / script", summary: "A small program that does the boring thing every day so you don't.", stack: ["Node.js", "TypeScript", "GitHub Actions"], altStack: ["Python", "AWS Lambda"], priceLow: 400, priceHigh: 3500, baseWeeks: 1, phases: [{ key: "trace", name: "Trace", body: "Watch you do the task once. Note every click and decision." }, { key: "build", name: "Build", body: "Write the script. Test against last month's real data." }, { key: "deploy", name: "Deploy", body: "Schedule it, set alerts so you know if it ever breaks." }, { key: "hand", name: "Hand-over", body: "You get the source, the schedule, and a one-page runbook." }], deliverables: ["The script, in your repo", "Runs on a schedule (or trigger) you control", "Failure alerts straight to your email or Slack", "Plain-English runbook"] },
    unsure: { headline: "Let's figure it out", summary: "A 30-minute call where we work out the shape of the thing. No pressure, no quote yet.", stack: ["A whiteboard", "Honest questions", "Coffee"], altStack: [], priceLow: 0, priceHigh: 0, baseWeeks: 0, phases: [{ key: "talk", name: "Talk", body: "Tell me the problem, the people, the deadline. I'll ask the awkward questions." }, { key: "shape", name: "Shape", body: "Sketch one or two ways it could go. Maybe it's a build, maybe it's a spreadsheet." }, { key: "decide", name: "Decide", body: "You get a written summary + ballpark. Use it with me, or take it to someone else." }], deliverables: ["30-minute discovery call (free)", "Written one-pager summarising the idea", "Ballpark cost + timeline", "Honest recommendation — even if it's 'don't build it yet'"] },
  };

  const rec = JSON.parse(JSON.stringify(BASE[type])) as Recommendation;
  const featCount = features.length;
  if (featCount > 0 && type !== "unsure") {
    const scale = 1 + featCount * 0.18;
    rec.priceLow  = Math.round((rec.priceLow * scale) / 50) * 50;
    rec.priceHigh = Math.round((rec.priceHigh * (1 + featCount * 0.22)) / 50) * 50;
    rec.baseWeeks = Math.max(rec.baseWeeks, Math.round(rec.baseWeeks * (1 + featCount * 0.15)));
  }
  if (timeline === "asap")  rec.rushNote = "Rush surcharge (+15%) applied. Slot held for you the day you confirm.";
  if (timeline === "later") rec.rushNote = "No rush — I'll fit it between paid client work, ship by end of quarter.";
  if (budget === "small" && rec.priceLow > 1500) rec.budgetNote = "Your budget is under my estimate. We'd start with the must-haves only and ship in phases.";
  if (budget === "xl") rec.budgetNote = "Comfortably in scope. We can include the nice-to-haves from the start.";
  return rec;
}

const fmt$ = (n: number) => "NZ$" + n.toLocaleString("en-NZ");

/* =========================================================================
   WIZARD STATE
   ========================================================================= */

interface WizardState {
  step: number; type: string; features: string[]; timeline: string; budget: string;
}

/* =========================================================================
   COMPONENTS
   ========================================================================= */

function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="cb-progress">
      <span className="cb-progress-pill">&gt; step {step} of {total}</span>
      <div className="cb-progress-bar"><div className="cb-progress-fill" style={{ width: `${(step / total) * 100}%` }} /></div>
      <span className="cb-progress-pill" style={{ color: "var(--color-text-muted)" }}>
        {step === total ? "your build sheet" : "build sheet drafting…"}
      </span>
    </div>
  );
}

function ChoiceCard<T extends { id: string; name: string; blurb: string; Icon: React.FC<{size?: number}> }>({ choice, selected, onClick }: { choice: T; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" className="cb-choice" aria-pressed={selected} onClick={onClick}>
      <div className="cb-choice-icon"><choice.Icon size={18} /></div>
      <div className="cb-choice-text">
        <strong>{choice.name}</strong>
        <span>{choice.blurb}</span>
      </div>
      <span className="cb-choice-check">{selected && <Check size={11} strokeWidth={3} />}</span>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="cb-chip" aria-pressed={active} onClick={onClick}>
      {active ? <Check size={13} /> : <Plus size={13} />}
      {children}
    </button>
  );
}

function BuildSheet({ state, rec }: { state: WizardState; rec: Recommendation | null }) {
  const type = PROJECT_TYPES.find((t) => t.id === state.type);
  const tl   = TIMELINES.find((t) => t.id === state.timeline);
  const bg   = BUDGETS.find((b) => b.id === state.budget);
  return (
    <aside className="cb-sheet" aria-label="Live build sheet">
      <div className="cb-sheet-head">
        <span className="dot" style={{ background: "#ff5f57", width: 9, height: 9, borderRadius: "50%", display: "inline-block" }} />
        <span className="dot" style={{ background: "#ffbd2e", width: 9, height: 9, borderRadius: "50%", display: "inline-block" }} />
        <span className="dot" style={{ background: "#28c840", width: 9, height: 9, borderRadius: "50%", display: "inline-block" }} />
        <span className="title">build-sheet.md · drafting</span>
      </div>
      <div className="cb-sheet-body">
        <div className="cb-sheet-row head">
          <span className="cb-sheet-key">project</span>
          <span className={`cb-sheet-val ${type ? "" : "muted"}`}>{type ? type.name : "— pick a type"}</span>
        </div>
        <div className="cb-sheet-row">
          <span className="cb-sheet-key">scope</span>
          <span className={`cb-sheet-val ${state.features.length ? "" : "muted"}`}>
            {state.features.length === 0 ? "— no features yet"
              : (state.features.length <= 3 ? "Focused" : state.features.length <= 6 ? "Medium" : "Comprehensive")
                + ` · ${state.features.length} feature${state.features.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="cb-sheet-row">
          <span className="cb-sheet-key">timeline</span>
          <span className={`cb-sheet-val ${tl ? "warm" : "muted"}`}>{tl ? tl.name : "— tbd"}</span>
        </div>
        <div className="cb-sheet-row">
          <span className="cb-sheet-key">budget</span>
          <span className={`cb-sheet-val ${bg ? "" : "muted"}`}>{bg ? bg.name : "— tbd"}</span>
        </div>
        {rec && (
          <>
            <div className="cb-sheet-sep" />
            <div className="cb-sheet-row">
              <span className="cb-sheet-key">stack</span>
              <span className="cb-sheet-val">{rec.stack.map((s) => <span key={s} className="stack-tag">{s}</span>)}</span>
            </div>
            <div className="cb-sheet-row">
              <span className="cb-sheet-key">estimate</span>
              <span className="cb-sheet-val ok">{rec.priceLow === 0 ? "Free 30-min call" : `${fmt$(rec.priceLow)} – ${fmt$(rec.priceHigh)}`}</span>
            </div>
            <div className="cb-sheet-row">
              <span className="cb-sheet-key">duration</span>
              <span className="cb-sheet-val">{rec.baseWeeks === 0 ? "30 minutes" : `~${rec.baseWeeks} week${rec.baseWeeks === 1 ? "" : "s"}`}</span>
            </div>
          </>
        )}
      </div>
      <div className="cb-sheet-foot">
        <span>auto-saved · this device</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="pulse" /> live</span>
      </div>
    </aside>
  );
}

function Step1({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div>
      <StepProgress step={1} total={4} />
      <h3 className="cb-step-q">What are you trying to build?</h3>
      <p className="cb-step-sub">Pick the closest match. If nothing fits, pick "not sure yet" — we'll work it out on a call.</p>
      <div className="cb-choices">
        {PROJECT_TYPES.map((p) => (
          <ChoiceCard key={p.id} choice={p} selected={state.type === p.id} onClick={() => set({ type: p.id, features: [] })} />
        ))}
      </div>
      <div className="cb-step-nav">
        <Link href="/" className="tt-btn tt-btn-ghost" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
          <ArrowLeft size={14} /> Cancel
        </Link>
        <button className="tt-btn tt-btn-primary" disabled={!state.type} onClick={() => set({ step: 2 })}
          style={{ opacity: state.type ? 1 : 0.45, cursor: state.type ? "pointer" : "not-allowed" }}>
          Next <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Step2({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const opts = FEATURES_BY_TYPE[state.type] || [];
  const toggle = (f: string) => {
    const has = state.features.includes(f);
    set({ features: has ? state.features.filter((x) => x !== f) : [...state.features, f] });
  };
  const typeName = (PROJECT_TYPES.find((t) => t.id === state.type) || {}).name || "your project";
  return (
    <div>
      <StepProgress step={2} total={4} />
      <h3 className="cb-step-q">What does the {typeName.toLowerCase()} need to do?</h3>
      <p className="cb-step-sub">Tap everything that sounds right. Don&apos;t over-think it — we&apos;ll prune the list together later.</p>
      <div className="cb-chips">
        {opts.map((f) => <Chip key={f} active={state.features.includes(f)} onClick={() => toggle(f)}>{f}</Chip>)}
      </div>
      <div className="cb-step-nav">
        <button className="tt-btn tt-btn-ghost" onClick={() => set({ step: 1 })}><ArrowLeft size={14} /> Back</button>
        <button className="tt-btn tt-btn-primary" onClick={() => set({ step: 3 })}>Next <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}

function Step3({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div>
      <StepProgress step={3} total={4} />
      <h3 className="cb-step-q">When do you need it, and what&apos;s the budget shape?</h3>
      <p className="cb-step-sub">Honest answers help me give you an honest quote. &quot;Not sure&quot; is a real answer.</p>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange)", letterSpacing: "0.05em", marginBottom: 10 }}>&gt; timeline</div>
      <div className="cb-choices" style={{ marginBottom: 24 }}>
        {TIMELINES.map((t) => <ChoiceCard key={t.id} choice={t} selected={state.timeline === t.id} onClick={() => set({ timeline: t.id })} />)}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange)", letterSpacing: "0.05em", marginBottom: 10 }}>&gt; budget</div>
      <div className="cb-chips">
        {BUDGETS.map((b) => (
          <button key={b.id} type="button" className="cb-chip" aria-pressed={state.budget === b.id} onClick={() => set({ budget: b.id })}>
            {b.name}
          </button>
        ))}
      </div>
      {state.budget && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", margin: "10px 0 0" }}>
          — {BUDGETS.find((b) => b.id === state.budget)?.blurb}
        </p>
      )}
      <div className="cb-step-nav">
        <button className="tt-btn tt-btn-ghost" onClick={() => set({ step: 2 })}><ArrowLeft size={14} /> Back</button>
        <button className="tt-btn tt-btn-primary" disabled={!state.timeline || !state.budget} onClick={() => set({ step: 4 })}
          style={{ opacity: (state.timeline && state.budget) ? 1 : 0.45, cursor: (state.timeline && state.budget) ? "pointer" : "not-allowed" }}>
          See my build sheet <Sparkles size={14} />
        </button>
      </div>
    </div>
  );
}

function Step4({ state, set, rec }: { state: WizardState; set: (p: Partial<WizardState>) => void; rec: Recommendation }) {
  const [sent, setSent] = useState(false);
  const [extra, setExtra] = useState({ name: "", email: "", note: "" });

  const briefSummary =
    `Project: ${PROJECT_TYPES.find((t) => t.id === state.type)?.name}\n` +
    `Features: ${state.features.length ? state.features.join(", ") : "(none picked yet)"}\n` +
    `Timeline: ${TIMELINES.find((t) => t.id === state.timeline)?.name}\n` +
    `Budget: ${BUDGETS.find((b) => b.id === state.budget)?.name}\n` +
    `Name: ${extra.name || "(not provided)"}\n` +
    `Email: ${extra.email || "(not provided)"}\n` +
    `Note: ${extra.note || "(no note)"}`;

  const mailto = `mailto:tommy@tommytinkers.nz?subject=${encodeURIComponent("Codebench brief — " + rec.headline)}&body=${encodeURIComponent(briefSummary)}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = mailto;
    setSent(true);
    setTimeout(() => setSent(false), 6000);
  }

  return (
    <div>
      <StepProgress step={4} total={4} />
      <h3 className="cb-step-q">{rec.headline}.</h3>
      <p className="cb-step-sub">{rec.summary}</p>
      <div className="cb-result">
        {rec.priceLow > 0 && (
          <div className="cb-result-banner">
            <div>
              <h3>Ballpark estimate</h3>
              <p>{rec.budgetNote ?? "Fixed-price, payable in two halves: 50% on start, 50% on launch."}</p>
            </div>
            <div className="cb-result-price">
              {fmt$(rec.priceLow)}–{fmt$(rec.priceHigh)}
              <small>~{rec.baseWeeks} weeks</small>
            </div>
          </div>
        )}
        {rec.rushNote && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange-deep)", background: "var(--color-accent-subtle)", border: "1px dashed var(--color-accent-muted)", padding: "10px 14px", borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {rec.rushNote}
          </div>
        )}
        <div className="cb-result-cols">
          <div className="cb-result-block">
            <h5>&gt; recommended stack</h5>
            <ul>
              {rec.stack.map((s) => <li key={s}><Check size={14} strokeWidth={3} />{s}</li>)}
            </ul>
            {rec.altStack.length > 0 && (
              <p style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                Or, if you have an opinion: {rec.altStack.join(" · ")}
              </p>
            )}
          </div>
          <div className="cb-result-block">
            <h5>&gt; what you get</h5>
            <ul>
              {rec.deliverables.map((d) => <li key={d}><Package size={14} />{d}</li>)}
            </ul>
          </div>
        </div>
        <div className="cb-result-block">
          <h5>&gt; how the build goes</h5>
          <div className="cb-phases">
            {rec.phases.map((p, i) => (
              <div key={p.key} className="cb-phase">
                <div className="cb-phase-key">phase {String(i + 1).padStart(2, "0")} — {p.key}</div>
                <div>
                  <div className="cb-phase-name">{p.name}</div>
                  <div className="cb-phase-body">{p.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cb-handoff">
          <h5>Hand this brief to Tommy</h5>
          <p>Drop your name + email and a one-liner about what&apos;s most important. I&apos;ll reply within a working day with questions, a firmer quote, or a time to talk.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="tt-grid-2">
              <div>
                <label className="tt-field-label" htmlFor="cb-name">Your name</label>
                <input id="cb-name" className="tt-input" value={extra.name} onChange={(e) => setExtra({ ...extra, name: e.target.value })} />
              </div>
              <div>
                <label className="tt-field-label" htmlFor="cb-email">Email</label>
                <input id="cb-email" type="email" className="tt-input" value={extra.email} onChange={(e) => setExtra({ ...extra, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="tt-field-label" htmlFor="cb-note">One line on what matters most</label>
              <input id="cb-note" className="tt-input" placeholder="e.g. needs to launch before our open day on June 28" value={extra.note} onChange={(e) => setExtra({ ...extra, note: e.target.value })} />
            </div>
            <div className="cb-handoff-row">
              <button type="submit" className="tt-btn tt-btn-primary"><Send size={14} /> Send the brief</button>
              <a className="tt-btn tt-btn-ghost" href={mailto}><Mail size={14} /> Or open in email</a>
              <button type="button" className="tt-btn tt-btn-ghost" style={{ marginLeft: "auto" }}
                onClick={() => set({ step: 1, type: "", features: [], timeline: "", budget: "" })}>
                <RotateCcw size={14} /> Start over
              </button>
            </div>
            {sent && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-success)", background: "rgba(76,175,46,0.08)", border: "1px solid rgba(76,175,46,0.3)", padding: "10px 14px", borderRadius: 8 }}>
                ✓ Draft opened in your email app — I&apos;ll be in touch within a working day.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PAGE ROOT
   ========================================================================= */

export default function CodebenchPage() {
  const [state, setStateRaw] = useState<WizardState>(() => {
    if (typeof window === "undefined") return { step: 1, type: "", features: [], timeline: "", budget: "" };
    try {
      const saved = localStorage.getItem("tt-codebench-v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { step: 1, type: "", features: [], timeline: "", budget: "" };
  });

  const set = (patch: Partial<WizardState>) => setStateRaw((s) => {
    const next = { ...s, ...patch };
    try { localStorage.setItem("tt-codebench-v1", JSON.stringify(next)); } catch {}
    return next;
  });

  const rec = useMemo(() => buildRecommendation(state), [state.type, state.features, state.timeline, state.budget]);

  return (
    <>
      {/* Hero */}
      <section className="cb-hero">
        <div className="tt-container">
          <div className="cb-hero-grid">
            <div>
              <div className="cb-prompt">$ cd ~/codebench &amp;&amp; make ideas</div>
              <h1>The <em>codebench.</em></h1>
              <p className="cb-lead">
                The digital half of the workshop. I build the websites, web apps, internal tools, and weird little scripts that keep small NZ businesses moving. One developer, no agency tax, honest about what&apos;s worth building.
              </p>
              <div className="cb-hero-meta">
                <span><CheckCircle2 size={14} /> Available from June</span>
                <span><MapPin size={14} /> Helensville, NZ</span>
                <span><Clock size={14} /> Replies within 1 working day</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <a className="tt-btn tt-btn-warm" href="#build-sheet"><Hammer size={14} /> Sketch a project</a>
                <a className="tt-btn tt-btn-ghost" href="#what-i-build"><ArrowDown size={14} /> See what I build</a>
              </div>
            </div>
            <div className="cb-mini-term">
              <div className="cb-mini-term-head">
                <span className="dot r" /><span className="dot y" /><span className="dot g" />
                <span className="title">~/codebench &gt; status.sh</span>
              </div>
              <div className="cb-mini-term-body">
                <div><span className="pr">$</span> ./status</div>
                <div className="ln"><span className="cm"># freelance dev capacity, helensville NZ</span></div>
                <div className="ln"><span className="ac">role</span>     full-stack web dev</div>
                <div className="ln"><span className="ac">stack</span>    TS · Next · Postgres</div>
                <div className="ln"><span className="ac">slots</span>    1 of 2 free in June</div>
                <div className="ln"><span className="ac">replies</span>  within 1 working day</div>
                <div className="ln"><span className="ac">rate</span>     NZ$95/hr · or fixed price</div>
                <div className="ln" style={{ marginTop: 8 }}><span className="pr">$</span> ./next</div>
                <div className="ok">→ tell me what you&apos;re picturing</div>
                <span className="pg">● open for work</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="what-i-build" className="tt-section">
        <div className="tt-container">
          <div className="tt-section-header">
            <span className="tt-section-eyebrow">&gt; 01. what i build</span>
            <h2 className="tt-section-title">Four kinds of digital work</h2>
            <p className="tt-section-sub">Roughly. Most projects are a mix. If it lives on the internet and someone needs it built, the answer is usually yes.</p>
          </div>
          <div className="cb-services">
            {SERVICES.map((s) => (
              <article key={s.title} className="tt-card cb-service-card">
                <div className="cb-service-icon"><s.Icon size={22} /></div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
                <div className="cb-svc-eg">{s.eg}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section id="build-sheet" className="cb-wiz-section">
        <div className="tt-container">
          <div className="tt-section-header">
            <span className="tt-section-eyebrow">&gt; 02. start a project</span>
            <h2 className="tt-section-title">Sketch your build, live.</h2>
            <p className="tt-section-sub">Four quick questions. As you answer, the build sheet on the right fills itself in — stack, phases, ballpark, and what you&apos;d actually get. No sign-up. Saves to this device.</p>
          </div>
          <div className="cb-wiz-grid">
            <div className="cb-step-card">
              {state.step === 1 && <Step1 state={state} set={set} />}
              {state.step === 2 && <Step2 state={state} set={set} />}
              {state.step === 3 && <Step3 state={state} set={set} />}
              {state.step === 4 && rec && <Step4 state={state} set={set} rec={rec} />}
            </div>
            <BuildSheet state={state} rec={rec} />
          </div>
        </div>
      </section>

      {/* Past Work */}
      <section id="past-work" className="tt-section">
        <div className="tt-container">
          <div className="tt-section-header">
            <span className="tt-section-eyebrow">&gt; 03. past work</span>
            <h2 className="tt-section-title">Three recent things, three NZ businesses.</h2>
            <p className="tt-section-sub">Small selection. Happy to share more on a call — including the ones that didn&apos;t go to plan and what I learned.</p>
          </div>
          <div className="cb-work-grid">
            {PAST_WORK.map((w) => (
              <article key={w.name} className="tt-card cb-work-card">
                <span className="kind">{w.kind}</span>
                <h4>{w.name}</h4>
                <p>{w.body}</p>
                <div className="cb-work-tags">{w.tags.map((t) => <span key={t} className="tt-tag">{t}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
