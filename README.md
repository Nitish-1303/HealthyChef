<p align="center">
  <img src="public/favicon.svg" alt="HealthyChef logo" width="84" height="84">
</p>

<h1 align="center">HealthyChef</h1>

<p align="center"><strong>Feed people. Get paid.</strong><br>Invoicing, pantry and payment tracking for meal-prep and nutrition businesses.</p>

## Walkthrough

A 1:40 tour of the app with narration and captions: landing page, dashboard, pantry, and creating and paying an invoice.

https://github.com/user-attachments/assets/592aa415-398f-4587-8baf-85e5a41b1f10

Built by **Yeluru Nitish**.

## What it does

| Area | What you get |
| --- | --- |
| Invoices | Create an invoice for a client from your pantry items. GST and discounts are calculated for you. Invoice numbers (`INV-YYYY-NNNN`) are assigned by the server, in order. |
| Payment status | Mark an invoice paid or pending. An unpaid invoice past its due date shows as overdue. Revenue only counts paid invoices. |
| Pantry | Keep ingredients and dishes with a base price, GST rate and variant, then reuse them on every invoice. |
| PDF | Download an invoice as a PDF. |
| Email | Email an invoice link to the client, or send a reminder. Disabled until email settings are added. |
| Dashboard | See every invoice with its status, filter by status, and search by client or number. |

## Run it locally

You need Node.js 22.13 or newer (the local database uses the SQLite module built into Node).

```bash
npm install
cp .env.example .env     # optional: port, public URL, email settings
npm run seed             # optional: fake demo data in healthychef.sqlite
npm run dev              # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

`npm run seed -- --force` replaces the data in an existing database. The database file is git-ignored, so real data is never committed.

### Local database (SQLite)

Locally the app stores everything in one SQLite file, `healthychef.sqlite` in the project folder (set `HEALTHYCHEF_DB` to use another path). It has three tables: `items`, `invoices` and `line_items`. The API is the same as before.

Coming from the old `db.json`? Start the app once with `db.json` still in the folder. When the SQLite file does not exist yet, the data is imported from `db.json` automatically and a message is printed. After that you can delete `db.json`. To back up, copy `healthychef.sqlite` while the app is stopped.

### Login

The API and the app pages are behind a single-user login. Set a password in `.env`:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | The login password. Required on a server. |
| `ADMIN_USERNAME` | Optional. Default `admin`. |
| `SESSION_SECRET` | Optional. Signs the login cookie. If unset, a key is derived from the password. |
| `DEMO_ENABLED` | Optional. `true` adds a "View demo" button on the login page: a read-only session over fake sample data that can never change or see the real data. |

On your own machine with no `ADMIN_PASSWORD`, login is switched off and a warning is printed. On a server (production or Vercel) the API refuses requests until a password is set. Passwords are checked in constant time, five wrong tries lock an address out for 15 minutes, and the session is a signed, HttpOnly cookie that lasts seven days.

### Settings

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the server listens on. Default `3000`. |
| `APP_URL` | Public base URL used in invoice emails. Default `http://localhost:PORT`. |
| `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` | Needed together to send invoice emails. |

## Deploy on Vercel

The repo deploys to Vercel as is: the built frontend is served as static files and the Express API runs as one serverless function (`api/index.js`). Vercel has no disk that survives between requests, so the hosted app stores its data in a **private Vercel Blob** file.

1. Import the repository in Vercel.
2. In the project, open **Storage**, create a **Blob** store (private) and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` for you.
3. Under **Settings > Environment Variables** add `ADMIN_PASSWORD` (your login password). Add `DEMO_ENABLED` = `true` if you want the read-only demo.
4. Redeploy.

Without that token the API falls back to the local SQLite file, which is fine on your own machine and not on Vercel. The hosted database starts empty.

## Tech

React 19, TypeScript, Vite, Tailwind CSS 4, Express, Zod for request validation, Nodemailer, jsPDF, Motion. Data is stored in SQLite locally and in Vercel Blob when hosted.

## Project structure

```
src/
  components/   Landing page, dashboard, pantry, invoice form, invoice page, navigation
  server/       Login, storage (SQLite and Blob) and request validation
  services/     Email sending
  lib/          Calculations and invoice helpers
scripts/        Demo data seeding
server.ts       Express API and static file server
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login`, `/api/auth/logout`, `/api/auth/demo` | Sign in, sign out, start the demo |
| GET | `/api/auth/me` | Who is signed in |
| GET, POST | `/api/items` | List or add pantry items |
| PUT, DELETE | `/api/items/:id` | Update or remove an item |
| POST | `/api/items/bulk-delete` | Remove several items |
| GET, POST | `/api/invoices` | List or create invoices |
| GET | `/api/invoices/:id` | One invoice |
| PATCH | `/api/invoices/:id/status` | Change status |
| POST | `/api/invoices/:id/remind` | Email a reminder |

## Limits

- One user: a single shared login, no accounts or roles beyond the read-only demo.
- Data lives in one SQLite file (or one Blob file when hosted), which suits a single small business, not many users.
- The login attempt limit is kept in memory, so on Vercel it is per function instance.
- The landing page figures are sample data.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run seed` · `npm run clean`
