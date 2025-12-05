# TwalabaConf

TwalabaConf is a Next.js conference website template built for the Twalaba conference. It includes an admin area, public pages for schedule, gallery, guests, and simple Supabase integration for data/storage.

## Overview

- **Framework:** Next.js (app router)
- **Styling:** global CSS in `app/globals.css` and project-specific styles in `publication-web-resources/css`
- **Auth / DB / Storage:** Supabase client helpers in `lib/supabase/client.ts` and server helpers in `lib/supabase/server.ts`
- **Project goal:** Provide a lightweight conference site with an admin interface to manage gallery, schedule, and guest pages.

## Features

- Public pages: home, brochure, publications
- Admin pages: login, gallery management, guests, schedule
- Supabase integration for storing content and serving assets
- Static/public resources in `public/` and `publication-web-resources/`

## Quick Start

1. Install dependencies

```powershell
npm install
```

2. Create a `.env.local` file at the project root (see sample below)

3. Run the dev server

```powershell
npm run dev
# open http://localhost:3000
```

4. Build for production

```powershell
npm run build
npm run start
```

## Required Environment Variables

The project uses Supabase and Next.js environment variables. Create a `.env.local` (do NOT commit it) with values appropriate for your Supabase project.

Example `.env.local` (replace values with your own credentials):

```env
# Public Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://url.supabase.co

# Public (publishable) key — safe to expose in client builds
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_Nb-gfddgfdgdfgg_KiSnjZnU

# Optional server-side secret (store in environment for server-only access)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NEXT_PUBLIC_ variables are available to client code. Any secret keys must NOT be prefixed with NEXT_PUBLIC.
```

Security note: never commit `.env.local` or any secret keys to source control. Keep publishable keys separate from service-role keys.

## Project Structure (high level)

- `app/` - Next.js app routes and pages (public + admin)
- `components/` - shared React components (`Navbar`, `Footer`)
- `lib/supabase/` - Supabase client and server helper wrappers
- `public/` - static assets and manifest
- `publication-web-resources/` - legacy publication HTML/CSS/JS resources
- `supabase/schema.sql` - DB schema used when initializing Supabase

## Supabase Setup Notes

1. Create a Supabase project at https://app.supabase.com
2. Copy your project URL and publishable anon key into `.env.local` (see above)
3. Use `supabase/schema.sql` to create tables if needed (via Supabase SQL editor)

## Deployment

- Vercel works well for Next.js apps. Add the same environment variables to your Vercel project settings.
- If you deploy elsewhere, ensure `NEXT_PUBLIC_SUPABASE_URL` and other required variables are set in the runtime environment.

## Development Tips

- Admin pages live under `app/admin/` — check `app/admin/login/page.tsx` for login flow.
- Check `lib/supabase/client.ts` for client-side usage patterns.
- Static images and assets should go into `public/assets` to be served by the app.

## Contributing

1. Fork the repository
2. Create a new branch
3. Open a pull request with a clear description of changes

## License

This repository does not include an attached license file. Add a `LICENSE` if you intend to publish under an open license.

---

If you'd like, I can also add a `.env.example` file with the sample variables and a `.gitignore` entry reminder to exclude `.env.local` from commits. Tell me if you want that and I'll add it.
