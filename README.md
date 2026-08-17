# Recipebook

Store and edit your recipes instead of writing them down, upload photos, and let
other people browse, like, and comment on them. Recipes are grouped by a fixed
category (Breakfast, Salad, Bread, Dessert, etc. — see `src/lib/categories.ts`)
for browsing, plus free-form tags for finer-grained search.

Any recipe, public or private, can be shared as a read-only page at
`/share/[recipeId]` via the Share button — no login required to view it, and it
has no edit/comment/like controls. This is "unlisted" access, the same model as
a Google Docs share link: knowing the (unguessable) URL is what grants access,
not the recipe's public/private setting. Don't share the link for a private
recipe anywhere you wouldn't want it to end up.

Built with Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL + Prisma,
and NextAuth (Auth.js). Photos are uploaded to a Google Drive folder rather than
stored on the server, to keep hosting storage/cost small. The UI is mobile-first
(bottom tab bar, big tap targets, camera-friendly photo picker) but the recipe
editor is also built for fast keyboard entry on a laptop (Enter to add another
ingredient/step, paste a whole list at once).

## Tech stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS 4
- **PostgreSQL** via **Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **NextAuth v5** (Credentials provider, JWT sessions, bcrypt password hashing)
- **Google Drive API** (`googleapis`, service account) for photo storage

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Start a local Postgres database

Easiest with Docker:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password/db all set to
`recipebook` (see `docker-compose.yml`). If you'd rather use a Postgres install
you already have running, just point `DATABASE_URL` at it instead.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

- `DATABASE_URL` — already set correctly for the Docker Compose database above.
- `AUTH_SECRET` — generate one with `openssl rand -base64 32`.
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
  `GOOGLE_DRIVE_FOLDER_ID` — see [Setting up Google Drive photo storage](#setting-up-google-drive-photo-storage)
  below. The app runs fine without these; photo upload will just show a clear
  "not configured" error until you add them.

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Setting up Google Drive photo storage

Recipe photos are uploaded through a **Google service account** into a Drive
folder you own, then served via public view links. This means photos don't
consume your app server's or Railway's disk space.

1. **Create a Google Cloud project** (or reuse one) at
   [console.cloud.google.com](https://console.cloud.google.com/).
2. **Enable the Google Drive API**: APIs & Services → Library → search
   "Google Drive API" → Enable.
3. **Create a service account**: APIs & Services → Credentials → Create
   Credentials → Service account. Give it any name (e.g. `recipebook-uploader`).
4. **Create a key** for the service account: open it → Keys tab → Add Key →
   Create new key → JSON. This downloads a JSON file containing `client_email`
   and `private_key`.
5. **Create a Drive folder** (in your own Google Drive) to hold recipe photos,
   and **share it** with the service account's email address (the
   `client_email` from the JSON file) as an Editor.
6. **Copy the folder ID** from the folder's URL:
   `https://drive.google.com/drive/folders/<FOLDER_ID>`.
7. Set the three env vars:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = the `client_email` value.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = the `private_key` value, quoted,
     with its `\n` sequences kept literal (most `.env` and Railway variable
     editors handle this fine as one line).
   - `GOOGLE_DRIVE_FOLDER_ID` = the folder ID from step 6.

Uploaded photos are made viewable by "anyone with the link" (not listed/searchable)
so they can be displayed as `<img>` tags in the app; nothing else in the Drive
folder or account is exposed.

## Deploying to Railway

1. **Create a new Railway project** from this GitHub repo.
2. **Add a PostgreSQL database** to the project (Railway's "New" → Database →
   PostgreSQL). Railway will inject a `DATABASE_URL` reference variable — set
   the app service's `DATABASE_URL` to `${{Postgres.DATABASE_URL}}` (or
   whatever Railway names the reference).
3. **Set environment variables** on the app service:
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your Railway public URL, e.g. `https://your-app.up.railway.app`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
     `GOOGLE_DRIVE_FOLDER_ID` — from the Google Drive setup above.
4. **Build/start commands** — Railway auto-detects Next.js via Nixpacks; the
   defaults (`npm run build` / `npm run start`) work as-is.
5. **Run the initial migration** against the production database once, either
   via `railway run npx prisma migrate deploy` (with the Railway CLI linked to
   the project) or by adding it as a Railway deploy/release command.

No persistent volume is needed — the database holds all recipe data, and
photos live in Google Drive rather than on disk.

## Project structure

```
src/
  app/                 Pages and API routes (Next.js App Router)
    api/                 REST-ish API routes (recipes, comments, likes, upload, auth)
    recipes/[id]/         Recipe detail + edit pages
    recipes/new/          New recipe page
    my-recipes/            Signed-in user's own recipes
    login/, register/      Auth pages
  components/           Client/server UI components
  lib/                  Prisma client, Google Drive upload, validation
  auth.ts               NextAuth configuration
prisma/schema.prisma   Database schema
```
