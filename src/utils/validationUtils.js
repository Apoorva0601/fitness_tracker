export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateDuration = (duration) => {
  const num = parseInt(duration);
  return !isNaN(num) && num > 0 && num <= 600;
};

export const validateCalories = (calories) => {
  if (!calories) return true; // Optional field
  const num = parseInt(calories);
  return !isNaN(num) && num >= 0 && num <= 5000;
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: 'None' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  score = Object.values(checks).filter(Boolean).length;
  
  const strengthLevels = [
    { min: 0, max: 1, label: 'Very Weak', color: 'red' },
    { min: 2, max: 2, label: 'Weak', color: 'orange' },
    { min: 3, max: 3, label: 'Fair', color: 'yellow' },
    { min: 4, max: 4, label: 'Good', color: 'blue' },
    { min: 5, max: 5, label: 'Strong', color: 'green' },
  ];
  
  const level = strengthLevels.find(l => score >= l.min && score <= l.max);
  
  return {
    strength: score,
    label: level.label,
    color: level.color,
    checks,
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};
