/* tommytinkers.nz · Community page — login, profile, forum */
const { useState: useCState, useEffect: useCEffect, useMemo: useCMemo } = React;

/* ---------- Auth store ---------- */
const AUTH_KEY = "tt-user-v1";
const FORUM_KEY = "tt-forum-v1";

const loadUser = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } };
const saveUser = (u) => localStorage.setItem(AUTH_KEY, JSON.stringify(u));
const clearUser = () => localStorage.removeItem(AUTH_KEY);

const SEED_THREADS = [
  { id: "t1", cat: "show", author: "Aroha S.", avatarSeed: 1, title: "RC bumper guard saved my Tamiya", body: "Smashed into a kerb at Pukekohe last weekend. The PETG bumper Tommy printed me took the hit, chassis is fine. Pic attached (well, imagine a pic).", time: Date.now() - 1000*60*60*7, tags: ["rc-parts"], votes: 14, replies: [
    { id: "r1", author: "Tommy", staff: true, avatarSeed: 0, body: "Stoked it held up. Send me a measurement of the scuff and I'll thicken the next batch on that edge.", time: Date.now() - 1000*60*60*6 },
    { id: "r2", author: "Marko", avatarSeed: 3, body: "Same here, mine survived a roll. Best $18.50 I've spent.", time: Date.now() - 1000*60*60*4 },
  ] },
  { id: "t2", cat: "requests", author: "Pip L.", avatarSeed: 2, title: "Wall hook for a kid's bike helmet?", body: "Looking for something that holds a kid's helmet by the strap. Mounts on plasterboard. Anyone else want one?", time: Date.now() - 1000*60*60*22, tags: ["household"], votes: 9, replies: [
    { id: "r3", author: "Tommy", staff: true, avatarSeed: 0, body: "Easy print. Drywall anchor or a stud screw? I'll mock one this weekend.", time: Date.now() - 1000*60*60*20 },
    { id: "r4", author: "Jules", avatarSeed: 4, body: "+1 from me, two kids, two helmets, lounge floor.", time: Date.now() - 1000*60*60*18 },
  ] },
  { id: "t3", cat: "workshop", author: "Tommy", staff: true, avatarSeed: 0, title: "PETG vs PLA for outdoor parts — what I've settled on", body: "Quick note for anyone asking: PETG for anything that lives outside or takes a knock. PLA for indoor toys and quick prototypes. Don't trust PLA in a parked car in summer.", time: Date.now() - 1000*60*60*32, tags: ["tips"], votes: 22, replies: [] },
  { id: "t4", cat: "show", author: "Ben K.", avatarSeed: 5, title: "Drawer organiser, post-install", body: "Did the cutlery drawer first, now I'm doing every drawer in the kitchen. Send help (and more bins).", time: Date.now() - 1000*60*60*52, tags: ["household"], votes: 18, replies: [
    { id: "r5", author: "Marina", avatarSeed: 6, body: "Same trap I fell into. Tip: measure your drawer depth before ordering.", time: Date.now() - 1000*60*60*48 },
  ] },
];

const loadForum = () => {
  try { const v = JSON.parse(localStorage.getItem(FORUM_KEY)); return v && v.length ? v : SEED_THREADS; }
  catch { return SEED_THREADS; }
};
const saveForum = (threads) => localStorage.setItem(FORUM_KEY, JSON.stringify(threads));

const FORUM_CATS = [
  { id: "all", label: "All threads", icon: "messages-square" },
  { id: "show", label: "Show & tell", icon: "sparkles" },
  { id: "requests", label: "Custom requests", icon: "lightbulb" },
  { id: "workshop", label: "Workshop tips", icon: "wrench" },
  { id: "rc", label: "RC racing", icon: "car" },
];

const AVATAR_PALETTE = [
  ["#f97316", "#fcd34d"], ["#4caf2e", "#a8e88f"], ["#1a1816", "#fb923c"],
  ["#fb923c", "#fcd34d"], ["#2e7a1d", "#4caf2e"], ["#fcd34d", "#fb923c"],
  ["#1a1816", "#fcd34d"],
];

const Avatar = ({ name = "?", seed = 0, size = 36, staff = false }) => {
  const [a, b] = AVATAR_PALETTE[seed % AVATAR_PALETTE.length];
  const initial = (name[0] || "?").toUpperCase();
  return (
    <div style={{ position: "relative", flex: "0 0 auto" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: size * 0.42,
        color: "#1A1816", boxShadow: "0 2px 6px rgba(26,24,22,0.15)",
      }}>{initial}</div>
      {staff && (
        <span style={{
          position: "absolute", bottom: -2, right: -2,
          width: size * 0.45, height: size * 0.45, borderRadius: "50%",
          background: "var(--color-accent)", color: "var(--color-text-inverse)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--color-bg-base)",
          fontSize: size * 0.22, fontWeight: 700, fontFamily: "var(--font-mono)",
        }}>★</span>
      )}
    </div>
  );
};

/* ---------- Time formatting ---------- */
const timeAgo = (ts) => {
  const d = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  return Math.floor(d / 86400) + "d ago";
};

/* ---------- Auth panel ---------- */
const AuthPanel = ({ onLogin }) => {
  const [mode, setMode] = useCState("signin");
  const [form, setForm] = useCState({ name: "", email: "", password: "", location: "" });
  const [err, setErr] = useCState("");
  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [mode]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.email.includes("@")) { setErr("That email doesn't look right."); return; }
    if (form.password.length < 4) { setErr("Password needs at least 4 characters."); return; }
    if (mode === "signup" && !form.name.trim()) { setErr("Tell me what to call you."); return; }
    const user = {
      name: form.name.trim() || form.email.split("@")[0],
      email: form.email.trim(),
      location: form.location.trim() || "Helensville, NZ",
      bio: mode === "signup" ? "" : "Long-time tinker. Mostly here for the RC bumpers.",
      joined: Date.now(),
      avatarSeed: Math.floor(Math.random() * AVATAR_PALETTE.length),
      orders: 0,
      newsletter: true,
      notifyOnReply: true,
    };
    saveUser(user);
    onLogin(user);
  };

  return (
    <section style={{ padding: "24px 0 96px" }}>
      <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <span className="tt-section-eyebrow">&gt; the workshop</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(34px, 4.2vw, 52px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "8px 0 16px", color: "var(--color-text-primary)", textWrap: "balance" }}>
            Sign in to grab a key.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65, color: "var(--color-text-secondary)", maxWidth: 520, margin: "0 0 28px", textWrap: "pretty" }}>
            The Workshop is the back half of the shed. Your bench, custom requests, order ledger, threaded chats. The Pinboard out front stays open to everyone.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { i: "lightbulb", t: "Request a custom build", d: "Post an idea. If a few people want one, I'll make a batch and the requesters get first dibs." },
              { i: "messages-square", t: "Show your tinkers", d: "Photos, builds, mods. Tag the part if you remember the SKU." },
              { i: "bell", t: "First in line for new drops", d: "Get a heads-up when limited runs hit the shop." },
            ].map((b) => (
              <div key={b.t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warm-orange-deep)", flex: "0 0 auto" }}>
                  <i data-lucide={b.i} style={{ width: 16, height: 16 }}></i>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{b.t}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)", textWrap: "pretty" }}>{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 32, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--color-bg-raised)", padding: 4, borderRadius: 10, marginBottom: 24 }}>
            <button onClick={() => { setMode("signin"); setErr(""); }} style={tabBtn(mode === "signin")}>Sign in</button>
            <button onClick={() => { setMode("signup"); setErr(""); }} style={tabBtn(mode === "signup")}>Create account</button>
          </div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div>
                <label htmlFor="n" className="tt-field-label">Display name</label>
                <input id="n" className="tt-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What should we call you?" />
              </div>
            )}
            <div>
              <label htmlFor="e" className="tt-field-label">Email</label>
              <input id="e" type="email" className="tt-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@somewhere.nz" />
            </div>
            <div>
              <label htmlFor="p" className="tt-field-label">Password</label>
              <input id="p" type="password" className="tt-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="•••••••" />
            </div>
            {mode === "signup" && (
              <div>
                <label htmlFor="loc" className="tt-field-label">Where you're posting from</label>
                <input id="loc" className="tt-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Optional — Helensville, NZ" />
              </div>
            )}
            {err && <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-error)" }}>! {err}</div>}
            <button type="submit" className="tt-btn tt-btn-primary" style={{ marginTop: 6, justifyContent: "center", padding: "12px" }}>
              {mode === "signin" ? "Sign in" : "Create account"} <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", margin: "6px 0 0", lineHeight: 1.5 }}>
              No third-party trackers. Your details stay in NZ.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
const tabBtn = (active) => ({
  flex: 1, padding: "9px 12px", border: "none", borderRadius: 8, cursor: "pointer",
  fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600,
  background: active ? "var(--color-bg-surface)" : "transparent",
  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
  boxShadow: active ? "var(--shadow-sm)" : "none",
  transition: "all 150ms ease",
});

/* ---------- Profile sidebar ---------- */
const ProfileSidebar = ({ user, onUpdate, onLogout, onSwitchTab, activeTab }) => {
  const [editing, setEditing] = useCState(false);
  const [draft, setDraft] = useCState(user);
  useCEffect(() => setDraft(user), [user]);
  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const save = () => { onUpdate(draft); setEditing(false); };

  return (
    <aside style={{ position: "sticky", top: 80, alignSelf: "start", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: "var(--gradient-brand)" }} />
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Avatar name={user.name} seed={user.avatarSeed} size={72} />
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="tt-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Display name" />
            <input className="tt-input" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Location" />
            <textarea className="tt-textarea" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="One-liner about yourself" />
            <div>
              <div className="tt-field-label" style={{ marginBottom: 6 }}>Avatar colour</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AVATAR_PALETTE.map((p, i) => (
                  <button key={i} onClick={() => setDraft({ ...draft, avatarSeed: i })}
                    aria-label={`Avatar palette ${i + 1}`}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${p[0]}, ${p[1]})`, border: draft.avatarSeed === i ? "2px solid var(--color-accent)" : "2px solid transparent", cursor: "pointer", padding: 0 }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="tt-btn tt-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={save}>Save</button>
              <button className="tt-btn tt-btn-ghost" onClick={() => { setDraft(user); setEditing(false); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, margin: 0, marginBottom: 2, color: "var(--color-text-primary)" }}>{user.name}</h3>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", marginBottom: 12 }}>
              <i data-lucide="map-pin" style={{ width: 11, height: 11, verticalAlign: "-2px", marginRight: 4 }}></i>{user.location}
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0, marginBottom: 14, textWrap: "pretty", minHeight: 32 }}>
              {user.bio || <em style={{ color: "var(--color-text-muted)" }}>No bio yet — tap edit and add one.</em>}
            </p>
            <button className="tt-btn tt-btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 13 }} onClick={() => setEditing(true)}>
              <i data-lucide="pencil" style={{ width: 13, height: 13 }}></i> Edit profile
            </button>
          </div>
        )}
      </div>

      {window.AchievementsSidebar && (
        <window.AchievementsSidebar user={user} onOpenTab={() => onSwitchTab("achievements")} />
      )}

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, overflow: "hidden" }}>
        {[
          { id: "forum", icon: "messages-square", label: "Discussions" },
          { id: "achievements", icon: "award", label: "Achievements" },
          { id: "orders", icon: "package", label: "My orders" },
          { id: "settings", icon: "settings", label: "Settings" },
        ].map((t) => (
          <button key={t.id} onClick={() => onSwitchTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "12px 18px", border: "none", cursor: "pointer", textAlign: "left",
              background: activeTab === t.id ? "var(--color-accent-subtle)" : "transparent",
              borderLeft: activeTab === t.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: activeTab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: activeTab === t.id ? 600 : 400,
            }}>
            <i data-lucide={t.icon} style={{ width: 16, height: 16 }}></i> {t.label}
          </button>
        ))}
      </div>

      <button className="tt-btn tt-btn-ghost" onClick={onLogout} style={{ justifyContent: "center", fontSize: 13 }}>
        <i data-lucide="log-out" style={{ width: 13, height: 13 }}></i> Sign out
      </button>
    </aside>
  );
};

/* ---------- Forum view ---------- */
const ForumView = ({ user, threads, setThreads }) => {
  const [cat, setCat] = useCState("all");
  const [open, setOpen] = useCState(null);
  const [composing, setComposing] = useCState(false);
  const [draft, setDraft] = useCState({ title: "", body: "", cat: "show" });

  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const list = useCMemo(() => cat === "all" ? threads : threads.filter((t) => t.cat === cat), [cat, threads]);

  const post = (e) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;
    const t = {
      id: "t" + Date.now(), cat: draft.cat,
      author: user.name, avatarSeed: user.avatarSeed,
      title: draft.title, body: draft.body, time: Date.now(),
      tags: [], votes: 1, replies: [],
    };
    const next = [t, ...threads];
    setThreads(next); saveForum(next);
    setComposing(false); setDraft({ title: "", body: "", cat: "show" });
    setOpen(t.id);
  };

  const vote = (id) => {
    const next = threads.map((t) => t.id === id ? { ...t, votes: t.votes + 1 } : t);
    setThreads(next); saveForum(next);
  };

  const reply = (id, body) => {
    if (!body.trim()) return;
    const next = threads.map((t) => t.id === id ? { ...t, replies: [...t.replies, { id: "r" + Date.now(), author: user.name, avatarSeed: user.avatarSeed, body, time: Date.now() }] } : t);
    setThreads(next); saveForum(next);
  };

  if (open) {
    const thread = threads.find((t) => t.id === open);
    if (!thread) { setOpen(null); return null; }
    return <ThreadView thread={thread} user={user} onBack={() => setOpen(null)} onVote={() => vote(thread.id)} onReply={(b) => reply(thread.id, b)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="tt-section-eyebrow">&gt; discussions</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, margin: "4px 0 0", letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>What's on the bench?</h2>
        </div>
        <button className="tt-btn tt-btn-warm" onClick={() => setComposing((v) => !v)}>
          <i data-lucide={composing ? "x" : "plus"} style={{ width: 14, height: 14 }}></i>
          {composing ? "Cancel" : "New thread"}
        </button>
      </div>

      {composing && (
        <form onSubmit={post} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="tt-field-label" htmlFor="tt">Title</label>
              <input id="tt" className="tt-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What's it about?" />
            </div>
            <div>
              <label className="tt-field-label" htmlFor="tc">Category</label>
              <select id="tc" className="tt-select" value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })}>
                {FORUM_CATS.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="tt-field-label" htmlFor="tb">Your post</label>
            <textarea id="tb" className="tt-textarea" rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Be specific. Photos welcome." />
          </div>
          <button type="submit" className="tt-btn tt-btn-primary"><i data-lucide="send" style={{ width: 14, height: 14 }}></i> Post thread</button>
        </form>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {FORUM_CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: cat === c.id ? 600 : 400,
            padding: "7px 13px", borderRadius: 999, cursor: "pointer",
            background: cat === c.id ? "var(--color-accent)" : "transparent",
            color: cat === c.id ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
            border: cat === c.id ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
            display: "inline-flex", alignItems: "center", gap: 6, transition: "all 150ms ease",
          }}>
            <i data-lucide={c.icon} style={{ width: 13, height: 13 }}></i> {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {list.map((t) => (
          <article key={t.id} className="tt-card" style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 16, alignItems: "flex-start", cursor: "pointer", padding: 18 }}
            onClick={() => setOpen(t.id)}>
            <Avatar name={t.author} seed={t.avatarSeed} size={42} staff={t.staff} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-warm-orange-deep)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{(FORUM_CATS.find((c) => c.id === t.cat) || {}).label || t.cat}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>· {timeAgo(t.time)} · {t.author}{t.staff ? " (staff)" : ""}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: 0, marginBottom: 6, color: "var(--color-text-primary)" }}>{t.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.body}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", color: "var(--color-text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                <i data-lucide="arrow-big-up" style={{ width: 14, height: 14 }}></i> {t.votes}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                <i data-lucide="message-circle" style={{ width: 14, height: 14 }}></i> {t.replies.length}
              </div>
            </div>
          </article>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-secondary)" }}>
            <p>No threads here yet. Be the first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Thread view ---------- */
const ThreadView = ({ thread, user, onBack, onVote, onReply }) => {
  const [reply, setReply] = useCState("");
  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <i data-lucide="arrow-left" style={{ width: 13, height: 13 }}></i> back to discussions
      </button>
      <article style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
          <Avatar name={thread.author} seed={thread.avatarSeed} size={48} staff={thread.staff} />
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{thread.author}{thread.staff ? " · staff" : ""}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{timeAgo(thread.time)} · {(FORUM_CATS.find((c) => c.id === thread.cat) || {}).label}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={onVote} className="tt-btn tt-btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>
              <i data-lucide="arrow-big-up" style={{ width: 13, height: 13 }}></i> Upvote · {thread.votes}
            </button>
          </div>
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 12px", color: "var(--color-text-primary)" }}>{thread.title}</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.7, color: "var(--color-text-primary)", margin: 0, textWrap: "pretty", whiteSpace: "pre-wrap" }}>{thread.body}</p>
      </article>

      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <i data-lucide="message-circle" style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }}></i>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, color: "var(--color-text-primary)" }}>{thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {thread.replies.map((r) => (
          <div key={r.id} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 12, padding: 18, display: "flex", gap: 14 }}>
            <Avatar name={r.author} seed={r.avatarSeed} size={36} staff={r.staff} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{r.author}{r.staff ? " · staff" : ""}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{timeAgo(r.time)}</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, whiteSpace: "pre-wrap", textWrap: "pretty" }}>{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 12, padding: 18 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Avatar name={user.name} seed={user.avatarSeed} size={36} />
          <div style={{ flex: 1 }}>
            <textarea className="tt-textarea" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add a reply..." />
            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button className="tt-btn tt-btn-primary" onClick={() => { onReply(reply); setReply(""); }} disabled={!reply.trim()}>
                <i data-lucide="send" style={{ width: 13, height: 13 }}></i> Post reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Orders tab ---------- */
const OrdersView = ({ user }) => {
  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  const sample = [
    { id: "TT-2026-0142", date: "12 May 2026", status: "Shipped", track: "NZ883201XX", items: 2, total: 38.50 },
    { id: "TT-2026-0118", date: "28 Apr 2026", status: "Delivered", track: "NZ881770XX", items: 1, total: 18.50 },
    { id: "TT-2026-0091", date: "11 Mar 2026", status: "Delivered", track: "NZ880009XX", items: 4, total: 67.00 },
  ];
  return (
    <div>
      <span className="tt-section-eyebrow">&gt; orders</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, margin: "4px 0 24px", letterSpacing: "-0.02em" }}>Recent orders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sample.map((o) => (
          <div key={o.id} className="tt-card" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", gap: 18, alignItems: "center", padding: 20 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>{o.date}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", marginTop: 2 }}>{o.id}</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: o.status === "Delivered" ? "var(--color-accent)" : "var(--color-warm-orange-deep)" }}>
                <i data-lucide={o.status === "Delivered" ? "check-circle-2" : "truck"} style={{ width: 14, height: 14 }}></i> {o.status}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Items / total</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-primary)", marginTop: 2 }}>{o.items} items · NZ${o.total.toFixed(2)}</div>
            </div>
            <button className="tt-btn tt-btn-ghost" style={{ fontSize: 13 }}>
              <i data-lucide="external-link" style={{ width: 13, height: 13 }}></i> Track
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: 24, background: "var(--color-bg-surface)", border: "1px dashed var(--color-border-default)", borderRadius: 16, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>Need a quote on something custom? Skip the shop and ask directly.</p>
        <a className="tt-btn tt-btn-primary" href="index.html#contact">
          <i data-lucide="send" style={{ width: 13, height: 13 }}></i> Send a custom request
        </a>
      </div>
    </div>
  );
};

/* ---------- Settings tab ---------- */
const SettingsView = ({ user, onUpdate }) => {
  const [draft, setDraft] = useCState(user);
  const [saved, setSaved] = useCState(false);
  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  useCEffect(() => setDraft(user), [user]);
  const save = () => { onUpdate(draft); setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div>
      <span className="tt-section-eyebrow">&gt; settings</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, margin: "4px 0 24px", letterSpacing: "-0.02em" }}>Account settings</h2>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 28, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: "0 0 18px" }}>Profile</h3>
        <div className="tt-grid-2" style={{ marginBottom: 14 }}>
          <div>
            <label className="tt-field-label" htmlFor="sn">Display name</label>
            <input id="sn" className="tt-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <label className="tt-field-label" htmlFor="se">Email</label>
            <input id="se" type="email" className="tt-input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
        </div>
        <div className="tt-grid-2" style={{ marginBottom: 14 }}>
          <div>
            <label className="tt-field-label" htmlFor="sloc">Location</label>
            <input id="sloc" className="tt-input" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
          <div>
            <label className="tt-field-label" htmlFor="sav">Avatar colour</label>
            <div id="sav" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {AVATAR_PALETTE.map((p, i) => (
                <button key={i} onClick={() => setDraft({ ...draft, avatarSeed: i })}
                  aria-label={`Avatar ${i + 1}`}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${p[0]}, ${p[1]})`, border: draft.avatarSeed === i ? "2px solid var(--color-accent)" : "2px solid var(--color-border-subtle)", cursor: "pointer", padding: 0 }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="tt-field-label" htmlFor="sbi">Short bio</label>
          <textarea id="sbi" className="tt-textarea" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="One-liner. RC racer, lego builder, parent of three, whatever." />
        </div>
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 28, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: "0 0 18px" }}>Notifications</h3>
        <Toggle label="Email me when new things drop" sub="At most one a fortnight. Often less." value={draft.newsletter} onChange={(v) => setDraft({ ...draft, newsletter: v })} />
        <Toggle label="Notify me when someone replies to my threads" value={draft.notifyOnReply} onChange={(v) => setDraft({ ...draft, notifyOnReply: v })} />
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 28, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, margin: "0 0 18px" }}>Password</h3>
        <div className="tt-grid-2">
          <div>
            <label className="tt-field-label" htmlFor="op">Current password</label>
            <input id="op" type="password" className="tt-input" placeholder="•••••••" />
          </div>
          <div>
            <label className="tt-field-label" htmlFor="np">New password</label>
            <input id="np" type="password" className="tt-input" placeholder="•••••••" />
          </div>
        </div>
        <button className="tt-btn tt-btn-ghost" style={{ marginTop: 14, fontSize: 13 }}>
          <i data-lucide="key-round" style={{ width: 13, height: 13 }}></i> Update password
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="tt-btn tt-btn-primary" onClick={save}>
          <i data-lucide="check" style={{ width: 14, height: 14 }}></i> Save changes
        </button>
        {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-accent)" }}>✓ Saved</span>}
        <span style={{ flex: 1 }}></span>
        <button onClick={() => { if (confirm("Delete account? This clears your local data.")) { clearUser(); window.location.reload(); } }}
          style={{ background: "none", border: "none", color: "var(--color-error)", fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer" }}>
          delete account
        </button>
      </div>
    </div>
  );
};

const Toggle = ({ label, sub, value, onChange }) => (
  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--color-border-subtle)", cursor: "pointer" }}>
    <div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</div>
      {sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
    <div onClick={(e) => { e.preventDefault(); onChange(!value); }}
      style={{ width: 40, height: 22, borderRadius: 999, background: value ? "var(--color-accent)" : "var(--color-border-default)", position: "relative", flex: "0 0 auto", transition: "background 200ms", cursor: "pointer" }}>
      <span style={{ position: "absolute", top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 200ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  </label>
);

/* ---------- Community root ---------- */
const CommunityPage = () => {
  const [user, setUser] = useCState(loadUser());
  const [tab, setTab] = useCState("forum");
  const [threads, setThreads] = useCState(loadForum());

  useCEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const updateUser = (u) => { saveUser(u); setUser(u); };
  const logout = () => { clearUser(); setUser(null); };

  if (!user) return <AuthPanel onLogin={(u) => setUser(u)} />;

  return (
    <section style={{ padding: "24px 0 96px" }}>
      <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 40, alignItems: "start" }}>
        <ProfileSidebar user={user} onUpdate={updateUser} onLogout={logout} onSwitchTab={setTab} activeTab={tab} />
        <div>
          {tab === "forum" && <ForumView user={user} threads={threads} setThreads={setThreads} />}
          {tab === "achievements" && window.AchievementsView && <window.AchievementsView user={user} />}
          {tab === "orders" && <OrdersView user={user} />}
          {tab === "settings" && <SettingsView user={user} onUpdate={updateUser} />}
        </div>
      </div>
    </section>
  );
};

window.WorkshopView = CommunityPage;
window.loadShedUser = loadUser;
