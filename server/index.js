import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Subscriber from "./models/Subscriber.js";

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coming-soon";
const LAUNCH_DATE = process.env.LAUNCH_DATE || "2026-12-01T00:00:00";

const app = express();
app.use(cors());
app.use(express.json());

// Launch info for the countdown
app.get("/api/launch", (req, res) => {
  res.json({
    message: "Our website will be live soon!",
    launchDate: new Date(LAUNCH_DATE).toISOString(),
  });
});

// "Notify me" email signup
app.post("/api/subscribe", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected. Please try again later." });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    await Subscriber.create({ email });
    res.status(201).json({ message: "Thanks! We'll notify you when we go live." });
  } catch (err) {
    if (err.code === 11000) {
      return res.json({ message: "You're already on the list!" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
