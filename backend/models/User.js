const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    name: String,
    avatar: String,
    bio: { type: String, maxlength: 500 },
    location: String,
    website: String,
    github: String
  },
  stats: {
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  solvedProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }
  }],
  attemptedProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    attemptedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = function() {
  this.stats.totalSolved = this.stats.easySolved + this.stats.mediumSolved + this.stats.hardSolved;
};

module.exports = mongoose.model('User', userSchema);