# Meru County Recruitment Portal - Backend API

A TypeScript backend MVP for a recruitment portal built with Hono.js, Drizzle ORM, and PostgreSQL.

## Features

- ✅ **Authentication**: JWT-based auth with access and refresh tokens
- ✅ **User Management**: Register applicants and admin users
- ✅ **Vacancy Management**: Create, update, delete, and list job vacancies
- ✅ **Applications**: Apply with CV uploads, track application status
- ✅ **File Uploads**: Multer for CV file handling (PDF, DOC, DOCX)
- ✅ **Validation**: Zod schemas for all endpoints
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Error Handling**: Comprehensive error handling with proper HTTP codes

## Tech Stack

- **Framework**: Hono.js
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **File Upload**: Multer
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm

## Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=4000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:password@localhost:5432/meru_county_psb

JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

PASSWORD_RESET_EMAIL_WEBHOOK_URL=https://your-mailer.example/send
PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN=your-mailer-token

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

3. **Create PostgreSQL database**:
```bash
psql -U postgres
CREATE DATABASE meru_county_psb;
\q
```

4. **Generate and run migrations**:
```bash
# Generate migration files
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Or push schema directly (development only)
pnpm db:push
```

5. **Start development server**:
```bash
pnpm dev
```

The server will start on `http://localhost:4000`

## Available Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema directly (dev only)
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm db:seed      # Seed database with sample data
pnpm db:cleanup   # Clean up expired password reset sessions
pnpm test         # Run integration tests
pnpm type-check   # Type check without building
```

## API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "role": "applicant"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1000,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "applicant"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Request Password Reset Code
```http
POST /api/auth/forgot-password/request
Content-Type: application/json

{
  "email": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "If the account exists, a reset code has been sent",
  "data": null
}
```

A 6-digit OTP will be sent to the email address if it exists in the system. The OTP expires after 10 minutes.

#### Confirm Password Reset with OTP
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

**Important**: After a successful password reset, all existing JWT tokens for that user are invalidated. The user must log in again with their new password.

### Testing

Run the integration tests to verify the forgot-password flow:

```bash
pnpm test
```

The test suite covers:
- OTP generation and hashing
- Reset session creation and expiration
- OTP verification and single-use enforcement
- Token invalidation via `tokenVersion`

### Maintenance

#### Cleaning up expired reset sessions

Password reset sessions expire after 10 minutes. To clean up expired sessions from the database, run the maintenance script:

```bash
pnpm db:cleanup
```

This command removes all expired password reset sessions. It's safe to run at any time and should be scheduled regularly via:
- A cron job: `0 */6 * * * cd /path/to/backend && pnpm db:cleanup`
- An external scheduler
- Manual execution as needed

### Vacancy Endpoints

#### List Vacancies (Public)
```http
GET /api/vacancies?status=open
```

#### Get Single Vacancy (Public)
```http
GET /api/vacancies/:id
```

#### Create Vacancy (Admin Only)
```http
POST /api/vacancies
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "advertisementNumber": "MER/2024/001",
  "title": "Software Developer",
  "description": "We are looking for...",
  "department": "ICT",
  "closingDate": "2024-12-31",
  "status": "open"
}
```

#### Update Vacancy (Admin Only)
```http
PUT /api/vacancies/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "closed"
}
```

#### Delete Vacancy (Admin Only)
```http
DELETE /api/vacancies/:id
Authorization: Bearer {accessToken}
```

### Application Endpoints

#### List Applications (Authenticated)
```http
GET /api/applications
Authorization: Bearer {accessToken}
```
- Applicants see only their applications
- Admins see all applications

#### Get Single Application (Authenticated)
```http
GET /api/applications/:id
Authorization: Bearer {accessToken}
```

#### Apply for Vacancy (Authenticated)
```http
POST /api/applications
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

vacancyId: 1000
cv: <file.pdf>
```

#### Update Application Status (Admin Only)
```http
PATCH /api/applications/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "accepted"
}
```

Status options: `pending`, `reviewed`, `accepted`, `rejected`

#### Delete Application (Own or Admin)
```http
DELETE /api/applications/:id
Authorization: Bearer {accessToken}
```

## Database Schema

### Users Table
- `id` - Primary key (identity)
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `fullName` - User's full name
- `role` - 'applicant' or 'admin'
- `createdAt`, `updatedAt` - Timestamps

### Vacancies Table
- `id` - Primary key (identity)
- `advertisementNumber` - Unique advertisement number
- `title` - Job title
- `description` - Job description
- `department` - Department name
- `closingDate` - Application closing date
- `status` - 'open' or 'closed'
- `createdBy` - Foreign key to users (admin who created it)
- `createdAt`, `updatedAt` - Timestamps

### Applications Table
- `id` - Primary key (identity)
- `applicantId` - Foreign key to users
- `vacancyId` - Foreign key to vacancies
- `cvPath` - File path to uploaded CV
- `status` - Application status
- `appliedAt` - Application timestamp

## File Uploads

CVs are uploaded to the `./uploads` directory with the following constraints:
- Max file size: 5MB (configurable via `MAX_FILE_SIZE`)
- Allowed formats: PDF, DOC, DOCX
- Filenames: `cv-{timestamp}-{random}.{ext}`

## Error Handling

All errors return a consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate resource
- `INTERNAL_ERROR` (500) - Server error

## Project Structure

```
src/
├── db/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── vacancies.ts
│   │   ├── applications.ts
│   │   └── index.ts
│   ├── migrations/
│   └── index.ts
├── routes/
│   ├── auth.ts
│   ├── vacancies.ts
│   └── applications.ts
├── middleware/
│   ├── auth.ts
│   ├── admin.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── utils/
│   ├── auth.ts
│   ├── errors.ts
│   └── upload.ts
├── schemas/
│   └── index.ts
└── index.ts
```

## Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens with configurable expiry
- File upload restrictions (type and size)
- Input validation with Zod
- SQL injection prevention via Drizzle ORM
- CORS configuration
- Role-based access control

## Development Tips

1. **Database GUI**: Use Drizzle Studio
   ```bash
   pnpm db:studio
   ```

2. **Watch mode**: Development server auto-reloads on changes

3. **Type checking**: Always run before committing
   ```bash
   pnpm type-check
   ```

## License

MIT
