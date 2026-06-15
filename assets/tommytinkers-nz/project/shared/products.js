/* tommytinkers.nz · product catalogue (window.TT_PRODUCTS) */
window.TT_PRODUCTS = [
  // ---------- Stickers & decals ----------
  { id: "sk-mtn-1", cat: "stickers", name: "Aotearoa peak sticker", price: 6.50, blurb: "Vinyl mountain silhouette. Weather-proof. 75mm wide.", swatch: ["#4caf2e", "#1a1816"], stock: 48, tags: ["vinyl", "outdoor"], featured: true },
  { id: "sk-tools", cat: "stickers", name: "Workshop tools set (×6)", price: 12.00, blurb: "Six hand-drawn tool icons. Stick on a toolbox, laptop, or chilly bin.", swatch: ["#fb923c", "#fcd34d"], stock: 22, tags: ["vinyl", "set"] },
  { id: "sk-rcdec", cat: "stickers", name: "RC car number decals", price: 8.00, blurb: "Race numbers 00 to 99. Two colours, matte vinyl.", swatch: ["#f97316", "#1a1816"], stock: 31, tags: ["vinyl", "rc"] },
  { id: "sk-custom", cat: "stickers", name: "Custom design (per A4)", price: 28.00, blurb: "Send a sketch or logo. We cut and weed to order. Two-week turnaround.", swatch: ["#fcd34d", "#fb923c"], stock: 99, tags: ["custom", "vinyl"], featured: true },
  { id: "sk-nz-set", cat: "stickers", name: "Native bird set (×4)", price: 11.50, blurb: "Tui, kererū, kea, ruru. Black on clear vinyl. 60mm each.", swatch: ["#1a1816", "#4caf2e"], stock: 14, tags: ["vinyl", "set"] },

  // ---------- 3D printed RC parts ----------
  { id: "rc-bumper", cat: "rc-parts", name: "1/10 front bumper guard", price: 18.50, blurb: "PETG. Designed for Tamiya TT-02 chassis. Survives a hard kerb hit.", swatch: ["#1a1816", "#f97316"], stock: 7, tags: ["petg", "tt-02"], featured: true },
  { id: "rc-mount", cat: "rc-parts", name: "Action-cam roll mount", price: 14.00, blurb: "Clamp-on GoPro mount for 1/10 buggies. Two-piece clamshell.", swatch: ["#4caf2e", "#1a1816"], stock: 11, tags: ["petg"] },
  { id: "rc-skid", cat: "rc-parts", name: "Servo saver skid plate", price: 9.50, blurb: "Replaceable wear part. Print-on-demand in your choice of colour.", swatch: ["#fb923c", "#fcd34d"], stock: 24, tags: ["pla", "wear"] },
  { id: "rc-cap", cat: "rc-parts", name: "Battery hold-down (×2)", price: 16.00, blurb: "Pair of hold-downs for shorty LiPos. PETG, M3 thread inserts.", swatch: ["#1a1816", "#fcd34d"], stock: 9, tags: ["petg", "set"] },
  { id: "rc-custom", cat: "rc-parts", name: "Custom RC part (from model)", price: 35.00, blurb: "Send a STEP or STL. We slice, print, and post within 5 days.", swatch: ["#f97316", "#1a1816"], stock: 99, tags: ["custom"] },

  // ---------- Kids' toys ----------
  { id: "ki-rocket", cat: "toys", name: "Stomp rocket (no glue)", price: 22.00, blurb: "Snap-together rocket. Foam tip. Five-year-old approved.", swatch: ["#fb923c", "#f97316"], stock: 18, tags: ["pla", "ages 4+"], featured: true },
  { id: "ki-marble", cat: "toys", name: "Marble run starter (12 pc)", price: 38.00, blurb: "Modular marble run. Slots together. Marbles included.", swatch: ["#fcd34d", "#4caf2e"], stock: 6, tags: ["pla", "set"] },
  { id: "ki-dino", cat: "toys", name: "Articulated dinosaur", price: 14.00, blurb: "Prints in one piece. Tail wags, jaw opens. Pick a colour.", swatch: ["#4caf2e", "#fcd34d"], stock: 33, tags: ["pla", "ages 3+"] },
  { id: "ki-puz", cat: "toys", name: "Pocket puzzle (3-piece)", price: 9.00, blurb: "Tricky enough for adults. Small enough for a pocket.", swatch: ["#1a1816", "#fb923c"], stock: 27, tags: ["pla"] },

  // ---------- Household ----------
  { id: "hh-hook", cat: "household", name: "Sliding cable hook (×4)", price: 11.00, blurb: "Hangs on a shelf edge. No screws. Holds a 2kg cable bundle.", swatch: ["#1a1816", "#f97316"], stock: 41, tags: ["petg", "set"], featured: true },
  { id: "hh-organ", cat: "household", name: "Drawer organiser (modular)", price: 24.00, blurb: "Bins that lock together. Configure to fit any drawer.", swatch: ["#fcd34d", "#fb923c"], stock: 13, tags: ["petg", "modular"] },
  { id: "hh-stand", cat: "household", name: "Headphone stand", price: 19.00, blurb: "Weighted base. Felt pad on top. Doesn't tip when you grab it.", swatch: ["#4caf2e", "#1a1816"], stock: 16, tags: ["petg"] },
  { id: "hh-charge", cat: "household", name: "Bedside cable dock", price: 13.50, blurb: "Slots one phone and one cable. Keeps the cable from sliding off.", swatch: ["#fb923c", "#1a1816"], stock: 21, tags: ["petg"] },
  { id: "hh-spice", cat: "household", name: "Spice jar shelf (×3)", price: 17.00, blurb: "Magnetic-back shelves for a fridge or steel cabinet.", swatch: ["#fcd34d", "#4caf2e"], stock: 8, tags: ["petg", "magnet"] },
];

window.TT_CATEGORIES = [
  { id: "all", label: "Everything", icon: "shapes" },
  { id: "stickers", label: "Stickers & decals", icon: "scissors" },
  { id: "rc-parts", label: "RC car parts", icon: "car" },
  { id: "toys", label: "Kids' toys", icon: "blocks" },
  { id: "household", label: "Household", icon: "home" },
];
