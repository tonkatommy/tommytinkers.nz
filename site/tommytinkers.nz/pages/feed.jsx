/* tommytinkers.nz · Public Feed — anyone can post */
const { useState: useFState, useEffect: useFEffect, useMemo: useFMemo, useRef: useFRef } = React;

/* ---------- Storage ---------- */
const FEED_KEY = "tt-feed-v1";
const FEED_NAME_KEY = "tt-feed-name-v1";
const FEED_MY_REACTS_KEY = "tt-feed-myreacts-v1";

const F_AVATAR_PALETTE = [
  ["#f97316", "#fcd34d"], ["#4caf2e", "#a8e88f"], ["#1a1816", "#fb923c"],
  ["#fb923c", "#fcd34d"], ["#2e7a1d", "#4caf2e"], ["#fcd34d", "#fb923c"],
  ["#1a1816", "#fcd34d"], ["#a8e88f", "#fcd34d"],
];

const F_CATS = [
  { id: "show",  label: "Show & tell",   icon: "sparkles" },
  { id: "ask",   label: "Question",      icon: "help-circle" },
  { id: "idea",  label: "Idea / request",icon: "lightbulb" },
  { id: "local", label: "Helensville",   icon: "map-pin" },
];
const F_CAT_BY = Object.fromEntries(F_CATS.map((c) => [c.id, c]));

const SEED_POSTS = [
  {
    id: "p0", pinned: true, isStaff: true,
    name: "Tommy", avatarSeed: 0, cat: "show",
    body: "Welcome to the feed. Post anything you've tinkered with, broken, fixed, or want made. Photos welcome. Be kind, keep it on-topic, that's it.\n\n· No sign-in needed to post or react\n· Custom requests with a few +1s usually become a batch\n· I read everything, even at 11pm",
    time: Date.now() - 1000 * 60 * 60 * 30,
    photo: null,
    reactions: { wrench: 28, heart: 41, lightbulb: 12 },
    comments: [],
  },
  {
    id: "p1",
    name: "Aroha S.", avatarSeed: 1, cat: "show",
    body: "Stuck the new vinyl decals on the chilly bin this morning. Survived an hour at the beach and a sandy dog. Sealed, sealed, sealed.",
    time: Date.now() - 1000 * 60 * 47,
    photo: { swatch: ["#fb923c", "#fcd34d"], label: "chilly bin / sand" },
    reactions: { wrench: 4, heart: 19, lightbulb: 1 },
    comments: [
      { id: "c1", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Beach-tested certification unlocked.", time: Date.now() - 1000 * 60 * 40 },
      { id: "c2", name: "Marko", avatarSeed: 3, body: "Need the same set for my pataka. Where do I sign up?", time: Date.now() - 1000 * 60 * 18 },
    ],
  },
  {
    id: "p2",
    name: "Pip L.", avatarSeed: 2, cat: "idea",
    body: "Idea: a phone stand that hooks over a kitchen cupboard handle so I can follow a recipe without smearing flour on the screen. Anyone else want one?",
    time: Date.now() - 1000 * 60 * 60 * 3,
    photo: null,
    reactions: { wrench: 11, heart: 8, lightbulb: 24 },
    comments: [
      { id: "c3", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Already sketching. Measure your handle width and reply with it.", time: Date.now() - 1000 * 60 * 60 * 2 },
      { id: "c4", name: "Jules", avatarSeed: 4, body: "+1, my partner does pasta from scratch and my phone has paid the price.", time: Date.now() - 1000 * 60 * 90 },
    ],
  },
  {
    id: "p3",
    name: "Ben K.", avatarSeed: 5, cat: "show",
    body: "Cutlery drawer organiser — install no. 3 this month. Two more drawers to go, then I'm coming for the linen cupboard.",
    time: Date.now() - 1000 * 60 * 60 * 8,
    photo: { swatch: ["#4caf2e", "#a8e88f"], label: "drawer / order achieved" },
    reactions: { wrench: 7, heart: 22, lightbulb: 2 },
    comments: [],
  },
  {
    id: "p4",
    name: "Marina", avatarSeed: 6, cat: "ask",
    body: "Quick one: PETG or PLA for an outdoor letterbox flag in Auckland weather? Have heard mixed things.",
    time: Date.now() - 1000 * 60 * 60 * 11,
    photo: null,
    reactions: { wrench: 1, heart: 3, lightbulb: 0 },
    comments: [
      { id: "c5", name: "Tommy", avatarSeed: 0, isStaff: true, body: "PETG, every time, if it sees the sun. PLA goes soft on a hot west-facing wall.", time: Date.now() - 1000 * 60 * 60 * 10 },
    ],
  },
  {
    id: "p5",
    name: "Hēmi", avatarSeed: 7, cat: "local",
    body: "Helensville crew — anyone want to do a pickup run on Saturday? Save us all on shipping.",
    time: Date.now() - 1000 * 60 * 60 * 20,
    photo: null,
    reactions: { wrench: 0, heart: 9, lightbulb: 6 },
    comments: [
      { id: "c6", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Saturday 9-1 the workshop's open. Flick me your order numbers and I'll bundle them.", time: Date.now() - 1000 * 60 * 60 * 19 },
    ],
  },
];

const loadFeed = () => {
  try { const v = JSON.parse(localStorage.getItem(FEED_KEY)); return v && v.length ? v : SEED_POSTS; }
  catch { return SEED_POSTS; }
};
const saveFeed = (posts) => localStorage.setItem(FEED_KEY, JSON.stringify(posts));
const loadMyReacts = () => { try { return JSON.parse(localStorage.getItem(FEED_MY_REACTS_KEY)) || {}; } catch { return {}; } };
const saveMyReacts = (m) => localStorage.setItem(FEED_MY_REACTS_KEY, JSON.stringify(m));
const loadFeedName = () => localStorage.getItem(FEED_NAME_KEY) || "";
const loadAuthUser = () => { try { return JSON.parse(localStorage.getItem("tt-user-v1")); } catch { return null; } };

/* ---------- Helpers ---------- */
const fTimeAgo = (ts) => {
  const d = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  if (d < 86400 * 7) return Math.floor(d / 86400) + "d ago";
  return new Date(ts).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
};

const FAvatar = ({ name = "?", seed = 0, size = 40, staff = false }) => {
  const [a, b] = F_AVATAR_PALETTE[((seed % F_AVATAR_PALETTE.length) + F_AVATAR_PALETTE.length) % F_AVATAR_PALETTE.length];
  const initial = (name.trim()[0] || "?").toUpperCase();
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
        <span title="Tommy / staff" style={{
          position: "absolute", bottom: -2, right: -2,
          width: size * 0.42, height: size * 0.42, borderRadius: "50%",
          background: "var(--color-accent)", color: "var(--color-text-inverse)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--color-bg-base)",
        }}>
          <i data-lucide="wrench" style={{ width: size * 0.22, height: size * 0.22 }}></i>
        </span>
      )}
    </div>
  );
};

/* Photo swatch — used both as a placeholder & as the rendering for user-attached "vibes" */
const FPhoto = ({ photo }) => {
  if (!photo) return null;
  if (photo.dataURL) {
    return (
      <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
        <img src={photo.dataURL} alt={photo.label || ""} style={{ width: "100%", maxHeight: 480, objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const [a, b] = photo.swatch || ["#fcd34d", "#fb923c"];
  return (
    <div style={{
      marginTop: 14, height: 220, borderRadius: 12, position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
      border: "1px solid var(--color-border-subtle)",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(26,24,22,0.12) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", left: 16, bottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", background: "rgba(26,24,22,0.78)", color: "#FDF8EE", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em" }}>
        <i data-lucide="image" style={{ width: 12, height: 12 }}></i>
        <span>{photo.label || "photo"}</span>
      </div>
    </div>
  );
};

/* ---------- Composer ---------- */
const FComposer = ({ onPost, defaultName }) => {
  const [name, setName] = useFState(defaultName || "");
  const [body, setBody] = useFState("");
  const [cat, setCat] = useFState("show");
  const [photo, setPhoto] = useFState(null);
  const [focus, setFocus] = useFState(false);
  const fileRef = useFRef(null);

  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [photo, focus, cat]);

  const MAX = 500;
  const remaining = MAX - body.length;

  const pickFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Downscale to ~640px wide so we don't murder localStorage
      const img = new Image();
      img.onload = () => {
        const maxW = 640;
        const ratio = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataURL = c.toDataURL("image/jpeg", 0.78);
        setPhoto({ dataURL, label: file.name.replace(/\.[^.]+$/, "").slice(0, 28) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX) return;
    const finalName = (name.trim() || "anon tinker").slice(0, 32);
    localStorage.setItem(FEED_NAME_KEY, finalName);
    onPost({
      id: "p" + Date.now() + Math.floor(Math.random() * 1000),
      name: finalName,
      avatarSeed: Math.abs([...finalName].reduce((s, c) => s + c.charCodeAt(0), 0)) % F_AVATAR_PALETTE.length,
      cat,
      body: trimmed,
      photo,
      time: Date.now(),
      reactions: { wrench: 0, heart: 0, lightbulb: 0 },
      comments: [],
      isStaff: false,
      pinned: false,
    });
    setBody(""); setPhoto(null); setFocus(false);
  };

  return (
    <form onSubmit={submit}
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 16, padding: 20,
        boxShadow: focus ? "var(--shadow-md)" : "none",
        transition: "box-shadow var(--motion-base)",
      }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <FAvatar name={name || "?"} seed={Math.abs([...(name || "x")].reduce((s, c) => s + c.charCodeAt(0), 0))} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <input
              className="tt-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (or stay anon)"
              maxLength={32}
              style={{ flex: "0 0 220px", padding: "8px 12px", fontSize: 13 }}
            />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em",
              padding: "5px 10px", borderRadius: 999,
              background: "var(--color-accent-subtle)", color: "var(--color-accent)",
              border: "1px solid var(--color-accent-muted)",
              textTransform: "uppercase",
            }}>
              <i data-lucide="unlock" style={{ width: 11, height: 11, verticalAlign: "-1px", marginRight: 4 }}></i>
              no sign-in needed
            </span>
          </div>

          <textarea
            className="tt-textarea"
            rows={focus || body ? 4 : 2}
            value={body}
            onFocus={() => setFocus(true)}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your bench? Builds, mods, broken bits, ideas you want made…"
            maxLength={MAX + 20}
            style={{ fontSize: 15, lineHeight: 1.55 }}
          />

          {photo && (
            <div style={{ marginTop: 10, position: "relative" }}>
              <img src={photo.dataURL} alt="" style={{ maxHeight: 180, borderRadius: 10, border: "1px solid var(--color-border-subtle)" }} />
              <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"
                style={{ position: "absolute", top: 6, left: 6, background: "rgba(26,24,22,0.78)", color: "#FDF8EE", border: "none", borderRadius: 999, width: 26, height: 26, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i data-lucide="x" style={{ width: 13, height: 13 }}></i>
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {F_CATS.map((c) => (
                <button key={c.id} type="button" onClick={() => setCat(c.id)}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: cat === c.id ? 600 : 500,
                    padding: "6px 11px", borderRadius: 999, cursor: "pointer",
                    background: cat === c.id ? "var(--color-accent-subtle)" : "transparent",
                    color: cat === c.id ? "var(--color-accent)" : "var(--color-text-secondary)",
                    border: cat === c.id ? "1px solid var(--color-accent-muted)" : "1px solid var(--color-border-subtle)",
                    display: "inline-flex", alignItems: "center", gap: 5, transition: "all 150ms ease",
                  }}>
                  <i data-lucide={c.icon} style={{ width: 12, height: 12 }}></i> {c.label}
                </button>
              ))}
              <input
                ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => { pickFile(e.target.files[0]); e.target.value = ""; }}
              />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{
                  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
                  padding: "6px 11px", borderRadius: 999, cursor: "pointer",
                  background: "transparent", color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                <i data-lucide="image-plus" style={{ width: 12, height: 12 }}></i>
                {photo ? "Replace photo" : "Add photo"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: remaining < 0 ? "var(--color-error)" : remaining < 60 ? "var(--color-warm-orange-deep)" : "var(--color-text-muted)" }}>
                {remaining} left
              </span>
              <button type="submit" className="tt-btn tt-btn-primary" disabled={!body.trim() || body.length > MAX}
                style={{ opacity: !body.trim() || body.length > MAX ? 0.5 : 1, cursor: !body.trim() || body.length > MAX ? "not-allowed" : "pointer" }}>
                <i data-lucide="send" style={{ width: 13, height: 13 }}></i> Post to feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

/* ---------- Reactions row ---------- */
const REACTIONS = [
  { id: "wrench",    icon: "wrench",    label: "made one" },
  { id: "heart",     icon: "heart",     label: "love it" },
  { id: "lightbulb", icon: "lightbulb", label: "good idea" },
];

const FReactions = ({ post, myReacts, onToggle, onOpenComments }) => {
  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [myReacts]);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
      {REACTIONS.map((r) => {
        const active = myReacts.includes(r.id);
        const count = post.reactions[r.id] || 0;
        return (
          <button key={r.id} onClick={() => onToggle(r.id)} title={r.label} aria-pressed={active}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 999, cursor: "pointer",
              border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border-subtle)",
              background: active ? "var(--color-accent-subtle)" : "transparent",
              color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
              transition: "all 150ms ease",
            }}>
            <i data-lucide={r.icon} style={{ width: 13, height: 13, fill: active && r.id === "heart" ? "currentColor" : "none" }}></i>
            <span>{count}</span>
          </button>
        );
      })}
      <button onClick={onOpenComments}
        style={{
          marginLeft: "auto",
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 999, cursor: "pointer",
          border: "1px solid var(--color-border-subtle)", background: "transparent",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
        }}>
        <i data-lucide="message-circle" style={{ width: 13, height: 13 }}></i>
        <span>{post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}</span>
      </button>
    </div>
  );
};

/* ---------- Comments ---------- */
const FComments = ({ post, defaultName, onAdd }) => {
  const [draftName, setDraftName] = useFState(defaultName || "");
  const [draft, setDraft] = useFState("");
  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const finalName = (draftName.trim() || "anon tinker").slice(0, 32);
    localStorage.setItem(FEED_NAME_KEY, finalName);
    onAdd({
      id: "c" + Date.now(),
      name: finalName,
      avatarSeed: Math.abs([...finalName].reduce((s, c) => s + c.charCodeAt(0), 0)) % F_AVATAR_PALETTE.length,
      body: draft.trim(),
      time: Date.now(),
    });
    setDraft("");
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--color-border-subtle)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {post.comments.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <FAvatar name={c.name} seed={c.avatarSeed} size={30} staff={c.isStaff} />
            <div style={{ flex: 1, minWidth: 0, background: "var(--color-bg-raised)", padding: "10px 14px", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{c.name}</span>
                {c.isStaff && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, padding: "1px 6px", borderRadius: 4, background: "var(--color-accent)", color: "var(--color-text-inverse)", letterSpacing: "0.05em", textTransform: "uppercase" }}>tommy</span>}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-text-muted)" }}>{fTimeAgo(c.time)}</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty", whiteSpace: "pre-wrap" }}>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <FAvatar name={draftName || "?"} seed={Math.abs([...(draftName || "x")].reduce((s, c) => s + c.charCodeAt(0), 0))} size={30} />
        <div style={{ flex: 1 }}>
          <input className="tt-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Your name (or anon)" maxLength={32} style={{ padding: "7px 10px", fontSize: 12.5, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <input className="tt-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a reply…" style={{ padding: "8px 12px", fontSize: 13 }} />
            <button type="submit" className="tt-btn tt-btn-primary" disabled={!draft.trim()}
              style={{ padding: "8px 14px", opacity: !draft.trim() ? 0.5 : 1 }}>
              <i data-lucide="send" style={{ width: 12, height: 12 }}></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

/* ---------- Post card ---------- */
const FPost = ({ post, myReacts, onReact, onComment }) => {
  const [open, setOpen] = useFState(post.comments.length > 0 && post.comments.length <= 2);
  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [open]);
  const meta = F_CAT_BY[post.cat] || { label: post.cat, icon: "tag" };

  return (
    <article className="tt-card" style={{ padding: 22, position: "relative" }}>
      {post.pinned && (
        <div style={{
          position: "absolute", top: 14, right: 14, display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 999,
          background: "var(--gradient-brand)", color: "#1A1816",
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          <i data-lucide="pin" style={{ width: 11, height: 11 }}></i> pinned
        </div>
      )}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <FAvatar name={post.name} seed={post.avatarSeed} size={42} staff={post.isStaff} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{post.name}</span>
            {post.isStaff && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, padding: "1px 6px", borderRadius: 4, background: "var(--color-accent)", color: "var(--color-text-inverse)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                tommy / staff
              </span>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-warm-orange-deep)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              <i data-lucide={meta.icon} style={{ width: 10.5, height: 10.5 }}></i> {meta.label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>· {fTimeAgo(post.time)}</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--color-text-primary)", margin: 0, whiteSpace: "pre-wrap", textWrap: "pretty" }}>{post.body}</p>
          <FPhoto photo={post.photo} />
          <FReactions post={post} myReacts={myReacts} onToggle={onReact} onOpenComments={() => setOpen((v) => !v)} />
          {open && <FComments post={post} defaultName={loadFeedName()} onAdd={onComment} />}
        </div>
      </div>
    </article>
  );
};

/* ---------- Sidebar ---------- */
const FSidebar = ({ posts, onJumpCat, activeCat }) => {
  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  const today = posts.filter((p) => Date.now() - p.time < 1000 * 60 * 60 * 24).length;
  const tinkers = new Set(posts.map((p) => p.name.toLowerCase())).size;
  const trending = useFMemo(() => {
    return [...posts]
      .filter((p) => !p.pinned)
      .sort((a, b) => (b.reactions.wrench + b.reactions.heart + b.reactions.lightbulb + b.comments.length * 2) - (a.reactions.wrench + a.reactions.heart + a.reactions.lightbulb + a.comments.length * 2))
      .slice(0, 4);
  }, [posts]);

  return (
    <aside style={{ position: "sticky", top: 80, alignSelf: "start", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "var(--gradient-brand)", color: "#1A1816", borderRadius: 16, padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,24,22,0.14) 1px, transparent 0)", backgroundSize: "20px 20px", opacity: 0.25 }} />
        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", opacity: 0.7, textTransform: "uppercase" }}>&gt; feed / live</span>
          <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>{posts.length}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.75 }}>posts</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>{today}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.75 }}>today</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>{tinkers}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.75 }}>tinkers</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px 6px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-warm-orange-deep)", letterSpacing: "0.05em", textTransform: "uppercase" }}>&gt; filter</span>
        </div>
        {[{ id: "all", label: "Everything", icon: "layers" }, ...F_CATS].map((c) => (
          <button key={c.id} onClick={() => onJumpCat(c.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "11px 18px", border: "none", cursor: "pointer", textAlign: "left",
              background: activeCat === c.id ? "var(--color-accent-subtle)" : "transparent",
              borderLeft: activeCat === c.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: activeCat === c.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: activeCat === c.id ? 600 : 400,
            }}>
            <i data-lucide={c.icon} style={{ width: 15, height: 15 }}></i> {c.label}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 18 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-warm-orange-deep)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          <i data-lucide="flame" style={{ width: 11, height: 11, verticalAlign: "-1px", marginRight: 4 }}></i>
          most reactions
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trending.map((p) => (
            <a key={p.id} href={"#post-" + p.id}
              style={{ display: "flex", gap: 10, padding: 8, borderRadius: 8, color: "var(--color-text-secondary)", border: "1px solid transparent" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "var(--color-bg-raised)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <FAvatar name={p.name} seed={p.avatarSeed} size={28} staff={p.isStaff} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.body}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-text-muted)", marginTop: 2 }}>{p.name} · {fTimeAgo(p.time)}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ border: "1px dashed var(--color-border-default)", borderRadius: 16, padding: 18 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>&gt; house rules</span>
        <ul style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "10px 0 0", paddingLeft: 16, textWrap: "pretty" }}>
          <li>Be kind. This is a workshop, not the comments section.</li>
          <li>On topic-ish. Tinkering, building, fixing, NZ life.</li>
          <li>No promo. Sharing a cool find is fine; advertising isn't.</li>
          <li>Tommy reads everything. Sometimes from the printer.</li>
        </ul>
      </div>
    </aside>
  );
};

/* ---------- Feed root ---------- */
const FeedPage = () => {
  const [posts, setPosts] = useFState(loadFeed());
  const [myReacts, setMyReacts] = useFState(loadMyReacts());
  const [cat, setCat] = useFState("all");
  const [sort, setSort] = useFState("latest"); // latest | top
  const authUser = useFMemo(() => loadAuthUser(), []);
  const initialName = useFMemo(() => loadFeedName() || (authUser ? authUser.name : ""), [authUser]);

  useFEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const addPost = (p) => {
    const next = [p, ...posts];
    setPosts(next); saveFeed(next);
  };

  const toggleReact = (postId, rid) => {
    const have = (myReacts[postId] || []).includes(rid);
    const nextMine = {
      ...myReacts,
      [postId]: have
        ? (myReacts[postId] || []).filter((x) => x !== rid)
        : [...(myReacts[postId] || []), rid],
    };
    setMyReacts(nextMine); saveMyReacts(nextMine);
    const next = posts.map((p) => p.id !== postId ? p : ({
      ...p,
      reactions: { ...p.reactions, [rid]: Math.max(0, (p.reactions[rid] || 0) + (have ? -1 : 1)) },
    }));
    setPosts(next); saveFeed(next);
  };

  const addComment = (postId, comment) => {
    const next = posts.map((p) => p.id !== postId ? p : ({ ...p, comments: [...p.comments, comment] }));
    setPosts(next); saveFeed(next);
  };

  const visible = useFMemo(() => {
    let list = cat === "all" ? posts : posts.filter((p) => p.cat === cat || p.pinned);
    if (sort === "top") {
      list = [...list].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const sa = a.reactions.wrench + a.reactions.heart + a.reactions.lightbulb + a.comments.length * 2;
        const sb = b.reactions.wrench + b.reactions.heart + b.reactions.lightbulb + b.comments.length * 2;
        return sb - sa;
      });
    } else {
      list = [...list].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.time - a.time;
      });
    }
    return list;
  }, [posts, cat, sort]);

  return (
    <section style={{ padding: "8px 0 96px" }}>
          <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 36, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
              <FComposer onPost={addPost} defaultName={initialName} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "4px 2px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginRight: 6 }}>showing</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--color-text-primary)" }}>
                    {visible.filter((p) => !p.pinned).length} posts {cat !== "all" ? `in ${F_CAT_BY[cat]?.label || cat}` : ""}
                  </span>
                </div>
                <div style={{ display: "inline-flex", gap: 2, background: "var(--color-bg-surface)", padding: 3, borderRadius: 999, border: "1px solid var(--color-border-subtle)" }}>
                  {[{ id: "latest", label: "Latest", icon: "clock" }, { id: "top", label: "Top", icon: "trending-up" }].map((s) => (
                    <button key={s.id} onClick={() => setSort(s.id)}
                      style={{
                        fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 600,
                        padding: "6px 13px", borderRadius: 999, cursor: "pointer", border: "none",
                        background: sort === s.id ? "var(--color-accent)" : "transparent",
                        color: sort === s.id ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                        display: "inline-flex", alignItems: "center", gap: 5, transition: "all 150ms ease",
                      }}>
                      <i data-lucide={s.icon} style={{ width: 11, height: 11 }}></i> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {visible.map((p) => (
                  <div key={p.id} id={"post-" + p.id}>
                    <FPost
                      post={p}
                      myReacts={myReacts[p.id] || []}
                      onReact={(rid) => toggleReact(p.id, rid)}
                      onComment={(c) => addComment(p.id, c)}
                    />
                  </div>
                ))}
                {visible.length === 0 && (
                  <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--color-text-secondary)", border: "1px dashed var(--color-border-default)", borderRadius: 16 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 15, margin: 0 }}>Nothing here yet. Be the first.</p>
                  </div>
                )}
              </div>
            </div>

            <FSidebar posts={posts} onJumpCat={setCat} activeCat={cat} />
          </div>
        </section>
  );
};

window.FeedView = FeedPage;
