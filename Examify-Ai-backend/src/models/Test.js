const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  syllabusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowedAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  passingScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for faster queries
testSchema.index({ createdBy: 1, createdAt: -1 });
testSchema.index({ isActive: 1, scheduledDate: 1 });

// Calculate total points before saving
testSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.length;
  }
  next();
});

module.exports = mongoose.model('Test', testSchema);