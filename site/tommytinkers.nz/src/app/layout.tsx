import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SiteFxDriver from "@/components/SiteFxDriver";
import ScrollToTop from "@/components/ScrollToTop";

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
      suppressHydrationWarning
      data-tt-cardfx="socket"
      data-tt-linkfx="caret"
      data-tt-scrollfx="swing"
      data-tt-btnfx="sweep"
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <CartProvider>
          <SiteFxDriver />
          <Nav />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <ScrollToTop />
        </CartProvider>
      </body>
    </html>
  );
}
