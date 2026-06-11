# TherapySarah — Setup Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Supabase Project](#2-create-a-supabase-project)
3. [Run the Database Migration](#3-run-the-database-migration)
4. [Configure Storage Buckets](#4-configure-storage-buckets)
5. [Clone & Install the Project](#5-clone--install-the-project)
6. [Set Environment Variables](#6-set-environment-variables)
7. [Start the Dev Server](#7-start-the-dev-server)
8. [Create a Therapist Account](#8-create-a-therapist-account)
9. [Project Architecture](#9-project-architecture)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| **Node.js** | 18.x+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x+ | Included with Node.js |
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com/) |
| **Supabase Account** | Free tier | [supabase.com](https://supabase.com/) |

Verify your setup:

```bash
node -v    # v18+ required
npm -v     # v9+ required
git --version
```

---

## 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in (or create an account).
2. Click **New Project**.
3. Fill in:
   - **Name:** `therapysarah` (or your preferred name)
   - **Database Password:** Choose a strong password — save this somewhere
   - **Region:** Pick the closest to your users
4. Click **Create new project** and wait ~2 minutes for provisioning.

---

## 3. Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file `supabase/migrations/00001_initial_schema.sql` from this project.
4. Copy-paste the **entire contents** into the SQL editor.
5. Click **Run**.

This creates:

| Table | Purpose |
|---|---|
| `public.profiles` | Therapist profiles (auto-created on signup via trigger) |
| `public.themes` | Game board/canvas metadata |
| `public.target_cards` | Individual words hidden under mystery covers |

And also:

- **Row-Level Security (RLS) policies** on all tables — therapists can only see/edit their own data
- **A trigger** `on_auth_user_created` that auto-creates a profile row when a user signs up
- **Two storage buckets** — `backgrounds` and `card-images` (public read, auth-gated write)

You can verify in the **Table Editor** that all three tables exist with the correct columns.

---

## 4. Configure Storage Buckets

The migration script already created the buckets, but you need to verify they're set up:

1. Go to **Storage** in the Supabase dashboard.
2. You should see two buckets:
   - `backgrounds` (Public: Yes)
   - `card-images` (Public: Yes)
3. If they don't appear, create them manually:
   - Click **New bucket** → Name: `backgrounds`, toggle **Public** → Create
   - Click **New bucket** → Name: `card-images`, toggle **Public** → Create

The RLS policies for storage are already set by the migration:
- Therapists can upload/delete files only within their own `{user_id}/` folder
- Anyone can view (read) uploaded images (public buckets)

---

## 5. Clone & Install the Project

```bash
# Clone the repository (or copy the project folder)
git clone <your-repo-url> therapysarah
cd therapysarah

# Install dependencies
npm install
```

If you're setting up from scratch without git:

```bash
cd TherapySarah
npm install
```

---

## 6. Set Environment Variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Where to find these values

1. In your Supabase dashboard, go to **Settings** → **API**.
2. **Project URL** → copy to `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** key → copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **service_role secret** key → copy to `SUPABASE_SERVICE_ROLE_KEY`

> **Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## 7. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the TherapySarah landing page with "Sign In" and "Create Account" buttons.

---

## 8. Create a Therapist Account

1. Click **Create Account**.
2. Fill in your full name, email, and password (minimum 6 characters).
3. Click **Create Account**.

Behind the scenes:
- Supabase Auth creates the user
- The `on_auth_user_created` trigger automatically inserts a row into `public.profiles`
- The middleware redirects you to `/dashboard`

### Verifying the database

In Supabase **Table Editor**:
- `profiles` — should have 1 row with your email
- `auth.users` — should show your new user

### Creating your first theme

1. On the dashboard, click **Create New Theme**.
2. Enter a title (e.g., "Ocean Adventure").
3. Upload a background image (e.g., a playground, ocean, or space scene).
4. Add target words using **Add Word** — each gets a cover color and shape.
5. Click **Create Theme**.
6. You'll be redirected back to the dashboard where your theme card appears.
7. Click **Play Session** to launch the interactive canvas.

---

## 9. Project Architecture

### Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Public auth pages
│   │   ├── login/page.tsx         # Sign in
│   │   └── register/page.tsx      # Create account
│   ├── (dashboard)/               # Authenticated pages (middleware-protected)
│   │   ├── dashboard/page.tsx     # Therapist's theme list
│   │   └── themes/
│   │       ├── create/page.tsx    # Theme Creator Studio
│   │       └── [themeId]/
│   │           ├── session/page.tsx  # Interactive game canvas
│   │           └── edit/page.tsx     # Edit theme
│   ├── api/themes/                # Route Handlers (REST API)
│   │   ├── route.ts              # GET themes, POST create theme
│   │   └── [themeId]/
│   │       ├── route.ts          # GET/PATCH/DELETE single theme
│   │       └── cards/route.ts    # GET/POST cards for a theme
│   └── auth/callback/page.tsx    # Supabase auth callback
│
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── auth/                      # Login & register forms
│   ├── canvas/                    # Interactive game components
│   │   ├── session-canvas.tsx     # Main game board
│   │   ├── mystery-cover.tsx     # Draggable cover (touch + mouse)
│   │   ├── revealed-card.tsx     # Revealed word/image display
│   │   ├── canvas-controls.tsx   # Progress bar, reset, fullscreen
│   │   └── shape-styles.ts       # CSS clip-paths for shapes
│   ├── creator/                   # Theme building forms
│   │   ├── theme-form.tsx        # Create theme form
│   │   ├── edit-theme-form.tsx   # Edit theme form
│   │   ├── word-list-editor.tsx  # Add/remove target words
│   │   └── cover-assigner.tsx   # Pick cover color + shape
│   └── dashboard/
│       └── theme-card.tsx        # Theme thumbnail card
│
├── hooks/
│   ├── use-auth.ts               # Supabase auth state hook
│   ├── use-drag.ts               # Pointer-events drag with threshold
│   └── use-canvas-state.ts       # Card state + DB sync
│
├── lib/
│   ├── utils.ts                  # cn() helper (shadcn)
│   ├── storage.ts                # Supabase Storage upload helpers
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── server.ts            # Server Component Supabase client
│       └── middleware.ts        # Session refresh logic
│
├── types/
│   └── database.ts              # TypeScript types for DB tables
│
└── middleware.ts                 # Next.js middleware (auth redirect)
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Server Components by default** | Data fetching in `page.tsx` via Supabase server client; `'use client'` only for interactive components |
| **Pointer Events API** | Unified mouse + touch handling; `touch-action: none` prevents scroll conflicts on iPad |
| **Normalized coordinates (0–1)** | `x_position`/`y_position` stored as floats → render as CSS `%` for resolution independence |
| **CSS clip-path for shapes** | Lightweight, no canvas dependency; star/diamond/triangle/circle/square/hexagon |
| **Debounced DB sync** | Revealed state syncs to Supabase with 500ms debounce to avoid excessive writes |
| **RLS everywhere** | Every table and storage bucket scoped to `auth.uid()` — no API-key auth bypass in the UI layer |

### Data Flow

```
[Therapist signs up]
    ↓
Supabase Auth creates user → Trigger inserts into profiles
    ↓
[Create Theme]
    ↓
Upload background → Supabase Storage → get public URL
    ↓
Insert theme + target_cards → Supabase PostgreSQL
    ↓
[Play Session]
    ↓
Server Component fetches theme + cards → passes to SessionCanvas
    ↓
Child drags cover past 150px threshold → useDrag fires onReveal
    ↓
useCanvasState marks card revealed → debounced sync to Supabase
    ↓
Progress bar updates → therapist sees X/Y revealed
```

### Environment Variables

| Variable | Where Used | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes only (not yet used in current code) | Optional |

---

## 10. Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` values match the Supabase dashboard exactly.
- Make sure there are no trailing spaces or quotes in the env values.

### Auth redirect not working
- Ensure your Supabase project's **Site URL** is set to `http://localhost:3000` in **Authentication** → **URL Configuration**.
- The middleware at `src/middleware.ts` handles session refresh and redirects.

### "relation 'profiles' does not exist"
- You haven't run the migration. Go back to [Step 3](#3-run-the-database-migration).

### File uploads fail (403)
- Check that the storage buckets `backgrounds` and `card-images` exist.
- Verify the RLS policies were created (run the migration again or check in **Authentication** → **Policies**).
- Uploads require the file path to start with `{user_id}/`.

### Touch dragging doesn't work on iPad
- Ensure the `touch-action: none` CSS property is applied to draggable elements. The `MysteryCover` component includes `className="touch-none"` which sets this.

### Build errors after pulling changes
```bash
rm -rf .next
npm install
npm run build
```

### Reset all revealed cards
In the Supabase SQL Editor:
```sql
UPDATE target_cards SET revealed = false;
```

### Delete all themes and start fresh
```sql
DELETE FROM target_cards;
DELETE FROM themes;
```

---

## Deploying to Vercel

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com/) → **New Project** → Import your repo.
3. Set the **Framework Preset** to **Next.js** (auto-detected).
4. Add environment variables in Vercel's settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Update your Supabase **Site URL** to your Vercel deployment URL (e.g., `https://therapysarah.vercel.app`).
6. Deploy.

### Important: Supabase redirect URLs

In Supabase **Authentication** → **URL Configuration**, add:
- `http://localhost:3000` (dev)
- `https://your-vercel-app.vercel.app` (production)
- `https://your-vercel-app.vercel.app/auth/callback` (auth callback)