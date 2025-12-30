const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  syllabusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  summary: {
    type: String
  },
  keyPoints: [{
    type: String
  }],
  generatedDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ syllabusId: 1 });
noteSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Note', noteSchema);