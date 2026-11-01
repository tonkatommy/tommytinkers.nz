/* tommytinkers.nz · admin — edit/add product drawer + bulk action bar */
const { useState: useDState, useEffect: useDEffect } = React;

const SWATCHES = [
  ["#4caf2e", "#1a1816"], ["#fb923c", "#fcd34d"], ["#f97316", "#1a1816"],
  ["#fcd34d", "#fb923c"], ["#1a1816", "#4caf2e"], ["#1a1816", "#f97316"],
  ["#fcd34d", "#4caf2e"], ["#fb923c", "#1a1816"],
];

const blankProduct = () => ({
  id: "", sku: "", name: "", cat: "stickers", price: 10, cost: 4, stock: 10,
  blurb: "", tags: [], swatch: SWATCHES[1], featured: false, archived: false,
});

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "item";

const AdmDrawer = ({ open, mode, product, onClose, onSave }) => {
  const [f, setF] = useDState(blankProduct());
  const [tagText, setTagText] = useDState("");

  useDEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      setF({ ...product });
      setTagText((product.tags || []).join(", "));
    } else {
      const b = blankProduct();
      setF(b);
      setTagText("");
    }
  }, [open, mode, product]);

  useDEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [open, f.swatch, f.featured]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cats = window.TT_CATEGORIES.filter((c) => c.id !== "all");

  const save = () => {
    const tags = tagText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const name = f.name.trim() || "Untitled item";
    let id = f.id;
    if (mode === "add") id = slugify(f.cat.split("-")[0] + "-" + name).slice(0, 28) + "-" + Math.random().toString(36).slice(2, 5);
    const clean = {
      ...f, id, name, tags,
      sku: mode === "add" ? window.ttSku(id) : f.sku,
      price: Math.max(0, +f.price || 0),
      cost: Math.max(0, +f.cost || 0),
      stock: Math.max(0, Math.round(+f.stock || 0)),
    };
    onSave(clean, mode);
  };

  const margin = f.price > 0 ? Math.round(((f.price - f.cost) / f.price) * 100) : 0;

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
          <button className="tt-icon-btn" onClick={onClose} aria-label="Close">
            <i data-lucide="x" style={{ width: 16, height: 16 }}></i>
          </button>
        </div>

        <div className="tt-drawer-body">
          <div className="adm-form">
            <div>
              <label className="tt-field-label">Product name</label>
              <input className="tt-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sliding cable hook (×4)" />
            </div>

            <div className="pair">
              <div>
                <label className="tt-field-label">Category</label>
                <select className="tt-select" value={f.cat} onChange={(e) => set("cat", e.target.value)}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="tt-field-label">SKU</label>
                <input className="tt-input" value={mode === "add" ? "auto-generated" : f.sku} disabled style={{ opacity: 0.6, fontFamily: "var(--font-mono)", fontSize: 12 }} />
              </div>
            </div>

            <div className="pair">
              <div>
                <label className="tt-field-label">Price (NZ$)</label>
                <input className="tt-input" type="number" min="0" step="0.5" value={f.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div>
                <label className="tt-field-label">Unit cost (NZ$)</label>
                <input className="tt-input" type="number" min="0" step="0.5" value={f.cost} onChange={(e) => set("cost", e.target.value)} />
              </div>
            </div>
            <p className="adm-help">Margin: {margin}% · NZ${(f.price - f.cost).toFixed(2)} per unit</p>

            <div>
              <label className="tt-field-label">Stock on hand</label>
              <input className="tt-input" type="number" min="0" step="1" value={f.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>

            <div>
              <label className="tt-field-label">Blurb</label>
              <textarea className="tt-textarea" value={f.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder="Short description shown on the shop card." />
            </div>

            <div>
              <label className="tt-field-label">Tags (comma separated)</label>
              <input className="tt-input" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="petg, set, outdoor" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
            </div>

            <div>
              <label className="tt-field-label">Swatch</label>
              <div className="swatch-row">
                {SWATCHES.map((sw, i) => (
                  <button
                    key={i}
                    className={"adm-swatch" + (f.swatch[0] === sw[0] && f.swatch[1] === sw[1] ? " on" : "")}
                    style={{ background: `linear-gradient(135deg, ${sw[0]} 0%, ${sw[1]} 100%)` }}
                    aria-label={"Swatch " + (i + 1)}
                    onClick={() => set("swatch", sw)}
                  />
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
            <i data-lucide={mode === "add" ? "plus" : "check"} style={{ width: 15, height: 15 }}></i>
            {mode === "add" ? "Add product" : "Save changes"}
          </button>
        </div>
      </aside>
    </>
  );
};

/* ---------- Bulk action bar ---------- */
const AdmBulkBar = ({ count, onRestock, onZero, onArchive, onUnarchive, onClear }) => {
  useDEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [count]);
  return (
    <div className="adm-bulk">
      <span className="cnt">{count} selected</span>
      <div className="spacer"></div>
      <button className="adm-bulk-btn" onClick={onRestock}><i data-lucide="plus" style={{ width: 14, height: 14 }}></i> Restock +10</button>
      <button className="adm-bulk-btn warn" onClick={onZero}><i data-lucide="circle-slash" style={{ width: 14, height: 14 }}></i> Mark out (0)</button>
      <button className="adm-bulk-btn" onClick={onArchive}><i data-lucide="archive" style={{ width: 14, height: 14 }}></i> Archive</button>
      <button className="adm-bulk-btn" onClick={onUnarchive}><i data-lucide="archive-restore" style={{ width: 14, height: 14 }}></i> Restore</button>
      <button className="x" onClick={onClear} aria-label="Clear selection"><i data-lucide="x" style={{ width: 16, height: 16 }}></i></button>
    </div>
  );
};

Object.assign(window, { AdmDrawer, AdmBulkBar });
