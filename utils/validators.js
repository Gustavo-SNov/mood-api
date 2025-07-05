import { body, validationResult } from 'express-validator';

// Common validation helpers
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Date validation helpers
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Mood validation helpers
export const isValidMoodValue = (value) => {
  return Number.isInteger(value) && value >= 1 && value <= 10;
};

export const isValidEmotions = (emotions) => {
  return Array.isArray(emotions) && emotions.every(emotion => typeof emotion === 'string');
};

export const isValidActivities = (activities) => {
  return Array.isArray(activities) && activities.every(activity => typeof activity === 'string');
};

// Password validation
export const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};