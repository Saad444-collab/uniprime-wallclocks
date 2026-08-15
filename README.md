# UniPrime Wall Clocks

A full-stack luxury wall-clock e-commerce platform with a React (Vite) frontend and an Express + MongoDB backend, architected around **8 independent MongoDB Atlas clusters**.

## Features

- **Catalog** — products, categories, subcategories, brands, variants, search, filtering
- **Auth** — register/login with email OTP verification, resend verification, JWT cookie sessions
- **Password recovery** — reset via email link or 6-digit OTP
- **Orders & checkout** — cart, coupons, EasyPaisa payments
- **Wishlist, reviews, contact forms, SEO (sitemap/robots/SSR snapshots)**
- **Multi-currency middleware**
- **Admin panel** — dashboard, products, orders, users, categories, reviews, payments, coupons, contact

## Architecture

The backend uses 8 separate MongoDB Atlas clusters to scale past the free-tier 512MB limit. Each cluster hosts a logical domain:

| Cluster | Domain                     |
|---------|----------------------------|
| 1       | Catalog (products, etc.)   |
| 2       | Users, sessions, wishlist  |
| 3       | Orders, payments           |
| 4       | Reports, documents         |
| 5       | Reviews, contact, feedback |
| 6       | Inventory, stock           |
| 7       | Notifications, analytics   |
| 8       | System & audit logs        |

## Prerequisites

- Node.js 18+
- MongoDB Atlas — create **8 free clusters** (or 1 cluster used by all with per-cluster DB names)

## Getting Started

```bash
# 1. Configure the backend environment
cp .env.example server/.env
#    -> edit server/.env with your Atlas URIs, JWT secret, Gmail app password, etc.

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Seed data (optional)
cd ../server && node seedCategories.js && node seedProducts.js

# 4. Create the initial admin (optional)
node mkadmin.js   # uses ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD in .env

# 5. Run in development (two terminals)
cd server && npm run dev        # API on http://localhost:5000
cd client && npm run dev        # React on http://localhost:5173
```

Or use the provided scripts on Windows: `run-all.bat` (dev) and `run-production.bat` (build + serve).

## Production

```bash
cd client && npm run build      # builds into client/dist
cd server && npm start          # serves API + built client on PORT
```

Set `NODE_ENV=production` in `server/.env`. Configure `CORS_ORIGINS` and `TRUST_PROXY` if behind a proxy.

## Environment Variables

See `.env.example` for the full list with comments. Key variables:

| Variable                | Purpose                              |
|-------------------------|--------------------------------------|
| `MONGO_CLUSTER_1..8_URI`| Atlas connection strings (one per cluster) |
| `MONGO_DB_NAME_CLUSTER_1..8` | Per-cluster database names     |
| `JWT_SECRET`            | JWT signing secret (long random string) |
| `CLIENT_URL`            | Frontend origin (for emails/CORS)    |
| `SMTP_HOST/USER/PASS`   | Gmail SMTP + 16-char App Password    |
| `COOKIE_SAME_SITE` / `COOKIE_SECURE` | Cookie flags (see comments) |
| `EASYPAYSA_*`           | EasyPaisa payment details            |
| `ADMIN_INITIAL_EMAIL/PASSWORD` | Initial admin bootstrap        |

> **Security:** never commit `.env` files. Use Gmail App Passwords (not your Gmail password) for SMTP. Rotate any credentials that were ever committed.

## Project Structure

```
├── client/          # React + Vite + Tailwind frontend
│   └── src/
│       ├── pages/   # Login, Register, VerifyEmail, ResetPassword, Shop, etc.
│       ├── admin/   # Admin dashboard pages
│       ├── context/ # Auth, Theme contexts
│       └── utils/   # API client
└── server/          # Express API
    ├── config/      # 8 cluster connection managers
    ├── controllers/ # Route handlers (auth, products, orders, ...)
    ├── middleware/  # Auth, admin, sanitize, rate-limit, upload
    ├── models/      # Mongoose models grouped by cluster
    ├── repositories/# Data-access layer per domain
    ├── routes/      # Express routers
    ├── services/    # Email, notifications, payments
    └── utils/       # baseRepository, JWT, cookies
```

## License

All rights reserved.