require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 🔹 Initialize Express
const app = express();

// 🔹 Import route files
const authRoutes      = require('./routes/auth');
const eventRoutes     = require('./routes/events');
const messageRoutes   = require('./routes/messages');
const profileRoutes   = require('./routes/profiles');
const voiceChatRoutes = require('./routes/voiceChats');

// 🔹 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: serve uploads folder if using file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// 🔹 Root Endpoint
app.get('/', (req, res) => {
  res.send('API is live and running!');
});

// 🔹 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/voiceChats', voiceChatRoutes);

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

// 🔹 MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
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