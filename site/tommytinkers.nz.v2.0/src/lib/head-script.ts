import { FX_STORAGE_KEY } from "@/lib/fx";
import { THEME_COOKIE } from "@/lib/theme";

/**
 * A few lines of plain JavaScript placed in <head>. The browser runs it
 * before it paints anything, so the visitor's theme and motion choices are
 * in place on the very first frame (no flash of the wrong theme).
 *
 * It has to be a string of old-style JavaScript: it runs before React and
 * the rest of the app have loaded. Everything is inside try/catch because a
 * blocked cookie or localStorage must never stop the page rendering.
 *
 * Keep it tiny and fixed. In Phase 6 the Content Security Policy will allow
 * exactly this script by its hash, so any change here changes that hash.
 */
export const headScript = `(function(){try{var d=document.documentElement;var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);if(m&&(m[1]==="light"||m[1]==="dark"))d.setAttribute("data-theme",m[1]);var f=JSON.parse(localStorage.getItem("${FX_STORAGE_KEY}")||"{}");["cardfx","linkfx","scrollfx","btnfx"].forEach(function(k){if(typeof f[k]==="string"&&/^[a-z]+$/.test(f[k]))d.setAttribute("data-tt-"+k,f[k])});if(typeof f.scale==="number"&&f.scale>0)d.style.setProperty("--ttfx-scale",String(f.scale));if(f.motion==="reduced")d.setAttribute("data-tt-motion","reduced")}catch(e){}})()`;
