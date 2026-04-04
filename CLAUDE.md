# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=         # Random secret stored in the auth cookie value
SITE_PASSWORD=       # Password users enter on the login page
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Architecture

Next.js 14 App Router app for managing laboratory reagents. Stack: TypeScript, Tailwind CSS, Supabase (PostgreSQL), Cloudinary (image storage).

### Authentication

Simple shared-password auth — no Supabase Auth. `middleware.ts` guards all routes by checking a `site-auth` HttpOnly cookie against `AUTH_SECRET`. Login POSTs to `/api/auth`, which validates against `SITE_PASSWORD` and sets the cookie (3-year expiry, intentional).

### Data Flow

- All Supabase reads/writes go through API routes using the **service role admin client** (`lib/supabase-server.ts`) — never exposed to the client.
- `lib/supabase-browser.ts` (anon key) exists but is currently unused — API routes handle all data access.
- The client-side hook `hooks/useReagents.ts` fetches from `/api/reagents` with `category` and `search` query params, with AbortController for cleanup.

### API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth` | POST | Verify password, set `site-auth` cookie |
| `/api/reagents` | GET, POST | List/filter reagents; create new reagent |
| `/api/reagents/[id]` | PATCH, DELETE, PUT | Toggle `is_depleted`; delete reagent + Cloudinary image; update reagent (edit mode) |
| `/api/upload` | POST | Upload image to Cloudinary (`helab-reagents/` folder) |

### Data Model

`Reagent` in `lib/types.ts`. Six categories: `抑制剂`, `抗体`, `siRNA`, `质粒`, `试剂盒`, `探针`.

Two categories have extra fields:
- **siRNA**: `sirna_sense_seq`, `sirna_antisense_seq`, `sirna_tube_count`
- **质粒**: `plasmid_vector_info`, `plasmid_resistance`, `plasmid_is_mutant`, `plasmid_mutation_info`

Images store both `image_url` (Cloudinary CDN URL) and `cloudinary_public_id` (for deletion).

### UI Structure

`app/page.tsx` is a single client component that composes the full main page. Desktop uses `ReagentTable`, mobile uses `ReagentCard` (responsive via Tailwind `md:` breakpoint). `AddReagentModal` handles both add and edit modes:
- **Add mode**: Creates new reagent with image upload
- **Edit mode**: Updates existing reagent with image operations (keep/replace/delete)

Both table and card components have "编辑" buttons that trigger edit mode by setting `editingReagent` state.

## Deployment

**Production URL:** https://he-lab.onrender.com

**Platform:** Render (not Vercel)

**Deployment process:**
1. Push code to GitHub: `git push origin main`
2. Render auto-deploys from the `main` branch
3. Manual deploy: Render Dashboard → Manual Deploy → Deploy latest commit

**Environment variables** must be configured in Render Dashboard → Environment section.

## Recent Updates

**2026-04-04: Added Edit Functionality**
- Added PUT endpoint at `/api/reagents/[id]` for updating reagents
- Extended `AddReagentModal` to support both add and edit modes
- Added edit buttons to `ReagentTable` (desktop) and `ReagentCard` (mobile)
- Image handling in edit mode: keep current image, upload new image, or delete image
- Category field is disabled in edit mode to prevent cross-category field conflicts
