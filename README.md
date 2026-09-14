# Secure Document Management System (SDMS)

Full-stack: Next.js + Tailwind (frontend) · Express + MongoDB (backend)

## Phase 1 — Setup checklist

### 1. Initialize Git (run at the repo root, one level above `frontend/` and `backend/`)
```bash
git init
git add .
git commit -m "Phase 1: project scaffold"
```
Create a GitHub repo, then:
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
- `MONGO_URI` — get this from MongoDB Atlas (free M0 cluster is enough for dev)
- `JWT_SECRET` — generate one with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `STORAGE_PROVIDER` + the matching section (S3, R2, or Cloudinary) — you can leave these blank until Phase 4

Run it:
```bash
npm run dev
```
Visit `http://localhost:5000/api/health` — you should see `{"status":"ok", ...}`.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Visit `http://localhost:3000` — you should see the placeholder landing page.

## Folder structure
```
sdms/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # Mongoose connection
│   │   ├── controllers/          # (Phase 3+)
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js
│   │   ├── models/                # (Phase 2)
│   │   ├── routes/                # (Phase 3+)
│   │   ├── services/              # (Phase 4+)
│   │   ├── utils/
│   │   └── app.js                 # Express app + middleware stack
│   ├── server.js                  # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   └── globals.css
    ├── components/                # (Phase 7)
    ├── lib/api.js                 # Axios client w/ JWT interceptor
    ├── .env.local.example
    └── package.json
```

## What's already working after Phase 1
- Express server boots, connects to MongoDB, exposes `/api/health`
- Security middleware stack in place: Helmet, CORS (locked to `CLIENT_ORIGIN`), rate limiting, mongo-sanitize
- Centralized error handling (`notFound` + `errorHandler`)
- Next.js + Tailwind rendering a placeholder page
- Axios client pre-wired to attach a JWT once login exists (Phase 3)

## Next: Phase 2
Build out the six Mongoose schemas (`User`, `Document`, `Folder`, `Share`, `Version`, `AuditLog`) in `backend/src/models/`.
