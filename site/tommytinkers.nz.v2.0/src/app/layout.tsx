import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { FxDefaults } from "@/components/shell/fx-defaults";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteNav } from "@/components/shell/site-nav";
import { FX_FALLBACK } from "@/lib/fx";
import { headScript } from "@/lib/head-script";
import { DEFAULT_THEME } from "@/lib/theme";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The server always sends the defaults (dark theme, default FX). The
    // script below swaps in the visitor's own choices before first paint.
    // suppressHydrationWarning tells React that these attributes on <html>
    // are allowed to differ from what the server sent.
    <html
      lang="en-NZ"
      suppressHydrationWarning
      data-theme={DEFAULT_THEME}
      data-tt-cardfx={FX_FALLBACK.cardfx}
      data-tt-linkfx={FX_FALLBACK.linkfx}
      data-tt-scrollfx={FX_FALLBACK.scrollfx}
      data-tt-btnfx={FX_FALLBACK.btnfx}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        {/* First thing a keyboard user reaches: jump past the nav. Hidden
            until it has focus. */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[400] focus-visible:rounded-md focus-visible:bg-surface focus-visible:px-4 focus-visible:py-3 focus-visible:text-ink"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
        {/* Reads the database, so it streams in after the shell. Nothing to
            show while it loads, hence fallback={null}. */}
        <Suspense fallback={null}>
          <FxDefaults />
        </Suspense>
      </body>
    </html>
  );
}
