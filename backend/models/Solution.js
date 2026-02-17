const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  approach: {
    type: String,
    required: true
  },
  complexity: {
    time: {
      type: String,
      required: true
    },
    space: {
      type: String,
      required: true
    }
  },
  code: [{
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'java', 'cpp', 'c']
    },
    code: {
      type: String,
      required: true
    }
  }],
  explanation: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  youtubeUrl: {
    type: String,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
solutionSchema.index({ problemId: 1, createdAt: -1 });
solutionSchema.index({ author: 1 });
solutionSchema.index({ tags: 1 });
solutionSchema.index({ isApproved: 1 });

// Virtual for vote count
solutionSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Method to check if user has voted
solutionSchema.methods.hasUpvoted = function(userId) {
  return this.upvotes.includes(userId);
};

solutionSchema.methods.hasDownvoted = function(userId) {
  return this.downvotes.includes(userId);
};

module.exports = mongoose.model('Solution', solutionSchema);