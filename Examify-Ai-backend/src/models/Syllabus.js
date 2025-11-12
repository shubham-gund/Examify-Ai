const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: false,
    default: null
  },
  fileName: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['pdf', 'text'],
    default: 'pdf'
  },
  parsedText: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number
  },
  pageCount: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
syllabusSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);