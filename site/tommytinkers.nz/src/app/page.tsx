'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Code2, Package, ArrowRight, Send, Terminal,
  Globe, Wrench, CreditCard, Hammer, Scissors, Car, Home, Plus, Mail, AtSign, Clock,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getFeatured } from "@/lib/products";
import type { Product } from "@/lib/types";
import { Blocks } from "lucide-react";

/* ---------------------------------------------------------- */
/*  Typewriter                                                  */
/* ---------------------------------------------------------- */
const TYPE_PHRASES = ["ship websites", "cut stickers", "print parts", "build tools", "make things"];

function Typewriter() {
  const [pIdx, setPIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "delete">("type");

  useEffect(() => {
    const full = TYPE_PHRASES[pIdx];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (text.length < full.length) {
        timer = setTimeout(() => setText(full.slice(0, text.length + 1)), 75);
      } else {
        timer = setTimeout(() => setPhase("delete"), 1700);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 38);
      } else {
        timer = setTimeout(() => { setPIdx((i) => (i + 1) % TYPE_PHRASES.length); setPhase("type"); }, 320);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, pIdx]);

  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#1A1816", letterSpacing: "0.05em", opacity: 0.75 }} aria-live="polite">
      <span style={{ opacity: 0.7 }}>$ </span>
      <span style={{ color: "#1A1816" }}>{text}</span>
      <span className="tt-caret" aria-hidden="true">▋</span>
    </span>
  );
}

/* ---------------------------------------------------------- */
/*  Section header helper                                       */
/* ---------------------------------------------------------- */
function SH({ num, label, title, sub }: { num: string; label: string; title: string; sub?: string }) {
  return (
    <div className="tt-section-header">
      <span className="tt-section-eyebrow">&gt; {num}. {label}</span>
      <h2 className="tt-section-title">{title}</h2>
      {sub && <p className="tt-section-sub">{sub}</p>}
    </div>
  );
}

/* ---------------------------------------------------------- */
/*  Hero                                                        */
/* ---------------------------------------------------------- */
function HomeHero() {
  return (
    <section id="home" style={{
      position: "relative", minHeight: "calc(100vh - 64px)", display: "flex",
      alignItems: "center", overflow: "hidden", padding: "64px 0",
      background: "var(--gradient-brand)", color: "#1A1816",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,24,22,0.18) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.25, pointerEvents: "none" }} />
      <div className="tt-container" style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Typewriter />
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(48px, 6.5vw, 78px)", letterSpacing: "-0.03em", lineHeight: 1.02, margin: 0, color: "#1A1816" }}>
            Bringing your<br />ideas to life.
          </h1>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "0.18em", fontSize: 13, textTransform: "uppercase", color: "#1A1816", opacity: 0.8 }}>
            Maker of Things · Helensville NZ
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65, color: "#1A1816", maxWidth: 540 }}>
            Two benches, one workshop. Freelance full-stack dev by week, vinyl cutter and 3D printers by weekend. Websites and tools for clients; stickers, RC parts, kids&apos; toys, and useful household bits posted from NZ.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            {[
              { icon: <MapPin size={14} />, text: "Helensville, NZ" },
              { icon: <Code2 size={14} />, text: "Taking web work" },
              { icon: <Package size={14} />, text: "Shop ships in 3 days" },
            ].map((m, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "#1A1816", letterSpacing: "0.03em", opacity: 0.85 }}>
                {m.icon} {m.text}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <Link href="#what-i-make" className="tt-btn tt-btn-hero" style={{ background: "#1A1816", color: "#FCD34D", padding: "12px 20px", borderRadius: 999, boxShadow: "0 6px 18px rgba(26,24,22,0.25)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              See what I do <ArrowRight size={14} />
            </Link>
            <Link href="#contact" className="tt-btn tt-btn-hero" style={{ background: "transparent", color: "#1A1816", border: "1.5px solid #1A1816", padding: "12px 18px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Send size={14} /> Start a project
            </Link>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative", width: 380, height: 380, maxWidth: "100%" }}>
            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 60%)", filter: "blur(20px)" }} />
            <Image src="/assets/logo.png" alt="" fill style={{ borderRadius: "50%", boxShadow: "0 30px 60px rgba(26,24,22,0.35)", objectFit: "cover" }} priority />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #home .tt-container { grid-template-columns: 1fr !important; }
          #home .tt-container > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  About                                                       */
/* ---------------------------------------------------------- */
function HomeAbout() {
  const tags = ["TypeScript", "Next.js", "React", "Node.js", "Postgres", "vinyl cutting", "PETG", "PLA", "fusion 360", "NZ-made"];
  return (
    <section id="about" className="tt-section">
      <div className="tt-container">
        <SH num="01" label="hello" title="The person behind the workshop" />
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--color-text-primary)", margin: 0 }}>
              I&apos;m Tommy, a full-stack developer based in Helensville. By day I build websites, internal tools, and the boring-but-useful scripts that automate the bits you hate. By night and weekend I&apos;m in the garage with a vinyl cutter and two 3D printers, cutting stickers and printing parts.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
              Before all this I spent 15 years maintaining safety-critical avionics for the Royal New Zealand Air Force. That background still shapes everything I ship: tight tolerances, clear documentation, doing things properly.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {tags.map((t) => <span key={t} className="tt-tag">{t}</span>)}
            </div>
          </div>
          <div style={{ background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", borderRadius: 10, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--color-border-default)", alignItems: "center" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
              <span style={{ marginLeft: "auto", color: "var(--color-text-muted)", fontSize: 11 }}>~/workshop.txt</span>
            </div>
            <div style={{ padding: 16 }}>
              <div><span style={{ color: "var(--color-accent)" }}>$</span> <span style={{ color: "var(--color-text-primary)" }}>cat workshop.txt</span></div>
              {[
                ["NAME", `Thomas "Tommy" Goodman`],
                ["ROLE", "Full-stack dev / maker"],
                ["HQ", "Helensville, Auckland"],
                ["STACK", "TS, Next, React, Node, Postgres"],
                ["GEAR", "1× Cricut, 2× Bambu, 1× shop dog"],
              ].map(([k, v]) => (
                <div key={k} style={{ color: "var(--color-text-secondary)" }}>
                  {k.padEnd(6)} {v}
                </div>
              ))}
              <div style={{ color: "var(--color-text-secondary)" }}>
                STATE &nbsp;<span style={{ color: "var(--color-accent)" }}>open for work + orders</span>
              </div>
              <div style={{ marginTop: 10 }}><span style={{ color: "var(--color-accent)" }}>$</span> <span style={{ color: "var(--color-text-primary)" }}>echo $MOTTO</span></div>
              <div style={{ color: "var(--color-warm-orange-deep)", marginTop: 4 }}>&quot;Bringing your ideas to life.&quot;</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          #about .tt-container > div[style] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  What I Make                                                 */
/* ---------------------------------------------------------- */
const CATS = [
  { id: "stickers", icon: <Scissors size={22} />, title: "Stickers & decals", body: "Vinyl cut on a Cricut. Outdoor-grade, weather-proof. Custom designs welcome, set turnaround two weeks.", swatch: ["#4caf2e", "#1a1816"] },
  { id: "rc-parts", icon: <Car size={22} />, title: "RC car parts", body: "1/10 scale parts in PETG and PLA. Bumpers, mounts, skid plates. Bring a STL or describe the part, I'll print it.", swatch: ["#f97316", "#1a1816"] },
  { id: "toys", icon: <Blocks size={22} />, title: "Kids' toys", body: "Articulated dinosaurs, marble runs, stomp rockets. Safe materials, no small parts unless the listing says so.", swatch: ["#fcd34d", "#4caf2e"] },
  { id: "household", icon: <Home size={22} />, title: "Household solutions", body: "Hooks, organisers, cable docks, jar shelves. The bits you wish existed for that one specific corner.", swatch: ["#fb923c", "#fcd34d"] },
];

const WEB_WORK = [
  { kind: "marketing site", name: "kaipara-co.nz", tag: "Next.js + Sanity", Icon: Globe },
  { kind: "internal tool", name: "fleet key tracker", tag: "saved a fleet manager ~80% of admin time", Icon: Wrench },
  { kind: "small saas", name: "Bookkit", tag: "Stripe + Postgres", Icon: CreditCard },
];

function HomeWhatIMake() {
  return (
    <section id="what-i-make" className="tt-section tt-section-tinted">
      <div className="tt-container">
        <SH num="02" label="things i make" title="Two benches, one workshop"
          sub="Half my week is freelance web work for clients. The other half I'm in the garage cutting vinyl and printing parts. Pick a bench, or send a sketch and I'll tell you which one it lives on." />

        <article className="tt-card" style={{ padding: 36, marginBottom: 24, borderRadius: "var(--radius-2xl)", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: "var(--gradient-brand)", color: "#1A1816", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18, fontWeight: 600 }}>
              <Terminal size={12} /> main bench
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, margin: 0, marginBottom: 12, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Freelance web development
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: 0, marginBottom: 18, maxWidth: 520 }}>
              Websites, internal tools, and the boring-but-useful scripts that automate the bit you hate doing. Built clean, documented, and handed over so you can keep running it yourself.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {["TypeScript", "Next.js", "React", "Node", "Postgres", "Tailwind"].map((t) => <span key={t} className="tt-tag">{t}</span>)}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/codebench" className="tt-btn tt-btn-primary">
                <Hammer size={14} /> Sketch a project
              </Link>
              <Link href="/codebench" className="tt-btn tt-btn-ghost">
                See the codebench <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>&gt; recent work</div>
            {WEB_WORK.map((w) => (
              <div key={w.name} style={{ background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, flex: "0 0 auto", borderRadius: 8, background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1816" }}>
                  <w.Icon size={16} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-warm-orange-deep)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{w.kind}</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", marginTop: 2 }}>{w.name}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{w.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, marginTop: 8 }}>&gt; and the four making benches</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {CATS.map((c) => (
            <Link key={c.id} href={`/shop?cat=${c.id}`} className="tt-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${c.swatch[0]} 0%, ${c.swatch[1]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fdf8ee", marginBottom: 18 }}>
                {c.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, margin: 0, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>{c.body}</p>
              <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em" }}>
                browse <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  Featured Products                                           */
/* ---------------------------------------------------------- */
function FeatureCard({ p }: { p: Product }) {
  const { addItem, openCart } = useCart();
  const s = p.swatch || ["#fcd34d", "#fb923c"];
  return (
    <article className="tt-card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
      <div style={{ aspectRatio: "1 / 1", width: "100%", background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1]} 100%)`, borderTopLeftRadius: "var(--radius-xl)", borderTopRightRadius: "var(--radius-xl)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", color: "#1A1816", opacity: 0.55, textTransform: "uppercase", position: "relative" }}>
          {p.cat.replace("-", " ")}
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.cat.replace("-", " ")}</span>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "4px 0 6px", lineHeight: 1.3 }}>{p.name}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)", margin: 0, marginBottom: 12, minHeight: 40 }}>{p.blurb}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18 }}>NZ${p.price.toFixed(2)}</span>
          <button className="tt-btn tt-btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}
            onClick={() => { addItem(p.id); openCart(); }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

function HomeFeatured() {
  const featured = getFeatured().slice(0, 4);
  return (
    <section id="featured" className="tt-section">
      <div className="tt-container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <SH num="03" label="on the bench" title="Recently in stock" />
          <Link href="/shop" className="tt-btn tt-btn-ghost" style={{ marginBottom: 24 }}>
            Shop everything <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {featured.map((p) => <FeatureCard key={p.id} p={p} />)}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          #featured .tt-container > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          #featured .tt-container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  Process                                                     */
/* ---------------------------------------------------------- */
const STEPS = [
  { n: "01", title: "Sketch", body: "Send a brief, a doodle, or just describe what you want. No spec sheet needed." },
  { n: "02", title: "Quote", body: "I reply within a working day with a flat price, scope, and an honest turnaround." },
  { n: "03", title: "Build", body: "Cut, print, code, test. You get a preview before it ships, or a staging link if it's a site." },
  { n: "04", title: "Hand over", body: "Tracked NZ Post if it's physical. Pushed to your domain if it's a site. You get the keys either way." },
];

function HomeProcess() {
  return (
    <section id="process" className="tt-section tt-section-tinted">
      <div className="tt-container">
        <SH num="04" label="how it goes" title="From sketch to mailbox" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ paddingLeft: 20, borderLeft: "2px solid var(--color-accent-muted)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange-deep)", letterSpacing: "0.1em", marginBottom: 6 }}>STEP {s.n}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: 0, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          #process .tt-container > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  Contact                                                     */
/* ---------------------------------------------------------- */
function HomeContact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `${form.name.trim() ? `${form.name.trim()} - ` : ""}Website enquiry`;
    const body = [
      `Name: ${form.name.trim() || "(not provided)"}`,
      `Email: ${form.email.trim() || "(not provided)"}`,
      "",
      form.message.trim() || "(no message)",
    ].join("\n");
    window.location.href = `mailto:tommy@tommytinkers.nz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const contactLinks = [
    { Icon: Mail, label: "Email", val: "tommy@tommytinkers.nz", href: "mailto:tommy@tommytinkers.nz" },
    { Icon: AtSign, label: "Instagram", val: "@tommytinkersnz", href: "https://instagram.com/tommytinkersnz" },
    { Icon: MapPin, label: "Pickup by appointment", val: "Helensville, Auckland", href: null },
    { Icon: Clock, label: "Reply time", val: "Within one working day", href: null },
  ];

  return (
    <section id="contact" className="tt-section">
      <div className="tt-container">
        <SH num="05" label="say hi" title="Got a project or a custom job?" sub="A website to build, a tool to automate something, or a custom thing to make. Tell me what you're picturing and I'll reply within a working day." />
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "start" }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="tt-grid-2">
              <div>
                <label htmlFor="cn" className="tt-field-label">Your name</label>
                <input id="cn" className="tt-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="ce" className="tt-field-label">Email</label>
                <input id="ce" type="email" className="tt-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="cm" className="tt-field-label">What can I make for you?</label>
              <textarea id="cm" className="tt-textarea" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
              <button type="submit" className="tt-btn tt-btn-primary">
                <Send size={14} /> Send message
              </button>
              {sent && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-accent)" }}>✓ Draft opened in your email app. I&apos;ll be in touch.</span>}
            </div>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {contactLinks.map(({ Icon, label, val, href }) => {
              const inner = (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warm-orange-deep)", flex: "0 0 auto" }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)" }}>{val}</span>
                  </div>
                </>
              );
              return href
                ? <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", gap: 14, alignItems: "center", textDecoration: "none" }}>{inner}</a>
                : <div key={label} style={{ display: "flex", gap: 14, alignItems: "center" }}>{inner}</div>;
            })}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          #contact .tt-container > div[style] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------- */
/*  Page root                                                   */
/* ---------------------------------------------------------- */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <HomeWhatIMake />
      <HomeFeatured />
      <HomeProcess />
      <HomeContact />
    </>
  );
}
