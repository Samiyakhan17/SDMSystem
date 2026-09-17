const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(mongoSanitize());

// Basic rate limiter - tighten further on /auth and /download routes in Phase 3/4
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// --- Routes (mounted as each phase is built) ---
 app.use('/api/auth', require('./routes/authRoutes'));
 app.use('/api/documents', require('./routes/documentRoutes'));
 app.use('/api/folders', require('./routes/folderRoutes'));
 app.use('/api/audit-logs', require('./routes/auditRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
