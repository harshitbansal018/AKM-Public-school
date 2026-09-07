# AKM Public Sr. Sec. School — Website

Full-stack rebuild of the school website: **Next.js** frontend, **Express + Prisma + MySQL** API
in MVC layering, in one npm-workspaces monorepo.

```
akm-school/
├─ apps/
│  ├─ web/   Next.js 15 (App Router) — public site + admin panel   ✅ built
│  └─ api/   Express + Prisma + MySQL (MVC)                        ⏳ schema only
└─ Doc/      the original single-file static site, kept for reference
```

## Current status

| Part | State |
|---|---|
| Public website (18 routes) | ✅ Done |
| Prisma schema (14 models) + migration + seeders | ✅ Done |
| Express API — public + admin, MVC layering | ✅ Done |
| Auth (JWT access + refresh cookie, roles) | ✅ Done |
| Admin sign-in, route guard, dashboard | ✅ Done |
| Admin CRUD **screens** (the UI for notices, gallery, …) | ⏳ Not yet |

The API is complete; what remains is the admin *interface* for it. Content is editable today
through the endpoints directly.

## Quick start

```bash
npm install        # installs both workspaces
npm run dev        # API on :5000, web on :3000
```

Prerequisite: MySQL/MariaDB running, and a database created:

```sql
CREATE DATABASE akm_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

First run only:

```bash
cp apps/api/.env.example apps/api/.env   # set DATABASE_URL
npm run db:migrate
npm run db:seed
```

Seeded admin: `admin@akmpublicschool.in` / `Admin@12345`.

### Running one side only

```bash
npm run dev:web    # frontend only
npm run dev:api    # API only
```

### Falling back to bundled content

Blank `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` and every page reads
`apps/web/src/data/fallback.js` instead — the site still runs with the API stopped.
Point it at `http://localhost:5000/api/v1` to use MySQL.

> **Don't run `npm run build` while the server is running.** Both write to
> `apps/web/.next`, so the build overwrites the running chunks and every page starts
> throwing `Cannot find module './NNN.js'`. If it happens: stop the server, delete
> `apps/web/.next`, and start it again.

## Deploying — the one step people miss

`next build` pre-renders the public pages. Those pages fetch from the API, so if the
server is **not running during the build**, every fetch fails and the pages are baked with
the bundled fallback content from `apps/web/src/data/fallback.js` instead of the database.

The build still succeeds — it just quietly ships stale content, and the school's edits
appear to have vanished.

So after starting the server, clear the caches once:

```bash
curl -X POST http://127.0.0.1:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"tags":["home","settings","notices","gallery","achievements","faculty","facilities","streams","stages","downloads","announcements"]}'
```

One call and every page re-reads from MySQL. Verified: before the ping the page showed the
fallback phone number, after it showed the database one.

(On a redeploy where the old server is still running, the build fetches from it and gets
real data — so this mainly matters on the first deploy, or any deploy where you stop the
server first. Running it every time is harmless.)

## How the frontend is organised

```
apps/web/src/
├─ app/
│  ├─ layout.jsx          root: fonts, metadata, ToastProvider (thin on purpose)
│  ├─ (public)/           route group — every visitor-facing page, wrapped in PublicShell
│  └─ admin/              own layout, own chrome, never indexed
├─ components/
│  ├─ layout/             Preloader Topbar Ticker Header MobileMenu Footer BackToTop Deco Logo
│  ├─ home/               the eleven homepage sections, reused across inner pages
│  ├─ forms/              EnquiryForm LoginForm
│  ├─ ui/                 Button Card SectionIntro Reveal Input Select Textarea Badge
│  │                      Modal Lightbox Pagination Toast EmptyState Skeleton PageHeader
│  └─ admin/              AdminShell Sidebar StatCard
├─ lib/                   api serverApi adminApi auth format seo cn
├─ hooks/                 useReveal useCountUp useScrolled useReducedMotion useToast useDebounce
├─ context/               ToastContext AuthContext
├─ constants/             navLinks adminNav classGroups
└─ data/fallback.js       bundled content — mirrors the API response shape exactly
```

Every component folder is `Component.jsx` + `Component.module.css`. Design tokens, the button
system, decorative shapes and shared keyframes stay global in `app/globals.css`.

### Data access

`lib/serverApi.js` is the only thing pages call. Each function tries the API and falls back to
bundled content on any failure — so a backend outage degrades to last-known-good content instead
of a 500. Responses are cached with tags (`home`, `notices`, `gallery`, …) so admin saves can call
`revalidateTag()` and update the live site instantly.

### Behaviour carried over from the old page

| Old inline script | Now |
|---|---|
| IntersectionObserver reveal | `useReveal` → `<Reveal>` |
| easeOutCubic stat counters | `useCountUp` |
| Header shadow + back-to-top | `useScrolled` |
| Ticker `innerHTML` duplication | rendered twice in markup — works pre-hydration |
| Preloader with 2.5s fallback | `<Preloader>`, skipped under reduced motion |

## Backend layering (when built)

```
Route → Middleware → Controller → Service → Repository → Prisma → MySQL
                          ↓
                     ApiResponse
```

`repositories/` is the only place that imports `prisma`. Services hold business logic and never
touch `req`/`res`. Controllers are thin. See `apps/api/README.md`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | both apps together |
| `npm run dev:web` | frontend only |
| `npm run build` | production build of the frontend |
| `npm run db:migrate` | Prisma migration |
| `npm run db:seed` | load starter content |
| `npm run db:studio` | browse the database |
| `npm run lint` | ESLint |
