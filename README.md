# Homestyle Diner Website & Admin Portal

A complete Next.js application for **Homestyle Diner** — a family-owned restaurant in Waterloo, Ontario, serving homemade comfort food since 1987.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — brand design system
- **MongoDB Atlas** + Mongoose
- **NextAuth.js v5** — secure admin authentication
- **MongoDB-stored uploads** — serverless-safe images (no disk writes)
- **Nodemailer** — email notifications
- **Framer Motion + GSAP + Lenis** — animations & smooth scroll
- **React Hook Form + Zod** — form validation
- **SheetJS (xlsx)** — Excel menu import/export
- **Recharts** — admin analytics

## Quick Start (Local)

```bash
npm install
cp .env.example .env.local   # then edit values
npm run seed                 # creates admin + default content
npm run dev
```

- **Public site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

Default admin (after seed): see `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `.env.local`

## Production Deployment (Vercel)

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and allow network access (`0.0.0.0/0` for Vercel)
3. Copy the connection string → `MONGODB_URI`

### 2. Push to GitHub & import in Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Framework preset: **Next.js** (auto-detected)

### 3. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGODB_URI` | Yes | Atlas connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Same as production URL |
| `SMTP_HOST` | Yes | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | Yes | `587` |
| `SMTP_USER` | Yes | Gmail address |
| `SMTP_PASS` | Yes | Gmail App Password |
| `SMTP_FROM` | Yes | Display name + email |
| `ADMIN_NOTIFICATION_EMAIL` | Yes | Where form alerts go |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Optional | Map embed on homepage |

**Do not** set `ADMIN_SEED_*` in Vercel unless running a one-off seed from your machine against Atlas.

### 4. Deploy

```bash
npm run build   # must pass locally before deploy
```

Vercel runs `npm run build` automatically on push.

### 5. Seed production database (one time)

From your machine with Atlas URI in `.env.local`:

```bash
npm run seed
npm run reset-admin   # if you need to reset admin password
```

### 6. Post-deploy checklist

- [ ] Sign in at `/admin/login`
- [ ] Upload logo in **Settings**
- [ ] Upload hero/content images in **Content**
- [ ] Test contact/booking forms (email delivery)
- [ ] Confirm images load from `/api/uploads/...`

## Image uploads (serverless)

Admin uploads are stored in MongoDB (`StoredUpload` collection) and served at:

```
/api/uploads/{folder}/{filename}
```

Folders: `products` | `gallery` | `pages` | `misc`

No files are written to `public/` — safe for Vercel and redeploys.

> **Note:** Vercel request body limit is ~4.5 MB on Hobby. Keep uploads under 4 MB for reliable deploys, or upgrade plan for larger payloads.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run seed` | Seed MongoDB |
| `npm run reset-admin` | Reset/unlock admin account |
| `npm run import-catalog` | Import 145-item Square menu from `data/homestyle-menu.json` |

## Project Structure

```
src/
├── app/(public)/     # Public website
├── app/admin/        # Admin portal
├── app/api/          # API routes (upload, auth, forms, admin)
├── components/       # UI components
├── lib/              # Auth, DB, email, uploads
└── models/           # Mongoose models
scripts/              # Seed & maintenance scripts
```

## Gmail App Password

1. Enable 2FA on Gmail
2. Google Account → Security → App passwords
3. Generate password for "Mail" → set `SMTP_PASS`

## Business Information

- **Public Name:** Homestyle Diner
- **Legal Name:** Gemini-SR Enterprise Inc. O/A Gemini Homestyle Diner
- **Address:** 504 Albert St, Waterloo, ON N2L 3V4
- **Phone:** 519-725-5048
- **Email:** homestylewaterloo@gmail.com
- **Hours:** Monday–Sunday, 9:00 AM–7:00 PM

## License

Private — Gemini-SR Enterprise Inc.
