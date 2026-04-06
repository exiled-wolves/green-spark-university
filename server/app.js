require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes      = require('./routes/auth');
const applicantRoutes = require('./routes/applicant');
const adminRoutes     = require('./routes/admin');
const studentRoutes   = require('./routes/student');
const lecturerRoutes  = require('./routes/lecturer');

// Boot DB connection (pool initialises and self-tests on require)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded passport photos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);       // POST /api/auth/login, /change-password
app.use('/api/apply',     applicantRoutes);  // POST /api/apply         (public)
app.use('/api/admin',     adminRoutes);      // /api/admin/*            (admin only)
app.use('/api/student',   studentRoutes);    // /api/student/*          (student only)
app.use('/api/lecturer',  lecturerRoutes);   // /api/lecturer/*         (lecturer only)

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', university: 'Green Spark University API' });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀  GSU API running on http://localhost:${PORT}`);
});
