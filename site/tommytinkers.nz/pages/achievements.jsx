/* tommytinkers.nz · Community · Achievements & badges
   Exposes: window.TTBadges (data + state helpers),
            window.AchievementsView (full tab),
            window.AchievementsSidebar (mini strip for profile card),
            window.TinkerLevelEmblem (level disc) */

const { useState: useBState, useEffect: useBEffect, useMemo: useBMemo } = React;

/* ---------- Badge catalogue ---------- */
/* Each badge has: id, family (visual treatment), icon (lucide name),
   name, desc, points, optional target (for progress badges) */
const BADGES = [
  /* Shop family — warm orange gradient */
  { id: "first-order",     family: "shop",      icon: "package-check",  name: "First order",        desc: "Placed your first order. The workshop is open for you.",                         points: 10 },
  { id: "repeat-customer", family: "shop",      icon: "repeat",         name: "Repeat customer",    desc: "Three orders in. Welcome to the regulars.",                                       points: 25 },
  { id: "patron",          family: "shop",      icon: "trophy",         name: "Workshop patron",    desc: "Ten orders posted. The bench misses you when you're not here.",                   points: 75, target: 10 },
  { id: "free-ship",       family: "shop",      icon: "truck",          name: "Free ship club",     desc: "Cleared the $60 free-shipping bar on a single order.",                            points: 15 },
  { id: "sticker-fan",     family: "shop",      icon: "sticker",        name: "Sticker fan",        desc: "Five or more stickers ordered. Laptops, bumpers, pavement.",                       points: 20, target: 5 },
  { id: "pit-crew",        family: "shop",      icon: "car",            name: "RC pit crew",        desc: "First RC part ordered. Hold the line at Pukekohe.",                                points: 20 },

  /* Community family — green-to-yellow gradient */
  { id: "welcome",         family: "community", icon: "hand-heart",     name: "Welcome aboard",     desc: "Pulled up a stool. Glad you made it.",                                            points: 5 },
  { id: "first-post",      family: "community", icon: "message-square-plus", name: "First post",    desc: "Started your first thread on the bench.",                                          points: 15 },
  { id: "helpful-hand",    family: "community", icon: "messages-square",name: "Helpful hand",       desc: "Left a reply that helped someone else along.",                                     points: 20 },
  { id: "conversationalist", family: "community", icon: "users-round",  name: "Conversationalist",  desc: "Ten replies posted.",                                                              points: 40, target: 10 },
  { id: "town-crier",      family: "community", icon: "megaphone",      name: "Town crier",         desc: "A thread of yours hit ten upvotes.",                                               points: 30, target: 10 },
  { id: "idea-person",     family: "community", icon: "lightbulb",      name: "Idea person",        desc: "Submitted a custom request. If a few people want one, Tommy will batch it.",     points: 20 },

  /* Workshop family — charcoal-to-orange */
  { id: "show-teller",     family: "workshop",  icon: "camera",         name: "Show & teller",      desc: "Posted in Show & Tell with a build photo.",                                        points: 25 },
  { id: "tip-sharer",      family: "workshop",  icon: "book-open-text", name: "Tip sharer",         desc: "Dropped a workshop tip the others took home.",                                     points: 25 },
  { id: "petg-pilled",     family: "workshop",  icon: "flask-conical",  name: "PETG pilled",        desc: "Specced (or asked for) PETG over PLA. Outdoor-grade thinking.",                    points: 15 },
  { id: "helensville",     family: "workshop",  icon: "map-pin",        name: "Helensville local",  desc: "Set your location to Helensville. Hi neighbour.",                                  points: 10 },

  /* Special family — green ring + gradient, staff-awarded vibes */
  { id: "founding-tinker", family: "special",   icon: "sparkles",       name: "Founding tinker",    desc: "One of the first 100 members. Plaque on the wall.",                                points: 50 },
  { id: "tinker-of-month", family: "special",   icon: "award",          name: "Tinker of the month",desc: "Staff-awarded for outstanding workshop spirit. One per month.",                    points: 100, staffOnly: true },
  { id: "long-hauler",     family: "special",   icon: "calendar-check", name: "Long hauler",        desc: "One year on the bench.",                                                           points: 60, target: 12 },
  { id: "beta-tinker",     family: "special",   icon: "test-tube",      name: "Beta tinker",        desc: "Tried something while it was still wet glue.",                                    points: 30 },
];

const FAMILY_STYLES = {
  shop: {
    gradient: "linear-gradient(135deg, #fcd34d 0%, #fb923c 55%, #f97316 100%)",
    glow: "0 6px 22px rgba(251, 146, 60, 0.45)",
    label: "Shop",
    accent: "#f97316",
  },
  community: {
    gradient: "linear-gradient(135deg, #fcd34d 0%, #a8e88f 55%, #4caf2e 100%)",
    glow: "0 6px 22px rgba(76, 175, 46, 0.4)",
    label: "Community",
    accent: "#4caf2e",
  },
  workshop: {
    gradient: "linear-gradient(135deg, #fb923c 0%, #5b4e3a 70%, #29261b 100%)",
    glow: "0 6px 22px rgba(41, 38, 27, 0.5)",
    label: "Workshop",
    accent: "#1a1816",
  },
  special: {
    gradient: "linear-gradient(135deg, #4caf2e 0%, #fcd34d 50%, #f97316 100%)",
    glow: "0 6px 26px rgba(76, 175, 46, 0.5)",
    label: "Special",
    accent: "#4caf2e",
  },
};

const LEVELS = [
  { num: 1, name: "Curious tinker",   min: 0,   max: 60  },
  { num: 2, name: "Apprentice tinker",min: 60,  max: 150 },
  { num: 3, name: "Workshop regular", min: 150, max: 300 },
  { num: 4, name: "Senior tinker",    min: 300, max: 500 },
  { num: 5, name: "Maker of things",  min: 500, max: 9999 },
];

/* ---------- State derivation ----------
   Determine each badge's status from what we know about the user
   (orders are mocked, forum posts are real in localStorage). */
const deriveBadgeStates = (user) => {
  const states = {};
  const now = Date.now();
  const day = 86400000;

  /* Forum-derived counts */
  let threadCount = 0, replyCount = 0, maxVotes = 0;
  try {
    const forum = JSON.parse(localStorage.getItem("tt-forum-v1")) || [];
    for (const t of forum) {
      if (t.author === user.name) { threadCount++; if (t.votes > maxVotes) maxVotes = t.votes; }
      for (const r of (t.replies || [])) if (r.author === user.name) replyCount++;
    }
  } catch {}

  /* Defaults — assume the sample 3 orders ($124 total) from OrdersView are real */
  states["welcome"]          = { status: "earned", earnedAt: user.joined || now - day * 3 };
  states["first-order"]      = { status: "earned", earnedAt: now - day * 60 };
  states["repeat-customer"]  = { status: "earned", earnedAt: now - day * 30 };
  states["free-ship"]        = { status: "earned", earnedAt: now - day * 30 };
  states["pit-crew"]         = { status: "earned", earnedAt: now - day * 60 };
  states["patron"]           = { status: "in-progress", progress: 3, target: 10 };
  states["sticker-fan"]      = { status: "in-progress", progress: 2, target: 5 };

  states["first-post"]       = threadCount > 0 ? { status: "earned", earnedAt: now - day } : { status: "locked" };
  states["helpful-hand"]     = replyCount > 0 ? { status: "earned", earnedAt: now - day } : { status: "locked" };
  states["conversationalist"]= replyCount >= 10
    ? { status: "earned", progress: replyCount, target: 10, earnedAt: now - day }
    : { status: replyCount > 0 ? "in-progress" : "locked", progress: replyCount, target: 10 };
  states["town-crier"]       = maxVotes >= 10
    ? { status: "earned", progress: maxVotes, target: 10, earnedAt: now - day }
    : { status: maxVotes >= 3 ? "in-progress" : "locked", progress: maxVotes, target: 10 };
  states["idea-person"]      = { status: "locked" };

  states["show-teller"]      = { status: "in-progress", progress: 0, target: 1 };
  states["tip-sharer"]       = { status: "locked" };
  states["petg-pilled"]      = { status: "earned", earnedAt: now - day * 5 };
  states["helensville"]      = (user.location || "").toLowerCase().includes("helensville")
    ? { status: "earned", earnedAt: user.joined || now - day * 3 }
    : { status: "locked" };

  states["founding-tinker"]  = { status: "earned", earnedAt: user.joined || now - day * 200 };
  states["tinker-of-month"]  = { status: "locked" };
  states["long-hauler"]      = { status: "in-progress", progress: 4, target: 12 };
  states["beta-tinker"]      = { status: "earned", earnedAt: now - day * 15 };

  return states;
};

const computeTotals = (states) => {
  let earned = 0, points = 0, recent = [];
  for (const b of BADGES) {
    const s = states[b.id];
    if (s && s.status === "earned") {
      earned++;
      points += b.points;
      recent.push({ badge: b, state: s });
    }
  }
  recent.sort((a, b) => (b.state.earnedAt || 0) - (a.state.earnedAt || 0));
  return { earned, total: BADGES.length, points, recent };
};

const levelFor = (points) => {
  const lvl = LEVELS.find((l) => points >= l.min && points < l.max) || LEVELS[LEVELS.length - 1];
  const next = LEVELS[Math.min(LEVELS.length - 1, LEVELS.indexOf(lvl) + 1)];
  const range = lvl.max - lvl.min;
  const into = Math.max(0, points - lvl.min);
  return {
    ...lvl,
    progress: Math.min(1, into / range),
    pointsIntoLevel: into,
    pointsToNext: Math.max(0, lvl.max - points),
    next: next === lvl ? null : next,
  };
};

/* ---------- Tinker level emblem ----------
   Outer dark scribble ring + inner brand gradient + level number,
   echoing the logo lock-up. */
const TinkerLevelEmblem = ({ level, size = 120 }) => {
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "var(--color-text-primary)",
        boxShadow: "0 12px 28px rgba(251, 146, 60, 0.35), inset 0 0 0 1px rgba(0,0,0,0.2)",
      }}/>
      <div style={{
        position: "absolute", inset: size * 0.06, borderRadius: "50%",
        background: "var(--gradient-brand)",
      }}/>
      <div style={{
        position: "absolute", inset: size * 0.06, borderRadius: "50%",
        backgroundImage: "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.55) 0%, transparent 55%)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#1A1816",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: size * 0.075,
          letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.72, marginBottom: 2 }}>
          Level
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: size * 0.42, lineHeight: 1, letterSpacing: "-0.02em" }}>{level.num}</span>
      </div>
    </div>
  );
};

/* ---------- Badge disc ---------- */
const BadgeDisc = ({ badge, state, size = 88 }) => {
  const fam = FAMILY_STYLES[badge.family];
  const status = state ? state.status : "locked";
  const isEarned = status === "earned";
  const isLocked = status === "locked";
  const isProgress = status === "in-progress";

  const ringR = size / 2 - 2;
  const ringC = Math.PI * 2 * ringR;
  const pct = isProgress && state && state.target ? Math.min(1, (state.progress || 0) / state.target) : 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      {isProgress && (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
          <circle cx={size/2} cy={size/2} r={ringR}
            fill="none" stroke="var(--color-border-subtle)" strokeWidth={2.5} />
          <circle cx={size/2} cy={size/2} r={ringR}
            fill="none" stroke={fam.accent} strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray={`${pct * ringC} ${ringC}`}
            transform={`rotate(-90 ${size/2} ${size/2})`} />
        </svg>
      )}
      <div style={{
        position: "absolute", inset: isProgress ? size * 0.1 : 0,
        borderRadius: "50%",
        background: isLocked ? "var(--color-bg-raised)" : fam.gradient,
        boxShadow: isEarned ? fam.glow : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        filter: isLocked ? "saturate(0) brightness(0.85)" : "none",
        opacity: isLocked ? 0.55 : 1,
        border: badge.family === "special" && isEarned ? "2px solid var(--color-accent)"
              : badge.family === "special" && isLocked ? "1.5px dashed var(--color-border-default)"
              : "none",
        transition: "all 250ms ease",
      }}>
        {!isLocked && (
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
            backgroundImage: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)",
            pointerEvents: "none" }}/>
        )}
        <i data-lucide={isLocked ? "lock" : badge.icon}
           style={{ width: size * 0.42, height: size * 0.42,
                    color: isLocked ? "var(--color-text-muted)" : "#1A1816",
                    strokeWidth: 1.75, position: "relative" }}/>
        {isEarned && badge.family === "special" && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: size * 0.28, height: size * 0.28, borderRadius: "50%",
            background: "var(--color-accent)", color: "#fff",
            border: "2px solid var(--color-bg-base)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i data-lucide="check" style={{ width: size * 0.14, height: size * 0.14, strokeWidth: 3 }}/>
          </span>
        )}
      </div>
    </div>
  );
};

/* ---------- Badge card ---------- */
const BadgeCard = ({ badge, state, onClick }) => {
  const fam = FAMILY_STYLES[badge.family];
  const isEarned = state.status === "earned";
  const isLocked = state.status === "locked";
  const isProgress = state.status === "in-progress";

  return (
    <button onClick={onClick} className="tt-badge-card"
      data-status={state.status}
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 16, padding: 18, cursor: "pointer",
        textAlign: "left", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12, position: "relative", overflow: "hidden",
        transition: "all 250ms ease",
        fontFamily: "inherit",
      }}>
      {isEarned && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
          color: fam.accent, textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: fam.accent }}/>
          earned
        </span>
      )}
      {isProgress && state.target && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
          color: "var(--color-text-muted)",
        }}>
          {state.progress}/{state.target}
        </span>
      )}
      {isLocked && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
          color: "var(--color-text-muted)",
        }}>
          locked
        </span>
      )}

      <div style={{ marginTop: 6 }}>
        <BadgeDisc badge={badge} state={state} size={84} />
      </div>

      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14,
          color: isLocked ? "var(--color-text-secondary)" : "var(--color-text-primary)",
          marginBottom: 4, letterSpacing: "-0.01em" }}>
          {badge.name}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          {fam.label} · {badge.points} pts
        </div>
      </div>
    </button>
  );
};

/* ---------- Badge detail modal ---------- */
const BadgeDetail = ({ badge, state, onClose }) => {
  useBEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  useBEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!badge) return null;
  const fam = FAMILY_STYLES[badge.family];
  const isEarned = state.status === "earned";
  const isLocked = state.status === "locked";
  const isProgress = state.status === "in-progress";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "ttFadeUp 200ms ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 24, width: "100%", maxWidth: 420,
        padding: 32, position: "relative",
        boxShadow: "var(--shadow-lg)",
      }}>
        <button onClick={onClose} aria-label="Close"
          style={{ position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer",
            color: "var(--color-text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i data-lucide="x" style={{ width: 16, height: 16 }}/>
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <BadgeDisc badge={badge} state={state} size={128} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em",
              textTransform: "uppercase", color: fam.accent, marginBottom: 6 }}>
              {fam.label} · {badge.points} points
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 26,
              letterSpacing: "-0.02em", margin: "0 0 8px", color: "var(--color-text-primary)" }}>
              {badge.name}
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6,
              color: "var(--color-text-secondary)", margin: 0, textWrap: "pretty", maxWidth: 320 }}>
              {badge.desc}
            </p>
          </div>

          {isEarned && (
            <div style={{ width: "100%", padding: "12px 14px",
              background: "var(--color-accent-subtle)",
              border: "1px solid var(--color-accent-muted)",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <i data-lucide="check-circle-2" style={{ width: 16, height: 16, color: "var(--color-accent)" }}/>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                Earned {new Date(state.earnedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          )}
          {isProgress && state.target && (
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)",
                marginBottom: 6, letterSpacing: "0.04em" }}>
                <span>progress</span><span>{state.progress} / {state.target}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--color-bg-raised)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(state.progress / state.target) * 100}%`,
                  background: fam.gradient, borderRadius: 999, transition: "width 400ms ease" }}/>
              </div>
            </div>
          )}
          {isLocked && (
            <div style={{ width: "100%", padding: "12px 14px",
              background: "var(--color-bg-raised)",
              border: "1px dashed var(--color-border-default)",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <i data-lucide="lock" style={{ width: 16, height: 16, color: "var(--color-text-muted)" }}/>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                Not yet unlocked. Keep tinkering.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Recent unlocks strip ---------- */
const RecentStrip = ({ recent, onOpen }) => {
  useBEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  if (!recent.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(recent.length, 3)}, 1fr)`, gap: 14 }}>
      {recent.slice(0, 3).map(({ badge, state }) => {
        const fam = FAMILY_STYLES[badge.family];
        return (
          <button key={badge.id} onClick={() => onOpen(badge.id)}
            className="tt-card"
            style={{
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 14,
              alignItems: "center", padding: 14, cursor: "pointer",
              textAlign: "left", border: "1px solid var(--color-border-subtle)",
              background: "var(--color-bg-surface)",
              fontFamily: "inherit",
            }}>
            <BadgeDisc badge={badge} state={state} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
                textTransform: "uppercase", color: fam.accent, marginBottom: 2 }}>
                unlocked
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14,
                color: "var(--color-text-primary)", marginBottom: 2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {badge.name}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                {new Date(state.earnedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })} · +{badge.points} pts
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Full Achievements view ---------- */
const AchievementsView = ({ user }) => {
  const [states, setStates] = useBState(() => deriveBadgeStates(user));
  const [statusFilter, setStatusFilter] = useBState("all");
  const [familyFilter, setFamilyFilter] = useBState("all");
  const [openId, setOpenId] = useBState(null);

  useBEffect(() => { setStates(deriveBadgeStates(user)); }, [user]);
  useBEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const totals = useBMemo(() => computeTotals(states), [states]);
  const level = useBMemo(() => levelFor(totals.points), [totals.points]);

  const visible = useBMemo(() => {
    return BADGES.filter((b) => {
      const s = states[b.id] || { status: "locked" };
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (familyFilter !== "all" && b.family !== familyFilter) return false;
      return true;
    });
  }, [states, statusFilter, familyFilter]);

  const grouped = useBMemo(() => {
    const out = {};
    for (const b of visible) {
      (out[b.family] = out[b.family] || []).push(b);
    }
    return out;
  }, [visible]);

  const openBadge = openId ? BADGES.find((b) => b.id === openId) : null;
  const openState = openBadge ? (states[openBadge.id] || { status: "locked" }) : null;

  const statusChips = [
    { id: "all",         label: "All",         count: BADGES.length },
    { id: "earned",      label: "Earned",      count: BADGES.filter((b) => states[b.id]?.status === "earned").length },
    { id: "in-progress", label: "In progress", count: BADGES.filter((b) => states[b.id]?.status === "in-progress").length },
    { id: "locked",      label: "Locked",      count: BADGES.filter((b) => states[b.id]?.status === "locked").length },
  ];
  const familyChips = [{ id: "all", label: "Every family" }]
    .concat(Object.keys(FAMILY_STYLES).map((k) => ({ id: k, label: FAMILY_STYLES[k].label })));

  return (
    <div>
      <span className="tt-section-eyebrow">&gt; achievements</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32,
        margin: "4px 0 6px", letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
        Workshop stamps
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6,
        color: "var(--color-text-secondary)", margin: "0 0 28px", maxWidth: 580, textWrap: "pretty" }}>
        Little marks for tinkering, ordering, posting, and the rare staff award. Tap any stamp for the story.
      </p>

      {/* Level card */}
      <div style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 20, padding: 28, marginBottom: 24,
        display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 24,
        alignItems: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-border-subtle) 1px, transparent 0)",
          backgroundSize: "24px 24px", opacity: 0.5, pointerEvents: "none" }}/>
        <div style={{ position: "relative" }}>
          <TinkerLevelEmblem level={level} size={120} />
        </div>
        <div style={{ position: "relative", minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--color-warm-orange-deep)", letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 4 }}>
            current rank
          </div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28,
            letterSpacing: "-0.02em", margin: "0 0 14px", color: "var(--color-text-primary)" }}>
            {level.name}
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between",
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)",
            marginBottom: 6, letterSpacing: "0.04em" }}>
            <span>{level.pointsIntoLevel} pts into level</span>
            <span>{level.next ? `${level.pointsToNext} pts to ${level.next.name}` : "max level"}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--color-bg-raised)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${level.progress * 100}%`,
              background: "var(--gradient-brand)", borderRadius: 999, transition: "width 400ms ease" }}/>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 18,
          paddingLeft: 24, borderLeft: "1px solid var(--color-border-subtle)" }}>
          {[
            { label: "Badges", value: `${totals.earned}/${totals.total}` },
            { label: "Points", value: totals.points },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32,
                color: "var(--color-text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase",
                marginTop: 6 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent unlocks */}
      {totals.recent.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-mono)",
              letterSpacing: "0.05em" }}>
              &gt; recent unlocks
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
              last {Math.min(totals.recent.length, 3)} of {totals.earned}
            </span>
          </div>
          <RecentStrip recent={totals.recent} onOpen={setOpenId} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14,
        paddingBottom: 14, borderBottom: "1px solid var(--color-border-subtle)" }}>
        {statusChips.map((c) => (
          <button key={c.id} onClick={() => setStatusFilter(c.id)}
            style={{
              fontFamily: "var(--font-body)", fontSize: 13,
              fontWeight: statusFilter === c.id ? 600 : 400,
              padding: "7px 13px", borderRadius: 999, cursor: "pointer",
              background: statusFilter === c.id ? "var(--color-accent)" : "transparent",
              color: statusFilter === c.id ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
              border: statusFilter === c.id ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
              display: "inline-flex", alignItems: "center", gap: 8, transition: "all 150ms ease",
            }}>
            {c.label}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.75 }}>{c.count}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {familyChips.map((c) => (
          <button key={c.id} onClick={() => setFamilyFilter(c.id)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "5px 11px", borderRadius: 6, cursor: "pointer",
              background: familyFilter === c.id ? "var(--color-accent-subtle)" : "transparent",
              color: familyFilter === c.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
              border: familyFilter === c.id ? "1px solid var(--color-accent-muted)" : "1px solid transparent",
              transition: "all 150ms ease",
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid grouped by family */}
      {Object.keys(grouped).length === 0 && (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>Nothing in this filter yet.</p>
        </div>
      )}

      {Object.keys(FAMILY_STYLES).map((famKey) => {
        const list = grouped[famKey];
        if (!list || !list.length) return null;
        const fam = FAMILY_STYLES[famKey];
        return (
          <div key={famKey} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: fam.gradient,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}/>
              <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16,
                margin: 0, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
                {fam.label}
              </h4>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                {list.filter((b) => states[b.id]?.status === "earned").length} of {BADGES.filter((b) => b.family === famKey).length} earned
              </span>
              <span style={{ flex: 1, height: 1, background: "var(--color-border-subtle)", marginLeft: 6 }}/>
            </div>
            <div className="tt-badge-grid">
              {list.map((b) => (
                <BadgeCard key={b.id} badge={b}
                  state={states[b.id] || { status: "locked" }}
                  onClick={() => setOpenId(b.id)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {openBadge && <BadgeDetail badge={openBadge} state={openState} onClose={() => setOpenId(null)} />}
    </div>
  );
};

/* ---------- Sidebar mini showcase (used inside profile card) ---------- */
const AchievementsSidebar = ({ user, onOpenTab }) => {
  const states = useBMemo(() => deriveBadgeStates(user), [user]);
  const totals = useBMemo(() => computeTotals(states), [states]);
  const level = useBMemo(() => levelFor(totals.points), [totals.points]);
  useBEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const showcase = totals.recent.slice(0, 3);
  const placeholders = Math.max(0, 3 - showcase.length);

  return (
    <button onClick={onOpenTab}
      style={{
        background: "var(--color-bg-raised)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 12, padding: 14, width: "100%",
        cursor: "pointer", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 12,
        fontFamily: "inherit",
        transition: "all 200ms ease",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--color-warm-orange-deep)", marginBottom: 2 }}>
            level {level.num} · {level.name.toLowerCase()}
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14,
            color: "var(--color-text-primary)" }}>
            {totals.earned} of {totals.total} stamps
          </div>
        </div>
        <i data-lucide="chevron-right" style={{ width: 14, height: 14, color: "var(--color-text-muted)" }}/>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: "var(--color-border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${level.progress * 100}%`,
          background: "var(--gradient-brand)" }}/>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {showcase.map(({ badge, state }) => (
          <BadgeDisc key={badge.id} badge={badge} state={state} size={40} />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div key={"p" + i} style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--color-bg-base)",
            border: "1.5px dashed var(--color-border-default)",
          }}/>
        ))}
      </div>
    </button>
  );
};

/* Expose */
window.TTBadges = { BADGES, FAMILY_STYLES, LEVELS, deriveBadgeStates, computeTotals, levelFor };
window.AchievementsView = AchievementsView;
window.AchievementsSidebar = AchievementsSidebar;
window.TinkerLevelEmblem = TinkerLevelEmblem;
window.BadgeDisc = BadgeDisc;
