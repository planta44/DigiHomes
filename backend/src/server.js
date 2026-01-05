require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const houseRoutes = require('./routes/house.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const uploadRoutes = require('./routes/upload.routes');
const settingsRoutes = require('./routes/settings.routes');
const pagesRoutes = require('./routes/pages.routes');
const reelsRoutes = require('./routes/reels.routes');
const initDatabase = require('./config/initDb');

const app = express();

// Initialize database tables on startup
initDatabase();

// Middleware - Allow both localhost and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://digi-homes.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/reels', reelsRoutes);

// Health check endpoints for uptime monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DIGI Homes API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DIGI Homes API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🏠 DIGI Homes API running on port ${PORT}`);
});

module.exports = app;
