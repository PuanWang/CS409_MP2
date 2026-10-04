import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_URL || "http://127.0.0.1:5173/CS409_MP2/";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const checks = [];
async function check(name, action) {
  await action();
  checks.push(name);
  console.log(`PASS ${name}`);
}
await mkdir(".review", { recursive: true });
try {
  await page.goto(base);
  await page.locator(".pokemon-card").first().waitFor({ timeout: 120000 });
  await check("Live PokéAPI: 151 Pokémon and artwork", async () => {
    await expect(page.locator(".pokemon-card")).toHaveCount(151);
    await page
      .locator(".pokemon-card img")
      .first()
      .evaluate((image) => image.decode());
    assert.match(
      await page.locator(".pokemon-card h3").first().innerText(),
      /bulbasaur/i,
    );
  });
  await page.screenshot({ path: ".review/desktop.png", fullPage: false });
  await check("Gallery single and multiple type filters", async () => {
    await page.getByRole("button", { name: "fire", exact: true }).click();
    await expect(page.locator(".pokemon-card")).toHaveCount(12);
    await page.getByRole("button", { name: "water", exact: true }).click();
    await expect(page.locator(".pokemon-card")).toHaveCount(44);
    await page.getByRole("button", { name: "All types", exact: true }).click();
  });
  await check(
    "Gallery detail link and contextual previous/next wrap",
    async () => {
      await page.getByRole("button", { name: "fire", exact: true }).click();
      await page.locator(".pokemon-card").first().click();
      assert.match(page.url(), /pokemon\/4$/);
      await page.getByRole("link", { name: /NEXT/ }).click();
      assert.match(page.url(), /pokemon\/5$/);
      await page.getByRole("link", { name: /PREVIOUS/ }).click();
      await page.getByRole("link", { name: /PREVIOUS/ }).click();
      assert.match(page.url(), /pokemon\/146$/);
      await page.getByRole("link", { name: "Back to collection" }).click();
      await expect(page.locator(".pokemon-card")).toHaveCount(12);
    },
  );
  await page.goto(`${base}list`);
  await page.locator(".pokemon-card").first().waitFor();
  await check(
    "List search filters on every keystroke; name and number",
    async () => {
      const search = page.getByRole("textbox", { name: "Search Pokémon" });
      await search.fill("pika");
      await expect(page.locator(".pokemon-card")).toHaveCount(1);
      assert.match(
        await page.locator(".pokemon-card h3").innerText(),
        /pikachu/i,
      );
      await search.fill("#001");
      await expect(page.locator(".pokemon-card")).toHaveCount(1);
      await search.fill("not-a-pokemon");
      await page
        .getByRole("heading", { name: "No Pokémon in sight." })
        .waitFor();
      await page
        .getByRole("button", { name: "Reset search & filters" })
        .click();
      await expect(page.locator(".pokemon-card")).toHaveCount(151);
    },
  );
  await check(
    "Number, name, and weight sort ascending and descending",
    async () => {
      for (const [property, first, last] of [
        ["id", "bulbasaur", "mew"],
        ["name", "abra", "zubat"],
        ["weight", "gastly", "snorlax"],
      ]) {
        await page.getByLabel("Sort by").selectOption(property);
        await expect(page.locator(".pokemon-card h3").first()).toHaveText(
          first,
        );
        await page
          .getByRole("button", {
            name: "Order: ascending. Switch to descending",
          })
          .click();
        await expect(page.locator(".pokemon-card h3").first()).toHaveText(last);
        await page
          .getByRole("button", {
            name: "Order: descending. Switch to ascending",
          })
          .click();
      }
    },
  );
  await check("List opens details with API attributes and stats", async () => {
    await page.getByLabel("Sort by").selectOption("id");
    await expect(page.locator(".pokemon-card h3").first()).toHaveText(
      "bulbasaur",
    );
    await page.locator(".pokemon-card").first().click();
    await page.getByRole("heading", { name: /^bulbasaur$/i }).waitFor();
    assert.equal(await page.locator(".stat").count(), 6);
    assert.match(await page.locator(".measurements").innerText(), /6.9/);
    await page.screenshot({ path: ".review/detail.png", fullPage: true });
  });
  await check(
    "Direct detail URL, refresh, and full collection boundary wrap",
    async () => {
      await page.goto(`${base}pokemon/151`);
      await page.getByRole("heading", { name: /^mew$/i }).waitFor();
      await page.reload();
      await page.getByRole("heading", { name: /^mew$/i }).waitFor();
      await page.getByRole("link", { name: /NEXT/ }).click();
      assert.match(page.url(), /pokemon\/1$/);
      await page.getByRole("link", { name: /PREVIOUS/ }).click();
      assert.match(page.url(), /pokemon\/151$/);
    },
  );
  await check("Invalid detail URL is handled", async () => {
    await page.goto(`${base}pokemon/999`);
    await page.getByRole("heading", { name: "Pokémon not found." }).waitFor();
  });
  await check("Mobile gallery, list, and details fit viewport", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["gallery", "list", "pokemon/25"]) {
      await page.goto(`${base}${route}`);
      await page
        .locator(
          route.startsWith("pokemon") ? ".detail-content" : ".pokemon-card",
        )
        .first()
        .waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      );
      await page.screenshot({
        path: `.review/mobile-${route.replace("/", "-")}.png`,
        fullPage: false,
      });
    }
  });
  await check("API failure state and successful retry", async () => {
    const offline = await browser.newContext();
    const errorPage = await offline.newPage();
    await errorPage.route("https://pokeapi.co/**", (route) => route.abort());
    await errorPage.goto(base);
    await errorPage
      .getByRole("heading", { name: "The trail went quiet." })
      .waitFor();
    await errorPage.unroute("https://pokeapi.co/**");
    await errorPage.getByRole("button", { name: "Try again" }).click();
    await errorPage
      .locator(".pokemon-card")
      .first()
      .waitFor({ timeout: 120000 });
    assert.equal(await errorPage.locator(".pokemon-card").count(), 151);
    await offline.close();
  });
  assert.deepEqual(errors, []);
  await writeFile(
    ".review/results.json",
    JSON.stringify({ base, checks, errors }, null, 2),
  );
  console.log(`All ${checks.length} checks passed; no browser runtime errors.`);
} finally {
  await browser.close();
}
