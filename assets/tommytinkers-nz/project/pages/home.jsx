/* tommytinkers.nz · Home page */
const { useState: useHState, useEffect: useHEffect } = React;

/* ---------- Typewriter prompt ---------- */
const TYPE_PHRASES = ["ship websites", "cut stickers", "print parts", "build tools", "make things"];

const Typewriter = ({ phrases = TYPE_PHRASES, typeMs = 75, deleteMs = 38, holdFullMs = 1700, holdEmptyMs = 320 }) => {
  const [pIdx, setPIdx] = useHState(0);
  const [text, setText] = useHState("");
  const [phase, setPhase] = useHState("type"); // type | hold | delete | gap

  useHEffect(() => {
    const full = phrases[pIdx];
    let timer;
    if (phase === "type") {
      if (text.length < full.length) {
        timer = setTimeout(() => setText(full.slice(0, text.length + 1)), typeMs);
      } else {
        timer = setTimeout(() => setPhase("delete"), holdFullMs);
      }
    } else if (phase === "delete") {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        timer = setTimeout(() => {
          setPIdx((i) => (i + 1) % phrases.length);
          setPhase("type");
        }, holdEmptyMs);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, pIdx]);

  return (
    <span style={heroSty.prompt} aria-live="polite">
      <span style={{ opacity: 0.7 }}>$ </span>
      <span style={{ color: "#1A1816" }}>{text}</span>
      <span className="tt-caret" aria-hidden="true">▋</span>
    </span>
  );
};

/* ---------- Hero ---------- */
const HomeHero = () => (
  <section id="home" style={heroSty.section}>
    <div style={heroSty.dotgrid} aria-hidden="true" />
    <div className="tt-container" style={heroSty.container}>
      <div style={heroSty.left}>
        <Typewriter />
        <h1 style={heroSty.title}>Bringing your<br/>ideas to life.</h1>
        <div style={heroSty.eyebrow}>Maker of Things · Helensville NZ</div>
        <p style={heroSty.lead}>
          Two benches, one workshop. Freelance full-stack dev by week, vinyl cutter and 3D printers by weekend. Websites and tools for clients; stickers, RC parts, kids' toys, and useful household bits posted from NZ.
        </p>
        <div style={heroSty.meta}>
          <span style={heroSty.metaItem}><i data-lucide="map-pin" style={{ width: 14, height: 14 }}></i> Helensville, NZ</span>
          <span style={heroSty.metaItem}><i data-lucide="code-2" style={{ width: 14, height: 14 }}></i> Taking web work</span>
          <span style={heroSty.metaItem}><i data-lucide="package" style={{ width: 14, height: 14 }}></i> Shop ships in 3 days</span>
        </div>
        <div style={heroSty.ctas}>
          <a className="tt-btn" style={heroSty.ctaPrimary} href="#what-i-make">See what I do <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i></a>
          <a className="tt-btn" style={heroSty.ctaGhost} href="#contact"><i data-lucide="send" style={{ width: 14, height: 14 }}></i> Start a project</a>
        </div>
      </div>
      <div style={heroSty.right}>
        <div style={heroSty.discWrap}>
          <div style={heroSty.glow} />
          <img src="assets/logo.png" alt="" style={heroSty.disc} />
        </div>
      </div>
    </div>
  </section>
);

const heroSty = {
  section: { position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", overflow: "hidden", padding: "64px 0", background: "var(--gradient-brand)", color: "#1A1816" },
  dotgrid: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,24,22,0.18) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.25, pointerEvents: "none" },
  container: { position: "relative", width: "100%", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center" },
  left: { display: "flex", flexDirection: "column", gap: 16 },
  prompt: { fontFamily: "var(--font-mono)", fontSize: 14, color: "#1A1816", letterSpacing: "0.05em", opacity: 0.75 },
  title: { fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(48px, 6.5vw, 78px)", letterSpacing: "-0.03em", lineHeight: 1.02, margin: 0, color: "#1A1816", textWrap: "balance" },
  eyebrow: { fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "0.18em", fontSize: 13, textTransform: "uppercase", color: "#1A1816", opacity: 0.8 },
  lead: { fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65, color: "#1A1816", maxWidth: 540, textWrap: "pretty" },
  meta: { display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "#1A1816", letterSpacing: "0.03em", opacity: 0.85 },
  ctas: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 },
  ctaPrimary: { background: "#1A1816", color: "#FCD34D", padding: "12px 20px", borderRadius: 999, boxShadow: "0 6px 18px rgba(26,24,22,0.25)" },
  ctaGhost: { background: "transparent", color: "#1A1816", border: "1.5px solid #1A1816", padding: "12px 18px", borderRadius: 999 },
  right: { display: "flex", justifyContent: "center", alignItems: "center" },
  discWrap: { position: "relative", width: 380, height: 380, maxWidth: "100%" },
  glow: { position: "absolute", inset: -40, background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 60%)", filter: "blur(20px)" },
  disc: { position: "relative", width: "100%", height: "100%", borderRadius: "50%", boxShadow: "0 30px 60px rgba(26,24,22,0.35)" },
};

/* ---------- Section Header ---------- */
const SH = ({ num, label, title, sub }) => (
  <div className="tt-section-header">
    <span className="tt-section-eyebrow">&gt; {num}. {label}</span>
    <h2 className="tt-section-title">{title}</h2>
    {sub && <p className="tt-section-sub">{sub}</p>}
  </div>
);

/* ---------- About ---------- */
const HomeAbout = () => (
  <section id="about" className="tt-section">
    <div className="tt-container">
      <SH num="01" label="hello" title="The person behind the workshop" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--color-text-primary)", margin: 0, textWrap: "pretty" }}>
            I'm Tommy, a full-stack developer based in Helensville. By day I build websites, internal tools, and the boring-but-useful scripts that automate the bits you hate. By night and weekend I'm in the garage with a vinyl cutter and two 3D printers, cutting stickers and printing parts.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty" }}>
            Before all this I spent 15 years maintaining safety-critical avionics for the Royal New Zealand Air Force. That background still shapes everything I ship: tight tolerances, clear documentation, doing things properly.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {["TypeScript", "Next.js", "React", "Node.js", "Postgres", "vinyl cutting", "PETG", "PLA", "fusion 360", "NZ-made"].map((t) => (
              <span key={t} className="tt-tag">{t}</span>
            ))}
          </div>
        </div>
        <div style={aboutSty.term}>
          <div style={aboutSty.termHead}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
            <span style={{ marginLeft: "auto", color: "var(--color-text-muted)", fontSize: 11 }}>~/workshop.txt</span>
          </div>
          <div style={{ padding: "16px" }}>
            <div><span style={{ color: "var(--color-accent)" }}>$</span> <span style={{ color: "var(--color-text-primary)" }}>cat workshop.txt</span></div>
            <div style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>NAME &nbsp;&nbsp;Thomas "Tommy" Goodman</div>
            <div style={{ color: "var(--color-text-secondary)" }}>ROLE &nbsp;&nbsp;Full-stack dev / maker</div>
            <div style={{ color: "var(--color-text-secondary)" }}>HQ &nbsp;&nbsp;&nbsp;&nbsp;Helensville, Auckland</div>
            <div style={{ color: "var(--color-text-secondary)" }}>STACK &nbsp;TS, Next, React, Node, Postgres</div>
            <div style={{ color: "var(--color-text-secondary)" }}>GEAR &nbsp;&nbsp;1× Cricut, 2× Bambu, 1× shop dog</div>
            <div style={{ color: "var(--color-text-secondary)" }}>STATE &nbsp;<span style={{ color: "var(--color-accent)" }}>open for work + orders</span></div>
            <div style={{ marginTop: 10 }}><span style={{ color: "var(--color-accent)" }}>$</span> <span style={{ color: "var(--color-text-primary)" }}>echo $MOTTO</span></div>
            <div style={{ color: "var(--color-warm-orange-deep)", marginTop: 4 }}>"Bringing your ideas to life."</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const aboutSty = {
  term: { background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", borderRadius: 10, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, overflow: "hidden" },
  termHead: { display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--color-border-default)", alignItems: "center" },
};

/* ---------- What I make (the 5 benches) ---------- */
const cats = [
  { id: "stickers", icon: "scissors", title: "Stickers & decals", body: "Vinyl cut on a Cricut. Outdoor-grade, weather-proof. Custom designs welcome, set turnaround two weeks.", swatch: ["#4caf2e", "#1a1816"] },
  { id: "rc-parts", icon: "car", title: "RC car parts", body: "1/10 scale parts in PETG and PLA. Bumpers, mounts, skid plates. Bring a STL or describe the part, I'll print it.", swatch: ["#f97316", "#1a1816"] },
  { id: "toys", icon: "blocks", title: "Kids' toys", body: "Articulated dinosaurs, marble runs, stomp rockets. Safe materials, no small parts unless the listing says so.", swatch: ["#fcd34d", "#4caf2e"] },
  { id: "household", icon: "home", title: "Household solutions", body: "Hooks, organisers, cable docks, jar shelves. The bits you wish existed for that one specific corner.", swatch: ["#fb923c", "#fcd34d"] },
];

const webDevWork = [
  { kind: "marketing site", name: "kaipara-co.nz", tag: "Next.js + Sanity" },
  { kind: "internal tool", name: "fleet key tracker", tag: "saved a fleet manager ~80% of admin time" },
  { kind: "small saas", name: "Bookkit", tag: "Stripe + Postgres" },
];

const HomeWhatIMake = () => (
  <section id="what-i-make" className="tt-section tt-section-tinted">
    <div className="tt-container">
      <SH num="02" label="things i make" title="Two benches, one workshop"
        sub="Half my week is freelance web work for clients. The other half I'm in the garage cutting vinyl and printing parts. Pick a bench, or send a sketch and I'll tell you which one it lives on." />

      {/* ---------- Featured: Freelance web development ---------- */}
      <article id="web-dev" className="tt-card" style={{
        padding: 36, marginBottom: 24, borderRadius: "var(--radius-2xl)",
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center",
      }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 999, background: "var(--gradient-brand)",
            color: "#1A1816", fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18,
            fontWeight: 600,
          }}>
            <i data-lucide="terminal" style={{ width: 12, height: 12 }}></i> main bench
          </div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, margin: 0, marginBottom: 12, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Freelance web development
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: 0, marginBottom: 18, maxWidth: 520, textWrap: "pretty" }}>
            Websites, internal tools, and the boring-but-useful scripts that automate the bit you hate doing. Built clean, documented, and handed over so you can keep running it yourself. No agency overhead, one person on the job.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {["TypeScript", "Next.js", "React", "Node", "Postgres", "Tailwind"].map((t) => (
              <span key={t} className="tt-tag">{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="codebench.html#build-sheet" className="tt-btn tt-btn-primary">
              <i data-lucide="hammer" style={{ width: 14, height: 14 }}></i> Sketch a project
            </a>
            <a href="codebench.html" className="tt-btn tt-btn-ghost">
              See the codebench <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
            </a>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
            &gt; recent work
          </div>
          {webDevWork.map((w, i) => (
            <div key={i} style={{
              background: "var(--color-bg-raised)",
              border: "1px solid var(--color-border-default)",
              borderRadius: 10, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, flex: "0 0 auto", borderRadius: 8,
                background: "var(--gradient-brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#1A1816",
              }}>
                <i data-lucide={["globe", "wrench", "credit-card"][i]} style={{ width: 16, height: 16, strokeWidth: 2 }}></i>
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

      {/* ---------- The four making benches ---------- */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, marginTop: 8 }}>
        &gt; and the four making benches
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {cats.map((c) => (
          <a key={c.id} href={`shop.html?cat=${c.id}`} className="tt-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${c.swatch[0]} 0%, ${c.swatch[1]} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fdf8ee", marginBottom: 18,
            }}>
              <i data-lucide={c.icon} style={{ width: 22, height: 22, strokeWidth: 2 }}></i>
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, margin: 0, marginBottom: 8 }}>{c.title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty" }}>{c.body}</p>
            <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em" }}>
              browse <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Featured products ---------- */
const FeatureCard = ({ p }) => {
  const s = p.swatch || ["#fcd34d", "#fb923c"];
  return (
    <article className="tt-card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
      <div style={{
        aspectRatio: "1 / 1", width: "100%",
        background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1] || s[0]} 100%)`,
        borderTopLeftRadius: "var(--radius-xl)", borderTopRightRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)" }}/>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", color: "#1A1816", opacity: 0.55, textTransform: "uppercase", position: "relative" }}>
          {p.cat.replace("-", " ")}
        </span>
      </div>
      <div style={{ padding: "18px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.cat.replace("-", " ")}</span>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "4px 0 6px", lineHeight: 1.3 }}>{p.name}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)", margin: 0, marginBottom: 12, minHeight: 40 }}>{p.blurb}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, color: "var(--color-text-primary)" }}>NZ${p.price.toFixed(2)}</span>
          <button className="tt-btn tt-btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}
            onClick={() => { window.ttCartAdd(p.id, 1); window.ttCartOpen(); }}>
            <i data-lucide="plus" style={{ width: 12, height: 12 }}></i> Add
          </button>
        </div>
      </div>
    </article>
  );
};

const HomeFeatured = () => {
  const featured = window.TT_PRODUCTS.filter((p) => p.featured).slice(0, 4);
  return (
    <section id="featured" className="tt-section">
      <div className="tt-container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <SH num="03" label="on the bench" title="Recently in stock" />
          <a className="tt-btn tt-btn-ghost" href="shop.html" style={{ marginBottom: 24 }}>Shop everything <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i></a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {featured.map((p) => <FeatureCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
};

/* ---------- Process ---------- */
const steps = [
  { n: "01", title: "Sketch", body: "Send a brief, a doodle, or just describe what you want. No spec sheet needed." },
  { n: "02", title: "Quote", body: "I reply within a working day with a flat price, scope, and an honest turnaround." },
  { n: "03", title: "Build", body: "Cut, print, code, test. You get a preview before it ships, or a staging link if it's a site." },
  { n: "04", title: "Hand over", body: "Tracked NZ Post if it's physical. Pushed to your domain if it's a site. You get the keys either way." },
];

const HomeProcess = () => (
  <section id="process" className="tt-section tt-section-tinted">
    <div className="tt-container">
      <SH num="04" label="how it goes" title="From sketch to mailbox" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {steps.map((s) => (
          <div key={s.n} style={{ paddingLeft: 20, borderLeft: "2px solid var(--color-accent-muted)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange-deep)", letterSpacing: "0.1em", marginBottom: 6 }}>STEP {s.n}</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: 0, marginBottom: 6 }}>{s.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty" }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Contact ---------- */
const HomeContact = () => {
  const [form, setForm] = useHState({ name: "", email: "", message: "" });
  const [sent, setSent] = useHState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); };
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
                <i data-lucide="send" style={{ width: 14, height: 14 }}></i> Send message
              </button>
              {sent && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-accent)" }}>✓ Sent. I'll be in touch.</span>}
            </div>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "mail", label: "Email", val: "tommy@tommytinkers.nz", href: "mailto:tommy@tommytinkers.nz" },
              { icon: "instagram", label: "Instagram", val: "@tommytinkersnz", href: "https://instagram.com/tommytinkersnz" },
              { icon: "map-pin", label: "Pickup by appointment", val: "Helensville, Auckland", href: null },
              { icon: "clock", label: "Reply time", val: "Within one working day", href: null },
            ].map((r, i) => {
              const Inner = (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warm-orange-deep)", flex: "0 0 auto" }}>
                    <i data-lucide={r.icon} style={{ width: 16, height: 16 }}></i>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{r.label}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)" }}>{r.val}</span>
                  </div>
                </>
              );
              return r.href
                ? <a key={i} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", gap: 14, alignItems: "center", textDecoration: "none" }}>{Inner}</a>
                : <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>{Inner}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Home root ---------- */
const HomePage = () => {
  useHEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return (
    <>
      <TTNav active="home" />
      <main>
        <HomeHero />
        <HomeAbout />
        <HomeWhatIMake />
        <HomeFeatured />
        <HomeProcess />
        <HomeContact />
      </main>
      <TTFooter />
      <TTCartDrawer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<HomePage />);
