'use client';

import { useEffect } from "react";

export default function SiteFxDriver() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("tt-fx-on");

    function sweepCards() {
      const cards = document.querySelectorAll<HTMLElement>("main .tt-card:not(.tt-fx-done)");
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const inview = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (inview && !card.classList.contains("tt-inview")) {
          card.style.setProperty("--i", String(i));
          card.classList.add("tt-inview");
          const onEnd = () => {
            card.classList.add("tt-fx-done");
            card.removeEventListener("animationend", onEnd);
          };
          card.addEventListener("animationend", onEnd);
        }
      });
    }

    sweepCards();
    window.addEventListener("scroll", sweepCards, { passive: true });
    const mo = new MutationObserver(() => sweepCards());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", sweepCards);
      mo.disconnect();
    };
  }, []);

  return null;
}
