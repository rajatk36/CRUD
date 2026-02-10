## Backend API Overview

Base URL (local development): `http://localhost:4000/api`

Environment variables (configure in a `.env` file in `backend`):

- `PORT` – default `4000`
- `MONGO_URI` – e.g. `mongodb://localhost:27017/scalable_app`
- `JWT_SECRET` – long random string for signing JWTs
- `CLIENT_ORIGIN` – default `http://localhost:5173`

---

## Auth

### POST `/auth/register`

- **Description**: Register a new user and return a JWT.
- **Body (JSON)**:
  - `name` (string, required, min 2)
  - `email` (string, required, valid email)
  - `password` (string, required, min 6)
- **Responses**:
  - `201 Created`:
    - `token` – JWT string
    - `user` – user object without password
  - `409 Conflict` – email already registered
  - `400 Bad Request` – validation error

### POST `/auth/login`

- **Description**: Login existing user and return a JWT.
- **Body (JSON)**:
  - `email` (string, required)
  - `password` (string, required)
- **Responses**:
  - `200 OK`:
    - `token` – JWT string
    - `user` – user object without password
  - `401 Unauthorized` – invalid credentials

---

## Profile

All profile routes require `Authorization: Bearer <token>` header.

### GET `/profile/me`

- **Description**: Get the current authenticated user profile.
- **Responses**:
  - `200 OK` – `{ user: { _id, name, email, createdAt, updatedAt } }`
  - `401 Unauthorized` – missing/invalid token

### PUT `/profile/me`

- **Description**: Update the authenticated user name.
- **Body (JSON)**:
  - `name` (string, required, min 2)
- **Responses**:
  - `200 OK` – `{ user: { ...updatedUser } }`
  - `400 Bad Request` – invalid name

---

## Tasks

All task routes require `Authorization: Bearer <token>` header.

### GET `/tasks`

- **Description**: List tasks for the authenticated user with search & filter.
- **Query params**:
  - `search` (optional) – string contained in title or description (case-insensitive)
  - `status` (optional) – `all` | `completed` | `pending`
- **Responses**:
  - `200 OK` – `{ tasks: Task[] }`

### POST `/tasks`

- **Description**: Create a new task.
- **Body (JSON)**:
  - `title` (string, required)
  - `description` (string, optional)
  - `completed` (boolean, optional)
- **Responses**:
  - `201 Created` – `{ task: Task }`
  - `400 Bad Request` – validation error

### PUT `/tasks/:id`

- **Description**: Update a task (title, description, or completed).
- **Body (JSON)**:
  - Any combination of:
    - `title` (string)
    - `description` (string)
    - `completed` (boolean)
- **Responses**:
  - `200 OK` – `{ task: Task }`
  - `404 Not Found` – task not found or not owned by user

### DELETE `/tasks/:id`

- **Description**: Delete a task.
- **Responses**:
  - `204 No Content` – deleted successfully
  - `404 Not Found` – task not found or not owned by user

---

## Error Format

On errors, responses follow:

- `4xx/5xx`:
  - `message` – human-readable error message



