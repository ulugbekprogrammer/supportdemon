import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { customerRoutes } from './routes/customer.js';
import { adminRoutes } from './routes/admin.js';
import { authRoutes } from './routes/auth.js';
import { knowledgeBaseRoutes } from './routes/knowledgeBase.js';
import { seedDatabase } from './seed/seed.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dern-support')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dern-support-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/dern-support',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
  }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Pass user to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/customer', customerRoutes);
app.use('/admin', adminRoutes);
app.use('/knowledge', knowledgeBaseRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Seed database if needed (in development)
if (process.env.NODE_ENV === 'development') {
  app.get('/seed', async (req, res) => {
    try {
      await seedDatabase();
      res.send('Database seeded successfully');
    } catch (err) {
      res.status(500).send('Error seeding database: ' + err.message);
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    error: process.env.NODE_ENV === 'development' ? err : 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Server setup complete. The application structure has been created.');