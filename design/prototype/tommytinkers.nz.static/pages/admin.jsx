/* tommytinkers.nz · admin — inventory management (main page) */
const { useState: useAState, useEffect: useAEffect, useMemo: useAMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lowStockThreshold": 10,
  "density": "regular",
  "showThumbnails": true,
  "defaultView": "table",
  "showDashboard": true
}/*EDITMODE-END*/;

/* ---------- Admin top bar ---------- */
const AdmBar = () => {
  const [theme, setTheme] = useAState(window.ttThemeLoad());
  useAEffect(() => {
    const h = (e) => setTheme(e.detail);
    window.addEventListener("tt-theme-change", h);
    return () => window.removeEventListener("tt-theme-change", h);
  }, []);
  useAEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  const toggle = () => window.ttThemeApply(theme === "dark" ? "light" : "dark");
  return (
    <header className="adm-bar">
      <div className="tt-container adm-bar-inner">
        <div className="adm-brand">
          <img src="assets/logo.png" alt="" />
          <span className="adm-brand-text">tommy tinkers <span className="nz">NZ</span></span>
          <span className="adm-pill">admin</span>
        </div>
        <div className="adm-bar-actions">
          <button className="tt-icon-btn" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggle}>
            <i data-lucide={theme === "dark" ? "sun" : "moon"} style={{ width: 16, height: 16 }}></i>
          </button>
          <a className="adm-back" href="index.html"><i data-lucide="external-link" style={{ width: 14, height: 14 }}></i> View shop</a>
        </div>
      </div>
    </header>
  );
};

/* ---------- Dashboard ---------- */
const StatCard = ({ icon, val, lbl, tone }) => (
  <div className={"adm-stat" + (tone ? " " + tone : "")}>
    <span className="ico"><i data-lucide={icon} style={{ width: 16, height: 16 }}></i></span>
    <div className="val">{val}</div>
    <div className="lbl">{lbl}</div>
  </div>
);

const Dashboard = ({ inv, threshold }) => {
  const active = inv.filter((p) => !p.archived);
  const units = active.reduce((s, p) => s + p.stock, 0);
  const value = active.reduce((s, p) => s + p.price * p.stock, 0);
  const low = active.filter((p) => p.stock > 0 && p.stock <= threshold).length;
  const out = active.filter((p) => p.stock <= 0).length;
  const archived = inv.filter((p) => p.archived).length;
  const money = "NZ$" + value.toLocaleString("en-NZ", { maximumFractionDigits: 0 });
  return (
    <div className="adm-stats">
      <StatCard icon="package" val={active.length} lbl="Active products" />
      <StatCard icon="layers" val={units.toLocaleString("en-NZ")} lbl="Units on hand" />
      <StatCard icon="wallet" val={money} lbl="Stock value" tone="accent" />
      <StatCard icon="trending-down" val={low} lbl="Low stock" tone={low ? "warn" : null} />
      <StatCard icon="circle-slash" val={out} lbl="Out of stock" tone={out ? "err" : null} />
      <StatCard icon="archive" val={archived} lbl="Archived" />
    </div>
  );
};

/* ---------- Orders tab ---------- */
const ORDER_FLOW = ["new", "packing", "posted", "refunded"];
const OrdersPanel = ({ orders, inv, onStatus }) => {
  const byId = Object.fromEntries(inv.map((p) => [p.id, p]));
  useAEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  const total = (o) => o.items.reduce((s, it) => {
    const p = byId[it.id] || (window.TT_PRODUCTS.find((x) => x.id === it.id));
    return s + (p ? p.price * it.qty : 0);
  }, 0);
  const toPost = orders.filter((o) => o.status === "new" || o.status === "packing").length;
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
        {orders.length} recent orders · <span style={{ color: "var(--color-warm-orange-deep)" }}>{toPost} awaiting post</span>
      </p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th style={{ width: 150 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-primary)" }}>#{o.id}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{o.date}</div>
                </td>
                <td>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>{o.customer}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{o.suburb}</div>
                </td>
                <td>
                  <div className="adm-orderitems">
                    {o.items.map((it, i) => {
                      const p = byId[it.id] || window.TT_PRODUCTS.find((x) => x.id === it.id);
                      return <div className="li" key={i}><b>{it.qty}×</b> {p ? p.name : it.id}</div>;
                    })}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}><span className="adm-num">NZ${total(o).toFixed(2)}</span></td>
                <td>
                  <select className="tt-select" value={o.status} onChange={(e) => onStatus(o.id, e.target.value)}
                    style={{ padding: "6px 10px", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                    {ORDER_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN
   ============================================================ */
const AdminPage = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const threshold = t.lowStockThreshold;

  const [inv, setInv] = useAState(window.ttInvLoad());
  const [orders, setOrders] = useAState(window.ttOrdersLoad());
  const [tab, setTab] = useAState("inventory");

  const [view, setView] = useAState(t.defaultView);
  const [query, setQuery] = useAState("");
  const [cat, setCat] = useAState("all");
  const [statusF, setStatusF] = useAState("active");
  const [sort, setSort] = useAState({ key: "name", dir: "asc" });
  const [selected, setSelected] = useAState([]);

  const [drawer, setDrawer] = useAState({ open: false, mode: "add", id: null });
  const [toast, setToast] = useAState(null);

  /* keep view in sync if the default-view tweak changes */
  useAEffect(() => { setView(t.defaultView); }, [t.defaultView]);

  const flash = (msg) => { setToast(msg); clearTimeout(window.__admToast); window.__admToast = setTimeout(() => setToast(null), 2200); };

  const commit = (list, msg) => { setInv(list); window.ttInvSave(list); if (msg) flash(msg); };
  const commitOrders = (list, msg) => { setOrders(list); window.ttOrdersSave(list); if (msg) flash(msg); };

  /* ----- mutations ----- */
  const setStock = (id, n) => commit(inv.map((p) => p.id === id ? { ...p, stock: Math.max(0, n), updated: Date.now() } : p));
  const setArchived = (id, val) => commit(inv.map((p) => p.id === id ? { ...p, archived: val } : p), val ? "Archived — hidden from shop" : "Restored to shop");
  const saveProduct = (prod, mode) => {
    if (mode === "add") { commit([prod, ...inv], `Added “${prod.name}”`); }
    else { commit(inv.map((p) => p.id === prod.id ? { ...prod } : p), "Saved changes"); }
    setDrawer({ open: false, mode: "add", id: null });
  };

  /* ----- bulk ----- */
  const bulk = (fn, msg) => { commit(inv.map((p) => selected.includes(p.id) ? fn(p) : p), msg); };
  const bulkRestock = () => bulk((p) => ({ ...p, stock: p.stock + 10, updated: Date.now() }), `Restocked ${selected.length} products +10`);
  const bulkZero = () => bulk((p) => ({ ...p, stock: 0, updated: Date.now() }), `Marked ${selected.length} out of stock`);
  const bulkArchive = () => { bulk((p) => ({ ...p, archived: true }), `Archived ${selected.length} products`); setSelected([]); };
  const bulkUnarchive = () => bulk((p) => ({ ...p, archived: false }), `Restored ${selected.length} products`);

  /* ----- selection ----- */
  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  /* ----- filter + sort ----- */
  const counts = useAMemo(() => ({
    active: inv.filter((p) => !p.archived).length,
    low: inv.filter((p) => !p.archived && p.stock > 0 && p.stock <= threshold).length,
    out: inv.filter((p) => !p.archived && p.stock <= 0).length,
    archived: inv.filter((p) => p.archived).length,
    all: inv.length,
  }), [inv, threshold]);

  const rows = useAMemo(() => {
    let list = inv.slice();
    if (statusF === "active") list = list.filter((p) => !p.archived);
    else if (statusF === "low") list = list.filter((p) => !p.archived && p.stock > 0 && p.stock <= threshold);
    else if (statusF === "out") list = list.filter((p) => !p.archived && p.stock <= 0);
    else if (statusF === "archived") list = list.filter((p) => p.archived);
    if (cat !== "all") list = list.filter((p) => p.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
        (p.blurb || "").toLowerCase().includes(q) || (p.tags || []).some((tg) => tg.includes(q)));
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sort.key) {
        case "price": return (a.price - b.price) * dir;
        case "stock": return (a.stock - b.stock) * dir;
        case "cat":   return a.cat.localeCompare(b.cat) * dir;
        default:      return a.name.localeCompare(b.name) * dir;
      }
    });
    return list;
  }, [inv, statusF, cat, query, sort, threshold]);

  const onSort = (key) => setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "stock" || key === "price" ? "desc" : "asc" });
  const toggleAll = () => {
    const ids = rows.map((p) => p.id);
    const allOn = ids.every((id) => selected.includes(id));
    setSelected(allOn ? selected.filter((id) => !ids.includes(id)) : Array.from(new Set([...selected, ...ids])));
  };

  const resetData = () => {
    if (!window.confirm("Reset all inventory and orders to the original sample data? This clears your saved edits in this browser.")) return;
    setInv(window.ttInvReset());
    setOrders(window.ttOrdersReset());
    setSelected([]);
    flash("Reset to sample data");
  };

  const editing = drawer.id ? inv.find((p) => p.id === drawer.id) : null;
  const cats = window.TT_CATEGORIES;
  const chips = [
    { id: "active", label: "Active", n: counts.active },
    { id: "low", label: "Low stock", n: counts.low },
    { id: "out", label: "Out of stock", n: counts.out },
    { id: "archived", label: "Archived", n: counts.archived },
    { id: "all", label: "All", n: counts.all },
  ];

  useAEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  return (
    <>
      <AdmBar />
      <div className="adm-banner">
        <div className="tt-container adm-banner-inner">
          <span className="dot"></span>
          <span>&gt; internal tool</span>
          <span className="sep">·</span>
          <span className="muted">not linked from the public nav · edits save to this browser</span>
        </div>
      </div>

      <main className="tt-container" style={{ paddingBottom: 40 }}>
        <div className="adm-head">
          <span className="eye">&gt; inventory</span>
          <h1>The stockroom</h1>
        </div>

        <div className="adm-tabs">
          <button className={"adm-tab" + (tab === "inventory" ? " active" : "")} onClick={() => setTab("inventory")}>
            <i data-lucide="boxes" style={{ width: 16, height: 16 }}></i> Inventory <span className="adm-tab-count">{counts.all}</span>
          </button>
          <button className={"adm-tab" + (tab === "orders" ? " active" : "")} onClick={() => setTab("orders")}>
            <i data-lucide="receipt" style={{ width: 16, height: 16 }}></i> Orders <span className="adm-tab-count">{orders.length}</span>
          </button>
        </div>

        {tab === "inventory" ? (
          <>
            {t.showDashboard && <Dashboard inv={inv} threshold={threshold} />}

            <div className="adm-toolbar">
              <div className="grow adm-search">
                <i data-lucide="search" style={{ width: 15, height: 15 }}></i>
                <input className="tt-input" placeholder="Search name, SKU or tag…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select className="tt-select" style={{ width: "auto" }} value={cat} onChange={(e) => setCat(e.target.value)}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.id === "all" ? "All categories" : c.label}</option>)}
              </select>
              <div className="adm-seg" role="group" aria-label="View">
                <button className={view === "table" ? "on" : ""} onClick={() => setView("table")} aria-pressed={view === "table"}>
                  <i data-lucide="table-2" style={{ width: 14, height: 14 }}></i> Table
                </button>
                <button className={view === "cards" ? "on" : ""} onClick={() => setView("cards")} aria-pressed={view === "cards"}>
                  <i data-lucide="layout-grid" style={{ width: 14, height: 14 }}></i> Cards
                </button>
              </div>
              <button className="tt-btn tt-btn-primary" onClick={() => setDrawer({ open: true, mode: "add", id: null })}>
                <i data-lucide="plus" style={{ width: 15, height: 15 }}></i> Add product
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
                <i data-lucide="package-search" style={{ width: 32, height: 32, color: "var(--color-text-muted)" }}></i>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, margin: "14px 0 6px" }}>Nothing matches</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
                  Try a different filter, or <button className="adm-link-btn" onClick={() => { setQuery(""); setCat("all"); setStatusF("active"); }}>clear filters</button>.
                </p>
              </div>
            ) : view === "table" ? (
              <AdmTable
                rows={rows} threshold={threshold} density={t.density} showThumbs={t.showThumbnails}
                sort={sort} onSort={onSort}
                selected={selected} onToggle={toggleSel} onToggleAll={toggleAll}
                onStock={setStock} onEdit={(id) => setDrawer({ open: true, mode: "edit", id })} onArchive={setArchived}
              />
            ) : (
              <AdmCards
                rows={rows} threshold={threshold}
                selected={selected} onToggle={toggleSel}
                onStock={setStock} onEdit={(id) => setDrawer({ open: true, mode: "edit", id })} onArchive={setArchived}
              />
            )}

            {selected.length > 0 && (
              <AdmBulkBar
                count={selected.length}
                onRestock={bulkRestock} onZero={bulkZero}
                onArchive={bulkArchive} onUnarchive={bulkUnarchive}
                onClear={() => setSelected([])}
              />
            )}
          </>
        ) : (
          <OrdersPanel orders={orders} inv={inv} onStatus={(id, status) => commitOrders(orders.map((o) => o.id === id ? { ...o, status } : o), "Order #" + id + " → " + status)} />
        )}
      </main>

      <footer className="adm-foot">
        <div className="tt-container adm-foot-inner">
          <span>tommy tinkers NZ · admin · inventory v1</span>
          <button className="adm-link-btn" onClick={resetData}>↺ reset to sample data</button>
        </div>
      </footer>

      <AdmDrawer
        open={drawer.open} mode={drawer.mode} product={editing}
        onClose={() => setDrawer({ open: false, mode: "add", id: null })}
        onSave={saveProduct}
      />

      {toast && <div className="adm-toast"><span className="dot"></span>{toast}</div>}

      <TweaksPanel>
        <TweakSection label="Stock rules" />
        <TweakSlider label="Low-stock threshold" value={t.lowStockThreshold} min={1} max={30} unit=" units"
          onChange={(v) => setTweak("lowStockThreshold", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Default view" value={t.defaultView} options={["table", "cards"]}
          onChange={(v) => setTweak("defaultView", v)} />
        <TweakRadio label="Row density" value={t.density} options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Thumbnails in table" value={t.showThumbnails}
          onChange={(v) => setTweak("showThumbnails", v)} />
        <TweakToggle label="Show dashboard" value={t.showDashboard}
          onChange={(v) => setTweak("showDashboard", v)} />
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<AdminPage />);
