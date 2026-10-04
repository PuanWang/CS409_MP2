# Kanto — Pokémon Field Guide

A React + TypeScript single-page app for the original 151 Pokémon, with data and official artwork fetched from PokéAPI through Axios. The original assignment README is preserved.

## Run locally

```powershell
npm ci
npm run dev -- --port 4173
```

Open http://127.0.0.1:4173/CS409_MP2/. Port 5173 was unavailable on this Windows machine; 4173 was verified.

```powershell
npm run build
npm run preview -- --port 4174
```

Node 20.19+ or 22.12+ is required by Vite. The existing deployment workflow uses Node 20 and `npm ci`; the lockfile is included.

## Rubric map

| Requirement                              | Implementation                                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| API-backed list                          | `/list` displays all 151 Generation I Pokémon from PokéAPI.                                                                   |
| Filter while typing                      | Search by name or Pokédex number; case-insensitive names; clear and empty states.                                             |
| Sort at least two properties             | Number, name, and weight; each supports ascending and descending.                                                             |
| Image gallery                            | `/gallery` displays official artwork provided in Pokémon API responses.                                                       |
| Gallery filtering                        | Select one or multiple Pokémon types. Multiple types match **any** selected type.                                             |
| List and gallery links                   | Every card/row opens `/pokemon/:id`.                                                                                          |
| Detail attributes                        | Image, types, height, weight, experience, abilities, six base stats, and optional English species description.                |
| Previous and next                        | Cycle in the current filtered/sorted collection, including wraparound. A directly opened detail uses all 151 in number order. |
| React Router / TypeScript / Axios        | BrowserRouter with `import.meta.env.BASE_URL`; typed React components; centralized Axios client.                              |
| Design                                   | Responsive gallery/list/detail layouts, keyboard focus, semantic controls, reduced motion, image fallback.                    |
| No inline styles/scripts or table layout | External CSS and module entry point. Native meter/progress elements handle dynamic values.                                    |

Search, filters, and sort persist in query parameters. Returning from a detail preserves the originating collection. Requests are limited to eight concurrent workers and cached locally for seven days. A blocking API failure shows a retry control; missing optional species text does not block the detail page. No mock data is presented as live API data.

## Verification

With a running server and Microsoft Edge installed:

```powershell
$env:TEST_URL='http://127.0.0.1:4173/CS409_MP2/'
npm test
```

The browser script checks live API data/artwork, single and combined gallery filters, contextual navigation and wraparound, live search and empty results, every sort direction, list-to-detail links, six stats and measurements, direct detail URLs and refresh, invalid IDs, mobile overflow, and an intentionally blocked API followed by retry. Screenshots and results are saved to ignored `.review/`. Network access is required for a cold cache.

## GitHub Pages

- `vite.config.ts` uses `/CS409_MP2/`, matching the current Git remote repository name.
- `scripts/pages.mjs` creates HTML entry points for list/gallery and all 151 detail routes, plus a 404 entry. This supports direct URLs on static Pages hosting without inline redirect scripts.
- The existing `.github/workflows/deploy.yml` is preserved.
- If the repository is renamed to `mp2` as suggested by the assignment, change the Vite base to `/mp2/` before building.
- GitHub Pages Source must be set to **GitHub Actions**. Deployment is separate from local implementation and validation; no commit, push, Pages settings change, or external form submission was performed as part of implementation.

## Remaining submission steps

1. Review the code and publish through the repository's Pages workflow.
2. Record a demo of the deployed URL (maximum three minutes), showing search, sorting, filters, both detail entry points, and previous/next.
3. Share the demo on Drive with `uiuc.web.programming@gmail.com` and submit the course form from README.
4. Add LLM conversation records and complete the usage survey manually, as requested by the project owner.

## Sources and assets

- [PokéAPI v2 documentation](https://pokeapi.co/docs/v2/): generation, Pokémon, species endpoints, and caching policy.
- [PokéAPI](https://pokeapi.co/): live data and official artwork URLs. Pokémon characters and artwork belong to Nintendo / Creatures / GAME FREAK.
- Local `example.mp4`, supplied by the project owner: reference for the assignment's search/gallery/detail interactions.
- React, React DOM, React Router, Axios, Vite, TypeScript: application dependencies; versions are pinned in `package-lock.json`.
- [Lucide](https://lucide.dev/): interface icons through `lucide-react` (ISC license).
- [Google Fonts](https://fonts.google.com/): DM Sans and Outfit (SIL Open Font License), loaded through external CSS with sans-serif fallbacks.
- Layout, visual treatment, components, and verification script were authored for this project. LLM disclosure records will be supplied separately by the owner.
