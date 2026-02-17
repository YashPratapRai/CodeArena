const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isSolution: {
    type: Boolean,
    default: false
  },
  replies: [replySchema]
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
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
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  solutionComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
discussionSchema.index({ problem: 1, createdAt: -1 });
discussionSchema.index({ author: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ isPinned: -1, createdAt: -1 });
discussionSchema.index({ lastActivity: -1 });

// Virtual for vote count
discussionSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

commentSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

replySchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Methods
discussionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

discussionSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

discussionSchema.methods.toggleVote = async function(userId, voteType) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  const downvoteIndex = this.downvotes.indexOf(userId);

  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      this.upvotes.splice(upvoteIndex, 1);
    } else {
      this.upvotes.push(userId);
      if (downvoteIndex > -1) {
        this.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex > -1) {
      this.downvotes.splice(downvoteIndex, 1);
    } else {
      this.downvotes.push(userId);
      if (upvoteIndex > -1) {
        this.upvotes.splice(upvoteIndex, 1);
      }
    }
  }

  return this.save();
};

commentSchema.methods.toggleVote = async function(userId, voteType) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  const downvoteIndex = this.downvotes.indexOf(userId);

  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      this.upvotes.splice(upvoteIndex, 1);
    } else {
      this.upvotes.push(userId);
      if (downvoteIndex > -1) {
        this.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex > -1) {
      this.downvotes.splice(downvoteIndex, 1);
    } else {
      this.downvotes.push(userId);
      if (upvoteIndex > -1) {
        this.upvotes.splice(upvoteIndex, 1);
      }
    }
  }

  return this.save();
};

replySchema.methods.toggleVote = async function(userId, voteType) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  const downvoteIndex = this.downvotes.indexOf(userId);

  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      this.upvotes.splice(upvoteIndex, 1);
    } else {
      this.upvotes.push(userId);
      if (downvoteIndex > -1) {
        this.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex > -1) {
      this.downvotes.splice(downvoteIndex, 1);
    } else {
      this.downvotes.push(userId);
      if (upvoteIndex > -1) {
        this.upvotes.splice(upvoteIndex, 1);
      }
    }
  }

  return this.save();
};

module.exports = mongoose.model('Discussion', discussionSchema);