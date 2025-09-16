// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// -------------------- Initialize Express --------------------
const app = express();

// -------------------- Middleware --------------------
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://victors-assembly-church-frontend.onrender.com", // deployed frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -------------------- Routes --------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/voiceChats", require("./routes/voiceChats"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/test", require("./routes/testApi"));

// -------------------- Static files --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Health check --------------------
app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", uptime: process.uptime() })
);

// -------------------- Root endpoint --------------------
app.get("/", (req, res) => res.send("✅ API is live and running!"));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("🌐 Global Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// -------------------- Database & Server --------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(MONGO_URI)) {
  console.error("❌ Invalid or missing MongoDB URI in environment variables.");
  process.exit(1);
}

// Utility: list all routes after start
const listRoutes = (appInstance) => {
  if (!appInstance?._router) return console.log("⚠️ No routes found");

  console.log("📌 Mounted Routes:");
  const print = (stack, prefix = "") =>
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ");
        console.log(`  ${methods.padEnd(10)} ${prefix}${layer.route.path}`);
      } else if (layer.name === "router" && layer.handle.stack) {
        const newPrefix =
          layer.regexp?.source
            .replace("^\\", "/")
            .replace("\\/?(?=\\/|$)", "")
            .replace("(?:\\/)?$", "")
            .replace(/\\\//g, "/")
            .replace("^", "") || "";
        print(layer.handle.stack, prefix + newPrefix);
      }
    });
  print(appInstance._router.stack);
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      listRoutes(app);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// -------------------- Graceful shutdown --------------------
process.on("SIGINT", async () => {
  console.log("\n⚡ Shutting down server...");
  try {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } finally {
    process.exit(0);
  }
});
