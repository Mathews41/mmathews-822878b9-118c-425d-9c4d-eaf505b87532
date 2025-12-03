# Secure Task Management System

A full-stack task management application with Role-Based Access Control (RBAC), built using **NX**, **NestJS**, and **Angular**.

## Features

- **Authentication**: JWT-based login and registration.
- **RBAC**: 3-tier role system (Owner > Admin > Viewer) with hierarchical permissions.
- **Organization Scoping**: Users can only access tasks within their organization.
- **Dashboard**: Angular-based UI with drag-and-drop task management (Kanban style).
- **Real-time State**: Angular Signals for reactive state management.
- **Secure API**: NestJS Guards and Decorators for robust security.

## Repository Structure

This is an NX Monorepo:

- **apps/api**: NestJS Backend (Port 3000)
- **apps/dashboard**: Angular Frontend (Port 4200)
- **libs/data**: Shared TypeScript Interfaces & DTOs
- **libs/auth**: Shared RBAC logic (Decorators, Guards)

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- NPM

**Note on Node.js Version**: If you are using Node.js < v20.12.0, you may encounter `crypto.hash is not a function` errors. The project includes a polyfill that is automatically loaded when using the `npm run` commands below.

### Configuration (.env)

_Note: If no `.env` is provided, the application defaults to a development secret._

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

#### Running the Backend

1. Start the API:
   ```bash
   npm run start:api
   ```
   - The server will start at `http://localhost:3000`.
   - A SQLite database (`database.sqlite`) will be created automatically in the root.

#### Running the Frontend

1. Start the Dashboard:
   ```bash
   npm run start:dashboard
   ```
   - Open your browser at `http://localhost:4200`.

### Default Credentials

Use the **Register** form on the login page to create a new Organization and Owner/Admin user.

## Architecture Overview

### Monorepo Rationale

We use **NX** to manage a unified workspace. This allows sharing code (interfaces, DTOs, auth logic) between the Backend (`api`) and Frontend (`dashboard`) via the `libs/` directory, ensuring type safety and consistency across the stack.

### Shared Libraries

- `libs/data`: Contains pure TypeScript interfaces (`User`, `Task`) and DTOs (`CreateTaskDto`). Both apps import from here to ensure the API contract is respected.
- `libs/auth`: Contains the `RolesGuard`, `JwtAuthGuard`, and `@Roles` decorator. This isolates the security logic, making it testable and reusable.

## Data Model

### Schema

The application uses a relational model (SQLite via TypeORM):

- **Organization**

  - `id`: PK
  - `name`: String
  - `users`: One-to-Many -> User
  - `tasks`: One-to-Many -> Task

- **User**

  - `id`: PK
  - `username`: String
  - `password`: Hash
  - `role`: Enum (OWNER, ADMIN, VIEW)
  - `organizationId`: FK -> Organization

- **Task**
  - `id`: PK
  - `title`: String
  - `status`: Enum (OPEN, IN_PROGRESS, DONE)
  - `organizationId`: FK -> Organization (Tenant isolation)
  - `assigneeId`: FK -> User (Optional)

### Entity Relationship Diagram (Text)

```
[Organization] 1 --* [User]
      |
      +--------- 1 --* [Task]
                       |
[User] 1 (assignee) ---+
```

## Access Control Implementation

### RBAC Hierarchy

The system implements a strict hierarchy:

1. **OWNER**: Can manage Organization settings, manage Users, and fully manage Tasks.
2. **ADMIN**: Can Create, Update, and Delete Tasks. Cannot manage Users.
3. **VIEWER**: Read-only access to the Task Board.

### JWT Integration

When a user logs in:

1. The backend validates credentials and issues a **JWT**.
2. **Payload**: The token payload includes `sub` (userId), `username`, `role`, and `orgId`.
3. **Guards**:
   - `JwtAuthGuard`: Verifies the token signature on every request.
   - `RolesGuard`: Reads the `role` from the decoded JWT. It compares the user's role against the `@Roles()` decorator on the endpoint.
   - **Org Scoping**: Services automatically filter all database queries by `where: { organization: { id: user.orgId } }` using the `orgId` extracted from the token.

## API Documentation

### Auth

- **POST /auth/register**
  ```json
  { "username": "mark", "password": "123", "role": "OWNER", "orgName": "Acme" }
  ```
- **POST /auth/login**
  ```json
  { "username": "mark", "password": "123" }
  ```
  **Response**: `{ "accessToken": "eyJ...", "user": { ... } }`

### Tasks

Headers: `Authorization: Bearer <token>`

- **GET /tasks**
  - Returns: `[ { "id": 1, "title": "Fix bug", "status": "OPEN", ... } ]`
- **POST /tasks**
  - Body: `{ "title": "New Feature", "description": "Details..." }`
  - Role Required: **ADMIN** or **OWNER**
- **PUT /tasks/:id**
  - Body: `{ "status": "DONE" }`
  - Role Required: **ADMIN** or **OWNER**
- **DELETE /tasks/:id**
  - Role Required: **ADMIN** or **OWNER**

### Users

- **GET /users**
  - Returns list of users in your organization.
- **PUT /users/:id/role**
  - Body: `{ "role": "ADMIN" }`
  - Role Required: **OWNER** (or ADMIN for lower roles)

## Future Considerations

- **Advanced Role Delegation**: Implement granular permissions (e.g., `can_delete_tasks`) instead of fixed roles.
- **Production Security**:
  - Implement **Refresh Tokens** (HttpOnly cookies) to handle session rotation.
  - Add **CSRF Protection** (using csurf or similar) for state-changing requests.
  - **RBAC Caching**: Cache permission checks in Redis for high-throughput endpoints.
- **Scaling**:
  - Move from SQLite to **PostgreSQL** for concurrent write handling.
  - Optimize permission checks by loading permissions into the JWT or a fast cache layer to avoid DB lookups on every guard check.
