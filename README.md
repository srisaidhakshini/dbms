# 🚀 Deep Space Missions DBMS

A full-stack **Database Management System** for tracking deep-space missions, built as a DBMS course project. It provides a web-based admin interface to manage all entities in a relational space-mission database — from agencies and launch vehicles to telemetry streams and crew astronauts.

---

## ✨ Features

- 🔐 **Secure Admin Authentication** — credential-based login with NextAuth.js (bcrypt-hashed passwords)
- 📊 **Mission Dashboard** — overview of missions by status, budget, and recent activity
- 🛸 **Full CRUD** across all 9 entities:
  - Space Agencies
  - Launch Vehicles
  - Missions
  - Spacecraft
  - Astronauts
  - Payloads
  - Ground Stations
  - Telemetry
  - Experiments
- 📡 **Telemetry Explorer** — browse altitude & velocity data per mission
- 🌙 **Dark / Light mode** toggle
- ⚡ Built on **Next.js 16 (Turbopack)** with **React 19**

---

## 🗃️ Database Schema

PostgreSQL database with the following relational model:

```
SpaceAgency ──< Mission >── LaunchVehicle
                  │
        ┌─────────┼──────────┐
        │         │          │
   Spacecraft  Experiment  Telemetry ──> GroundStation
     │
  ┌──┴──┐
Astronaut  Payload
```

| Table | Description |
|---|---|
| `space_agencies` | Space organizations (NASA, ISRO, etc.) |
| `launch_vehicles` | Rockets used to launch missions |
| `missions` | Core mission records (type, date, budget, status) |
| `spacecraft` | Vehicles assigned to a mission |
| `astronauts` | Crew members aboard spacecraft |
| `payloads` | Scientific/commercial cargo on spacecraft |
| `ground_stations` | Ground control stations |
| `telemetry` | Real-time altitude & velocity readings |
| `experiments` | Scientific experiments per mission |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | [Prisma](https://www.prisma.io) |
| Auth | [NextAuth.js v5](https://authjs.dev) |
| UI | [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4 |
| Charts | [Recharts](https://recharts.org) |
| Hosting (DB) | [Neon](https://neon.tech) (serverless PostgreSQL) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16 (or use Docker / Neon)

### 1. Clone the repository

```bash
git clone https://github.com/srisaidhakshini/dbms.git
cd dbms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
```

> **Also create a `.env` file** (copy of `.env.local`) so Prisma CLI tools like `prisma studio` can read the database URL.

### 4. Set up the database

**Option A — Docker (local)**

```bash
docker compose up -d
```

**Option B — Neon (cloud)**

Create a free database at [neon.tech](https://neon.tech) and paste the connection string into `.env.local`.

### 5. Run migrations & seed data

```bash
npx prisma db push       # apply schema
npm run db:seed          # seed sample data
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected admin pages
│   │   ├── missions/
│   │   ├── agencies/
│   │   ├── spacecraft/
│   │   ├── astronauts/
│   │   ├── launch-vehicles/
│   │   ├── payloads/
│   │   ├── ground-stations/
│   │   ├── telemetry/
│   │   └── experiments/
│   ├── api/                # REST API route handlers
│   └── login/              # Auth page
├── components/             # Shared UI components
├── hooks/                  # Custom React hooks
└── lib/                    # Prisma client, utilities
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed script
```

---

## 🧰 Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run db:seed` | Seed sample data |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Regenerate Prisma client |

---

## 📝 License

MIT