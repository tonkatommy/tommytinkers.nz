/* tommytinkers.nz · Shop motion controls
   The Tweaks panel that lets the shop swap hover / nav-link / scroll / button
   animations. It only sets the data attributes (+ speed) on <html>; the actual
   reveal + tilt work is owned by the site-wide driver in shared/site-fx.js,
   which this panel drives through window.TTFx. Mounts to its own root. */

const FX_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardHover": "socket",
  "linkHover": "caret",
  "scrollReveal": "swing",
  "btnFeel": "sweep",
  "speed": "normal"
}/*EDITMODE-END*/;

const FX_SPEED = { slow: 1.5, normal: 1, fast: 0.62 };

function ShopFX() {
  const [t, setTweak] = useTweaks(FX_DEFAULTS);
  const prevReveal = React.useRef(t.scrollReveal);

  /* ---- push tweak state onto <html>; the site-fx driver does the rest ---- */
  React.useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-tt-cardfx", t.cardHover);
    el.setAttribute("data-tt-linkfx", t.linkHover);
    el.setAttribute("data-tt-scrollfx", t.scrollReveal);
    el.setAttribute("data-tt-btnfx", t.btnFeel);
    el.style.setProperty("--ttfx-scale", FX_SPEED[t.speed] || 1);

    // replay the reveal from hidden when the reveal mode changes, so picking an
    // option demonstrates it immediately
    const changed = prevReveal.current !== t.scrollReveal;
    prevReveal.current = t.scrollReveal;
    if (window.TTFx) requestAnimationFrame(() => window.TTFx.refresh({ retrigger: changed }));
  }, [t]);

  return (
    <TweaksPanel title="Motion">
      <TweakSection label="Cards" />
      <TweakSelect label="Hover" value={t.cardHover}
        options={[
          { value: "classic", label: "Classic lift" },
          { value: "tilt", label: "Tilt to cursor" },
          { value: "socket", label: "Socket / press in" },
          { value: "peel", label: "Sticker peel" },
          { value: "glow", label: "Edge glow + wipe" },
        ]}
        onChange={(v) => setTweak("cardHover", v)} />

      <TweakSection label="Navigation" />
      <TweakSelect label="Link hover" value={t.linkHover}
        options={[
          { value: "underline", label: "Underline wipe" },
          { value: "caret", label: "Terminal caret >" },
          { value: "bracket", label: "[ brackets ]" },
          { value: "swipe", label: "Highlighter swipe" },
        ]}
        onChange={(v) => setTweak("linkHover", v)} />

      <TweakSection label="On scroll" />
      <TweakSelect label="Reveal" value={t.scrollReveal}
        options={[
          { value: "none", label: "Off" },
          { value: "rise", label: "Rise + fade" },
          { value: "assemble", label: "Assemble" },
          { value: "blur", label: "Focus in" },
          { value: "swing", label: "Swing in" },
        ]}
        onChange={(v) => setTweak("scrollReveal", v)} />
      <TweakRadio label="Speed" value={t.speed}
        options={["slow", "normal", "fast"]}
        onChange={(v) => setTweak("speed", v)} />

      <TweakSection label="Buttons" />
      <TweakRadio label="Feel" value={t.btnFeel}
        options={[
          { value: "glow", label: "Glow" },
          { value: "sweep", label: "Sweep" },
          { value: "press", label: "Press" },
        ]}
        onChange={(v) => setTweak("btnFeel", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("fx-root")).render(<ShopFX />);
