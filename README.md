# Balaji Holidays — Full-Stack Travel Agency Website

A modern, mobile-responsive, database-driven travel & vehicle rental platform for
**Balaji Holidays, Shivamogga, Karnataka, India**.

> **No online payments.** This platform calculates **estimated trip prices**, lets customers
> **submit booking requests / enquiries**, and the **final price is confirmed manually** by Balaji
> Holidays (by phone / WhatsApp). There is no checkout, no card input, no UPI, no payment gateway.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Database | Prisma ORM — SQLite (demo) / PostgreSQL (production) |
| Auth | Email and password accounts with signed httpOnly sessions |
| Distance | Pluggable routing (demo estimate / Google Maps / OpenRouteService) |
| Maps | Google Maps embed (configurable) |

---

## Quick Start

```bash
npm install          # installs deps + runs `prisma generate`
npx prisma db push   # create the SQLite database (dev.db)
npm run db:seed      # seed demo vehicles, drivers, packages, gallery, admin
npm run db:seed          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### Demo logins

- **Admin:** `admin@balajiholidays.in` / `change-me-before-production` → log in at `/admin/login`
- **Customer:** create an account with an email address and password at `/login`

---

## PostgreSQL (production)

The demo ships with SQLite for zero-setup local running. To use PostgreSQL:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` → `provider = "postgresql"`.
2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string.
3. Run `npx prisma migrate dev --name init` (or `db push`) and re-seed.

All schema fields are cross-compatible (statuses stored as strings instead of DB enums).

---

## Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"            # or postgresql://... for production
SESSION_SECRET="a-long-random-secret"   # used to sign session cookies
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Distance routing
DISTANCE_PROVIDER="demo"                # demo | google | openrouteservice
MAPS_API_KEY=""

# Admin credentials used by the seed script
ADMIN_EMAIL="admin@balajiholidays.in"
ADMIN_PASSWORD="change-me-before-production"
```

> **No payment credentials** — this site does not process payments.

### Distance provider behaviour
- `demo` (default): road distance estimated from built-in city coordinates (a straight-line ×
  road-factor heuristic), clearly labelled as an *estimate*. No API key required.
- `google` / `openrouteservice`: real road distance via the Directions API when `MAPS_API_KEY` is set.
- If distance fails, the customer can enter distance manually (or contact Balaji Holidays).

---

## Features

### Customer
- Homepage hero, highlights, quick price calculator, fleet & package previews
- **Trip Price Calculator** — pickup/destination, dates, passengers, one-way/round-trip →
  estimated distance → **vehicle comparison table** with per-vehicle estimated price
- Pricing engine: `Distance × Price Per KM` + optional admin-enabled extras (driver allowance,
  toll, parking, permit, night, waiting, fixed, seasonal)
- **Minimum billing km** rule shown transparently (actual vs. billable distance)
- Vehicle fleet page + vehicle detail pages with inline price estimator
- Package trips + per-package enquiry
- Gallery, About (owner + drivers), Contact (map, phones, Instagram, WhatsApp)
- **Booking wizard**: trip → vehicles → driver (optional) → details → submit →
  confirmation with booking ID
- Customer dashboard: profile, upcoming/previous trips, enquiries
- Sticky WhatsApp + call buttons, pre-filled WhatsApp message

### Admin (`/admin`)
- Dashboard with stat cards + charts (bookings by month, vehicle usage)
- Vehicle management (add/edit/delete, capacity, price/km, min km, images, status, active)
- **Pricing management** (per-vehicle price/km + toggleable extra charges)
- Booking management (status, **final confirmed price**, assign driver, notes, contact customer)
- Enquiry & package-enquiry management
- Driver management (assign vehicles, availability)
- Package management (CRUD, pricing type, itinerary, images)
- Gallery management
- Site content & settings (business info, hero, WhatsApp, SEO, owner)

### Business rules enforced
- **Estimated vs. final price** are separate fields; estimates always show the disclaimer:
  *"Estimated Price Only… final pricing will be confirmed by Balaji Holidays."*
- **Availability**: a vehicle already booked for overlapping dates is shown as
  *"Unavailable for the selected dates"* and cannot be booked.
- **No fake prices**: seeded rates are demo values, editable by admin.
- SEO: metadata, sitemap.xml, robots.txt, Open Graph, LocalBusiness JSON-LD.
- Security: hashed passwords, signed httpOnly session cookies, server-side
  validation (Zod), Prisma (SQL-injection safe), admin route protection, audit logs.

---

## Project Structure

```
prisma/            schema.prisma, seed.ts
src/
  actions/         server actions (auth, booking, enquiry, trip calc, admin)
  app/             App Router pages (customer + admin)
  components/      reusable UI + feature components
  lib/             db, auth/session, password, distance, pricing engine, settings, validation
public/images/     demo imagery
```

---

## Notes / Limitations (demo build)

- Imagery under `public/images/` is AI-generated placeholder artwork.
- File uploads use image **URLs** (bundled `/images/*` or hosted URLs). For production uploads,
  connect Supabase Storage / Cloudinary / S3.
- Real routing (Google/ORS) requires keys via `.env`.
