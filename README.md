## Scalable Authenticated Dashboard App

This project is a full-stack web app with JWT authentication, a user dashboard, and CRUD operations on a `Task` entity.

- **Frontend**: React (Vite, TypeScript) + TailwindCSS
- **Backend**: Node.js + Express + MongoDB (via Mongoose), JWT auth, Joi validation

---

## Project Structure

- `backend/` – Express API
  - `src/index.js` – app entry, DB connection, route wiring
  - `src/models` – `User`, `Task` Mongoose models
  - `src/routes` – `auth`, `profile`, `tasks` routers
  - `src/middleware` – `auth` (JWT), `errorHandler`
  - `src/validators` – Joi schemas for auth/tasks
  - `API.md` – API documentation
- `frontend/` – React app
  - `src/state/AuthContext.tsx` – auth state + API integration
  - `src/components/ProtectedRoute.tsx` – protected routing
  - `src/pages/AuthPage.tsx` – login/register UI with client-side validation
  - `src/pages/DashboardPage.tsx` – profile panel, tasks CRUD, search & filter

---

## Running Locally

### 1. Backend

1. Navigate to backend:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Create `.env` in `backend` with:
   - `PORT=4000`
   - `MONGO_URI=mongodb://localhost:27017/scalable_app`
   - `JWT_SECRET=<your_long_random_secret>`
   - `CLIENT_ORIGIN=http://localhost:5173`
4. Start the API:
   - Development (with auto-reload): `npm run dev`
   - Production-style: `npm start`

The API will be at `http://localhost:4000/api`.

### 2. Frontend

1. Navigate to frontend:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Optionally configure the backend base URL in a `.env` file:
   - `VITE_API_BASE_URL=http://localhost:4000/api`
4. Start the dev server:
   - `npm run dev`

The app will run at `http://localhost:5173`.

---

## Features Implemented

- **Authentication**
  - User registration & login (`/api/auth/register`, `/api/auth/login`)
  - Password hashing via `bcryptjs`
  - JWT-based auth with middleware (`Authorization: Bearer <token>`)
  - Auth state persisted in `localStorage`

- **Dashboard**
  - Protected route `/dashboard` (via `ProtectedRoute`)
  - Profile display (name, email) loaded from `/api/profile/me`
  - Tasks CRUD with:
    - Create/update/delete tasks
    - Toggle completion state
    - Search by title/description
    - Filter by status (`all`, `pending`, `completed`)

- **Validation & Error Handling**
  - Server-side validation using Joi schemas
  - Client-side validation in auth forms (email format, password length, name length)
  - Centralized error handler on the backend

- **UI/UX**
  - Tailwind-based responsive layout
  - Modern login/register screen
  - Split dashboard layout (profile + tasks)

---

## API Docs / Postman Use

- See `backend/API.md` for a detailed description of available endpoints, payloads, and responses.
- You can import these routes into Postman or any HTTP client tool by manually adding them using the base URL `http://localhost:4000/api`.

---

## Scaling the Frontend–Backend Integration

This app is structured so it can grow into a production setup:

- **Separation of concerns**
  - Clear split between `frontend` and `backend` for independent deployment and scaling.
  - Backend exposes a clean REST API consumed by the frontend via `fetch`.
- **Environment-based configuration**
  - Frontend uses `VITE_API_BASE_URL` for per-environment API URLs (dev, staging, prod).
  - Backend uses `CLIENT_ORIGIN` to scope CORS, and `MONGO_URI`/`JWT_SECRET` for environment-specific settings.
- **Security**
  - Passwords are always stored hashed with `bcryptjs`.
  - JWTs are verified by centralized middleware; protected routes enforce auth consistently.
- **Future improvements (production-ready)**
  - Move auth logic into dedicated services and repositories for easier testing and scaling.
  - Add refresh tokens, short-lived access tokens, and secure cookie storage.
  - Introduce an API gateway or reverse proxy (e.g., Nginx) and deploy frontend as static assets to a CDN.
  - Add rate limiting, request logging aggregation, and centralized monitoring.
  - Extract task/profile logic into separate modules or microservices as the domain grows.





