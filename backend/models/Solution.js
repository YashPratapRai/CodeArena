const mongoose = require('mongoose');

const additionalResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'documentation', 'github'],
    default: 'article'
  }
});

const solutionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    unique: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  // Text solution (markdown supported)
  textSolution: {
    type: String,
    default: ''
  },
  // Video solution
  videoSolution: {
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'custom'],
      default: 'youtube'
    },
    duration: {
      type: String,
      default: ''
    },
    thumbnail: {
      type: String,
      default: ''
    }
  },
  // Additional resources
  additionalResources: [additionalResourceSchema],
  // Publish status
  isPublished: {
    type: Boolean,
    default: true
  },
  // Version tracking
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
solutionSchema.index({ problemId: 1 });
solutionSchema.index({ isPublished: 1 });
solutionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Solution', solutionSchema);