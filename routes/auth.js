import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.isAdmin) {
    return next();
  }
  res.status(403).render('error', { error: 'Access denied. Admin privileges required.' });
};

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.isAdmin ? '/admin/dashboard' : '/customer/dashboard');
  }
  res.render('auth/login');
});

// Login process
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.render('auth/login', { 
        error: 'Email and password are required',
        email
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid email or password',
        email
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'Invalid email or password',
        email
      });
    }
    
    // Set session
    req.session.user = user._id;
    req.session.isAdmin = user.isAdmin;
    
    // Redirect
    const returnTo = req.session.returnTo || (user.isAdmin ? '/admin/dashboard' : '/customer/dashboard');
    delete req.session.returnTo;
    res.redirect(returnTo);
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      error: 'An error occurred during login',
      email: req.body.email
    });
  }
});

// Signup page
router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.isAdmin ? '/admin/dashboard' : '/customer/dashboard');
  }
  res.render('auth/signup');
});

// Signup process
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, password, confirmPassword, firstName, lastName, 
      accountType, businessName, phone, 
      street, city, state, zipCode, country 
    } = req.body;
    
    // Validate input
    if (!email || !password || !confirmPassword || !firstName || !lastName || !accountType || !phone) {
      return res.render('auth/signup', { 
        error: 'All required fields must be filled',
        ...req.body
      });
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/signup', { 
        error: 'Passwords do not match',
        ...req.body
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/signup', { 
        error: 'Email already in use',
        ...req.body
      });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      accountType,
      businessName: accountType === 'business' ? businessName : undefined,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country
      }
    });
    
    await newUser.save();
    
    // Set session
    req.session.user = newUser._id;
    req.session.isAdmin = false;
    
    // Redirect to dashboard
    res.redirect('/customer/dashboard');
    
  } catch (error) {
    console.error('Signup error:', error);
    res.render('auth/signup', { 
      error: 'An error occurred during signup',
      ...req.body
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

export const authRoutes = router;