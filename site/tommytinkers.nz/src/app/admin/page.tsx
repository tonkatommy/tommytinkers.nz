'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package, Layers, Wallet, TrendingDown, CircleSlash, Archive,
  Search, Table2, LayoutGrid, Plus, Pencil, ArchiveRestore, X,
  Minus, Check, ExternalLink, Sun, Moon, Boxes, Receipt,
  Sliders, ArrowUpDown,
} from "lucide-react";
import { TT_PRODUCTS, TT_CATEGORIES } from "@/lib/products";
import type { Product } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const LOW_STOCK_DEFAULT = 10;
const INV_KEY = "tt-inv-v1";
const FX_KEY = "tt-fx-v1";

const SWATCHES: [string, string][] = [
  ["#4caf2e", "#1a1816"], ["#fb923c", "#fcd34d"], ["#f97316", "#1a1816"],
  ["#fcd34d", "#fb923c"], ["#1a1816", "#4caf2e"], ["#1a1816", "#f97316"],
  ["#fcd34d", "#4caf2e"], ["#fb923c", "#1a1816"],
];

const CARDFX_OPTS = ["classic", "tilt", "socket", "peel", "glow"] as const;
const LINKFX_OPTS = ["underline", "caret", "bracket", "swipe"] as const;
const SCROLLFX_OPTS = ["rise", "assemble", "blur", "swing"] as const;
const BTNFX_OPTS = ["sweep", "press"] as const;

const FX_DEFAULTS = { cardfx: "peel", linkfx: "caret", scrollfx: "swing", btnfx: "sweep", scale: 1 };

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type InvProduct = Product & { archived?: boolean; cost?: number };
type SortKey = "name" | "cat" | "price" | "stock";
type FilterStatus = "active" | "low" | "out" | "archived" | "all";
type View = "table" | "cards";
type DrawerMode = "add" | "edit";
type FxSettings = typeof FX_DEFAULTS;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function loadInv(): InvProduct[] {
  if (typeof window === "undefined") return TT_PRODUCTS;
  try {
    const saved = localStorage.getItem(INV_KEY);
    return saved ? JSON.parse(saved) : TT_PRODUCTS.map((p) => ({ ...p }));
  } catch { return TT_PRODUCTS.map((p) => ({ ...p })); }
}

function saveInv(list: InvProduct[]) {
  try { localStorage.setItem(INV_KEY, JSON.stringify(list)); } catch {}
}

function loadFx(): FxSettings {
  if (typeof window === "undefined") return FX_DEFAULTS;
  try {
    const saved = localStorage.getItem(FX_KEY);
    return saved ? { ...FX_DEFAULTS, ...JSON.parse(saved) } : { ...FX_DEFAULTS };
  } catch { return { ...FX_DEFAULTS }; }
}

function saveFx(fx: FxSettings) {
  try { localStorage.setItem(FX_KEY, JSON.stringify(fx)); } catch {}
}

function applyFx(fx: FxSettings) {
  const el = document.documentElement;
  el.setAttribute("data-tt-cardfx", fx.cardfx);
  el.setAttribute("data-tt-linkfx", fx.linkfx);
  el.setAttribute("data-tt-scrollfx", fx.scrollfx);
  el.setAttribute("data-tt-btnfx", fx.btnfx);
  el.style.setProperty("--ttfx-scale", String(fx.scale));
}

function stockStatus(p: InvProduct, threshold: number) {
  if (p.archived) return "arch";
  if (p.stock <= 0) return "out";
  if (p.stock <= threshold) return "low";
  return "ok";
}

const STATUS_LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock", arch: "Archived" };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "item";
}

function blankProduct(): Omit<InvProduct, "id"> {
  return { cat: "stickers", name: "", price: 10, cost: 4, stock: 10, blurb: "", tags: [], swatch: ["#fb923c", "#fcd34d"], featured: false, archived: false };
}

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */

function AdmCheck({ on, indeterminate, onChange, label }: { on: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button className={"adm-check" + (on ? " on" : "")} role="checkbox" aria-checked={indeterminate ? "mixed" : on}
      aria-label={label || "Select"} onClick={(e) => { e.stopPropagation(); onChange(!on); }}>
      {indeterminate ? <Minus size={12} /> : on ? <Check size={12} /> : null}
    </button>
  );
}

function AdmBadge({ kind, children }: { kind: string; children: React.ReactNode }) {
  return <span className={"adm-badge " + kind}><span className="dot" />{children}</span>;
}

function StockBadge({ p, threshold }: { p: InvProduct; threshold: number }) {
  const s = stockStatus(p, threshold);
  return <AdmBadge kind={s}>{s === "ok" ? `${p.stock} in stock` : STATUS_LABEL[s]}</AdmBadge>;
}

function AdmThumb({ p, size = 40 }: { p: InvProduct; size?: number }) {
  const s = p.swatch || ["#fcd34d", "#fb923c"];
  return (
    <div style={{ width: size, height: size, borderRadius: 9, flex: "0 0 auto", background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1]} 100%)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.5) 0%, transparent 55%)" }} />
    </div>
  );
}

function AdmStepper({ value, onSet }: { value: number; onSet: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => { const n = Math.max(0, Math.round(+draft || 0)); onSet(n); setDraft(String(n)); };
  return (
    <div className="adm-stepper" onClick={(e) => e.stopPropagation()}>
      <button aria-label="Decrease" onClick={() => onSet(Math.max(0, value - 1))}><Minus size={13} /></button>
      <input type="number" value={draft} aria-label="Stock count"
        onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
      <button aria-label="Increase" onClick={() => onSet(value + 1)}><Plus size={13} /></button>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return <div className="adm-toast"><span className="dot" />{msg}</div>;
}

/* ------------------------------------------------------------------ */
/*  Admin bar                                                           */
/* ------------------------------------------------------------------ */

function AdmBar() {
  const [theme, setTheme] = useState<string>("dark");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("tt-theme-v1", next); } catch {}
    setTheme(next);
  };
  return (
    <header className="adm-bar">
      <div className="tt-container adm-bar-inner">
        <div className="adm-brand">
          <Image src="/assets/logo.png" alt="" width={34} height={34} style={{ borderRadius: "50%" }} />
          <span className="adm-brand-text">tommy tinkers <span className="nz">NZ</span></span>
          <span className="adm-pill">admin</span>
        </div>
        <div className="adm-bar-actions">
          <button className="tt-icon-btn" aria-label="Toggle theme" onClick={toggle}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/" className="adm-back"><ExternalLink size={14} /> View site</Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard stats                                                     */
/* ------------------------------------------------------------------ */

function Dashboard({ inv, threshold }: { inv: InvProduct[]; threshold: number }) {
  const active = inv.filter((p) => !p.archived);
  const units = active.reduce((s, p) => s + p.stock, 0);
  const value = active.reduce((s, p) => s + p.price * p.stock, 0);
  const low = active.filter((p) => p.stock > 0 && p.stock <= threshold).length;
  const out = active.filter((p) => p.stock <= 0).length;
  const archived = inv.filter((p) => p.archived).length;
  const money = "NZ$" + value.toLocaleString("en-NZ", { maximumFractionDigits: 0 });

  const stats = [
    { icon: <Package size={16} />, val: active.length, lbl: "Active products", tone: "" },
    { icon: <Layers size={16} />, val: units.toLocaleString("en-NZ"), lbl: "Units on hand", tone: "" },
    { icon: <Wallet size={16} />, val: money, lbl: "Stock value", tone: "accent" },
    { icon: <TrendingDown size={16} />, val: low, lbl: "Low stock", tone: low ? "warn" : "" },
    { icon: <CircleSlash size={16} />, val: out, lbl: "Out of stock", tone: out ? "err" : "" },
    { icon: <Archive size={16} />, val: archived, lbl: "Archived", tone: "" },
  ];

  return (
    <div className="adm-stats">
      {stats.map((s) => (
        <div key={s.lbl} className={"adm-stat" + (s.tone ? " " + s.tone : "")}>
          <span className="ico">{s.icon}</span>
          <div className="val">{s.val}</div>
          <div className="lbl">{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table view                                                          */
/* ------------------------------------------------------------------ */

function TableView({ rows, threshold, density, showThumbs, sort, onSort, selected, onToggle, onToggleAll, onStock, onEdit, onArchive }: {
  rows: InvProduct[]; threshold: number; density: string; showThumbs: boolean;
  sort: { key: SortKey; dir: "asc" | "desc" }; onSort: (k: SortKey) => void;
  selected: string[]; onToggle: (id: string) => void; onToggleAll: () => void;
  onStock: (id: string, n: number) => void; onEdit: (id: string) => void; onArchive: (id: string, v: boolean) => void;
}) {
  const allOn = rows.length > 0 && rows.every((p) => selected.includes(p.id));
  const someOn = rows.some((p) => selected.includes(p.id));

  function Th({ id, children, align }: { id: SortKey; children: React.ReactNode; align?: string }) {
    return (
      <th style={align ? { textAlign: align as "right" } : undefined} onClick={() => onSort(id)}>
        {children}
        {sort.key === id && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
      </th>
    );
  }

  return (
    <div className="adm-table-wrap" data-density={density}>
      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: 40 }} onClick={onToggleAll}>
              <AdmCheck on={allOn} indeterminate={!allOn && someOn} onChange={onToggleAll} label="Select all" />
            </th>
            <Th id="name">Product</Th>
            <Th id="cat">Category</Th>
            <Th id="price" align="right">Price</Th>
            <th style={{ width: 150 }}>Stock</th>
            <Th id="stock">Status</Th>
            <th style={{ width: 90, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const sel = selected.includes(p.id);
            return (
              <tr key={p.id} className={(p.archived ? "archived " : "") + (sel ? "selected" : "")} onClick={() => onEdit(p.id)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <AdmCheck on={sel} onChange={() => onToggle(p.id)} label={"Select " + p.name} />
                </td>
                <td>
                  <div className="adm-prodcell">
                    {showThumbs && <AdmThumb p={p} size={density === "compact" ? 32 : 40} />}
                    <div>
                      <div className="nm">{p.name}</div>
                      <div className="sku">{p.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="adm-cat">{p.cat.replace("-", " ")}</span></td>
                <td style={{ textAlign: "right" }}><span className="adm-num">NZ${p.price.toFixed(2)}</span></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <AdmStepper value={p.stock} onSet={(n) => onStock(p.id, n)} />
                </td>
                <td><StockBadge p={p} threshold={threshold} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="adm-rowact" style={{ justifyContent: "flex-end" }}>
                    <button className="adm-iconbtn" aria-label="Edit" onClick={() => onEdit(p.id)}><Pencil size={15} /></button>
                    <button className="adm-iconbtn" aria-label={p.archived ? "Restore" : "Archive"} onClick={() => onArchive(p.id, !p.archived)}>
                      {p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card view                                                           */
/* ------------------------------------------------------------------ */

function CardsView({ rows, threshold, selected, onToggle, onStock, onEdit, onArchive }: {
  rows: InvProduct[]; threshold: number; selected: string[];
  onToggle: (id: string) => void; onStock: (id: string, n: number) => void;
  onEdit: (id: string) => void; onArchive: (id: string, v: boolean) => void;
}) {
  return (
    <div className="adm-cards">
      {rows.map((p) => {
        const sel = selected.includes(p.id);
        const s = p.swatch || ["#fcd34d", "#fb923c"];
        return (
          <article key={p.id} className={"adm-pcard" + (p.archived ? " archived" : "") + (sel ? " selected" : "")}>
            <div className="adm-pcard-top" style={{ background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1]} 100%)` }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)" }} />
              <div style={{ position: "relative" }}><AdmCheck on={sel} onChange={() => onToggle(p.id)} label={"Select " + p.name} /></div>
              <div style={{ position: "relative" }}><StockBadge p={p} threshold={threshold} /></div>
            </div>
            <div className="adm-pcard-body">
              <div>
                <div className="adm-pcard-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.3 }}>{p.name}</h3>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 3 }}>{p.id} · {p.cat.replace("-", " ")}</div>
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>NZ${p.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="adm-pcard-row" style={{ marginTop: "auto" }}>
                <AdmStepper value={p.stock} onSet={(n) => onStock(p.id, n)} />
                <div className="adm-rowact">
                  <button className="adm-iconbtn" aria-label="Edit" onClick={() => onEdit(p.id)}><Pencil size={15} /></button>
                  <button className="adm-iconbtn" aria-label={p.archived ? "Restore" : "Archive"} onClick={() => onArchive(p.id, !p.archived)}>
                    {p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bulk action bar                                                     */
/* ------------------------------------------------------------------ */

function BulkBar({ count, onRestock, onZero, onArchive, onUnarchive, onClear }: {
  count: number; onRestock: () => void; onZero: () => void;
  onArchive: () => void; onUnarchive: () => void; onClear: () => void;
}) {
  return (
    <div className="adm-bulk">
      <span className="cnt">{count} selected</span>
      <div className="spacer" />
      <button className="adm-bulk-btn" onClick={onRestock}><Plus size={14} /> Restock +10</button>
      <button className="adm-bulk-btn warn" onClick={onZero}><CircleSlash size={14} /> Mark out</button>
      <button className="adm-bulk-btn" onClick={onArchive}><Archive size={14} /> Archive</button>
      <button className="adm-bulk-btn" onClick={onUnarchive}><ArchiveRestore size={14} /> Restore</button>
      <button className="x" onClick={onClear} aria-label="Clear selection"><X size={16} /></button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product drawer                                                      */
/* ------------------------------------------------------------------ */

function ProductDrawer({ open, mode, product, onClose, onSave }: {
  open: boolean; mode: DrawerMode; product: InvProduct | null;
  onClose: () => void; onSave: (p: InvProduct, mode: DrawerMode) => void;
}) {
  const [f, setF] = useState<Omit<InvProduct, "id"> & { id?: string }>(blankProduct());
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      setF({ ...product });
      setTagText((product.tags || []).join(", "));
    } else {
      setF(blankProduct());
      setTagText("");
    }
  }, [open, mode, product]);

  const set = <K extends keyof InvProduct>(k: K, v: InvProduct[K]) => setF((p) => ({ ...p, [k]: v }));
  const cats = TT_CATEGORIES;

  const margin = (f.price ?? 0) > 0 ? Math.round((((f.price ?? 0) - (f.cost ?? 0)) / (f.price ?? 1)) * 100) : 0;

  const save = () => {
    const tags = tagText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const name = (f.name || "").trim() || "Untitled item";
    const id = mode === "add"
      ? slugify((f.cat || "").split("-")[0] + "-" + name).slice(0, 28) + "-" + Math.random().toString(36).slice(2, 5)
      : (f.id || "");
    const clean: InvProduct = {
      ...f as InvProduct,
      id, name, tags,
      price: Math.max(0, Number(f.price) || 0),
      cost: Math.max(0, Number(f.cost) || 0),
      stock: Math.max(0, Math.round(Number(f.stock) || 0)),
    };
    onSave(clean, mode);
  };

  return (
    <>
      <div className={"tt-drawer-overlay" + (open ? " open" : "")} onClick={onClose} />
      <aside className={"tt-drawer" + (open ? " open" : "")} aria-hidden={!open} style={{ width: "min(460px, 100vw)" }}>
        <div className="tt-drawer-head">
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-mono)", letterSpacing: "0.05em" }}>
              &gt; {mode === "add" ? "new product" : "edit product"}
            </span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, margin: "2px 0 0" }}>
              {mode === "add" ? "Add a made thing" : f.name || "Edit"}
            </h3>
          </div>
          <button className="tt-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="tt-drawer-body">
          <div className="adm-form">
            <div>
              <label className="tt-field-label">Product name</label>
              <input className="tt-input" value={f.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sliding cable hook (×4)" />
            </div>

            <div className="pair">
              <div>
                <label className="tt-field-label">Category</label>
                <select className="tt-select" value={f.cat} onChange={(e) => set("cat", e.target.value)}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="tt-field-label">SKU / ID</label>
                <input className="tt-input" value={mode === "add" ? "auto-generated" : (f.id || "")} disabled
                  style={{ opacity: 0.6, fontFamily: "var(--font-mono)", fontSize: 12 }} />
              </div>
            </div>

            <div className="pair">
              <div>
                <label className="tt-field-label">Price (NZ$)</label>
                <input className="tt-input" type="number" min="0" step="0.5" value={f.price ?? ""} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div>
                <label className="tt-field-label">Unit cost (NZ$)</label>
                <input className="tt-input" type="number" min="0" step="0.5" value={f.cost ?? ""} onChange={(e) => set("cost", Number(e.target.value))} />
              </div>
            </div>
            <p className="adm-help">Margin: {margin}% · NZ${((f.price ?? 0) - (f.cost ?? 0)).toFixed(2)} per unit</p>

            <div>
              <label className="tt-field-label">Stock on hand</label>
              <input className="tt-input" type="number" min="0" step="1" value={f.stock ?? ""} onChange={(e) => set("stock", Number(e.target.value))} />
            </div>

            <div>
              <label className="tt-field-label">Blurb</label>
              <textarea className="tt-textarea" value={f.blurb || ""} onChange={(e) => set("blurb", e.target.value)} placeholder="Short description shown on the shop card." />
            </div>

            <div>
              <label className="tt-field-label">Tags (comma separated)</label>
              <input className="tt-input" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="petg, set, outdoor"
                style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
            </div>

            <div>
              <label className="tt-field-label">Swatch</label>
              <div className="swatch-row">
                {SWATCHES.map((sw, i) => (
                  <button key={i} className={"adm-swatch" + (f.swatch?.[0] === sw[0] && f.swatch?.[1] === sw[1] ? " on" : "")}
                    style={{ background: `linear-gradient(135deg, ${sw[0]} 0%, ${sw[1]} 100%)` }}
                    aria-label={"Swatch " + (i + 1)} onClick={() => set("swatch", sw)} />
                ))}
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <AdmCheck on={!!f.featured} onChange={(v) => set("featured", v)} label="Featured" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>Feature on the shop (★ pick)</span>
            </label>
          </div>
        </div>

        <div className="tt-drawer-foot" style={{ display: "flex", gap: 10 }}>
          <button className="tt-btn tt-btn-ghost" style={{ flex: "0 0 auto" }} onClick={onClose}>Cancel</button>
          <button className="tt-btn tt-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={save}>
            {mode === "add" ? <Plus size={15} /> : <Check size={15} />}
            {mode === "add" ? "Add product" : "Save changes"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Site FX tab                                                         */
/* ------------------------------------------------------------------ */

function SiteFxTab({ fx, onChange }: { fx: FxSettings; onChange: (next: FxSettings) => void }) {
  const set = (k: keyof FxSettings, v: string | number) => onChange({ ...fx, [k]: v });

  function FxCard({ label, desc, optKey, opts }: { label: string; desc: string; optKey: keyof FxSettings; opts: readonly string[] }) {
    return (
      <div className="adm-fx-card">
        <div>
          <div className="adm-fx-label">{label}</div>
          <div className="adm-fx-desc">{desc}</div>
        </div>
        <div className="adm-fx-opts">
          {opts.map((o) => (
            <button key={o} className={"adm-fx-opt" + (fx[optKey] === o ? " on" : "")} onClick={() => set(optKey, o)}>{o}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", margin: 0 }}>
        These settings apply live to every page. They&apos;re saved in your browser and loaded on each visit.
      </p>

      <div className="adm-fx-grid">
        <FxCard label="Card hover" desc="How cards respond when you hover over them."
          optKey="cardfx" opts={CARDFX_OPTS} />
        <FxCard label="Nav links" desc="The hover animation on navigation links."
          optKey="linkfx" opts={LINKFX_OPTS} />
        <FxCard label="Scroll reveal" desc="How cards animate in as you scroll down."
          optKey="scrollfx" opts={SCROLLFX_OPTS} />
        <FxCard label="Button feel" desc="The interaction style on primary buttons."
          optKey="btnfx" opts={BTNFX_OPTS} />
      </div>

      <div className="adm-fx-card" style={{ maxWidth: 480 }}>
        <div>
          <div className="adm-fx-label">Animation speed</div>
          <div className="adm-fx-desc">Scale factor — 1× is default, higher is slower.</div>
        </div>
        <div className="adm-fx-speed">
          <input type="range" min={0.25} max={2.5} step={0.25} value={fx.scale}
            onChange={(e) => set("scale", Number(e.target.value))} />
          <span>{fx.scale}×</span>
        </div>
      </div>

      <div>
        <button className="tt-btn tt-btn-ghost" onClick={() => onChange({ ...FX_DEFAULTS })}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main admin page                                                     */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [inv, setInv] = useState<InvProduct[]>([]);
  const [fx, setFxState] = useState<FxSettings>(FX_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  const [tab, setTab] = useState<"inventory" | "orders" | "sitefx">("inventory");
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [statusF, setStatusF] = useState<FilterStatus>("active");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [selected, setSelected] = useState<string[]>([]);
  const [density, setDensity] = useState("regular");
  const [showThumbs, setShowThumbs] = useState(true);
  const [threshold] = useState(LOW_STOCK_DEFAULT);
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id: string | null }>({ open: false, mode: "add", id: null });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setInv(loadInv());
    const savedFx = loadFx();
    setFxState(savedFx);
    applyFx(savedFx);
    setHydrated(true);
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, []);

  const commit = useCallback((list: InvProduct[], msg?: string) => {
    setInv(list);
    saveInv(list);
    if (msg) flash(msg);
  }, [flash]);

  const setFx = useCallback((next: FxSettings) => {
    setFxState(next);
    saveFx(next);
    applyFx(next);
  }, []);

  /* mutations */
  const setStock = (id: string, n: number) => commit(inv.map((p) => p.id === id ? { ...p, stock: Math.max(0, n) } : p));
  const setArchived = (id: string, val: boolean) => commit(inv.map((p) => p.id === id ? { ...p, archived: val } : p), val ? "Archived — hidden from shop" : "Restored to shop");
  const saveProduct = (prod: InvProduct, mode: DrawerMode) => {
    if (mode === "add") commit([prod, ...inv], `Added "${prod.name}"`);
    else commit(inv.map((p) => p.id === prod.id ? { ...prod } : p), "Saved changes");
    setDrawer({ open: false, mode: "add", id: null });
  };

  /* bulk */
  const bulk = (fn: (p: InvProduct) => InvProduct, msg: string) => commit(inv.map((p) => selected.includes(p.id) ? fn(p) : p), msg);
  const bulkRestock = () => bulk((p) => ({ ...p, stock: p.stock + 10 }), `Restocked ${selected.length} products +10`);
  const bulkZero = () => bulk((p) => ({ ...p, stock: 0 }), `Marked ${selected.length} out of stock`);
  const bulkArchive = () => { bulk((p) => ({ ...p, archived: true }), `Archived ${selected.length} products`); setSelected([]); };
  const bulkUnarchive = () => bulk((p) => ({ ...p, archived: false }), `Restored ${selected.length} products`);

  /* selection */
  const toggleSel = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  /* counts */
  const counts = useMemo(() => ({
    active: inv.filter((p) => !p.archived).length,
    low: inv.filter((p) => !p.archived && p.stock > 0 && p.stock <= threshold).length,
    out: inv.filter((p) => !p.archived && p.stock <= 0).length,
    archived: inv.filter((p) => !!p.archived).length,
    all: inv.length,
  }), [inv, threshold]);

  /* filtered rows */
  const rows = useMemo(() => {
    let list = inv.slice();
    if (statusF === "active") list = list.filter((p) => !p.archived);
    else if (statusF === "low") list = list.filter((p) => !p.archived && p.stock > 0 && p.stock <= threshold);
    else if (statusF === "out") list = list.filter((p) => !p.archived && p.stock <= 0);
    else if (statusF === "archived") list = list.filter((p) => !!p.archived);
    if (cat !== "all") list = list.filter((p) => p.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.blurb || "").toLowerCase().includes(q) || (p.tags || []).some((t) => t.includes(q)));
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sort.key === "price") return (a.price - b.price) * dir;
      if (sort.key === "stock") return (a.stock - b.stock) * dir;
      if (sort.key === "cat") return a.cat.localeCompare(b.cat) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
    return list;
  }, [inv, statusF, cat, query, sort, threshold]);

  const onSort = (key: SortKey) => setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "stock" || key === "price" ? "desc" : "asc" });

  const toggleAll = () => {
    const ids = rows.map((p) => p.id);
    const allOn = ids.every((id) => selected.includes(id));
    setSelected(allOn ? selected.filter((id) => !ids.includes(id)) : Array.from(new Set([...selected, ...ids])));
  };

  const editing = drawer.id ? inv.find((p) => p.id === drawer.id) ?? null : null;

  const chips = [
    { id: "active" as FilterStatus, label: "Active", n: counts.active },
    { id: "low" as FilterStatus, label: "Low stock", n: counts.low },
    { id: "out" as FilterStatus, label: "Out of stock", n: counts.out },
    { id: "archived" as FilterStatus, label: "Archived", n: counts.archived },
    { id: "all" as FilterStatus, label: "All", n: counts.all },
  ];

  if (!hydrated) return null;

  return (
    <>
      <AdmBar />

      <div className="adm-banner">
        <div className="tt-container adm-banner-inner">
          <span className="dot" />
          <span>&gt; internal tool</span>
          <span className="sep">·</span>
          <span className="muted">not linked from the public nav · edits save to this browser</span>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBottom: 40 }}>
        <div className="adm-head">
          <span className="eye">&gt; admin</span>
          <h1>The stockroom</h1>
        </div>

        <div className="adm-tabs">
          <button className={"adm-tab" + (tab === "inventory" ? " active" : "")} onClick={() => setTab("inventory")}>
            <Boxes size={16} /> Inventory <span className="adm-tab-count">{counts.all}</span>
          </button>
          <button className={"adm-tab" + (tab === "orders" ? " active" : "")} onClick={() => setTab("orders")}>
            <Receipt size={16} /> Orders
          </button>
          <button className={"adm-tab" + (tab === "sitefx" ? " active" : "")} onClick={() => setTab("sitefx")}>
            <Sliders size={16} /> Site FX
          </button>
        </div>

        {tab === "inventory" && (
          <>
            <Dashboard inv={inv} threshold={threshold} />

            <div className="adm-toolbar">
              <div className="grow adm-search">
                <Search size={15} />
                <input className="tt-input" placeholder="Search name, ID or tag…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select className="tt-select" style={{ width: "auto" }} value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="all">All categories</option>
                {TT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select className="tt-select" style={{ width: "auto" }} value={density} onChange={(e) => setDensity(e.target.value)}>
                <option value="compact">Compact</option>
                <option value="regular">Regular</option>
                <option value="comfy">Comfy</option>
              </select>
              <div className="adm-seg">
                <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}><Table2 size={14} /> Table</button>
                <button className={view === "cards" ? "on" : ""} onClick={() => setView("cards")}><LayoutGrid size={14} /> Cards</button>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={showThumbs} onChange={(e) => setShowThumbs(e.target.checked)} />
                Thumbs
              </label>
              <button className="tt-btn tt-btn-primary" onClick={() => setDrawer({ open: true, mode: "add", id: null })}>
                <Plus size={15} /> Add product
              </button>
            </div>

            <div className="adm-chips">
              {chips.map((c) => (
                <button key={c.id} className={"adm-chip" + (statusF === c.id ? " on" : "")} onClick={() => setStatusF(c.id)}>
                  {c.label} <span className="n">{c.n}</span>
                </button>
              ))}
            </div>

            {rows.length === 0 ? (
              <div className="adm-empty">
                <Package size={32} style={{ color: "var(--color-text-muted)", margin: "0 auto 14px" }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>Nothing matches</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
                  Try a different filter or{" "}
                  <button className="adm-link-btn" onClick={() => { setQuery(""); setCat("all"); setStatusF("active"); }}>clear filters</button>.
                </p>
              </div>
            ) : view === "table" ? (
              <TableView rows={rows} threshold={threshold} density={density} showThumbs={showThumbs}
                sort={sort} onSort={onSort} selected={selected} onToggle={toggleSel} onToggleAll={toggleAll}
                onStock={setStock} onEdit={(id) => setDrawer({ open: true, mode: "edit", id })} onArchive={setArchived} />
            ) : (
              <CardsView rows={rows} threshold={threshold} selected={selected} onToggle={toggleSel}
                onStock={setStock} onEdit={(id) => setDrawer({ open: true, mode: "edit", id })} onArchive={setArchived} />
            )}

            {selected.length > 0 && (
              <BulkBar count={selected.length}
                onRestock={bulkRestock} onZero={bulkZero}
                onArchive={bulkArchive} onUnarchive={bulkUnarchive}
                onClear={() => setSelected([])} />
            )}
          </>
        )}

        {tab === "orders" && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <Receipt size={36} style={{ color: "var(--color-text-muted)", margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, margin: "0 0 8px" }}>Orders coming soon</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)", margin: 0 }}>
              Order management will appear here once the checkout is wired up.
            </p>
          </div>
        )}

        {tab === "sitefx" && <SiteFxTab fx={fx} onChange={setFx} />}
      </div>

      <footer className="adm-foot">
        <div className="tt-container adm-foot-inner">
          <span>tommy tinkers NZ · admin · inventory v1</span>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="adm-link-btn" onClick={() => {
              if (!window.confirm("Reset inventory to the original product list? This clears your saved edits in this browser.")) return;
              const fresh = TT_PRODUCTS.map((p) => ({ ...p }));
              setInv(fresh);
              saveInv(fresh);
              setSelected([]);
              flash("Reset to default products");
            }}>↺ reset inventory</button>
            <button className="adm-link-btn" onClick={() => {
              const data = JSON.stringify(inv, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "inventory.json"; a.click();
              URL.revokeObjectURL(url);
            }}>↓ export JSON</button>
          </div>
        </div>
      </footer>

      <ProductDrawer open={drawer.open} mode={drawer.mode} product={editing}
        onClose={() => setDrawer({ open: false, mode: "add", id: null })} onSave={saveProduct} />

      {toast && <Toast msg={toast} />}

      <style>{`
        .adm-toolbar svg { pointer-events: none; }
        .adm-search { display: flex; align-items: center; position: relative; }
        .adm-search > svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--color-text-muted); }
        @media (max-width: 680px) {
          .adm-toolbar { flex-direction: column; align-items: stretch; }
          .adm-seg { align-self: flex-start; }
        }
        .adm-table-wrap:has(table) { overflow-x: auto; }
      `}</style>
    </>
  );
}
