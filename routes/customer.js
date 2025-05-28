import express from 'express';
import { isAuthenticated } from './auth.js';
import User from '../models/User.js';
import SupportRequest from '../models/SupportRequest.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

const router = express.Router();

// Apply authentication middleware to all customer routes
router.use(isAuthenticated);

// Customer dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);
    
    // Get recent support requests
    const supportRequests = await SupportRequest.find({ customer: userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get upcoming appointments
    const upcomingAppointments = await SupportRequest.find({
      customer: userId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'assigned', 'in-progress'] }
    }).sort({ appointmentDate: 1 });
    
    // Get popular knowledge base articles
    const popularArticles = await KnowledgeBase.find({ isPublished: true })
      .sort({ viewCount: -1 })
      .limit(3);
    
    res.render('customer/dashboard', {
      user,
      supportRequests,
      upcomingAppointments,
      popularArticles
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    res.status(500).render('error', { error: 'Error loading dashboard' });
  }
});

// Support request form
router.get('/support/new', (req, res) => {
  res.render('customer/support-form');
});

// Submit support request
router.post('/support', async (req, res) => {
  try {
    const { title, description, deviceType, urgency, location } = req.body;
    
    // Validate input
    if (!title || !description || !deviceType || !urgency) {
      return res.render('customer/support-form', {
        error: 'All required fields must be filled',
        ...req.body
      });
    }
    
    // Create support request
    const supportRequest = new SupportRequest({
      customer: req.session.user,
      title,
      description,
      deviceType,
      urgency,
      location,
      status: 'pending'
    });
    
    // Calculate estimated cost
    supportRequest.estimatedCost = supportRequest.calculateEstimatedCost();
    
    await supportRequest.save();
    
    res.redirect(`/customer/support/${supportRequest._id}`);
  } catch (error) {
    console.error('Support request error:', error);
    res.render('customer/support-form', {
      error: 'An error occurred while submitting your request',
      ...req.body
    });
  }
});

// View support request
router.get('/support/:id', async (req, res) => {
  try {
    const supportRequest = await SupportRequest.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName');
    
    if (!supportRequest) {
      return res.status(404).render('error', { error: 'Support request not found' });
    }
    
    // Check if user owns this request
    if (supportRequest.customer._id.toString() !== req.session.user.toString()) {
      return res.status(403).render('error', { error: 'Access denied' });
    }
    
    res.render('customer/support-detail', { supportRequest });
  } catch (error) {
    console.error('View support request error:', error);
    res.status(500).render('error', { error: 'Error loading support request' });
  }
});

// List all support requests
router.get('/support', async (req, res) => {
  try {
    const supportRequests = await SupportRequest.find({ customer: req.session.user })
      .sort({ createdAt: -1 });
    
    res.render('customer/support-list', { supportRequests });
  } catch (error) {
    console.error('Support list error:', error);
    res.status(500).render('error', { error: 'Error loading support requests' });
  }
});

// Schedule appointment form
router.get('/appointment/:requestId', async (req, res) => {
  try {
    const supportRequest = await SupportRequest.findById(req.params.requestId);
    
    if (!supportRequest) {
      return res.status(404).render('error', { error: 'Support request not found' });
    }
    
    // Check if user owns this request
    if (supportRequest.customer.toString() !== req.session.user.toString()) {
      return res.status(403).render('error', { error: 'Access denied' });
    }
    
    res.render('customer/appointment-form', { supportRequest });
  } catch (error) {
    console.error('Appointment form error:', error);
    res.status(500).render('error', { error: 'Error loading appointment form' });
  }
});

// Submit appointment
router.post('/appointment/:requestId', async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    
    // Validate input
    if (!appointmentDate || !appointmentTime) {
      return res.render('customer/appointment-form', {
        error: 'Date and time are required',
        ...req.body
      });
    }
    
    const supportRequest = await SupportRequest.findById(req.params.requestId);
    
    if (!supportRequest) {
      return res.status(404).render('error', { error: 'Support request not found' });
    }
    
    // Check if user owns this request
    if (supportRequest.customer.toString() !== req.session.user.toString()) {
      return res.status(403).render('error', { error: 'Access denied' });
    }
    
    // Combine date and time
    const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    // Update support request
    supportRequest.appointmentDate = dateTime;
    await supportRequest.save();
    
    res.redirect(`/customer/support/${supportRequest._id}`);
  } catch (error) {
    console.error('Appointment submission error:', error);
    res.status(500).render('error', { error: 'Error scheduling appointment' });
  }
});

// Submit feedback
router.post('/feedback/:requestId', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    // Validate input
    if (!rating) {
      return res.redirect(`/customer/support/${req.params.requestId}`);
    }
    
    const supportRequest = await SupportRequest.findById(req.params.requestId);
    
    if (!supportRequest) {
      return res.status(404).render('error', { error: 'Support request not found' });
    }
    
    // Check if user owns this request
    if (supportRequest.customer.toString() !== req.session.user.toString()) {
      return res.status(403).render('error', { error: 'Access denied' });
    }
    
    // Update support request
    supportRequest.customerRating = rating;
    supportRequest.customerFeedback = feedback;
    await supportRequest.save();
    
    res.redirect(`/customer/support/${supportRequest._id}`);
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).render('error', { error: 'Error submitting feedback' });
  }
});

// Profile page
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.session.user);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    res.render('customer/profile', { user });
  } catch (error) {
    console.error('Profile page error:', error);
    res.status(500).render('error', { error: 'Error loading profile' });
  }
});

// Update profile
router.post('/profile', async (req, res) => {
  try {
    const { 
      firstName, lastName, phone, 
      street, city, state, zipCode, country,
      businessName
    } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !phone) {
      return res.render('customer/profile', {
        error: 'Name and phone are required',
        user: { ...req.body, _id: req.session.user }
      });
    }
    
    const user = await User.findById(req.session.user);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    // Update user
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    
    if (user.accountType === 'business') {
      user.businessName = businessName;
    }
    
    user.address = {
      street,
      city,
      state,
      zipCode,
      country
    };
    
    await user.save();
    
    res.render('customer/profile', { 
      user,
      success: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).render('error', { error: 'Error updating profile' });
  }
});

export const customerRoutes = router;