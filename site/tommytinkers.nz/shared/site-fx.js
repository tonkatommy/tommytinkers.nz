/* tommytinkers.nz · site-wide motion driver (no React)
   Runs on every page. Reads the data-tt-* defaults baked onto <html> and:
     • reveals `main .tt-card` on scroll (scroll-rect sweep, reliable everywhere)
     • settles each revealed card to its visible resting state after its
       animation window, so a throttled / reduced-motion frame can never leave
       a card stuck on the hidden keyframe
     • runs the cursor-tracked card tilt (only when data-tt-cardfx="tilt")
   Exposes window.TTFx so the Shop's Tweaks panel can drive it instead of
   duplicating the logic. */
(function () {
  var doc = document;
  var html = doc.documentElement;

  // Enables the hidden reveal start-state in CSS. Added immediately so it is
  // present before React commits cards; if this script never runs, the gate is
  // absent and all content stays visible (fail-safe).
  html.classList.add("tt-fx-on");

  function speedScale() {
    var v = parseFloat(getComputedStyle(html).getPropertyValue("--ttfx-scale"));
    return isFinite(v) && v > 0 ? v : 1;
  }
  function cards() {
    return Array.prototype.slice.call(doc.querySelectorAll("main .tt-card"));
  }
  function mode() {
    return html.getAttribute("data-tt-scrollfx") || "none";
  }

  // lock a card to its visible state once its entrance window has elapsed
  function settle(c) {
    var i = parseInt(c.style.getPropertyValue("--i"), 10) || 0;
    var s = speedScale();
    setTimeout(function () { c.classList.add("tt-fx-done"); }, (720 + i * 60 + 240) * s);
  }

  function sweep() {
    if (mode() === "none") return;
    var trigger = window.innerHeight * 0.92;
    cards().forEach(function (c) {
      if (c.classList.contains("tt-inview")) return;
      if (c.getBoundingClientRect().top < trigger) {
        c.classList.add("tt-inview");
        settle(c);
      }
    });
  }

  // (re)apply stagger indices and, optionally, replay the reveal from hidden
  function refresh(opts) {
    opts = opts || {};
    var list = cards();
    list.forEach(function (c, i) { c.style.setProperty("--i", i % 4); });

    // clear stale tilt vars when tilt isn't the active hover effect
    if (html.getAttribute("data-tt-cardfx") !== "tilt") {
      list.forEach(function (c) {
        c.style.removeProperty("--ttrx");
        c.style.removeProperty("--ttry");
      });
    }

    if (mode() === "none") {
      list.forEach(function (c) { c.classList.add("tt-inview", "tt-fx-done"); });
      return;
    }
    if (opts.retrigger) {
      list.forEach(function (c) { c.classList.remove("tt-inview", "tt-fx-done"); });
    }
    sweep();
  }

  // ---- scroll / resize ---- (timer-throttled, not rAF, so it keeps working
  // in backgrounded tabs where requestAnimationFrame is frozen)
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    sweep();
    setTimeout(function () { ticking = false; }, 80);
  }

  // ---- cursor-tracked tilt (delegated; reads cardfx live) ----
  var activeTilt = null;
  function resetTilt(c) {
    if (c) { c.style.setProperty("--ttrx", "0deg"); c.style.setProperty("--ttry", "0deg"); }
  }
  function onMove(e) {
    if (html.getAttribute("data-tt-cardfx") !== "tilt") return;
    var card = e.target.closest ? e.target.closest("main .tt-card") : null;
    if (card !== activeTilt) { resetTilt(activeTilt); activeTilt = card; }
    if (!card) return;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ttrx", (px * 9).toFixed(2) + "deg");
    card.style.setProperty("--ttry", (-py * 9).toFixed(2) + "deg");
  }

  function start() {
    // React renders content after this script; watch for it. Debounce with a
    // timer (not requestAnimationFrame, which is frozen in backgrounded tabs,
    // and would otherwise leave cards stuck hidden).
    var deb = 0;
    var mo = new MutationObserver(function () {
      clearTimeout(deb);
      deb = setTimeout(function () { refresh({ retrigger: false }); }, 60);
    });
    if (doc.body) mo.observe(doc.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    doc.addEventListener("pointermove", onMove, { passive: true });

    // initial + fallback passes (covers late React renders even if the observer
    // or rAF misbehaves under throttling)
    refresh({ retrigger: false });
    setTimeout(function () { refresh({ retrigger: false }); }, 300);
    setTimeout(function () { refresh({ retrigger: false }); }, 1200);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.TTFx = { refresh: refresh, sweep: sweep };
})();
