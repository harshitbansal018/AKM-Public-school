# @akm/api — Express + Prisma + MySQL

REST API behind the AKM school website. MVC layering, JSON only.

## Layering

```
Route → Middleware → Controller → Service → Repository → Prisma → MySQL
                          ↓
                     ApiResponse  (the "V" — the JSON envelope)
```

Rules that keep this honest:

- `repositories/` is the **only** place that imports `prisma`.
- `services/` hold the business logic and never touch `req` / `res`.
- `controllers/` are thin: read request → call service → send response.
- `serializers/` decide what the client may see (a password hash never leaves).
- Every error becomes a response in exactly one place: `middlewares/error.middleware.js`.

Every endpoint answers in one envelope:

```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

## Setup

```bash
cp .env.example .env      # set DATABASE_URL
npx prisma generate
npx prisma migrate dev
node prisma/seed/index.js
npm run dev               # http://localhost:5000
```

Seeded admin: `admin@akmpublicschool.in` / `Admin@12345` — change it before deploying.

## Layout

```
prisma/
  schema.prisma        14 models
  migrations/          versioned schema history
  seed/index.js        the content from the original static page
src/
  config/              env, prisma client, cors, multer, constants
  repositories/        data access — the only Prisma consumers
  services/            business logic
  controllers/         public/ and admin/
  routes/              public.routes.js, admin.routes.js
  middlewares/         auth, role, validate, upload, rateLimit, honeypot, error
  validators/          Zod request schemas
  serializers/         output shaping
  utils/               ApiError, ApiResponse, asyncHandler, jwt, password, …
templates/email/       enquiry notification templates
uploads/               user-uploaded images and documents
```

## Security notes

- Access token (15 min) in the `Authorization` header; refresh token (7 days) in an
  httpOnly cookie scoped to `/api/v1/admin/auth`, so XSS cannot read it.
- Wrong email and wrong password return the same message, and a missing account
  still runs a bcrypt hash — neither lets you enumerate staff accounts.
- The enquiry form is rate limited (5/hour/IP) and carries a honeypot field.
- Upload filenames are generated, never taken from the client.
- The counted download route resolves paths and refuses anything outside `uploads/`.
- CSV export prefixes `=`, `+`, `-`, `@` so Excel cannot execute a cell as a formula.
- The last active ADMIN account cannot be deleted.
