# AKM Public Sr. Sec. School — Website

School website with an admin panel, so staff can update notices, photos, results
and page text without touching code.

**Next.js** (website + admin) and **Express + Prisma + MySQL** (API) run as
**one process on one port**.

```
akm-school/
├─ apps/
│  ├─ web/   Next.js — public site + admin panel
│  └─ api/   Express + Prisma — API, and it serves the website too
└─ Doc/      the original single-file static site, kept for reference
```

> Server addresses, usernames and passwords are **not** in this file — this
> repository is public. Keep them in your own notes.

---

# Part 1 — Running it on your own computer

You need **Node.js 20 or newer** (`node -v` to check) and **MySQL** (XAMPP is fine).

### 1. Get the code

```bash
git clone <repository-url> akm
cd akm
npm install
```

### 2. Create an empty database

In phpMyAdmin, or on the MySQL command line:

```sql
CREATE DATABASE akm_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create the two settings files

They are not in git (they hold passwords), so a fresh clone has neither:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Windows PowerShell:

```powershell
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
```

Open `apps/api/.env` and set **one** line — your MySQL details:

```
DATABASE_URL="mysql://root@localhost:3306/akm_school"
```

XAMPP's `root` has no password. If yours has one, write `root:yourpassword@`.

> `REVALIDATE_SECRET` must be **the same text** in both files. Anything will do
> on your own machine.

### 4. Create the tables and load the starting content

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
node prisma/seed/index.js
cd ../..
```

### 5. Start it

```bash
npm run dev
```

Wait for `Website ready`, then open:

| | |
|---|---|
| Website | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin/login |

Sign in with the email and password printed by the seed command.

> **Only one server at a time.** Two `npm run dev` from the same folder, or a
> `npm run build` while one is running, corrupt each other's files and every
> page starts failing. If that happens: stop everything, delete
> `apps/web/.next`, start again.

---

# Part 2 — Putting it on a server, the first time

Do these in order. Each step assumes the one before it worked.

### Step 1 — Connect to the server

```bash
ssh <username>@<server-ip>
```

If your provider uses a different SSH port, add `-p <port>`.

When it asks for the password, **nothing appears on screen as you type** — no
dots, no stars. That is normal. Type it and press Enter.

### Step 2 — Check what the server already has

```bash
node -v
npm -v
which git pm2 nginx mysql
```

`node -v` must be **20 or higher**. If anything is missing, ask your hosting
provider to install it — the rest of these steps assume it is there.

### Step 3 — Download the code

```bash
cd <your-web-folder>
git clone <repository-url> .
npm install
```

The `.` at the end means "into this folder". `npm install` takes 2–4 minutes and
prints a lot of warnings — those are normal, only red `npm error` lines matter.

### Step 4 — Create the database

Create an empty database through your hosting panel, then confirm you can reach it:

```bash
mysql -u <db-user> -p -e "SHOW DATABASES;"
```

### Step 5 — Generate three secrets

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it **three times** and keep each result. Never reuse the example values —
they are public in this repository.

### Step 6 — Create `apps/api/.env`

```bash
nano apps/api/.env
```

```
NODE_ENV=production
PORT=<the port your provider gave you>
API_PREFIX=/api/v1

DATABASE_URL="mysql://<db-user>:<db-password>@localhost:3306/<db-name>"

JWT_ACCESS_SECRET=<secret 1>
JWT_REFRESH_SECRET=<secret 2>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CORS_ORIGINS=https://<your-domain>

UPLOAD_DIR=uploads
MAX_IMAGE_MB=2
MAX_DOCUMENT_MB=20

PUBLIC_BASE_URL=https://<your-domain>

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="AKM School <no-reply@your-domain>"
ENQUIRY_NOTIFY_TO=<school email>

REVALIDATE_SECRET=<secret 3>

SEED_ADMIN_NAME="School Administrator"
SEED_ADMIN_EMAIL=<admin email>
SEED_ADMIN_PASSWORD=<a strong password>
```

Save with `Ctrl+O`, Enter, then `Ctrl+X`.

**Three things people get wrong here:**

- `PUBLIC_BASE_URL` must be your real `https://` address. Leave it as localhost
  and **every uploaded image breaks, with no error message anywhere**.
- If the database password contains `@ # ? / :`, it breaks the connection
  string. Convert it first and paste the result instead:
  ```bash
  node -e "console.log(encodeURIComponent('your-password'))"
  ```
- Do **not** add `REVALIDATE_URL`. It is worked out from `PORT` automatically.

### Step 7 — Create `apps/web/.env.local`

```bash
nano apps/web/.env.local
```

```
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_SITE_URL=https://<your-domain>
REVALIDATE_SECRET=<secret 3 — exactly the same as in the other file>
```

Then lock both files so only you can read them:

```bash
chmod 600 apps/api/.env apps/web/.env.local
```

### Step 8 — Create the tables and content

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
node prisma/seed/index.js
npx prisma migrate status
cd ..
```

The last command should say **"Database schema is up to date!"**

> Run the seed **once only**. Running it again later replaces everything the
> school has written with the default text.

### Step 9 — Build the website

```bash
npm run build
```

You will see errors like `ECONNREFUSED`. **This is expected** — the site is not
running yet, so the pages cannot read the database and fall back to built-in
text. Step 11 fixes that.

Check the table it prints: every page should show a real size (`1.98 kB`,
`117 kB`). If everything says `0 B`, the build failed — delete `apps/web/.next`
and run it again.

### Step 10 — Start it and keep it running

```bash
cd apps/api
pm2 start src/server.js --name akm
pm2 save
pm2 logs akm --lines 20 --nostream
```

You should see `Website ready` and `Running on http://localhost:<port>`.

Confirm it answers:

```bash
curl -s http://127.0.0.1:<port>/health
```

Expected: `{"success":true,...,"servingFrontend":true}`

### Step 11 — Load the real content into the pages

Because of Step 9, the pages currently show the built-in text rather than your
database. One command fixes it:

```bash
cd ..
SECRET=$(grep "^REVALIDATE_SECRET=" apps/api/.env | cut -d= -f2)
curl -s -X POST http://127.0.0.1:<port>/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: ${SECRET}" \
  -d '{"tags":["home","settings","notices","gallery","achievements","faculty","facilities","streams","stages","downloads","announcements"]}'
```

Expected: `{"success":true,"revalidated":[...]}`

### Step 12 — Point the domain at the app

This is done in your hosting panel, not the terminal. Set up a **reverse proxy**
from your domain to `http://127.0.0.1:<port>`, then turn on **SSL / Let's Encrypt**.

> **HTTPS is required.** The sign-in cookie is marked "secure" in production, so
> over plain `http://` the admin panel will log you straight back out.

### Step 13 — Survive a reboot

```bash
pm2 startup
```

It prints a line starting with `sudo`. Copy that line, run it, then:

```bash
pm2 save
```

**Without this the site stays down after any server restart.** This command only
registers a startup entry — it does not touch your files, images or database.

### Step 14 — Finally

1. Sign in to `/admin/login` and **change the password immediately**.
2. Send a test enquiry and check it appears in the admin panel.
3. Upload one image and confirm it displays — this proves `PUBLIC_BASE_URL` is right.

---

# Part 3 — Everyday commands

Run these from the project folder on the server.

### The order changes are published in

Changes always travel the same way. Skipping a step is the usual cause of
"I changed it but nothing happened".

```
  YOUR COMPUTER                          THE SERVER
  ─────────────                          ──────────
  1. edit the code
  2. npm run build      (check it works)
  3. git add . && git commit
  4. git push  ──────────────────────▶
                                         5. git pull
                                         6. npm install
                                         7. npm run build
                                         8. pm2 restart akm
                                         9. clear the cache
```

The server never edits code — it only receives what you pushed.

> Stop your local server before step 2. A build while a server is running
> corrupts the shared `apps/web/.next` folder and both break.

### `pm2 start` or `pm2 restart`?

| Situation | Command |
|---|---|
| **First deployment only** | `pm2 start src/server.js --name akm` |
| **Every time after that** | `pm2 restart akm` |

Running `pm2 start` a second time fails with *"Script already launched"* — the
app is already registered. Check with `pm2 status`: if `akm` is listed, use
`restart`. Only if the list is empty do you need `start` again.

### After adding new page text (new settings)

New CMS fields are added by the seed file, but the seed also **resets
everything else to the defaults**. To add only what is new, without touching
what the school has written:

```bash
cd apps/api
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.setting.findMany({ select: { key: true } });
  console.log('Existing settings:', rows.length);
  await p.\$disconnect();
})();
"
```

If the count is lower than expected, the safe fix is to add the missing keys
through **Admin → Website Content**, or ask the developer for a one-off script.
Do not run the full seed on a site the school has already edited.

### Is it running?

```bash
pm2 status                                # should say "online"
curl -s http://127.0.0.1:<port>/health    # should return JSON
pm2 logs akm --lines 40 --nostream        # recent activity
```

### Publishing new code

```bash
git pull
npm install
npm run build
pm2 restart akm
```

Then clear the cached pages, or the site keeps showing the old version:

```bash
SECRET=$(grep "^REVALIDATE_SECRET=" apps/api/.env | cut -d= -f2)
curl -s -X POST http://127.0.0.1:<port>/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: ${SECRET}" \
  -d '{"tags":["home","settings","notices","gallery","achievements","faculty","facilities","streams","stages","downloads","announcements"]}'
```

If the database changed, add this between `npm install` and `npm run build`:

```bash
cd apps/api && npx prisma migrate deploy && cd ..
```

> **`git pull` on its own is not enough.** It only fetches the source. The
> website keeps running the old version until `npm run build`.

### Backups — once a month

```bash
mysqldump -u <db-user> -p <db-name> > backup-$(date +%F).sql
tar -czf uploads-$(date +%F).tar.gz apps/api/uploads
```

**Both files are needed.** Photos and PDFs live on disk, not in the database — a
database backup alone will not bring them back. Download both and keep them
somewhere other than the server.

### Never run these on the server

| Command | What it does |
|---|---|
| `npm run db:reset` | **Deletes the whole database** without asking |
| `npx prisma migrate dev` | Can reset data — servers use `migrate deploy` |
| `node prisma/seed/index.js` | Overwrites the school's content with the defaults |

---

# Part 4 — When something is wrong

### The website will not load

```bash
pm2 restart akm
pm2 logs akm --lines 50 --nostream
```

Still down:

```bash
pm2 delete akm
cd apps/api && pm2 start src/server.js --name akm && pm2 save
```

### Pages look broken or have no styling

The build output is damaged. Rebuild it:

```bash
rm -rf apps/web/.next
npm run build
pm2 restart akm
```

`.next` is generated from your source — deleting it is always safe.

### Admin changes do not show on the website

Cached pages. Run the revalidate command from Part 3.

If it still will not update, check the port matches:

```bash
grep -E "^(PORT|REVALIDATE_URL)=" apps/api/.env
```

`REVALIDATE_URL` should normally be absent — it is derived from `PORT`.

### Sign-in fails with "Something went wrong"

Usually the site's own address is not allowed:

```bash
grep -E "^(CORS_ORIGINS|PUBLIC_BASE_URL)=" apps/api/.env
pm2 logs akm --lines 30 --nostream | grep -i cors
```

Both should be your real `https://` domain.

### An uploaded image does not appear

```bash
grep "^PUBLIC_BASE_URL=" apps/api/.env
ls -la apps/api/uploads/misc/ | tail -5
```

A wrong `PUBLIC_BASE_URL` breaks every image silently.

### An upload is rejected

Working as intended:

| Type | Limit |
|---|---|
| Images | JPG or PNG · up to 2 MB |
| Documents | PDF, Word, Excel · up to 20 MB |

### Undo a bad deployment

```bash
git log --oneline -5
git reset --hard <commit-id>
npm install
npm run build
pm2 restart akm
```

---

# Part 5 — How the code is arranged

### Frontend — `apps/web/src`

```
app/
  layout.jsx        fonts, page titles, notifications
  (public)/         every visitor-facing page
  admin/            admin panel, its own layout, never indexed
  api/revalidate/   cache-clearing hook the API calls
components/
  layout/           header, footer, ticker, logo, preloader
  home/             the homepage sections, reused on inner pages
  forms/            enquiry form, login form
  ui/               buttons, inputs, modals, tables — generic pieces
  admin/            admin-only components
lib/                api access, auth, formatting, SEO
constants/          navigation, CMS field map, upload rules
data/fallback.js    built-in content used when the API is unreachable
```

Folder names become URLs: `app/(public)/about/page.jsx` → `/about`.
`(public)` is a grouping only — it does not appear in the address.

### Backend — `apps/api/src`

```
Route → Middleware → Controller → Service → Repository → Prisma → MySQL
                          ↓
                     ApiResponse
```

- `repositories/` is the **only** place that talks to the database.
- `services/` hold the rules and never touch `req` / `res`.
- `controllers/` are thin: read request → call service → send response.
- Every error becomes a response in one file: `middlewares/error.middleware.js`.

### The safety net

Pages read through `lib/serverApi.js`, which falls back to
`data/fallback.js` whenever the API cannot be reached. If the database goes
down, visitors see the last known content instead of an error page.

---

# Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start everything for development |
| `npm start` | Start in production mode (build first) |
| `npm run build` | Build the website |
| `npm run lint` | Check the code |
| `npm run db:deploy` | Apply database changes (use this on servers) |
| `npm run db:seed` | Load starting content — **first install only** |
| `npm run db:studio` | Browse the database in a web page |
