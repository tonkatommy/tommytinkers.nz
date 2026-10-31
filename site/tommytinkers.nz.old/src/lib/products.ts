import type { Product, Category } from "./types";

export const TT_CATEGORIES: Category[] = [
  { id: "stickers", label: "Stickers", icon: "Scissors" },
  { id: "rc-parts", label: "RC Parts", icon: "Car" },
  { id: "toys",     label: "Toys & Kits", icon: "Blocks" },
  { id: "household",label: "Household", icon: "Home" },
];

export const TT_PRODUCTS: Product[] = [
  {
    id: "sk-mtn-1",
    cat: "stickers",
    name: "Mountain Sticker Set",
    price: 8.00,
    blurb: "5-pack vinyl die-cut mountain range stickers. Weatherproof, UV-resistant, perfect for laptops, water bottles & helmets.",
    swatch: ["#4a7fa5","#e8f4f8"],
    stock: 24,
    tags: ["vinyl","outdoor","5-pack"],
    featured: true,
  },
  {
    id: "sk-custom",
    cat: "stickers",
    name: "Custom Die-Cut Sticker",
    price: 3.50,
    blurb: "Send me your artwork — I'll cut it to shape. Min 1, max 100. Sold per piece.",
    swatch: ["#f97316","#fff3e0"],
    stock: 99,
    tags: ["custom","die-cut","any-art"],
    featured: true,
  },
  {
    id: "sk-logo-3",
    cat: "stickers",
    name: "TT Logo Pack",
    price: 5.00,
    blurb: "Three Tommy Tinkers logo stickers in different sizes. Gloss finish, waterproof.",
    swatch: ["#fcd34d","#1a1816"],
    stock: 30,
    tags: ["logo","3-pack","gloss"],
  },
  {
    id: "sk-circuit",
    cat: "stickers",
    name: "Circuit Board Sticker",
    price: 4.00,
    blurb: "Detailed PCB trace design. Glow-in-the-dark variant available on request.",
    swatch: ["#2e7a1d","#e6f4dc"],
    stock: 18,
    tags: ["tech","glow","single"],
  },
  {
    id: "sk-kiwi",
    cat: "stickers",
    name: "Kiwi Made Badge",
    price: 3.00,
    blurb: "Show off your NZ pride. Proud kiwi silhouette, 3-colour screen-print style.",
    swatch: ["#1a1816","#fdf8ee"],
    stock: 40,
    tags: ["nz","pride","single"],
  },
  {
    id: "rc-bumper",
    cat: "rc-parts",
    name: "Front Skid Bumper",
    price: 14.00,
    blurb: "PETG printed bumper for 1/10 trail rigs. Tested on Axial SCX10 III. Bolt-on.",
    swatch: ["#1a1816","#6c757d"],
    stock: 8,
    tags: ["PETG","1/10","scx10"],
    featured: true,
  },
  {
    id: "rc-servo-horn",
    cat: "rc-parts",
    name: "Servo Horn Extension",
    price: 5.50,
    blurb: "25T spline servo horn with 30mm arm extension. Works with most standard-size servos.",
    swatch: ["#343a40","#adb5bd"],
    stock: 20,
    tags: ["servo","25T","extension"],
  },
  {
    id: "rc-wheelbase",
    cat: "rc-parts",
    name: "Wheelbase Spacer Kit",
    price: 9.00,
    blurb: "Set of 4 body-mount spacers to extend wheelbase by 10 mm. Compatible with SCX10 & TRX-4.",
    swatch: ["#6c757d","#dee2e6"],
    stock: 12,
    tags: ["spacer","wheelbase","4-pack"],
  },
  {
    id: "rc-motor-brace",
    cat: "rc-parts",
    name: "Motor Wire Brace",
    price: 6.00,
    blurb: "Keeps your motor wires tidy and strain-relieved. Clips onto most 540 motor cans.",
    swatch: ["#0d6efd","#cfe2ff"],
    stock: 15,
    tags: ["wiring","tidy","540"],
  },
  {
    id: "rc-diff-cover",
    cat: "rc-parts",
    name: "Diff Cover — Hex Style",
    price: 11.50,
    blurb: "Hex-pattern decorative diff cover for axle housings. Printed in black ASA.",
    swatch: ["#212529","#495057"],
    stock: 7,
    tags: ["diff","ASA","decorative"],
  },
  {
    id: "ki-rocket",
    cat: "toys",
    name: "Mini Rocket Kit",
    price: 18.00,
    blurb: "Build your own PLA rocket. Fins, nosecone & body included. Launch with a B6-4 motor (sold separately).",
    swatch: ["#dc3545","#f8d7da"],
    stock: 6,
    tags: ["rocket","launch","kit"],
    featured: true,
  },
  {
    id: "ki-gear-clock",
    cat: "toys",
    name: "Gear Clock Kit",
    price: 22.00,
    blurb: "Fully mechanical printed clock. No batteries. 15-piece assembly, step-by-step instructions included.",
    swatch: ["#6f4e37","#f5e6d3"],
    stock: 4,
    tags: ["mechanical","kit","clock"],
  },
  {
    id: "ki-marble-run",
    cat: "toys",
    name: "Marble Run Starter",
    price: 15.00,
    blurb: "12-tile PLA marble run. Snaps together with no glue. Great for kids 6+.",
    swatch: ["#0d6efd","#e7f1ff"],
    stock: 10,
    tags: ["marble","snaps","kids"],
  },
  {
    id: "ki-fidget",
    cat: "toys",
    name: "Articulated Fidget Dragon",
    price: 12.00,
    blurb: "Fully articulated flexible dragon, printed-in-place. Wiggles right out of the printer.",
    swatch: ["#198754","#d1e7dd"],
    stock: 9,
    tags: ["flexible","dragon","printed-in-place"],
  },
  {
    id: "ki-spinner",
    cat: "toys",
    name: "Desk Spinner",
    price: 7.00,
    blurb: "Weighted brass-insert spinner with PETG body. Balanced for a smooth 2-minute spin.",
    swatch: ["#ffc107","#fff3cd"],
    stock: 14,
    tags: ["spinner","brass","fidget"],
  },
  {
    id: "hh-hook",
    cat: "household",
    name: "Command Strip Hook Set",
    price: 9.00,
    blurb: "Pack of 4 over-door hooks. Command strip compatible backing, holds up to 2 kg each.",
    swatch: ["#6c757d","#f8f9fa"],
    stock: 20,
    tags: ["hook","command","4-pack"],
    featured: true,
  },
  {
    id: "hh-cable-clip",
    cat: "household",
    name: "Cable Clip Strip",
    price: 6.50,
    blurb: "Self-adhesive cable management clips. 6-pack in white PLA. Holds cables 2–8 mm dia.",
    swatch: ["#f8f9fa","#dee2e6"],
    stock: 25,
    tags: ["cable","tidy","6-pack"],
  },
  {
    id: "hh-planter",
    cat: "household",
    name: "Hanging Wall Planter",
    price: 13.00,
    blurb: "Wall-mounted planter with drainage hole. PETG for moisture resistance. Fits 3-inch pot.",
    swatch: ["#2e7a1d","#d1e7dd"],
    stock: 11,
    tags: ["PETG","planter","wall"],
  },
  {
    id: "hh-keybox",
    cat: "household",
    name: "Magnetic Key Box",
    price: 11.00,
    blurb: "Wall-mounted key organiser with 4 magnetic hooks. Includes 3M adhesive mount.",
    swatch: ["#1a1816","#fcd34d"],
    stock: 8,
    tags: ["magnetic","keys","organiser"],
  },
];

export function getFeatured(): Product[] {
  return TT_PRODUCTS.filter((p) => p.featured);
}

export function getByCategory(cat: string): Product[] {
  return TT_PRODUCTS.filter((p) => p.cat === cat);
}

export function getById(id: string): Product | undefined {
  return TT_PRODUCTS.find((p) => p.id === id);
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  TT_PRODUCTS.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
