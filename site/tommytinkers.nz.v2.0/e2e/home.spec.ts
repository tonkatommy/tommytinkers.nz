import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const THEMES = ["dark", "light"] as const;

/** Opens a page with the theme cookie already set, like a returning visitor. */
async function openWithTheme(page: Page, theme: (typeof THEMES)[number], path = "/") {
  await page.context().addCookies([{ name: "tt-theme", value: theme, url: "http://localhost:3000" }]);
  await page.goto(path);
}

test.describe("home page", () => {
  test("shows the hero and the four seeded featured products", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bringing your ideas to life.");

    // The grid streams in after the shell, so wait for it.
    const featured = page.getByRole("region", { name: "Fresh off the bench" });
    await expect(featured.getByRole("listitem")).toHaveCount(4);
    await expect(featured.getByText("$20.00").first()).toBeVisible();
    await expect(featured.getByText("Made to order").first()).toBeVisible();

    // The tracked product with no stock is shown, but can't be bought.
    const soldOut = featured.getByRole("listitem").filter({ hasText: "Astro Masters grid stickers" });
    await expect(soldOut.getByRole("button", { name: "Out of stock" })).toBeDisabled();
  });

  test("has exactly one full-bleed gradient section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section.tt-warm")).toHaveCount(1);
  });

  for (const theme of THEMES) {
    test(`has no serious accessibility problems (${theme})`, async ({ page }) => {
      // Reduced motion so nothing is half faded-in while axe measures contrast.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openWithTheme(page, theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("region", { name: "Fresh off the bench" }).getByRole("listitem")).toHaveCount(4);

      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      // Printing the ids makes a failure readable in the CI log.
      expect(serious.map((violation) => `${violation.id}: ${violation.nodes[0]?.html}`)).toEqual([]);
    });
  }
});

test.describe("theme", () => {
  test("defaults to dark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("a saved light theme is applied before the page finishes loading", async ({ page }) => {
    await page.context().addCookies([{ name: "tt-theme", value: "light", url: "http://localhost:3000" }]);
    // "commit" returns as soon as the HTML starts arriving, long before
    // React loads. The <head> script must already have set the theme.
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("body");
    expect(await page.locator("html").getAttribute("data-theme")).toBe("light");
  });

  test("the toggle switches theme and it sticks after a reload", async ({ page }) => {
    await page.goto("/");
    // On mobile the nav's toggle is inside the menu; the footer one is
    // always there, so use that.
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("button", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    // The button now offers the way back.
    await expect(footer.getByRole("button", { name: "Dark theme" })).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("shell", () => {
  test("the skip link is the first thing Tab reaches, and it is visible", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test("the cart opens as a dialog, and Esc closes it and returns focus", async ({ page }) => {
    await page.goto("/");
    const cartButton = page.getByRole("button", { name: /^Cart/ });
    await cartButton.click();

    const dialog = page.getByRole("dialog", { name: /Your cart/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Your cart is empty")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cartButton).toBeFocused();
  });

  test("desktop: main links and the account menu", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout only");
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Codebench" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "The Shed" })).toBeVisible();

    const account = page.getByRole("button", { name: "Account menu" });
    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Create a free account" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(account).toHaveAttribute("aria-expanded", "false");
  });

  test("mobile: the menu holds the links, and the cart stays in the bar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout only");
    await page.goto("/");

    await expect(page.getByRole("button", { name: /^Cart/ })).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click();

    const menu = page.getByRole("navigation", { name: "Main" });
    await expect(menu.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Contact" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Sign in" })).toBeVisible();

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  });

  test("the nav turns into an overlay once the page is scrolled", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("an unknown address shows the not-found page with a way home", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("That page isn't here")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the workshop" })).toBeVisible();
  });
});

test("health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
