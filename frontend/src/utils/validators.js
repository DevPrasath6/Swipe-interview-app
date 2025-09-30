// Input validation utilities

/**
 * Validate email address format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate phone number format
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Check for reasonable phone number length (7-15 digits)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  // More flexible phone validation - accepts various formats
  const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{7,}$/;

  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate name format
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-\'\.]+$/;

  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate file type for resume upload
 */
export function validateFileType(file, allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']) {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      if (type === 'application/pdf') return 'PDF';
      if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
      return type;
    }).join(', ');

    return {
      isValid: false,
      error: `Please upload a valid file. Allowed types: ${allowedExtensions}`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSizeMB = 10) {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate interview answer
 */
export function validateAnswer(answer, minLength = 10, maxLength = 5000) {
  if (!answer || typeof answer !== 'string') {
    return { isValid: false, error: 'Answer is required' };
  }

  const trimmedAnswer = answer.trim();

  if (trimmedAnswer.length < minLength) {
    return {
      isValid: false,
      error: `Answer must be at least ${minLength} characters long`
    };
  }

  if (trimmedAnswer.length > maxLength) {
    return {
      isValid: false,
      error: `Answer must be less than ${maxLength} characters`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: null };
}

/**
 * Validate multiple fields at once
 */
export function validateFields(fields) {
  const errors = {};
  let isValid = true;

  for (const [fieldName, validation] of Object.entries(fields)) {
    const result = validation();
    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validate candidate data completeness
 */
export function validateCandidateData(candidateData) {
  const { name, email, phone } = candidateData;

  const validations = {
    name: () => validateName(name),
    email: () => validateEmail(email),
    phone: () => validatePhone(phone)
  };

  return validateFields(validations);
}

/**
 * Validate interview session data
 */
export function validateSessionData(sessionData) {
  const { questions, answers, candidate } = sessionData;

  if (!Array.isArray(questions) || questions.length === 0) {
    return { isValid: false, error: 'Questions are required for the session' };
  }

  if (!candidate) {
    return { isValid: false, error: 'Candidate information is required' };
  }

  const candidateValidation = validateCandidateData(candidate);
  if (!candidateValidation.isValid) {
    return {
      isValid: false,
      error: 'Invalid candidate data: ' + Object.values(candidateValidation.errors).join(', ')
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string is a valid URL
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Password strength validator
 */
export function validatePasswordStrength(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password)
  };

  strength = Object.values(checks).filter(Boolean).length;

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthLabel = strengthLabels[Math.min(strength - 1, 4)] || 'Very Weak';

  if (strength < 3) {
    return {
      isValid: false,
      error: 'Password is too weak. Include uppercase, lowercase, numbers, and symbols.',
      strength,
      strengthLabel
    };
  }

  return { isValid: true, error: null, strength, strengthLabel };
}
