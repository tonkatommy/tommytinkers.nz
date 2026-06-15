/* tommytinkers.nz · The Shed — combined Pinboard (public feed) + Workshop (members) */
const { useState: useShedState, useEffect: useShedEffect, useMemo: useShedMemo } = React;

const SHED_TABS = [
  {
    id: "pinboard",
    label: "The Pinboard",
    sub: "open to all",
    desc: "The corkboard out front. Pin a build, ask a question, leave a note. Anyone can post — no sign-in needed.",
    icon: "pin",
  },
  {
    id: "workshop",
    label: "The Workshop",
    sub: "members only",
    desc: "The back of the shed. Your bench, threaded discussions, custom requests, achievements, orders. Sign-in required.",
    icon: "key-round",
  },
];

/* ---------- Tiny shed-roof SVG ornament ---------- */
const ShedMark = () => (
  <svg viewBox="0 0 220 140" width="220" height="140" aria-hidden="true" style={{ display: "block" }}>
    <defs>
      <linearGradient id="sh-roof" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    {/* ground */}
    <line x1="0" y1="135" x2="220" y2="135" stroke="#1A1816" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
    {/* roof */}
    <path d="M30,68 L110,18 L190,68 Z" fill="url(#sh-roof)" stroke="#1A1816" strokeWidth="2.5" strokeLinejoin="round" />
    {/* body */}
    <rect x="40" y="68" width="140" height="67" fill="#FDF8EE" stroke="#1A1816" strokeWidth="2.5" />
    {/* door */}
    <rect x="98" y="86" width="36" height="49" fill="#4CAF2E" stroke="#1A1816" strokeWidth="2" />
    <circle cx="127" cy="111" r="2" fill="#1A1816" />
    {/* windows */}
    <rect x="54" y="84" width="32" height="26" fill="#FCD34D" stroke="#1A1816" strokeWidth="1.8" />
    <line x1="70" y1="84" x2="70" y2="110" stroke="#1A1816" strokeWidth="1.5" />
    <line x1="54" y1="97" x2="86" y2="97" stroke="#1A1816" strokeWidth="1.5" />
    <rect x="146" y="84" width="32" height="26" fill="#FCD34D" stroke="#1A1816" strokeWidth="1.8" />
    <line x1="162" y1="84" x2="162" y2="110" stroke="#1A1816" strokeWidth="1.5" />
    <line x1="146" y1="97" x2="178" y2="97" stroke="#1A1816" strokeWidth="1.5" />
    {/* smoke / chimney puff */}
    <rect x="155" y="32" width="10" height="20" fill="#1A1816" />
    <circle cx="160" cy="26" r="6" fill="#FDF8EE" stroke="#1A1816" strokeWidth="1.5" />
    <circle cx="170" cy="18" r="4" fill="#FDF8EE" stroke="#1A1816" strokeWidth="1.5" />
    {/* OPEN sign hanging from roof eave */}
    <line x1="62" y1="68" x2="62" y2="76" stroke="#1A1816" strokeWidth="1" />
    <rect x="48" y="76" width="28" height="11" fill="#1A1816" />
    <text x="62" y="84" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#FCD34D" letterSpacing="0.05em">OPEN</text>
  </svg>
);

/* ---------- Hero ---------- */
const ShedHero = ({ tab, setTab, pinboardCount, isMember }) => {
  useShedEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [tab]);

  return (
    <section style={{
      background: "var(--color-bg-surface)",
      borderBottom: "1px solid var(--color-border-subtle)",
      paddingTop: 40, paddingBottom: 0,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -160, right: -120, width: 420, height: 420,
        background: "var(--gradient-brand-radial)", filter: "blur(70px)", opacity: 0.5,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(252,211,77,0.08) 1px, transparent 0)",
        backgroundSize: "22px 22px", pointerEvents: "none", opacity: 0.5,
      }} />
      <div className="tt-container" style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center", marginBottom: 28 }}>
          <div>
            <span className="tt-section-eyebrow">&gt; 00. the shed</span>
            <h1 style={{
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: "clamp(38px, 4.6vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.04,
              margin: "6px 0 14px", color: "var(--color-text-primary)", textWrap: "balance",
            }}>
              Round the shed.
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.6,
              color: "var(--color-text-secondary)", margin: 0, maxWidth: 620, textWrap: "pretty",
            }}>
              Two corners of the workshop. The Pinboard's the corkboard out front, open to anyone with a thought. The Workshop's the back room where members keep a bench and chase their custom builds.
            </p>
          </div>
          <div className="tt-shed-mark" style={{ display: "flex", justifyContent: "flex-end" }}>
            <ShedMark />
          </div>
        </div>

        {/* Tab switcher — two big "signs" hanging off the rafters */}
        <div className="tt-shed-tabs" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
          paddingBottom: 0, marginBottom: -1,
        }}>
          {SHED_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  textAlign: "left", cursor: "pointer",
                  background: active ? "var(--color-bg-base)" : "var(--color-bg-raised)",
                  border: "1px solid var(--color-border-subtle)",
                  borderBottom: active ? "1px solid var(--color-bg-base)" : "1px solid var(--color-border-subtle)",
                  borderTopLeftRadius: 14, borderTopRightRadius: 14,
                  borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                  padding: "16px 22px 22px",
                  position: "relative",
                  transition: "background var(--motion-base), transform var(--motion-fast)",
                  transform: active ? "translateY(0)" : "translateY(4px)",
                  boxShadow: active ? "0 -6px 18px rgba(251,146,60,0.10)" : "none",
                }}>
                {/* Tab top accent — gradient strip on active */}
                {active && (
                  <div style={{
                    position: "absolute", top: 0, left: 16, right: 16, height: 3,
                    background: "var(--gradient-brand)", borderRadius: "0 0 4px 4px",
                  }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: active ? "var(--color-accent-subtle)" : "transparent",
                    border: active ? "1px solid var(--color-accent-muted)" : "1px solid var(--color-border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  }}>
                    <i data-lucide={t.icon} style={{ width: 14, height: 14 }}></i>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    fontSize: 19, letterSpacing: "-0.01em",
                    color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  }}>{t.label}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em",
                    padding: "3px 8px", borderRadius: 999, textTransform: "uppercase",
                    background: t.id === "pinboard"
                      ? (active ? "var(--color-success)" : "var(--color-bg-base)")
                      : (active ? "var(--color-accent)" : "var(--color-bg-base)"),
                    color: active ? "var(--color-text-inverse)" : "var(--color-text-muted)",
                    border: active ? "none" : "1px solid var(--color-border-subtle)",
                  }}>{t.sub}</span>
                  {t.id === "workshop" && isMember && (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
                      color: "var(--color-success)", marginLeft: "auto",
                    }}>
                      <i data-lucide="check" style={{ width: 11, height: 11, verticalAlign: "-1px" }}></i> signed in
                    </span>
                  )}
                  {t.id === "pinboard" && pinboardCount > 0 && (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)",
                      marginLeft: "auto",
                    }}>{pinboardCount} posts</span>
                  )}
                </div>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5,
                  color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                  margin: 0, textWrap: "pretty",
                }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------- Page ---------- */
const ShedPage = () => {
  const readHash = () => {
    const h = (window.location.hash || "").replace("#", "");
    return h === "workshop" ? "workshop" : "pinboard";
  };
  const [tab, setTab] = useShedState(readHash);
  const [user, setUser] = useShedState(window.loadShedUser ? window.loadShedUser() : null);

  // Sync with hash
  useShedEffect(() => {
    const onHash = () => setTab(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useShedEffect(() => {
    const h = "#" + tab;
    if (window.location.hash !== h) {
      window.history.replaceState(null, "", h);
    }
    // Re-check user when switching to workshop (in case they signed in)
    if (window.loadShedUser) setUser(window.loadShedUser());
    if (window.lucide) window.lucide.createIcons();
  }, [tab]);

  // Live update if localStorage changes (e.g. login/logout)
  useShedEffect(() => {
    const onStorage = () => { if (window.loadShedUser) setUser(window.loadShedUser()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Pinboard count for tab badge
  const pinboardCount = useShedMemo(() => {
    try { const v = JSON.parse(localStorage.getItem("tt-feed-v1")); return v ? v.length : 6; }
    catch { return 6; }
  }, [tab]);

  return (
    <>
      <TTNav active="shed" />
      <main>
        <ShedHero tab={tab} setTab={setTab} pinboardCount={pinboardCount} isMember={!!user} />
        <div style={{ background: "var(--color-bg-base)" }}>
          {tab === "pinboard" && window.FeedView && <window.FeedView />}
          {tab === "workshop" && window.WorkshopView && <window.WorkshopView />}
        </div>
      </main>
      <TTFooter />
      <TTCartDrawer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<ShedPage />);
