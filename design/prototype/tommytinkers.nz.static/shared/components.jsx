/* tommytinkers.nz · shared nav, footer, cart store, drawer */

/* ---------- Theme ---------- */
window.TT_THEME_KEY = "tt-theme-v1";
window.ttThemeLoad = () => localStorage.getItem(window.TT_THEME_KEY) || "dark";
window.ttThemeApply = (t) => {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(window.TT_THEME_KEY, t);
  window.dispatchEvent(new CustomEvent("tt-theme-change", { detail: t }));
};
/* Apply persisted theme as early as possible (script tag runs in <body>; HTML default is dark so flash is minimal) */
window.ttThemeApply(window.ttThemeLoad());

/* ---------- Cart store (persisted in localStorage) ---------- */
window.TT_CART_KEY = "tt-cart-v1";

window.ttCartLoad = () => {
  try { return JSON.parse(localStorage.getItem(window.TT_CART_KEY)) || []; }
  catch (e) { return []; }
};
window.ttCartSave = (items) => {
  localStorage.setItem(window.TT_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("tt-cart-change", { detail: items }));
};
window.ttCartAdd = (productId, qty = 1) => {
  const items = window.ttCartLoad();
  const existing = items.find((i) => i.id === productId);
  if (existing) existing.qty += qty;
  else items.push({ id: productId, qty });
  window.ttCartSave(items);
};
window.ttCartSetQty = (productId, qty) => {
  let items = window.ttCartLoad();
  if (qty <= 0) items = items.filter((i) => i.id !== productId);
  else {
    const existing = items.find((i) => i.id === productId);
    if (existing) existing.qty = qty;
  }
  window.ttCartSave(items);
};
window.ttCartCount = () => window.ttCartLoad().reduce((s, i) => s + i.qty, 0);
window.ttCartOpen = () => window.dispatchEvent(new CustomEvent("tt-cart-open"));

const { useState: useTTState, useEffect: useTTEffect } = React;

/* ---------- Shared Nav ---------- */
const TTNav = ({ active }) => {
  const [count, setCount] = useTTState(window.ttCartCount());
  const [open, setOpen] = useTTState(false);
  const [theme, setTheme] = useTTState(window.ttThemeLoad());
  useTTEffect(() => {
    const h = () => setCount(window.ttCartCount());
    window.addEventListener("tt-cart-change", h);
    return () => window.removeEventListener("tt-cart-change", h);
  }, []);
  useTTEffect(() => {
    const h = (e) => setTheme(e.detail);
    window.addEventListener("tt-theme-change", h);
    return () => window.removeEventListener("tt-theme-change", h);
  }, []);
  useTTEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const toggleTheme = () => window.ttThemeApply(theme === "dark" ? "light" : "dark");

  const links = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "codebench", label: "Codebench", href: "codebench.html" },
    { id: "shop", label: "Made Things", href: "shop.html" },
    { id: "shed", label: "The Shed", href: "shed.html" },
  ];

  return (
    <nav className="tt-nav">
      <div className="tt-container tt-nav-inner">
        <a className="tt-brand" href="index.html">
          <img src="assets/logo.png" alt="" />
          <span className="tt-brand-text">tommy tinkers <span className="nz">NZ</span></span>
        </a>
        <div className="tt-nav-links">
          {links.map((l) => (
            <a key={l.id} href={l.href} className={"tt-nav-link" + (active === l.id ? " active" : "")}>{l.label}</a>
          ))}
        </div>
        <div className="tt-nav-actions">
          <button className="tt-icon-btn" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>
            <i data-lucide={theme === "dark" ? "sun" : "moon"} style={{ width: 16, height: 16 }}></i>
          </button>
          <button className="tt-icon-btn" aria-label="Open cart" onClick={() => window.ttCartOpen()}>
            <i data-lucide="shopping-bag" style={{ width: 16, height: 16 }}></i>
            {count > 0 && <span className="tt-cart-badge">{count}</span>}
          </button>
          <a className="tt-cta-pill tt-desktop-only" href="shed.html#workshop">
            Sign in <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
          </a>
          <button className="tt-icon-btn" aria-label="Open menu" style={{ display: "none" }}
            onClick={() => setOpen(true)}>
            <i data-lucide="menu" style={{ width: 16, height: 16 }}></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ---------- Shared Footer ---------- */
const TTFooter = () => {
  useTTEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <footer className="tt-footer">
      <div className="tt-container">
        <div className="tt-footer-grid">
          <div>
            <div className="tt-brand" style={{ marginBottom: 14 }}>
              <img src="assets/logo.png" alt="" style={{ width: 32, height: 32, borderRadius: "50%" }}/>
              <span className="tt-brand-text">tommy tinkers <span className="nz">NZ</span></span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, maxWidth: 320 }}>
              A one-person workshop in Helensville. Freelance web work for clients; stickers, 3D-printed parts, kids' toys, and useful household bits posted from NZ.
            </p>
          </div>
          <div>
            <h4>Work with me</h4>
            <ul>
              <li><a href="codebench.html">Freelance web dev</a></li>
              <li><a href="codebench.html#build-sheet">Start a project</a></li>
              <li><a href="mailto:tommy@tommytinkers.nz">Email Tommy</a></li>
              <li><a href="https://github.com/tonkatommy" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4>Made Things</h4>
            <ul>
              <li><a href="shop.html?cat=stickers">Stickers & decals</a></li>
              <li><a href="shop.html?cat=rc-parts">RC car parts</a></li>
              <li><a href="shop.html?cat=toys">Kids' toys</a></li>
              <li><a href="shop.html?cat=household">Household</a></li>
            </ul>
          </div>
          <div>
            <h4>Workshop</h4>
            <ul>
              <li><a href="index.html#about">About Tommy</a></li>
              <li><a href="index.html#process">How it works</a></li>
              <li><a href="shed.html#pinboard">The Pinboard</a></li>
              <li><a href="shed.html#workshop">The Workshop</a></li>
            </ul>
          </div>
          <div>
            <h4>Workshop hours</h4>
            <ul>
              <li style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>Mon-Fri · evenings</li>
              <li style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>Sat · 9am to 1pm</li>
              <li style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>Helensville, Auckland</li>
            </ul>
          </div>
        </div>
        <div className="tt-footer-bottom">
          <span>© {new Date().getFullYear()} Tommy Tinkers NZ · maker of things</span>
          <span style={{ display: "inline-flex", gap: 12 }}>
            <a href="mailto:tommy@tommytinkers.nz" aria-label="Email" style={{ color: "var(--color-text-muted)" }}>
              <i data-lucide="mail" style={{ width: 16, height: 16 }}></i>
            </a>
            <a href="https://github.com/tonkatommy" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: "var(--color-text-muted)" }}>
              <i data-lucide="github" style={{ width: 16, height: 16 }}></i>
            </a>
            <a href="https://instagram.com/tommytinkersnz" target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: "var(--color-text-muted)" }}>
              <i data-lucide="instagram" style={{ width: 16, height: 16 }}></i>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

/* ---------- Shop thumb (gradient swatch placeholder) ---------- */
const TTThumb = ({ product, size = 56, round = 10 }) => {
  const s = product.swatch || ["#fcd34d", "#fb923c"];
  return (
    <div style={{
      width: size, height: size, borderRadius: round,
      background: `linear-gradient(135deg, ${s[0]} 0%, ${s[1] || s[0]} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flex: "0 0 auto",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)",
      }}/>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: Math.max(9, size * 0.18),
        fontWeight: 600, color: "#1A1816", opacity: 0.55, letterSpacing: "0.05em",
        position: "relative", textTransform: "uppercase",
      }}>
        {product.cat.split("-")[0]}
      </span>
    </div>
  );
};

/* ---------- Cart Drawer ---------- */
const TTCartDrawer = () => {
  const [open, setOpen] = useTTState(false);
  const [items, setItems] = useTTState(window.ttCartLoad());

  useTTEffect(() => {
    const onOpen = () => setOpen(true);
    const onChange = (e) => setItems(e.detail || window.ttCartLoad());
    window.addEventListener("tt-cart-open", onOpen);
    window.addEventListener("tt-cart-change", onChange);
    return () => {
      window.removeEventListener("tt-cart-open", onOpen);
      window.removeEventListener("tt-cart-change", onChange);
    };
  }, []);
  useTTEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [open, items]);

  const productsById = Object.fromEntries(window.TT_PRODUCTS.map((p) => [p.id, p]));
  const lines = items.map((i) => ({ ...i, product: productsById[i.id] })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 60 ? 0 : 6.50;

  return (
    <>
      <div className={"tt-drawer-overlay" + (open ? " open" : "")} onClick={() => setOpen(false)} />
      <aside className={"tt-drawer" + (open ? " open" : "")} aria-hidden={!open}>
        <div className="tt-drawer-head">
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-mono)", letterSpacing: "0.05em" }}>&gt; cart</span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, margin: "2px 0 0" }}>Your tinker bag</h3>
          </div>
          <button className="tt-icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">
            <i data-lucide="x" style={{ width: 16, height: 16 }}></i>
          </button>
        </div>
        <div className="tt-drawer-body">
          {lines.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--color-text-secondary)" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i data-lucide="shopping-bag" style={{ width: 24, height: 24, color: "#1A1816" }}></i>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, margin: "0 0 14px" }}>Nothing here yet.</p>
              <a className="tt-btn tt-btn-ghost" href="shop.html" onClick={() => setOpen(false)}>Browse made things <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i></a>
            </div>
          ) : lines.map((l) => (
            <div key={l.id} className="tt-cart-line">
              <TTThumb product={l.product} size={56} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{l.product.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>NZ${l.product.price.toFixed(2)} each</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="tt-qty">
                    <button onClick={() => window.ttCartSetQty(l.id, l.qty - 1)} aria-label="Decrease">−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => window.ttCartSetQty(l.id, l.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <button onClick={() => window.ttCartSetQty(l.id, 0)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>remove</button>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-primary)", textAlign: "right" }}>
                NZ${(l.product.price * l.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="tt-drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              <span>Subtotal</span><span>NZ${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
              <span>Shipping {shipping === 0 && subtotal >= 60 ? "(free over $60)" : "(NZ-wide)"}</span><span>{shipping === 0 ? "FREE" : "NZ$" + shipping.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, marginBottom: 14, paddingTop: 12, borderTop: "1px solid var(--color-border-subtle)" }}>
              <span>Total</span><span>NZ${(subtotal + shipping).toFixed(2)}</span>
            </div>
            <button className="tt-btn tt-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }}
              onClick={() => alert("Checkout flow goes here. Stripe or POLi NZ recommended.")}>
              Checkout <i data-lucide="arrow-right" style={{ width: 14, height: 14 }}></i>
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              Ships within 3 working days · NZ-wide tracked
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

window.TTNav = TTNav;
window.TTFooter = TTFooter;
window.TTCartDrawer = TTCartDrawer;
window.TTThumb = TTThumb;
