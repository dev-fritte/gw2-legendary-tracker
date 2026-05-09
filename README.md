# GW2 Legendary Tracker

A Guild Wars 2 tool that analyzes your characters' equipment and recommends which legendary weapons to craft next, ranked by how many character slots would benefit.

## Features

- **Zommoros' Choice** — connects to your GW2 account, lets you pick which characters to include, and ranks legendary weapon recommendations by impact (number of non-legendary slots across all selected characters that would benefit)
- **Legendary Armory awareness** — weapons already covered by your armory are shown separately in an "Already have" section
- **Equipment template support** — correctly handles multiple equipment tabs per character
- **Localization** — English and German, auto-detected from the browser, stored per session
- **Dark theme** — GW2-style dark UI with profession-colored character chips

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (Checkbox, DropdownMenu, Label, Separator, Slot) |
| Data fetching | TanStack React Query v5 |
| HTTP | Axios |
| i18n | i18next + react-i18next + i18next-browser-languagedetector |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A Guild Wars 2 API key with **account** and **characters** permissions ([generate one here](https://account.arena.net/applications))

### Install & run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Shared UI components (Navbar, ProfessionIcon, ui/)
├── features/
│   ├── auth/           # API key login form
│   ├── characters/     # Character selection page and card
│   ├── tracker/        # Recommendation results page and card
│   └── overview/       # Overview placeholder
├── hooks/              # React Query hooks (characters, weapon analysis, professions)
├── i18n/               # i18next setup and EN/DE locale files
├── services/           # GW2 API client, localStorage wrapper
├── types/              # GW2 API TypeScript interfaces
└── utils/              # Calculation engine, profession metadata, cn helper
```

## GW2 API Usage

All requests go directly to `https://api.guildwars2.com/v2` from the browser using the API key as an `access_token` query parameter (no server-side proxy needed). Data is cached via React Query:

| Endpoint | Cache |
|---|---|
| `/v2/account` | session |
| `/v2/characters` | 5 min |
| `/v2/account/legendaryarmory` | 5 min |
| `/v2/items` | 1 hour |
| `/v2/professions` | permanent |

## Privacy

Your API key is stored only in your browser's `localStorage` and is never sent to any third-party server.
