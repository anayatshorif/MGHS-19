# MGHS-19 Batch Website

Full-stack website for childhood school batch with member approval flow, events, announcements, and dashboards.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- EJS templates
- JWT auth in HTTP-only cookie
- Cloudinary media upload via Multer

## Features
- Member signup with: name, email, phone, profile picture, batch info
- Admin approval/rejection before member login
- Member dashboard:
  - My profile / update profile
  - View all approved friends
  - View events and join events
  - View announcements
- Admin dashboard:
  - Approve/reject members
  - Create events
  - Approve/reject event join requests
  - Create announcements
  - Create new admin profile
  - Manage members list
- Public pages:
  - Home
  - Members
  - Events
  - Announcements
  - Login / Signup

## Setup
1. Ensure MongoDB is running locally.
2. Copy `.env.example` to `.env` and set values.
3. Install dependencies:
   - `npm install`
4. Seed initial admin account:
   - `npm run seed-admin`
5. Start server:
   - `npm run dev`

## Deploy On Render
1. Push your latest code to GitHub (including `render.yaml`).
2. In Render dashboard, click `New +` -> `Blueprint`.
3. Connect your GitHub repo and select this project.
4. Render will detect `render.yaml` and create the web service automatically.
5. In Render service `Environment`, set these values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `SUPERADMIN_EMAIL`
   - `SUPERADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Click `Apply` / `Deploy`.
7. Open the Render URL after deploy is green.

Notes:
- App listens on `process.env.PORT`, already compatible with Render.
- Super admin is auto-created at startup (if not exists) using `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`.
- Use HTTPS Render URL for login/session tests.

## Required Environment Variables
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Default Admin (from env)
- Email: `admin@mghs19.com`
- Password: `admin12345`

## Main Routes
- Public: `/`, `/members`, `/events`, `/announcements`
- Auth: `/auth/signup`, `/auth/login`, `/auth/logout`
- Member: `/member`, `/member/profile`, `/member/profile/edit`
- Admin: `/admin`, `/admin/admins`, `/admin/events`, `/admin/announcements`

