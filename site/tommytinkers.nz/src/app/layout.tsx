import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SiteFxDriver from "@/components/SiteFxDriver";

export const metadata: Metadata = {
  title: "Tommy Tinkers NZ — websites, stickers & 3D printed stuff",
  description: "Tommy Goodman builds websites, cuts stickers, and 3D prints things out of a shed in New Zealand.",
  icons: { icon: "/assets/logo-favicon.png" },
};

const themeScript = `
try {
  var t = localStorage.getItem("tt-theme-v1") || "dark";
  document.documentElement.setAttribute("data-theme", t);
} catch(e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-tt-cardfx="socket"
      data-tt-linkfx="caret"
      data-tt-scrollfx="swing"
      data-tt-btnfx="sweep"
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <CartProvider>
          <SiteFxDriver />
          <Nav />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
