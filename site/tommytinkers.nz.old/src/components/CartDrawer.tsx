'use client';

import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getById } from "@/lib/products";

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem } = useCart();
  const total = items.reduce((sum, item) => {
    const p = getById(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const checkoutHref = (() => {
    const lines = items
      .map((item) => {
        const product = getById(item.id);
        return product ? `${item.qty} x ${product.name} ($${product.price.toFixed(2)} ea)` : null;
      })
      .filter((line): line is string => Boolean(line));
    const body = [
      "Hi Tommy,",
      "",
      "I'd like to place this order:",
      ...lines,
      "",
      `Total: $${total.toFixed(2)}`,
    ].join("\n");
    return `mailto:tommy@tommytinkers.nz?subject=${encodeURIComponent("Tommy Tinkers NZ cart checkout")}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <>
      <div
        className={`tt-drawer-overlay${isOpen ? " open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside className={`tt-drawer${isOpen ? " open" : ""}`} aria-label="Shopping cart">
        <div className="tt-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={18} style={{ color: "var(--color-warm-orange)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, color: "var(--color-text-primary)" }}>
              Cart
            </span>
            {items.length > 0 && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--gradient-brand)",
                color: "#1A1816", padding: "2px 8px", borderRadius: 99, marginLeft: 4,
              }}>
                {items.reduce((n, i) => n + i.qty, 0)}
              </span>
            )}
          </div>
          <button className="tt-icon-btn" onClick={closeCart} aria-label="Close cart">
            <X size={16} />
          </button>
        </div>

        <div className="tt-drawer-body">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>
              <ShoppingBag size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => {
              const product = getById(item.id);
              if (!product) return null;
              return (
                <div key={item.id} className="tt-cart-line">
                  <div style={{
                    width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${product.swatch[0]}, ${product.swatch[1]})`,
                    border: "1px solid var(--color-border-subtle)",
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)", marginBottom: 2 }}>
                      {product.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-warm-orange)" }}>
                      ${product.price.toFixed(2)} ea
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>
                      ${(product.price * item.qty).toFixed(2)}
                    </span>
                    <div className="tt-qty">
                      <button
                        onClick={() => item.qty <= 1 ? removeItem(item.id) : setQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                        disabled={item.qty >= product.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="tt-drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-secondary)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "var(--color-text-primary)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className="tt-btn tt-btn-warm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { window.location.href = checkoutHref; }}
            >
              Checkout <ArrowRight size={16} />
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", marginTop: 10 }}>
              NZ shipping · Checkout opens your email app
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
