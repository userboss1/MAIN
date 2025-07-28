import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // 1. Import the cors package

import { connect } from './config/db.js';
import poolRoute from './routes.js/pool.js'; // Assuming this is your router file

dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Make sure this matches your backend port

// --- MIDDLEWARE ---

// 2. Use the cors middleware
// This will allow all origins. For production, you might want to restrict it.
app.use(cors()); 

// Middleware to parse JSON
app.use(express.json());

// --- ROUTES ---
app.use('/api/pool', poolRoute);

// Connect to DB and Start Server
connect((err) => {
  if (err) {
    console.log("❌ Failed to connect to MongoDB:", err);
  } else {
    console.log("✅ Connected to MongoDB successfully");
    app.listen(port, () => {
      console.log(`🚀 Server started at http://localhost:${port}`);
    });
  }
});