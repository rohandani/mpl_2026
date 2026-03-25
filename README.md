# 🏏 MPL 2026 — Auction Prediction Game

A real-time cricket auction prediction game where players compete to predict auction outcomes, match results, and climb the leaderboard. Built for MPL (Mini Premier League) 2026.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## What is this?

MPL 2026 is a prediction game built around a cricket auction event. Before the auction begins, participants predict:

- **Selling price** — How much will each player sell for?
- **Buying team** — Which team will win the bid?
- **Match outcomes** — Who wins, man of the match, top scorer, and top wicket-taker

Points are awarded based on prediction accuracy, and a live leaderboard tracks everyone's performance.

## Features

🎯 **Auction Predictions** — Predict selling prices and buying teams for each player in the auction pool

📅 **Match Predictions** — Predict match winners, man of the match, highest scorer, and highest wicket-taker

🏆 **Leaderboard** — Combined scoring across auction and match predictions with real-time rankings

🏏 **Teams & Squads** — Browse all teams, their colors, and rosters

🔒 **Prediction Locking** — Admins can lock/unlock predictions globally to control submission windows

🛡️ **Admin Panel** — Manage teams, players, auctions, fixtures, match settings, sponsors, and share configuration

📤 **Share Cards** — Generate shareable prediction cards with QR codes and sponsor branding

## Scoring System

### Auction Predictions (max 50 pts per player)

| Category | Points | Details |
|----------|--------|---------|
| Correct team | 20 pts | Exact team match |
| Price accuracy | 0–30 pts | `30 - (% off × 100)` — exact match = 30, 10% off = 20, 30%+ off = 0 |

### Match Predictions

Point values are configurable per tournament via the admin match settings panel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth with role-based access (admin detection) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) |
| Fonts | [Geist](https://vercel.com/font) via `next/font` |

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel (teams, players, auctions, fixtures, settings)
│   ├── auth/           # Auth callback handling
│   ├── fixtures/       # Match fixture predictions
│   ├── leaderboard/    # Combined leaderboard (auction + match)
│   ├── login/          # Login page
│   ├── predictions/    # Auction prediction cards and submission
│   └── teams/          # Team listings and squad views
├── components/         # Shared UI components
├── lib/
│   ├── auth/           # Role-based access helpers
│   ├── supabase/       # Supabase client (server + browser)
│   ├── scoring.ts      # Scoring algorithms (auction + match)
│   └── share-card.ts   # Share card generation
├── types/              # TypeScript type definitions
└── middleware.ts        # Auth middleware
supabase/
└── migrations/         # Database schema migrations
```

## Getting Started

### Prerequisites

- Node.js (see `.node-version`)
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

3. Run the Supabase migrations:

```bash
npx supabase db push
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start predicting.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy to [Vercel](https://vercel.com) with zero config — just connect your repo and set the environment variables.

---

Built with ☕ and cricket fever for MPL 2026.
