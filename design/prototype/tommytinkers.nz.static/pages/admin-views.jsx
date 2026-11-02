/* tommytinkers.nz · admin — product list views (table + cards) + shared bits */
const { useState: useVState, useEffect: useVEffect } = React;

/* ---------- Stock status helper ---------- */
window.ttStockStatus = (p, threshold) => {
  if (p.archived) return "arch";
  if (p.stock <= 0) return "out";
  if (p.stock <= threshold) return "low";
  return "ok";
};
const STATUS_LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock", arch: "Archived" };

/* ---------- Checkbox ---------- */
const AdmCheck = ({ on, indeterminate, onChange, label }) => (
  <button
    className={"adm-check" + (on ? " on" : "")}
    role="checkbox"
    aria-checked={indeterminate ? "mixed" : on}
    aria-label={label || "Select"}
    onClick={(e) => { e.stopPropagation(); onChange(!on); }}
  >
    {indeterminate
      ? <i data-lucide="minus" style={{ width: 12, height: 12 }}></i>
      : on && <i data-lucide="check" style={{ width: 12, height: 12 }}></i>}
  </button>
);

/* ---------- Status badge ---------- */
const AdmBadge = ({ kind, children }) => (
  <span className={"adm-badge " + kind}><span className="dot"></span>{children}</span>
);
const StockBadge = ({ p, threshold }) => {
  const s = window.ttStockStatus(p, threshold);
  return <AdmBadge kind={s}>{s === "ok" ? `${p.stock} in stock` : STATUS_LABEL[s]}</AdmBadge>;
};

/* ---------- Stock stepper ---------- */
const AdmStepper = ({ value, onSet }) => {
  const [draft, setDraft] = useVState(String(value));
  useVEffect(() => { setDraft(String(value)); }, [value]);
  const commit = () => {
    const n = Math.max(0, Math.round(+draft || 0));
    onSet(n); setDraft(String(n));
  };
  return (
    <div className="adm-stepper" onClick={(e) => e.stopPropagation()}>
      <button aria-label="Decrease stock" onClick={() => onSet(Math.max(0, value - 1))}>
        <i data-lucide="minus" style={{ width: 13, height: 13 }}></i>
      </button>
      <input
        type="number" value={draft} aria-label="Stock count"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      />
      <button aria-label="Increase stock" onClick={() => onSet(value + 1)}>
        <i data-lucide="plus" style={{ width: 13, height: 13 }}></i>
      </button>
    </div>
  );
};

/* ---------- Gradient thumb (small) ---------- */
const AdmThumb = ({ p, size = 40 }) => {
  const s = p.swatch || ["#fcd34d", "#fb923c"];
  return (
    <div style={{
      width: size, height: size, borderRadius: 9, flex: "0 0 auto",
      background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1] || s[0]} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 28% 28%, rgba(255,255,255,0.5) 0%, transparent 55%)" }} />
    </div>
  );
};

/* ============================================================
   TABLE VIEW
   ============================================================ */
const AdmTable = ({ rows, threshold, density, showThumbs, sort, onSort, selected, onToggle, onToggleAll, onStock, onEdit, onArchive }) => {
  const allOn = rows.length > 0 && rows.every((p) => selected.includes(p.id));
  const someOn = rows.some((p) => selected.includes(p.id));

  const Th = ({ id, children, align }) => (
    <th className="sortable" style={align ? { textAlign: align } : null} onClick={() => onSort(id)}>
      {children}
      {sort.key === id && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );

  return (
    <div className="adm-table-wrap" data-density={density}>
      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
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
              <tr key={p.id} className={(p.archived ? "archived " : "") + (sel ? "selected" : "")} onClick={() => onEdit(p.id)} style={{ cursor: "pointer" }}>
                <td onClick={(e) => e.stopPropagation()}>
                  <AdmCheck on={sel} onChange={() => onToggle(p.id)} label={"Select " + p.name} />
                </td>
                <td>
                  <div className="adm-prodcell">
                    {showThumbs && <AdmThumb p={p} size={density === "compact" ? 32 : 40} />}
                    <div className="meta">
                      <div className="nm">{p.name}</div>
                      <div className="sku">{p.sku}</div>
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
                    <button className="adm-iconbtn" aria-label="Edit" title="Edit details" onClick={() => onEdit(p.id)}>
                      <i data-lucide="pencil" style={{ width: 15, height: 15 }}></i>
                    </button>
                    <button className="adm-iconbtn" aria-label={p.archived ? "Unarchive" : "Archive"} title={p.archived ? "Restore to shop" : "Hide from shop"} onClick={() => onArchive(p.id, !p.archived)}>
                      <i data-lucide={p.archived ? "archive-restore" : "archive"} style={{ width: 15, height: 15 }}></i>
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
};

/* ============================================================
   CARD VIEW
   ============================================================ */
const AdmCards = ({ rows, threshold, selected, onToggle, onStock, onEdit, onArchive }) => (
  <div className="adm-cards">
    {rows.map((p) => {
      const sel = selected.includes(p.id);
      const s = p.swatch || ["#fcd34d", "#fb923c"];
      return (
        <article key={p.id} className={"adm-pcard" + (p.archived ? " archived" : "") + (sel ? " selected" : "")}>
          <div className="adm-pcard-top" style={{ background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1] || s[0]} 100%)` }}>
            <div className="ptn"></div>
            <div style={{ position: "relative" }}>
              <AdmCheck on={sel} onChange={() => onToggle(p.id)} label={"Select " + p.name} />
            </div>
            <div style={{ position: "relative" }}>
              <StockBadge p={p} threshold={threshold} />
            </div>
          </div>
          <div className="adm-pcard-body">
            <div>
              <div className="adm-pcard-row" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.3 }}>{p.name}</h3>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 3 }}>{p.sku} · {p.cat.replace("-", " ")}</div>
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>NZ${p.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="adm-pcard-row" style={{ marginTop: "auto" }}>
              <AdmStepper value={p.stock} onSet={(n) => onStock(p.id, n)} />
              <div className="adm-rowact">
                <button className="adm-iconbtn" aria-label="Edit" title="Edit details" onClick={() => onEdit(p.id)}>
                  <i data-lucide="pencil" style={{ width: 15, height: 15 }}></i>
                </button>
                <button className="adm-iconbtn" aria-label={p.archived ? "Unarchive" : "Archive"} title={p.archived ? "Restore to shop" : "Hide from shop"} onClick={() => onArchive(p.id, !p.archived)}>
                  <i data-lucide={p.archived ? "archive-restore" : "archive"} style={{ width: 15, height: 15 }}></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

Object.assign(window, { AdmCheck, AdmBadge, StockBadge, AdmStepper, AdmThumb, AdmTable, AdmCards });
