# 🔐 SDMS — Secure Document Management System

A full-stack document management platform where users can securely upload, organize, share, version, and audit their files — built end-to-end with the MERN stack.

> Built as a portfolio project to demonstrate full-stack architecture, authentication/authorization, cloud file storage, and permission-based access control.

---

## ✨ Features

**Authentication & Security**
- JWT-based authentication with bcrypt password hashing
- Rate-limited login endpoint to blunt brute-force attempts
- Role-based access (user/admin)
- Ownership + permission checks enforced on every document operation

**Document Management**
- Upload, rename, delete (soft delete/trash), and download documents
- Cloud storage via Cloudinary (no files stored on the app server)
- File type and size validation on upload

**Folders**
- Create, rename, delete folders
- Move documents between folders
- Folder deletion blocked while non-empty (prevents orphaned files)

**Sharing & Permissions**
- Share any document with another registered user by email
- Three permission levels: `view`, `download`, `edit`
- Owner can view and revoke active shares at any time
- Optional share expiration

**Version History**
- Every upload automatically creates version 1
- Uploading a new version preserves the previous file and increments the version number
- Full version history retrievable per document

**Search & Audit Logging**
- Case-insensitive document search, filtering by type/folder, and pagination
- Every sensitive action (login, upload, download, share, delete, etc.) is logged with timestamp and actor

**Frontend**
- Built with Next.js (App Router) + Tailwind CSS
- Protected dashboard with real-time document grid
- Drag-free upload, inline rename/delete/download/share actions
- Custom dark theme with a Three.js-rendered animated logo

---

## 🏗️ Architecture
User → Next.js Frontend → Express REST API → MongoDB (metadata) + Cloudinary (files)


- **MongoDB** stores all structured data: users, documents, folders, shares, versions, audit logs
- **Cloudinary** stores the actual file bytes — MongoDB only stores a reference to it
- Every document request passes through a centralized permission check: *owner? → active share? → sufficient permission level? → not expired?*

---

## 🛠️ Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Frontend       | Next.js, React, Tailwind CSS, Three.js       |
| Backend        | Node.js, Express.js                          |
| Database       | MongoDB + Mongoose                           |
| Authentication | JWT, bcrypt                                  |
| File Storage   | Cloudinary                                   |
| Upload Handling| Multer                                       |
| Security       | Helmet, CORS, express-rate-limit, express-mongo-sanitize |

---

## 📁 Project Structure

sdms/
├── backend/
│ └── src/
│ ├── config/ # DB + Cloudinary connections
│ ├── controllers/ # Business logic per resource
│ ├── middleware/ # Auth, role checks, upload, error handling
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express route definitions
│ ├── services/ # Reusable logic (storage, audit logging)
│ └── utils/ # Shared helpers (JWT, permission checks)
└── frontend/
├── app/ # Next.js pages (login, register, dashboard)
├── components/ # Reusable UI components
└── lib/ # API client + auth context

---

## 🔌 API Overview

| Method | Endpoint                              | Description                       |
|--------|----------------------------------------|------------------------------------|
| POST   | `/api/auth/register`                  | Create account                     |
| POST   | `/api/auth/login`                     | Login                               |
| GET    | `/api/auth/me`                        | Current user (protected)           |
| POST   | `/api/documents`                      | Upload a document                  |
| GET    | `/api/documents`                      | List/search documents              |
| GET    | `/api/documents/:id`                  | Document details                   |
| PUT    | `/api/documents/:id`                  | Rename / move to folder            |
| DELETE | `/api/documents/:id`                  | Delete (soft)                      |
| GET    | `/api/documents/:id/download`         | Get secure download link           |
| POST   | `/api/documents/:id/share`            | Share with another user            |
| GET    | `/api/documents/:id/shares`           | List a document's shares           |
| DELETE | `/api/documents/:id/shares/:userId`   | Revoke access                      |
| POST   | `/api/documents/:id/versions`         | Upload a new version                |
| GET    | `/api/documents/:id/versions`         | Version history                    |
| POST   | `/api/folders`                        | Create folder                      |
| GET    | `/api/folders`                        | List folders                       |
| PUT    | `/api/folders/:id`                    | Rename folder                      |
| DELETE | `/api/folders/:id`                    | Delete folder (must be empty)      |
| GET    | `/api/audit-logs`                     | View your own activity history     |

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Cloudinary](https://cloudinary.com) account

### Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI, JWT secret, and Cloudinary keys
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

---

## 🔒 Security Highlights

- Passwords never stored in plaintext (bcrypt hashing)
- Every document/folder operation checks ownership *before* checking shared access — no operation succeeds without an explicit authorization check
- Rate limiting on authentication endpoints
- Centralized error handling — no stack traces leaked in production
- `.env` files excluded from version control; `.env.example` provided for setup
- Input sanitization against NoSQL injection (`express-mongo-sanitize`)
- Security headers via Helmet

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).