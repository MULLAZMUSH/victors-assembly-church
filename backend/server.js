require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 🔹 Initialize Express
const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Import route files
const authRoutes      = require('./routes/auth');
const eventRoutes     = require('./routes/events');
const messageRoutes   = require('./routes/messages');
const profileRoutes   = require('./routes/profiles');
const voiceChatRoutes = require('./routes/voiceChats');
const testApiRoutes   = require('./routes/testApi');

// 🔹 Attach routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/voiceChats', voiceChatRoutes);
app.use('/api/test', testApiRoutes);

// 🔹 Optional: serve uploads folder if using file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// 🔹 Root Endpoint
app.get('/', (req, res) => {
  res.send('API is live and running!');
});

// 🔹 404 Fallback Route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 🔹 Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 🔹 Port & MongoDB URI
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validate Mongo URI
if (!MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(MONGO_URI)) {
  console.error("❌ Invalid or missing MongoDB URI. Make sure MONGO_URI is set in your environment variables.");
  process.exit(1);
}

// 🔹 Utility to log all mounted routes
const listRoutes = (appInstance) => {
  console.log('📌 Mounted Routes:');
  appInstance._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes directly on app
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`  ${methods.padEnd(10)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        const routePath = handler.route ? handler.route.path : '';
        if (routePath) {
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          console.log(`  ${methods.padEnd(10)} ${middleware.regexp} → ${routePath}`);
        }
      });
    }
  });
};

// 🔹 MongoDB Connection + Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      listRoutes(app); // Log all routes after server starts
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// 🔹 Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n⚡ Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});
