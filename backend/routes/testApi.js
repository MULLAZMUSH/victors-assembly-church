const express = require('express');
const router = express.Router();

// ───── Quick API Health Check ─────
router.get('/', (req, res) => {
  res.json({
    message: "Backend API is working!",
    status: "✅ All modules reachable (basic check)",
    endpoints: {
      auth: {
        register: "/api/auth/register [POST]",
        login: "/api/auth/login [POST]",
        forgotPassword: "/api/auth/forgot-password [POST]",
        resetPassword: "/api/auth/reset-password/:token [POST]",
        verifyEmail: "/api/auth/verify/:token [GET]"
      },
      events: {
        getAllEvents: "/api/events [GET]",
        createEvent: "/api/events [POST]",
        getEventById: "/api/events/:id [GET]",
        updateEvent: "/api/events/:id [PUT]",
        deleteEvent: "/api/events/:id [DELETE]"
      },
      messages: {
        getAllMessages: "/api/messages [GET]",
        createMessage: "/api/messages [POST]",
        getMessageById: "/api/messages/:id [GET]",
        updateMessage: "/api/messages/:id [PUT]",
        deleteMessage: "/api/messages/:id [DELETE]"
      },
      profiles: {
        getProfile: "/api/profiles/:id [GET]",
        updateProfile: "/api/profiles/:id [PUT]",
        deleteProfile: "/api/profiles/:id [DELETE]"
      },
      voiceChats: {
        getAllVoiceChats: "/api/voiceChats [GET]",
        createVoiceChat: "/api/voiceChats [POST]",
        getVoiceChatById: "/api/voiceChats/:id [GET]",
        updateVoiceChat: "/api/voiceChats/:id [PUT]",
        deleteVoiceChat: "/api/voiceChats/:id [DELETE]"
      }
    }
  });
});

module.exports = router;
