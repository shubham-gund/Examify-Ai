const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  aiFeedback: {
    type: String
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String
  },
  evaluationType: {
    type: String,
    enum: ['automatic', 'ai', 'manual'],
    default: 'ai'
  },
  timeSpent: {
    type: Number
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
resultSchema.index({ studentId: 1, testId: 1 });
resultSchema.index({ testId: 1, score: -1 });

// Calculate percentage before saving
resultSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isNew) {
    const totalPoints = this.answers.reduce((sum, ans) => sum + (ans.pointsEarned || 0), 0);
    const maxPoints = this.answers.length;
    this.percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);