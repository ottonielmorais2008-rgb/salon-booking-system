# Salon Booking System

Website and **online booking system** for a hair salon, built as a full-stack demo.
Clients pick a service, a professional, a day and a time; the team manages everything from a
private admin panel.

> **Demo content:** "Studio Demo" is a fictional business. All names, addresses, phone numbers,
> texts and images are placeholders.

> Screenshots / GIF: _add 2–3 images here (booking flow + admin panel)._

## Features

- **Step-by-step booking:** service → professional (or "no preference") → date → time → contact details
- **Server-side availability** computed from working hours, time blocks (holidays, days off) and
  existing bookings, in 30-minute slots
- **No double bookings:** enforced by the database with an exclusion constraint
  (`btree_gist` + `tstzrange`)
- **Admin panel** behind sign-in: confirm or cancel bookings, manage services, professionals,
  working hours and time blocks
- **Row Level Security:** the public can only create `pending` bookings; only admins can read
  customer data
- **Input validation** with Zod in TanStack Start server functions
- Per-page SEO (title, description, Open Graph) and a generated `sitemap.xml`

## Tech stack

| Layer | Technology |
|---|---|
| Front-end | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Framework | TanStack Start / TanStack Router (SSR + server functions) |
| Database & auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| Tooling | Vite, ESLint, Prettier, GitHub Actions |

## Data model

```
services ─────────┐
                  ├── bookings (starts_at, ends_at, status, customer details)
professionals ────┤
                  ├── working_hours (weekday, open_time, close_time)
                  └── time_blocks (days off / holidays; NULL professional = whole salon)
user_roles (admin) ── has_role() used by the RLS policies
```

SQL migrations (schema, policies and fictional seed data) are in
[`supabase/migrations/`](supabase/migrations).

## Getting started

Requirements: Node.js 20+ and a Supabase project.

```bash
git clone https://github.com/ottonielmorais2008-rgb/salon-booking-system.git
cd salon-booking-system
npm ci
cp .env.example .env   # fill in your Supabase URL and publishable (anon) key
npm run dev
```

Apply the migrations with the [Supabase CLI](https://supabase.com/docs/guides/cli):
`supabase link --project-ref <your-project-ref>` and then `supabase db push`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run lint` | ESLint + Prettier checks |
| `npm run format` | Format the code with Prettier |
| `npm run build` | Production build |

CI (GitHub Actions) runs `npm ci`, lint and build on every push and pull request.

## Known issues / roadmap

- **Availability does not see existing bookings.** `getAvailability` reads `bookings` with the
  public (anon) client, but RLS only lets admins read that table, so every slot looks free and a
  conflict is only caught at the end by the exclusion constraint. Planned fix: a
  `SECURITY DEFINER` SQL function that returns only busy intervals (no personal data).
- **Time zone handling.** Times are stored as Lisbon wall-clock values with a `Z` suffix
  (`wallClockISO`). It works for a single salon but is not real UTC. Planned fix: convert
  Europe/Lisbon ↔ UTC explicitly.
- **First sign-up becomes admin.** The `handle_new_user` trigger promotes the first user to admin.
  Disable public sign-ups in Supabase Auth or create the admin manually before going live.
- **Professional ↔ service mapping** is not modelled yet: auto-assignment may pick a professional
  who does not offer that service.
- Some admin and booking handlers still use `any` (reported as lint warnings).
- No automated tests yet; the slot and overlap logic in `src/lib/booking.functions.ts` is the first
  candidate.

## How it was built

The first version was generated with Lovable (AI-assisted development) and the build still uses
the `@lovable.dev/vite-tanstack-config` Vite preset. This repository is a cleaned-up, white-label
version: fictional brand and placeholder images, environment-based configuration, documented
known issues and CI.

## License

Code under the [MIT License](LICENSE). "Studio Demo" and all demo content are fictional.
