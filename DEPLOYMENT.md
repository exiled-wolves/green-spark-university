# Green Spark University - Deployment & Setup Guide

## Quick Start - Login Credentials

After setup, use these credentials to test:
- **Email:** `admin@greensparkuni.edu.ng`
- **Password:** `password`

---

## Backend (Render) Setup

### Prerequisites
- GitHub repository connected
- Supabase PostgreSQL database
- Render account

### Environment Variables Required

In Render dashboard, go to your service → **Environment** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `POSTGRES_URL` | Your Supabase connection string | Copy from Supabase → Settings → Database → Connection string → URI |
| `JWT_SECRET` | Any secure random string | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Optional but recommended |
| `CLIENT_URL` | Your Vercel frontend URL | Add after deploying frontend |

### Supabase Connection String
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **Database** → **Connection string**
4. Copy the **URI** (Postgres format)
5. Paste into Render `POSTGRES_URL`

### Database
- Schema created automatically: 14 tables
- Default admin user created from seed script
- All migrations in `/scripts/` folder

### Deploy Steps
1. Push changes to GitHub
2. Render auto-detects and deploys
3. Check logs for "✅ PostgreSQL connected" message
4. Verify with: `https://your-render-url/api/health`

---

## Frontend (Vercel) Setup

### Environment Variables

In Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |

### Deploy Steps
1. Click **Publish** in v0 or deploy from Vercel dashboard
2. Set **Root Directory** to `client`
3. Add `VITE_API_URL` environment variable
4. Deploy

---

## Testing Checklist

### 1. Backend Health
```bash
curl https://your-render-url.onrender.com/api/health
```
Expected response:
```json
{
  "status": "ok",
  "university": "Green Spark University API",
  "environment": "production",
  "hasJWTSecret": true,
  "timestamp": "2026-04-06T15:00:00.000Z"
}
```

### 2. Departments Load
```bash
curl https://your-render-url.onrender.com/api/apply/departments
```
Should return 8 departments

### 3. Admin Login
```bash
curl -X POST https://your-render-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login_id": "admin@greensparkuni.edu.ng",
    "password": "password"
  }'
```
Expected: JWT token returned

### 4. Frontend Access
Visit your Vercel URL and test login form

---

## Troubleshooting

### Login Not Working
1. Check Render logs for JWT_SECRET warning
2. Verify `POSTGRES_URL` is set correctly
3. Check admin user exists: query `SELECT * FROM admins;`
4. Verify database connection works on Render

### Departments Not Loading
1. Check CORS is enabled (should be `origin: true`)
2. Verify `VITE_API_URL` is set in Vercel
3. Test backend directly: `/api/apply/departments`

### Database Connection Issues
1. Verify `POSTGRES_URL` includes correct credentials
2. Check URL ends with `?sslmode=no-verify` (auto-added)
3. Test connection from Render logs

### JWT_SECRET Missing Warning
- Go to Render → Environment
- Add new variable: `JWT_SECRET`
- Render will auto-redeploy

---

## File Structure

```
/
├── client/                 # React frontend (Vite)
│   ├── src/
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/db.js       # PostgreSQL config
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── app.js            # Main server
│   └── package.json
│
└── scripts/               # Database setup
    ├── 001_create_schema.sql
    ├── 002_seed_data.sql
    └── 003_verify_data.sql
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (admin/student/lecturer)
- `POST /api/auth/change-password` - Change password (protected)
- `GET /api/auth/me` - Get current user (protected)

### Public
- `GET /api/apply/departments` - Get all departments
- `POST /api/apply` - Submit application

### Admin (protected)
- `GET /api/admin/...` - Admin dashboard endpoints

### Student (protected)
- `GET /api/student/...` - Student dashboard endpoints

### Lecturer (protected)
- `GET /api/lecturer/...` - Lecturer dashboard endpoints

---

## Default Data

**Departments:**
- Computer Science (CSC)
- Electrical Engineering (EEE)
- Business Administration (BUS)
- Mass Communication (MAC)
- Accounting (ACC)
- Law (LAW)
- Medicine and Surgery (MED)
- Civil Engineering (CVE)

**Admin User:**
- Email: `admin@greensparkuni.edu.ng`
- Password: `password`
- Name: GSU Super Admin

**Academic Session:**
- 2024/2025 (current)

---

## Support

For issues:
1. Check Render logs
2. Verify environment variables
3. Test endpoints with curl
4. Check database via Supabase dashboard
