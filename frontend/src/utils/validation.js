// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    errors: emailRegex.test(email) ? [] : ['Please enter a valid email address']
  };
};

// Name validation
export const validateName = (name) => {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return {
    isValid: phoneRegex.test(phone.replace(/\s/g, '')),
    errors: phoneRegex.test(phone.replace(/\s/g, '')) ? [] : ['Please enter a valid phone number']
  };
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Workout validation
export const validateWorkout = (workout) => {
  const errors = [];
  
  if (!workout.name || workout.name.trim().length === 0) {
    errors.push('Workout name is required');
  }
  
  if (!workout.type) {
    errors.push('Workout type is required');
  }
  
  if (!workout.duration || workout.duration <= 0) {
    errors.push('Workout duration must be greater than 0');
  }
  
  if (workout.exercises && workout.exercises.length === 0) {
    errors.push('At least one exercise is required');
  }
  
  // Validate exercises
  if (workout.exercises) {
    workout.exercises.forEach((exercise, index) => {
      if (!exercise.name || exercise.name.trim().length === 0) {
        errors.push(`Exercise ${index + 1}: Name is required`);
      }
      
      if (exercise.sets && exercise.sets.length > 0) {
        exercise.sets.forEach((set, setIndex) => {
          if (set.reps && (set.reps <= 0 || set.reps > 1000)) {
            errors.push(`Exercise ${index + 1}, Set ${setIndex + 1}: Reps must be between 1 and 1000`);
          }
          
          if (set.weight && (set.weight < 0 || set.weight > 1000)) {
            errors.push(`Exercise ${index + 1}, Set ${setIndex + 1}: Weight must be between 0 and 1000`);
          }
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    const fieldErrors = [];
    
    // Required validation
    if (fieldRules.required && (!value || value.toString().trim().length === 0)) {
      fieldErrors.push(`${field} is required`);
    }
    
    // Min length validation
    if (fieldRules.minLength && value && value.toString().length < fieldRules.minLength) {
      fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`);
    }
    
    // Max length validation
    if (fieldRules.maxLength && value && value.toString().length > fieldRules.maxLength) {
      fieldErrors.push(`${field} must be less than ${fieldRules.maxLength} characters`);
    }
    
    // Min value validation
    if (fieldRules.min && value && Number(value) < fieldRules.min) {
      fieldErrors.push(`${field} must be at least ${fieldRules.min}`);
    }
    
    // Max value validation
    if (fieldRules.max && value && Number(value) > fieldRules.max) {
      fieldErrors.push(`${field} must be at most ${fieldRules.max}`);
    }
    
    // Pattern validation
    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.message || `${field} format is invalid`);
    }
    
    // Custom validation
    if (fieldRules.validate && value) {
      const customResult = fieldRules.validate(value);
      if (customResult !== true) {
        fieldErrors.push(customResult);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
