require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 🔹 Initialize Express
const app = express();

// 🔹 CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://victors-assembly-church-frontend.onrender.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 🔹 Apply CORS & Body Parser Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight globally
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔹 Import route files
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profiles');
const voiceChatRoutes = require('./routes/voiceChats');
const postsRoutes = require('./routes/posts');
const testApiRoutes = require('./routes/testApi');

// 🔹 Attach routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/voiceChats', voiceChatRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/test', testApiRoutes);

// 🔹 Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 Health Check & Root Endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));
app.get('/', (req, res) => res.send('API is live and running!'));

// 🔹 404 Fallback
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// 🔹 MongoDB Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(MONGO_URI)) {
  console.error('❌ Invalid or missing MongoDB URI in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// 🔹 Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n⚡ Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});
