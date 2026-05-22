# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Type-check (tsc -b) then bundle
npm run lint       # ESLint across all files
npm run preview    # Serve the production build locally
```

There are no tests.

## Architecture

### Routing & Page Flow

Hash-based routing — no router library. `App.tsx` reads `window.location.hash` and manages a `section` state (`"overview" | "zommoros"`). The default is `"overview"`.

```
ApiKeyForm  (no key in localStorage)
    ↓ on success
OverviewPage    ← #overview (default)
CharacterSelectionPage → TrackerPage   ← #zommoros
```

The Navbar's `onNavigate` callback sets both the hash and the `section` state. A `hashchange` listener keeps them in sync with browser back/forward.

### Data Layer

**`GW2ApiClient`** (`src/services/apiClient.ts`) is a singleton (recreated on API key change). All GW2 API v2 calls go through it via Axios. Auth is passed as `?access_token=` (not a header — avoids CORS preflight). Required API key permissions: `account`, `characters`, `inventories`.

**React Query** (`@tanstack/react-query` v5) handles all server state. Global defaults: 5 min staleTime, 15 min gcTime, no window-focus refetch, no retry on `InvalidApiKeyError`. Query keys follow the pattern `["resource", apiKey, ...params]`.

Character data is fetched with `?v=2019-12-19T00:00:00.000Z` — this schema returns each `EquipmentItem` with a `tabs: number[]` array listing every equipment-template tab that uses it. **Never deduplicate equipment by slot** — different tabs can use different items in the same slot, and `tabs.length` is what drives the impact count.

### Weapon Recommendation Logic

`calculateRecommendations` in `src/utils/calculation.ts` is the core algorithm:
1. Builds a `weaponType → armoryCount` map from the legendary armory.
2. Walks all `character.equipment` entries (no deduplication). For each entry, pushes `tabs.length` records into `allChars` — one per template tab.
3. Impact = number of non-legendary tabs for that weapon type.
4. Weapons with `armoryCount > 0` or an equipped legendary go to `coveredByArmory`; the rest (impact > 0) go to `recommendations`.
5. Sort order: if `prioritiseStarterKits` is true, weapons with an owned Starter Kit come first; within each tier, sort by impact descending.

### Legendary Item Categorisation

`src/utils/legendaryGenerations.ts` maps item IDs → category purely by ID (language-independent). Weapon generation is detected via hardcoded Sets (Gen1, Gen2, Standalone); everything else with `itemType === "Weapon"` falls to `"gen3"`. Armor is split into `armor_pve / armor_pvp / armor_wvw` via two Sets (`ARMOR_PVP`, `ARMOR_WVW`); anything with `itemType === "Armor"` not in those Sets is PvE.

Starter Kit data lives in `src/utils/starterKits.ts` — a static map of 10 kit item IDs (96054–103847) to their 4 craftable weapon types each.

### Styling

**Tailwind v4** — no config file, imported via `@import "tailwindcss"` in `index.css`. Arbitrary value syntax like `bg-[#9349CC]` and `data-[state=checked]:[background:...]` is used throughout. Where dynamic values or complex layering is needed, inline `style={}` props are used instead of Tailwind utilities — both patterns coexist intentionally.

Design tokens (not in a config):
- Background: `#0b0814`
- Body text: `#e8e4f0`
- Accent/purple: `#9349CC`
- Muted text: `#8e8a9a` / `#6a6478`
- Heading font: `"Cinzel", serif`
- Body font: `"Outfit", system-ui, sans-serif`

### Localisation

EN and DE only. Locale files are plain TypeScript objects in `src/i18n/locales/`. Language is detected from `localStorage` key `gw2_legendary_tracker_lang`, then browser locale. Both locale files must be kept in sync — TypeScript `as const` on the EN file acts as the shape reference.

### UI Components

`src/components/ui/` contains shadcn-style primitives (Button, Checkbox, Dropdown, etc.) built on Radix UI. Use these for interactive elements. For the Checkbox, checked state is styled via the Tailwind `data-[state=checked]:` variant — see `checkbox.tsx` for the purple gradient pattern.

`src/utils/professions.ts` exports `PROFESSION_META` with per-profession colors (`hex`, Tailwind `bgColor`/`borderColor`) and GW2 Wiki icon URLs (`decoIcon`).
