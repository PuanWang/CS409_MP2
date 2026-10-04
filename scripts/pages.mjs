import { copyFile, mkdir } from "node:fs/promises";
// Real HTML entry points make direct detail links work on static GitHub Pages.
for (const route of [
  "gallery",
  "list",
  ...Array.from({ length: 151 }, (_, i) => `pokemon/${i + 1}`),
]) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile("dist/index.html", `dist/${route}/index.html`);
}
await copyFile("dist/index.html", "dist/404.html");
