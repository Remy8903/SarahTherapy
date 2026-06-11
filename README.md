# TherapySarah

Interactive gamified web application for Speech-Language Pathologists (SLPs) to conduct phonological and speech sound therapy with children.

Therapists create themed game boards with hidden target words under customizable mystery covers. Children drag the covers away to reveal pictures and practice saying the words out loud.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Interactivity | Pointer Events API (touch + mouse unified), CSS transforms |
| Backend | Next.js Route Handlers (API routes) |
| Database & Auth | Supabase (PostgreSQL, Row-Level Security, Auth) |
| Storage | Supabase Storage (background images, card images, cover images) |
| Deployment | Vercel (serverless) |

## Features

- **Therapist Dashboard** — Create, edit, and manage therapy themes
- **Theme Creator Studio** — Upload a background scene, add target words with pictures, assign mystery covers (custom images or color + shape)
- **Session Canvas** — Full-screen, tablet-optimized interactive board where children drag covers to reveal targets
- **Custom Cover Images** — Upload your own picture for what the mystery cover looks like (sticker, character, etc.)
- **Card Pictures** — Upload an image for each word so the child sees a picture and says the word aloud
- **6 Cover Shapes** — Circle, square, star, triangle, diamond, hexagon (via CSS clip-path)
- **8 Cover Colors** — Indigo, rose, emerald, amber, sky, purple, orange, teal
- **Progress Persistence** — Revealed cards sync to the database, progress survives page refresh
- **Row-Level Security** — Therapists can only access their own themes and cards
- **iPad / Touch Optimized** — `touch-action: none`, pointer capture, no-scroll dragging

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com/) account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url> therapysarah
cd therapysarah
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql` and run it
4. This creates the `profiles`, `themes`, and `target_cards` tables with RLS policies, plus storage buckets

If you already ran the initial migration and need to add `cover_image_url`:

```sql
ALTER TABLE public.target_cards ADD COLUMN cover_image_url TEXT;
```

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in **Settings → API** in your Supabase dashboard.

### 4. Configure Auth Redirect URLs

In Supabase **Authentication → URL Configuration**, add:

- `http://localhost:3000` (dev)
- `http://localhost:3000/auth/callback` (auth callback)

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start building themes.

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Public auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/             # Authenticated pages (middleware-protected)
│   │   ├── dashboard/page.tsx   # Therapist's theme list
│   │   └── themes/
│   │       ├── create/page.tsx  # Theme Creator Studio
│   │       └── [themeId]/
│   │           ├── session/page.tsx   # Interactive game canvas
│   │           └── edit/page.tsx      # Edit theme
│   ├── api/themes/              # REST route handlers
│   │   ├── route.ts
│   │   └── [themeId]/
│   │       ├── route.ts
│   │       └── cards/route.ts
│   └── auth/callback/page.tsx
│
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── auth/                    # Login & register forms
│   ├── canvas/                  # Interactive game components
│   │   ├── session-canvas.tsx   # Main game board
│   │   ├── mystery-cover.tsx    # Draggable cover (touch + mouse)
│   │   ├── revealed-card.tsx   # Revealed picture + word
│   │   ├── canvas-controls.tsx # Progress bar, reset, fullscreen
│   │   └── shape-styles.ts     # CSS clip-paths for shapes
│   ├── creator/                 # Theme building forms
│   │   ├── theme-form.tsx
│   │   ├── edit-theme-form.tsx
│   │   ├── word-list-editor.tsx
│   │   └── cover-assigner.tsx
│   └── dashboard/
│       └── theme-card.tsx
│
├── hooks/
│   ├── use-auth.ts              # Supabase auth state
│   ├── use-drag.ts              # Pointer-events drag with reveal threshold
│   └── use-canvas-state.ts     # Card positions + revealed state, synced to DB
│
├── lib/
│   ├── utils.ts                 # cn() helper
│   ├── storage.ts               # Supabase Storage uploads
│   └── supabase/
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server Component client
│       └── middleware.ts         # Session refresh
│
├── types/database.ts            # TypeScript types
└── middleware.ts                 # Auth redirect middleware
```

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | UUID | FK to `auth.users`, PK |
| email | TEXT | NOT NULL |
| full_name | TEXT | |
| updated_at | TIMESTAMPTZ | Auto-updated |

Auto-created via trigger on signup.

### `themes`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK to `profiles` |
| title | TEXT | NOT NULL |
| background_url | TEXT | Stored in Supabase Storage |
| created_at | TIMESTAMPTZ | |

### `target_cards`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| theme_id | UUID | FK to `themes`, CASCADE |
| word_text | TEXT | NOT NULL — the target word/sound |
| image_url | TEXT | Optional picture the child sees when revealed |
| cover_image_url | TEXT | Optional custom cover image |
| cover_color | TEXT | Default `#6366f1` (indigo) |
| cover_shape | TEXT | `circle`, `square`, `star`, `triangle`, `diamond`, `hexagon` |
| x_position | FLOAT | 0–1, normalized horizontal position |
| y_position | FLOAT | 0–1, normalized vertical position |
| revealed | BOOLEAN | Default `false` |
| sort_order | INTEGER | Default `0` |

All tables have Row-Level Security so therapists can only CRUD their own data.

## How the Drag-and-Drop Works

1. **`useDrag` hook** captures `pointerdown` / `pointermove` / `pointerup` events with `setPointerCapture` — works identically on mouse and touch (iPad)
2. When displacement from origin exceeds 150px (configurable `revealThreshold`), the card is marked for reveal on pointer release
3. `onReveal` fires on `pointerup` (not during state updates) to avoid React render-phase errors
4. `useCanvasState` debounces revealed state to Supabase (500ms) so progress persists
5. Positions use normalized 0–1 floats stored in DB, rendered as CSS `left`/`top` percentages for any screen size

## Deployment

### Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
5. Update Supabase redirect URLs to include your production domain

### Supabase Redirect URLs

Add in **Authentication → URL Configuration**:

- `https://your-domain.vercel.app`
- `https://your-domain.vercel.app/auth/callback`

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private — all rights reserved.