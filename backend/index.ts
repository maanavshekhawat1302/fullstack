import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth';
import passport from 'passport';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
// app.use(cors({
//   origin: 'https://majestic-toffee-0d6f3a.netlify.app/login',
//   credentials: true,
// }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    "https://dapper-biscochitos-fd7018.netlify.app"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(require('cookie-parser')());
app.use(passport.initialize());


// Routes
// app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Serve React frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server started on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 