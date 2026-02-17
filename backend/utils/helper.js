const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Hash a password
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password
 * @returns {Promise<boolean>} - Whether the passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 * @param {string} userId - The user ID
 * @param {string} email - The user email
 * @param {string} role - The user role
 * @returns {string} - The JWT token
 */
const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    { 
      id: userId, 
      email, 
      role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE 
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} - The decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {object} user - The user object
 * @returns {object} - The sanitized user object
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  delete userObj.password;
  delete userObj.__v;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  
  return userObj;
};

/**
 * Generate random string
 * @param {number} length - The length of the random string
 * @returns {string} - The random string
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date - The date to format
 * @param {string} format - The format type
 * @returns {string} - The formatted date string
 */
const formatDate = (date, format = 'relative') => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (format === 'relative') {
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return new Date(date).toLocaleDateString();
  }

  return new Date(date).toLocaleString();
};

/**
 * Calculate acceptance rate
 * @param {number} totalSubmissions - Total number of submissions
 * @param {number} correctSubmissions - Number of correct submissions
 * @returns {number} - The acceptance rate percentage
 */
const calculateAcceptanceRate = (totalSubmissions, correctSubmissions) => {
  if (totalSubmissions === 0) return 0;
  return Math.round((correctSubmissions / totalSubmissions) * 100 * 10) / 10; // 1 decimal place
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Paginate array of data
 * @param {Array} data - The data array to paginate
 * @param {number} page - The page number (1-based)
 * @param {number} limit - The number of items per page
 * @returns {object} - Paginated result with data, pagination info
 */
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    currentPage: page,
    totalPages: Math.ceil(data.length / limit),
    totalItems: data.length,
    hasNext: endIndex < data.length,
    hasPrev: startIndex > 0
  };
};

/**
 * Generate problem slug from title
 * @param {string} title - The problem title
 * @returns {string} - The generated slug
 */
const generateProblemSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after specified time
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 * @param {object} obj - The object to clone
 * @returns {object} - The cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if user is admin
 * @param {object} user - The user object
 * @returns {boolean} - Whether the user is admin
 */
const isAdmin = (user) => {
  return user && user.role === 'admin';
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidObjectId,
  sanitizeUser,
  generateRandomString,
  formatDate,
  calculateAcceptanceRate,
  isValidEmail,
  validatePassword,
  paginate,
  generateProblemSlug,
  sleep,
  deepClone,
  isAdmin
};