import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="tt-footer">
      <div className="tt-container">
        <div className="tt-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Image src="/assets/logo.png" alt="TT" width={32} height={32} style={{ borderRadius: "50%" }} />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)" }}>
                Tommy Tinkers<span style={{ color: "var(--color-warm-orange-deep)" }}>.nz</span>
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.65, color: "var(--color-text-muted)", maxWidth: 240 }}>
              A one-person shop making websites, stickers & 3D printed things from a shed in New Zealand.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/shop?cat=stickers">Stickers</Link></li>
              <li><Link href="/shop?cat=rc-parts">RC Parts</Link></li>
              <li><Link href="/shop?cat=toys">Toys & Kits</Link></li>
              <li><Link href="/shop?cat=household">Household</Link></li>
            </ul>
          </div>

          <div>
            <h4>Work</h4>
            <ul>
              <li><Link href="/codebench">Codebench</Link></li>
              <li><Link href="/codebench#services">Services</Link></li>
              <li><Link href="/codebench#work">Recent Work</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Community</h4>
            <ul>
              <li><Link href="/shed#pinboard">Pinboard</Link></li>
              <li><Link href="/shed#workshop">Workshop</Link></li>
            </ul>
          </div>

          <div>
            <h4>Links</h4>
            <ul>
              <li><a href="https://github.com/tommygoodman" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://instagram.com/tommytinkers" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="mailto:hello@tommytinkers.nz">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="tt-footer-bottom">
          <span>© {new Date().getFullYear()} Tommy Tinkers NZ. Made in a shed.</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
            <span style={{ color: "var(--color-accent)" }}>●</span> Christchurch, NZ
          </span>
        </div>
      </div>
    </footer>
  );
}
