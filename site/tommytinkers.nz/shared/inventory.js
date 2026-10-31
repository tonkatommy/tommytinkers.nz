/* tommytinkers.nz · admin inventory store + recent orders (localStorage-backed)
 *
 * The public catalogue lives in window.TT_PRODUCTS (read-only seed).
 * The admin tool keeps an editable working copy in localStorage so stock
 * counts, product edits, archives and new products survive a refresh.
 */

window.TT_INV_KEY    = "tt-inventory-v1";
window.TT_ORDERS_KEY = "tt-orders-v1";

/* Display SKU from a product id, e.g. "rc-bumper" -> "RC-BUMPER" */
window.ttSku = (id) => String(id).toUpperCase();

/* Build the editable seed from the public catalogue, adding admin-only fields.
   cost is a mock landed cost (~38% of retail) used for margin display. */
window.ttInvSeed = () =>
  window.TT_PRODUCTS.map((p) => ({
    ...p,
    sku: window.ttSku(p.id),
    archived: false,
    cost: Math.max(1, +(p.price * 0.38).toFixed(2)),
    updated: null,
  }));

window.ttInvLoad = () => {
  try {
    const raw = localStorage.getItem(window.TT_INV_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (e) {}
  const seed = window.ttInvSeed();
  try { localStorage.setItem(window.TT_INV_KEY, JSON.stringify(seed)); } catch (e) {}
  return seed;
};

window.ttInvSave = (list) => {
  try { localStorage.setItem(window.TT_INV_KEY, JSON.stringify(list)); } catch (e) {}
  window.dispatchEvent(new CustomEvent("tt-inv-change", { detail: list }));
};

window.ttInvReset = () => {
  const seed = window.ttInvSeed();
  window.ttInvSave(seed);
  return seed;
};

/* ---------- Recent orders (mock, but status changes persist) ---------- */
window.TT_ORDERS_SEED = [
  { id: "TT-1058", date: "2026-06-13", customer: "Aroha Ngata",     suburb: "Mt Eden, AKL",     items: [{ id: "sk-custom", qty: 2 }, { id: "sk-tools", qty: 1 }],   status: "new" },
  { id: "TT-1057", date: "2026-06-13", customer: "Daniel Whitcombe", suburb: "Helensville",      items: [{ id: "rc-bumper", qty: 1 }, { id: "rc-skid", qty: 2 }],    status: "new" },
  { id: "TT-1056", date: "2026-06-12", customer: "Mei Lin Choe",     suburb: "Wellington",       items: [{ id: "ki-marble", qty: 1 }],                               status: "packing" },
  { id: "TT-1055", date: "2026-06-12", customer: "Sef Tuilagi",      suburb: "Manukau, AKL",     items: [{ id: "ki-rocket", qty: 1 }, { id: "ki-dino", qty: 3 }],    status: "packing" },
  { id: "TT-1054", date: "2026-06-11", customer: "Holly Beaumont",   suburb: "Tauranga",         items: [{ id: "hh-organ", qty: 1 }, { id: "hh-hook", qty: 2 }],     status: "posted" },
  { id: "TT-1053", date: "2026-06-11", customer: "Raj Patel",        suburb: "Christchurch",     items: [{ id: "sk-nz-set", qty: 2 }],                               status: "posted" },
  { id: "TT-1052", date: "2026-06-10", customer: "Greer MacKay",     suburb: "Dunedin",          items: [{ id: "hh-stand", qty: 1 }, { id: "hh-charge", qty: 1 }],   status: "posted" },
  { id: "TT-1051", date: "2026-06-09", customer: "Tomasz Kowal",     suburb: "Hamilton",         items: [{ id: "rc-custom", qty: 1 }],                               status: "posted" },
  { id: "TT-1050", date: "2026-06-08", customer: "Bex O'Donnell",    suburb: "Ponsonby, AKL",    items: [{ id: "sk-mtn-1", qty: 4 }, { id: "ki-puz", qty: 1 }],      status: "refunded" },
];

window.ttOrdersLoad = () => {
  try {
    const raw = localStorage.getItem(window.TT_ORDERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (e) {}
  const seed = window.TT_ORDERS_SEED.map((o) => ({ ...o }));
  try { localStorage.setItem(window.TT_ORDERS_KEY, JSON.stringify(seed)); } catch (e) {}
  return seed;
};

window.ttOrdersSave = (list) => {
  try { localStorage.setItem(window.TT_ORDERS_KEY, JSON.stringify(list)); } catch (e) {}
  window.dispatchEvent(new CustomEvent("tt-orders-change", { detail: list }));
};

window.ttOrdersReset = () => {
  const seed = window.TT_ORDERS_SEED.map((o) => ({ ...o }));
  window.ttOrdersSave(seed);
  return seed;
};
