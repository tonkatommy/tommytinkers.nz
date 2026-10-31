/* tommytinkers.nz · Shop page */
const { useState: useSState, useEffect: useSEffect, useMemo: useSMemo } = React;

const ShopHero = ({ activeCat }) => {
  const cats = window.TT_CATEGORIES;
  const cat = cats.find((c) => c.id === activeCat) || cats[0];
  const titleMap = {
    "all": "The full bench",
    "stickers": "Stickers & decals",
    "rc-parts": "RC car parts",
    "toys": "Kids' toys",
    "household": "Household solutions",
  };
  const subMap = {
    "all": "Everything currently in stock. Made in Helensville, posted NZ-wide. Tracked shipping, free over $60.",
    "stickers": "Vinyl, weather-proof, cut to order. Custom designs welcome.",
    "rc-parts": "1/10 scale PETG and PLA parts. Have a STL? Send it.",
    "toys": "Articulated, modular, sturdy. Tested by a five-year-old.",
    "household": "Hooks, organisers, docks. The bits that make a corner work.",
  };
  return (
    <section style={{ background: "var(--gradient-brand)", color: "#1A1816", padding: "56px 0 48px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,24,22,0.16) 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.3 }} />
      <div className="tt-container" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#1A1816", opacity: 0.75 }}>&gt; made-things / {cat.id}</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(36px, 4.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "8px 0 12px", color: "#1A1816" }}>
            {titleMap[activeCat] || titleMap.all}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.65, maxWidth: 560, margin: 0, color: "#1A1816", opacity: 0.85 }}>
            {subMap[activeCat] || subMap.all}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Stat n="3" lbl="working days" />
          <Stat n="NZ$60" lbl="free shipping" />
          <Stat n="100%" lbl="NZ made" />
        </div>
      </div>
    </section>
  );
};

const Stat = ({ n, lbl }) => (
  <div style={{ background: "rgba(26,24,22,0.08)", border: "1px solid rgba(26,24,22,0.15)", borderRadius: 12, padding: "10px 18px", backdropFilter: "blur(4px)" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#1A1816", lineHeight: 1 }}>{n}</div>
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1A1816", opacity: 0.75, marginTop: 4 }}>{lbl}</div>
  </div>
);

/* ---------- Sidebar ---------- */
const Sidebar = ({ activeCat, onCat, sort, onSort, query, onQuery, priceMax, onPriceMax, tags, onToggleTag, activeTags }) => {
  const cats = window.TT_CATEGORIES;
  return (
    <aside style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 28, alignSelf: "start" }}>
      <div>
        <label htmlFor="q" className="tt-field-label" style={{ marginBottom: 8 }}>Search</label>
        <div style={{ position: "relative" }}>
          <i data-lucide="search" style={{ width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}></i>
          <input id="q" className="tt-input" placeholder="Try ‘sticker’ or ‘hook’" value={query} onChange={(e) => onQuery(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
      </div>
      <div>
        <div className="tt-field-label" style={{ marginBottom: 10 }}>Category</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {cats.map((c) => (
            <li key={c.id}>
              <button onClick={() => onCat(c.id)} style={catBtn(activeCat === c.id)}>
                <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                  <i data-lucide={c.icon} style={{ width: 14, height: 14 }}></i> {c.label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                  {c.id === "all" ? window.TT_PRODUCTS.length : window.TT_PRODUCTS.filter((p) => p.cat === c.id).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="tt-field-label" style={{ marginBottom: 10 }}>Max price</div>
        <input type="range" min="5" max="50" step="1" value={priceMax} onChange={(e) => onPriceMax(+e.target.value)}
          style={{ width: "100%", accentColor: "var(--color-accent)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
          <span>NZ$5</span><span style={{ color: "var(--color-text-primary)" }}>NZ${priceMax}</span><span>NZ$50</span>
        </div>
      </div>
      <div>
        <div className="tt-field-label" style={{ marginBottom: 10 }}>Material / tag</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((t) => (
            <button key={t} onClick={() => onToggleTag(t)} style={tagBtn(activeTags.includes(t))}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="sort" className="tt-field-label" style={{ marginBottom: 8 }}>Sort by</label>
        <select id="sort" className="tt-select" value={sort} onChange={(e) => onSort(e.target.value)}>
          <option value="featured">Featured first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name (A-Z)</option>
          <option value="stock">In stock first</option>
        </select>
      </div>
    </aside>
  );
};

const catBtn = (active) => ({
  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
  background: active ? "var(--color-accent-subtle)" : "transparent",
  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: active ? 600 : 400,
  borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent",
  transition: "all 150ms ease",
});

const tagBtn = (active) => ({
  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
  padding: "5px 11px", borderRadius: 999,
  background: active ? "var(--color-accent)" : "transparent",
  color: active ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
  border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
  cursor: "pointer", letterSpacing: "0.05em", textTransform: "lowercase",
});

/* ---------- Product card ---------- */
const ProductCard = ({ p, added, onAdd }) => {
  const s = p.swatch || ["#fcd34d", "#fb923c"];
  const low = p.stock <= 10;
  return (
    <article className="tt-card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
      <div style={{
        aspectRatio: "4 / 3", width: "100%",
        background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1] || s[0]} 100%)`,
        borderTopLeftRadius: "var(--radius-xl)", borderTopRightRadius: "var(--radius-xl)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)" }}/>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", color: "#1A1816", opacity: 0.6, textTransform: "uppercase", position: "relative" }}>
          {p.cat.replace("-", " ")}
        </span>
        {p.featured && (
          <span style={{ position: "absolute", top: 12, left: 12, background: "#1A1816", color: "#FCD34D", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", padding: "4px 8px", borderRadius: 4, textTransform: "uppercase" }}>★ pick</span>
        )}
        {low && (
          <span style={{ position: "absolute", top: 12, right: 12, background: "var(--color-bg-base)", color: "var(--color-warm-orange-deep)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", padding: "4px 8px", borderRadius: 4 }}>{p.stock} left</span>
        )}
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {p.tags.slice(0, 2).map((t) => <span key={t} className="tt-tag">{t}</span>)}
        </div>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, margin: 0, marginBottom: 6, lineHeight: 1.3, color: "var(--color-text-primary)" }}>{p.name}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0, marginBottom: 16, textWrap: "pretty", flex: 1 }}>{p.blurb}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, color: "var(--color-text-primary)" }}>NZ${p.price.toFixed(2)}</span>
          <button className={"tt-btn " + (added ? "tt-btn-ghost" : "tt-btn-primary")} style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => onAdd(p)}>
            {added
              ? <><i data-lucide="check" style={{ width: 13, height: 13 }}></i> Added</>
              : <><i data-lucide="plus" style={{ width: 13, height: 13 }}></i> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
};

/* ---------- Shop root ---------- */
const ShopPage = () => {
  const params = new URLSearchParams(window.location.search);
  const initCat = window.TT_CATEGORIES.find((c) => c.id === params.get("cat")) ? params.get("cat") : "all";

  const [cat, setCat] = useSState(initCat);
  const [sort, setSort] = useSState("featured");
  const [query, setQuery] = useSState("");
  const [priceMax, setPriceMax] = useSState(50);
  const [activeTags, setActiveTags] = useSState([]);
  const [added, setAdded] = useSState(null);

  const allTags = useSMemo(() => Array.from(new Set(window.TT_PRODUCTS.flatMap((p) => p.tags))).sort(), []);
  const toggleTag = (t) => setActiveTags((ts) => ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]);

  const filtered = useSMemo(() => {
    let list = window.TT_PRODUCTS.slice();
    if (cat !== "all") list = list.filter((p) => p.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
    }
    list = list.filter((p) => p.price <= priceMax);
    if (activeTags.length) list = list.filter((p) => activeTags.every((t) => p.tags.includes(t)));
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "stock": list.sort((a, b) => b.stock - a.stock); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [cat, sort, query, priceMax, activeTags]);

  const onAdd = (p) => {
    window.ttCartAdd(p.id, 1);
    setAdded(p.id);
    window.ttCartOpen();
    setTimeout(() => setAdded(null), 1800);
  };

  useSEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  useSEffect(() => {
    const url = new URL(window.location);
    if (cat === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", cat);
    window.history.replaceState({}, "", url);
  }, [cat]);

  return (
    <>
      <TTNav active="shop" />
      <main>
        <ShopHero activeCat={cat} />
        <section style={{ padding: "48px 0 96px" }}>
          <div className="tt-container" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "start" }}>
            <Sidebar
              activeCat={cat} onCat={setCat}
              sort={sort} onSort={setSort}
              query={query} onQuery={setQuery}
              priceMax={priceMax} onPriceMax={setPriceMax}
              tags={allTags} activeTags={activeTags} onToggleTag={toggleTag}
            />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
                  {filtered.length} {filtered.length === 1 ? "result" : "results"}
                </span>
                {(query || activeTags.length > 0 || priceMax < 50 || cat !== "all") && (
                  <button onClick={() => { setCat("all"); setQuery(""); setActiveTags([]); setPriceMax(50); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                    × clear filters
                  </button>
                )}
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--color-bg-surface)", border: "1px dashed var(--color-border-default)", borderRadius: 16 }}>
                  <i data-lucide="search-x" style={{ width: 32, height: 32, color: "var(--color-text-muted)" }}></i>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, margin: "14px 0 8px" }}>Nothing matches</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
                    Try clearing some filters, or <a href="index.html#contact">ask if I can make it</a>.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                  {filtered.map((p) => <ProductCard key={p.id} p={p} added={added === p.id} onAdd={onAdd} />)}
                </div>
              )}

              <div style={{ marginTop: 60, padding: "32px 28px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-mono)", letterSpacing: "0.05em" }}>&gt; can't find it?</span>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, margin: "4px 0 6px" }}>Custom orders welcome</h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", margin: 0, maxWidth: 460 }}>
                    Send a sketch, photo, or STL. I'll come back with a flat price and an honest turnaround.
                  </p>
                </div>
                <a className="tt-btn tt-btn-warm" href="index.html#contact">
                  <i data-lucide="send" style={{ width: 14, height: 14 }}></i> Request a custom build
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <TTFooter />
      <TTCartDrawer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<ShopPage />);
