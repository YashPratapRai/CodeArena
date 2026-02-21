const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  explanation: String,
  isPublic: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String,
    required: true
  }],
  constraints: {
    type: [String],
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  initialCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' }
  },
  solution: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  hints: [String],
  acceptanceRate: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  correctSubmissions: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasSolution: {
    type: Boolean,
    default: false
  },
  solutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }

}, {
  timestamps: true
});

problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = (this.correctSubmissions / this.totalSubmissions) * 100;
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);