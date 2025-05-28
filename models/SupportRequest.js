import mongoose from 'mongoose';

const supportRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['desktop', 'laptop', 'tablet', 'smartphone', 'printer', 'server', 'network', 'other']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentDate: {
    type: Date
  },
  estimatedCost: {
    type: Number
  },
  actualCost: {
    type: Number
  },
  partsUsed: [{
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SparePart'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  resolution: {
    type: String,
    trim: true
  },
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerFeedback: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Method to calculate estimated cost based on urgency and device type
supportRequestSchema.methods.calculateEstimatedCost = function() {
  const baseRates = {
    'desktop': 75,
    'laptop': 85,
    'tablet': 65,
    'smartphone': 60,
    'printer': 70,
    'server': 150,
    'network': 100,
    'other': 80
  };
  
  const urgencyMultipliers = {
    'low': 1,
    'medium': 1.25,
    'high': 1.5,
    'critical': 2
  };
  
  const baseRate = baseRates[this.deviceType] || 80;
  const multiplier = urgencyMultipliers[this.urgency] || 1;
  
  return baseRate * multiplier;
};

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

export default SupportRequest;