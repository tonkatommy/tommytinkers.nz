'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Pin, KeyRound, Wrench, Sparkles, Lightbulb, HelpCircle, MapPin,
  Heart, MessageCircle, Send, Check, ArrowRight, LogOut, Settings,
  Bell, MessagesSquare, Car, X, Plus, Image, ImagePlus, Pencil,
} from "lucide-react";

/* =========================================================================
   CONSTANTS & STORAGE
   ========================================================================= */

const FEED_KEY        = "tt-feed-v1";
const FEED_NAME_KEY   = "tt-feed-name-v1";
const MY_REACTS_KEY   = "tt-feed-myreacts-v1";
const AUTH_KEY        = "tt-user-v1";
const FORUM_KEY       = "tt-forum-v1";

const AVATAR_PALETTE: [string, string][] = [
  ["#f97316", "#fcd34d"], ["#4caf2e", "#a8e88f"], ["#1a1816", "#fb923c"],
  ["#fb923c", "#fcd34d"], ["#2e7a1d", "#4caf2e"], ["#fcd34d", "#fb923c"],
  ["#1a1816", "#fcd34d"], ["#a8e88f", "#fcd34d"],
];

const F_CATS = [
  { id: "show",  label: "Show & tell",    Icon: Sparkles },
  { id: "ask",   label: "Question",       Icon: HelpCircle },
  { id: "idea",  label: "Idea / request", Icon: Lightbulb },
  { id: "local", label: "Helensville",    Icon: MapPin },
];

interface Comment { id: string; name: string; avatarSeed: number; isStaff?: boolean; body: string; time: number; }
interface Post { id: string; pinned?: boolean; isStaff?: boolean; name: string; avatarSeed: number; cat: string; body: string; time: number; photo: null | { swatch?: [string,string]; label?: string; dataURL?: string }; reactions: Record<string, number>; comments: Comment[]; }
interface Thread { id: string; cat: string; author: string; avatarSeed: number; staff?: boolean; title: string; body: string; time: number; tags: string[]; votes: number; replies: Array<{ id: string; author: string; staff?: boolean; avatarSeed: number; body: string; time: number; }>; }
interface User { name: string; email: string; location: string; bio: string; joined: number; avatarSeed: number; orders: number; newsletter: boolean; notifyOnReply: boolean; }

const SEED_POSTS: Post[] = [
  { id: "p0", pinned: true, isStaff: true, name: "Tommy", avatarSeed: 0, cat: "show", body: "Welcome to the feed. Post anything you've tinkered with, broken, fixed, or want made. Photos welcome. Be kind, keep it on-topic, that's it.\n\n· No sign-in needed to post or react\n· Custom requests with a few +1s usually become a batch\n· I read everything, even at 11pm", time: Date.now() - 1000 * 60 * 60 * 30, photo: null, reactions: { wrench: 28, heart: 41, lightbulb: 12 }, comments: [] },
  { id: "p1", name: "Aroha S.", avatarSeed: 1, cat: "show", body: "Stuck the new vinyl decals on the chilly bin this morning. Survived an hour at the beach and a sandy dog. Sealed, sealed, sealed.", time: Date.now() - 1000 * 60 * 47, photo: { swatch: ["#fb923c", "#fcd34d"], label: "chilly bin / sand" }, reactions: { wrench: 4, heart: 19, lightbulb: 1 }, comments: [{ id: "c1", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Beach-tested certification unlocked.", time: Date.now() - 1000 * 60 * 40 }, { id: "c2", name: "Marko", avatarSeed: 3, body: "Need the same set for my pataka. Where do I sign up?", time: Date.now() - 1000 * 60 * 18 }] },
  { id: "p2", name: "Pip L.", avatarSeed: 2, cat: "idea", body: "Idea: a phone stand that hooks over a kitchen cupboard handle so I can follow a recipe without smearing flour on the screen. Anyone else want one?", time: Date.now() - 1000 * 60 * 60 * 3, photo: null, reactions: { wrench: 11, heart: 8, lightbulb: 24 }, comments: [{ id: "c3", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Already sketching. Measure your handle width and reply with it.", time: Date.now() - 1000 * 60 * 60 * 2 }, { id: "c4", name: "Jules", avatarSeed: 4, body: "+1, my partner does pasta from scratch and my phone has paid the price.", time: Date.now() - 1000 * 60 * 90 }] },
  { id: "p3", name: "Ben K.", avatarSeed: 5, cat: "show", body: "Cutlery drawer organiser — install no. 3 this month. Two more drawers to go, then I'm coming for the linen cupboard.", time: Date.now() - 1000 * 60 * 60 * 8, photo: { swatch: ["#4caf2e", "#a8e88f"], label: "drawer / order achieved" }, reactions: { wrench: 7, heart: 22, lightbulb: 2 }, comments: [] },
  { id: "p4", name: "Marina", avatarSeed: 6, cat: "ask", body: "Quick one: PETG or PLA for an outdoor letterbox flag in Auckland weather? Have heard mixed things.", time: Date.now() - 1000 * 60 * 60 * 11, photo: null, reactions: { wrench: 1, heart: 3, lightbulb: 0 }, comments: [{ id: "c5", name: "Tommy", avatarSeed: 0, isStaff: true, body: "PETG, every time, if it sees the sun. PLA goes soft on a hot west-facing wall.", time: Date.now() - 1000 * 60 * 60 * 10 }] },
  { id: "p5", name: "Hēmi", avatarSeed: 7, cat: "local", body: "Helensville crew — anyone want to do a pickup run on Saturday? Save us all on shipping.", time: Date.now() - 1000 * 60 * 60 * 20, photo: null, reactions: { wrench: 0, heart: 9, lightbulb: 6 }, comments: [{ id: "c6", name: "Tommy", avatarSeed: 0, isStaff: true, body: "Saturday 9-1 the workshop's open. Flick me your order numbers and I'll bundle them.", time: Date.now() - 1000 * 60 * 60 * 19 }] },
];

const SEED_THREADS: Thread[] = [
  { id: "t1", cat: "show", author: "Aroha S.", avatarSeed: 1, title: "RC bumper guard saved my Tamiya", body: "Smashed into a kerb at Pukekohe last weekend. The PETG bumper Tommy printed me took the hit, chassis is fine.", time: Date.now() - 1000*60*60*7, tags: ["rc-parts"], votes: 14, replies: [{ id: "r1", author: "Tommy", staff: true, avatarSeed: 0, body: "Stoked it held up. Send me a measurement of the scuff and I'll thicken the next batch on that edge.", time: Date.now() - 1000*60*60*6 }, { id: "r2", author: "Marko", avatarSeed: 3, body: "Same here, mine survived a roll. Best $18.50 I've spent.", time: Date.now() - 1000*60*60*4 }] },
  { id: "t2", cat: "requests", author: "Pip L.", avatarSeed: 2, title: "Wall hook for a kid's bike helmet?", body: "Looking for something that holds a kid's helmet by the strap. Mounts on plasterboard. Anyone else want one?", time: Date.now() - 1000*60*60*22, tags: ["household"], votes: 9, replies: [{ id: "r3", author: "Tommy", staff: true, avatarSeed: 0, body: "Easy print. Drywall anchor or a stud screw? I'll mock one this weekend.", time: Date.now() - 1000*60*60*20 }, { id: "r4", author: "Jules", avatarSeed: 4, body: "+1 from me, two kids, two helmets, lounge floor.", time: Date.now() - 1000*60*60*18 }] },
  { id: "t3", cat: "workshop", author: "Tommy", staff: true, avatarSeed: 0, title: "PETG vs PLA for outdoor parts — what I've settled on", body: "Quick note for anyone asking: PETG for anything that lives outside or takes a knock. PLA for indoor toys and quick prototypes. Don't trust PLA in a parked car in summer.", time: Date.now() - 1000*60*60*32, tags: ["tips"], votes: 22, replies: [] },
  { id: "t4", cat: "show", author: "Ben K.", avatarSeed: 5, title: "Drawer organiser, post-install", body: "Did the cutlery drawer first, now I'm doing every drawer in the kitchen. Send help (and more bins).", time: Date.now() - 1000*60*60*52, tags: ["household"], votes: 18, replies: [{ id: "r5", author: "Marina", avatarSeed: 6, body: "Same trap I fell into. Tip: measure your drawer depth before ordering.", time: Date.now() - 1000*60*60*48 }] },
];

/* =========================================================================
   UTILS
   ========================================================================= */

function timeAgo(ts: number) {
  const d = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  if (d < 86400 * 7) return Math.floor(d / 86400) + "d ago";
  return new Date(ts).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

function loadFeed(): Post[] { try { const v = JSON.parse(localStorage.getItem(FEED_KEY) ?? "null"); return v?.length ? v : SEED_POSTS; } catch { return SEED_POSTS; } }
function saveFeed(p: Post[]) { try { localStorage.setItem(FEED_KEY, JSON.stringify(p)); } catch {} }
function loadMyReacts(): Record<string, string> { try { return JSON.parse(localStorage.getItem(MY_REACTS_KEY) ?? "{}") ?? {}; } catch { return {}; } }
function saveMyReacts(m: Record<string, string>) { try { localStorage.setItem(MY_REACTS_KEY, JSON.stringify(m)); } catch {} }
function loadUser(): User | null { try { return JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null"); } catch { return null; } }
function saveUser(u: User) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {} }
function clearUser() { try { localStorage.removeItem(AUTH_KEY); } catch {} }
function loadForum(): Thread[] { try { const v = JSON.parse(localStorage.getItem(FORUM_KEY) ?? "null"); return v?.length ? v : SEED_THREADS; } catch { return SEED_THREADS; } }
function saveForum(t: Thread[]) { try { localStorage.setItem(FORUM_KEY, JSON.stringify(t)); } catch {} }

/* =========================================================================
   SHARED SUB-COMPONENTS
   ========================================================================= */

function AvatarBubble({ name = "?", seed = 0, size = 40, staff = false }: { name?: string; seed?: number; size?: number; staff?: boolean }) {
  const [a, b] = AVATAR_PALETTE[((seed % AVATAR_PALETTE.length) + AVATAR_PALETTE.length) % AVATAR_PALETTE.length];
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${a}, ${b})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: size * 0.42, color: "#1A1816", boxShadow: "0 2px 6px rgba(26,24,22,0.15)" }}>{initial}</div>
      {staff && <span title="Tommy / staff" style={{ position: "absolute", bottom: -2, right: -2, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-text-inverse)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--color-bg-base)", fontSize: size * 0.22, fontWeight: 700 }}>★</span>}
    </div>
  );
}

/* =========================================================================
   SHED HERO / TAB SWITCHER
   ========================================================================= */

function ShedMark() {
  return (
    <svg viewBox="0 0 220 140" width="220" height="140" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sh-roof" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <line x1="0" y1="135" x2="220" y2="135" stroke="#1A1816" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30,68 L110,18 L190,68 Z" fill="url(#sh-roof)" stroke="#1A1816" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="40" y="68" width="140" height="67" fill="#FDF8EE" stroke="#1A1816" strokeWidth="2.5" />
      <rect x="98" y="86" width="36" height="49" fill="#4CAF2E" stroke="#1A1816" strokeWidth="2" />
      <circle cx="127" cy="111" r="2" fill="#1A1816" />
      <rect x="54" y="84" width="32" height="26" fill="#FCD34D" stroke="#1A1816" strokeWidth="1.8" />
      <line x1="70" y1="84" x2="70" y2="110" stroke="#1A1816" strokeWidth="1.5" />
      <line x1="54" y1="97" x2="86" y2="97" stroke="#1A1816" strokeWidth="1.5" />
      <rect x="146" y="84" width="32" height="26" fill="#FCD34D" stroke="#1A1816" strokeWidth="1.8" />
      <line x1="162" y1="84" x2="162" y2="110" stroke="#1A1816" strokeWidth="1.5" />
      <line x1="146" y1="97" x2="178" y2="97" stroke="#1A1816" strokeWidth="1.5" />
      <rect x="155" y="32" width="10" height="20" fill="#1A1816" />
      <circle cx="160" cy="26" r="6" fill="#FDF8EE" stroke="#1A1816" strokeWidth="1.5" />
      <circle cx="170" cy="18" r="4" fill="#FDF8EE" stroke="#1A1816" strokeWidth="1.5" />
      <line x1="62" y1="68" x2="62" y2="76" stroke="#1A1816" strokeWidth="1" />
      <rect x="48" y="76" width="28" height="11" fill="#1A1816" />
      <text x="62" y="84" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#FCD34D" letterSpacing="0.05em">OPEN</text>
    </svg>
  );
}

const SHED_TABS = [
  { id: "pinboard", label: "The Pinboard", sub: "open to all", desc: "The corkboard out front. Pin a build, ask a question, leave a note. Anyone can post — no sign-in needed.", Icon: Pin },
  { id: "workshop", label: "The Workshop", sub: "members only", desc: "The back of the shed. Your bench, threaded discussions, custom requests, achievements, orders. Sign-in required.", Icon: KeyRound },
];

function ShedHero({ tab, setTab, pinboardCount, isMember }: { tab: string; setTab: (t: string) => void; pinboardCount: number; isMember: boolean }) {
  return (
    <section style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border-subtle)", paddingTop: 40, paddingBottom: 0, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -160, right: -120, width: 420, height: 420, background: "var(--gradient-brand-radial)", filter: "blur(70px)", opacity: 0.5, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(252,211,77,0.08) 1px, transparent 0)", backgroundSize: "22px 22px", pointerEvents: "none", opacity: 0.5 }} />
      <div className="tt-container" style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center", marginBottom: 28 }}>
          <div>
            <span className="tt-section-eyebrow">&gt; 00. the shed</span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(38px, 4.6vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.04, margin: "6px 0 14px", color: "var(--color-text-primary)" }}>Round the shed.</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, maxWidth: 620 }}>
              Two corners of the workshop. The Pinboard&apos;s the corkboard out front, open to anyone with a thought. The Workshop&apos;s the back room where members keep a bench and chase their custom builds.
            </p>
          </div>
          <div className="tt-shed-mark" style={{ display: "flex", justifyContent: "flex-end" }}>
            <ShedMark />
          </div>
        </div>

        <div className="tt-shed-tabs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: -1 }}>
          {SHED_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ textAlign: "left", cursor: "pointer", background: active ? "var(--color-bg-base)" : "var(--color-bg-raised)", border: "1px solid var(--color-border-subtle)", borderBottom: active ? "1px solid var(--color-bg-base)" : "1px solid var(--color-border-subtle)", borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: "16px 22px 22px", position: "relative", transition: "background var(--motion-base), transform var(--motion-fast)", transform: active ? "translateY(0)" : "translateY(4px)", boxShadow: active ? "0 -6px 18px rgba(251,146,60,0.10)" : "none" }}>
                {active && <div style={{ position: "absolute", top: 0, left: 16, right: 16, height: 3, background: "var(--gradient-brand)", borderRadius: "0 0 4px 4px" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? "var(--color-accent-subtle)" : "transparent", border: active ? "1px solid var(--color-accent-muted)" : "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "var(--color-accent)" : "var(--color-text-secondary)" }}>
                    <t.Icon size={14} />
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{t.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", background: active ? "var(--color-accent)" : "var(--color-bg-base)", color: active ? "var(--color-text-inverse)" : "var(--color-text-muted)", border: active ? "none" : "1px solid var(--color-border-subtle)" }}>{t.sub}</span>
                  {t.id === "workshop" && isMember && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-success)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}><Check size={11} /> signed in</span>}
                  {t.id === "pinboard" && pinboardCount > 0 && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginLeft: "auto" }}>{pinboardCount} posts</span>}
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)", margin: 0 }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   PINBOARD (PUBLIC FEED)
   ========================================================================= */

function FComposer({ onPost, defaultName }: { onPost: (p: Post) => void; defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [body, setBody] = useState("");
  const [cat, setCat] = useState("show");
  const [photo, setPhoto] = useState<Post["photo"]>(null);
  const [focus, setFocus] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX = 500;

  function pickFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 640;
        const ratio = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * ratio), h = Math.round(img.height * ratio);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setPhoto({ dataURL: c.toDataURL("image/jpeg", 0.78), label: file.name.replace(/\.[^.]+$/, "").slice(0, 28) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const post: Post = {
      id: "p" + Date.now(), name: name.trim() || "Anonymous", avatarSeed: Math.floor(Math.random() * AVATAR_PALETTE.length),
      cat, body: body.trim(), time: Date.now(), photo, reactions: { wrench: 0, heart: 0, lightbulb: 0 }, comments: [],
    };
    onPost(post);
    try { localStorage.setItem(FEED_NAME_KEY, post.name); } catch {}
    setBody(""); setPhoto(null);
  }

  return (
    <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: focus ? 20 : 16, marginBottom: 24, transition: "padding var(--motion-base)", boxShadow: focus ? "var(--shadow-md)" : "none" }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AvatarBubble name={name || "?"} seed={0} size={36} />
          <textarea
            className="tt-textarea"
            placeholder="Post a build, question, or idea…"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            onFocus={() => setFocus(true)}
            rows={focus ? 4 : 2}
            style={{ flex: 1, resize: "none", fontSize: 15 }}
          />
        </div>

        {focus && (
          <>
            {photo && (
              <div style={{ position: "relative", height: 120, borderRadius: 10, overflow: "hidden", background: photo.dataURL ? undefined : `linear-gradient(135deg, ${(photo as any).swatch?.[0] ?? "#fcd34d"}, ${(photo as any).swatch?.[1] ?? "#fb923c"})` }}>
                {photo.dataURL && <img src={photo.dataURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <button type="button" onClick={() => setPhoto(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(26,24,22,0.7)", border: "none", borderRadius: 6, color: "#fdf8ee", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {F_CATS.map((c) => (
                <button key={c.id} type="button" onClick={() => setCat(c.id)} style={{ padding: "5px 10px", borderRadius: 999, border: cat === c.id ? "none" : "1px solid var(--color-border-default)", background: cat === c.id ? "var(--color-accent)" : "transparent", color: cat === c.id ? "var(--color-text-inverse)" : "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <c.Icon size={11} /> {c.label}
                </button>
              ))}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: body.length > MAX - 40 ? "var(--color-warm-orange)" : "var(--color-text-muted)", marginLeft: "auto" }}>{MAX - body.length}</span>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="tt-input" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, fontSize: 13 }} />
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} className="tt-icon-btn" title="Attach photo"><ImagePlus size={16} /></button>
              <button type="submit" className="tt-btn tt-btn-primary" disabled={!body.trim()} style={{ opacity: body.trim() ? 1 : 0.5 }}>
                <Send size={14} /> Post
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

const REACT_DEFS = [
  { key: "wrench", icon: "🔧", label: "Nice build" },
  { key: "heart",  icon: "❤️", label: "Love it" },
  { key: "lightbulb", icon: "💡", label: "Great idea" },
];

function FPost({ post, myReacts, onReact, onComment }: { post: Post; myReacts: Record<string, string>; onReact: (postId: string, key: string) => void; onComment: (postId: string, name: string, body: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cBody, setCBody] = useState("");
  const CatInfo = F_CATS.find((c) => c.id === post.cat) ?? F_CATS[0];

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!cBody.trim()) return;
    onComment(post.id, cName.trim() || "Anonymous", cBody.trim());
    setCBody("");
  }

  return (
    <article className="tt-card" style={{ padding: 20, marginBottom: 12 }}>
      {post.pinned && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-warm-orange)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Pin size={11} /> Pinned
        </div>
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <AvatarBubble name={post.name} seed={post.avatarSeed} size={38} staff={post.isStaff} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>{post.name}</span>
            {post.isStaff && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-accent)", border: "1px solid var(--color-accent-muted)", padding: "1px 6px", borderRadius: 4 }}>staff</span>}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{timeAgo(post.time)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-warm-orange-deep)", background: "var(--color-bg-raised)", border: "1px solid var(--color-border-subtle)", padding: "1px 7px", borderRadius: 4, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <CatInfo.Icon size={10} /> {CatInfo.label}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.65, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", margin: 0 }}>{post.body}</p>

          {post.photo && (
            <div style={{ marginTop: 12 }}>
              {post.photo.dataURL
                ? <img src={post.photo.dataURL} alt={post.photo.label ?? ""} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 10, border: "1px solid var(--color-border-subtle)" }} />
                : <div style={{ height: 180, borderRadius: 10, background: `linear-gradient(135deg, ${post.photo.swatch?.[0] ?? "#fcd34d"} 0%, ${post.photo.swatch?.[1] ?? "#fb923c"} 100%)`, border: "1px solid var(--color-border-subtle)", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: 14 }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0%, transparent 55%)" }} />
                    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "rgba(26,24,22,0.75)", color: "#fdf8ee", padding: "5px 10px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 11, position: "relative" }}><Image size={11} />{post.photo.label}</span>
                  </div>
              }
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            {REACT_DEFS.map((r) => (
              <button key={r.key} type="button" onClick={() => onReact(post.id, r.key)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, border: `1px solid ${myReacts[post.id] === r.key ? "var(--color-accent)" : "var(--color-border-default)"}`, background: myReacts[post.id] === r.key ? "var(--color-accent-subtle)" : "transparent", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: myReacts[post.id] === r.key ? "var(--color-accent)" : "var(--color-text-secondary)", transition: "all var(--motion-fast)" }}>
                <span>{r.icon}</span>
                <span>{post.reactions[r.key] ?? 0}</span>
              </button>
            ))}
            <button onClick={() => setOpen(!open)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
              <MessageCircle size={13} /> {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}
            </button>
          </div>

          {open && (
            <div style={{ marginTop: 14, paddingLeft: 14, borderLeft: "2px solid var(--color-border-subtle)" }}>
              {post.comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <AvatarBubble name={c.name} seed={c.avatarSeed} size={28} staff={c.isStaff} />
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)" }}>{timeAgo(c.time)}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0 }}>{c.body}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="tt-input" placeholder="Your name" value={cName} onChange={(e) => setCName(e.target.value)} style={{ width: 110, fontSize: 13 }} />
                <input className="tt-input" placeholder="Reply…" value={cBody} onChange={(e) => setCBody(e.target.value)} style={{ flex: 1, fontSize: 13 }} />
                <button type="submit" className="tt-btn tt-btn-primary" style={{ padding: "8px 12px" }}><Send size={13} /></button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Pinboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [myReacts, setMyReacts] = useState<Record<string, string>>({});
  const [defaultName, setDefaultName] = useState("");

  useEffect(() => {
    setPosts(loadFeed());
    setMyReacts(loadMyReacts());
    setDefaultName(localStorage.getItem(FEED_NAME_KEY) ?? "");
  }, []);

  function onPost(p: Post) {
    const next = [p, ...posts];
    setPosts(next); saveFeed(next);
  }

  function onReact(postId: string, key: string) {
    const prev = myReacts[postId];
    const next = { ...myReacts, [postId]: prev === key ? "" : key };
    setMyReacts(next); saveMyReacts(next);
    setPosts((ps) => {
      const updated = ps.map((p) => {
        if (p.id !== postId) return p;
        const r = { ...p.reactions };
        if (prev) r[prev] = Math.max(0, (r[prev] ?? 0) - 1);
        if (prev !== key) r[key] = (r[key] ?? 0) + 1;
        return { ...p, reactions: r };
      });
      saveFeed(updated); return updated;
    });
  }

  function onComment(postId: string, name: string, body: string) {
    setPosts((ps) => {
      const updated = ps.map((p) => p.id !== postId ? p : { ...p, comments: [...p.comments, { id: "c" + Date.now(), name, avatarSeed: Math.floor(Math.random() * AVATAR_PALETTE.length), body, time: Date.now() }] });
      saveFeed(updated); return updated;
    });
  }

  return (
    <section style={{ padding: "32px 0 80px" }}>
      <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 36, alignItems: "start" }}>
        <div>
          <FComposer onPost={onPost} defaultName={defaultName} />
          {posts.map((p) => <FPost key={p.id} post={p} myReacts={myReacts} onReact={onReact} onComment={onComment} />)}
        </div>
        <aside style={{ position: "sticky", top: 80 }}>
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-warm-orange)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Rules of the corkboard</div>
            {["Be kind — first-name basis, no flames.", "Photos welcome (down-scaled to 640px).", "Custom ideas with 3+ lightbulbs usually get made.", "Tommy reads every post, even at 11 pm."].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>0{i+1}.</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Reaction key</div>
            {REACT_DEFS.map((r) => (
              <div key={r.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-secondary)" }}>{r.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <style>{`@media (max-width: 860px) { .tt-container > div[style*="280px"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* =========================================================================
   WORKSHOP (MEMBERS)
   ========================================================================= */

function AuthPanel({ onLogin }: { onLogin: (u: User) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.includes("@")) { setErr("That email doesn't look right."); return; }
    if (form.password.length < 4) { setErr("Password needs at least 4 characters."); return; }
    if (mode === "signup" && !form.name.trim()) { setErr("Tell me what to call you."); return; }
    const user: User = { name: form.name.trim() || form.email.split("@")[0], email: form.email.trim(), location: form.location.trim() || "Helensville, NZ", bio: mode === "signup" ? "" : "Long-time tinker. Mostly here for the RC bumpers.", joined: Date.now(), avatarSeed: Math.floor(Math.random() * AVATAR_PALETTE.length), orders: 0, newsletter: true, notifyOnReply: true };
    saveUser(user); onLogin(user);
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({ flex: 1, padding: "9px 12px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600, background: active ? "var(--color-bg-surface)" : "transparent", color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)", boxShadow: active ? "var(--shadow-sm)" : "none", transition: "all 150ms ease" });

  const BENEFITS = [
    { Icon: Lightbulb, t: "Request a custom build", d: "Post an idea. If a few people want one, I'll make a batch and the requesters get first dibs." },
    { Icon: MessagesSquare, t: "Show your tinkers", d: "Photos, builds, mods. Tag the part if you remember the SKU." },
    { Icon: Bell, t: "First in line for new drops", d: "Get a heads-up when limited runs hit the shop." },
  ];

  return (
    <section style={{ padding: "24px 0 96px" }}>
      <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <span className="tt-section-eyebrow">&gt; the workshop</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(34px, 4.2vw, 52px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "8px 0 16px", color: "var(--color-text-primary)" }}>Sign in to grab a key.</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65, color: "var(--color-text-secondary)", maxWidth: 520, margin: "0 0 28px" }}>The Workshop is the back half of the shed. Your bench, custom requests, order ledger, threaded chats. The Pinboard out front stays open to everyone.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BENEFITS.map(({ Icon: Ic, t, d }) => (
              <div key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-bg-raised)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-warm-orange-deep)", flexShrink: 0 }}><Ic size={16} /></div>
                <div><div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>{t}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)" }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, padding: 32, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--color-bg-raised)", padding: 4, borderRadius: 10, marginBottom: 24 }}>
            <button onClick={() => { setMode("signin"); setErr(""); }} style={tabBtnStyle(mode === "signin")}>Sign in</button>
            <button onClick={() => { setMode("signup"); setErr(""); }} style={tabBtnStyle(mode === "signup")}>Create account</button>
          </div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && <div><label htmlFor="wn" className="tt-field-label">Display name</label><input id="wn" className="tt-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What should we call you?" /></div>}
            <div><label htmlFor="we" className="tt-field-label">Email</label><input id="we" type="email" className="tt-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@somewhere.nz" /></div>
            <div><label htmlFor="wp" className="tt-field-label">Password</label><input id="wp" type="password" className="tt-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="•••••••" /></div>
            {mode === "signup" && <div><label htmlFor="wloc" className="tt-field-label">Where you&apos;re posting from</label><input id="wloc" className="tt-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Optional — Helensville, NZ" /></div>}
            {err && <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-error)" }}>! {err}</div>}
            <button type="submit" className="tt-btn tt-btn-primary" style={{ marginTop: 6, justifyContent: "center", padding: 12 }}>
              {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight size={14} />
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", margin: "6px 0 0", lineHeight: 1.5 }}>No third-party trackers. Your details stay in NZ.</p>
          </form>
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .tt-container > div[style*="1.1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

const FORUM_CATS = [
  { id: "all", label: "All threads", Icon: MessagesSquare },
  { id: "show", label: "Show & tell", Icon: Sparkles },
  { id: "requests", label: "Custom requests", Icon: Lightbulb },
  { id: "workshop", label: "Workshop tips", Icon: Wrench },
  { id: "rc", label: "RC racing", Icon: Car },
];

function Workshop({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [forumCat, setForumCat] = useState("all");
  const [openThread, setOpenThread] = useState<Thread | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [activeTab, setActiveTab] = useState<"forum" | "orders" | "settings">("forum");
  const [editUser, setEditUser] = useState(user);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setThreads(loadForum()); }, []);

  const filtered = useMemo(() => forumCat === "all" ? threads : threads.filter((t) => t.cat === forumCat), [threads, forumCat]);

  function upvote(id: string) {
    setThreads((ts) => { const u = ts.map((t) => t.id === id ? { ...t, votes: t.votes + 1 } : t); saveForum(u); return u; });
  }

  function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim() || !openThread) return;
    const r = { id: "r" + Date.now(), author: user.name, avatarSeed: user.avatarSeed, body: replyBody.trim(), time: Date.now() };
    setThreads((ts) => {
      const u = ts.map((t) => t.id === openThread.id ? { ...t, replies: [...t.replies, r] } : t);
      saveForum(u);
      setOpenThread(u.find((t) => t.id === openThread.id) ?? null);
      return u;
    });
    setReplyBody("");
  }

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    saveUser(editUser); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  const tabSty = (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? "var(--color-accent-subtle)" : "transparent", color: active ? "var(--color-accent)" : "var(--color-text-secondary)", fontFamily: "var(--font-body)", fontWeight: active ? 600 : 400, fontSize: 14, borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent", width: "100%", textAlign: "left" });

  return (
    <section style={{ padding: "32px 0 96px" }}>
      <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 36, alignItems: "start" }}>
        {/* Profile sidebar */}
        <aside style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ height: 52, background: "var(--gradient-brand)" }} />
            <div style={{ padding: "0 16px 16px", marginTop: -26 }}>
              <AvatarBubble name={user.name} seed={user.avatarSeed} size={52} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{user.location}</div>
              </div>
            </div>
          </div>
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 14, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
            <button style={tabSty(activeTab === "forum")} onClick={() => setActiveTab("forum")}><MessagesSquare size={15} /> Forum</button>
            <button style={tabSty(activeTab === "orders")} onClick={() => setActiveTab("orders")}><Wrench size={15} /> Orders</button>
            <button style={tabSty(activeTab === "settings")} onClick={() => setActiveTab("settings")}><Settings size={15} /> Settings</button>
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: 14, width: "100%", textAlign: "left", marginTop: 4, borderTop: "1px solid var(--color-border-subtle)", paddingTop: 13 }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div>
          {activeTab === "forum" && !openThread && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {FORUM_CATS.map((c) => (
                  <button key={c.id} onClick={() => setForumCat(c.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: `1px solid ${forumCat === c.id ? "var(--color-accent)" : "var(--color-border-default)"}`, background: forumCat === c.id ? "var(--color-accent)" : "transparent", color: forumCat === c.id ? "var(--color-text-inverse)" : "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer" }}>
                    <c.Icon size={12} />{c.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((t) => (
                  <article key={t.id} className="tt-card" style={{ padding: 18, cursor: "pointer" }} onClick={() => setOpenThread(t)}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); upvote(t.id); }} style={{ background: "none", border: "1px solid var(--color-border-default)", borderRadius: 6, cursor: "pointer", padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 }}>
                          <span style={{ fontSize: 10 }}>▲</span>
                          <span>{t.votes}</span>
                        </button>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <AvatarBubble name={t.author} seed={t.avatarSeed} size={22} staff={t.staff} />
                          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13 }}>{t.author}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)" }}>{timeAgo(t.time)}</span>
                          {t.tags.map((g) => <span key={g} className="tt-tag">{g}</span>)}
                        </div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 4px" }}>{t.title}</h3>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{t.body.slice(0, 120)}{t.body.length > 120 ? "…" : ""}</p>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 8 }}>
                          <MessageCircle size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />{t.replies.length} {t.replies.length === 1 ? "reply" : "replies"}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeTab === "forum" && openThread && (
            <div>
              <button onClick={() => setOpenThread(null)} className="tt-btn tt-btn-ghost" style={{ marginBottom: 18, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                ← Back to threads
              </button>
              <article className="tt-card" style={{ padding: 24, marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <AvatarBubble name={openThread.author} seed={openThread.avatarSeed} size={40} staff={openThread.staff} />
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>{openThread.author}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{timeAgo(openThread.time)}</span>
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, margin: "4px 0 10px", letterSpacing: "-0.01em" }}>{openThread.title}</h2>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65, color: "var(--color-text-primary)", margin: 0 }}>{openThread.body}</p>
                  </div>
                </div>
              </article>

              {openThread.replies.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <AvatarBubble name={r.author} seed={r.avatarSeed} size={32} staff={r.staff} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>{r.author}</span>
                      {r.staff && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-accent)", border: "1px solid var(--color-accent-muted)", padding: "1px 5px", borderRadius: 4 }}>staff</span>}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{timeAgo(r.time)}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>{r.body}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={reply} style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <AvatarBubble name={user.name} seed={user.avatarSeed} size={32} />
                <textarea className="tt-textarea" placeholder="Add a reply…" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={3} style={{ flex: 1, fontSize: 14 }} />
                <button type="submit" className="tt-btn tt-btn-primary" style={{ alignSelf: "flex-end", padding: "10px 16px" }}>
                  <Send size={14} /> Reply
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, margin: "0 0 20px", letterSpacing: "-0.02em" }}>Your orders</h2>
              <div style={{ background: "var(--color-bg-surface)", border: "1px dashed var(--color-border-default)", borderRadius: 14, padding: "60px 24px", textAlign: "center" }}>
                <Wrench size={32} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", margin: 0 }}>No orders yet. <a href="/shop">Browse the shop →</a></p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, margin: "0 0 20px", letterSpacing: "-0.02em" }}>Account settings</h2>
              <form onSubmit={saveSettings} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
                <div><label className="tt-field-label">Display name</label><input className="tt-input" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} /></div>
                <div><label className="tt-field-label">Email</label><input className="tt-input" type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} /></div>
                <div><label className="tt-field-label">Location</label><input className="tt-input" value={editUser.location} onChange={(e) => setEditUser({ ...editUser, location: e.target.value })} /></div>
                <div><label className="tt-field-label">Bio</label><textarea className="tt-textarea" rows={3} value={editUser.bio} onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button type="submit" className="tt-btn tt-btn-primary"><Pencil size={14} /> Save changes</button>
                  {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-accent)" }}>✓ Saved.</span>}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .tt-container > div[style*="220px"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* =========================================================================
   PAGE ROOT
   ========================================================================= */

export default function ShedPage() {
  const [tab, setTab] = useState<"pinboard" | "workshop">("pinboard");
  const [user, setUser] = useState<User | null>(null);
  const [pinboardCount, setPinboardCount] = useState(6);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "workshop") setTab("workshop");
    setUser(loadUser());
    try { const f = JSON.parse(localStorage.getItem(FEED_KEY) ?? "null"); if (f?.length) setPinboardCount(f.length); } catch {}
  }, []);

  useEffect(() => {
    const h = "#" + tab;
    if (window.location.hash !== h) window.history.replaceState(null, "", h);
    if (tab === "workshop") setUser(loadUser());
  }, [tab]);

  function handleLogin(u: User) { setUser(u); }
  function handleLogout() { clearUser(); setUser(null); }

  return (
    <>
      <ShedHero tab={tab} setTab={(t) => setTab(t as "pinboard" | "workshop")} pinboardCount={pinboardCount} isMember={!!user} />
      <div style={{ background: "var(--color-bg-base)" }}>
        {tab === "pinboard" && <Pinboard />}
        {tab === "workshop" && (!user ? <AuthPanel onLogin={handleLogin} /> : <Workshop user={user} onLogout={handleLogout} />)}
      </div>
    </>
  );
}
