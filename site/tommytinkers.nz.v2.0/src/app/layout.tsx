import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "tommy tinkers NZ | websites, stickers and 3D printed parts",
    template: "%s | tommy tinkers NZ",
  },
  description:
    "Tommy Goodman builds websites, cuts vinyl stickers and 3D prints useful things in Helensville, New Zealand.",
  icons: { icon: "/assets/logo-favicon.png" },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

// Dark is the production default. The theme toggle (stored in a cookie so the
// server can render the right theme with no flash) arrives in Phase 1.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
