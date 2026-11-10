"use client";

import { useEffect } from "react";
import { FX_STORAGE_KEY, type FxSettings, parseFxOverride } from "@/lib/fx";

/**
 * Turns the site FX on. Renders nothing; it only talks to <html>.
 *
 * 1. Works out this visitor's FX: the site defaults (from the database, via
 *    props) with their own saved choices laid over the top.
 * 2. Writes them to <html> as data attributes, which the CSS in globals.css
 *    (section 6) reacts to.
 * 3. Marks cards as they scroll into view, for the scroll reveal.
 * 4. Feeds the cursor position to the "tilt" card effect.
 */
export function SiteFxDriver({ defaults }: { defaults: FxSettings }) {
  useEffect(() => {
    const html = document.documentElement;

    let saved: string | null = null;
    try {
      saved = localStorage.getItem(FX_STORAGE_KEY);
    } catch {
      // Storage can be blocked (private mode, strict settings). Defaults then.
    }
    const override = parseFxOverride(saved);
    const fx = { ...defaults, ...override };

    html.setAttribute("data-tt-cardfx", fx.cardfx);
    html.setAttribute("data-tt-linkfx", fx.linkfx);
    html.setAttribute("data-tt-scrollfx", fx.scrollfx);
    html.setAttribute("data-tt-btnfx", fx.btnfx);
    html.style.setProperty("--ttfx-scale", String(fx.scale));
    if (override.motion === "reduced") html.setAttribute("data-tt-motion", "reduced");

    // From here on, cards that haven't been revealed yet start hidden. The
    // class is added by this script, so if it never runs nothing is hidden.
    html.classList.add("tt-fx-on");

    // ---- scroll reveal ----
    // IntersectionObserver tells us when a card enters the viewport without
    // us measuring on every scroll event.
    const reveal = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const card = entry.target as HTMLElement;
          // --i staggers cards that arrive together (a row of products).
          card.style.setProperty("--i", String(index++));
          card.classList.add("tt-inview");
          // When its reveal finishes, drop the animation so the hover
          // effects are free to move the card.
          card.addEventListener("animationend", () => card.classList.add("tt-fx-done"), { once: true });
          reveal.unobserve(card);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const watchCards = () => {
      for (const card of document.querySelectorAll("main .tt-card:not(.tt-inview)")) {
        reveal.observe(card);
      }
    };
    watchCards();

    // Cards can appear later: streamed-in sections, or the next page after a
    // link click (this component stays mounted in the layout).
    const added = new MutationObserver(watchCards);
    added.observe(document.body, { childList: true, subtree: true });

    // ---- tilt ----
    // Only does work when the "tilt" card effect is the one in use.
    const onPointerMove = (event: PointerEvent) => {
      if (html.getAttribute("data-tt-cardfx") !== "tilt") return;
      const card = (event.target as HTMLElement).closest<HTMLElement>(".tt-card-hover");
      if (!card) return;
      const box = card.getBoundingClientRect();
      // -0.5 to 0.5 across the card, turned into a few degrees of tilt.
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--ttrx", `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty("--ttry", `${(-y * 10).toFixed(2)}deg`);
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      reveal.disconnect();
      added.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, [defaults]);

  return null;
}
